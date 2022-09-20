import SpotifyWebApi from "spotify-web-api-node";

export default class SongManager {
  constructor(client) {
    this.client = client;
    this.spotifyApi = new SpotifyWebApi();
    this.spotifyApi.setAccessToken(client.spotifyManager.access_token);
  }

  async getPlaylistInfo(playlistId) {
    let data = await this.spotifyApi.getPlaylist(playlistId, {
      fields: "description, owner, images, followers, external_urls, name",
    });

    return data.body;
  }

  async getSongsFromPlaylist(playlistId) {
    let data = await this.spotifyApi.getPlaylist(playlistId, {
      fields: "tracks(items(track(name, artists, preview_url, album(images))))",
    });

    const songs = [];
    for (const item of data.body.tracks.items) {
      if (!item) continue;
      if (!item.track) continue;
      if (item.track.preview_url)
        songs.push({
          name: item.track.name,
          artists: item.track.artists,
          image: item.track.album.images[0].url,
          previewUrl: item.track.preview_url,
        });
    }
    return songs;
  }
}
