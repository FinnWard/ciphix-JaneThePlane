//addingthis file to create a function to calculate flight time. 

//latlong amsterdam: 
let lat1 = 52.37403;
let lon1 = 4.88969;


//latlong funchal: 32.63333, -16.9
let lat2 = 32.63333;
let lon2 = -16.9;


const R = 6371e3; // metres
const φ1 = lat1 * Math.PI/180; // φ, λ in radians
const φ2 = lat2 * Math.PI/180;
const Δφ = (lat2-lat1) * Math.PI/180;
const Δλ = (lon2-lon1) * Math.PI/180;

const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

const flightDistance = R * c; // in metres

// we calculate the flight time with a rough estimation calculation 30 min plus 1 hour per every 500 miles
let flightTime = 0.5 + (d/(500*1609.34));

alert(d);
alert(time);
