var announcements;

const getAnnouncementData = async () => {
  const res = await fetch("announcements", {
    method: "POST",
  });
  const json = await res.json();
  return json.data;
};

async function loadAnnouncements() {
  const data = await getAnnouncementData();
  console.log(data);
  for (var leadershipI = 0; leadershipI < 1; leadershipI++) {
    if (data[leadershipI]["Which club do you represent?"] === "Leadership") {
      continue;
    }
    for (var i = leadershipI; i < data.length; i++) {
      //console.log(data[i]["Which club do you represent?"])
      if (data[i]["Which club do you represent?"] === "Leadership") {
        let [temp] = data.splice(i, 1);
        data.splice(leadershipI, 0, temp);
        break;
      }
    }
  }
  announcements = data;
  var announcementsRoot = document.getElementById("announcements");
  var mobileAnnouncementsRoot = document.querySelector(".swiper-wrapper");
  // eslint-disable-next-line no-redeclare
  var i = 0;
  for (var key = 0; key < data.length; key++) {
    if (i > 6) break; //limits amount of announcements
    announcement = data[key];
    if (
      !(
        announcement["Title"] ||
        announcement["Date"] ||
        announcement["Paragraph 1"]
      )
    )
      continue;
    i++;
    let expandButton = `<i class="mdi mdi-arrow-expand" onclick="appear(${key});"></i>`;
    if (!(announcement["Paragraph 2"] || announcement["Link 1"])) {
      expandButton = "";
    }
    let expandMessage = "";
    if (announcement["Expand Message"]) {
      expandMessage = " " + announcement["Expand Message"];
    }
    announcementsRoot.innerHTML += `
        <div class="announcement">
            <div class="main-text">
                <h4>
                    ${announcement.Title}
                </h4>
                <p>${announcement["Paragraph 1"]}${expandMessage}
                    <br>
                    <br>
                    — ${announcement["Which club do you represent?"]}
                </p>
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
            <p>From <span style="font-weight: 400; margin: 0px">${announcement["Which club do you represent?"]}</span> - ${announcement["Paragraph 1"]}${expandMessage}</p>
            <div class="bottom-bar">
                ${announcement.Date}
                <i class="mdi mdi-arrow-expand"></i>
            </div>
        </div>
        
        `;
  }
  mySwiper.update();
}

loadAnnouncements();
