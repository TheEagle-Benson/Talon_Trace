import { getAllTrails } from './db.js';

let trailListContainer = document.querySelector("#trailListContainer")

function createButtonCard(trailTitle, trailDistance, numberOfPoints, trailDate, trailID) {
  let buttonCard = `<button class="trail-card" data-trail-id=${trailID}>
        <span class="trail-card__thumb">
          <svg viewBox="0 0 66 66" fill="none" aria-hidden="true"><path d="M14 50 L30 45 L28 30 L42 22" stroke="#D9922E" stroke-width="2" stroke-linecap="round" fill="none"/><circle cx="14" cy="50" r="2.5" fill="#3FC9A8"/><circle cx="42" cy="22" r="2.5" fill="#D9922E"/></svg>
        </span>
        <span class="trail-card__body">
          <span class="trail-card__name">${trailTitle}</span>
          <span class="trail-card__stats"><span class="dist">${(trailDistance / 1000).toFixed(2)} km</span><span class="sep">·</span>${numberOfPoints} points</span>
          <span class="trail-card__date">${trailDate}</span>
        </span>
      </button>`
      return buttonCard
}