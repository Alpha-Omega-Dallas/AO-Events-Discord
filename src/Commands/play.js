import { SlashCommandBuilder } from "discord.js";
import { sleep } from "../utils.js";

export default {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of a song or youtube video url")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (
      !interaction.member.isCommunicationDisabled() &&
      !interaction.member.voice.channel
    )
      return await interaction.reply({
        content: "Must be in a voice channel and not timed out",
        ephemeral: true,
      });
    await interaction.client.distube.play(
      interaction.member.voice.channel,
      interaction.options.getString("name"),
      {
        member: interaction.member,
        textChannel: interaction.channel,
        message: false,
      }
    );
    await interaction.reply("Added song to queue");
    await sleep(500);
    await interaction.deleteReply();
  },
};
