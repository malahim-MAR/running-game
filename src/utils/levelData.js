export const WORLD_WIDTH = 4000;

function createLevel({ platforms, walls, portal, spawn, backgroundLights }) {
  return {
    platforms,
    walls,
    portal,
    spawn,
    backgroundLights,
  };
}

export const levels = [
  createLevel({
    spawn: { x: 60, y: 340 },
    portal: { x: 3640, y: 248, width: 52, height: 132 },
    platforms: [
      { x: 0, y: 380, width: 600, height: 20, color: '#1a1a1a', glow: false },
      { x: 700, y: 340, width: 200, height: 20, color: '#1a1a1a', glow: false },
      { x: 1000, y: 300, width: 150, height: 20, color: '#1a1a1a', glow: true },
      { x: 1200, y: 260, width: 180, height: 20, color: '#1a1a1a', glow: false },
      { x: 1450, y: 300, width: 300, height: 20, color: '#1a1a1a', glow: true },
      { x: 1820, y: 260, width: 120, height: 20, color: '#1a1a1a', glow: false },
      { x: 2000, y: 220, width: 200, height: 20, color: '#1a1a1a', glow: true },
      { x: 2250, y: 260, width: 160, height: 20, color: '#1a1a1a', glow: false },
      { x: 2480, y: 300, width: 200, height: 20, color: '#1a1a1a', glow: false },
      { x: 2750, y: 260, width: 180, height: 20, color: '#1a1a1a', glow: true },
      { x: 3000, y: 220, width: 250, height: 20, color: '#1a1a1a', glow: true },
      { x: 3340, y: 300, width: 340, height: 20, color: '#2a2a2a', glow: true },
    ],
    walls: [
      { x: 860, y: 260, width: 20, height: 120, color: '#1a1a1a', glow: false },
      { x: 1700, y: 180, width: 20, height: 160, color: '#1a1a1a', glow: true },
      { x: 3620, y: 220, width: 20, height: 160, color: '#4b1c1c', glow: true },
    ],
    backgroundLights: [
      { x: 600, y: 200, radius: 100 },
      { x: 1800, y: 150, radius: 120 },
      { x: 3200, y: 180, radius: 90 },
    ],
  }),
  createLevel({
    spawn: { x: 60, y: 340 },
    portal: { x: 3740, y: 218, width: 56, height: 154 },
    platforms: [
      { x: 0, y: 380, width: 500, height: 20, color: '#141414', glow: false },
      { x: 620, y: 340, width: 220, height: 20, color: '#181818', glow: true },
      { x: 940, y: 300, width: 180, height: 20, color: '#1a1a1a', glow: false },
      { x: 1200, y: 250, width: 220, height: 20, color: '#1a1a1a', glow: true },
      { x: 1550, y: 290, width: 180, height: 20, color: '#1a1a1a', glow: false },
      { x: 1800, y: 240, width: 260, height: 20, color: '#1a1a1a', glow: true },
      { x: 2150, y: 200, width: 180, height: 20, color: '#1a1a1a', glow: true },
      { x: 2440, y: 250, width: 180, height: 20, color: '#1a1a1a', glow: false },
      { x: 2700, y: 290, width: 220, height: 20, color: '#1a1a1a', glow: true },
      { x: 3020, y: 250, width: 240, height: 20, color: '#1a1a1a', glow: false },
      { x: 3360, y: 210, width: 200, height: 20, color: '#1a1a1a', glow: true },
      { x: 3560, y: 350, width: 360, height: 20, color: '#2a2a2a', glow: true },
    ],
    walls: [
      { x: 820, y: 220, width: 20, height: 160, color: '#1a1a1a', glow: false },
      { x: 1460, y: 170, width: 20, height: 180, color: '#1a1a1a', glow: true },
      { x: 2360, y: 160, width: 20, height: 200, color: '#1a1a1a', glow: false },
      { x: 3720, y: 170, width: 20, height: 190, color: '#4b1c1c', glow: true },
    ],
    backgroundLights: [
      { x: 500, y: 180, radius: 100 },
      { x: 1600, y: 140, radius: 110 },
      { x: 2800, y: 170, radius: 110 },
      { x: 3600, y: 130, radius: 120 },
    ],
  }),
];
