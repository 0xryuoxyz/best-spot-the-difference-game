// The three scenes, drawn procedurally with Canvas 2D vector shapes — no external
// assets, no downloaded images, no web fonts. Each painter draws one panel in
// panel-local coordinates (560x420); `side` 0 is the original (left panel), 1 is
// the modified version (right panel). The branches key off the difference ids in
// differences.js, so the right panel differs from the left in exactly the seven
// listed ways and nowhere else.
//
// A caller translates the context to the panel origin and clips to the panel
// before calling drawScene, so painters never need to know where the panel is.

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h) {
  ctx.fillRect(x, y, w, h);
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function strokePoly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
}

/** A small "v" bird, two short strokes. */
function bird(ctx, x, y, scale) {
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#3a2438';
  strokePoly(ctx, [[x - 9 * scale, y], [x, y - 6 * scale], [x + 9 * scale, y]]);
}

/** A five-petal flower: stem, petals, centre. */
function flower(ctx, x, y, petal, centre, size) {
  ctx.strokeStyle = '#2f6b45';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  ctx.lineTo(x, y + 14);
  ctx.stroke();
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(ctx, x + Math.cos(a) * size * 0.62, y + Math.sin(a) * size * 0.62, size * 0.55);
  }
  ctx.fillStyle = centre;
  circle(ctx, x, y, size * 0.5);
}

