// ═══════════════════════════════════════════════════
//  Draw Utilities — Dark Horror Platformer
//  Pure canvas drawing functions, no React dependencies
// ═══════════════════════════════════════════════════

import { WORLD_WIDTH } from './levelData.js';

// ── Constants ──────────────────────────────────────
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;

// ── Background Layers ──────────────────────────────

/**
 * Parallax layer 1 (far): faint dark grey vertical pillars
 */
function drawFarBackground(ctx, cameraX) {
  const parallax = cameraX * 0.1;
  ctx.fillStyle = '#141414';
  const pillarSpacing = 180;
  const pillarWidth = 6;

  for (let i = 0; i < 30; i++) {
    const px = i * pillarSpacing - parallax;
    if (px > -pillarWidth && px < CANVAS_WIDTH + pillarWidth) {
      const height = 160 + (i % 5) * 40;
      ctx.fillRect(px, CANVAS_HEIGHT - height, pillarWidth, height);
    }
  }
}

/**
 * Parallax layer 2 (mid): broken wall / rubble silhouettes
 */
function drawMidBackground(ctx, cameraX) {
  const parallax = cameraX * 0.3;
  ctx.fillStyle = '#111111';

  const shapes = [
    { x: 50,   w: 80,  h: 100 },
    { x: 300,  w: 120, h: 70  },
    { x: 550,  w: 40,  h: 140 },
    { x: 800,  w: 100, h: 90  },
    { x: 1050, w: 60,  h: 120 },
    { x: 1300, w: 90,  h: 80  },
    { x: 1600, w: 70,  h: 130 },
    { x: 1900, w: 110, h: 60  },
    { x: 2200, w: 50,  h: 150 },
    { x: 2500, w: 85,  h: 95  },
    { x: 2800, w: 65,  h: 110 },
    { x: 3100, w: 100, h: 75  },
    { x: 3400, w: 55,  h: 140 },
  ];

  for (const s of shapes) {
    const sx = s.x - parallax;
    if (sx > -s.w && sx < CANVAS_WIDTH + s.w) {
      ctx.fillRect(sx, CANVAS_HEIGHT - s.h, s.w, s.h);
    }
  }
}

/**
 * Distant flickering light glows in the far background
 */
