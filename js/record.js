let user_error_str
let geo_optional_args = {
  enableHighAccuracy: true,
  timeout: 120000,
  maximumAge: 0
}

function success_callback(position) {
  coordinates = position.coords
  lat = coordinates.latitude
  long = coordinates.longitude
  accuracy = coordinates.accuracy
  console.log({lat, long, accuracy})
}

function error_callback(error) {
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

function get_location() {
  let geolocation = navigator.geolocation
  if (!geolocation) {
    console.warn('Your browser does not support geolocation.')
    return
  }
  geolocation.watchPosition(success_callback, error_callback, geo_optional_args)
}
get_location()