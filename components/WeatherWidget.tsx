export default function WeatherWidget() {
  return (
    <div
      className="bg-neutral-900 text-neutral-100 text-xs py-1.5 px-4"
      data-default-content="weather"
    >
      <div className="max-w-6xl mx-auto flex justify-between">
        <span>Weather and air quality for your region appear here.</span>
        <span className="text-neutral-400">
          Personalized by location · Adobe Target XT
        </span>
      </div>
    </div>
  );
}
