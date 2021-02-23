/* eslint-disable indent */
const secrets = require("./secrets.js");
const fs = require("fs");
const nodemailer = require("nodemailer");
const mailClient = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: secrets.AV_EMAIL, // generated ethereal user
    pass: secrets.AV_PASS, // generated ethereal password
  },
});

const emailAccessFileExists = fs.existsSync("js/mailingList.json");
if (!emailAccessFileExists) {
  fs.writeFileSync("./js/mailingList.json", JSON.stringify({ emails: [] }));
}

function announcement(sheetsOb) {
  const categories = {};

  const announcements = {};

  const toBeSorted = [];

  sheetsOb[0].forEach(function (category, index) {
    categories[`${index}`] = category;
  });

  for (const announcement of sheetsOb.slice(1)) {
    const announcementOb = {};

    announcement.forEach(function (value, index) {
      announcementOb[categories[`${index}`]] = value;
    });

    if (
      announcementOb.Date &&
      announcementOb.Title &&
      announcementOb["Paragraph 1"] &&
      announcementOb["Approved"] &&
      announcementOb["Approved"] != ""
    )
      toBeSorted.push(announcementOb);
  }

  for (let i = 0; i < toBeSorted.length - 1; i++) {
    const date = new Date(toBeSorted[i].Date);
    const nextDate = new Date(toBeSorted[i + 1].Date);
    if (date > nextDate) {
      let [temp] = toBeSorted.splice(i + 1, 1);
      toBeSorted.splice(0, 0, temp);
      i = -1;
    }
  }

  toBeSorted.reverse();

  announcements["data"] = toBeSorted;

  mailingList.setAnnouncements(announcements);

  return announcements;
}

const mailingList = {
  previousAnnouncements: null,
  currentAnnouncements: null,
  setAnnouncements: function (currentAnnouncements) {
    this.previousAnnouncements = this.currentAnnouncements;
    this.currentAnnouncements = currentAnnouncements;
    const announcementsToEmail = this.checkForApprovalChanges();
    if (announcementsToEmail.length > 0) {
      this.email(announcementsToEmail);
    }
  },

  checkForApprovalChanges: function () {
    const newAnnouncements = [];
    if (this.previousAnnouncements != null) {
      for (const announcement of Object.values(
        this.currentAnnouncements.data
      )) {
        let previousAnnouncement = null;

        for (const otherAnnouncement of Object.values(
          this.previousAnnouncements.data
        )) {
          if (
            otherAnnouncement.Title === announcement.Title ||
            otherAnnouncement["Paragraph 1"] === announcement["Paragraph 1"] ||
            otherAnnouncement["Paragraph 2"] === announcement["Paragraph 2"]
          ) {
            previousAnnouncement = otherAnnouncement;
            break;
          }
        }

        if (
          previousAnnouncement == null &&
          announcement["Approved"] &&
          announcement["Approved"].trim() != ""
        ) {
          newAnnouncements.push(announcement);
        }
      }
    }
    return newAnnouncements;
  },

  email: async function (announcements) {
    const emails = await this.getAllEmails();
    // console.log(`sending ${announcements.length} announcements to ${emails}`);
    for (const announcement of announcements) {
      let html = `
      </p>${announcement["Paragraph 1"]}<br><br>
      ${
        announcement["Paragraph 2"]
          ? announcement["Paragraph 2"] + "<br><br>"
          : ""
      }
      ${
        announcement["Paragraph 3"]
          ? announcement["Paragraph 3"] + "<br><br>"
          : ""
      }
      ${
        announcement["Paragraph 4"]
          ? announcement["Paragraph 4"] + "<br><br>"
          : ""
      }
      ${
        announcement["Paragraph 5"]
          ? announcement["Paragraph 5"] + "<br><br>"
          : ""
      }</p>


      ${announcement["Link 1"] ? `${announcement["Link 1"]}<br>` : ""}
      ${announcement["Link 2"] ? `${announcement["Link 2"]}<br>` : ""}
      ${announcement["Link 3"] ? `${announcement["Link 3"]}<br>` : ""}
      ${announcement["Link 4"] ? `${announcement["Link 4"]}<br>` : ""}
                        `;
      // console.log(html);
      for (const mail of emails) {
        await mailClient.sendMail({
          from: "AV Clubs <amadorvalleyweb.org>",
          to: emails,
          subject: `${announcement.Title}`,
          html: html,
        });
      }
    }
  },

  registerNewEmail: async function (email) {
    const formattedEmail = email.toLowerCase().trim();
    const emailAccessor = JSON.parse(fs.readFileSync("./js/mailingList.json"));
    if (!emailAccessor.emails.includes(formattedEmail)) {
      emailAccessor.emails.push(formattedEmail);
      fs.writeFileSync("./js/mailingList.json", JSON.stringify(emailAccessor));
    }
  },

  unsubscribeEmail: async function (email) {
    const formattedEmail = email.toLowerCase().trim();
    const emailAccessor = JSON.parse(fs.readFileSync("./js/mailingList.json"));
    const indexFound = emailAccessor.emails.indexOf(formattedEmail);
    if (indexFound != -1) {
      emailAccessor.emails.splice(indexFound, 1);
      fs.writeFileSync("./js/mailingList.json", JSON.stringify(emailAccessor));
    }
  },

  getAllEmails: async function () {
    const { emails } = JSON.parse(
      await fs.promises.readFile("./js/mailingList.json")
    );
    return emails;
  },
};

exports.announcement = announcement;
exports.mailingList = mailingList;
