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
  console.error(error)
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