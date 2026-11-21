// Selisih Senja — every tuning number and colour in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const VIEW = { width: 1280, height: 720 };

/** Fixed simulation step, in seconds: 60 updates a second whatever the display rate. */
export const STEP = 1 / 60;

/** Seconds on the clock when a round starts. */
export const ROUND_SECONDS = 90;

/** How many differences each round hides. */
export const DIFFS_PER_ROUND = 7;

/** Hints allowed per round. */
export const HINTS_PER_ROUND = 3;

/** Seconds a wrong click costs. */
export const WRONG_PENALTY_SECONDS = 3;

/** Points for one found difference; round-clear bonus is seconds left x this. */
export const POINTS_PER_DIFF = 100;
export const BONUS_PER_SECOND = 5;

/** How long a hint ring stays visible, in seconds. */
export const HINT_FLASH_SECONDS = 2.5;

/** How long the expanding find-ring animates, in seconds. */
export const RING_ANIM_SECONDS = 0.45;

/** How long the screen shakes after a wrong click, in seconds. */
export const SHAKE_SECONDS = 0.28;

/** Panel geometry: two 560x420 panels with a gap between them. */
export const PANEL = {
  width: 560,
  height: 420,
  top: 90,
  leftX: 36,
  rightX: 684,
  radius: 14,
};

/** Header and footer bands. */
export const HEADER = { height: 58 };
export const TIMER_BAR = { top: 60, height: 10, margin: 36 };
export const FOOTER = { top: 514 };

/** Where the best total is kept between visits (this browser only). */
export const BEST_KEY = 'selisih-senja.best';

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PALETTE = {
  backdrop: '#17101f',
  headerBg: '#241530',
  headerLine: '#3d2547',
  panelFrame: '#f5e6c8',
  panelFrameFound: '#37d67a',
  text: '#fdf6e3',
  muted: '#c9b8a3',
  accent: '#ffb347',
  accentSoft: '#ffd76a',
  danger: '#ff5d5d',
  ok: '#37d67a',
  hint: '#6ec6ff',
  button: '#7a3b2e',
  buttonHover: '#93503f',
  buttonText: '#fdf6e3',
  overlay: 'rgba(16, 8, 24, 0.82)',
  card: '#2c1b3d',
  cardLine: '#5a3a6e',
};

/** Per-round display names, in Indonesian. */
export const ROUND_NAMES = ['Taman Senja', 'Warung Kopi', 'Pasar Malam'];
