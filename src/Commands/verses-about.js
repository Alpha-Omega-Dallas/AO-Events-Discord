import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";
import { parse } from "node-html-parser";
import he from "he";

export default {
  data: new SlashCommandBuilder()
    .setName("verses-about")
    .setDescription("Get verses on a topic")
    .addStringOption((option) =>
      option
        .setName("topic")
        .setDescription("Pretty much any topic works")
        .setRequired(true)
    ),
  async execute(interaction) {
    let topic = interaction.options.getString("topic");

    let url = "https://www.openbible.info/topics/" + encodeURI(topic);
    let data = await fetch(url);
    if (data.status !== 200)
      return interaction.reply({ content: "Invalid topic", ephemeral: true });
    let res = await data.text();
    let root = parse(res);

    let versesEmbed = new EmbedBuilder()
      .setTitle("Verses about *" + topic + "*")
      .setURL(url);

    let fields = [];
    let verses = root.querySelectorAll("div .verse > p");
    let refs = root.querySelectorAll("div .verse > h3 > a");
    for (var i = 0; i < verses.length; i++) {
      let verse = verses[i].innerText.trim();
      let ref = refs[i].innerText.trim();

      fields.push({
        name: he.decode(ref),
        value: he.decode(verse),
        inline: false,
      });

      if (i == 5) break;
    }

    versesEmbed.addFields(fields);

    if (fields.length == 0)
      return interaction.reply({
        content: "That topic does not exist yet",
        ephemeral: true,
      });

    interaction.reply({
      embeds: [versesEmbed],
      ephemeral: true,
    });
  },
};
