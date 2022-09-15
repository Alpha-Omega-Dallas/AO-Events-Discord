import SpotifyWebApi from "spotify-web-api-node";

export default class SongManager {
  constructor(client) {
    this.client = client;
    this.spotifyApi = new SpotifyWebApi();
    this.spotifyApi.setAccessToken(client.spotifyManager.access_token);
  }

  async getSongsFromPlaylist(playlistId) {
    // 6dDOsnFsPkuKBioZlXeEEX
    // tracks(items(track.preview_url))
    let data = await this.spotifyApi.getPlaylist(playlistId, {
      fields: "tracks(items(track(name, artists, preview_url, album(images))))",
    });

    const songs = [];
    for (const item of data.body.tracks.items) {
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
