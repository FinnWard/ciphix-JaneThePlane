// file created to group the functions called in the program

// litte object to store weather data
export interface Forecast{
  temp: number;
  windSpeed: number;
  conditions: string;
}

/*  Calculate flight time works with Lattitude and longtitude of 2 coordinates
    provided in decimal format eg.:52.379189, -4.899431. Some smart people provdided
    distance calculations and how to estimate flight time based off of that distance.
    Due to the weatherdata only being available Hourly in my API
    we dont need 100% flight time accuracy flighttime is returned as a number of hours.
*/
export function calculateFlightTime(
  departureLat: number,
  departureLon: number,
  destinationLat: number,
  destinationLon: number,
): number {
  // below calculation for flight distance provided by: https://www.movable-type.co.uk/scripts/latlong.html
  const R = 6371e3; // metres
  const φ1 = (departureLat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (destinationLat * Math.PI) / 180;
  const Δφ = ((destinationLat - departureLat) * Math.PI) / 180;
  const Δλ = ((destinationLon - departureLon) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
            + Math.cos(φ1) * Math.cos(φ2)
            * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const flightDistance = R * c; // in metres
  // we calculate the flight time with a rough estimation calculation 30 min plus 1 hour per every 500 miles. calculation provided by https://openflights.org/faq
  const flightTime = 0.5 + (flightDistance / (500 * 1609.34));
  return flightTime;
}

// manage slot handeling for destination and departure cities.
// provide city name strings and it will return a appropriate response to send to the user
export function slotHandleFlightParam(departureCity: string, destinationCity: string): string {
  // do some slot handeling to make sure we get data
  if (!departureCity && !destinationCity) {
    return ('That sounds just swell! Where are we and whats the destinaton?');
  }

  if (!departureCity) {
    return (`Ohh i always wanted to visit ${destinationCity}! 
      but before we takeoff can you let me know where we are at?`);
  }

  if (!destinationCity) {
    return (`So we are now in ${departureCity} but where is this journey going to take us?`);
  }
  return '';
}

// very simple converging of airport or city input to return single city name
export function setCity(geoCity: string, airport: string): string {
  let city;
  if (geoCity) {
    city = geoCity;
  } else {
    city = airport;
  }
  return city;
}

// if a date or time is provided add together and hand back as DateType
export function setDateTime(date: string, time?: string): Date | undefined {
  let returnDate: Date | undefined;
  const tempDate = new Date();
  if (date) {
    tempDate.setDate(new Date(date).getDate());
    tempDate.setMonth(new Date(date).getMonth());
    tempDate.setFullYear(new Date(date).getFullYear());
    returnDate = tempDate;
  }
  if (time) {
    tempDate.setHours(new Date(time).getHours());
    tempDate.setMinutes(new Date(time).getMinutes());
    returnDate = tempDate;
  }
  return returnDate;
}

// create a output message based on flight hours and minutes
export function addFlightTimeOutput(flightHours: number, flightMinutes: number): string {
  // changing for 5 past 6 is printed as 06:05 instead of 6:5
  const printFlightHours = (`0${flightHours}`).slice(-2);
  const printFlightMinutes = (`0${flightMinutes}`).slice(-2);
  if (flightHours === 0) {
    return (`Flight time will be ${printFlightMinutes} minutes.`);
  } if (flightMinutes === 0) {
    return (`Flight time will be ${printFlightHours} hours.`);
  }
  return (`Flight time will be ${printFlightHours} hours and ${printFlightMinutes} minutes.`);
}

// departure time + flight time = arrival time.
// if no departure time is given we assume they are departing now
// we return the arrival time as a Date type
export function setArrivalTime(flightHours: number, flightMinutes: number, dateTime?: Date): Date {
  console.log(`datetime set at: ${dateTime}`);
  console.log(`flight hours: ${flightHours}`);
  console.log(`flight minutes: ${flightMinutes}`);
  const arrivalTime = new Date();
  if (dateTime) { // if we have a time given from user we add flight time to that
    arrivalTime.setTime(dateTime.getTime());
    arrivalTime.setHours(dateTime.getHours() + flightHours);
    arrivalTime.setMinutes(dateTime.getMinutes() + flightMinutes);
  } else { // if user does not give time we set the arrival time based on leaving now
    arrivalTime.setHours(arrivalTime.getHours() + flightHours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightMinutes);
  }
  console.log(`arrival time set at: ${arrivalTime}`);
  return arrivalTime;
}

// now that we have the closest timestamp to the ask lets find the index.
// we will first check the hourly dataset
export function parseWeatherData(response: any, closestDate: number):Forecast {
  let indexClosestDate: number = -1;
  let hourlyDaily: string = 'hourly';
  let temp: number;
  console.log(`Weather data: ${response}`);
  console.log(`1 date: ${closestDate}`);
  console.log(`1 index: ${indexClosestDate}`);
  indexClosestDate = response.data.hourly.map((e: { dt: any; }) => e.dt).indexOf(closestDate);
  if (indexClosestDate === -1) {
    console.log(`4 index: ${indexClosestDate}`);
    indexClosestDate = response.data.daily.map((e: { dt: any; }) => e.dt).indexOf(closestDate);
    console.log(`5 index: ${indexClosestDate} & ${response.data.daily[indexClosestDate].dt}`);
    hourlyDaily = 'daily';
    temp = response.data[hourlyDaily][indexClosestDate].temp.day;
  } else {
    console.log(`2 index: ${indexClosestDate}`);
    temp = response.data[hourlyDaily][indexClosestDate].temp;
    console.log(`3 index: ${indexClosestDate} & ${response.data.hourly[indexClosestDate].dt}`);
    console.log(`temp obj: ${temp}`);
  }

  // if the index is still NULL the closest date will be in the days
  const windSpeed: number = response.data[hourlyDaily][indexClosestDate].wind_speed;
  const conditions: string = response.data[hourlyDaily][indexClosestDate].weather[0].description;
  const forecast = {
    temp,
    windSpeed,
    conditions,
  };
  return forecast;
}

export function findClosestWeatherData(response:any, dateTime: Date): number {
  // defining a unix datetime for comparison
  const unixDateTime: number = Number((dateTime.getTime() / 1000).toFixed(0));
  console.log(`requqested unix time: ${unixDateTime}`);
  console.log(`requqested time: ${dateTime}`);
  let closestDate = 0; // we will store the closest date here as we iterate

  // as we have hourly and daily date we will need to loop twice.
  for (let i = 0; i < response.data.hourly.length; i += 1) {
    if (Math.abs(unixDateTime - response.data.hourly[i].dt)
    < Math.abs(unixDateTime - closestDate)) {
      closestDate = response.data.hourly[i].dt;
      console.log(`hourly: ${closestDate}`);
    }
  }
  for (let i = 0; i < response.data.daily.length; i += 1) {
    if (Math.abs(unixDateTime - response.data.daily[i].dt)
    < Math.abs(unixDateTime - closestDate)) {
      closestDate = response.data.daily[i].dt;
      console.log(`daily: ${closestDate}`);
    }
  }
  return closestDate;
}

// draft output message based on weather and city information provided from API's.
// if a date is included we will mention it.
export function addWeatherMessag(cityData: Forecast, cityName: string, dateTime?: Date): string {
  // slice the string so it prints single digets nicly
  const printFlightHours = (`0${dateTime?.getHours()}`).slice(-2);
  const printFlightMinutes = (`0${dateTime?.getMinutes()}`).slice(-2);

  if (dateTime) {
    return (`At ${printFlightHours}:${printFlightMinutes} in ${cityName} 
    it is ${cityData.conditions} with a temperature of 
    ${cityData.temp}°C and a windspeed of 
    ${cityData.windSpeed} knots.`);
  }

  return (`At this time in ${cityName
  } it is ${cityData.conditions} with a temperature of ${
    +cityData.temp}°C and a windspeed of ${
    cityData.windSpeed} knots.`);
}

export function helpCase(): string {
  return `I can help you with the weather forecast or with weather details for your flight!
  for weather information plase provide me with a location and optionally a day while mentioning "weather",
  for flight information please provide me with  departure city/airport ann arrival city/airport and optionally the departure day & time while mentioning "flight"
  I hope this helps!`;
}

export function jokeCase(): string {
  const jokes: Array<string> = [
    'I dont know man, go look over at reddit.com/r/Jokes',
    'What do you call dangerous precipitation? A rain of terror!',
    'How do you prevent a Summer cold? Catch it in the Winter!',
    'What does daylight saving time mean in the netherlands? An extra hour of rain!',
    'Yesterday I saw a guy spill all his Scrabble letters on the road.I asked him, “What’s the word on the street?',
    'What do you call a wet bear? A drizzly bear!',
    'The real joke is that you are asking a weatherbot to be funny!',
  ];

  return jokes[Math.floor(Math.random() * jokes.length)];
}

export function hobbiesCase(): string {
  return 'Well i spend most of my time staring at clouds. yesterday i managed to spot a Lenticularis! do you have a favorite cloud?';
}

export function filmCase(): string {
  return 'I honestly just bingewatch tornado on repeat when im not working lol. whats your favorite movie?';
}
export function foodCase(): string {
  return 'If i could eat i would want to try cotton candy! It looks like a tasty cloud :D';
}

export function musicCase(): string {
  return 'have you heard of Typhoon? they are so hot right now!';
}

export function meCase(): string {
  return `ohh! Silly old me? Well i mostly keep track of planes and the weather! 
  Not much more to say... Ohh and i consist of hundreds of thousands of bits of electriciy turning on and off! 
  Pretty cool if you ask me!`;
}
