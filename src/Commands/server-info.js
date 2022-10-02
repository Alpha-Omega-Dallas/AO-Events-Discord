import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("server-info")
    .setDescription("Get info about the server"),
  async execute(interaction) {
    const serverInfoEmbed = new EmbedBuilder()
      .setAuthor({ name: interaction.guild.name })
      .addFields(
        {
          name: "Member Count",
          value: `${interaction.guild.memberCount}`,
          inline: true,
        },
        {
          name: "Created At",
          value: `<t:${Math.trunc(
            interaction.guild.createdAt.getTime() / 1000
          )}:f>`,
          inline: true,
        },
        {
          name: "Owner",
          value: `${await interaction.guild.fetchOwner()}`,
          inline: false,
        },
        {
          name: "Boost Lvl",
          value: `${interaction.guild.premiumTier}`,
          inline: true,
        },
        {
          name: "Boosts",
          value: `${interaction.guild.premiumSubscriptionCount}`,
          inline: true,
        }
      )
      .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 128 }));
    interaction.reply({ embeds: [serverInfoEmbed], ephemeral: true });
  },
};
