import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("transfer-room-host")
    .setDescription("Transfer breakout room host")
    .addUserOption((option) =>
      option
        .setName("new-host")
        .setDescription(
          "Member to transfer room ownership to (must be present in the voice channel)"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    let newHost;
    try {
      newHost = interaction.options.getMember("new-host");
    } catch (error) {
      return interaction.reply({
        content: "An error occured",
        ephemeral: true,
      });
    }

    if (newHost.user.bot)
      return interaction.reply({
        content: "Cannot make a bot the host",
        ephemeral: true,
      });

    if (!newHost.voice.channelId)
      return interaction.reply({
        content: "They must be in your breakout room",
        ephemeral: true,
      });

    if (!interaction.member.voice.channelId)
      return interaction.reply({
        content: "Must be in a breakout room",
        ephemeral: true,
      });

    if (newHost.voice.channelId != interaction.member.voice.channelId)
      return interaction.reply({
        content: "They must be in your breakout room",
        ephemeral: true,
      });

    let hubCategory = interaction.guild.channels.cache.get(
      process.env.HUB_CATEGORY_ID
    );

    if (
      interaction.member.voice.channel.parentId != process.env.HUB_CATEGORY_ID
    )
      return interaction.reply({
        content: "Voice channel is not a breakout room",
        ephemeral: true,
      });

    hubCategory.children.cache.forEach(async (child) => {
      if (interaction.member.voice.channelId == child.id) {
        if (
          await interaction.client.hubManager.transferRoomHostPerms(
            interaction.member,
            newHost
          )
        ) {
          return interaction.reply({
            content: "Transferred room host",
            ephemeral: true,
          });
        } else {
          return interaction.reply({
            content: "You are not the room host",
            ephemeral: true,
          });
        }
      }
    });
  },
};
