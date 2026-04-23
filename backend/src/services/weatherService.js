function getSeasonTheme() {
  const month = new Date().getMonth() + 1;
  const isSummer = month >= 4 && month <= 8;

  if (isSummer) {
    return {
      season: "summer",
      banner: "Stay Cool Collection",
      palette: "fresh-green",
      highlightTags: ["cotton", "summer", "towel"],
    };
  }

  return {
    season: "regular",
    banner: "Daily Comfort Picks",
    palette: "studio-classic",
    highlightTags: ["everyday", "bestseller"],
  };
}

module.exports = { getSeasonTheme };
