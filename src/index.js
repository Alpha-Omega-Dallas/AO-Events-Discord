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
import dotenv from "dotenv";
import CommandsManager from "./Managers/CommandsManager.js";
dotenv.config();
import SpotifyWebApi from "spotify-web-api-node";

// Managers
import EventsManager from "./Managers/EventsManager.js";
import PostsManager from "./Managers/PostsManager.js";
import SpotifyManager from "./Managers/SpotifyManager.js";
import QuizManager from "./Managers/QuizManager.js";

client.on("ready", async (client) => {
  console.log("Logged in as " + client.user.tag);
  client.user.setActivity({
    name: "the band",
    type: ActivityType.Watching,
  });

  // Setup
  client.commands = new Collection();

  // Managers
  client.eventsManager = await new EventsManager(client).startEventsWatcher();
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
});

// client.on("messageCreate", async (message) => {
//   if (message.author.id == client.user.id) return;
//   if (message.guild.id == process.env.GUILD_ID) {
//     message.reply({ content: "hello" });
//     const spotifyApi = new SpotifyWebApi({
//       clientId: process.env.SPOTIFY_CLIENT_ID,
//       clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
//       redirectUri: "https://example.com",
//     });

//     // Set the access token
//     spotifyApi.setAccessToken(client.spotifyManager.access_token);

//     // Use the access token to retrieve information about the user connected to it
//     let data = await spotifyApi.searchTracks("Love");
//     // Print some information about the results
//     console.log("I got " + data.body.tracks.total + " results!");

//     // Go through the first page of results
//     var firstPage = data.body.tracks.items;
//     console.log(
//       "The tracks in the first page are (popularity in parentheses):"
//     );

//     /*
//      * 0: All of Me (97)
//      * 1: My Love (91)
//      * 2: I Love This Life (78)
//      * ...
//      */
//     firstPage.forEach(function (track, index) {
//       console.log(index + ": " + track.name + " (" + track.popularity + ")");
//     });
//   }
// });

client.on("interactionCreate", async (interaction) => {
  await client.commandsManager.handleCommandInteraction(interaction);
});

client.login(process.env.TOKEN);
