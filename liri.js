// Initiate dotenv
require("dotenv").config();

// Require npm and core modules
const dt = require("luxon").DateTime;
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const keys = require("./keys");
const Spotify = require("node-spotify-api");
const sentenceCase = require("./helpers");

// Assign credentials to Spotify instance
const spotify = new Spotify(keys.spotify);

// Destructure process.argv into an operation and parameter
const [, , operation, param] = process.argv;

choose(operation, param);

// Switch operation to determine which function is being called through the command line
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
    case "movie-this":
      movieSearch(param);

    default:
      break;
  }
}

// Call to OMDB API
function movieSearch(title) {
  axios
    .get(`http://www.omdbapi.com/?t=${title}&apikey=${process.env.OMDB_API}`)
    .then(res => {
      const result = res.data;
      console.log(`
      Title: ${result.Title}
      Year: ${result.Year}
      Rating: ${result.Rated}
      Genre: ${result.Genre}
      Cast: ${result.Actors}
      Awards: ${result.Awards}
      `);
    });
}

// Call to bandsintown API
function concertSearch(artist) {
  axios
    .get(
      `https://rest.bandsintown.com/artists/${artist}/events?app_id=${
        process.env.BANDSINTOWN_API
      }`
    )
    .then(res => {
      console.log(`
      =======================================
      ${sentenceCase(artist)}'s 5 Upcoming Concerts
      =======================================
      `);

      // Iterate through first five concerts listed and list venue name, city, and date
      for (let i = 0; i < 5; i++) {
        console.log(`
        Venue: ${res.data[i].venue.name}, ${res.data[i].venue.city}
        Date: ${dt.fromISO(res.data[i].datetime).toLocaleString()}
        `);
      }
    });
}

// Call to spotify artist API
function artistSearch(artist) {
  spotify.search({ type: "artist", query: artist }, (err, content) => {
    if (err) {
      return console.log(`Error occurred: ${err}`);
    }
    const result = content.artists.items[0];

    console.log(`
    Artist: ${result.name}
    Genre(s): ${result.genres.join(", ")}
    Followers: ${result.followers.total}
    Link: ${result.href}
    `);
  });
}

// Call to spotify track API
function songSearch(track) {
  spotify.search({ type: "track", query: track }, (err, content) => {
    if (err) {
      return console.log(`Error occurred: ${err}`);
    }

    const result = content.tracks.items[0];

    console.log(`
    Artist: ${result.artists[0].name}
    Song: ${result.name}
    Preview Link: ${result.preview_url}
    Album: ${result.album.name}
    `);
  });
}
// function to read custom file and run choose function for each set of entries
function customCommand() {
  fs.readFile(
    path.join(__dirname, "files", "random.txt"),
    "utf8",
    (err, data) => {
      if (err) throw err;
      // Split file by newlines
      const lines = data.split("\n");
      // Iterate through each line and run choose()
      lines.forEach(line => {
        const [op, param] = line.split(",");
        choose(op, param);
      });
    }
  );
}
