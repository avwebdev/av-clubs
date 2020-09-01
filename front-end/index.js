const clubsDiv = document.getElementById("all-clubs");
const searchInput = document.getElementById("search-input");
const clubSuggestions = document.getElementById("club-suggestions");

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
    console.log(`club-div-${name}`);
    const clubDiv = createElement("div", { className: "club-div", id: `club-div-${name}` });
    const clubTitle = createElement("h1", {
      className: "club-title",
      innerText: name
    });
    clubDiv.appendChild(clubTitle);
    const i = createElement("i", { className: "mdi mdi-arrow-down-drop-circle-outline" })
    clubDiv.appendChild(i);
    return clubDiv;
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
