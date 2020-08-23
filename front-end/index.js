async function getData() {
  const response = await fetch("/getData", {method: "POST"});
  const json = await response.json();
  return json;
}

getData().then((allClubs) => {
  const clubsDiv = document.getElementById("all-clubs");
  const searchBar = document.getElementById("search-bar");
  searchBar.onchange = searchClubs;
  
  populateClubs(allClubs);
  
  function searchClubs(e) {
    for(const name in allClubs) {
      if(name.includes(e.target.value)) {
        console.log(name);
      }
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
});
