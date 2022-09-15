import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";

export default {
  data: new SlashCommandBuilder()
    .setName("start-quiz")
    .setDescription("Start a new music quiz"),
  async execute(interaction) {
    if (!interaction.member.voice.channel)
      return interaction.reply({
        content: "Please join a voice channel first",
        ephemeral: true,
      });
    const embed = new EmbedBuilder().setTitle("Quiz Starting");
    await interaction.reply({ embeds: [embed] });

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channelId,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
  },
};
