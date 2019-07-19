// Initiate dotenv
require("dotenv").config();

// Require npm and core modules
const dt = require("luxon").DateTime;
const fs = require("fs");
const path = require("path");
const axios = require("axios").default;
const keys = require("./keys");
const Spotify = require("node-spotify-api");
const { sentenceCase, logger } = require("./helpers");

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
      const data = `
    ==============MOVIE==============

    Title: ${result.Title}
    Year: ${result.Year}
    Rating: ${result.Rated}
    Genre: ${result.Genre}
    Cast: ${result.Actors}
    Awards: ${result.Awards}
      `;
      logger(data);
      console.log(data);
    })
    .catch(err => console.log(`Error: ${err.message}`));
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
      // Only append lastest concert to log
      // Use luxon to format ISO date as Locale String (DD/MM/YYYY)
      const data = `

    ===============${sentenceCase(artist)}'s Next Concert===============

    Venue: ${res.data[0].venue.name}, ${res.data[0].venue.city}
    Date: ${dt.fromISO(res.data[0].datetime).toLocaleString()}
      `;
      logger(data);
      console.log(`
    ===============${sentenceCase(artist)}'s Upcoming Concerts===============

      `);
      // Set length of log to either length of response or 5
      let length = res.data.length < 5 ? res.data.length : 5;
      // Iterate through concerts listed and list venue name, city, and date
      for (let i = 0; i < length; i++) {
        console.log(`
    Venue: ${res.data[i].venue.name}, ${res.data[i].venue.city}
    Date: ${dt.fromISO(res.data[i].datetime).toLocaleString()}
        `);
      }
    })
    .catch(err => console.log(`Error: ${err.message}`));
}

// Call to spotify artist API
function artistSearch(artist) {
  spotify.search({ type: "artist", query: artist }, (err, content) => {
    if (err) {
      return console.log(`Error occurred: ${err.message}`);
    }
    const result = content.artists.items[0];

    const data = `
    ==============SPOTIFY ARTIST==============

    Artist: ${result.name}
    Genre(s): ${result.genres.join(", ")}
    Followers: ${result.followers.total}
    Link: ${result.href}
    `;

    logger(data);
    console.log(data);
  });
}

// Call to spotify track API
function songSearch(track) {
  spotify.search({ type: "track", query: track }, (err, content) => {
    if (err) {
      return console.log(`Error occurred: ${err.message}`);
    }

    const result = content.tracks.items[0];

    const data = `
    ==============SPOTIFY SONG==============

    Artist: ${result.artists[0].name}
    Song: ${result.name}
    Preview Link: ${result.preview_url}
    Album: ${result.album.name}
    `;

    logger(data);
    console.log(data);
  });
}
// function to read custom file and run choose function for each set of entries
function customCommand() {
  fs.readFile(
    path.join(__dirname, "files", "random.txt"),
    "utf8",
    (err, data) => {
      if (err) throw new Error(`Error: ${err.message}`);
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
