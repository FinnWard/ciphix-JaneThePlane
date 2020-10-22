//grouping used functions for intents to access indevidually without creating interdependancies
import axios from 'axios';


/*  Calculate flight time works with Lattitude and longtitude of 2 coordinates provided in decimal format eg.:52.379189, -4.899431
*   Some smart people provdided distance calculations and how to estimate flight time based off of that distance.
*   Due to the weatherdata only being available Hourly in my API we dont need 100% flight time accuracy
*   flighttime is returned as a number of hours. 
*/

export function calculateFlightTime(departureLat: number,departureLon: number, destinationLat: number, destinationLon: number){

    //below calculation for flight distance provided by: https://www.movable-type.co.uk/scripts/latlong.html
    let R = 6371e3; // metres
    let φ1 = departureLat * Math.PI/180; // φ, λ in radians
    let φ2 = destinationLat * Math.PI/180;
    let Δφ = (destinationLat-departureLat) * Math.PI/180;
    let Δλ = (destinationLon-departureLon) * Math.PI/180;

    let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    let flightDistance = R * c; // in metres
    console.log('distance: '+ flightDistance);
    // we calculate the flight time with a rough estimation calculation 30 min plus 1 hour per every 500 miles. calculation provided by https://openflights.org/faq 
    let flightTime = 0.5 + (flightDistance/(500*1609.34));
    console.log('time: ' + flightTime);
    console.log('Hours: ' + Math.floor(flightTime));
    console.log('Minutes: '+ Math.floor((flightTime - Math.floor(flightTime))*60));
    return flightTime;
}

/*  CallWeatherAPI outputs weather data based on location and time. if you provide a empty date vaiable it will output current weather at location
*   
*   
*   
*/

