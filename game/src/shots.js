// Shadow Shift - screenshot staging behind ?shot=start|play|alert|end.
// Each shot arranges the real game objects into a believable mid-play
// moment (guards mid-patrol, the player mid-route, the detection meter
// part-filled where a guard has just glimpsed the player), so a screenshot
// is a true render of the game's own code, reproducible from its URL.

import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WIN } from './engine.js';

export function stageShot(name, game) {
  if (name === 'play') {
    game.startGame();
    game.loadLevel(0);
    game.screen = SCREEN_PLAY;
    game.player = { x: 352, y: 418 };
    game.guards[0].x = 300; game.guards[0].y = 268; game.guards[0].angle = Math.PI / 2;
    game.guards[1].x = 618; game.guards[1].y = 330; game.guards[1].angle = Math.PI;
    game.detection = 0.12;
    game.totalTime = 34;
    game.message = 'Cross the gallery. Hold Shift to sneak: you are spotted more slowly.';
    return;
  }
  if (name === 'alert') {
    game.startGame();
    game.loadLevel(1);
    game.screen = SCREEN_PLAY;
    game.player = { x: 470, y: 205 };
    game.guards[0].x = 560; game.guards[0].y = 200; game.guards[0].angle = Math.PI;
    game.guards[1].x = 330; game.guards[1].y = 380; game.guards[1].angle = 0;
    game.guards[2].x = 480; game.guards[2].y = 120; game.guards[2].angle = Math.PI / 2;
    game.detection = 0.58;
    game.totalTime = 97;
    game.seenBy = 0.8;
    game.message = 'Spotted! Break line of sight - get behind cover!';
    return;
  }
  if (name === 'end') {
    game.startGame();
    game.loadLevel(2);
    game.screen = SCREEN_WIN;
    game.totalTime = 214;
    game.caughtCount = 1;
    game.message = 'The Night Vault is yours - never seen, never heard.';
    return;
  }
  // 'start' and anything else: the title over Vault 1.
  game.loadLevel(0);
  game.screen = SCREEN_TITLE;
  game.guards[0].x = 300; game.guards[0].y = 300; game.guards[0].angle = 0.6;
  game.guards[1].x = 640; game.guards[1].y = 330; game.guards[1].angle = Math.PI + 0.4;
}
