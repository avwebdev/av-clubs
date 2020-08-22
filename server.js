var express = require("express");
var app = express();
const fs = require("fs");
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { google } = require('googleapis');
const { sheets } = require("googleapis/build/src/apis/sheets");
var auth = new google.auth.JWT(credentials.client_email, null, credentials.private_key, ["https://www.googleapis.com/auth/spreadsheets"]);
var data = [];
const club = require("./js/club.js");

auth.authorize(setData);

app.use("/", express.static( __dirname + "/front-end"));

app.post("/getData", function(req, res) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
});

app.listen(81, function () {
    console.log("server started on port 80");
});

function setData(err, token) {
    if (err) return;
    const sheets = google.sheets({
        version: 'v4',
        auth: auth
    });

    sheets.spreadsheets.values.get({
        spreadsheetId: "1mkEshytIqNDkkNUTpuhiZjYMJNNxSvAvzTZgYXizgh4",
        range: "A1:N100"
    }).then((response) => {
        data = club(response.data.values);
    });
}

setInterval(() => { if (auth.isTokenExpiring()) auth.authorize(setData); }, 4000);