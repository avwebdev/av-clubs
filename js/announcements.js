function announcement(sheetsOb) {
    var categories = {

    }

    var announcements = {

    }

    var toBeSorted = [];

    sheetsOb[0].forEach(function (category, index) {
        categories[`${index}`] = category;
    });

    for (var announcement of sheetsOb.slice(1)) {
        var announcementOb = {

        }

        announcement.forEach(function (value, index) {
            announcementOb[categories[`${index}`]] = value;
        });


        if (announcementOb.Date && announcementOb.Title && announcementOb["Paragraph 1"] && announcementOb["Approved"] && announcementOb["Approved"] != "") toBeSorted.push(announcementOb);
    }

    for (var i = 0; i < toBeSorted.length - 1; i++) {
        var date = new Date(toBeSorted[i].Date);
        var nextDate = new Date(toBeSorted[i + 1].Date);
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


var mailingList = {
    previousAnnouncements: null,
    currentAnnouncements: null,
    setAnnouncements: function (currentAnnouncements) {
        this.previousAnnouncements = this.currentAnnouncements;
        this.currentAnnouncements = currentAnnouncements;
        var announcementsToEmail = this.checkForApprovalChanges();
        if (announcementsToEmail.length > 0) {
            this.email(announcementsToEmail);
        }
    },

    checkForApprovalChanges: function () {
        var newAnnouncements = [];
        if (this.previousAnnouncements != null) {
            for (var announcement of Object.values(this.currentAnnouncements.data)) {
                let previousAnnouncement = null;

                for (var otherAnnouncement of Object.values(this.previousAnnouncements.data)) {
                    if (otherAnnouncement.Title === announcement.Title || otherAnnouncement["Paragraph 1"] === announcement["Paragraph 1"] || otherAnnouncement["Paragraph 2"] === announcement["Paragraph 2"]) {
                        previousAnnouncement = otherAnnouncement;
                        break;
                    }
                }

                // console.log(announcement.Title, announcement.Approved);
                // if (previousAnnouncement) {
                //     console.log(previousAnnouncement.Title, previousAnnouncement.Approved);
                // }
 
                if (previousAnnouncement == null && announcement["Approved"] && announcement["Approved"].trim() != "") {
                    newAnnouncements.push(announcement);
                }
            }
        }
        return newAnnouncements;
    },

    email: function (announcements) {
        console.log(announcements);
    },

}

module.exports = announcement;