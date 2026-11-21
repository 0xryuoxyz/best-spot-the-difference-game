// Boot and the one loop: input is read every frame, the clock ticks with real
// elapsed time (clamped so a hidden tab never eats the round), and the renderer
// paints what is there. The game moves between five screens: title, play,
// round summary, win, and game over.
//
// ?seed=N fixes the decorative random stream. ?shot=start|play|play2|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice and
// sets window.__shotReady for a screenshot.
//
// A small debug handle, window.__selisih, exposes read-only state plus the few
// actions the automated tests need (jump to a round, set the clock). It only
// drives the same transitions the UI drives.

import { BEST_KEY, ROUND_SECONDS, DIFFS_PER_ROUND, HINTS_PER_ROUND, WRONG_PENALTY_SECONDS, POINTS_PER_DIFF, BONUS_PER_SECOND, HINT_FLASH_SECONDS, SHAKE_SECONDS } from './config.js';
import { createRandom } from './rng.js';
import { ROUNDS, roundDifferences } from './differences.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_TITLE, SCREEN_PLAY, SCREEN_SUMMARY, SCREEN_WIN, SCREEN_OVER } from './render.js';
import { createInput, ACTION, panelHit, differenceAt } from './input.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const audio = createAudio();
const random = createRandom(seed);
const input = createInput(canvas, renderer);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** A fresh per-round state. */
function freshRound(roundIndex) {
  return {
    screen: SCREEN_PLAY,
    roundIndex,
    found: new Set(),
    markers: [],
    hintsLeft: HINTS_PER_ROUND,
    timeLeft: ROUND_SECONDS,
    score: 0,
    correct: 0,
    wrong: 0,
    hintFlash: null,
    wrongFlash: null,
    shakeUntil: 0,
    summary: null,
    winStats: null,
    now: 0,
  };
}

/** The whole game state. */
function createState() {
  const state = freshRound(0);
  state.screen = SCREEN_TITLE;
  state.totalScore = 0;
  state.totalSeconds = 0;
  state.totalCorrect = 0;
  state.totalWrong = 0;
  state.best = readBest();
  return state;
}

const state = createState();

function remaining() {
  return DIFFS_PER_ROUND - state.found.size;
}

function viewState() {
  return {
    ...state,
    remaining: remaining(),
    muted: audio.isMuted(),
  };
}

function announce(message) {
  status.textContent = message;
}

function startRound(roundIndex) {
  const keep = {
    totalScore: state.totalScore,
    totalSeconds: state.totalSeconds,
    totalCorrect: state.totalCorrect,
    totalWrong: state.totalWrong,
    best: state.best,
  };
  Object.assign(state, freshRound(roundIndex), keep);
  announce(`Ronde ${roundIndex + 1}: ${ROUNDS[roundIndex].name}. Cari 7 perbedaan.`);
}

function startGame() {
  state.totalScore = 0;
  state.totalSeconds = 0;
  state.totalCorrect = 0;
  state.totalWrong = 0;
  startRound(0);
}

function finishRound() {
  const secondsLeft = Math.ceil(state.timeLeft);
  const bonus = secondsLeft * BONUS_PER_SECOND;
  const roundScore = state.score + bonus;
  state.totalScore += roundScore;
  state.totalSeconds += Math.round(ROUND_SECONDS - state.timeLeft);
  state.totalCorrect += state.correct;
  state.totalWrong += state.wrong;
  const attempts = state.correct + state.wrong;
  state.summary = {
    roundIndex: state.roundIndex,
    foundCount: state.found.size,
    secondsLeft,
    bonus,
    roundScore,
    accuracy: attempts === 0 ? 100 : Math.round((state.correct / attempts) * 100),
  };
  state.screen = SCREEN_SUMMARY;
  audio.roundClear();
  announce(`Ronde ${state.roundIndex + 1} selesai. Skor ronde ${roundScore}.`);
}

function finishGame() {
  const totalAttempts = state.totalCorrect + state.totalWrong;
  state.winStats = {
    totalScore: state.totalScore,
    totalSeconds: state.totalSeconds,
    accuracy: totalAttempts === 0 ? 100 : Math.round((state.totalCorrect / totalAttempts) * 100),
  };
  if (state.totalScore > state.best) {
    state.best = state.totalScore;
    saveBest(state.best);
  }
  state.screen = SCREEN_WIN;
  audio.win();
  announce(`Menang! Skor total ${state.totalScore}.`);
}

