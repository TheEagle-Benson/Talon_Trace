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

export async function getTrail(id) {
  
  try {
    let trail = await db.trail.get(id)
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

export async function updateTrail(id, name = null, notes = null) {
  try {
    let updateObject = {}
    if (name !== null) {
      updateObject["name"] = name
    }
    if (notes !== null) {
      updateObject["notes"] = notes
    }
    if (Object.keys(updateObject).length === 0
) {
      return {
        status: "error",
        message: "Provide name or notes to be able to update this trail."
      } 
    }
    let update_code = await db.trail.update(id, updateObject)
    return {
      status: "success",
      message_code: update_code
    }
  } catch (error) {
    return {
      status: "error",
      message: error.message
    }
  }
}