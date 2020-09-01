const clubsDiv = document.getElementById("all-clubs");
const searchInput = document.getElementById("search-input");
const clubSuggestions = document.getElementById("club-suggestions");

// Club fields
const description = "What is the purpose of your club?";
const contact = "What is the club contact email?";
const meetingTime = "When are meetings held? (What day and how often?)";
const meetingLocation = "Where are meetings held?";
const president = "Who is the current Club President (or equivalent)?";
const vicePresident = "Who is the current Club Vice President (or equivalent)?";
const secretary = "Who is the current Club Secretary (or equivalent)?";
const treasurer = "Who is the current Club Treasurer (or equivalent)?";
const otherOfficers = "Are there any other Club Officer? (Please state their roles.)";

async function getData() {
  const response = await fetch("/getData", { method: "POST" });
  const json = await response.json();
  return json;
}


getData().then((allClubs) => {
  searchInput.onblur = onSearchBlur;
  searchInput.onchange = searchClubs;
  searchInput.oninput = searchClubs;

  populateClubs(allClubs);

  function onSearchBlur(e) {
    console.log(e);
    clubSuggestions.style.display = "none";
  }

  function searchClubs(e) {
    //Show suggestions
    clubSuggestions.style.display = "block";
    //Remove all previous suggestions
    removeAllChildNodes(clubSuggestions);
    //Turn search into lower case string
    const search = e.target.value.toLowerCase();
    //Go through all clubs
    let i = 0;
    for (const name in allClubs) {
      //If the search matches the name
      if (i < 5 && name.toLowerCase().includes(search)) {
        createSuggestion(name, true);
        i++;
      }
    }
    if (i === 0) {
      createSuggestion("No Results Found")
    }
  }

  function createSuggestion(text, withOnClick) {
    const clubSuggestion = createElement("div", {
      class: "club-suggestion",
      id: `club-suggestion-${text}`,
      onclick: () => {
        if (withOnClick) {
          document.getElementById(`club-div-${text}`).scrollIntoView({
            behavior: "smooth",
          });
        }
      }
    });
    const title = createElement("h5", {
      innerText: text
    });
    clubSuggestion.appendChild(title);
    clubSuggestions.appendChild(clubSuggestion);
  }

  async function populateClubs(clubs) {
    let counter = 0;
    for (const name in clubs) {
      counter++;

      if (counter == 5) {
        var viewAll = document.createElement("div");
        viewAll.classList.add("club-div");
        viewAll.id = "view-all-clubs";
        viewAll.style.justifyContent = "center";
        viewAll.innerHTML = `<h2>View All ${Object.keys(clubs).length} Clubs</h2>`;

        viewAll.onclick = () => { openClubs("all") };
        clubsDiv.appendChild(viewAll);
      }
      else if (counter > 5) {
        let club = createClubDiv(name, clubs[name]);
        club.classList.add("invisible-club");
        clubsDiv.appendChild(club);
      }
      else {
        const club = createClubDiv(name, clubs[name]);
        clubsDiv.appendChild(club);
      }
    }
  }

  function createClubDiv(name, club) {
    console.log(club);
    const clubDiv = createElement("div", { className: "club-div", id: `club-div-${name}` });
    clubDiv.setAttribute("data-count", "0");
    const clubDisplay = createElement("div", {className: "club-div-display"});
    const clubTitle = createElement("h1", {
      className: "club-title",
      innerText: name
    });
    clubDisplay.appendChild(clubTitle);
    const i = createElement("i", { className: "mdi mdi-arrow-down-drop-circle-outline club-dropdown-icon", onclick: () => showClubInfo(clubDiv) });
    clubDisplay.appendChild(i);
    clubDiv.appendChild(clubDisplay);
    //Dropdown
    const clubDropdown = createElement("div", {className: "club-dropdown"});
    const clubDescription = createElement("p", {innerText: `Description: ${club[description]}`, className: "club-dropdown-item club-description"});
    const clubContact = createElement("p", {innerText: `Contact Email: ${club[contact]}`, className: "club-dropdown-item club-contact"});
    const clubMeetingTime = createElement("p", {innerText: `Meeting Time: ${club[meetingTime]}`, className: "club-dropdown-item club-meeting-time"});
    const clubMeetingLocation = createElement("p", {innerText: `Meeting Location: ${club[meetingLocation]}`, className: "club-dropdown-item club-meeting-location"});
    const clubOfficers = createElement("p", {
      innerText: `Officers: ${club[president]} (President), ${club[vicePresident]} (Vice President), ${club[secretary]} (Secretary), ${club[treasurer]} (Treasurer), ${club[otherOfficers]}`, 
      className: "club-dropdown-item club-officers"});
    clubDropdown.appendChild(clubDescription);
    clubDropdown.appendChild(clubContact);
    clubDropdown.appendChild(clubMeetingTime);
    clubDropdown.appendChild(clubMeetingLocation);
    clubDropdown.appendChild(clubOfficers);

    clubDiv.appendChild(clubDropdown);
    return clubDiv;
  }

  function showClubInfo(element) {
    const clubDropdown = element.getElementsByClassName("club-dropdown")[0];
    let count = parseInt(element.getAttribute("data-count"));
    if(count % 2 === 0) {
      clubDropdown.style.display = "flex";
    } else {
      clubDropdown.style.display = "none";
    }   
    element.setAttribute("data-count", (count + 1).toString());    
  }

  function createElement(type, attributes) {
    const element = document.createElement(type);
    for (const attrName in attributes) {
      element[attrName] = attributes[attrName];
    }
    return element;
  }

  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
  }
});

