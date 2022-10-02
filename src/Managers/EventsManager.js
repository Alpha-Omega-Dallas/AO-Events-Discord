import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";
import { getEvents } from "gcal-get-events";
import { DateTime } from "luxon";
import schedule from "node-schedule-tz";

export default class EventsManager {
  constructor(client) {
    this.client = client;
  }

  async getEvents(start = new Date(), end = new Date()) {
    if (end) end.setDate(end.getDate() + 1);

    let options = {
      whitelist: [
        "start",
        "end",
        "location",
        "summary",
        "description",
        "created",
        "updated",
        "id",
      ],
      count: 5,
      start: start,
      end: end,
      apiKey: process.env.API_KEY,
      calendarId: process.env.CALENDAR_ID,
    };

    let res = await getEvents(options);
    return res;
  }

  async postEvents() {
    let guild = await this.client.guilds.cache.get(process.env.GUILD_ID);

    let start = new Date();
    let end = new Date();
    end.setDate(end.getDate() + 7);

    let events = await this.getEvents(start, end);
    if (events.length == 0) return console.log("No Events This Time");

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

    return this;
  }

  async startEventsWatcher() {
    // At 00:00 on Sunday
    // https://crontab.guru/#0_0_*_*_0
    schedule.scheduleJob(
      "postEvents",
      "59 23 * * 0",
      "America/Chicago",
      this.postEvents
    );
    return this;
  }
}
