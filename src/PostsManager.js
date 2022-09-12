import { EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

export default class PostsManager {
  constructor(client) {
    this.client = client;
  }

  async getPosts() {
    let guild = await this.client.guilds.cache.get(process.env.GUILD_ID);
    let channel = await guild.channels.fetch(process.env.CHANNEL_ID);

    fetch(
      `https://openapi.band.us/v2/band/posts/?access_token=${process.env.ACCESS_TOKEN}&band_key=${process.env.AO_BAND_KEY}&locale=en_US`
    )
      .then((res) => res.json())
      .then(async (data) => {
        for (const item of data.result_data.items) {
          if (item.content.toLowerCase().includes("fall retreat")) {
            let postEmbed = new EmbedBuilder()
              .setColor(0x6d9fdb)
              .setAuthor({
                iconURL: item.author.profile_image_url,
                name: item.author.name,
              })
              .setDescription(item.content)
              .setTimestamp(new Date(item.created_at));

            channel.send({ embeds: [postEmbed] });
          }
        }
      });
  }
}