// ---------------------------------------------------------------------------
// Round 1 — Taman Senja: a park at dusk, pond, lanterns, bench.
// ---------------------------------------------------------------------------
function drawPark(ctx, side) {
  // Sky: warm dusk gradient.
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#ff9e57');
  sky.addColorStop(0.55, '#c65f7e');
  sky.addColorStop(1, '#6b3a6e');
  ctx.fillStyle = sky;
  rect(ctx, 0, 0, 560, 300);

  // Sun — missing on the right (diff: sun).
  if (side === 0) {
    ctx.fillStyle = 'rgba(255, 215, 106, 0.35)';
    circle(ctx, 110, 90, 52);
    ctx.fillStyle = '#ffd76a';
    circle(ctx, 110, 90, 34);
    ctx.fillStyle = '#ffedb0';
    circle(ctx, 110, 90, 22);
  }

  // Soft clouds.
  ctx.fillStyle = 'rgba(247, 200, 160, 0.55)';
  ellipse(ctx, 250, 70, 46, 12);
  ellipse(ctx, 280, 62, 34, 10);
  ellipse(ctx, 470, 130, 40, 10);

  // Birds — the middle one is missing on the right (diff: bird).
  bird(ctx, 300, 72, 1);
  if (side === 0) bird(ctx, 340, 56, 1);
  bird(ctx, 382, 76, 1);

  // Distant hills.
  ctx.fillStyle = '#7a4a6b';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(140, 218, 300, 288);
  ctx.quadraticCurveTo(420, 240, 560, 292);
  ctx.lineTo(560, 300);
  ctx.lineTo(0, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5f3a5c';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.quadraticCurveTo(200, 252, 380, 292);
  ctx.quadraticCurveTo(480, 262, 560, 296);
  ctx.lineTo(560, 300);
  ctx.lineTo(0, 300);
  ctx.closePath();
  ctx.fill();

  // Grass.
  const grass = ctx.createLinearGradient(0, 290, 0, 420);
  grass.addColorStop(0, '#4f7d5a');
  grass.addColorStop(1, '#33523d');
  ctx.fillStyle = grass;
  rect(ctx, 0, 290, 560, 130);

  // Footpath.
  ctx.fillStyle = '#d9b380';
  ctx.beginPath();
  ctx.moveTo(258, 420);
  ctx.lineTo(296, 420);
  ctx.quadraticCurveTo(306, 350, 292, 296);
  ctx.lineTo(272, 296);
  ctx.quadraticCurveTo(282, 350, 258, 420);
  ctx.closePath();
  ctx.fill();

  // Pond with lily pads.
  ctx.fillStyle = '#79c2d6';
  ellipse(ctx, 400, 322, 112, 38);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ellipse(ctx, 378, 312, 52, 10);
  ctx.fillStyle = '#3f8f5f';
  ellipse(ctx, 360, 330, 18, 7);
  ellipse(ctx, 440, 318, 14, 6);

  // Stone by the pond — grey on the left, orange on the right (diff: stone).
  ctx.fillStyle = side === 0 ? '#9aa0a6' : '#e8862e';
  ellipse(ctx, 300, 346, 16, 11);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ellipse(ctx, 296, 342, 7, 4);

  // Trees — the big one stands 50 px further right on the right (diff: tree).
  const treeX = side === 0 ? 90 : 140;
  ctx.fillStyle = '#5a3a22';
  rect(ctx, treeX - 7, 268, 14, 44);
  ctx.fillStyle = '#2f6b45';
  circle(ctx, treeX, 232, 42);
  circle(ctx, treeX - 30, 258, 28);
  circle(ctx, treeX + 30, 258, 28);
  ctx.fillStyle = '#3a7d54';
  circle(ctx, treeX - 12, 222, 24);
  circle(ctx, treeX + 16, 240, 20);
  // Second, smaller tree (identical on both sides).
  ctx.fillStyle = '#5a3a22';
  rect(ctx, 496, 282, 10, 30);
  ctx.fillStyle = '#2f6b45';
  circle(ctx, 501, 262, 26);
  circle(ctx, 484, 276, 16);
  circle(ctx, 518, 276, 16);

  // Lantern posts. The right lantern glows teal instead of warm (diff: lantern).
  drawLanternPost(ctx, 180, 296, '#ffcf5c');
  drawLanternPost(ctx, 470, 282, side === 0 ? '#ffcf5c' : '#3fd2c0');

  // Bench — a third smaller on the right (diff: bench).
  drawBench(ctx, 250, 330, side === 0 ? 1 : 0.7);

  // Flower clusters along the bottom edge.
  flower(ctx, 60, 392, '#e85d75', '#ffd76a', 7);
  flower(ctx, 92, 386, '#ffd76a', '#e85d75', 6);
  flower(ctx, 200, 398, '#f2f2f2', '#e8a33d', 6);
  flower(ctx, 242, 390, '#e85d75', '#ffd76a', 7);
  flower(ctx, 420, 394, '#ffd76a', '#e85d75', 6);
  flower(ctx, 462, 386, '#f2f2f2', '#e8a33d', 7);
  // One extra red flower on the right (diff: flower).
  if (side === 1) flower(ctx, 352, 384, '#e8352c', '#ffd76a', 9);
}

function drawLanternPost(ctx, x, baseY, glow) {
  ctx.fillStyle = '#3a2a1a';
  rect(ctx, x - 3, baseY - 62, 6, 62);
  ctx.beginPath();
  ctx.moveTo(x - 3, baseY - 62);
  ctx.lineTo(x + 22, baseY - 62);
  ctx.lineTo(x + 22, baseY - 56);
  ctx.lineTo(x - 3, baseY - 56);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 207, 92, 0.22)';
  circle(ctx, x + 22, baseY - 44, 26);
  ctx.fillStyle = '#2c1c10';
  rect(ctx, x + 14, baseY - 58, 16, 5);
  ctx.fillStyle = glow;
  roundRectPath(ctx, x + 14, baseY - 53, 16, 24, 4);
  ctx.fill();
  ctx.fillStyle = '#2c1c10';
  rect(ctx, x + 14, baseY - 29, 16, 4);
}

