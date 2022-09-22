import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("start-quiz")
    .setDescription("Start a new music quiz")
    .addStringOption((option) =>
      option
        .setName("spotify-playlist-url")
        .setDescription("Valid spotify playlist url")
        .setRequired(true)
    ),
  async execute(interaction) {
    // interaction.reply({ content: "Work in progress", ephemeral: true });
    interaction.client.quizManager.startQuiz(interaction);
  },
};
