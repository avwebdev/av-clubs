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
const { announcement, mailingList } = require("./js/announcements.js");
const validator = require("email-validator");
const session = require("express-session");
const loginFile = fs.readFileSync("front-end/login.html").toString();
const authorize = require("./js/login.js");

auth.authorize(setData);

app.use(express.json())
app.use(session({
  secret: "abcdrgyh",
  // cookie: { secure: false }, //Enable this later after https is enabled
  resave: false,
  saveUninitialized: false
}));

app.post("/getEmails", async function (req, res) {
  if (req.body.randomSecret === "****with@nchor") {
    res.end(JSON.stringify(await mailingList.getAllEmails()));
    return;
  } else res.end();
})

app.get('/index.html|resources.html|^/$/', function (req, res, next) {
  if (!isAuthorized(req)) {
    res.redirect("/login");
    res.end();
  } else next();
});

app.get("/login", function (req, res) {
  if (isAuthorized(req)) {
    res.redirect("/");
  }
  else res.end(loginFile);
});

app.post("/login", async function (req, res) {
  var result = await authorize(req);
  if (result) res.end("success");
  else res.end("failure");
});

app.use("/", express.static(__dirname + "/front-end"));

app.post("/getData", function (req, res) {
  if (!isAuthorized(req)) {
    res.end("You are inauthorized")
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
});

app.post("/suscribe", function (req, res) {
  if (!isAuthorized(req)) {
    res.end("You are inauthorized")
    return;
  }
  var email = req.body.email;
  if (validator.validate(email)) {
    mailingList.registerNewEmail(email);
    res.end();
  } else {
    res.end("Please put in a valid email");
  }
});

app.post("/unsuscribe", function (req, res) {
  if (!isAuthorized(req)) {
    res.end("You are inauthorized");
    return;
  }
  var email = req.body.email;
  if (validator.validate(email)) {
    mailingList.unsuscribeEmail(email);
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
      range: "A1:Z100",
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
      credentials.client_email,
      null,
      credentials.private_key,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );
    auth.authorize(setData);
  }
}, 10000);