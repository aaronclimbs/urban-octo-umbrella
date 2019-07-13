require("dotenv").config();

const dt = require("luxon").DateTime;
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const keys = require("./keys");
const Spotify = require("node-spotify-api");

const spotify = new Spotify(keys.spotify);

const [operation, param] = [process.argv[2], process.argv[3]];

choose(operation, param);

function choose(operation, param) {
  switch (operation) {
    case "concert-this":
      concertSearch(param);
      break;
    case "spotify-this-song":
      songSearch(param);
      break;
    case "spotify-this-artist":
      artistSearch(param);
      break;
    case "do-what-it-says":
      customCommand();
      break;
    case "movie-search":
      movieSearch(param);

    default:
      break;
  }
}

function movieSearch(title) {
  axios
    .get(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API}&`)
    .then(response => console.log(response));
}

function concertSearch(artist) {
  axios
    .get(
      `https://rest.bandsintown.com/artists/${artist}/events?app_id=${process.env.BANDSINTOWN_API}`
    )
    .then(response => console.log(response.length, "concerts"));
}

function artistSearch(artist) {
  spotify.search({ type: "artist", query: artist }, (err, content) => {
    if (err) {
      return console.log(`Error occurred: ${err}`);
    }
    console.log(content.artists.items[0]);
  });
}

function songSearch(track) {
  spotify.search({ type: "track", query: track }, (err, content) => {
    if (err) {
      return console.log(`Error occurred: ${err}`);
    }
    console.log(content.tracks.items[0]);
  });
}

function customCommand() {
  fs.readFile(path(__dirname, "files", "random.txt"), "utf8", (err, data) => {
    if (err) throw err;
    const [op, param] = [data.split(",")];
    choose(op, param);
  });
}
