// DiscordJS
import {
  ActivityType,
  Client,
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
} from "discord.js";
let client = new Client({ intents: "GuildScheduledEvents" });

// NPM Modules
import dotenv from "dotenv";
dotenv.config();

// Managers
import EventsManager from "./Managers/EventsManager.js";
import PostsManager from "./Managers/PostsManager.js";

client.on("ready", async (client) => {
  console.log("Logged in as " + client.user.tag);
  client.user.setActivity({
    name: "the band",
    type: ActivityType.Watching,
  });

  // Managers
  let eventsManager = await new EventsManager(client).startEventsWatcher();
  let postsManager = await new PostsManager(client).startPostsWatcher();
});

client.login(process.env.TOKEN);