function drawBench(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#6b4426';
  rect(ctx, -46, -12, 92, 10);
  rect(ctx, -46, -34, 92, 8);
  rect(ctx, -46, -34, 8, 34);
  rect(ctx, 38, -34, 8, 34);
  rect(ctx, -40, -2, 8, 26);
  rect(ctx, 32, -2, 8, 26);
  ctx.fillStyle = '#8a5a33';
  rect(ctx, -46, -14, 92, 4);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Round 2 — Warung Kopi: a coffee-shop interior at night.
// ---------------------------------------------------------------------------
function drawWarung(ctx, side) {
  // Wall and floor.
  ctx.fillStyle = '#f0d3a0';
  rect(ctx, 0, 0, 560, 340);
  ctx.fillStyle = '#8a5a33';
  rect(ctx, 0, 340, 560, 6);
  ctx.fillStyle = '#6b4426';
  rect(ctx, 0, 346, 560, 74);

  // Window with the evening sky — the moon is missing on the right (diff: moon).
  ctx.fillStyle = '#5a3a22';
  rect(ctx, 368, 48, 164, 174);
  const winSky = ctx.createLinearGradient(0, 56, 0, 214);
  winSky.addColorStop(0, '#2c2a55');
  winSky.addColorStop(1, '#e8875a');
  ctx.fillStyle = winSky;
  rect(ctx, 376, 56, 148, 158);
  if (side === 0) {
    ctx.fillStyle = '#f5ead0';
    circle(ctx, 450, 96, 16);
    ctx.fillStyle = '#e3d3ae';
    circle(ctx, 445, 92, 4);
    circle(ctx, 455, 101, 3);
  }
  ctx.fillStyle = '#5a3a22';
  rect(ctx, 446, 56, 8, 158);
  rect(ctx, 376, 130, 148, 8);

  // Chalk menu board — the price reads 15 on the left, 18 on the right (diff: menu).
  ctx.fillStyle = '#2e2620';
  rect(ctx, 55, 60, 130, 95);
  ctx.fillStyle = '#2e2620';
  ctx.strokeStyle = '#c9b8a3';
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 65, 120, 85);
  ctx.fillStyle = '#fdf6e3';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('KOPI', 120, 96);
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText(side === 0 ? 'Rp 15' : 'Rp 18', 120, 126);
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillStyle = '#c9b8a3';
  ctx.fillText('panas · manis', 120, 146);
  ctx.textAlign = 'left';

  // Shelf with cups — the second cup is missing on the right (diff: cup).
  ctx.fillStyle = '#7a4a28';
  rect(ctx, 55, 168, 260, 10);
  const cupColours = ['#d96a4a', '#4a90d9', '#e8b93d', '#5aa469'];
  const cupX = [90, 140, 190, 240];
  for (let i = 0; i < 4; i += 1) {
    if (side === 1 && i === 3) continue;
    drawCup(ctx, cupX[i], 146, cupColours[i]);
  }

  // Hanging lamp — warm on the left, blue on the right (diff: lamp).
  ctx.fillStyle = '#3a2a1a';
  rect(ctx, 277, 0, 6, 58);
  ctx.fillStyle = 'rgba(255, 207, 92, 0.20)';
  circle(ctx, 280, 108, 42);
  ctx.fillStyle = side === 0 ? '#e8a33d' : '#4a90d9';
  poly(ctx, [[258, 58], [302, 58], [292, 92], [268, 92]]);
  ctx.fillStyle = '#ffd76a';
  circle(ctx, 280, 98, 8);

  // Counter.
  ctx.fillStyle = '#9c6a3d';
  rect(ctx, 30, 292, 500, 14);
  ctx.fillStyle = '#7a4a28';
  rect(ctx, 40, 306, 480, 114);
  ctx.fillStyle = '#5a3a22';
  rect(ctx, 40, 306, 480, 6);

  // Coffee pot — bigger on the right (diff: pot).
  drawCoffeePot(ctx, 150, 262, side === 0 ? 1 : 1.35);

  // Jars on the counter — one extra on the right (diff: jar).
  drawJar(ctx, 380, 272, '#c96a3d');
  drawJar(ctx, 406, 276, '#5aa469');
  if (side === 1) drawJar(ctx, 432, 286, '#4a90d9');

  // Potted plant on the counter's right end.
  ctx.fillStyle = '#c96a3d';
  poly(ctx, [[492, 292], [516, 292], [512, 268], [496, 268]]);
  ctx.fillStyle = '#3f8f5f';
  ellipse(ctx, 496, 258, 6, 16);
  ellipse(ctx, 504, 252, 6, 18);
  ellipse(ctx, 512, 258, 6, 16);

  // Stools — the second one stands further right on the right (diff: stool).
  drawStool(ctx, 200, 384);
  drawStool(ctx, side === 0 ? 350 : 400, 384);
}

function drawCup(ctx, x, y, colour) {
  ctx.fillStyle = colour;
  roundRectPath(ctx, x, y, 26, 22, 3);
  ctx.fill();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + 28, y + 11, 7, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  rect(ctx, x + 3, y + 3, 20, 4);
}

