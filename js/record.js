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
let durationSegmentsArray = null

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
const saveTrailModal = document.querySelector("#saveTrailModal")
const saveTrailModalScrim = document.querySelector("#saveTrailModalScrim")
const saveTrailForm = document.querySelector("#saveTrailForm")
const trailNameInput = document.querySelector("#trailNameInput")
const trailNotesInput = document.querySelector("#trailNotesInput")
const cancelSaveTrailBtn = document.querySelector("#cancelSaveTrailBtn")
const confirmSaveTrailBtn = document.querySelector("#confirmSaveTrailBtn")
const discardTrailBtn = document.querySelector("#discardTrailBtn")
const trailSummary = document.querySelector(".save-trail-modal__subtitle")


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
   console.log("Recording...")
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
  if (engineState === States.IDLE) {
    return
  }
  endTime = Date.now()
  trailSummary.textContent = `${(calculateTotalDistance(filteredCoords) / 1000).toFixed(2)}km . ${filteredCoords.length} points . ${durationSegmentsArray[0]}h ${durationSegmentsArray[1]}m ${durationSegmentsArray[2]}s`
  openModal()
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
      durationIntervalID = null
  }
  if (lastFixIntervalID !== null) {
      clearInterval(lastFixIntervalID)
      lastFixIntervalID = null
  }
  geolocation.clearWatch(watchID)
  elapsedTimeBeforePaused += (Date.now() - startTime)
  engineState = States.PAUSED
  isWatching = false
  watchID = null
  console.log("Paused...")
}

function resumeWatch() {
  console.log("Resumed...")
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
  durationSegmentsArray = calculateTotalElapsedTime(elapsedTimeBeforePaused,startTime, Date.now())
  let duration = formatTime(durationSegmentsArray)
  recordDurationDisplay.textContent = duration
}

function updateLastFix() {
  let lastFix = calculateLastFix()
  recordLastFixDisplay.textContent = `Last fix ${lastFix}s ago`
}

function openModal() {
  if (saveTrailModalScrim) { saveTrailModalScrim.classList.add('is-open')
  }
  
  if (saveTrailModal) { saveTrailModal.classList.add('is-open')
  }
}

function closeModal() {
  if (saveTrailModalScrim) { saveTrailModalScrim.classList.remove('is-open')
  }
  
  if (saveTrailModal) { saveTrailModal.classList.remove('is-open')
  }
}

function createObject() {
  totalDistanceInMeters = calculateTotalDistance(filteredCoords)
  totalElapsedTime = calculateTotalElapsedTime(elapsedTimeBeforePaused, startTime, endTime)
  
  return {
    start_time: startTime,
    end_time: endTime,
    total_distance: totalDistanceInMeters,
    point_count: filteredCoords.length,
    created_at: Date.now(),
    coords: filteredCoords
  }

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
   if (engineState === States.RECORDING) {
   pauseWatch()
   recordSheet.setAttribute("data-state", engineState.toLowerCase())
   recordingStatus.classList.remove("is-live")
   recordingStatus.innerHTML = '<span class="record-status__dot"></span> Paused'
 }
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
    startTime = 0
    recordSheet.setAttribute("data-state", engineState.toLowerCase())
    recordingStatus.classList.remove("is-live")
  recordingStatus.innerHTML = '<span class="record-status__dot"></span> Paused'
    return 
  }
})

confirmSaveTrailBtn.addEventListener("click", (event) => {
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.warn('Your browser does not support geolocation.')
    return
  }
  event.preventDefault()
  let trailName = trailNameInput.value.trim()
  let trailNotes = trailNotesInput.value.trim() || " "
  
  if (!trailName) {
    console.log("Name field cannot be empty")
    // error toast would be implemented later
   
    closeModal()
    return
  }
  let trailObjectDb = createObject()
  trailObjectDb.name = trailName
  trailObjectDb.notes = trailNotes
  trailNameInput.value = ""
  trailNotesInput.value = ""

  
  if (durationIntervalID !== null) {
      clearInterval(durationIntervalID)
      durationIntervalID = null
    }
  if (lastFixIntervalID !== null) {
    clearInterval(lastFixIntervalID)
    lastFixIntervalID = null
  }
  if (watchID) {
    geolocation.clearWatch(watchID)
  }
  engineState = States.IDLE
  isWatching = false
  watchID = null
  recordSheet.setAttribute("data-state", engineState.toLowerCase())
  recordingStatus.classList.remove("is-live")
  recordingStatus.innerHTML = '<span class="record-status__dot"></span> Not Recording'
  console.log("Not Recording...")
  console.log(trailObjectDb)
  
  closeModal()
  console.log("confirm save trail button clicked")
})

cancelSaveTrailBtn.addEventListener("click", (event) => {
  console.log("cancel save trail button clicked")
})

discardTrailBtn.addEventListener("click", (event) => {
  console.log("discard trail button clicked")
})
