import { getAllTrails } from "./db.js"
import { notify } from "./utils.js"



const gpsStatusIndicator = document.querySelector('#gpsStatusIndicator')
const totalDistance = document.querySelector('#statTotalDistance')
const offlineArea = document.querySelector('#statOfflineAreas')
const trailCount = document.querySelector('#statTotalTrails')
const trailsRecordedCount = document.querySelector('.quick-tile__sub')
const recentTrailListContainer = document.querySelector('.recent-list')
const emptyState = document.querySelector('#recentTrailsEmpty')
const seeAllLink = document.querySelector('#seeAllLink')


async function displayStat() {
  recentTrailListContainer.innerHTML = ''
  let res = await getAllTrails()
  console.log(res)

  if (res.status === 'error') {
    console.log('an error occurred on the home page')
    seeAllLink.style.display = 'none'
    emptyState.style.display = 'flex'
    notify('An Unknown Error Occurred. Refresh The Page And Try Again', 'toast-error')
    return 
  }

  if (res.trail.length === 0) {
    seeAllLink.style.display = 'none'
    emptyState.style.display = 'flex'
    return
  }

  let totalRecordedTrailCount = res.trail.length 
  let totalTrailDistance = 0
  res.trail.forEach(trail => {
    totalTrailDistance += trail.total_distance 
  })
  trailCount.textContent = totalRecordedTrailCount
  totalDistance.innerHTML = `${(totalTrailDistance / 1000).toFixed(2)}<span class="unit">km</span>`
  trailsRecordedCount.textContent = `${totalRecordedTrailCount} Recorded`

  let trailsCopy = [...res.trail]
  let sortedTrails = trailsCopy.sort((a, b) => {
    return b.created_at - a.created_at
  })
  if (sortedTrails.length > 3) sortedTrails.length = 3

  sortedTrails.forEach(trail => {
    let trailName = trail.name 
    let distance = (trail.total_distance / 1000).toFixed(2)
    let trailPointCount = trail.coords.length 
    let created_at = trail.created_at
    let trailID = trail.id 
    
    let trailCard = `
      <button class="recent-item" data-trail-id="${trailID}">
        <span class="recent-item__glyph">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 19 L9 10 L12 14 L16 6 L20 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
        <span class="recent-item__body">
          <span class="recent-item__name">${trailName}</span><br>
          <span class="recent-item__meta">${distance} km · ${trailPointCount} pts · ${calculateDate(created_at)}</span>
        </span>
        <svg class="recent-item__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    `
    recentTrailListContainer.insertAdjacentHTML('beforeend', trailCard)
  })
  
}

function calculateDate(timestamp) {
  const months = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun",
    "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec"
  ]
  
  let date = new Date(timestamp)
  let day = date.getDate()
  let month = date.getMonth()
  
 return `${months[month]} ${day}`
}

function openTrailDetail(event) {
  let trailCard = event.target.closest(".recent-item")
  if (!trailCard) {
    console.log("trail card does not exist!")
  return
  }
  let trailId = trailCard.getAttribute("data-trail-id")
  if (!trailId) {
    console.log('trail id not found')
    return
  }
  window.location.href = `trail-detail.html?trailid=${trailId}`
}

displayStat()


recentTrailListContainer.addEventListener('click', (event) => {
  openTrailDetail(event)
})