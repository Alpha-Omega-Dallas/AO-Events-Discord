import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("test command with no inputs"),
  async execute(interaction) {
    await interaction.reply("yo");
  },
};
