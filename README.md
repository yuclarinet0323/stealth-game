# stealth-game

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/yuclarinet0323/stealth-game/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/yuclarinet0323/stealth-game/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

Shadow Shift: Night Vault is an original top-down stealth game that runs entirely in the browser from static files. Slip through three guarded vaults - the Outer Gallery, the Archive Stacks and the Inner Vault - and reach the glowing EXIT unseen. Guards patrol waypoints with visible vision cones that are ray-cast against the level, so walls and crates genuinely block their sight: hide behind cover and the cone stops at it. A guard who sees you fills the DETECTION meter (faster when you are close and central, slower while you sneak with Shift, and over a shorter range); fill it and you are caught and the room resets, let it fall by breaking line of sight. Suspicious guards pause and scanning guards sweep their cones at waypoints. It plays with keyboard (WASD / arrow keys, Shift to sneak, Enter to start and advance, R to retry a room) or mouse clicks, with generated WebAudio blips and no network requests, images or external assets: every room is drawn with canvas shapes.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 in a desktop browser
# hand in the entry with: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=27zqr39x&utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
