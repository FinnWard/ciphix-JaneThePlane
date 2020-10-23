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
) {
  // below calculation for flight distance provided by: https://www.movable-type.co.uk/scripts/latlong.html
  const R = 6371e3; // metres
  const φ1 = departureLat * Math.PI / 180; // φ, λ in radians
  const φ2 = destinationLat * Math.PI / 180;
  const Δφ = (destinationLat - departureLat) * Math.PI / 180;
  const Δλ = (destinationLon - departureLon) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
            + Math.cos(φ1) * Math.cos(φ2)
            * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const flightDistance = R * c; // in metres
  console.log(`distance: ${flightDistance}`);
  // we calculate the flight time with a rough estimation calculation 30 min plus 1 hour per every 500 miles. calculation provided by https://openflights.org/faq
  const flightTime = 0.5 + (flightDistance / (500 * 1609.34));
  console.log(`time: ${flightTime}`);
  console.log(`Hours: ${Math.floor(flightTime)}`);
  console.log(`Minutes: ${Math.floor((flightTime - Math.floor(flightTime)) * 60)}`);
  return flightTime;
}

// return a prompt for the user if either destination or departure is not provided
export function slotHandleFlightParam(departureCity: string, destinationCity: string) {
  // do some slot handeling to make sure we get data
  if (!departureCity && !destinationCity) {
    return ('That sounds just swell! Where are we and whats the destinaton?');
  }

  if (!departureCity) {
    return (`Ohh i always wanted to visit ${destinationCity}! but before we takeoff can you let me know where we are at?`);
  }

  if (!destinationCity) {
    return (`So we are now in ${departureCity} but where is this journey going to take us?`);
  }
}

// very simple converging of airport or city input
export function setCity(geoCity: string, airport: string) {
  let city;
  if (geoCity) {
    city = geoCity;
  } else {
    city = airport;
  }

  return city;
}

// if a date or time is provided add together and hand back as DateType
export function setDateTime(date: string, time?: string) {
  let returnDate: Date | undefined;
  const tempDate = new Date();
  console.log(`setDateVal: ${date}`);
  console.log(`setTimeVal: ${time}`);
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
  console.log(`returnDateVal: ${returnDate}`);
  return returnDate;
}

// a few if's to provide cleaner output for flighttime
export function addFlightTimeOutput(flightHours: number, flightMinutes: number) {
  // changing for 5 pas 6 is printed as 06:05 instead of 6:5
  const printFlightHours = (`0${flightHours}`).slice(-2);
  const printFlightMinutes = (`0${flightMinutes}`).slice(-2);
  console.log(`hours:${printFlightHours}`);
  console.log(printFlightMinutes);
  if (flightHours == 0) {
    return (`Flight time will be ${printFlightMinutes} minutes.`);
  } if (flightMinutes === 0) {
    return (`Flight time will be ${printFlightHours} hours.`);
  }

  return (`Flight time will be ${printFlightHours} hours and ${printFlightMinutes} minutes.`);
}

// departure time + flight time = arrival time. if no departure time is given we assume they are flying now
export function setArrivalTime(flightHours: number, flightMinutes: number, dateTime?: Date) {
  const arrivalTime = new Date();
  if (dateTime) { // if we have a time given from user we add flight time to that
    console.log(`passed dateTime is: ${dateTime}`);
    arrivalTime.setHours(dateTime.getHours() + flightHours);
    arrivalTime.setMinutes(dateTime.getMinutes() + flightMinutes);
  } else { // if user does not give time we set the arrival time based on leaving now
    arrivalTime.setHours(arrivalTime.getHours() + flightHours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightMinutes);
  }
  return arrivalTime;
}

// draft output message based on weather and city information provided from API's. if a date is included we will mention it.
export function addWeatherMessag(cityData: Forecast, cityName: string, dateTime?: Date) {
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
