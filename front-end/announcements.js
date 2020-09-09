var announcements;
async function loadAnnouncements() {
    var data = await fetch("announcements", {
        method: "POST",
    });
    data = await data.json();
    announcements = data;
    var announcementsRoot = document.getElementById("announcements");
    var mobileAnnouncementsRoot = document.querySelector(".swiper-wrapper");
    for (var key of Object.keys(data)) {
        announcement = data[key];
        announcementsRoot.innerHTML += `
        <div class="announcement">
            <div class="main-text">
                <h4>
                    ${announcement.Title}
                </h4>
                <p>${announcement["Paragraph 1"]}</p>
            </div>
            <div class="announcement-bottom-bar">
                <p id="date">${announcement.Date}</p>
                <i class="mdi mdi-arrow-expand" onclick="appear(${key});"></i>
            </div>
        </div>    
        `;
        mobileAnnouncementsRoot.innerHTML += `
        <div class="swiper-slide" onclick="appear(${key});">
            <h3>${announcement.Title}</h3>
            <p>${announcement["Paragraph 1"]}</p>
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