const clubsDiv = document.getElementById("all-clubs");
const searchBar = document.getElementById("search-bar");
const searchInput = document.getElementById("search-input");
const clubSuggestions = document.getElementById("club-suggestions");
const clearSearch = document.getElementById("search-clear");
const seeMoreCategories = document.getElementById("see-more-categories-btn");
const hiddenCategories = document.querySelectorAll("[data-topic-toggle]");

// Club fields
const description = "What is the purpose of your club?";
const contact = "What is the club contact email?";
const meetingTime = "When are meetings held? (What day and how often?)";
const meetingLocation = "Where are meetings held?";
const president = "Who is the current Club President (or equivalent)?";
const vicePresident = "Who is the current Club Vice President (or equivalent)?";
const secretary = "Who is the current Club Secretary (or equivalent)?";
const treasurer = "Who is the current Club Treasurer (or equivalent)?";
const otherOfficers =
  "Are there any other Club Officer? (Please state their roles.)";
const remindLink = "Do you have a remind link?";
const howToJoin = "How can members join the club?";
const otherLinks = "What are other important links for your club";

async function getData() {
  const response = await fetch("/getData", { method: "POST" });
  const json = await response.json();
  return json;
}

getData().then((allClubs) => {
  searchInput.onchange = searchClubs;
  searchInput.oninput = searchClubs;
  searchInput.onkeydown = searchKeyPress;
  document.onclick = checkIfSuggestionClicked;
  clearSearch.onclick = clearSearchInput;
  seeMoreCategories.onclick = showMoreCategories;

  populateClubs(allClubs);

  function checkIfSuggestionClicked(e) {
    const path = e.path || (event.composedPath && event.composedPath());
    if (!path.includes(searchBar) && !path.includes(clubSuggestions)) {
      searchInput.blur();
      clubSuggestions.style.display = "none";
    }
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
      if (name.toLowerCase().includes(search)) {
        createSuggestion(name, true);
        i++;
      }
    }
    if (i === 0) {
      createSuggestion("No Results Found");
    }
  }

  function searchKeyPress(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      console.log(clubSuggestions);
      clubSuggestions.firstChild.focus();
    }
  }

  function clearSearchInput() {
    searchInput.value = "";
    clubSuggestions.style.display = "none";
  }

  function createSuggestion(text, withOnClick) {
    const clubSuggestion = createElement("div", {
      className: "club-suggestion",
      id: `club-suggestion-${text}`,
      tabIndex: 0,
      onclick: () => {
        if (withOnClick) {
          openClubs("all");
          var div = document.getElementById(`club-div-${text}`);
          if (parseInt(div.getAttribute("data-count")) % 2 === 0) {
            showClubInfo(div);
            rotate(div);
          }
          div.scrollIntoView({
            behavior: "smooth",
          });
        }
        clubSuggestions.style.display = "none";
      },
    });
    const title = createElement("p", {
      innerText: text,
      className: "club-suggestion-title",
    });
    clubSuggestion.appendChild(title);
    clubSuggestions.appendChild(clubSuggestion);
  }

  async function populateClubs(clubs) {
    let counter = 0;
    for (const name in clubs) {
      counter++;

      if (counter > 5) {
        const club = createClubDiv(name, clubs[name]);
        club.classList.add("invisible-club");
        clubsDiv.appendChild(club);
      } else {
        const club = createClubDiv(name, clubs[name]);
        clubsDiv.appendChild(club);
      }
    }
    const viewAll = createElement("div", {
      id: "view-all-clubs",
      style: {
        justifyContent: "center",
      },
      className: "club-div",
      onclick: () => openClubs("all"),
    });
    const viewAllTitle = createElement("h2", {
      innerText: `View All ${Object.keys(clubs).length} Clubs`,
    });
    viewAll.appendChild(viewAllTitle);
    clubsDiv.appendChild(viewAll);
  }

  function createClubDiv(name, club) {
    //generate random tag name. With data tagname will equal club["category"]
    var randnum = Math.floor(Math.random() * 8 + 1);
    var tagname;
    switch (randnum) {
      case 1:
        tagname = "businessandfinance";
        break;

      case 2:
        tagname = "arts";
        break;

      case 3:
        tagname = "codingandrobotics";
        break;

      case 4:
        tagname = "scienceandmath";
        break;

      case 5:
        tagname = "entertainment";
        break;

      case 6:
        tagname = "community";
        break;

      default:
        tagname = "other";
    }

    //end

    const clubDiv = createElement("div", {
      className: `club-div ${tagname}`,
      id: `club-div-${name}`,
    });
    clubDiv.setAttribute("data-count", "0");
    const clubDisplay = createElement("div", { className: "club-div-display" });
    const clubTitle = createElement("h1", {
      className: "club-title",
      innerText: name,
    });
    clubDisplay.appendChild(clubTitle);
    const i = createElement("i", {
      className: "mdi mdi-arrow-down-drop-circle-outline club-dropdown-icon",
    });
    i.onclick = () => {
      showClubInfo(clubDiv);
      rotate(clubDiv);
    };
    i.style.transition = "0.5s";
    clubDisplay.appendChild(i);

    clubDiv.appendChild(clubDisplay);
    //Dropdown
    const clubDropdown = createElement("div", { className: "club-dropdown" });
    addClubDropdownItem(
      "Description",
      club[description],
      "club-description",
      clubDropdown
    );
    addClubDropdownItem(
      "Contact Email",
      club[contact],
      "club-contact",
      clubDropdown
    );
    addClubDropdownItem(
      "Meeting Time",
      club[meetingTime],
      "club-meeting-time",
      clubDropdown
    );
    addClubDropdownItem(
      "Meeting Location",
      club[meetingLocation],
      "club-meeting-location",
      clubDropdown
    );
    addClubDropdownItem(
      "Officers",
      `${club[president]} (President), ${club[vicePresident]} (Vice President), ${club[secretary]} (Secretary), ${club[treasurer]} (Treasurer), ${club[otherOfficers]}`,
      "club-officers",
      clubDropdown
    );
    addClubDropdownItem("Remind Link", club[remindLink], clubDropdown);
    addClubDropdownItem("How to join", club[howToJoin], clubDropdown);
    addClubDropdownItem("Other Links", club[otherLinks], clubDropdown);

    clubDiv.appendChild(clubDropdown);
    return clubDiv;
  }

  function addClubDropdownItem(title, text, className, clubDropdown) {
    if (text) {
      const clubDropdownItemTitle = createElement("strong", {
        innerText: title,
      });
      const clubDropdownItemText = createElement("p", { innerText: text });
      const clubDropdownItem = createElement("p", {
        className: `club-dropdown-item ${className}`,
      });
      clubDropdownItem.appendChild(clubDropdownItemTitle);
      clubDropdownItem.appendChild(clubDropdownItemText);
      clubDropdown.appendChild(clubDropdownItem);
    }
  }

  function showClubInfo(element) {
    const clubDropdown = element.getElementsByClassName("club-dropdown")[0];
    let count = parseInt(element.getAttribute("data-count"));
    if (count % 2 === 0) {
      clubDropdown.classList.add("club-dropdown-showing");
    } else {
      clubDropdown.classList.remove("club-dropdown-showing");
    }
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

function showMoreCategories() {
  const isShowing = JSON.parse(seeMoreCategories.getAttribute("data-showing"));
  if (!isShowing) {
    for (let i = 0; i < hiddenCategories.length; i++) {
      const hidden = hiddenCategories.item(i);
      hidden.classList.remove("mobile-hidden");
      seeMoreCategories.innerHTML = "See Less Categories";
    }
  } else {
    for (let i = 0; i < hiddenCategories.length; i++) {
      const hidden = hiddenCategories.item(i);
      hidden.classList.add("mobile-hidden");
      seeMoreCategories.innerHTML = "See More Categories";
    }
  }
  seeMoreCategories.setAttribute("data-showing", JSON.stringify(!isShowing));
}

function openClubs(mode, tagName, oTagName) {
  switch (mode) {
    case "all":
      document.styleSheets[document.styleSheets.length - 1].addRule(
        `.club-div`,
        "display: flex !important"
      );
      document.styleSheets[document.styleSheets.length - 1].addRule(
        ".invisible-club",
        "display: flex !important"
      );
      document.styleSheets[document.styleSheets.length - 1].addRule(
        `#view-all-clubs`,
        "display: none !important"
      );
      applyTag("all");
      break;
    case "tag":
      document.styleSheets[document.styleSheets.length - 1].addRule(
        `.club-div`,
        "display: none !important"
      );
      document.styleSheets[document.styleSheets.length - 1].addRule(
        `.${oTagName}`,
        "display: flex !important"
      );
      document.styleSheets[document.styleSheets.length - 1].addRule(
        `#view-all-clubs`,
        "display: flex !important"
      );
      applyTag(mode, tagName, oTagName);
      document.getElementById("all-clubs").scrollIntoView({
        behavior: "smooth",
      });
  }
}

function openTags() {}

window.addEventListener("load", function () {
  for (var topic of document.querySelectorAll("#categories .topic")) {
    let tagName = topic.querySelector("h3").innerText;
    let oTagName = topic.getAttribute("data-tag-code");
    topic.onclick = function () {
      openClubs("tag", tagName, oTagName);
    };
  }
});

function applyTag(mode, tagName, oTagName) {
  document.querySelector("#sort-area").innerHTML = "";
  switch (mode) {
    case "all":
      document.querySelector("#sort-area").innerHTML += `
      <div class="sort-field">
        <i class="mdi mdi-close sort-field-close"></i>
        <span>All Clubs</span>
      </div>`;
      // document.querySelector("#sort-area").querySelector(".sort-field i").onclick = function() {
      //   document.styleSheets[document.styleSheets.length - 1].addRule(".invisible-club", "display: none !important");
      //   document.getElementById("view-all-clubs").style.display = "flex";
      //   clearTags();
      // }
      break;
    case "tag":
      document.querySelector("#sort-area").innerHTML += `
      <div class="sort-field">
        <i class="mdi mdi-close sort-field-close"></i>
        <span>${tagName}</span>
      </div>`;
      // document.querySelector("#sort-area").querySelector(".sort-field i").onclick = function () {
      //   document.styleSheets[document.styleSheets.length - 1].addRule(".invisible-club", "display: none !important");
      //   document.getElementById("view-all-clubs").style.display = "flex";
      //   clearTags();
      // }
      break;
  }
  document
    .querySelector("#sort-area")
    .querySelector(".sort-field i").onclick = function () {
    document.styleSheets[document.styleSheets.length - 1].addRule(
      `.club-div`,
      "display: block !important"
    );
    document.styleSheets[document.styleSheets.length - 1].addRule(
      ".invisible-club",
      "display: none !important"
    );
    document.styleSheets[document.styleSheets.length - 1].addRule(
      `#view-all-clubs`,
      "display: flex !important"
    );
    clearTags();
  };
}

function clearTags() {
  document.querySelector("#sort-area").innerHTML = "";
}

function rotate(element) {
  const i = element.getElementsByTagName("i")[0];
  const count = parseInt(element.getAttribute("data-count"));
  if (count % 2 === 0) {
    i.style.transform = "rotate(-180deg)";
  } else {
    i.style.transform = "none";
  }
  element.setAttribute("data-count", (count + 1).toString());
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
      } else if (counter % 2 == 1) {
        answer[x].style.display = "none";
      }
    }
  }
}
