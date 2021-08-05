const { google } = require("googleapis");
const secrets = require("./secrets.js");

let auth = new google.auth.JWT(
  secrets.SERVICE_ACCOUNT.client_email,
  null,
  secrets.SERVICE_ACCOUNT.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);

function resetAuth() {
  auth = new google.auth.JWT(
    secrets.SERVICE_ACCOUNT.client_email,
    null,
    secrets.SERVICE_ACCOUNT.private_key,
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
}

const sheets = google.sheets({
  version: "v4",
  auth: auth,
});

module.exports = {
  sheets,
  auth,
  resetAuth
};
