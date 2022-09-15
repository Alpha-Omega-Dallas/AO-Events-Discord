import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("start-quiz")
    .setDescription("Start a new music quiz"),
  async execute(interaction) {
    interaction.client.quizManager.startQuiz(interaction);
  },
};
