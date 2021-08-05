const fs = require("fs");
const secretFileLocation = __dirname + "/../secrets.json";
const secrets = fs.existsSync(secretFileLocation)
  ? JSON.parse(fs.readFileSync(secretFileLocation))
  : undefined;

if (!secrets) {
  console.log("No secrets.json file found.");
  process.exit();
}

module.exports = secrets;
