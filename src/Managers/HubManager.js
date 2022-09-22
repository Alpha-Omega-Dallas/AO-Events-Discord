import { ChannelType, PermissionFlagsBits } from "discord.js";

export default class HubManager {
  constructor(client) {
    this.client = client;
  }

  async setup() {
    this.guild = await this.client.guilds.cache.get(process.env.GUILD_ID);
    this.hubCategory = await this.guild.channels.cache.get(
      process.env.HUB_CATEGORY_ID
    );

    this.client.on("voiceStateUpdate", async (o, n) => {
      if (n.channelId) {
        this.cleanupRooms();

        if (n.channelId == process.env.HUB_VOICE_CHANNEL_ID)
          await this.memberJoinedHub(n.member);
      }

      if (!n.channelId) {
        this.cleanupRooms();

        this.hubCategory.children.cache.forEach(async (child) => {
          if (child.id == process.env.HUB_VOICE_CHANNEL_ID) return;
          if (o.channelId == child.id) {
            await this.memberLeftRoom(n.member, o.channelId);
            return;
          }
        });
      }
    });

    return this;
  }

  async memberJoinedHub(member) {
    let room = await this.createNewRoom();
    await member.voice.setChannel(room);
    await this.makeMemberRoomHost(member, room);
  }

  async makeMemberRoomHost(member, room) {
    await room.lockPermissions();
    await room.permissionOverwrites.edit(member.user, {
      ManageChannels: true,
    });
  }

  async createNewRoom() {
    let newChannel = await this.hubCategory.children.create({
      name: "Room #" + this.hubCategory.children.cache.size,
      type: ChannelType.GuildVoice,
    });
    return newChannel;
  }

  async cleanupRooms() {
    this.hubCategory.children.cache.forEach(async (child) => {
      if (child.id != process.env.HUB_VOICE_CHANNEL_ID) {
        if (child.members.size == 0) {
          if (child) child.delete();
        }
      }
    });
  }

  async memberLeftRoom(member, roomId) {}

  async transferRoomHostPerms(oldHost, newHost) {
    let room = this.guild.channels.cache.get(oldHost.voice.channelId);
    if (!room.permissionsFor(oldHost).has(PermissionFlagsBits.ManageChannels))
      return false; // oldHost was not a host lol

    await this.makeMemberRoomHost(newHost, room);
    return true;
  }
}
