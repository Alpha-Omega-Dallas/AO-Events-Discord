import dotenv from "dotenv";
import { Client, EmbedBuilder } from "discord.js";
let client = new Client({ intents: "Guilds" });
import EventsManager from "./EventsManager.js";
dotenv.config();

client.on("ready", async (client) => {
  console.log("Logged in as " + client.user.tag);
  setInterval(postEvent, 1000 * 60 * 60 * 24);
});

async function postEvent() {
  let channel = client.guilds.cache
    .get(process.env.GUILD_ID)
    .channels.cache.get(process.env.CHANNEL_ID);
  if (!channel) return console.log("Channel Not Found");

  let start = new Date();
  start.setDate(start.getDate());
  let end = new Date();
  end.setDate(end.getDate() + 1);

  let events = await new EventsManager().getEvents(start, end);
  if (events.length == 0) return console.log("No Events Today");

  for (const event of events) {
    let author = event.description.trim().split(/\((.*?)\)/);

    let description = event.description;
    description = description.substring(
      0,
      description.length - author[author.length - 2].length - 2
    );

    author = author[author.length - 2].substring(
      0,
      author[author.length - 2].length - 5
    );

    const embed = new EmbedBuilder()
      .setColor(0xa6bde3)
      .setAuthor({ name: event.summary })
      .setDescription(description)
      .setFooter({ text: "Author: " + author });
    channel.send({ embeds: [embed] });
  }
}

client.login(process.env.TOKEN);
