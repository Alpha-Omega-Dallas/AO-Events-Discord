import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import puppeteer from "puppeteer";

export default {
  data: new SlashCommandBuilder()
    .setName("get-events")
    .setDescription("Fetch band events for the week manually")
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://example.com");
    await browser.close();

    // interaction.client.eventsManager.postEvents();

    interaction.reply({
      content: "Fetched the events for the next seven days",
      ephemeral: true,
    });
  },
};
