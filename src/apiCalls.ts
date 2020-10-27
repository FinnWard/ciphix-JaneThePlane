import axios from 'axios';
import { openweathermapApiKey, geocodeApiKey } from './config';
import { Forecast, parseWeatherData, findClosestWeatherData } from './utilities';

// grouping used API calls for intents to access indevidually without creating interdependancies

/*  CallWeatherAPI outputs weather data based on location and time.
*   If you provide a empty date vaiable it will output current weather at location
*/

export function callWeatherApi(cityData: any, dateTime?: Date) {
  return new Promise<Forecast>((resolve, reject) => {
    const params = {
      lat: cityData.results[0].geometry.location.lat,
      lon: cityData.results[0].geometry.location.lng,
      appid: openweathermapApiKey.get('apiKey'),
      units: 'metric',
    };
    console.log(`grabbing weather data for: ${cityData.results[0].address_components[0].short_name}`);
    axios.get(openweathermapApiKey.get('host'), { params })
      .then((response: { data: any; }) => {
        // checking if we have also recieved a timestamp.
        if (dateTime !== undefined) {
          const closestDate = findClosestWeatherData(response, dateTime);
          resolve(parseWeatherData(response, closestDate));
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
          resolve(forecast);
        }
      }).catch((error: any) => {
        reject(error);
      });
  });
}

// a function that returns a JSON of Geodata on a city string you provide
export function callGeoApi(city: string) {
  return new Promise<any>((resolve, reject) => {
    const params = {
      key: geocodeApiKey.get('apiKey'),
      address: city,
    };
    axios.get(geocodeApiKey.get('host'), { params })
      .then((response: { data: any; }) => {
        if (response.data.status === 'ZERO_RESULTS') {
          resolve(`Ohh! I dident manage to find ${city}`);
        }
        resolve(response.data);
      }).catch((error: any) => {
        reject(error);
      });
  });
}
