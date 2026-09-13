const db = new Dexie('Talon_Trace_db')

db.version(1).stores({
  trail: '++id, &name, created_at'
})


export async function saveTrail(trailObj) {
  try {
  let id = await db.trail.add(trailObj) 
  return {
    status: "success",
    message: "Trail saved successfully",
    id: id
  }
  } catch (error) {
    return {
      status: "error",
      message: error.message
    }
  }
}

export async function getAllTrails(){
  try {
    let trail = await db.trail.toArray()
    return {
      status: "success",
      trail: trail
    }
  } catch (error) {
    return {
      status: "error", 
      message: error.message
    }
  }
  
}