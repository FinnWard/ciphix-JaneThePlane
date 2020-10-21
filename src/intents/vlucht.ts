import {callGeoApi, callWeatherApi, calculateFlightTime} from './../functions';

// Intent name: vlucht Intent
export const vlucht = (conv: any) => {
    console.log(conv.parameters);
    let departureCity = conv.parameters['departureCity'];
    let destinationCity = conv.parameters['destinationCity'];

    if (!departureCity && !destinationCity){
        return conv.add('ohh gezellig! gaan we even lekker vliegen? ik heb er zin in! Waar zijn we nu en waar gaan we heen?')
    } 

    if (!departureCity){
        return conv.add('ahh ik heb altijd naar' + departureCity + ' gewild! Maar voor we op het gas trappen kan je me even vertellen waar we zijn?')
    }
    
    if (!destinationCity){
        return conv.add('Ahh leuk dat je van ' + departureCity + ' vertrekt maar waar vlieg je heen?')
    }

    //parsing a date if available.
    let dateTime: any;
    console.log(dateTime);
    if (conv.parameters['date']) {
        console.log('we have a date!')
        dateTime = new Date(conv.parameters['date']);
    }
    
    callGeoApi(departureCity).then((cityOutput) => {
        let departureCityData: any = cityOutput;
        return callGeoApi(destinationCity).then((cityOutput) => {
            let destinationCityData: any = cityOutput;
            let flighttime = calculateFlightTime(departureCityData['latt'],departureCityData['longt'],destinationCityData['latt'],destinationCityData['longt'])
                let flightMinutes: number = Math.floor((flighttime - Math.floor(flighttime))*60);
                let flightHours = Math.floor(flighttime);
                //running a if statement to remove empty values and share flight time
                if(flightHours == 0){conv.add('wist je dat je dan ' + flightMinutes + ' minuten onderweg bent?');}
                else if(flightMinutes == 0){conv.add('wist je dat je dan ' + flightHours + ' uur onderweg bent?');}
                else{conv.add('wist je dat je dan ' + flightHours + ' uur en '+ flightMinutes + ' minuten onderweg bent?');}
                
                //setting arival time based on flight time. 
                let arrivalTime = new Date()
                arrivalTime.setHours(dateTime.getHours() + flightHours);
                arrivalTime.setMinutes(dateTime.getMinutes() + flightMinutes);

                //Sharing arrival time with pilot
                conv.add('Verwachte aankomst tijd is om ' + arrivalTime.getHours() +':'+arrivalTime.getMinutes());
                console.log(dateTime);
                console.log(arrivalTime);

                return callWeatherApi(departureCityData,dateTime).then((output) => {
                    conv.add(output); // Return the results of the weather API to Dialogflow
                    return callWeatherApi(destinationCityData,arrivalTime).then((output) => {
                        conv.add(output); // Return the results of the weather API to Dialogflow
                    }).catch(() => conv.add(`Oei! Ik kan het weer niet vinden maar ik hoop dat het zonnig is als we landen!`));
                }).catch(() => conv.add(`Oei! Ik kan het weer niet vinden maar ik hoop dat het zonnig is waar we zijn!`));
        }).catch((error: any) => {
        console.log('encountered the following error in calling destinationCity geodata: ' + error);
        });
    }).catch((error: any) => {
    console.log('encountered the following error in calling departureCity geodata: ' + error);
})
}