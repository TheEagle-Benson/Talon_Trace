import { getAllTrails } from './db.js';

const trailsObject = await getAllTrails()
let trailListContainer = document.querySelector("#trailListContainer")
let emptyState = document.querySelector("#trailsEmptyState")

function createButtonCard(trailTitle, trailDistance, numberOfPoints, trailDate, trailID) {
  let buttonCard = `<button class="trail-card" data-trail-id=${trailID}>
        <span class="trail-card__thumb">
          <svg viewBox="0 0 66 66" fill="none" aria-hidden="true"><path d="M14 50 L30 45 L28 30 L42 22" stroke="#D9922E" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="14" cy="50" r="2.5" fill="#3FC9A8"/><circle cx="42" cy="22" r="2.5" fill="#D9922E"/></svg>
        </span>
        <span class="trail-card__body">
          <span class="trail-card__name">${trailTitle}</span>
          <span class="trail-card__stats"><span class="dist">${(trailDistance / 1000).toFixed(2)} km</span><span class="sep">·</span>${numberOfPoints} points</span>
          <span class="trail-card__date">${trailDate}</span>
        </span>
      </button>`
      return buttonCard
}


function getAllTrailsFromDb() {
  if (trailsObject.status !== "success") {
    console.log(trailsObject.message)
    return
  }
  
  if (trailsObject.trail.length === 0) {
    emptyState.style.display = "flex"
    return
  }
  
  let trailArray = trailsObject.trail
  trailArray.forEach(trail => {
    let title = trail.name
    let distance = trail.total_distance
    let id = trail.id
    let pointCount = trail.point_count
    let date = calculateDateAndFormat(trail.created_at)
    
    let buttonCard = createButtonCard(title, distance, pointCount, date, id)
    trailListContainer.insertAdjacentHTML('beforeend', buttonCard)
  })
}

function calculateDateAndFormat(timestamp) {
  const months = [
    "January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"
  ]
  
  let date = new Date(timestamp)
  let day = date.getDate()
  let month = months[date.getMonth()]
  let year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

function openTrailDetail(event) {
  let trailId = event.target.closest(".trail-card").getAttribute("data-trail-id")
  if (!trailId) {
    console.log("trail id does not exist!")
  return
  }
  window.location.href = `trail-detail.html?trailid=${trailId}`
}


trailListContainer.addEventListener("click", (event) => {
  openTrailDetail(event)
})

getAllTrailsFromDb()
