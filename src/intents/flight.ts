import {callGeoApi, callWeatherApi, calculateFlightTime} from '../functions';

// Intent name: flight Intent
export const flight = (conv: any) => {
    console.log(conv.parameters);
    let departureCity = conv.parameters['departureCity'];
    let destinationCity = conv.parameters['destinationCity'];

    //do some slot handeling to make sure we get data
    if (!departureCity && !destinationCity){
        return conv.add('That sounds just swell! Whereabouts are we and whats the destinaton partner?')
    } 

    if (!departureCity){
        return conv.add('Ohh i always wanted to take a gander at ' + departureCity + '! but before we takeoff can you let me know where we are at?')
    }
    
    if (!destinationCity){
        return conv.add('So we are now in ' + departureCity + ' but where is this journey going to take us?')
    }

    //parsing a date if available.
    let dateTime: any = null;
    console.log(dateTime);
    if (conv.parameters['date']) {
        console.log('we have a date!')
        dateTime = conv.parameters['date'];
    }
    //call geo data for both departure and destination
    callGeoApi(departureCity).then((cityOutput) => {
        let departureCityData: any = cityOutput;
        return callGeoApi(destinationCity).then((cityOutput) => {
            let destinationCityData: any = cityOutput;

            //call flight time to calculate flight time and set values for minutes and hours
            let flighttime: number = calculateFlightTime(departureCityData['latt'],departureCityData['longt'],destinationCityData['latt'],destinationCityData['longt'])
                let flightMinutes: number = Math.floor((flighttime - Math.floor(flighttime))*60);
                let flightHours: number = Math.floor(flighttime);

                //running a if statement to remove empty values and share flight time
                if(flightHours == 0){conv.add('Flight time will be ' + flightMinutes + ' minutes.');}
                else if(flightMinutes == 0){conv.add('Flight time will be ' + flightHours + ' hours.');}
                else{conv.add('Flight time will be ' + flightHours + ' hours and '+ flightMinutes + ' minutes.');}
                
                //setting arival time based on flight time.
                let arrivalTime = new Date()
                if(!(dateTime == null)){//if we have a time given from user we add flight time to that
                    arrivalTime.setHours(dateTime.getHours() + flightHours);
                    arrivalTime.setMinutes(dateTime.getMinutes() + flightMinutes);
                }
                else{//if user does not give time we set the arrival time based on leaving now
                    arrivalTime.setHours(arrivalTime.getHours() + flightHours);
                    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightMinutes);
                } 
                


                //Sharing arrival time with pilot
                conv.add('Expected arrival is at ' + arrivalTime.getHours() +':'+arrivalTime.getMinutes());
                console.log(dateTime);
                console.log(arrivalTime);
                
                if(dateTime == null){
                    return callWeatherApi(departureCityData).then((output) => {
                        conv.add(output); // Return the results of the weather API to Dialogflow
                        return callWeatherApi(destinationCityData,arrivalTime).then((output) => {
                            conv.add(output); // Return the results of the weather API to Dialogflow
                        }).catch(() => conv.add(`Darn! i cant seem to find the weather, why dont you just tell the passengers it will be 24°C and sunny ;)?`));
                    }).catch(() => conv.add(`Darn! i cant seem to find the weather, would you mind taking a peek out of the window?`));
                }
                else{
                    return callWeatherApi(departureCityData,dateTime).then((output) => {
                        conv.add(output); // Return the results of the weather API to Dialogflow
                        return callWeatherApi(destinationCityData,arrivalTime).then((output) => {
                            conv.add(output); // Return the results of the weather API to Dialogflow
                        }).catch(() => conv.add(`Darn! i cant seem to find the weather, why dont you just tell the passengers it will be 24°C and sunny ;)?`));
                    }).catch(() => conv.add(`Darn! i cant seem to find the weather, would you mind taking a peek out of the window?`));
                }
                
        }).catch((error: any) => {
        console.log('encountered the following error in calling destinationCity geodata: ' + error);
        });
    }).catch((error: any) => {
    console.log('encountered the following error in calling departureCity geodata: ' + error);
})
}