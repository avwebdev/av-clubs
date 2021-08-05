require("dotenv").config({ path: "tests/testing.env" });
const assert = require("assert");
const nodemailer = require("nodemailer");
const { mailingList } = require("../back-end/announcements");

describe("Test Get Emails", function () {
  it(`Should return an array that contains ${process.env.TEST_EMAIL}`, async function () {
    const emails = await mailingList.getAllEmails();
    assert.equal(emails.includes(process.env.TEST_EMAIL), true);
  });
});

describe("Test email sending", function () {
  it("Should send emails to a test server without erroring", async function () {
    await mailingList.email([createTestAnnouncement()], [process.env.TEST_EMAIL]);
  });
});

function createTestAnnouncement() {
  return {
    "Paragraph 1": "This is a test announcement",
    "Title": "Test announcement.",
    "Which club do you represent?": "AV Quality Assurance",
    "Paragraph 2": "This is the second part of the test announcement",
    "Paragraph 3": "This is the third part of the test announcement",
    "Link 1": "https://google.com",
    "Link 2" : "https://facebook.com"
  };
}
