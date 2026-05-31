/**
 * Draws the maze grid, player trail, and player onto an HTML canvas element.
 *
 * @param {HTMLCanvasElement} canvas - The canvas DOM element
 * @param {Array<Array<Object>>} grid - 2D array of cell objects
 * @param {number} cellSize - Pixel size of each cell (default 20)
 * @param {{ row: number, col: number }} playerPos - Current player position
 * @param {Array<{ row: number, col: number }>} trail - Array of visited positions
 */
export function drawMaze(canvas, grid, cellSize = 20, playerPos = null, trail = []) {
  if (!canvas || !grid || grid.length === 0) return;

  const rows = grid.length;
  const cols = grid[0].length;
  const width = cols * cellSize;
  const height = rows * cellSize;

  // Set canvas dimensions
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Fill background
  ctx.fillStyle = '#0f0f0f';
  ctx.fillRect(0, 0, width, height);

  // ── Draw trail ──────────────────────────────────
  if (trail.length > 1) {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.lineWidth = cellSize * 0.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(
      trail[0].col * cellSize + cellSize / 2,
      trail[0].row * cellSize + cellSize / 2
    );
    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(
        trail[i].col * cellSize + cellSize / 2,
        trail[i].row * cellSize + cellSize / 2
      );
    }
    ctx.stroke();

    // Draw faint dots on visited cells
    ctx.fillStyle = 'rgba(0, 255, 136, 0.08)';
    for (const pos of trail) {
      ctx.fillRect(
        pos.col * cellSize + 2,
        pos.row * cellSize + 2,
        cellSize - 4,
        cellSize - 4
      );
    }
  }

  // ── Draw walls ──────────────────────────────────
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'square';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      const x = col * cellSize;
      const y = row * cellSize;

      if (cell.top) {
        drawLine(ctx, x, y, x + cellSize, y);
      }
      if (cell.right) {
        drawLine(ctx, x + cellSize, y, x + cellSize, y + cellSize);
      }
      if (cell.bottom) {
        drawLine(ctx, x, y + cellSize, x + cellSize, y + cellSize);
      }
      if (cell.left) {
        drawLine(ctx, x, y, x, y + cellSize);
      }
    }
  }

  // ── Draw border (with gaps for entry and exit) ──
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 2;

  // Top border — full width
  drawLine(ctx, 0, 0, width, 0);

  // Bottom border — full width
  drawLine(ctx, 0, height, width, height);

  // Left border — skip entry gap at cell [0][0]
  drawLine(ctx, 0, cellSize, 0, height);

  // Right border — skip exit gap at cell [rows-1][cols-1]
  drawLine(ctx, width, 0, width, (rows - 1) * cellSize);

  // ── Exit indicator — red dot ────────────────────
  const exitX = width - cellSize / 2;
  const exitY = (rows - 1) * cellSize + cellSize / 2;
  ctx.fillStyle = '#ff3366';
  ctx.shadowColor = '#ff3366';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(exitX, exitY, cellSize * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // ── Player ──────────────────────────────────────
  if (playerPos) {
    const px = playerPos.col * cellSize + cellSize / 2;
    const py = playerPos.row * cellSize + cellSize / 2;
    const radius = cellSize * 0.3;

    // Outer glow
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, radius * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}

/**
 * Draws a single line segment on the canvas context.
 */
function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}
