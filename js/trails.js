import { getAllTrails } from './db.js';

const trailsObject = await getAllTrails()


const allFilter = document.querySelector('#all_filter')
const recentFilter = document.querySelector('#recent_filter')
const longestFilter = document.querySelector('#longest_filter')
const favoriteFilter = document.querySelector('#favorites_filter')
const filterChips = document.querySelector('.filter-chips')

// Trail Search Elements
const trailSearchInput = document.querySelector("#trail-search");
const clearSearchBtn = document.querySelector("#clear-search");

const searchResultsDropdown = document.querySelector("#search-results");
const searchResultsCount = document.querySelector("#search-results-count");
const searchResultsList = document.querySelector("#search-results-list");
const searchNoResults = document.querySelector("#search-no-results");

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
    hideAllEmptyStates()
    trailListContainer.innerHTML = ""
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

function getLongestTrails() {
    hideAllEmptyStates()
    trailListContainer.innerHTML = ""
    if (trailsObject.status !== "success") {
    console.log(trailsObject.message)
    return
  }
    let sortedTrails = [...trailsObject.trail].sort((a,b) => {
        return b.total_distance - a.total_distance
    })

    if (sortedTrails.length === 0) {
     trailListContainer.innerHTML = ""
    document.querySelector('#longestFilterEmptyState').style.display = "flex"
    return
    }

    sortedTrails.forEach(trail => {
      let title = trail.name
      let distance = trail.total_distance
      let id = trail.id
      let pointCount = trail.point_count
      let date = calculateDateAndFormat(trail.created_at)
      
      let buttonCard = createButtonCard(title, distance, pointCount, date, id)
      trailListContainer.insertAdjacentHTML('beforeend', buttonCard)
    })
}

function getRecentTrails() {
    hideAllEmptyStates()
    trailListContainer.innerHTML = ""
   if (trailsObject.status !== "success") {
    console.log(trailsObject.message)
    return
  }
    let sortedTrails = [...trailsObject.trail].sort((a,b) => {
        return b.created_at - a.created_at
    })

    if (sortedTrails.length === 0) {
     trailListContainer.innerHTML = ""
    document.querySelector('#recentFilterEmptyState').style.display = "flex"
    return
    }

    sortedTrails.forEach(trail => {
      let title = trail.name
      let distance = trail.total_distance
      let id = trail.id
      let pointCount = trail.point_count
      let date = calculateDateAndFormat(trail.created_at)
      
      let buttonCard = createButtonCard(title, distance, pointCount, date, id)
      trailListContainer.insertAdjacentHTML('beforeend', buttonCard)
    })
}

function getFavoriteTrails() {
  hideAllEmptyStates()
  trailListContainer.innerHTML = ""
   if (trailsObject.status !== "success") {
    console.log(trailsObject.message)
    return
  }
  let trails = [...trailsObject.trail].filter(trail => {
    return trail.is_favorite === true
  })

   if (trails.length === 0) {
     trailListContainer.innerHTML = ""
    document.querySelector('#favoritesFilterEmptyState').style.display = "flex"
    return
    }

    trails.forEach(trail => {
      let title = trail.name
      let distance = trail.total_distance
      let id = trail.id
      let pointCount = trail.point_count
      let date = calculateDateAndFormat(trail.created_at)
      
      let buttonCard = createButtonCard(title, distance, pointCount, date, id)
      trailListContainer.insertAdjacentHTML('beforeend', buttonCard)
    })
}

function hideAllEmptyStates() {
  emptyState.style.display = "none";

  document.querySelector('#recentFilterEmptyState').style.display = "none";
  document.querySelector('#longestFilterEmptyState').style.display = "none";
  document.querySelector('#favoritesFilterEmptyState').style.display = "none";
}

function searchTrail() {
  let matchedTrails = []
  let searchTerm = trailSearchInput.value.trim().toLowerCase()
  if (searchTerm) {
    clearSearchBtn.classList.remove('hidden')
    searchResultsDropdown.classList.remove('hidden')
    searchNoResults.classList.add('hidden')
  } else {
    clearSearchBtn.classList.add('hidden')
    searchResultsDropdown.classList.add('hidden')
    searchNoResults.classList.add('hidden')
    searchResultsList.innerHTML = ""
    searchResultsCount.textContent = "Matching trails (0)"
    return 
  }

  let trailsArray = [...trailsObject.trail]
  trailsArray.forEach(trail => {
    if (trail.name.toLowerCase().includes(searchTerm)) {
      matchedTrails.push(trail)
    }
  })
  searchResultsList.innerHTML = ""
  searchResultsCount.textContent = `Matching trails (${matchedTrails.length})`
  if (matchedTrails.length === 0) {
    searchNoResults.classList.remove('hidden')
  }
  matchedTrails.forEach(trail => {
    let buttonCard = createSearchTrailCard(trail.id, trail.name, trail.point_count, trail.created_at, trail.total_distance)
    searchResultsList.insertAdjacentHTML('beforeend', buttonCard)
  })
  console.log(matchedTrails)
}

function createSearchTrailCard(trailId, trailName, pointCount, createdAt, trailDistance) {
  let card = `
    <button class="search-result-item" data-trail-id="${trailId}">
  <span class="search-result-item__thumb">
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M6 32 L15 20 L13 12 L23 8 L28 3" stroke="#D9922E" stroke-width="2" stroke-linecap="round" fill="none"/></svg>
  </span>
  <span class="search-result-item__body">
    <span class="search-result-item__name">${trailName}</span>
    <span class="search-result-item__meta">${(trailDistance / 1000).toFixed(2)} km <span class="sep">·</span> ${pointCount} points <span class="sep">·</span> ${calculateDate(createdAt)}</span>
  </span>
  <svg class="search-result-item__chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
  `
  return card
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

getAllTrailsFromDb()


trailListContainer.addEventListener("click", (event) => {
  openTrailDetail(event)
})

filterChips.addEventListener('click', (event) => {
  let element = event.target.closest('.filter-chip')
  if (!element) {
    return 
  }
  let activated = filterChips.getElementsByClassName('filter-chip is-selected')[0]
  if (element.getAttribute('id') === activated.getAttribute('id')) {
    console.log('Same element clicked')
    return
  }
  activated.classList.remove('is-selected')
  console.log(activated)
  element.classList.add('is-selected')
})

allFilter.addEventListener('click', () => {
  getAllTrailsFromDb()

})

recentFilter.addEventListener('click', () => {
    getRecentTrails()

})

longestFilter.addEventListener('click', () => {
  getLongestTrails()
})

favoriteFilter.addEventListener('click', () => {
  getFavoriteTrails()
})

document.querySelector('#switch_to_all_trail').addEventListener('click', () => {
  favoriteFilter.classList.remove('is-selected')
  allFilter.classList.add('is-selected')
  getAllTrailsFromDb()
})

trailSearchInput.addEventListener('input', () => {
  searchTrail()
})

clearSearchBtn.addEventListener('click', () => {
  trailSearchInput.value = ""
  searchTrail()
})

searchResultsList.addEventListener('click', (event) => {
  let clickedElement = event.target.closest(".search-result-item")
  if (!clickedElement) {
    return
  }
  let trailId = clickedElement.getAttribute("data-trail-id")
  if (!trailId) {
    console.log("trail id does not exist!")
  return
  }
  window.location.href = `trail-detail.html?trailid=${trailId}`
})