function openClubs(mode) {
  switch (mode) {
    case "all":
      console.log(document.querySelectorAll(".invisible-club"));
      document.styleSheets[document.styleSheets.length - 1].addRule(".invisible-club", "display: flex !important");
      document.querySelector("#view-all-clubs").style.display = "none";
      applyTag("all");
      break;
  }
}

function openTags() {

}

window.addEventListener("load", function() {
  for (var topic of document.querySelectorAll("#categories .topic")) {
    let tagName = topic.querySelector("h3").innerText;
    topic.onclick = function() {
      applyTag("tag", tagName);
    }
  }
});

function applyTag(mode, tagName) {
  document.querySelector("#sort-area").innerHTML = "";
  switch (mode) {
    case "all":
      document.querySelector("#sort-area").innerHTML += `
      <div class="sort-field">
        <i class="mdi mdi-close"></i>
        <span>All Clubs</span>
      </div>`;
      document.querySelector("#sort-area").querySelector(".sort-field i").onclick = function() {
        document.styleSheets[document.styleSheets.length - 1].addRule(".invisible-club", "display: none !important");
        document.getElementById("view-all-clubs").style.display = "flex";
        clearTags();
      }
      break;
    case "tag":
      document.querySelector("#sort-area").innerHTML += `
      <div class="sort-field">
        <i class="mdi mdi-close"></i>
        <span>${tagName}</span>
      </div>`;
      document.querySelector("#sort-area").querySelector(".sort-field i").onclick = function () {
        document.styleSheets[document.styleSheets.length - 1].addRule(".invisible-club", "display: none !important");
        document.getElementById("view-all-clubs").style.display = "flex";
        clearTags();
      }
      break;
  }
}

function clearTags() {
  document.querySelector("#sort-area").innerHTML = "";
}

function rotate(element){
  display(element, count);
  if(count%2==0){
    element.style.transform = "rotate(-180deg)";
    count++;
  }
  else if (count % 2 == 1) {
      element.style.transform = "none";
      count++;
  }
}

function display(i, counter) {
  var element = i.parentNode;
  var feed = document.getElementsByClassName("announcement");
  var answer = document.getElementsByClassName("answer");
  for (var x = 0; x < feed.length; x++) {
    if (element.isEqualNode(feed[x])) {
      if (counter % 2 == 0) {
        answer[x].style.display = "block";
        answer[x].style.borderTop = "1px solid black";
      }
      else if (counter % 2 == 1) {
        answer[x].style.display = "none";
      }
    }
  }
}