function drawCoffeePot(ctx, cx, cy, scale) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  // Steam.
  ctx.strokeStyle = 'rgba(253, 246, 227, 0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, -34);
  ctx.quadraticCurveTo(-14, -48, -6, -58);
  ctx.moveTo(8, -34);
  ctx.quadraticCurveTo(14, -48, 6, -58);
  ctx.stroke();
  // Body, spout, handle, lid.
  ctx.fillStyle = '#3a2a1a';
  poly(ctx, [[-22, 30], [-18, -28], [18, -28], [22, 30]]);
  poly(ctx, [[18, -18], [34, -30], [30, -14], [18, -6]]);
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(-24, 2, 12, Math.PI / 2, Math.PI * 1.5);
  ctx.stroke();
  ctx.fillStyle = '#241a10';
  rect(ctx, -12, -36, 24, 8);
  ctx.fillStyle = '#e8a33d';
  circle(ctx, 0, -38, 4);
  ctx.restore();
}

function drawJar(ctx, x, y, colour) {
  ctx.fillStyle = colour;
  roundRectPath(ctx, x - 10, y - 18, 20, 18, 4);
  ctx.fill();
  ctx.fillStyle = '#2e2620';
  rect(ctx, x - 11, y - 22, 22, 6);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  rect(ctx, x - 7, y - 14, 5, 10);
}

function drawStool(ctx, x, y) {
  ctx.fillStyle = '#8a5a33';
  ellipse(ctx, x, y - 14, 26, 8);
  ctx.fillStyle = '#6b4426';
  rect(ctx, x - 16, y - 8, 5, 30);
  rect(ctx, x + 11, y - 8, 5, 30);
  ctx.fillStyle = '#5a3a22';
  rect(ctx, x - 18, y + 8, 36, 5);
}

// ---------------------------------------------------------------------------
// Round 3 — Pasar Malam: a night market of stalls under string lights.
// ---------------------------------------------------------------------------
function drawMarket(ctx, side) {
  // Night sky.
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#141b3a');
  sky.addColorStop(1, '#33305e');
  ctx.fillStyle = sky;
  rect(ctx, 0, 0, 560, 320);

  // Stars — one is missing on the right (diff: star).
  const stars = [[60, 40], [150, 52], [230, 36], [330, 44], [420, 30], [500, 48], [90, 90]];
  ctx.fillStyle = '#fdf6e3';
  for (const [sx, sy] of stars) {
    if (side === 1 && sx === 150 && sy === 52) continue;
    drawStar(ctx, sx, sy, 5);
  }

  // Moon — bigger on the right (diff: moon).
  ctx.fillStyle = '#f7ecc8';
  circle(ctx, 470, 72, side === 0 ? 30 : 44);
  ctx.fillStyle = '#e3d3ae';
  circle(ctx, 460, 64, 6);
  circle(ctx, 480, 80, 5);
  circle(ctx, 472, 58, 3);

  // String lights — one bulb is blue on the right (diff: bulb).
  const bulbs = [
    [40, 42], [90, 58], [140, 70], [190, 78], [240, 83],
    [290, 85], [330, 84], [380, 79], [430, 70], [480, 58], [530, 44],
  ];
  ctx.strokeStyle = '#241a10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 30);
  for (const [bx, by] of bulbs) ctx.lineTo(bx, by);
  ctx.lineTo(560, 32);
  ctx.stroke();
  const bulbColours = ['#ffd76a', '#ff9e57', '#ff6b6b'];
  bulbs.forEach(([bx, by], i) => {
    const isBlue = side === 1 && bx === 330;
    ctx.fillStyle = isBlue ? '#6ec6ff' : bulbColours[i % 3];
    circle(ctx, bx, by + 8, 7);
    ctx.fillStyle = 'rgba(255, 215, 106, 0.25)';
    circle(ctx, bx, by + 8, 12);
  });

  // Pennant flags — one is square instead of a triangle on the right (diff: flag).
  ctx.strokeStyle = '#241a10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 118);
  ctx.quadraticCurveTo(280, 146, 520, 118);
  ctx.stroke();
  const flagColours = ['#ff6b6b', '#ffd76a', '#6ec6ff', '#5aa469'];
  for (let i = 0; i < 10; i += 1) {
    const fx = 72 + i * 44;
    const wy = 118 + Math.round(14 * Math.sin((Math.PI * fx) / 560));
    ctx.fillStyle = flagColours[i % 4];
    if (side === 1 && fx === 248) {
      rect(ctx, fx - 12, wy, 24, 24);
    } else {
      poly(ctx, [[fx - 12, wy], [fx + 12, wy], [fx, wy + 26]]);
    }
  }

  // Ground.
  ctx.fillStyle = '#2c2340';
  rect(ctx, 0, 320, 560, 100);
  ctx.fillStyle = 'rgba(255, 180, 71, 0.12)';
  ellipse(ctx, 140, 360, 120, 22);
  ellipse(ctx, 420, 360, 130, 22);

  // Three stalls. The middle awning is red on the left, green on the right (diff: awning).
  drawStall(ctx, 50, 200, ['#d94f3d', '#fdf6e3'], ['#e8a33d', '#c96a3d', '#5aa469']);
  drawStall(ctx, 220, 380, side === 0 ? ['#d94f3d', '#fdf6e3'] : ['#3f8f5f', '#fdf6e3'], ['#ff6b6b', '#ffd76a', '#6ec6ff']);
  drawStall(ctx, 400, 545, ['#e8862e', '#fdf6e3'], ['#ffd76a', '#ff9e57', '#d94f3d']);

  // Paper lantern hanging from the third stall — only on the right (diff: lantern).
  if (side === 1) {
    ctx.strokeStyle = '#241a10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(520, 118);
    ctx.lineTo(520, 160);
    ctx.stroke();
    ctx.fillStyle = '#e8352c';
    ellipse(ctx, 520, 182, 16, 20);
    ctx.fillStyle = '#ffd76a';
    rect(ctx, 512, 168, 16, 4);
    rect(ctx, 512, 192, 16, 4);
  }

  // Baskets on the ground — one stands further right on the right (diff: basket).
  drawBasket(ctx, side === 0 ? 120 : 170, 370);
  drawBasket(ctx, 480, 378);
}

