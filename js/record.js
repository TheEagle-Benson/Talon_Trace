import {geo_optional_args, success_callback, error_callback, } from './gps.js';
let watchID = null 

function get_location() {
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.warn('Your browser does not support geolocation.')
    return
  }
   watchID = geolocation.watchPosition(success_callback, error_callback, geo_optional_args)
  
}

function stopWatch() {
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.warn('Your browser does not support geolocation.')
    return
  }
  geolocation.clearWatch(watchID)
}

function pauseWatch() {
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.warn('Your browser does not support geolocation.')
    return
  }
  geolocation.clearWatch(watchID)
}

function resumeWatch() {
  get_location()
}

function plotCoords() {
  const map = window.L.map('map').setView([8.0485,-1.7309], 8)
  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const trailCoordinates = [
  [5.6037, -0.1870],
  [5.6041, -0.1875],
  [5.6046, -0.1883],
  [5.6052, -0.1892],
  [5.6059, -0.1903],
  [5.6065, -0.1915],
  [5.6068, -0.1930],
  [5.6072, -0.1948],
  [5.6079, -0.1967],
  [5.6085, -0.1989],
  [5.6090, -0.2012],
  [5.6096, -0.2035],
  [5.6104, -0.2058],
  [5.6112, -0.2080],
  [5.6120, -0.2102]
];

let trail = L.polyline(trailCoordinates, {
    color: 'green',
    weight: 4
}).addTo(map);
}

plotCoords()
get_location()