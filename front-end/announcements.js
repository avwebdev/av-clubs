var announcements;
async function loadAnnouncements() {
    var data = await fetch("announcements", {
        method: "POST",
    });
    data = await data.json();
    announcements = data;
    var announcementsRoot = document.getElementById("announcements");
    var mobileAnnouncementsRoot = document.querySelector(".swiper-wrapper");
    var i=0;
    for (var key of Object.keys(data)) {
        if (i>6) break; //limits amount of announcements
        announcement = data[key];
        if (!(announcement["Title"] || announcement["Date"] || announcement["Paragraph 1"])) continue;
        i++;
        let expandButton = `<i class="mdi mdi-arrow-expand" onclick="appear(${key});"></i>`;
        if (!(announcement["Paragraph 2"] || announcement["Link 1"])) {
            expandButton="";
        }
        let expandMessage="";
        if (announcement["Expand Message"]) {
            expandMessage=" " + announcement["Expand Message"];
        }
        announcementsRoot.innerHTML += `
        <div class="announcement">
            <div class="main-text">
                <h4>
                    ${announcement.Title}
                </h4>
                <p>${announcement["Paragraph 1"]}${expandMessage}</p>
            </div>
            <div class="announcement-bottom-bar">
                <p class="date">${announcement.Date}</p>
                ${expandButton}
            </div>
        </div>    
        `;
        mobileAnnouncementsRoot.innerHTML += `
        <div class="swiper-slide" onclick="appear(${key});">
            <h3>${announcement.Title}</h3>
            <p>${announcement["Paragraph 1"]}${expandMessage}</p>
            <div class="bottom-bar">
                ${announcement.Date}
                <i class="mdi mdi-arrow-expand"></i>
            </div>
        </div>
        
        `


    }
    mySwiper.update();
}

loadAnnouncements();