import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} from "@discordjs/voice";
import { EmbedBuilder } from "discord.js";
import SongManager from "../Managers/SongManager.js";
import { shuffle, sleep } from "../utils.js";
import he from "he";

export default class QuizManager {
  constructor(client) {
    this.client = client;
    this.quizzes = new Map();
    this.songLimit = 15;
  }

  async startQuiz(interaction) {
    if (!interaction.member.voice.channel)
      return interaction.reply({
        content: "Please join a voice channel first",
        ephemeral: true,
      });

    if (this.quizzes.get(interaction.member.voice.channelId)) {
      if (this.quizzes.get(interaction.member.voice.channelId).isActive) {
        return interaction.reply({
          content: "Quiz has already started",
          ephemeral: true,
        });
      }
    }

    var spotifyIdRegex = new RegExp(
      "^(https://open.spotify.com/playlist/)([a-zA-Z0-9]+)(.*)$",
      "g"
    );
    var match = spotifyIdRegex.exec(
      interaction.options.getString("spotify-playlist-url")
    );
    if (!match)
      return interaction.reply({
        content: "Invalid playlist url",
        ephemeral: true,
      });
    try {
      let test = match[2];
    } catch (error) {
      return interaction.reply({
        content: "Invalid playlist url",
        ephemeral: true,
      });
    }

    let playlistInfo;
    try {
      playlistInfo = await new SongManager(this.client).getPlaylistInfo(
        match[2]
      );
    } catch (error) {
      return interaction.reply({
        content: "Playlist is private",
        ephemeral: true,
      });
    }

    let songs = await await new SongManager(this.client).getSongsFromPlaylist(
      match[2]
    );

    if (songs.length <= 1)
      return interaction.reply({
        content: "Playlist has no playable songs or is too short",
        ephemeral: true,
      });

    const embed = new EmbedBuilder()
      .setTitle("Quiz Starting")
      .setDescription(
        `**Playlist Name**\t${he.decode(playlistInfo.name)}\n` +
          (playlistInfo.description
            ? `**Description**\t${he.decode(playlistInfo.description)}\n`
            : "") +
          `**Followers**\t${playlistInfo.followers.total}`
      )
      .setThumbnail(playlistInfo.images[0].url)
      .setColor(0x1db954);
    await interaction.reply({ embeds: [embed] });

    songs = shuffle(songs);
    if (songs.length < this.songLimit) this.songLimit = songs.length;

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    const player = createAudioPlayer();
    const subscription = connection.subscribe(player);

    let quiz = {
      channelId: interaction.member.voice.channelId,
      intervalId: 1,
      isActive: true,
      currentSong: {
        index: 0,
        name: songs[0].name,
        artists: songs[0].artists,
        previewUrl: songs[0].previewUrl,
        image: songs[0].image,
        nameGuessed: false,
        artistGuessed: false,
      },
      players: new Map(), // (playerId, points)
      songs: songs,
      player: player,
      connection: connection,
    };
    this.quizzes.set(interaction.member.voice.channelId, quiz);

    let intervalId = setInterval(async () => {
      let quiz = this.quizzes.get(interaction.member.voice.channelId);
      if (quiz.currentSong.index == 0) {
        await sleep(1000 * 5);
      } else {
        await this.songEmbed(interaction.member.voice.channelId, interaction);
      }

      if (quiz.currentSong.index == this.songLimit) {
        await this.finishQuiz(interaction);
      }
      await this.nextSong(interaction.member.voice.channelId, interaction);
    }, 1000 * 31.5); // 30 seconds + 1.5 second break time

    let newQuiz = this.quizzes.get(interaction.member.voice.channelId);
    newQuiz.intervalId = intervalId;
    this.quizzes.set(interaction.member.voice.channelId, newQuiz);

    player.play(createAudioResource("./assets/countdown.mp3"));
    await sleep(1000 * 5);
    await this.nextSong(interaction.member.voice.channelId, interaction);
  }

  async nextSong(channelId, interaction) {
    let quiz = this.quizzes.get(channelId);
    if (!quiz.isActive) return;

    let nextSong = quiz.songs[quiz.currentSong.index];
    quiz.player.stop();
    await sleep(1000 * 1.5); // Give us a break between songs
    quiz.player.play(createAudioResource(nextSong.previewUrl));

    let newCurrentSong = {
      index: quiz.currentSong.index + 1,
      name: nextSong.name,
      artists: nextSong.artists,
      previewUrl: nextSong.previewUrl,
      image: nextSong.image,
    };
    quiz.currentSong = newCurrentSong;
    this.quizzes.set(channelId, quiz);
    this.guessSong(interaction);
  }

