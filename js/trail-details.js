import { getTrail, updateTrail, checkIfExist, deleteTrail, saveFvoriteStatus } from "./db.js";
import { notify } from "./utils.js"



const mapBadge = document.querySelector(".map-surface__badge");
const detailTrailName = document.querySelector('#detailTrailName')
const detailTrailDate = document.querySelector('#detailTrailDate')
const detailTrailDistance = document.querySelector('#detailDistance')
const detailTrailDuration = document.querySelector('#detailDuration')
const detailTrailPointCount = document.querySelector('#detailPoints')
const detailTrailAccurracy = document.querySelector('#detailAccuracy')
const detailTrailNotes = document.querySelector('#detailNotesText')


const editTrailInfoBtn = document.querySelector('#detailNotesEditBtn')
const modalScrim = document.querySelector('#editTrailModalScrim')
const editTrailModal = document.querySelector('#editTrailModal')
const trailModalTitle = document.querySelector('#editTrailModalTitle')
const editTrailForm = document.querySelector('#editTrailForm')
const editTrailNameInput = document.querySelector('#editTrailNameInput')
const editTrailNotesInput = document.querySelector('#editTrailNotesInput')
const cancelEditTrailBtn = document.querySelector('#cancelEditTrailBtn')
const confirmEditTrailBtn = document.querySelector('#confirmEditTrailBtn')


const deleteTrailBtn = document.querySelector('#deleteTrailBtn')
const deleteTrailModalScrim = document.querySelector('#deleteTrailModalScrim')
const deleteTrailModal = document.querySelector('#deleteTrailModal')
const deleteTrailModalName = document.querySelector('#deleteTrailModalName')
const cancelDeleteTrailBtn = document.querySelector('#cancelDeleteTrailBtn')
const confirmDeleteTrailBtn = document.querySelector('#confirmDeleteTrailBtn')

const backBtn = document.querySelector('#detailBackBtn')

const favoriteBtn = document.querySelector('#detailFavoriteBtn')

const shareTrailDetailBtn = document.querySelector('#detailShareBtn')


let trailID
let trailObj 
let isFavorite = false



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
  isFavorite = trailObj.trail.is_favorite

  mapBadge.textContent = trailName
  detailTrailName.textContent = trailName
  detailTrailDistance.innerHTML = `${trailDistance} <span class="unit">km</span>`
  detailTrailAccurracy.innerHTML = `${trailAccurracy.toFixed(2)} <span class="unit">m</span>` 
  detailTrailNotes.textContent = trailNotes
  detailTrailPointCount.textContent = pointCount
  detailTrailDate.textContent = date 
  detailTrailDuration.innerHTML = duration
  favoriteBtn.classList.toggle('is-favorited', isFavorite)
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

function openModal() {
  if (modalScrim) { modalScrim.classList.add('is-open')
  }
  
  if (editTrailModal) { editTrailModal.classList.add('is-open')
  }
}

function closeModal() {
  if (modalScrim) { modalScrim.classList.remove('is-open')
  }
  
  if (editTrailModal) { editTrailModal.classList.remove('is-open')
  }
}

async function markFavorite() {
  let hasIsFavorite = Object.hasOwn(trailObj.trail, 'is_favorite')

  if (hasIsFavorite && isFavorite) {
    try {
      isFavorite = false
      let res = await saveFvoriteStatus(trailID, isFavorite)
      
      if (res.status === 'error') {
        isFavorite = true
        console.error(res.message)
        notify("An Error Occurred", "toast-error")
        return
      }
      
      if(res.message_code === 1) {
        favoriteBtn.classList.toggle('is-favorited')
        notify("Favorite Status Updated", "toast-info")
        console.log('it has a favorite property and is favorite is true')
        return 
      }

      if (res.message_code === 0) {
        notify("Trail Not Found.", "toast-error")
        isFavorite = true
        return
      }
    } catch (error) {
      console.log("Fav Error: ", error)
      isFavorite = true
      notify("Could Not Update Favorite Status", "toast-error")
    }
  } else if (hasIsFavorite && isFavorite === false) {
    try {
      isFavorite = true
      let res = await saveFvoriteStatus(trailID, isFavorite)

      if (res.status === 'error') {
        isFavorite = false
        console.error(res.message)
        notify("An Error Occurred", "toast-error")
        return 
      }
    
      if (res.message_code === 1) {
        favoriteBtn.classList.toggle('is-favorited')
        notify("Favorite Status Updated", "toast-info")
        console.log('it has a favorite property and is favorite is true')
        return 
      }

      if (res.message_code === 0) {
        notify("Trail Not Found.", "toast-error")
        isFavorite = false
        return
      }
      
    } catch (error) {
      console.log("Fav Error: ", error)
      isFavorite = false
      notify("Could Not Update Favorite Status", "toast-error")
    }
  }

  if (!hasIsFavorite) {
    try {
      isFavorite = true
      let res = await saveFvoriteStatus(trailID, isFavorite)

      if (res.status === 'error') {
        isFavorite = false
        console.error(res.message)
        notify("An Error Occurred", "toast-error")
        return
      }
    
      if (res.message_code === 1) {
        favoriteBtn.classList.toggle('is-favorited')
      notify("Favorite Status Updated", "toast-info")
      console.log('it has a favorite property and is favorite is true')
      return 
      }

      if (res.message_code === 0) {
        notify("Trail Not Found.", "toast-error")
        isFavorite = false
        return
      }
    } catch (error) {
      console.log("Fav Error: ", error)
      isFavorite = false
      notify("Could Not Update Favorite Status", "toast-error")
    }
  }
}


