import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop-quiz")
    .setDescription("Stop a music quiz"),
  async execute(interaction) {
    interaction.client.quizManager.stopQuiz(interaction);
  },
};
