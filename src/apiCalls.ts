import axios from 'axios';
import { openweathermapApiKey, geocodeApiKey } from './config';
import { Forecast } from './utilities';

// grouping used API calls for intents to access indevidually without creating interdependancies

/*  CallWeatherAPI outputs weather data based on location and time.
*   If you provide a empty date vaiable it will output current weather at location
*
*
*/

export function callWeatherApi(cityData: any, dateTime?: Date) {
  return new Promise<Forecast>((resolve, reject) => {
    const params = {
      lat: cityData.results[0].geometry.location.lat,
      lon: cityData.results[0].geometry.location.lng,
      appid: openweathermapApiKey.get('apiKey'),
      units: 'metric',
    };

    axios.get(openweathermapApiKey.get('host'), { params })
      .then((response: { data: any; }) => {
        // checking if we have also recieved a timestamp.
        if (dateTime !== undefined) {
          // defining a unix datetime for comparison
          const unixDateTime: any = (dateTime.getTime() / 1000).toFixed(0);
          let closestDate = 0; // we will store the closest date here as we iterate

          // as we have hourly and daily date we will need to loop twice.
          for (let i = 0; i < response.data.hourly.length; i += 1) {
            if (Math.abs(unixDateTime - response.data.hourly[i].dt) < Math.abs(unixDateTime - closestDate)) {
              closestDate = response.data.hourly[i].dt;
            }
          }
          for (let i = 0; i < response.data.daily.length; i += 1) {
            if (Math.abs(unixDateTime - response.data.daily[i].dt) < Math.abs(unixDateTime - closestDate)) {
              closestDate = response.data.daily[i].dt;
            }
          }

          // now that we have the closest timestamp to the ask lets find the index.
          // we will first check the hourly dataset
          let indexClosestDate: number = -1;
          let hourlyDaily: string = 'hourly';
          indexClosestDate = response.data.hourly.map((e: { dt: any; }) => e.dt).indexOf(closestDate);
          let { temp } = response.data[hourlyDaily][indexClosestDate];

          // if the index is still NULL the closest date will be in the days
          if (indexClosestDate === -1) {
            indexClosestDate = response.data.daily.map((e: { dt: any; }) => e.dt).indexOf(closestDate);
            hourlyDaily = 'daily';
            temp = response.data[hourlyDaily][indexClosestDate].temp.day;
          }

          // now we know where the data is in the dataset we can start filling out our responses
          const windSpeed: number = response.data[hourlyDaily][indexClosestDate].wind_speed;
          const conditions: string = response.data[hourlyDaily][indexClosestDate].weather[0].description;

          const forecast = {
            temp,
            windSpeed,
            conditions,
          };

          // Resolve the promise with the output text
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
          resolve(forecast);
        }
      }).catch((error: any) => {
        reject(error);
      });
  });
}

// a function that provides Geodata on a city string you provide
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
