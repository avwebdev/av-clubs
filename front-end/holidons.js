const holidonContainer = document.getElementById("holidon-container");
const videos = [
  "HoliDON-(A-compilation).mov",
  "AV-Technovation.mp4",
  "Kids-Against-Hunger.mp4",
  "AV-Bollywood-And-Bhangra.mov",
  "Lead-Club.mp4",
  "Local-Leaders-Club.mp4"
];

const createVideo = (video) => {
  const videoDiv = document.createElement("div");
  videoDiv.classList.add("holidon-video");
  const videoEl = document.createElement("video");
  const source = document.createElement("source");
  source.src = `./resources/holidons/${video}`;
  videoEl.appendChild(source);
  videoEl.setAttribute("controls", "");
  const videoTitle = document.createElement("h3");
  let videoString = video.replace(/-/g, " ");
  videoString = videoString.substring(0, videoString.indexOf("."));
  videoTitle.innerText = videoString;

  videoDiv.appendChild(videoEl);
  videoDiv.appendChild(videoTitle);
  holidonContainer.appendChild(videoDiv);
};

videos.forEach(createVideo);
