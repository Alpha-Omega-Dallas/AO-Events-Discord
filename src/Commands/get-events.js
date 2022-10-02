import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("get-events")
    .setDescription("Fetch band events for the week manually")
    .setDefaultMemberPermissions(0),
  async execute(interaction) {
    // interaction.client.eventsManager.postEvents();

    // interaction.reply({
    //   content: "Fetched the events for the next seven days",
    //   ephemeral: true,
    // });

    interaction.reply({
      content: "Work in progress",
      ephemeral: true,
    });
  },
};
