import { getTrail } from "./db.js";


const mapBadge = document.querySelector(".map-surface__badge");
const detailTrailName = document.querySelector('#detailTrailName')
const detailTrailDate = document.querySelector('#detailTrailDate')
const detailTrailDistance = document.querySelector('#detailDistance')
const detailTrailDuration = document.querySelector('#detailDuration')
const detailTrialPointCount = document.querySelector('#detailPoints')
const detailTrailAccurracy = document.querySelector('#detailAccuracy')
const detailTrailNotes = document.querySelector('#detailNotesText')



async function getTrailObject() {
  const params = new URLSearchParams(window.location.search);
  let id = Number(params.get("trailid"));
  let trailObject = await getTrail(id);
  console.log(trailObject);
  return trailObject;
}

