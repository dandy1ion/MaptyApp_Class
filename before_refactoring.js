"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

//create global variable for map & mapEvent
let map, mapEvent;

//USING GEOLOCATION API
//two callbacks: success(position parameter) and error
//first check if the geolocation exists (only really old browsers would not have)
if (navigator.geolocation)
	navigator.geolocation.getCurrentPosition(
		function (position) {
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

			//reasign global map variable
			map = L.map("map").setView(coords, 13); //number is zoom level
			//console.log(map); see methods & properties inherited

			//can change style of map with tileLayer https
			L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			}).addTo(map);

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
			map.on("click", function (mapE) {
				mapEvent = mapE;
				form.classList.remove("hidden"); //on click the form appears
				inputDistance.focus(); //puts cursor in this field in the form automatically
				//console.log(mapEvent); use latlng object with lat & lng for variables
				//const { lat, lng } = mapEvent.latlng;
				//within bindPopup create a new object with properties of it's own
				//original: L.marker([lat, lng]).addTo(map).bindPopup('Workout!').openPopup();
				//lookup in leaflet documentation
				//L.marker([lat, lng])
				//  .addTo(map)
				//  .bindPopup(
				//    L.popup({
				//      maxWidth: 250,
				//      minWidth: 100,
				//      autoClose: false,
				//      closeOnClick: false,
				//      //use to assign any CSS className to the popup
				//      className: 'running-popup',
				//    })
				//  )
				//  .setPopupContent('Workout!')
				//  .openPopup();
			});
		},

		function () {
			alert("Could not get your position.");
		},
	);

//RENDERING WORKOUT INPUT FORM
form.addEventListener("submit", function (e) {
	e.preventDefault(); //stop page reload after submitting form

	//Clear input fields (make sure use .value to clear values not the constants)
	inputDistance.value =
		inputDuration.value =
		inputCadence.value =
		inputElevation.value =
			"";

	//Display Marker
	//console.log(mapEvent); use latlng object with lat & lng for variables
	//****need access to map and mapEvent**** (make global variables)
	const { lat, lng } = mapEvent.latlng;
	//within bindPopup create a new object with properties of it's own
	//original: L.marker([lat, lng]).addTo(map).bindPopup('Workout!').openPopup();
	//lookup in leaflet documentation
	L.marker([lat, lng])
		.addTo(map)
		.bindPopup(
			L.popup({
				maxWidth: 250,
				minWidth: 100,
				autoClose: false,
				closeOnClick: false,
				//use to assign any CSS className to the popup
				className: "running-popup",
			}),
		)
		.setPopupContent("Workout!")
		.openPopup();
});

//hide and display correct fields for running vs. cycling
inputType.addEventListener("change", function () {
	//toggle between which has hidden class
	inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
	inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
});
