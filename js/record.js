import {geo_optional_args, success_callback, error_callback, matrixList, filteredCoords, updateTrailsCallback, updateUi } from './gps.js';
import { calculateTotalDistance, calculateTotalElapsedTime, formatTime } from './utils.js';

let watchID = null
let isWatching = false
let map
let trail
let totalDistanceInMeters = 0
let startTime = 0
let endTime = 0
let elapsedTimeBeforePaused = 0
let totalElapsedTime = 0
let durationIntervalID = null
let lastFixIntervalID = null

const States = Object.freeze({
  RECORDING: "RECORDING",
  PAUSED: "PAUSED",
  IDLE: "IDLE"
})

const startTrailBtn = document.querySelector("#startTrailBtn")
const pauseResumeBtn = document.querySelector("#pauseTrailBtn")
const endTrailBtn = document.querySelector("#endTrailBtn")
const recordSheet = document.querySelector("#recordSheet")
const distanceValueDisplay = document.querySelector("#recordDistanceValue")
const recordedPointsDisplay = document.querySelector("#recordPointsValue")
const recordDurationDisplay = document.querySelector("#recordDurationValue")
const recordAccuracyDisplay = document.querySelector("#recordAccuracyValue")
const recordLastFixDisplay = document.querySelector("#recordLastFix")
const recordingStatus = document.querySelector("#recordStatusPill")
const recordingIndicator = document.querySelector(".record-status__dot")

let engineState = States.IDLE

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
   startTime = Date.now()
   engineState = States.RECORDING
   isWatching = true
}

function startNewTrail() {
  elapsedTimeBeforePaused = 0
  totalElapsedTime = 0
  totalDistanceInMeters = 0
  startTime = 0
  endTime = 0
  filteredCoords.length = 0
  recordedPointsDisplay.textContent = 0
  recordLastFixDisplay.textContent = `Last fix 0s ago`
  recordDurationDisplay.textContent = '00:00:00'
  recordAccuracyDisplay.textContent = '0m'
  distanceValueDisplay.innerHTML = `0<span class="unit">km</span>`
  startWatch()
  durationIntervalID = setInterval(calculateDuration, 1000)
  lastFixIntervalID = setInterval(updateLastFix, 1000)
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
  if (durationIntervalID !== null) {
      clearInterval(durationIntervalID)
  }
  if (lastFixIntervalID !== null) {
      clearInterval(lastFixIntervalID)
  }
  geolocation.clearWatch(watchID)
  endTime = Date.now()
  engineState = States.IDLE
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
  if (durationIntervalID !== null) {
      clearInterval(durationIntervalID)
  }
  if (lastFixIntervalID !== null) {
      clearInterval(lastFixIntervalID)
  }
  geolocation.clearWatch(watchID)
  elapsedTimeBeforePaused += (Date.now() - startTime)
  startTime = 0
  engineState = States.PAUSED
  isWatching = false
  watchID = null
}

function resumeWatch() {
  startWatch()
  durationIntervalID = setInterval(calculateDuration, 1000)
  lastFixIntervalID = setInterval(updateLastFix, 1000)
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

function getCurrentAccuracy() {
  let accuracy = 0
  if (filteredCoords.length === 0) {
    return accuracy
  }
  
  if (filteredCoords.length === 1) {
   return accuracy = filteredCoords[0].accuracy
  }
  return accuracy = filteredCoords[filteredCoords.length - 1].accuracy
}

function calculateLastFix(){
  let lastFix = 0
  if (filteredCoords.length === 0) {
      return lastFix
    }
  
  let coordsTimestamp = filteredCoords[filteredCoords.length - 1].timestamp
     lastFix = Math.floor((Date.now() - coordsTimestamp) / 1000)
    return lastFix
}

function updateUI() {
  let pointsRecorded = filteredCoords.length
  let distance = (calculateTotalDistance(filteredCoords) / 1000).toFixed(2)
  let accuracy = getCurrentAccuracy().toFixed(2)
  recordedPointsDisplay.textContent = pointsRecorded
  distanceValueDisplay.innerHTML = `${distance}<span class="unit">km</span>`
  recordAccuracyDisplay.textContent = `${accuracy}m`
}

function calculateDuration() {
  let durationSegmentsArray = calculateTotalElapsedTime(elapsedTimeBeforePaused,startTime, Date.now())
  let duration = formatTime(durationSegmentsArray)
  recordDurationDisplay.textContent = duration
}

function updateLastFix() {
  let lastFix = calculateLastFix()
  recordLastFixDisplay.textContent = `Last fix ${lastFix}s ago`
}

updateUi(updateUI)

startTrailBtn.addEventListener("click", (event) => {
  if (map) {
    map.remove()
  }
  updateTrailsCallback(updateTrail)
  plotCoords()
  startNewTrail()
  recordSheet.setAttribute("data-state", engineState.toLowerCase())
  recordingStatus.classList.add("is-live")
  recordingStatus.innerHTML = '<span class="record-status__dot"></span> Recording'
  
})

endTrailBtn.addEventListener("click", (event) => {
  stopWatch()
  recordSheet.setAttribute("data-state", engineState.toLowerCase())
  recordingStatus.classList.remove("is-live")
  recordingStatus.innerHTML = '<span class="record-status__dot"></span> Not Recording'
})

pauseResumeBtn.addEventListener("click", (event) => {
  if (engineState === States.PAUSED) {
    resumeWatch()
    recordSheet.setAttribute("data-state", engineState.toLowerCase())
    recordingStatus.classList.add("is-live")
  recordingStatus.innerHTML = '<span class="record-status__dot"></span> Recording'
    return 
  }
  if (engineState === States.RECORDING) {
    pauseWatch()
    recordSheet.setAttribute("data-state", engineState.toLowerCase())
    recordingStatus.classList.remove("is-live")
  recordingStatus.innerHTML = '<span class="record-status__dot"></span> Paused'
    return 
  }
})