'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  date = new Date();
  //unique identifier (usually use a library)
  //use date, converted to a string, take last 10digits
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration); //initialize this keyword
    this.cadence = cadence;
    this.calcPace(); //emidiatly use calcPace
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration); //initialize this keyword
    this.elevationGain = elevationGain;
    this.calcSpeed(); //emidiatly use calcSpeed
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

//see if classes are working:
//const run1 = new Running([39, -12], 5.2, 24, 178);
//const cycling1 = new Cycling([39, -12], 27, 95, 523);
//console.log(run1, cycling1);
//console.log(run1.calcPace());
//console.log(cycling1.calcSpeed());

///////////////////////////////////////////////////////
//APPLICATION ARCHITECTURE
class App {
  //Private instance properties
  #map;
  #mapEvent;
  //constructor method executed imediately when new App read
  constructor() {
    this._getPosition();

    //RENDERING WORKOUT INPUT FORM
    form.addEventListener('submit', this._newWorkout.bind(this));
    //pass in event handler function with this keyword bound to it

    //hide and display correct fields for running vs. cycling
    inputType.addEventListener('change', this._toggleElevationField);
    //don't need to bing this keyword as it is not used in the function
  }

  _getPosition() {
    //USING GEOLOCATION API
    //two callbacks: success(position parameter) and error
    //first check if the geolocation exists (only really old browsers would not have)
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position.');
        }
      );
  }

  _loadMap(position) {
    //console.log(position); use to find names of parameters desire to use
    //use latitude and longitude to create variables related to them in the geoposition
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //create google map link:
    //console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

    //USING THIRD PARTY LIBRARY: LEAFLET
    //open source JS library for mobile-friendly interactive maps

    //code for map from Leaflet:
    //in our html we need an element with the ID of map to pass in
    //L = namespace (methods to use: map, tilelayer, & marker)
    //--global (access to all scripts after it)

    //create array of coordinates
    const coords = [latitude, longitude];

    //console.log(this);//undefined untill use bind(this) on _loadMap in geolocation
    //reasign global map variable
    this.#map = L.map('map').setView(coords, 13); //number is zoom level
    //console.log(map); see methods & properties inherited

    //can change style of map with tileLayer https
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //map marker original:
    //L.marker(coords)
    //  .addTo(map)
    //  .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //  .openPopup();

    //add event handler to add marker on map on click
    //need access to location coordinates where clicked on map
    //'on' method from leaflet library
    //map = special object from leaflet with a couple methods and properties on it
    //HANDLING CLICKS ON MAP:
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden'); //on click the form appears
    inputDistance.focus(); //puts cursor in this field in the form automatically
  }

  _toggleElevationField() {
    //toggle between which has hidden class
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault(); //stop page reload after submitting form
    //console.log(this);
    //event handler function will have this keyword on the DOM element..
    //...to which it is attached = form (fix with bind on _newWorkout in constructor)

    //Clear input fields (make sure use .value to clear values not the constants)
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    //Display Marker
    //console.log(this.#mapEvent); use latlng object with lat & lng for variables
    //****need access to map and mapEvent**** (make global variables)
    const { lat, lng } = this.#mapEvent.latlng;
    //within bindPopup create a new object with properties of it's own
    //original: L.marker([lat, lng]).addTo(map).bindPopup('Workout!').openPopup();
    //lookup in leaflet documentation
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          //use to assign any CSS className to the popup
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout!')
      .openPopup();
  }
}

const app = new App();
