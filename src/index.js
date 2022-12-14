// DiscordJS
import {
  ActivityType,
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} from "discord.js";
let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

// NPM Modules
import chalk from "chalk";
import dotenv from "dotenv";
dotenv.config();

// Managers
import EventsManager from "./Managers/EventsManager.js";
import PostsManager from "./Managers/PostsManager.js";
import SpotifyManager from "./Managers/SpotifyManager.js";
import QuizManager from "./Managers/QuizManager.js";
import HubManager from "./Managers/HubManager.js";
import CommandsManager from "./Managers/CommandsManager.js";

client.on("ready", async (client) => {
  console.log(
    chalk.blue.bold("[BOT]") + " Logged in as " + chalk.green(client.user.tag)
  );
  client.user.setActivity({
    name: "the band",
    type: ActivityType.Watching,
  });

  // Setup
  client.commands = new Collection();

  // Managers
  // client.eventsManager = await new EventsManager(client).startEventsWatcher();
  client.postsManager = await new PostsManager(client).startPostsWatcher();
  client.commandsManager = await new CommandsManager(client);
  try {
    client.commandsManager.loadCommandFiles();
    client.commandsManager.registerCommands();
  } catch (error) {
    console.error(error);
  }
  client.spotifyManager = await new SpotifyManager().refreshToken();
  client.quizManager = await new QuizManager(client);
  client.hubManager = await new HubManager(client).setup();
});

client.on("interactionCreate", async (interaction) => {
  await client.commandsManager.handleCommandInteraction(interaction);
});

client.login(process.env.TOKEN);
