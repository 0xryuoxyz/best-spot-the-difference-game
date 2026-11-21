# best-spot-the-difference-game

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/0xryuoxyz/best-spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/0xryuoxyz/best-spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

"Selisih Senja" — a spot-the-difference game with a warm twilight mood. Three rounds, seven differences each: Taman Senja (sunset garden), Warung Kopi (coffee shop), Pasar Malam (night market). Every scene is drawn procedurally with Canvas 2D — no external assets, no network.

Click a difference in either panel to mark it (+100 points), use hints (3 per round, H key), beat the 90-second timer per round. Wrong clicks shake and cost 3 seconds. Find all 21 differences to win.

## Play it

```sh
node serve.ts
```

Then open http://localhost:8000 in a desktop browser. `?shot=start|play|end&seed=N` stages deterministic screenshots.

## Run it (make.fun harness)

```sh
node main.ts
```

`main.ts` copies `game/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json` via `buildDossier`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
