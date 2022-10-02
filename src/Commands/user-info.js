import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("user-info")
    .setDescription("Get a member's info")
    .addUserOption((option) =>
      option.setName("member").setDescription("Other member").setRequired(false)
    ),
  async execute(interaction) {
    let member = interaction.member;
    if (interaction.options.getMember("member"))
      member = interaction.options.getMember("member");

    let roles = "";
    member.roles.cache.map((r) =>
      r.name != "@everyone" ? (roles += `${r} `) : ""
    );

    let userInfoEmbed = new EmbedBuilder()
      .setAuthor({ name: member.user.tag })
      .setDescription(String(member))
      .addFields(
        {
          name: "Created",
          value: `<t:${Math.trunc(member.user.createdAt.getTime() / 1000)}:f>`,
          inline: true,
        },
        {
          name: "Joined",
          value: `<t:${Math.trunc(member.joinedAt.getTime() / 1000)}:f>`,
          inline: true,
        },
        { name: "Nickname", value: `${member.displayName}`, inline: true },
        {
          name: "Roles",
          value: `${roles ? roles : "No Roles"}`,
          inline: false,
        }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128 }));

    interaction.reply({ embeds: [userInfoEmbed], ephemeral: true });
  },
};
