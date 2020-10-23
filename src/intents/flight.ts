import { callGeoApi, callWeatherApi } from '../apiCalls';
import {
  calculateFlightTime,
  setCity,
  slotHandleFlightParam,
  setDateTime,
  addFlightTimeOutput,
  setArrivalTime,
  addWeatherMessag,
  Forecast,
} from '../utilities';

// Intent name: flight Intent
export const flight = async (conv: any) => {
  console.log(conv.parameters);

  // parsing a date & time if available.
  const dateTime = setDateTime(conv.parameters.date, conv.parameters.time);

  const departureCity = setCity(
    conv.parameters.departureCity,
    conv.parameters.departureAirport.city,

  );
  const destinationCity = setCity(
    conv.parameters.destinationCity,
    conv.parameters.destinationAirport.city,
  );

  const slotQuery = slotHandleFlightParam(departureCity, destinationCity);
  if (slotQuery) {
    return conv.add(slotQuery);
  }

  // call geo data for both departure and destination
  let departureCityData: any;
  let destinationCityData: any;

  departureCityData = await callGeoApi(departureCity).catch(console.error);
  destinationCityData = await callGeoApi(destinationCity).catch(console.error);


  // call flight time to calculate flight time and set values for minutes and hours
  const flighttime: number = calculateFlightTime(
    departureCityData.results[0].geometry.location.lat,
    departureCityData.results[0].geometry.location.lng,
    destinationCityData.results[0].geometry.location.lat,
    destinationCityData.results[0].geometry.location.lng,
  );
  const flightMinutes: number = Math.floor((flighttime - Math.floor(flighttime)) * 60);
  const flightHours: number = Math.floor(flighttime);

  // setting arival time based on flight time.
  const arrivalTime = new Date(setArrivalTime(flightHours, flightMinutes, dateTime));

  // outputting flighttime
  conv.add(addFlightTimeOutput(flightHours, flightMinutes));

  // Sharing arrival time with pilot
  conv.add(`Expected arrival is at ${arrivalTime.getHours()}:${arrivalTime.getMinutes()}`);
  console.log(dateTime);
  console.log(arrivalTime);

  // we will put the weather output here
  let departureOutput: Forecast;
  let destinationOutput: Forecast;

  // call weatherAPI for both departure and destination
  departureOutput = await callWeatherApi(departureCityData, dateTime);
  destinationOutput = await callWeatherApi(destinationCityData, arrivalTime);

  // hand parameters off to a handeler to draft output
  conv.add(addWeatherMessag(
    departureOutput, 
    departureCityData.results[0].address_components[0].short_name, 
    dateTime
    ));
  conv.add(addWeatherMessag(
    destinationOutput, 
    destinationCityData.results[0].address_components[0].short_name, 
    arrivalTime
    ));
};

export default flight;
