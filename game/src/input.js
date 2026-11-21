// Input: mouse clicks on the canvas and keyboard shortcuts, translated into
// game actions. The renderer owns the button rectangles; this module asks it
// where they are, so a click is never tested against a stale layout.
//
// Panel clicks are converted to panel-local coordinates and tested against the
// round's unfound differences; a click inside a difference's radius finds it
// on whichever panel was clicked.

import { PANEL } from './config.js';
import { distanceTo } from './differences.js';

export const ACTION = {
  NONE: 0,
  CLICK: 1 << 0,
  HINT: 1 << 1,
  RESTART: 1 << 2,
  MUTE: 1 << 3,
  CONFIRM: 1 << 4,
  ROUND_1: 1 << 5,
  ROUND_2: 1 << 6,
  ROUND_3: 1 << 7,
};

export function createInput(canvas, layout) {
  let queued = ACTION.NONE;
  let clickPoint = null;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  function pointInRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const point = toLogical(event);
    clickPoint = point;
    const buttons = layout.buttons();
    if (buttons.hint && pointInRect(point, buttons.hint)) queued |= ACTION.HINT;
    else if (buttons.mute && pointInRect(point, buttons.mute)) queued |= ACTION.MUTE;
    else if (buttons.again && pointInRect(point, buttons.again)) queued |= ACTION.CONFIRM;
    else if (buttons.next && pointInRect(point, buttons.next)) queued |= ACTION.CONFIRM;
    else queued |= ACTION.CLICK;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'h') queued |= ACTION.HINT;
    else if (key === 'r') queued |= ACTION.RESTART;
    else if (key === 'm') queued |= ACTION.MUTE;
    else if (key === '1') queued |= ACTION.ROUND_1;
    else if (key === '2') queued |= ACTION.ROUND_2;
    else if (key === '3') queued |= ACTION.ROUND_3;
    else if (key === ' ' || key === 'enter') queued |= ACTION.CONFIRM;
  });

  return {
    /** Actions queued since the last call, plus the last click point. */
    take() {
      const actions = queued;
      const point = clickPoint;
      queued = ACTION.NONE;
      clickPoint = null;
      return { actions, point };
    },
  };
}

/**
 * Which panel (0 left, 1 right) a logical point falls in, and its panel-local
 * coordinates — or null when the point is outside both panels.
 */
export function panelHit(point) {
  const { top, height, width, leftX, rightX } = PANEL;
  if (point.y < top || point.y > top + height) return null;
  if (point.x >= leftX && point.x <= leftX + width) {
    return { side: 0, x: point.x - leftX, y: point.y - top };
  }
  if (point.x >= rightX && point.x <= rightX + width) {
    return { side: 1, x: point.x - rightX, y: point.y - top };
  }
  return null;
}

/** The first unfound difference whose radius contains a panel-local point. */
export function differenceAt(differences, found, x, y) {
  for (const diff of differences) {
    if (found.has(diff.id)) continue;
    if (distanceTo(diff, x, y) <= diff.r) return diff;
  }
  return null;
}
