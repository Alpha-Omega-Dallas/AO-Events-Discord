import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("pfp")
    .setDescription("Get a member's profile picture")
    .addUserOption((option) =>
      option.setName("member").setDescription("Other member").setRequired(false)
    ),
  async execute(interaction) {
    let person = interaction.options.getMember("member");

    if (!person) {
      await interaction.reply({
        content: interaction.user.displayAvatarURL({ dynamic: true }),
      });
    } else {
      await interaction.reply({
        content: person.user.displayAvatarURL({ dynamic: true }),
      });
    }
  },
};
