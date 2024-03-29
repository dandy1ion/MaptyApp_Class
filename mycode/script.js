'use strict';

class Workout {
  date = new Date();
  //unique identifier (usually use a library)
  //use date, converted to a string, take last 10digits
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    //tell prettier to leave next line alone as formated:
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration); //initialize this keyword
    this.cadence = cadence;
    this.calcPace(); //emidiatly use calcPace
    this._setDescription(); //access to parent class
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration); //initialize this keyword
    this.elevationGain = elevationGain;
    this.calcSpeed(); //emidiatly use calcSpeed
    this._setDescription(); //access to parent class
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

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  //Private instance properties
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  //constructor method executed imediately when new App read
  constructor() {
    //Get user's position
    this._getPosition();

    //Get data from local storage
    this._getLocalStorage();

    //Attach event handlers:

    //RENDERING WORKOUT INPUT FORM
    form.addEventListener('submit', this._newWorkout.bind(this));
    //pass in event handler function with this keyword bound to it

    //hide and display correct fields for running vs. cycling
    inputType.addEventListener('change', this._toggleElevationField);
    //don't need to bing this keyword as it is not used in the function

    //event listener for click on list workout = take to workout on map
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel); //number is zoom level
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

    //render markers from local storage
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden'); //on click the form appears
    inputDistance.focus(); //puts cursor in this field in the form automatically
  }

  _hideForm() {
    //Empty inputs
    //make sure use .value to clear values not the constants
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    //toggle between which has hidden class
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    //helper functions (inputs=array)
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault(); //stop page reload after submitting form
    //console.log(this);
    //event handler function will have this keyword on the DOM element..
    //...to which it is attached = form (fix with bind on _newWorkout in constructor)

    //GET DATA FROM FORM
    const type = inputType.value;
    const distance = +inputDistance.value; //+converts the string to a number
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //IF WORKOUT = RUNNING : CREATE RUNNING OBJECT
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //CHECK IF DATA IS VALID
      if (
        //!Number.isFinite(distance) ||
        //!Number.isFinite(duration) ||
        //!Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //IF WORKOUT = CYCLING : CREATE CYCLING OBJECT
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //CHECK IF DATA IS VALID
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //Export functionality:

    //ADD NEW OBJECT TO WORKOUT ARRAY
    this.#workouts.push(workout);
    //console.log(workout);

    //RENDER WORKOUT ON MAP AS MARKER
    this._renderWorkoutMarker(workout);

    //RENDER WORKOUT ON LIST
    this._renderWorkout(workout);

    //HIDE FORM + CLEAR INPUT FIELDS
    this._hideForm();

    //SET LOCAL STORAGE TO ALL WORKOUTS
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          //use to assign any CSS className to the popup
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;

    if (workout.type === 'cycling')
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li> -->
      `;

    //add as a sibling after the form in index.html
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    //e.target = element that is clicked
    const workoutEl = e.target.closest('.workout');
    //console.log(workoutEl); //get entire element
    //(use data-id to find the workout in the workout array)

    if (!workoutEl) return; //if not clicking on the workoutEl ignore

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    //console.log(workout);

    //method in leaflet available on all map objects
    //takes arguments: coordinates, zoom level, an object {} of options
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    //using the public interface
    //workout.click();
    //objects coming from local storage will not inherit methods (loose prototype chain)
  }

  _setLocalStorage() {
    //API provided by browser (only advised to use with small amounts of data => blocking)
    //arguments: name, string to store (associated with name)
    //simple key, value store
    //JSON.stringify = convert anything in JS to a string
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    //console.log(data); //large string
    //(turn back into objects = JSON.parse())

    //if no data ignore
    if (!data) return;

    //set workouts to data that is stored
    this.#workouts = data;

    //render workouts in the list (& on map in _loadMap)
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  //reset local storage
  //call in console: app.reset()
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

//Future features:
//Ability to edit a workout
//Ability to delete a workout
//Ability to delete all workouts
//Ability to sort workouts by a certain field (e.g. distance)
//Re-build Running and Cycling objects coming from Local Storage
//More realistic error and confirmation messages
//Ability to position the map to show all workouts **-dependant on leaflet library
//Ability to draw lines and shapes instead of just points for workout markers **
//Geocode location from coordinates('Run in City, USA')[only after asynchronousJS section]
//Display weather data for workout time and place [only after asynchronous JS section]
