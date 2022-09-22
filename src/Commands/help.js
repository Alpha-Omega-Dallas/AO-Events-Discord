import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Command details"),
  async execute(interaction) {
    const helpEmbed = new EmbedBuilder().setTitle("Commands");

    const commands = new Map();
    commands.set(
      "/start-quiz *<spotify playlist url>*",
      "Start a music quiz in a voice channel from supplied spotify playlist *(not all songs are playable)*"
    );
    commands.set("/stop-quiz", "Stop the current quiz in your voice channel");
    commands.set(
      "/transfer-room-host *<new host>*",
      "Transfer breakout room host permissions"
    );

    const fields = [];
    for (let [key, value] of commands) {
      fields.push({ name: key, value: value, inline: true });
    }
    helpEmbed.addFields(fields);

    interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  },
};
