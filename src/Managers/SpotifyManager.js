import fetch from "node-fetch";

export default class SpotifyManager {
  constructor() {}

  async refreshToken() {
    this.getToken();
    setInterval(() => {
      this.getToken();
    }, 1000 * 60 * 60); // every hour;

    return this;
  }

  async getToken() {
    let headers = {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64"),
    };

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      body: params,
      headers: headers,
    })
      .then((res) => res.json())
      .then((data) => {
        this.access_token = data.access_token;
      });

    return this;
  }
}
