
import axios from 'axios';
import { openweathermapApiKey, geocodeApiKey } from './config'

// grouping used functions for intents to access indevidually without creating interdependancies
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

/*  CallWeatherAPI outputs weather data based on location and time. if you provide a empty date vaiable it will output current weather at location
*
*
*
*/

interface Forecast{
    temp: number;
    windSpeed: number;
    conditions: string;
}

export function callWeatherApi(cityData: any, dateTime?: Date) {

  return new Promise<Forecast>((resolve, reject) => {
    const params = {
      lat: cityData.results[0].geometry.location.lat,
      lon: cityData.results[0].geometry.location.lng,
      appid: openweathermapApiKey.get('apiKey'),
      units: 'metric',
    };
    console.log(`lat: ${params.lat} lng: ${params.lon}`);

    axios.get(openweathermapApiKey.get('host'), { params })
      .then((response: { data: any; }) => {
        console.log(`the time given was:${dateTime}`);
        // checking if we have also recieved a timestamp.
        if (dateTime != undefined) {
          // defining a unix datetime for comparison
          let unixDateTime : any;
          unixDateTime = (dateTime.getTime() / 1000).toFixed(0);
          let closestDate = 0; // we will store the closest date here as we iterate
          for (var i = 0; i < response.data.hourly.length; i++) { // as we have hourly and daily date we will need to loop twice.
            if (Math.abs(unixDateTime - response.data.hourly[i].dt) < Math.abs(unixDateTime - closestDate)) {
              closestDate = response.data.hourly[i].dt;
            }
            console.log(`Hourly check for closest date: ${closestDate}`);
          }
          for (var i = 0; i < response.data.daily.length; i++) {
            if (Math.abs(unixDateTime - response.data.daily[i].dt) < Math.abs(unixDateTime - closestDate)) {
              closestDate = response.data.daily[i].dt;
            }
            console.log(`Daily check for closest date: ${closestDate}`);
          }

          // now that we have the closest timestamp to the ask lets find the index. we will first check the hourly dataset
          let indexClosestDate: number = -1;
          let hourlyDaily: string = 'hourly';
          console.log(indexClosestDate);
          indexClosestDate = response.data.hourly.map((e: { dt: any; }) => e.dt).indexOf(closestDate);
          let { temp } = response.data[hourlyDaily][indexClosestDate]; // need to diclare this before as the format changes with hourly/daily
          console.log(indexClosestDate + hourlyDaily);

          // if the index is still NULL the closest date will be in the days
          if (indexClosestDate == -1) {
            console.log('Looking for daily');
            indexClosestDate = response.data.daily.map((e: { dt: any; }) => e.dt).indexOf(closestDate);
            hourlyDaily = 'daily';
            temp = response.data[hourlyDaily][indexClosestDate].temp.day;
          }
          console.log(indexClosestDate + hourlyDaily);
          console.log(temp);

          // now we know where the data is in the dataset we can start filling out our responses
          const windSpeed: number = response.data[hourlyDaily][indexClosestDate].wind_speed;
          const conditions: string = response.data[hourlyDaily][indexClosestDate].weather[0].description;

          const forecast = {
            temp,
            windSpeed,
            conditions,
          };

          // Resolve the promise with the output text
          console.log(forecast);
          console.log('Im done grabbing weather data!');
          resolve(forecast);
        } else { // if no datetime was provided we respond with current weather
          const { temp } = response.data.current;
          const windSpeed: number = response.data.current.wind_speed;
          const conditions: string = response.data.current.weather[0].description;

          const forecast = {
            temp,
            windSpeed,
            conditions,
          };

          // Resolve the promise with the output text
          console.log(forecast);
          console.log('Im done grabbing weather data!');
          resolve(forecast);
        }
      }).catch((error: any) => {
        console.log(`Error calling the weather API: ${error}`);
        reject();
      });
  });
}

// a function that provides Geodata on a city string you provide
export function callGeoApi(city: string) {

  console.log('Im grabbing geo data!');
  return new Promise<any>((resolve, reject) => {
    const params = {
      key: geocodeApiKey.get('apiKey'),
      address: city,
    };
    axios.get(geocodeApiKey.get('host'), { params })
      .then((response: { data: any; }) => {
        if (response.data['status'] == 'ZERO_RESULTS') {
          resolve(`Ohh! I dident manage to find ${city}`);
        }
        console.log(response.data);
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
  });
}
