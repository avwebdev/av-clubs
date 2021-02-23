/* eslint-disable indent */
function club(sheetsOb) {
  const categories = {};

  const clubs = {};

  sheetsOb[0].forEach(function (category, index) {
    categories[`${index}`] = category;
  });

  for (const club of sheetsOb.slice(1)) {
    const clubOb = {};

    club.forEach(function (value, index) {
      clubOb[categories[`${index}`]] = value;
    });

    clubs[clubOb["What is the name of your club?"]] = clubOb;
  }

  return clubs;
}

module.exports = club;
