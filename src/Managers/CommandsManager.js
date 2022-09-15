import fs from "fs";
import path from "node:path";
import { REST } from "@discordjs/rest";
import { InteractionType, Routes } from "discord.js";

import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

export default class CommandsManager {
  constructor(client) {
    this.client = client;
    this.commandsPath = path.join(__dirname, "/../Commands"); // ;-; wut the
    this.commandsFiles = fs
      .readdirSync(this.commandsPath)
      .filter((file) => file.endsWith(".js"));
  }

  async loadCommandFiles() {
    for (const file of this.commandsFiles) {
      const filePath = path.join(this.commandsPath, file);
      const command = await import(filePath);
      this.client.commands.set(command.default.data.name, command);
    }
    return this;
  }

  async registerCommands() {
    const commands = [];

    for (const file of this.commandsFiles) {
      const filePath = path.join(this.commandsPath, file);
      const command = await import(filePath);
      commands.push(command.default.data.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
      const data = await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
    } catch (error) {
      console.error(error);
    }
    return this;
  }

  async handleCommandInteraction(interaction) {
    if (interaction.type != InteractionType.ApplicationCommand) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      await command.default.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
}
