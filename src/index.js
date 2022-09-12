import dotenv from "dotenv";
import {
  ActivityType,
  Client,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";
let client = new Client({ intents: "GuildScheduledEvents" });
import EventsManager from "./EventsManager.js";
import { DateTime } from "luxon";
import schedule from "node-schedule-tz";
import PostsManager from "./PostsManager.js";
dotenv.config();

client.on("ready", async (client) => {
  console.log("Logged in as " + client.user.tag);
  client.user.setActivity({
    name: "the band",
    type: ActivityType.Watching,
  });

  let postManager = new PostsManager(client);
  await postManager.getPosts();

  setInterval(async () => {
    await postManager.getPosts();
  }, 1000 * 60 * 10); // 10 minutes

  // At 00:00 on Sunday
  // https://crontab.guru/#0_0_*_*_0
  schedule.scheduleJob(
    "postEvents",
    "59 23 * * 0",
    "America/Chicago",
    postEvents
  );
});

async function postEvents() {
  let guild = client.guilds.cache.get(process.env.GUILD_ID);

  let start = new Date();
  // start.setDate(start.getDate());
  let end = new Date();
  end.setDate(end.getDate() + 7);

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

    let startTime = DateTime.fromISO(event.start.dateTime).setZone(
      event.start.timeZone
    );
    startTime = startTime.setZone(event.start.timeZone);
    let endTime = DateTime.fromISO(event.end.dateTime).setZone(
      event.end.timeZone
    );
    endTime = endTime.setZone(event.end.timeZone);

    if (startTime.toISOTime() == endTime.toISOTime()) {
      endTime = endTime.plus({ hours: 1 });
    }

    let eventOptions = {
      name: event.summary,
      scheduledStartTime: startTime,
      scheduledEndTime: endTime,
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      entityType: GuildScheduledEventEntityType.External,
      description: description,
      entityMetadata: { location: "Alpha Omega" },
      channel: guild.channels.cache.get(process.env.CHANNEL_ID),
    };

    guild.scheduledEvents.create(eventOptions);
  }
}

client.login(process.env.TOKEN);
