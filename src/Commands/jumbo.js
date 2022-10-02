import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("jumbo")
    .setDescription("Get the picture for an emoji")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("Emoji to make big")
        .setRequired(true)
    ),
  async execute(interaction) {
    const emoteRegex = /<:.+:(\d+)>/gm;
    const animatedEmoteRegex = /<a:.+:(\d+)>/gm;

    let input = interaction.options.getString("emoji");
    let emoji;

    if ((emoji = emoteRegex.exec(input))) {
      const url = "https://cdn.discordapp.com/emojis/" + emoji[1] + ".png?v=1";
      interaction.reply({ content: url });
    } else if ((emoji = animatedEmoteRegex.exec(input))) {
      const url = "https://cdn.discordapp.com/emojis/" + emoji[1] + ".gif?v=1";
      interaction.reply({ content: url });
    } else {
      interaction.reply({
        content: "Couldn't find an emoji to paste!",
        ephemeral: true,
      });
    }
  },
};