  async guessSong(interaction) {
    let quiz = this.quizzes.get(interaction.member.voice.channelId);
    if (!quiz.isActive) return;

    let { name, artists } = quiz.currentSong;

    const filter = (m) =>
      m.author.id != this.client.user.id && m.author.bot != true;
    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 1000 * 30,
    });

    collector.on("collect", (m) => {
      let quizzz = this.quizzes.get(interaction.member.voice.channelId);
      if (!quizzz.isActive) return;

      for (const artist of artists) {
        const name = artist.name;
        if (m.content.toLowerCase().includes(name.toLowerCase())) {
          let quiz = this.quizzes.get(interaction.member.voice.channelId);
          if (quiz.currentSong.artistGuessed) return;
          m.react("✅");
          quiz.players.set(
            m.author.id,
            quiz.players.get(m.author.id)
              ? quiz.players.get(m.author.id) + 1
              : 1
          );
          quiz.currentSong.artistGuessed = true;
          this.quizzes.set(interaction.member.voice.channelId, quiz);

          if (quiz.nameGuessed) {
            // this.skipSong()
          }

          return;
        }
      }

      if (
        m.content
          .toLowerCase()
          .trim()
          .includes(
            name
              .split(/\(.*\)/)[0]
              .toLowerCase()
              .trim()
          )
      ) {
        let quiz = this.quizzes.get(interaction.member.voice.channelId);
        if (quiz.currentSong.nameGuessed) return;
        m.react("✅");
        quiz.players.set(
          m.author.id,
          quiz.players.get(m.author.id) ? quiz.players.get(m.author.id) + 1 : 1
        );
        quiz.currentSong.nameGuessed = true;
        this.quizzes.set(interaction.member.voice.channelId, quiz);

        if (quiz.artistGuessed) {
          // this.skipSong()
        }

        return;
      }

      m.react("❌");
      let quiz = this.quizzes.get(interaction.member.voice.channelId);
      quiz.players.set(
        m.author.id,
        quiz.players.get(m.author.id) ? quiz.players.get(m.author.id) : 0
      );
      this.quizzes.set(interaction.member.voice.channelId, quiz);
    });

    collector.on("end", (collected) => {});
  }

  async songEmbed(channelId, interaction) {
    let quiz = this.quizzes.get(channelId);
    if (!quiz.isActive) return;

    let song = quiz.currentSong;

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
      .setFooter({ text: `Song ${song.index}/${this.songLimit}` })
      .setThumbnail(song.image);

    var players = "";
    for (let [key, value] of quiz.players) {
      players +=
        (await interaction.guild.members.cache
          .get(key)
          .displayName.split(" ")[0]) +
        /* (await this.client.users.cache.get(key).username) */ ": " +
        value +
        "\n";
    }

    if (players) {
      songEmbed.setDescription("**Leaderboard**\n" + "```" + players + "```");
    }

    await interaction.channel.send({ embeds: [songEmbed] });
  }

  async finishQuiz(interaction, source) {
    if (!this.quizzes.get(interaction.member.voice.channelId)) return;

    let quiz = this.quizzes.get(interaction.member.voice.channelId);
    quiz.player.stop();
    quiz.connection.destroy();
    quiz.isActive = false;
    clearInterval(quiz.intervalId);
    this.quizzes.set(interaction.member.voice.channelId, quiz);

    let finishEmbed = new EmbedBuilder().setTitle("Quiz Finished");

    var players = "";
    for (let [key, value] of quiz.players) {
      players +=
        (await interaction.guild.members.cache
          .get(key)
          .displayName.split(" ")[0]) +
        /* (await this.client.users.cache.get(key).username) */ ": " +
        value +
        "\n";
    }

    if (players) {
      finishEmbed.setDescription("**Leaderboard**\n" + "```" + players + "```");
    }

    if (source == "stopQuiz") {
      interaction.reply({ embeds: [finishEmbed] });
    } else {
      interaction.channel.send({ embeds: [finishEmbed] });
    }
  }

  async stopQuiz(interaction) {
    if (!interaction.member.voice.channel)
      return interaction.reply({
        content: "Please join a voice channel first",
        ephemeral: true,
      });

    if (!this.quizzes.get(interaction.member.voice.channelId))
      return interaction.reply({
        content: "There is no quiz in this channel",
        ephemeral: true,
      });

    if (!this.quizzes.get(interaction.member.voice.channelId).isActive)
      return interaction.reply({
        content: "There is no quiz in this channel",
        ephemeral: true,
      });

    this.finishQuiz(interaction, "stopQuiz");
  }
}