function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.4;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawStall(ctx, x0, x1, awning, goods) {
  const w = x1 - x0;
  // Posts.
  ctx.fillStyle = '#5a3a22';
  rect(ctx, x0 + 6, 118, 8, 200);
  rect(ctx, x1 - 14, 118, 8, 200);
  // Striped awning.
  const stripeW = w / 6;
  for (let i = 0; i < 6; i += 1) {
    ctx.fillStyle = awning[i % 2];
    poly(ctx, [
      [x0 + i * stripeW, 70],
      [x0 + (i + 1) * stripeW, 70],
      [x0 + (i + 1) * stripeW + 6, 118],
      [x0 + i * stripeW + 6, 118],
    ]);
  }
  ctx.fillStyle = '#3a2a1a';
  rect(ctx, x0, 116, w, 6);
  // Counter.
  ctx.fillStyle = '#7a4a28';
  rect(ctx, x0 + 4, 250, w - 8, 68);
  ctx.fillStyle = '#9c6a3d';
  rect(ctx, x0, 244, w, 10);
  // Goods on the counter: fruit and boxes.
  const gx = [x0 + 30, x0 + w / 2, x1 - 34];
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = goods[i % goods.length];
    circle(ctx, gx[i], 232, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    circle(ctx, gx[i] - 4, 228, 4);
  }
  ctx.fillStyle = '#c9b8a3';
  rect(ctx, x0 + 18, 268, 34, 22);
  rect(ctx, x1 - 52, 268, 34, 22);
}

function drawBasket(ctx, x, y) {
  ctx.fillStyle = '#a8763e';
  poly(ctx, [[x - 24, y - 14], [x + 24, y - 14], [x + 18, y + 12], [x - 18, y + 12]]);
  ctx.strokeStyle = '#7a4a28';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 22, y - 4);
  ctx.lineTo(x + 22, y - 4);
  ctx.moveTo(x - 20, y + 5);
  ctx.lineTo(x + 20, y + 5);
  ctx.stroke();
  ctx.fillStyle = '#5aa469';
  circle(ctx, x - 10, y - 16, 7);
  circle(ctx, x + 8, y - 18, 8);
}

/** Paints one panel of round `roundIndex`: side 0 original, side 1 modified. */
export function drawScene(ctx, roundIndex, side) {
  if (roundIndex === 0) drawPark(ctx, side);
  else if (roundIndex === 1) drawWarung(ctx, side);
  else drawMarket(ctx, side);
}
