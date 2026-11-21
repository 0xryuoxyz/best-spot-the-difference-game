// The difference tables: one entry per hidden difference, per round.
// Coordinates are panel-local (the panel is 560x420). `x, y` is the centre of the
// thing that differs, `r` the click radius around it. The scene painters in
// scenes.js key their left/right branches off these same ids, so the data and the
// drawing can never drift apart.
//
// Fairness rule behind every entry: visible when you look, never a 2-pixel hunt
// in a dark corner, never dead-centre in a loud colour. Types are mixed per
// round: missing, colour, added, moved, size, shape.

/**
 * @typedef {Object} Difference
 * @property {string} id    Stable id, also used by the scene painter.
 * @property {string} kind  missing | colour | added | moved | size | shape
 * @property {string} label Short Indonesian label, shown on the summary screen.
 * @property {number} x     Panel-local centre x.
 * @property {number} y     Panel-local centre y.
 * @property {number} r     Click radius in panel pixels.
 */

export const ROUNDS = [
  {
    name: 'Taman Senja',
    subtitle: 'Taman di ujung senja — kolam, lentera, dan bangku tua.',
    differences: [
      { id: 'sun', kind: 'missing', label: 'Matahari hilang', x: 110, y: 90, r: 42 },
      { id: 'lantern', kind: 'colour', label: 'Warna lentera berubah', x: 470, y: 282, r: 30 },
      { id: 'flower', kind: 'added', label: 'Bunga merah tambahan', x: 352, y: 384, r: 24 },
      { id: 'tree', kind: 'moved', label: 'Pohon bergeser', x: 115, y: 262, r: 52 },
      { id: 'bird', kind: 'missing', label: 'Seekor burung hilang', x: 340, y: 56, r: 26 },
      { id: 'bench', kind: 'size', label: 'Bangku mengecil', x: 250, y: 330, r: 46 },
      { id: 'stone', kind: 'colour', label: 'Warna batu berubah', x: 300, y: 346, r: 22 },
    ],
  },
  {
    name: 'Warung Kopi',
    subtitle: 'Warung kopi di malam hari — rak cangkir, lampu gantung, dan jendela.',
    differences: [
      { id: 'cup', kind: 'missing', label: 'Cangkir di rak hilang', x: 240, y: 136, r: 26 },
      { id: 'lamp', kind: 'colour', label: 'Warna lampu gantung berubah', x: 280, y: 82, r: 30 },
      { id: 'jar', kind: 'added', label: 'Stoples tambahan di meja', x: 432, y: 286, r: 24 },
      { id: 'menu', kind: 'shape', label: 'Harga di papan menu berubah', x: 120, y: 102, r: 32 },
      { id: 'moon', kind: 'missing', label: 'Bulan di jendela hilang', x: 450, y: 96, r: 26 },
      { id: 'stool', kind: 'moved', label: 'Bangku kecil bergeser', x: 375, y: 384, r: 42 },
      { id: 'pot', kind: 'size', label: 'Tekokopi membesar', x: 150, y: 262, r: 46 },
    ],
  },
  {
    name: 'Pasar Malam',
    subtitle: 'Pasar malam — deretan kios, lampu gantung, dan langit berbintang.',
    differences: [
      { id: 'star', kind: 'missing', label: 'Sebuah bintang hilang', x: 150, y: 52, r: 18 },
      { id: 'awning', kind: 'colour', label: 'Warna tenda kios berubah', x: 300, y: 92, r: 42 },
      { id: 'lantern', kind: 'added', label: 'Lampion tambahan', x: 520, y: 182, r: 24 },
      { id: 'basket', kind: 'moved', label: 'Keranjang bergeser', x: 145, y: 370, r: 38 },
      { id: 'flag', kind: 'shape', label: 'Bentuk bendera berubah', x: 252, y: 132, r: 24 },
      { id: 'moon', kind: 'size', label: 'Bulan membesar', x: 470, y: 72, r: 42 },
      { id: 'bulb', kind: 'colour', label: 'Warna satu bohlam berubah', x: 330, y: 80, r: 22 },
    ],
  },
];

/** The differences of a round, by index. */
export function roundDifferences(roundIndex) {
  return ROUNDS[roundIndex].differences;
}

/** Distance from a panel-local point to a difference centre, in pixels. */
export function distanceTo(diff, x, y) {
  return Math.hypot(diff.x - x, diff.y - y);
}
