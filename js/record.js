import {geo_optional_args, success_callback, error_callback, matrixList, filteredCoords, updateTrailsCallback } from './gps.js';

let watchID = null
let isWatching = false
let map
let trail

function startWatch() {
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.warn('Your browser does not support geolocation.')
    return
  }
  if (isWatching && watchID !== null) {
    return
  }
   watchID = geolocation.watchPosition(success_callback, error_callback, geo_optional_args)
   isWatching = true
}

function stopWatch() {
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.warn('Your browser does not support geolocation.')
    return
  }
  if (!isWatching && watchID === null) {
    return
  }
  geolocation.clearWatch(watchID)
  isWatching = false
  watchID = null
}

function pauseWatch() {
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.warn('Your browser does not support geolocation.')
    return
  }
  if (!isWatching && watchID === null) {
    return
  }
  geolocation.clearWatch(watchID)
  isWatching = false
  watchID = null
}

function resumeWatch() {
  startWatch()
}

function plotCoords() {
  map = window.L.map('map').setView([0,0], 15)
  window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


trail = L.polyline([], {
  color: 'green',
  weight: 4,
}).addTo(map)
}

function updateTrail() {
  trail.setLatLngs(matrixList)
  if (matrixList.length > 0) {
  let currCoords = matrixList[matrixList.length - 1]
  map.panTo(currCoords)
}
console.log('Drawn')
}


updateTrailsCallback(updateTrail)
plotCoords()
startWatch()