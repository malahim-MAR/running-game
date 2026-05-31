import { useEffect, useRef, useCallback } from 'react';
import styles from './Game.module.css';
import { WORLD_WIDTH, levels } from '../utils/levelData.js';
import {
  drawBackground,
  drawPlatforms,
  drawPlayer,
  drawParticles,
  drawHUD,
  drawPortal,
} from '../utils/drawUtils.js';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 450;
const GRAVITY = 0.5;
const MAX_FALL_SPEED = 12;
const JUMP_FORCE = -11;
const MOVE_SPEED = 4;
const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 36;
const PLATFORM_TOLERANCE = 8;
const PARTICLE_COUNT = 40;

function createParticles() {
  const particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      speed: 0.3 + Math.random() * 0.7,
      opacity: 0.2 + Math.random() * 0.3,
      size: 1 + Math.random(),
      isEmber: Math.random() > 0.5,
    });
  }
  return particles;
}

export default function Game() {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const frameCountRef = useRef(0);
  const levelIndexRef = useRef(0);
  const respawnTimerRef = useRef(null);

  const playerRef = useRef({
    x: 60,
    y: 340,
    vx: 0,
    vy: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    onGround: false,
  });

  const keysRef = useRef({});
  const jumpPressedRef = useRef(false);
  const particlesRef = useRef(createParticles());

  const resetPlayerToSpawn = useCallback((levelIndex = levelIndexRef.current) => {
    const level = levels[levelIndex];
    if (!level) return;

    playerRef.current = {
      x: level.spawn.x,
      y: level.spawn.y,
      vx: 0,
      vy: 0,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      onGround: false,
    };
  }, []);

  const loadLevel = useCallback(
    (nextLevelIndex) => {
      const clampedIndex = Math.min(Math.max(nextLevelIndex, 0), levels.length - 1);
      levelIndexRef.current = clampedIndex;
      resetPlayerToSpawn(clampedIndex);
      particlesRef.current = createParticles();
      if (respawnTimerRef.current) {
        clearTimeout(respawnTimerRef.current);
        respawnTimerRef.current = null;
      }
    },
    [resetPlayerToSpawn]
  );

  const handleKeyDown = useCallback((e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    keysRef.current[e.key] = true;
  }, []);

  const handleKeyUp = useCallback((e) => {
    keysRef.current[e.key] = false;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      jumpPressedRef.current = false;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const currentLevel = () => levels[levelIndexRef.current];

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    loadLevel(0);

    function triggerDeath() {
      if (respawnTimerRef.current) return;

      respawnTimerRef.current = setTimeout(() => {
        resetPlayerToSpawn();
        respawnTimerRef.current = null;
      }, 900);
    }

    function advanceLevel() {
      const nextLevelIndex = levelIndexRef.current + 1;
      if (nextLevelIndex >= levels.length) {
        loadLevel(0);
        return;
      }

      loadLevel(nextLevelIndex);
    }

    function update() {
      const player = playerRef.current;
      const keys = keysRef.current;
      const level = currentLevel();
      const solids = [...level.platforms, ...level.walls];

      player.vx = 0;
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.vx = -MOVE_SPEED;
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.vx = MOVE_SPEED;
      }

      const jumpKeyDown = keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '];
      if (jumpKeyDown && player.onGround && !jumpPressedRef.current) {
        player.vy = JUMP_FORCE;
        player.onGround = false;
        jumpPressedRef.current = true;
      }

      player.vy += GRAVITY;
      if (player.vy > MAX_FALL_SPEED) {
        player.vy = MAX_FALL_SPEED;
      }

      player.x += player.vx;
      player.y += player.vy;

      if (player.x < 0) player.x = 0;
      if (player.x + player.width > WORLD_WIDTH) {
        player.x = WORLD_WIDTH - player.width;
      }

      player.onGround = false;

      if (level.portal) {
        const portal = level.portal;
        const overlapPortal =
          player.x < portal.x + portal.width &&
          player.x + player.width > portal.x &&
          player.y < portal.y + portal.height &&
          player.y + player.height > portal.y;

        if (overlapPortal) {
          advanceLevel();
          return;
        }
      }

      for (const solid of solids) {
        const playerBottom = player.y + player.height;
        const playerRight = player.x + player.width;
        const solidRight = solid.x + solid.width;
        const solidBottom = solid.y + solid.height;
        const overlapX = player.x < solidRight && playerRight > solid.x;

        if (overlapX && player.vy >= 0) {
          const distToTop = Math.abs(playerBottom - solid.y);
          if (distToTop <= PLATFORM_TOLERANCE + Math.abs(player.vy)) {
            if (playerBottom >= solid.y && player.y < solid.y) {
              player.y = solid.y - player.height;
              player.vy = 0;
              player.onGround = true;
            }
          }
        }

        const overlapY = player.y < solidBottom && player.y + player.height > solid.y;
        if (overlapY) {
          if (player.vx > 0 && playerRight > solid.x && player.x < solid.x) {
            player.x = solid.x - player.width;
            player.vx = 0;
          }
          if (player.vx < 0 && player.x < solidRight && playerRight > solidRight) {
            player.x = solidRight;
            player.vx = 0;
          }
        }

        if (overlapX && player.vy < 0) {
          if (player.y <= solidBottom && player.y + player.height > solidBottom) {
            player.y = solidBottom;
            player.vy = 0;
          }
        }
      }

      if (player.y > CANVAS_HEIGHT + 120) {
        triggerDeath();
        return;
      }

      const particles = particlesRef.current;
      for (const p of particles) {
        p.y -= p.speed;
        p.x += Math.sin(frameCountRef.current * 0.01 + p.opacity * 100) * 0.2;
        if (p.y < -5) {
          p.y = CANVAS_HEIGHT + 5;
          p.x = Math.random() * WORLD_WIDTH;
          p.opacity = 0.2 + Math.random() * 0.3;
        }
      }
    }

    function draw() {
      const player = playerRef.current;
      const level = currentLevel();
      const solids = [...level.platforms, ...level.walls];

      let cameraX = player.x - CANVAS_WIDTH / 2;
      if (cameraX < 0) cameraX = 0;
      if (cameraX > WORLD_WIDTH - CANVAS_WIDTH) cameraX = WORLD_WIDTH - CANVAS_WIDTH;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawBackground(ctx, cameraX, frameCountRef.current);
      drawPlatforms(ctx, solids, cameraX);
      drawPortal(ctx, level.portal, cameraX);
      drawParticles(ctx, particlesRef.current, cameraX);
      drawPlayer(ctx, player, cameraX);
      drawHUD(ctx, player);
    }

    function gameLoop() {
      frameCountRef.current++;
      update();
      draw();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (respawnTimerRef.current) {
        clearTimeout(respawnTimerRef.current);
      }
    };
  }, [handleKeyDown, handleKeyUp, loadLevel, resetPlayerToSpawn]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.canvasContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
        />
        <div className={styles.vignette} />
      </div>
    </div>
  );
}

