var express = require("express");
var app = express();
const fs = require("fs");
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { google } = require("googleapis");
const { sheets } = require("googleapis/build/src/apis/sheets");
var auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);
var data = [];
var announcements;
const club = require("./js/club.js");
const announcement = require("./js/announcements.js");

auth.authorize(setData);

app.use("/", express.static(__dirname + "/front-end"));

app.post("/getData", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
});

app.post("/announcements", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(announcements));
});

app.get("*", function(req, res) {
  res.redirect("/");
})

app.listen(81, function () {
  console.log("server started on port 80");
});

function setData(err, token) {
  if (err) return;
  const sheets = google.sheets({
    version: "v4",
    auth: auth,
  });

  sheets.spreadsheets.values
    .get({
      spreadsheetId: "1LhB2_-7ZXsHk2boeTRIt2slaFVLsXy0lceJyfwyCB-E",
      range: "A1:Z200",
    })
    .then((response) => {
      data = club(response.data.values);
      loadAnnouncements(sheets);
    });
}

async function loadAnnouncements(sheets) {
  sheets.spreadsheets.values
    .get({
      spreadsheetId: "1JEatzOlJ5vKTxQE4EUSJjoa_ViSJ_TGfwoG1Zx8x9kM",
      range: "A1:N100",
    })
    .then((response) => {
      announcements = announcement(response.data.values);
    });
}

setInterval(async () => {
  //console.log(auth);
  if (auth.isTokenExpiring()) {
    auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );
    auth.authorize(setData);
  }
}, 4000);
