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

        toBeSorted.push(announcementOb);
    }

    for (var i=0; i<toBeSorted.length; i++) {
        var date = toBeSorted[i].Date;
        date = new Date(date);
        for (var x = 0; x<i; x++) {
            var compareDate = new Date(toBeSorted[x].Date);
            if (date > compareDate && (x === 0 || date < new Date(toBeSorted[x-1].Date))) {
                var temp = toBeSorted.splice(i, 1);
                toBeSorted.splice(x, 0, temp[0])
            }
            
        }
    }

    toBeSorted.forEach(function(value, index) {
        announcements[index] = value;
    });


    return announcements;
}

module.exports = announcement;