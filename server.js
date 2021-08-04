const express = require("express");
const app = express();
const fs = require("fs");
const { google } = require("googleapis");
const secrets = require("./js/secrets.js");
const cookieParser = require("cookie-parser");
let auth = new google.auth.JWT(
  secrets.SERVICE_ACCOUNT.client_email,
  null,
  secrets.SERVICE_ACCOUNT.private_key,
  ["https://www.googleapis.com/auth/spreadsheets"]
);
let data = [];
let announcements;

const club = require("./js/club.js");
const { announcement, mailingList } = require("./js/announcements.js");
const validator = require("email-validator");

app.use(express.json());
app.use(cookieParser());

app.post("/getEmails", async function (req, res) {
  if (req.body.randomSecret === secrets.SECRET_CODE) {
    res.end(JSON.stringify(await mailingList.getAllEmails()));
    return;
  } else res.status(403).end();
});

app.use("/", express.static(__dirname + "/front-end"));

app.post("/getData", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
});

app.post("/subscribe", function (req, res) {
  const email = req.body.email;
  if (validator.validate(email)) {
    mailingList.registerNewEmail(email);
    res.end();
  } else {
    res.end("Please put in a valid email");
  }
});

app.post("/unsubscribe", function (req, res) {
  const email = req.body.email;
  if (validator.validate(email)) {
    mailingList.unsubscribeEmail(email);
  }
  res.end();
});

app.post("/announcements", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(announcements));
});

app.get("*", function (req, res) {
  res.redirect("/");
});

async function setData(token) {
  const sheets = google.sheets({
    version: "v4",
    auth: auth,
  });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: secrets.CLUBS_SHEET,
    range: "A1:Z900",
  });

  data = club(response.data.values);
  await loadAnnouncements(sheets);
}

async function loadAnnouncements(sheets) {
  const response = await sheets.spreadsheets.values
    .get({
      spreadsheetId: secrets.ANNOUNCEMENTS_SHEET,
      range: "A1:Z900",
    });
  announcements = announcement(response.data.values);
}

(async () => {
  try {
    const credentials = await auth.authorize();
    await setData(credentials);
    app.listen(process.env.PORT || 81, function () {
      console.log("server started");
    });
  } catch (e) {
    console.log("Unable to authenticate", e);
    process.exit();
  }
})();

setInterval(async () => {
  if (auth.isTokenExpiring()) {
    auth = new google.auth.JWT(
      secrets.SERVICE_ACCOUNT.client_email,
      null,
      secrets.SERVICE_ACCOUNT.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );
    auth.authorize(setData);
  }
}, 10000);
