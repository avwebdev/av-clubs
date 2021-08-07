const secrets = require("./secrets.js");
const fs = require("fs");
const nodemailer = require("nodemailer");
const { sheets } = require("./sheetsSetup.js");
const mailClient = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: secrets.AV_EMAIL, // generated ethereal user
    pass: secrets.AV_PASS, // generated ethereal password
  },
});

const { Firestore } = require("@google-cloud/firestore");
const { docs_v1 } = require("googleapis");
const firestore = new Firestore({
  credentials: {
    client_email: secrets.SERVICE_ACCOUNT.client_email,
    private_key: secrets.SERVICE_ACCOUNT.private_key,
  },
  projectId: secrets.SERVICE_ACCOUNT.project_id,
});

const subscribers = firestore.collection("subscribers");

function announcement(sheetsOb) {
  const categories = {};

  const announcements = {};

  const toBeSorted = [];

  sheetsOb[0].forEach(function (category, index) {
    categories[`${index}`] = category;
  });

  for (let i = 1; i < sheetsOb.length; i++) {
    const announcement = sheetsOb[i];
    const announcementOb = {};

    announcement.forEach(function (value, index) {
      announcementOb[categories[`${index}`]] = value;
    });

    announcementOb.google_sheet_row = i + 1;

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
  announcements: null,
  setAnnouncements: function (announcements) {
    this.announcements = announcements;
    const announcementsToEmail = this.getAnnouncementsToEmail();
    if (announcementsToEmail.length > 0) {
      this.email(announcementsToEmail);
    }
  },

  getAnnouncementsToEmail: function () {
    const announcementsToEmail = [];
    for (const announcement of this.announcements.data) {
      if (!announcement["Email sent"] && announcement["Approved"] != "") {
        console.log(`New announcement to email: ${announcement.Title}.`);
        announcementsToEmail.push(announcement);
      }
    }
    return announcementsToEmail;
  },

  email: async function (announcements, emails = null) {
    if (!emails) {
      emails = await this.getAllEmails();
      // Filtering out duplicates
      emails = emails.filter((e, index) => {
        return emails.indexOf(e) === index;
      });
      console.log(`Unique emails in mailing list: ${emails}`);
    }

    for (const announcement of announcements) {
      this.setEmailSent(announcement);
      console.log(
        `Sending announcement to mailing list: ${announcement.Title}.`
      );

      for (const mail of emails) {
        const html = this.getMailingTemplate(announcement, mail);
        await mailClient.sendMail({
          from: "AV Clubs Mailing List <amadorvalleyweb@gmail.com>",
          to: mail,
          subject: `${announcement.Title}`,
          html: html,
        });
      }
    }
  },

  registerNewEmail: async function (email) {
    await subscribers.add({
      email,
    });
  },

  unsubscribeEmail: async function (email) {
    const docs = await subscribers.where("email", "==", email).get();
    docs.forEach(async (doc) => {
      await doc.ref.delete();
    });
  },

  getAllEmails: async function () {
    let allSubscriberDocuments = await subscribers.get();
    const allSubscribers = allSubscriberDocuments.docs.map((s) => {
      return s.get("email");
    });
    return allSubscribers;
  },

  setEmailSent: async function (announcementOb) {
    // Q is the column where the "Email sent" sent property is.
    const emailSentColumn = "Q";

    sheets.spreadsheets.values.update({
      spreadsheetId: secrets.ANNOUNCEMENTS_SHEET,
      range: `${emailSentColumn}${announcementOb.google_sheet_row}:${emailSentColumn}${announcementOb.google_sheet_row}`,
      resource: {
        values: [["Sent"]],
      },
      valueInputOption: "RAW",
    });
  },

  getMailingTemplate: function (announcement, mail) {
    let html = `
    <p>Hey Amador students!
    <br>
    <br>
    ${announcement["Paragraph 1"]}<br><br>
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
    }
    ${
      announcement["Link 1"]
        ? `<a href=${`${announcement["Link 1"]}`}>${
            announcement["Link 1"]
          }</a><br>`
        : ""
    }
    ${
      announcement["Link 2"]
        ? `<a href=${`${announcement["Link 2"]}`}>${
            announcement["Link 2"]
          }</a><br>`
        : ""
    }${
      announcement["Link 3"]
        ? `<a href=${`${announcement["Link 3"]}`}>${
            announcement["Link 3"]
          }</a><br>`
        : ""
    }${
      announcement["Link 4"]
        ? `<a href=${`${announcement["Link 4"]}`}>${
            announcement["Link 4"]
          }</a><br>`
        : ""
    }
    <br>Thanks,<br> ${announcement["Which club do you represent?"]}</p>
    <br>
    <a href="https://clubs.amadorweb.org/unsubscribe?email=${mail}">Click here to unsubscribe.</a>
    `;

    return html;
  },
};

exports.announcement = announcement;
exports.mailingList = mailingList;
