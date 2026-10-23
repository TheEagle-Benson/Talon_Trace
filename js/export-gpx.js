export function createGPX(trailObj) {
  let trail = trailObj.trail
  let xml = `
<?xml version="1.0" encoding="UTF-8"?>
<gpx
  version="1.1"
  creator="Talon Trace"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:talon="https://www.talontrace.dev/gpx">

  <metadata>
    <name>${escapeXML(trail.name)}</name>
    <desc>${escapeXML(trail.notes)}</desc>
  </metadata>

  <trk>
    <name>${escapeXML(trail.name)}</name>
    <extensions>
      <talon:totaldistance>${trail.total_distance}</talon:totaldistance>
      <talon:starttime>${trail.start_time}</talon:starttime>
      <talon:endtime>${trail.end_time}</talon:endtime>
      <talon:createdat>${trail.created_at}</talon:createdat>
      <talon:isfavorite>${trail.is_favorite}</talon:isfavorite>
      <talon:pointcount>${trail.point_count}</talon:pointcount>
    </extensions>
    <trkseg>
      ${loopCoords(trail.coords)}
    </trkseg>
  </trk>

</gpx>

  `
  downloadGPXFile(xml, trail.name)
  return xml
}

function loopCoords(coords) {
  let segmentString = ""
  coords.forEach(coord => {
    segmentString += `
      <trkpt lat="${coord.lat}" lon="${coord.long}">
        <time>${new Date(coord.timestamp).toISOString()}</time>
        <extensions>
          <talon:accuracy>${coord.accuracy}</talon:accuracy>
        </extensions>
      </trkpt>
    `
  })
  return segmentString
}

function downloadGPXFile(XMLStr, trailName) {
  const blob = new Blob([XMLStr.trim()], {type: 'application/gpx+xml;charset=utf-8;'})

  let url = URL.createObjectURL(blob)
  let link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFilename(trailName)}_trail.gpx`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => {
      URL.revokeObjectURL(url)
  }, 5000)
}

function escapeXML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function sanitizeFilename(name) {
  return String(name ?? "trail")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .trim() || "trail"
}