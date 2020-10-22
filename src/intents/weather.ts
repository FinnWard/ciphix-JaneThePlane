import {callGeoApi, callWeatherApi} from './../functions';

// Intent name: Huidig weer
export const weather = (conv: any) => {
    console.log(conv.parameters);
    //required paramater to get weather info
    let city = conv.parameters['geo-city'];
    if (!city){
        return conv.add('The digital sun is shining over here! But where are you at now?')
    }

    //parsing a date if available.
    let dateTime: any = null;
    console.log(dateTime);
    if (conv.parameters['date']) {
        dateTime = new Date(conv.parameters['date']);
    }
    console.log(dateTime);  
    //getting further data on the city eg lattitude & longtitude
    console.log('Im amout to grab geo data!')
    return callGeoApi(city).then((cityOutput) => {
        let cityData = cityOutput;
  
        if(dateTime == null){
            console.log('Im amout to grab weather data without a date!')
            return callWeatherApi(cityData).then((forecast) => {
                let output = `At this time in ${cityData['results'][0]['address_components'][0]['short_name']} 
                it is ${forecast.conditions} with a temperature of
                ${forecast.temp}°C and a windspeed of
                ${forecast.windSpeed} knots.`;
                conv.add(output); // Return the results of the weather API to Dialogflow
            }).catch(() => conv.add(`Darn! i cant seem to find the weather, would you mind taking a peek out of the window?`));
        }
        else{
            console.log('Im amout to grab weather data with a date!')
            return callWeatherApi(cityData,dateTime).then((forecast) => {
                // Create response 

                let output = `At this time in ${cityData['results'][0]['address_components'][0]['short_name']} 
                it is ${forecast.conditions} with a temperature of
                ${forecast.temp}°C and a windspeed of
                ${forecast.windSpeed} knots.`;

                conv.add(output); // Return the results of the weather API to Dialogflow
            }).catch(() => conv.add(`Darn! i cant seem to find the weather, would you mind taking a peek out of the window?`));
        }
        
    }).catch(() => conv.add(`Darn! Sounds like a swell place but i dont recognise it! Is this a city?`));
    
}