export function callWeatherApi(cityData: any,dateTime?: Date) {
    
    interface forecast{
        temp: number;
        windSpeed: number;
        conditions: string;
    } 

    //Setting the API data:
    const openweathermap = new Map();
    openweathermap.set('host', 'https://api.openweathermap.org/data/2.5/onecall')
    openweathermap.set('apiKey', '483ddfa2413a8028b5b145c7c93c2775')

    console.log('Im grabbing weather data!')
    console.log(dateTime)
    
    return new Promise<forecast>((resolve, reject) => {
        const params = {
            lat: cityData['results'][0]['geometry']['location']['lat'],
            lon: cityData['results'][0]['geometry']['location']['lng'],
            appid: openweathermap.get('apiKey'),
            units: 'metric'
        };
        console.log('lat: '+ params.lat + ' lng: '+ params.lon)

        axios.get(openweathermap.get('host'), { params })
            .then((response: { data: any; }) => {
                
                console.log("the time given was:" + dateTime)
                //checking if we have also recieved a timestamp. 
                if(dateTime != undefined){
                    //defining a unix datetime for comparison
                    let unixDateTime : any;
                    unixDateTime = (dateTime.getTime() / 1000).toFixed(0);
                    let closestDate = 0; // we will store the closest date here as we iterate
                    for (var i =0; i< response.data['hourly'].length ;i++) {// as we have hourly and daily date we will need to loop twice.
                        if (Math.abs(unixDateTime - response.data['hourly'][i]['dt']) < Math.abs(unixDateTime - closestDate)){
                            closestDate = response.data['hourly'][i]['dt'];
                        }   
                        console.log("Hourly check for closest date: "+closestDate);               
                    };
                    for (var i =0; i< response.data['daily'].length ;i++) {
                        if (Math.abs(unixDateTime - response.data['daily'][i]['dt']) < Math.abs(unixDateTime - closestDate)){
                            closestDate = response.data['daily'][i]['dt'];
                        }  
                        console.log("Daily check for closest date: "+closestDate);
                    }
                    
                    // now that we have the closest timestamp to the ask lets find the index. we will first check the hourly dataset
                    let indexClosestDate: number = -1;
                    let hourlyDaily: string = 'hourly';
                    console.log(indexClosestDate);
                    indexClosestDate = response.data['hourly'].map(function(e: { dt: any; }) { return e.dt; }).indexOf(closestDate);
                    let temp: number = response.data[hourlyDaily][indexClosestDate]['temp']; //need to diclare this before as the format changes with hourly/daily
                    console.log(indexClosestDate + hourlyDaily);
                    
                    // if the index is still NULL the closest date will be in the days
                    if(indexClosestDate == -1){
                        console.log('Looking for daily');
                        indexClosestDate = response.data['daily'].map(function(e: { dt: any; }) { return e.dt; }).indexOf(closestDate);
                        hourlyDaily = 'daily';
                        temp = response.data[hourlyDaily][indexClosestDate]['temp']['day'];
                    }
                    console.log(indexClosestDate + hourlyDaily);
                    console.log(temp);                    
                    
                    //now we know where the data is in the dataset we can start filling out our responses
                    let windSpeed: number = response.data[hourlyDaily][indexClosestDate]['wind_speed'];
                    let conditions: string = response.data[hourlyDaily][indexClosestDate]['weather'][0]['description'];
                    
                    

                    let forecast = {
                        temp: temp, 
                        windSpeed: windSpeed, 
                        conditions: conditions
                    }
                    /*
                    // Create response
                    let output = 
                    `On ${readableDate[2]} ${readableDate[1]} in ${cityData['results'][0]['address_components'][0]['short_name']} 
                    it is ${conditions} with a temperature of
                    ${forecastTemp}°C and a windspeed of
                    ${forecastWind} knots.`;*/

                    // Resolve the promise with the output text
                    console.log(forecast);
                    console.log('Im done grabbing weather data!')
                    resolve(forecast);       
                }
                else{//if no datetime was provided we respond with current weather
                    let temp: number = response.data['current']['temp'];
                    let windSpeed: number = response.data['current']['wind_speed'];
                    let conditions: string = response.data['current']['weather'][0]['description'];

                    let forecast = {
                        temp: temp, 
                        windSpeed: windSpeed, 
                        conditions: conditions
                    }
                    /*
                    // Create response
                    let output = 
                    `At this time in ${cityData['results'][0]['address_components'][0]['short_name']} 
                    it is ${conditions['description']} with a temperature of
                    ${forecast['temp']}°C and a windspeed of
                    ${forecast['wind_speed']} knots.`;*/

                    // Resolve the promise with the output text
                    console.log(forecast);
                    console.log('Im done grabbing weather data!')
                    resolve(forecast);
                };
            }).catch((error: any) => {
                console.log(`Error calling the weather API: ${error}`)
                reject();
            });
        });
}


//a function that provides Geodata on a city string you provide
export function callGeoApi(city: string) {

    //https://maps.googleapis.com/maps/api/geocode/json?address=rotterdam&key=AIzaSyCl9m-Vrwp3YcIIZqZ4Eo6ZPBs4mOoasv4
    //setting API data
    const geocode = new Map();
    //geocode.set('host', 'https://geocode.xyz/')
    //geocode.set('apiKey', '146630500381958569682x18325')
    
    geocode.set('host', 'https://maps.googleapis.com/maps/api/geocode/json')
    geocode.set('apiKey', 'AIzaSyCl9m-Vrwp3YcIIZqZ4Eo6ZPBs4mOoasv4')

    console.log('Im grabbing geo data!')
    return new Promise<any>((resolve, reject) => {
        const params = {
            key: geocode.get('apiKey'),
            address: city,
        }
        axios.get(geocode.get('host'), { params })
            .then((response: { data: any; }) => {
                if(response.data['status']=="ZERO_RESULTS"){
                    resolve(`Ohh! I dident manage to find `+city);
                }
                console.log(response.data);
                resolve(response.data);
            }).catch((error: any) => {
                reject(error);
            });
    });
}