function gameOver() {
  state.screen = SCREEN_OVER;
  audio.gameOver();
  announce(`Waktu habis di ronde ${state.roundIndex + 1}.`);
}

function useHint() {
  if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return;
  const unfound = roundDifferences(state.roundIndex).filter((d) => !state.found.has(d.id));
  if (unfound.length === 0) return;
  const pick = unfound[Math.floor(random() * unfound.length)];
  state.hintsLeft -= 1;
  state.hintFlash = { diffId: pick.id, until: state.now + HINT_FLASH_SECONDS };
  audio.hint();
  announce(`Hint: perhatikan ${pick.label.toLowerCase()}.`);
}

function handleClick(point) {
  if (!point) return;
  const hit = panelHit(point);
  if (!hit) return;
  const diff = differenceAt(roundDifferences(state.roundIndex), state.found, hit.x, hit.y);
  if (diff) {
    state.found.add(diff.id);
    state.markers.push({ diff, born: state.now });
    state.score += POINTS_PER_DIFF;
    state.correct += 1;
    audio.found();
    announce(`${diff.label} ditemukan! Sisa ${remaining()}.`);
    if (state.found.size === DIFFS_PER_ROUND) finishRound();
  } else {
    state.wrong += 1;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY_SECONDS);
    state.wrongFlash = { x: point.x, y: point.y, born: state.now };
    state.shakeUntil = state.now + SHAKE_SECONDS;
    audio.wrong();
    announce(`Bukan di sana. Waktu berkurang ${WRONG_PENALTY_SECONDS} detik.`);
  }
}

function handleActions() {
  const { actions, point } = input.take();
  if (actions & ACTION.MUTE) {
    audio.setMuted(!audio.isMuted());
    announce(audio.isMuted() ? 'Suara mati.' : 'Suara nyala.');
  }
  if (actions & ACTION.RESTART && (state.screen === SCREEN_PLAY || state.screen === SCREEN_OVER)) {
    startRound(state.roundIndex);
    return;
  }
  if (actions & ACTION.ROUND_1) startRound(0);
  else if (actions & ACTION.ROUND_2) startRound(1);
  else if (actions & ACTION.ROUND_3) startRound(2);
  if (actions & ACTION.HINT) useHint();
  if (state.screen === SCREEN_TITLE && (actions & (ACTION.CONFIRM | ACTION.CLICK))) {
    audio.unlock();
    startGame();
  } else if (state.screen === SCREEN_SUMMARY && (actions & ACTION.CONFIRM)) {
    audio.unlock();
    if (state.roundIndex < 2) startRound(state.roundIndex + 1);
    else finishGame();
  } else if (state.screen === SCREEN_WIN && (actions & ACTION.CONFIRM)) {
    audio.unlock();
    startGame();
  } else if (state.screen === SCREEN_OVER && (actions & ACTION.CONFIRM)) {
    audio.unlock();
    startRound(state.roundIndex);
  } else if (state.screen === SCREEN_PLAY && (actions & ACTION.CLICK)) {
    audio.unlock();
    handleClick(point);
  }
}

function runShot(name) {
  const screen = stageShot(name, state);
  state.screen = screen;
  let painted = 0;
  function paint() {
    renderer.draw(viewState());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let last = performance.now();

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    state.now += dt;
    if (state.hintFlash && state.now >= state.hintFlash.until) state.hintFlash = null;
    handleActions();
    if (state.screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        gameOver();
      }
    }
    renderer.draw(viewState());
  }

  announce('Selisih Senja. Klik di mana saja untuk mulai.');
  requestAnimationFrame(frame);
}

// Debug handle for the automated tests: read-only state plus the same
// transitions the UI drives. Not a player cheat path.
window.__selisih = {
  state() {
    return {
      screen: state.screen,
      roundIndex: state.roundIndex,
      found: [...state.found],
      remaining: remaining(),
      hintsLeft: state.hintsLeft,
      timeLeft: state.timeLeft,
      score: state.score,
      totalScore: state.totalScore,
      correct: state.correct,
      wrong: state.wrong,
      summary: state.summary,
      winStats: state.winStats,
    };
  },
  differences(roundIndex) {
    return roundDifferences(roundIndex);
  },
  setTimeLeft(seconds) {
    state.timeLeft = seconds;
  },
  startRound(roundIndex) {
    startRound(roundIndex);
  },
};

if (shot) runShot(shot);
else runGame();
