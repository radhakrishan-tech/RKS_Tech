export default function WeatherBanner({ seasonTheme }) {
  if (!seasonTheme) return null;

  return (
    <section className={`weather-banner ${seasonTheme.palette}`}>
      <div>
        <span className="chip">{seasonTheme.season.toUpperCase()}</span>
        <h2>{seasonTheme.banner}</h2>
        <p>Hari bhari vibes with fast shopping for your daily essentials.</p>
      </div>
      <div className="orb" />
    </section>
  );
}
