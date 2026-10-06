import { getTrail } from "./db.js";


const mapBadge = document.querySelector(".map-surface__badge");
const detailTrailName = document.querySelector('#detailTrailName')
const detailTrailDate = document.querySelector('#detailTrailDate')
const detailTrailDistance = document.querySelector('#detailDistance')
const detailTrailDuration = document.querySelector('#detailDuration')
const detailTrailPointCount = document.querySelector('#detailPoints')
const detailTrailAccurracy = document.querySelector('#detailAccuracy')
const detailTrailNotes = document.querySelector('#detailNotesText')


let trailID
let trailObj 



async function getTrailObject() {
  const params = new URLSearchParams(window.location.search);
  trailID = Number(params.get("trailid"));
  let trailObject = await getTrail(trailID);
  console.log(trailObject);
  return trailObject;
}

trailObj = await getTrailObject()

function displayTrailDetails() {
  console.log(trailObj)
  let trailName = trailObj.trail.name
  let trailDistance = (trailObj.trail.total_distance / 1000).toFixed(2)
  let pointCount = trailObj.trail.point_count
  let trailNotes = trailObj.trail.notes
  let trailAccurracy = trailObj.trail.coords[0].accuracy 
  let duration = calculateDuration(trailObj.trail.start_time, trailObj.trail.end_time)
  let date = calculateDateTime(trailObj.trail.created_at)

  mapBadge.textContent = trailName
  detailTrailName.textContent = trailName
  detailTrailDistance.innerHTML = `${trailDistance} <span class="unit">km</span>`
  detailTrailAccurracy.innerHTML = `${trailAccurracy.toFixed(2)} <span class="unit">m</span></div>` 
  detailTrailNotes.textContent = trailNotes
  detailTrailPointCount.textContent = pointCount
  detailTrailDate.textContent = date 
  detailTrailDuration.innerHTML = duration 
}

function calculateDateTime(timestamp) {
  const months = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ]
  
  let date = new Date(timestamp)
  let day = date.getDate()
  let month = date.getMonth()
  let year = date.getFullYear()
  let h = date.getHours()
  let m = date.getMinutes()

  let session = h >= 12 ?"PM":"AM"

  if(h === 12) {
    h = 12
  } else if (h > 12) {
    h = h - 12
  }

 return `Recorded ${months[month]} ${day}, ${year} . ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${session}`
}

function calculateDuration(startTimestamp, endTimestamp) {
  let duration = Math.floor((endTimestamp - startTimestamp) / 1000)
  let seconds = duration % 60
  let minutes = Math.floor((duration / 60) % 60)
  let hours = Math.floor(duration / 3600)
  return `${hours}h ${minutes}m ${seconds}s`
}

displayTrailDetails()