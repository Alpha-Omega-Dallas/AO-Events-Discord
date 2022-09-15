import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import { EmbedBuilder } from "discord.js";
import SongManager from "../Managers/SongManager.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default class QuizManager {
  constructor(client) {
    this.client = client;
    this.quizes = new Map();
  }

  async startQuiz(interaction) {
    if (!interaction.member.voice.channel)
      return interaction.reply({
        content: "Please join a voice channel first",
        ephemeral: true,
      });

    const embed = new EmbedBuilder().setTitle("Quiz Starting");
    await interaction.reply({ embeds: [embed] });

    let songs = await new SongManager(interaction.client).getSongsFromPlaylist(
      "37i9dQZF1DZ06evO2Kixmg"
    );

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer();
    const subscription = connection.subscribe(player);

    let quiz = {
      connection: connection,
      player: player,
    };
    this.quizes.set(interaction.member.voice.channelId, quiz);

    player.play(createAudioResource("./assets/countdown.mp3"));
    await sleep(1000 * 5.5); // wait 5.5 seconds for the countdown
    player.stop();
    for (const song of songs) {
      player.play(createAudioResource(song.previewUrl));
      await sleep(1000 * 30); // 30 seconds

      let artistStr = "";
      for (const artist of song.artists) {
        if (song.artists[song.artists.length - 1].name == artist.name) {
          artistStr += artist.name;
          break;
        }
        artistStr += artist.name + ", ";
      }

      const songEmbed = new EmbedBuilder()
        .setTitle(song.name + " - " + artistStr)
        .setThumbnail(song.image);
      interaction.channel.send({ embeds: [songEmbed] });

      player.stop();
      await sleep(1000 * 3);
    }
    connection.destroy();
  }

  async stopQuiz(interaction) {
    if (!interaction.member.voice.channel)
      return interaction.reply({
        content: "Please join a voice channel first",
        ephemeral: true,
      });

    if (!this.quizes.get(interaction.member.voice.channelId))
      return interaction.reply({
        content: "There is no quiz in this channel",
        ephemeral: true,
      });

    let quiz = this.quizes.get(interaction.member.voice.channelId);
    quiz.connection.destroy();

    interaction.reply({ content: "Quiz Stopped", ephemeral: true });
  }
}
