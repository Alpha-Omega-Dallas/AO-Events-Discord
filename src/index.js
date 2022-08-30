import { getEvents } from "gcal-get-events";
import { config } from "dotenv";
import fs from "fs";

(async () => {
  config();
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 1);

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
  console.log(JSON.stringify(res, null, 3));

  fs.writeFileSync("events.json", JSON.stringify(res, null, 3));
})();
