import { SlashCommandBuilder } from "discord.js";
import { sleep } from "../utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playing"),
  async execute(interaction) {
    if (
      !interaction.member.isCommunicationDisabled() &&
      !interaction.member.voice.channel
    )
      return await interaction.reply({
        content: "Must be in a voice channel and not timed out",
        ephemeral: true,
      });

    const queue = interaction.client.distube.getQueue(interaction.guildId);

    try {
      await queue.stop();
    } catch (e) {
      await interaction.reply({ content: "Cannot stop song" });
      await sleep(500);
      await interaction.deleteReply();
      return;
    }

    await interaction.reply({ content: "Stopped playing" });
    await sleep(500);
    await interaction.deleteReply();
  },
};
