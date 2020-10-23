import { callGeoApi, callWeatherApi, calculateFlightTime } from './../functions';

// Intent name: flight Intent
export const flight = async (conv: any) => {
  // parse data that is sent to the bot
  console.log(conv.parameters);
  const { departureCity } = conv.parameters;
  const { destinationCity } = conv.parameters;

  // parsing a date if available.
  let dateTime: any = null;
  if (conv.parameters.date) {
    console.log('we have a date!');
    dateTime = new Date(conv.parameters.date);
  }

  // do some slot handeling to make sure we get data
  if (!departureCity && !destinationCity) {
    return conv.add('That sounds just swell! Where are we and whats the destinaton?');
  }

  if (!departureCity) {
    return conv.add(`Ohh i always wanted to visit ${destinationCity}! but before we takeoff can you let me know where we are at?`);
  }

  if (!destinationCity) {
    return conv.add(`So we are now in ${departureCity} but where is this journey going to take us?`);
  }

  // call geo data for both departure and destination
  let departureCityData: any;
  let destinationCityData: any;
  departureCityData = await callGeoApi(departureCity);
  destinationCityData = await callGeoApi(destinationCity);

  // call flight time to calculate flight time and set values for minutes and hours
  const flighttime: number = calculateFlightTime(
    departureCityData.results[0].geometry.location.lat,
    departureCityData.results[0].geometry.location.lng,
    destinationCityData.results[0].geometry.location.lat,
    destinationCityData.results[0].geometry.location.lng,
  );
  const flightMinutes: number = Math.floor((flighttime - Math.floor(flighttime)) * 60);
  const flightHours: number = Math.floor(flighttime);

  // running a if statement to remove empty values and share flight time
  if (flightHours === 0) { conv.add(`Flight time will be ${flightMinutes} minutes.`); } else if (flightMinutes == 0) { conv.add(`Flight time will be ${flightHours} hours.`); } else { conv.add(`Flight time will be ${flightHours} hours and ${flightMinutes} minutes.`); }

  // setting arival time based on flight time.
  const arrivalTime = new Date();
  if (dateTime != null) { // if we have a time given from user we add flight time to that
    console.log(`passed dateTime is: ${dateTime}`);
    arrivalTime.setHours(dateTime.getHours() + flightHours);
    arrivalTime.setMinutes(dateTime.getMinutes() + flightMinutes);
  } else { // if user does not give time we set the arrival time based on leaving now
    arrivalTime.setHours(arrivalTime.getHours() + flightHours);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightMinutes);
  }

  // Sharing arrival time with pilot
  conv.add(`Expected arrival is at ${arrivalTime.getHours()}:${arrivalTime.getMinutes()}`);
  console.log(dateTime);
  console.log(arrivalTime);

  // we will put the weather output here
  let departureOutput;
  let destinationOutput;

  // If a date in the future was not specified for flying we assume departure is now and output back to the user
  if (dateTime == null) {
    departureOutput = await callWeatherApi(departureCityData);
    destinationOutput = await callWeatherApi(destinationCityData, arrivalTime);

    const departureMessage = `At this time in ${departureCityData.results[0].address_components[0].short_name
    } it is ${departureOutput.conditions} with a temperature of ${
      +departureOutput.temp}°C and a windspeed of ${
      departureOutput.windSpeed} knots.`;

    const destinationMessage = `At ${arrivalTime.getHours()}:${arrivalTime.getMinutes()} in ${destinationCityData.results[0].address_components[0].short_name
    } it is ${destinationOutput.conditions} with a temperature of ${
      +destinationOutput.temp}°C and a windspeed of ${
      destinationOutput.windSpeed} knots.`;

    conv.add(departureMessage);
    conv.add(destinationMessage);
  } else {
    departureOutput = await callWeatherApi(departureCityData, dateTime);
    destinationOutput = await callWeatherApi(destinationCityData, arrivalTime);

    const departureMessage = `At ${dateTime.getHours()}:${dateTime.getMinutes()} in ${departureCityData.results[0].address_components[0].short_name
    } it is ${departureOutput.conditions} with a temperature of ${
      +departureOutput.temp}°C and a windspeed of ${
      departureOutput.windSpeed} knots.`;

    const destinationMessage = `At ${arrivalTime.getHours()}:${arrivalTime.getMinutes()} in${destinationCityData.results[0].address_components[0].short_name
    } it is ${destinationOutput.conditions} with a temperature of ${
      +destinationOutput.temp}°C and a windspeed of ${
      destinationOutput.windSpeed} knots.`;

    conv.add(departureMessage);
    conv.add(destinationMessage);
  }
};

export default flight;