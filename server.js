const express = require("express");
const app = express();
const fs = require("fs");
const secrets = require("./back-end/secrets.js");
const cookieParser = require("cookie-parser");
let data = [];
let announcements;

const club = require("./back-end/club.js");
const { announcement, mailingList } = require("./back-end/announcements.js");
const validator = require("email-validator");
const {sheets, resetAuth, auth} = require("./back-end/sheetsSetup.js");

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
  console.log(`${email} is subscribing!`);
  if (validator.validate(email)) {
    mailingList.registerNewEmail(email);
    res.end();
  } else {
    res.end("Please put in a valid email");
  }
});

app.get("/unsubscribe", function (req, res) {
  const email = req.query.email;
  console.log(`${email} is unsubscribing.`);
  if (validator.validate(email)) {
    mailingList.unsubscribeEmail(email);
  }
  res.end("You have unsubscribed from the mailing list.");
});

app.post("/announcements", function (req, res) {
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(announcements));
});

app.get("*", function (req, res) {
  res.redirect("/");
});

async function setData() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: secrets.CLUBS_SHEET,
    range: "A1:Z900",
  });

  data = club(response.data.values);
  await loadAnnouncements(sheets);
}

async function loadAnnouncements(sheets) {
  const response = await sheets.spreadsheets.values.get({
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
      console.log(`Server started at ${(new Date()).toLocaleString()}`);
    });
  } catch (e) {
    console.log("Unable to authenticate", e);
    process.exit();
  }
})();

setInterval(async () => {
  if (auth.isTokenExpiring()) {
    console.log(`Refreshing auth and data at ${(new Date()).toLocaleString()}`);
    resetAuth();
    auth.authorize(setData);
  }
}, 10000);
