/* eslint-disable indent */
function club(sheetsOb) {
  var categories = {};

  var clubs = {};

  sheetsOb[0].forEach(function (category, index) {
    categories[`${index}`] = category;
  });

  for (var club of sheetsOb.slice(1)) {
    var clubOb = {};

    club.forEach(function (value, index) {
      clubOb[categories[`${index}`]] = value;
    });

    clubs[clubOb["What is the name of your club?"]] = clubOb;
  }

  return clubs;
}

module.exports = club;
