const fs = require("fs");

function sentenceCase(str) {
  return str
    .split(" ")
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function logger(data) {
  fs.appendFile("./files/log.txt", data, err => {
    if (err) throw new Error(`Error: ${err.message}`);
  });
}

module.exports = { sentenceCase, logger };
