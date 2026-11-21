// The screenshot scenes behind ?shot=start|play|play2|end. Each one stages a
// fixed, deterministic game state — the same seed always paints the same frame
// — so the screenshots are what a real game really looks like, not a mock-up.
//
//   start — title screen over round 1, clock at 90, "Sisa: 7".
//   play  — mid round 1: 3 of 7 differences found (markers visible), 4 left,
//           "Sisa: 4", clock at 62.
//   play2 — mid round 2: 4 of 7 found, 3 left, "Sisa: 3", clock at 45.
//   end   — win screen after all three rounds, fixed totals.
//
// The staged states are built by calling the same state constructor main.js
// uses, then applying the same "found" transitions the real game applies, so
// nothing in a shot is drawn by a separate code path.

import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN } from './render.js';
import { roundDifferences } from './differences.js';

const START_TIME_LEFT = 90;
const PLAY_TIME_LEFT = 62;
const PLAY2_TIME_LEFT = 45;

/** Mark the first `count` differences of a round as found, with fixed ring ages. */
function markFound(state, count) {
  const diffs = roundDifferences(state.roundIndex);
  for (let i = 0; i < count; i += 1) {
    const diff = diffs[i];
    state.found.add(diff.id);
    state.markers.push({ diff, born: 0 });
  }
  state.score = count * 100;
}

/**
 * Set `state` to the named scene and return the screen to draw over it.
 * Any unknown name stages the title screen.
 */
export function stageShot(name, state) {
  state.now = 1.2;
  state.shakeUntil = 0;
  state.hintFlash = null;
  state.wrongFlash = null;

  if (name === 'play') {
    state.screen = SCREEN_PLAY;
    state.roundIndex = 0;
    state.timeLeft = PLAY_TIME_LEFT;
    state.hintsLeft = 2;
    markFound(state, 3);
    state.correct = 3;
    state.wrong = 1;
    return SCREEN_PLAY;
  }
  if (name === 'play2') {
    state.screen = SCREEN_PLAY;
    state.roundIndex = 1;
    state.timeLeft = PLAY2_TIME_LEFT;
    state.hintsLeft = 1;
    markFound(state, 4);
    state.score = 700 + 4 * 100;
    state.correct = 11;
    state.wrong = 2;
    return SCREEN_PLAY;
  }
  if (name === 'end') {
    state.screen = SCREEN_WIN;
    state.roundIndex = 2;
    state.timeLeft = 0;
    state.hintsLeft = 0;
    state.score = 2450;
    state.correct = 21;
    state.wrong = 3;
    // All seven of round 3 found, so the header reads "Sisa: 0" like the win
    // card says; the markers sit behind the win overlay.
    markFound(state, 7);
    state.score = 2450;
    state.winStats = { totalScore: 2450, totalSeconds: 198, accuracy: 88 };
    state.best = 2450;
    return SCREEN_WIN;
  }
  state.screen = SCREEN_TITLE;
  state.roundIndex = 0;
  state.timeLeft = START_TIME_LEFT;
  state.hintsLeft = 3;
  state.score = 0;
  return SCREEN_TITLE;
}
