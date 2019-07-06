const luxon = require('luxon');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotEnv = require('dotenv');

const dt = luxon.DateTime

const args = process.argv;

function