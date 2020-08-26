async function getData() {
  const response = await fetch("/getData", {method: "POST"});
  const json = await response.json();
  return json;
}

getData().then((allClubs) => {
  const clubsDiv = document.getElementById("all-clubs");
  const searchBar = document.getElementById("search-bar");
  const clubSuggestions = document.getElementById("club-suggestions");

  searchBar.onchange = searchClubs;
  searchBar.oninput = searchClubs;
  searchBar.onblur = onSearchBlur;
  
  populateClubs(allClubs);

  function searchClubs(e) {
    removeAllChildNodes(clubSuggestions);
    const search = e.target.value.toLowerCase();
    let i = 0;
    for(const name in allClubs) {
      if(name.toLowerCase().includes(search)) {
        if (i < 5) {
          const clubSuggestion = createElement("div", {class: "club-suggestion"});
          const title = createElement("h5", {
            innerText: name
          });
          clubSuggestion.appendChild(title);
          clubSuggestions.appendChild(clubSuggestion);
          i++;
        }
      }
    }
    if(i === 0) {
      const clubSuggestion = createElement("div", {class: "club-suggestion"});
      const title = createElement("h5", {
          innerText: "No Results Found"
      });
      clubSuggestion.appendChild(title);
      clubSuggestions.appendChild(clubSuggestion);
    }
  }
  
  async function populateClubs(clubs) {
    for(const name in clubs) {
      const club = createClubDiv(name, clubs[name]);
      clubsDiv.appendChild(club);
    }
  }

  function createClubDiv(name, club) {
    const clubDiv = createElement("div", {className: "club-div"});
    const clubTitle = createElement("h1", {
      className: "club-title",
      innerText: name
    });
    clubDiv.appendChild(clubTitle);
    return clubDiv;
  }
  
  function createElement(type, attributes) {
    const element = document.createElement(type);
    for(const attrName in attributes) {
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
