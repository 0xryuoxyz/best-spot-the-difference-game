// The renderer: paints the whole 1280x720 logical view every frame — header,
// timer bar, both panels, markers, footer buttons, and the screen overlays.
// It never owns game rules; main.js owns the state and hands it over each frame.
//
// Buttons are drawn here and their rectangles are exposed through buttons(),
// so input.js can test clicks against exactly what is on screen.

import { VIEW, PANEL, HEADER, TIMER_BAR, FOOTER, PALETTE, FONT, ROUND_NAMES, ROUND_SECONDS, RING_ANIM_SECONDS } from './config.js';
import { roundDifferences } from './differences.js';
import { drawScene } from './scenes.js';
import { createRandom } from './rng.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_SUMMARY = 'summary';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

const HINT_BUTTON = { x: 36, y: 524, w: 200, h: 52 };
const MUTE_BUTTON = { x: 250, y: 524, w: 170, h: 52 };

function easeOut(p) {
  return 1 - (1 - p) * (1 - p);
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const scale = { x: 1, y: 1 };
  let buttons = {};

  function fit() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = VIEW.width * dpr;
    canvas.height = VIEW.height * dpr;
    scale.x = canvas.width / VIEW.width;
    scale.y = canvas.height / VIEW.height;
  }

  fit();
  window.addEventListener('resize', fit);

  function panelOrigin(side) {
    return { x: side === 0 ? PANEL.leftX : PANEL.rightX, y: PANEL.top };
  }

  function drawPanelFrame(side) {
    const origin = panelOrigin(side);
    ctx.save();
    ctx.strokeStyle = PALETTE.panelFrame;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(origin.x - 4, origin.y - 4, PANEL.width + 8, PANEL.height + 8, PANEL.radius + 4);
    ctx.stroke();
    ctx.restore();
  }

  function drawPanels(state) {
    for (const side of [0, 1]) {
      const origin = panelOrigin(side);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(origin.x, origin.y, PANEL.width, PANEL.height, PANEL.radius);
      ctx.clip();
      // Scenes paint in panel-local coordinates (0..560, 0..420).
      ctx.translate(origin.x, origin.y);
      drawScene(ctx, state.roundIndex, side);
      ctx.restore();
      drawPanelFrame(side);
    }
    // "VS" badge in the gap between the panels.
    const gapX = PANEL.leftX + PANEL.width + (PANEL.rightX - (PANEL.leftX + PANEL.width)) / 2;
    const gapY = PANEL.top + PANEL.height / 2;
    ctx.fillStyle = PALETTE.accent;
    ctx.beginPath();
    ctx.arc(gapX, gapY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#241530';
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VS', gapX, gapY + 1);
  }

  function drawMarker(diff, born, now) {
    const age = now - born;
    const p = Math.min(1, age / RING_ANIM_SECONDS);
    const radius = 10 + (diff.r + 6 - 10) * easeOut(p);
    const alpha = age < 3 ? 1 : 0.85;
    for (const side of [0, 1]) {
      const origin = panelOrigin(side);
      const x = origin.x + diff.x;
      const y = origin.y + diff.y;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(55, 214, 122, 0.20)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = PALETTE.ok;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();
      // Check mark.
      const s = radius * 0.55;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(x - s * 0.8, y + s * 0.05);
      ctx.lineTo(x - s * 0.15, y + s * 0.6);
      ctx.lineTo(x + s * 0.9, y - s * 0.55);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawHintFlash(state) {
    const flash = state.hintFlash;
    if (!flash) return;
    const diff = roundDifferences(state.roundIndex).find((d) => d.id === flash.diffId);
    if (!diff) return;
    const pulse = 3 * Math.sin(state.now * 7);
    for (const side of [0, 1]) {
      const origin = panelOrigin(side);
      const x = origin.x + diff.x;
      const y = origin.y + diff.y;
      ctx.save();
      ctx.strokeStyle = PALETTE.hint;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(x, y, diff.r + 10 + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawWrongFlash(state) {
    const flash = state.wrongFlash;
    if (!flash) return;
    const age = state.now - flash.born;
    if (age > 0.6) return;
    const alpha = 1 - age / 0.6;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = PALETTE.danger;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    const s = 16;
    ctx.beginPath();
    ctx.moveTo(flash.x - s, flash.y - s);
    ctx.lineTo(flash.x + s, flash.y + s);
    ctx.moveTo(flash.x + s, flash.y - s);
    ctx.lineTo(flash.x - s, flash.y + s);
    ctx.stroke();
    ctx.restore();
  }

  function drawHeader(state) {
    ctx.fillStyle = PALETTE.headerBg;
    ctx.fillRect(0, 0, VIEW.width, HEADER.height);
    ctx.fillStyle = PALETTE.headerLine;
    ctx.fillRect(0, HEADER.height - 2, VIEW.width, 2);

    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 30px ${FONT}`;
    ctx.fillText('SELISIH SENJA', 36, 40);

    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `600 21px ${FONT}`;
    const roundLabel = state.screen === SCREEN_TITLE
      ? 'Cari 7 perbedaan di setiap ronde'
      : `RONDE ${state.roundIndex + 1} · ${ROUND_NAMES[state.roundIndex]}`;
    ctx.fillText(roundLabel, 640, 38);

    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `600 22px ${FONT}`;
    ctx.fillText(`${Math.ceil(state.timeLeft)} dtk`, 930, 39);
    ctx.fillStyle = PALETTE.accentSoft;
    ctx.font = `bold 26px ${FONT}`;
    ctx.fillText(`Sisa: ${state.remaining}`, 1070, 40);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `600 22px ${FONT}`;
    ctx.fillText(`Skor ${state.score}`, 1244, 39);
  }

  function drawTimerBar(state) {
    const x = TIMER_BAR.margin;
    const w = VIEW.width - TIMER_BAR.margin * 2;
    const fraction = Math.max(0, Math.min(1, state.timeLeft / ROUND_SECONDS));
    ctx.fillStyle = '#0f0a16';
    ctx.beginPath();
    ctx.roundRect(x, TIMER_BAR.top, w, TIMER_BAR.height, 5);
    ctx.fill();
    const low = state.timeLeft <= 15 && state.screen === SCREEN_PLAY;
    const fill = ctx.createLinearGradient(x, 0, x + w, 0);
    if (low) {
      fill.addColorStop(0, '#ff5d5d');
      fill.addColorStop(1, '#ff9e57');
    } else {
      fill.addColorStop(0, '#ffb347');
      fill.addColorStop(1, '#37d67a');
    }
    ctx.fillStyle = fill;
    if (fraction > 0) {
      ctx.beginPath();
      ctx.roundRect(x, TIMER_BAR.top, Math.max(12, w * fraction), TIMER_BAR.height, 5);
      ctx.fill();
    }
  }

  function drawButton(rect, label, sublabel, enabled) {
    ctx.save();
    ctx.fillStyle = enabled ? PALETTE.button : '#4a3448';
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.strokeStyle = PALETTE.cardLine;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = enabled ? PALETTE.buttonText : PALETTE.muted;
    ctx.font = `bold 19px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + 24);
    if (sublabel) {
      ctx.font = `13px ${FONT}`;
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText(sublabel, rect.x + rect.w / 2, rect.y + 43);
    }
    ctx.restore();
  }

  function drawFooter(state) {
    const inPlay = state.screen === SCREEN_PLAY;
    buttons = {};
    if (inPlay) {
      buttons.hint = HINT_BUTTON;
      drawButton(HINT_BUTTON, `HINT · ${state.hintsLeft} tersisa`, 'tombol H', state.hintsLeft > 0);
      buttons.mute = MUTE_BUTTON;
      drawButton(MUTE_BUTTON, state.muted ? 'SUARA: MATI' : 'SUARA: NYALA', 'tombol M', true);
    }
    // Round progress dots.
    ctx.textAlign = 'right';
    ctx.font = `600 17px ${FONT}`;
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText('Ronde', 1010, 556);
    for (let i = 0; i < 3; i += 1) {
      const cx = 1040 + i * 34;
      const done = i < state.roundIndex || (i === state.roundIndex && state.screen === SCREEN_WIN);
      const current = i === state.roundIndex && state.screen !== SCREEN_WIN;
      ctx.beginPath();
      ctx.arc(cx, 550, 11, 0, Math.PI * 2);
      ctx.fillStyle = done ? PALETTE.ok : current ? PALETTE.accent : '#4a3448';
      ctx.fill();
      ctx.fillStyle = done || current ? '#241530' : PALETTE.muted;
      ctx.font = `bold 13px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), cx, 555);
    }
    // Instructions.
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.fillText('H = Hint   ·   R = Ulang ronde   ·   M = Suara   ·   1 / 2 / 3 = Lompat ronde (latihan)', 36, 620);
    ctx.fillText('Temukan 7 perbedaan sebelum waktu habis. Klik salah mengurangi 3 detik.', 36, 644);
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText('Dua gambar hampir sama — tujuh selisih tersembunyi.', 1244, 620);
    if (state.best > 0) ctx.fillText(`Skor terbaik: ${state.best}`, 1244, 644);
  }

  function drawCard(title, lines, buttonLabel) {
    const cardW = 620;
    const cardH = 150 + lines.length * 34 + (buttonLabel ? 84 : 0);
    const x = (VIEW.width - cardW) / 2;
    const y = (VIEW.height - cardH) / 2;
    ctx.save();
    ctx.fillStyle = PALETTE.overlay;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = PALETTE.card;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.cardLine;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 40px ${FONT}`;
    ctx.fillText(title, VIEW.width / 2, y + 62);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `20px ${FONT}`;
    lines.forEach((line, i) => {
      ctx.fillText(line, VIEW.width / 2, y + 108 + i * 34);
    });
    if (buttonLabel) {
      const button = { x: VIEW.width / 2 - 160, y: y + cardH - 66, w: 320, h: 50 };
      buttons.next = button;
      buttons.again = button;
      drawButton(button, buttonLabel, null, true);
    }
    ctx.restore();
    return { x, y, w: cardW, h: cardH };
  }

  function drawConfetti(now) {
    const random = createRandom(7);
    const colours = ['#ffb347', '#37d67a', '#6ec6ff', '#ff6b6b', '#ffd76a'];
    for (let i = 0; i < 48; i += 1) {
      const x = random() * VIEW.width;
      const speed = 30 + random() * 60;
      const y = (random() * VIEW.height + now * speed) % VIEW.height;
      const size = 5 + random() * 7;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(random() * Math.PI);
      ctx.fillStyle = colours[i % colours.length];
      ctx.globalAlpha = 0.85;
      ctx.fillRect(-size / 2, -size / 2, size, size * 0.6);
      ctx.restore();
    }
  }

  function draw(state) {
    ctx.save();
    ctx.setTransform(scale.x, 0, 0, scale.y, 0, 0);
    // Screen shake after a wrong click: a small deterministic wobble.
    if (state.shakeUntil && state.now < state.shakeUntil) {
      const amp = 5 * (1 - (state.shakeUntil - state.now) / 0.28);
      ctx.translate(Math.sin(state.now * 97) * amp, Math.cos(state.now * 83) * amp * 0.7);
    }
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(-10, -10, VIEW.width + 20, VIEW.height + 20);

    drawHeader(state);
    drawTimerBar(state);
    drawPanels(state);
    for (const marker of state.markers) drawMarker(marker.diff, marker.born, state.now);
    drawHintFlash(state);
    drawWrongFlash(state);
    drawFooter(state);

    if (state.screen === SCREEN_TITLE) {
      ctx.save();
      ctx.fillStyle = 'rgba(16, 8, 24, 0.55)';
      ctx.fillRect(0, HEADER.height, VIEW.width, VIEW.height - HEADER.height);
      ctx.textAlign = 'center';
      ctx.fillStyle = PALETTE.accent;
      ctx.font = `bold 64px ${FONT}`;
      ctx.fillText('SELISIH SENJA', 640, 250);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `24px ${FONT}`;
      ctx.fillText('Dua gambar hampir sama. Tujuh selisih tersembunyi.', 640, 296);
      ctx.fillText('Tiga ronde — taman, warung, dan pasar malam.', 640, 330);
      ctx.fillStyle = PALETTE.muted;
      ctx.font = `19px ${FONT}`;
      ctx.fillText('90 detik per ronde · 3 hint per ronde · klik salah −3 detik', 640, 366);
      const blink = 0.55 + 0.45 * Math.sin(state.now * 3);
      ctx.globalAlpha = blink;
      ctx.fillStyle = PALETTE.accentSoft;
      ctx.font = `bold 26px ${FONT}`;
      ctx.fillText('Klik di mana saja untuk mulai', 640, 440);
      ctx.restore();
      buttons = {};
    } else if (state.screen === SCREEN_SUMMARY && state.summary) {
      const s = state.summary;
      drawCard(
        `Ronde ${s.roundIndex + 1} Selesai!`,
        [
          `Perbedaan ditemukan: ${s.foundCount} / 7`,
          `Waktu tersisa: ${s.secondsLeft} detik  →  bonus +${s.bonus}`,
          `Akurasi ronde ini: ${s.accuracy}%`,
          `Skor ronde: ${s.roundScore}`,
        ],
        s.roundIndex < 2 ? 'Ronde Berikutnya →' : 'Lihat Hasil',
      );
    } else if (state.screen === SCREEN_WIN && state.winStats) {
      drawConfetti(state.now);
      const w = state.winStats;
      drawCard(
        'Kamu Menang!',
        [
          'Semua 21 perbedaan ditemukan.',
          `Skor total: ${w.totalScore}`,
          `Waktu total: ${w.totalSeconds} detik   ·   Akurasi: ${w.accuracy}%`,
          state.best > 0 ? `Skor terbaik: ${state.best}` : 'Skor terbaik pertamamu!',
        ],
        'Main Lagi',
      );
    } else if (state.screen === SCREEN_OVER) {
      drawCard(
        'Waktu Habis!',
        [
          `Ronde ${state.roundIndex + 1} belum selesai.`,
          `Perbedaan ditemukan: ${state.found.size} / 7`,
          `Skor sejauh ini: ${state.score}`,
        ],
        'Coba Lagi',
      );
    }
    ctx.restore();
  }

  return {
    draw,
    buttons() {
      return buttons;
    },
  };
}
