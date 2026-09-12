import { haversineDistance } from './gps.js';

export function calculateTotalDistance(arrayObject) {
  let totalDistanceInMeters = 0
  if (arrayObject.length === 0) {
    return 0
  }
  for (let i = 1; i < arrayObject.length; i++) {
    let previous = arrayObject[i - 1]
    let next = arrayObject[i]
    totalDistanceInMeters += haversineDistance(previous, next)
  }
  return totalDistanceInMeters
}

export function calculateTotalElapsedTime(elapsedTimeBeforePaused, startTime, endTime) {
  let duration = elapsedTimeBeforePaused + (endTime - startTime)
  
  const durationInSeconds = Math.floor(duration / 1000)
  let seconds = (durationInSeconds % 60)

  let minutes = Math.floor(
  ((durationInSeconds / 60) % 60)
  )

  let hours = Math.floor(
  (durationInSeconds / 3600)
  )
  return [hours, minutes, seconds]
}

export function formatTime(timeArray) {
  return timeArray.map(v =>String(v).padStart(2, '0')).join(':')
}
