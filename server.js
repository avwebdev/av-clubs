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
const loginFile = fs.readFileSync("front-end/login.html").toString();
const {authorize, login, redirectToLoginIfNotAuthorized, sendMessageIfNotAuthorized} = require("./js/login.js");

auth.authorize(setData);

app.use(express.json());
app.use(cookieParser());

app.post("/getEmails", async function (req, res) {
  if (req.body.randomSecret === secrets.SECRET_CODE) {
    res.end(JSON.stringify(await mailingList.getAllEmails()));
    return;
  } else res.status(403).end();
});

app.get("/index.html|resources.html|^/$/", authorize, redirectToLoginIfNotAuthorized);

app.get("/login", authorize, (req, res) => {
  if (req.authorized) res.redirect("/");
  else res.end(loginFile);
});

app.post("/login", login);

app.use("/", express.static(__dirname + "/front-end"));

app.post("/getData", authorize, sendMessageIfNotAuthorized("You are unauthorized."), (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
});

app.post("/subscribe", authorize, sendMessageIfNotAuthorized("You are unauthorized."), function (req, res) {
  const email = req.body.email;
  if (validator.validate(email)) {
    mailingList.registerNewEmail(email);
    res.end();
  } else {
    res.end("Please put in a valid email");
  }
});

app.post("/unsubscribe", authorize, sendMessageIfNotAuthorized("You are unauthorized."), function (req, res) {
  const email = req.body.email;
  if (validator.validate(email)) {
    mailingList.unsubscribeEmail(email);
  }
  res.end();
});

app.post("/announcements", authorize, sendMessageIfNotAuthorized("You are unauthorized."), function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(announcements));
});

app.get("*", function (req, res) {
  res.redirect("/");
});

app.listen(process.env.PORT || 81, function () {
  console.log("server started");
});

function setData(err, token) {
  if (err) return;
  const sheets = google.sheets({
    version: "v4",
    auth: auth,
  });

  try {
    sheets.spreadsheets.values
      .get({
        spreadsheetId: secrets.CLUBS_SHEET,
        range: "A1:Z900",
      })
      .then((response) => {
        data = club(response.data.values);
        loadAnnouncements(sheets);
      });
  }
  catch (e) {
    console.log(e);
  }
}

async function loadAnnouncements(sheets) {
  try {
    sheets.spreadsheets.values
    .get({
      spreadsheetId: secrets.ANNOUNCEMENTS_SHEET,
      range: "A1:Z900",
    })
    .then((response) => {
      announcements = announcement(response.data.values);
    });
  } catch (e) {
    console.log(e);
  }
}

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
