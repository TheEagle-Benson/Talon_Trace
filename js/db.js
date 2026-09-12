const db = new Dexie('Talon_Trace_db')

db.version(1).stores({
  trail: '++id, name, created_at'
})

export async function saveTrail(trailObj) {
  return await db.trail.add(trailObj)
}

export async function getAllTrails(){
  return await db.trail.toArray()
}