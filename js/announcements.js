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

        if (announcementOb.Date && announcementOb.Title && announcementOb["Paragraph 1"]) toBeSorted.push(announcementOb);
    }

    for (var i=0; i<toBeSorted.length-1; i++) {
        var date = new Date(toBeSorted[i].Date);
        var nextDate = new Date(toBeSorted[i+1].Date);
        if (date>nextDate) {
            let [temp] = toBeSorted.splice(i+1, 1);
            toBeSorted.splice(0, 0, temp);
            i=-1;
        }
    }

    toBeSorted.reverse();

    announcements["data"] = toBeSorted;


    return announcements;
}

module.exports = announcement;