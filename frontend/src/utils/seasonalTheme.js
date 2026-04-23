export function getSeasonFromMonth(month) {
  if (month >= 2 && month <= 4) return "summer";
  if (month >= 5 && month <= 8) return "monsoon";
  if (month >= 9 && month <= 10) return "autumn";
  return "winter";
}

export function getTimeOfDay(hour) {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getSeasonalProfile(date = new Date()) {
  const month = date.getMonth();
  const hour = date.getHours();

  return {
    season: getSeasonFromMonth(month),
    timeOfDay: getTimeOfDay(hour),
  };
}