function drawDistantLights(ctx, cameraX, lights) {
  for (const light of lights) {
    const lx = light.x - cameraX * 0.15;
    if (lx < -light.radius * 2 || lx > CANVAS_WIDTH + light.radius * 2) continue;

    const flicker = 0.10 + Math.random() * 0.05;
    const gradient = ctx.createRadialGradient(lx, light.y, 0, lx, light.y, light.radius);
    gradient.addColorStop(0, `rgba(100,0,0,${flicker})`);
    gradient.addColorStop(1, 'rgba(100,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(lx - light.radius, light.y - light.radius, light.radius * 2, light.radius * 2);
  }
}

/**
 * Bottom fog effect — red/orange gradient overlay
 */
function drawBottomFog(ctx) {
  const fogHeight = 150;
  const gradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - fogHeight, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, 'rgba(80,0,0,0)');
  gradient.addColorStop(1, 'rgba(80,0,0,0.3)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, CANVAS_HEIGHT - fogHeight, CANVAS_WIDTH, fogHeight);
}

// ── Drawing Exports ────────────────────────────────

/**
 * Draw the full multi-layer background
 */
export function drawBackground(ctx, cameraX) {
  // Base fill
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Distant flickering lights (behind everything)
  drawDistantLights(ctx, cameraX, [
    { x: 600, y: 200, radius: 100 },
    { x: 1800, y: 150, radius: 120 },
    { x: 3200, y: 180, radius: 90 },
  ]);

  // Parallax layers
  drawFarBackground(ctx, cameraX);
  drawMidBackground(ctx, cameraX);

  // Bottom fog
  drawBottomFog(ctx);
}

/**
 * Draw platforms and walls
 */
export function drawPlatforms(ctx, solids, cameraX) {
  for (const s of solids) {
    const sx = s.x - cameraX;
    const sy = s.y;

    // Skip off-screen
    if (sx + s.width < -20 || sx > CANVAS_WIDTH + 20) continue;

    ctx.save();

    // Glow effect
    if (s.glow) {
      ctx.shadowColor = s.isGoal ? '#ff4400' : '#ff2200';
      ctx.shadowBlur = s.isGoal ? 16 : 8;
    }

    // Main body
    ctx.fillStyle = s.color;
    ctx.fillRect(sx, sy, s.width, s.height);

    ctx.restore();

    // Top edge highlight
    ctx.fillStyle = s.isGoal ? '#444444' : '#333333';
    ctx.fillRect(sx, sy, s.width, 1);

    // Goal platform gets a secondary inner glow line
    if (s.isGoal) {
      ctx.save();
      ctx.shadowColor = '#ff4400';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#3a2020';
      ctx.fillRect(sx + 4, sy + 2, s.width - 8, 2);
      ctx.restore();
    }
  }
}

/**
 * Draw the player silhouette with glowing eyes
 */
export function drawPlayer(ctx, player, cameraX) {
  const px = player.x - cameraX;
  const py = player.y;

  // Faint body glow
  ctx.save();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(px, py, player.width, player.height);
  ctx.restore();

  // Solid body
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(px, py, player.width, player.height);

  // Darker body outline
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.strokeRect(px + 0.5, py + 0.5, player.width - 1, player.height - 1);

  // Glowing eyes
  ctx.save();
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';

  const eyeY = py + 8;
  const eyeSize = 3;
  // Left eye
  ctx.fillRect(px + 5, eyeY, eyeSize, eyeSize);
  // Right eye
  ctx.fillRect(px + 12, eyeY, eyeSize, eyeSize);
  ctx.restore();
}

/**
 * Draw floating ember / ash particles
 */
export function drawParticles(ctx, particles, cameraX) {
  for (const p of particles) {
    const px = p.x - cameraX * 0.5;
    // Wrap horizontally on screen
    const screenX = ((px % CANVAS_WIDTH) + CANVAS_WIDTH) % CANVAS_WIDTH;

    ctx.fillStyle = p.isEmber
      ? `rgba(255,80,0,${p.opacity})`
      : `rgba(180,0,0,${p.opacity})`;

    ctx.beginPath();
    ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw the HUD — title, progress bar, controls reminder
 */
export function drawHUD(ctx, player) {
  // ── Title: "ESCAPE" ──
  ctx.save();
  ctx.fillStyle = '#cc0000';
  ctx.font = 'bold 11px monospace';
  ctx.letterSpacing = '4px';
  ctx.fillText('E S C A P E', 16, 28);
  ctx.restore();

  // ── Progress bar ──
  const progress = Math.min(player.x / WORLD_WIDTH, 1);
  const percent = Math.floor(progress * 100);
  const barLength = 16;
  const filled = Math.round(progress * barLength);
  const empty = barLength - filled;
  const bar = '▓'.repeat(filled) + '░'.repeat(empty);

  ctx.fillStyle = 'rgba(200,0,0,0.6)';
  ctx.font = '10px monospace';
  ctx.fillText(`${bar}  ${percent}%`, 16, 46);

  // ── Controls reminder (bottom-left) ──
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '10px monospace';
  ctx.fillText('WASD / ARROWS to move   SPACE to jump', 16, CANVAS_HEIGHT - 14);
}

export function drawPortal(ctx, portal, cameraX) {
  if (!portal) return;

  const px = portal.x - cameraX;
  if (px + portal.width < -20 || px > CANVAS_WIDTH + 20) return;

  const centerX = px + portal.width / 2;
  const centerY = portal.y + portal.height / 2;
  const outerGlow = ctx.createRadialGradient(
    centerX,
    centerY,
    portal.width * 0.1,
    centerX,
    centerY,
    portal.width * 0.9
  );
  outerGlow.addColorStop(0, 'rgba(120, 255, 180, 0.95)');
  outerGlow.addColorStop(0.55, 'rgba(60, 220, 120, 0.55)');
  outerGlow.addColorStop(1, 'rgba(10, 40, 20, 0)');

  const innerGlow = ctx.createRadialGradient(
    centerX,
    centerY,
    portal.width * 0.02,
    centerX,
    centerY,
    portal.width * 0.45
  );
  innerGlow.addColorStop(0, 'rgba(210, 255, 220, 0.95)');
  innerGlow.addColorStop(0.35, 'rgba(100, 255, 160, 0.75)');
  innerGlow.addColorStop(1, 'rgba(0, 120, 60, 0.2)');

  ctx.save();
  ctx.shadowColor = 'rgba(70, 255, 160, 0.95)';
  ctx.shadowBlur = 28;
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, portal.width * 0.6, portal.height * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = 'rgba(180, 255, 210, 0.95)';
  ctx.shadowBlur = 18;
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, portal.width * 0.42, portal.height * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(220, 255, 230, 0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, portal.width * 0.56, portal.height * 0.46, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.ellipse(centerX - 4, centerY - 18, portal.width * 0.10, portal.height * 0.24, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
