import {callGeoApi, callWeatherApi, calculateFlightTime} from './../functions';

// Intent name: vlucht Intent
export const vlucht = (conv: any) => {
    console.log(conv.parameters);
    
    let departureCity = conv.parameters['departureCity'];
    if (!departureCity){
        return conv.add('Waar vlieg je vandaan?')
    }
    let destinationCity = conv.parameters['destinationCity'];
    if (!destinationCity){
        return conv.add('Ahh leuk dat je van ' + departureCity + ' vertrekt maar waar vlieg je heen?')
    }
    return calculateFlightTime(departureCity,destinationCity).then((output) => {
        let flightMinutes: number = Math.floor((output - Math.floor(output))*60);
        let flightHours = Math.floor(output);

        //running a if statement to remove empty values
        if(flightHours == 0){conv.add('wist je dat je dan ' + flightMinutes + ' minuten onderweg bent?');}
        else if(flightMinutes == 0){conv.add('wist je dat je dan ' + flightHours + ' uur onderweg bent?');}
        else{conv.add('wist je dat je dan ' + flightHours + ' uur en '+ flightMinutes + ' minuten onderweg bent?');}
    }).catch(() => conv.add(`Oei! Ik kan het weer niet vinden maar ik hoop dat het zonnig is!`));
}