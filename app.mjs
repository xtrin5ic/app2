import fetch from "node-fetch";

// ta vare på lokasjonen som brukeren ønsker vær data i fra
//const place = process.argv[2].trim()


async function getWeatherForecast(place) {

// Bygger opp url til API endepunktet for å søke etter lokasjoner
  const baseURL = "https://www.yr.no/api/v0/";
  const searchLocationUrl = `${baseURL}locations/Search?q=${place}&accuracy=1000&language=nn`;

// Bruker Yr sit api til å søke opp lokasjonen
  const locationData = await fetchData(searchLocationUrl);

// Dersom Yr fant en lokasjon som tilsvarer vårt søk så vil vi ha fått data og parameteren totalResults vill være mer en 0
  if (locationData && locationData.totalResults > 0) {
    const location = locationData._embedded.location[0]; // føreste element er det som anses for "riktigest"
    const townID = location.id; // Vi trenger id fra lokasjon for å kunne gjøre værsøk.

    // Bygger ny URL for å hente værmeldingen for lokasjonen.
    const foreCastUrl = `${baseURL}locations/${townID}/forecast`;
    const vaerData = await fetchData(foreCastUrl);

    // Iterer over dag intervallet for å vise været de neste dagene.
    const vaerMelding = [];

    for (let index = 0; index < vaerData.dayIntervals.length; index++) {
      let output = "🌞";
      let dag = vaerData.dayIntervals[index];
      if (dag.twentyFourHourSymbol === "rain") {
            output = "🌧️";
      } else if (dag.twentyFourHourSymbol.indexOf("cloud") != -1) {
            output = "🌥️";
      }
      vaerMelding.push({
        day: index + 1,
        weather: output
      });
    }

    return {
      place: location.name,
      forecast: vaerMelding
    };
  } else {
    console.log(`Could not find ${place}`);
  }
}

// Verktøys (Utility) funksjon for å kjøre en såring over internet og retunere json data (javascript objekter)
async function fetchData(url) {
  const rawData = await fetch(url);
  return await rawData.json();
}

export { getWeatherForecast };
