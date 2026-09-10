let user_error_str
let coordsUpdate
export let matrixList = []
const MAX_ACCURACY = 20
const MIN_DISTANCE = 5
export const filteredCoords = Array()


export let geo_optional_args = {
  enableHighAccuracy: true,
  timeout: 120000,
  maximumAge: 0
}

export function success_callback(position) {
  const {latitude, longitude, accuracy} = position.coords
  let coords = {lat: latitude, long: longitude, accuracy}
  handleCoords(coords)
}

export function error_callback(error) {
  switch (error.code) {
    case 1:
      console.warn("User denied location access")
      user_error_str = "You denied location access. Kindly allow location for this site."
      break;
      case 2:
        console.warn("location information is not available")
        user_error_str = "Could not get your location information."
        break;
      case 3:
        console.warn("Request timeout")
        user_error_str = `Request timeout. Could not resolve your location within ${geo_optional_args.timeout / 60000} minutes`
        console.log(user_error_str)
        break;
      
    default:
      console.error("An unknown error occured", error.message)
      user_error_str = "An unknown error occurred"
  }
}


function handleCoords(coords) {
  filterCoords(coords)
  makeMatrixList()
  if (typeof coordsUpdate === 'function') {
    coordsUpdate()
  }
  console.table("Coords Table log",coords)
  console.log("Matrix log",matrixList)
}


function makeMatrixList() {
  matrixList.length = 0
  filteredCoords.forEach(coords => {
    matrixList.push([coords.lat, coords.long])
  })
  return matrixList
}


export function haversineDistance(point1, point2) {

  const R = 6371000

  const lat1 = point1.lat * Math.PI / 180
  const lat2 = point2.lat * Math.PI / 180

  const dLat =
    (point2.lat - point1.lat) * Math.PI / 180

  const dLong =
    (point2.long - point1.long) * Math.PI / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
    Math.cos(lat2) *
    Math.sin(dLong / 2) ** 2

  const c =
    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return R * c
}

function filterCoords(coords) {
  if (filteredCoords.length === 0) {
    filteredCoords.push(coords)
    console.log("First coordinates")
    console.log(filteredCoords)
    return
  } else {
  if (coords.accuracy <= MAX_ACCURACY) {
    let previous_coords
    if (filteredCoords.length === 1) {
      previous_coords = filteredCoords[0]
    } else {
      previous_coords = filteredCoords[filteredCoords.length - 1]
    }
  
   let distance = haversineDistance(previous_coords, coords)
    console.log(`Distance: ${distance}`)
    if (distance >= MIN_DISTANCE) {
         filteredCoords.push(coords)
         console.log("Coordinates pass minimum requirements")
         console.log("Filtered coords log in filteCoords function, last",filteredCoords)
         return
    }
  }
  }
  return 
}

export function updateTrailsCallback(callbackFunc) {
  coordsUpdate = callbackFunc
}