async function shareTrailSummary() {
  if (trailObj.status === 'error') {
    console.log('Database failed to load');
    notify("Could Not Load Trail", "toast-error");
    return;
  }

  const trail = trailObj.trail;

  let shareText = `Trail: ${trail.name}
Distance: ${(trail.total_distance / 1000).toFixed(2)} km
Duration: ${calculateDuration(trail.start_time, trail.end_time)}
Recorded: ${calculateDateTime(trail.created_at)}
Recorded points: ${trail.point_count}`;

  if (trail.notes !== "") {
    shareText += `\nNotes: ${trail.notes}`;
  }

  const shareData = {
    title: `Talon Trace - ${trail.name}`,
    text: shareText
  };

  // Check whether the browser supports sharing.
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(shareData);
      console.log('Trail shared successfully');
    } catch (error) {
      if (error.name === 'AbortError') {
        // The user closed the share sheet.
        console.log('Sharing cancelled');
        return;
      }

      console.error('Share failed:', error);
      notify("Could Not Share Trail", "toast-error");
    }

    return;
  }

  // Fallback for browsers without the Web Share API.
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(shareText);
      notify("Trail Summary Copied", "toast-info");
    } catch (error) {
      console.error('Clipboard failed:', error);
      notify("Could Not Copy Trail Summary", "toast-error");
    }

    return;
  }

  notify("Sharing And Clipboard Are Not Supported", "toast-error");
}



if(trailObj.status !== 'error') {
  displayTrailDetails()
}



editTrailInfoBtn.addEventListener('click', () => {
  if (trailObj.status === 'error') {
    console.log("Database not loaded")
    return 
  }
  openModal()
  let trailName = trailObj.trail.name
  trailModalTitle.textContent = trailName
  editTrailNameInput.value = trailName
  editTrailNotesInput.value = trailObj.trail.notes 
})

cancelEditTrailBtn.addEventListener('click', () => {
  closeModal()
})

confirmEditTrailBtn.addEventListener('click', async (event) => {
  event.preventDefault()
  if (trailObj.status === "error") {
    console.log("Database failed to load")
    return 
  }
  try {
    let newTrailName = editTrailNameInput.value.trim()
    let newTrailNotes = editTrailNotesInput.value.trim()

    if (newTrailName === '') {
      console.log('trail field is empty')
      notify("Enter A Trail Name", "toast-error")
      return 
    }
    let exist = await checkIfExist(newTrailName, trailID)
    if (exist) {
      console.log("Trail name already exist")
      notify("Trail Name Already Exist!", "toast-error")
      return
    }
    
    let res = await updateTrail(trailID, newTrailName, newTrailNotes)

     if (res.status === "error") {
      console.log("Trail update failed:", res.message);
      notify("Could Not Update Trail", "toast-error");
      return;
    }
    
    if (res.message_code === 1) {
      console.log("trail saved successfully - ", res.message_code)
      trailObj = await getTrailObject()
      displayTrailDetails()
      notify("Trail Saved Successfully", "toast-success")
      closeModal()
      return 
    }

    if (res.message_code === 0) {
      console.log("trail was not saved")
      notify("Trail Was Not Found, It Seems It Was Deleted", "toast-error")
      closeModal()
      return 
    }

    
  } catch (error) {
    console.log("ERROR: ", error.message)
    notify("An Unknown Error Occurred!", "toast-error")
    closeModal()
    return 
  }
})

deleteTrailBtn.addEventListener('click', () => {
  deleteTrailModalScrim.classList.add("is-open")
  deleteTrailModal.classList.add("is-open")
  deleteTrailModalName.textContent = `${trailObj.trail.name}`
})

cancelDeleteTrailBtn.addEventListener('click', () => {
  deleteTrailModalScrim.classList.remove('is-open')
  deleteTrailModal.classList.remove('is-open')
})

confirmDeleteTrailBtn.addEventListener('click', async () => {
  if (trailObj.status === 'error') {
    console.log("Database failed to load")
    return
  }
  try {
    let res = await deleteTrail(trailID)
    if (res.status === 'success') {
      console.log('trail deleted successfully')
      deleteTrailModalScrim.classList.remove('is-open')
      deleteTrailModal.classList.remove('is-open')
      notify('Trail Deleted Successfully', 'toast-success')
      window.location.href = "trails.html"
      return 
    }

    if (res.status === 'error') {
      console.log('trail not deleted')
      deleteTrailModalScrim.classList.remove('is-open')
      deleteTrailModal.classList.remove('is-open')
      notify('Trail Not Deleted', 'toast-error')
      return
    }
  } catch (error) {
    console.error(error.message)
    notify('An Unknown Error Occurred', 'toast-error')
    return
  }
})

backBtn.addEventListener('click', () => {
  window.history.back()
})

favoriteBtn.addEventListener('click', () => {
  markFavorite()
})

shareTrailDetailBtn.addEventListener('click', async () => {
    let res = await shareTrailSummary()
  console.log(res)
})