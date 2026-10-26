import { haversineDistance } from "./gps.js"

import { notify } from "./utils.js"


const TRAILHEAD_THRESHOLD = 30
const MAX_DISTANCE = 10
const MAX_ACCURACY = 20

const geo_optional_args = {
  enableHighAccuracy: true,
  timeout: 120000,
  maximumAge: 0
}

let watchID = null
let isWatching = false
let savedTrail = null

function success_callback(position) {
  const {latitude, longitude, accuracy} = position.coords
  let coords = {lat: latitude, long: longitude, accuracy, timestamp: position.timestamp}
  handleCoords(coords)
}

function error_callback(error) {
  let user_error_str = ""
    switch (error.code) {
      case 1:
        console.warn("User denied location access")
        user_error_str = "You denied location access. Kindly allow location for this site."
        notify(user_error_str, "toast-error")
        break;
        case 2:
          console.warn("location information is not available")
          user_error_str = "Could not get your location information."
          notify(user_error_str, "toast-info")
          break;
        case 3:
          console.warn("Request timeout")
          user_error_str = `Request timeout. Could not resolve your location within ${geo_optional_args.timeout / 60000} minutes`
          notify(user_error_str, "toast-info")
          console.log(user_error_str)
          break;
        
        default:
          console.error("An unknown error occured", error.message)
          user_error_str = "An unknown error occurred"
          notify(user_error_str, "toast-error")
          console.log(user_error_str)
  }
}


export function watchLocation(trailCoords) {
  if (isWatching) {
    console.log("already started watch")
    notify("GPS Already Started!", "toast-info")
    return
  }
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.log("browser does not support geolocation")
    notify("Your Browser Does Not Support Location Services.", "toast-error")
    return 
  }
  savedTrail = trailCoords
  watchID = geolocation.watchPosition(success_callback, error_callback, geo_optional_args)
  isWatching = true
}

function handleCoords(coords) {
  if (checkAccuracy(coords)) {
    routeNavigation(coords)
  }
  return 
}

function checkAccuracy(coords) {
  if (coords.accuracy <= MAX_ACCURACY) {
    return true
  }
  return false
}

function routeNavigation(coords) {
  let distanceToTrailHead = haversineDistance(coords, savedTrail[0])
  console.log("distance to head: ", distanceToTrailHead)

  if (distanceToTrailHead <= TRAILHEAD_THRESHOLD) {
    //perform offline operation and return 
  } else {
    // perform online operations if only the is an actual internet connnection and return 
  }
  
}