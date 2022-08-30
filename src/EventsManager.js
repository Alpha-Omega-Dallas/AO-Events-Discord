import { getEvents } from "gcal-get-events";

export default class EventsManager {
  constructor() {}

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
}
