const express = require("express");
const app = express();
const fs = require("fs");
const { google } = require("googleapis");
const secrets = require("./js/secrets.js");
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
const session = require("express-session");
const loginFile = fs.readFileSync("front-end/login.html").toString();
const authorize = require("./js/login.js");

auth.authorize(setData);

app.use(express.json());
app.use(
  session({
    secret: secrets.SECRET_CODE,
    // cookie: { secure: false }, //Enable this later after https is enabled
    resave: false,
    saveUninitialized: false,
  })
);

app.post("/getEmails", async function (req, res) {
  if (req.body.randomSecret === secrets.SECRET_CODE) {
    res.end(JSON.stringify(await mailingList.getAllEmails()));
    return;
  } else res.status(403).end();
});

app.get("/index.html|resources.html|^/$/", function (req, res, next) {
  if (!isAuthorized(req)) {
    res.redirect("/login");
    res.end();
  } else next();
});

app.get("/login", function (req, res) {
  if (isAuthorized(req)) {
    res.redirect("/");
  } else res.end(loginFile);
});

app.post("/login", async function (req, res) {
  const result = await authorize(req);
  if (result) res.end("success");
  else res.end("failure");
});

app.use("/", express.static(__dirname + "/front-end"));

app.post("/getData", function (req, res) {
  if (!isAuthorized(req)) {
    res.end("You are inauthorized");
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
});

app.post("/subscribe", function (req, res) {
  if (!isAuthorized(req)) {
    res.end("You are inauthorized");
    return;
  }
  const email = req.body.email;
  if (validator.validate(email)) {
    mailingList.registerNewEmail(email);
    res.end();
  } else {
    res.end("Please put in a valid email");
  }
});

app.post("/unsubscribe", function (req, res) {
  if (!isAuthorized(req)) {
    res.end("You are inauthorized");
    return;
  }
  const email = req.body.email;
  if (validator.validate(email)) {
    mailingList.unsubscribeEmail(email);
  }
  res.end();
});

app.post("/announcements", function (req, res) {
  if (!isAuthorized(req)) {
    res.end("You are inauthorized");
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(announcements));
});

app.get("*", function (req, res) {
  res.redirect("/");
});

app.listen(81, function () {
  console.log("server started on port 81");
});

function setData(err, token) {
  if (err) return;
  const sheets = google.sheets({
    version: "v4",
    auth: auth,
  });

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

async function loadAnnouncements(sheets) {
  sheets.spreadsheets.values
    .get({
      spreadsheetId: secrets.ANNOUNCEMENTS_SHEET,
      range: "A1:Z900",
    })
    .then((response) => {
      announcements = announcement(response.data.values);
    });
}

function isAuthorized(req) {
  if (req?.session?.authorized === true) return true;
  return false;
}

setInterval(async () => {
  //console.log(auth);
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
