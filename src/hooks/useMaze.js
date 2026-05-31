import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage maze state, generation, and player movement.
 * Uses the Recursive Backtracker (DFS) algorithm.
 *
 * @param {number} initialRows - Starting row count (default 20)
 * @param {number} initialCols - Starting column count (default 30)
 */
export function useMaze(initialRows = 20, initialCols = 30) {
  const [rows, setRows] = useState(initialRows);
  const [cols, setCols] = useState(initialCols);
  const [maze, setMaze] = useState(null);
  const [playerPos, setPlayerPos] = useState({ row: 0, col: 0 });
  const [hasWon, setHasWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [trail, setTrail] = useState([{ row: 0, col: 0 }]);

  /**
   * Generates a perfect maze using DFS Recursive Backtracker.
   */
  const generateMaze = useCallback((r, c) => {
    // 1. Initialize grid with all walls intact
    const grid = Array(r)
      .fill(null)
      .map((_, rowIndex) =>
        Array(c)
          .fill(null)
          .map((_, colIndex) => ({
            row: rowIndex,
            col: colIndex,
            top: true,
            right: true,
            bottom: true,
            left: true,
            visited: false,
          }))
      );

    const stack = [];

    // Start at cell [0][0], mark it visited
    let current = grid[0][0];
    current.visited = true;
    stack.push(current);

    while (stack.length > 0) {
      current = stack[stack.length - 1];

      const { row, col } = current;
      const neighbors = [];

      // Top Neighbor
      if (row > 0 && !grid[row - 1][col].visited) {
        neighbors.push({ cell: grid[row - 1][col], direction: 'top' });
      }
      // Right Neighbor
      if (col < c - 1 && !grid[row][col + 1].visited) {
        neighbors.push({ cell: grid[row][col + 1], direction: 'right' });
      }
      // Bottom Neighbor
      if (row < r - 1 && !grid[row + 1][col].visited) {
        neighbors.push({ cell: grid[row + 1][col], direction: 'bottom' });
      }
      // Left Neighbor
      if (col > 0 && !grid[row][col - 1].visited) {
        neighbors.push({ cell: grid[row][col - 1], direction: 'left' });
      }

      if (neighbors.length > 0) {
        // Pick one randomly
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        const { cell: neighbor, direction } = neighbors[randomIndex];

        // Remove the wall between current and chosen neighbor
        if (direction === 'top') {
          current.top = false;
          neighbor.bottom = false;
        } else if (direction === 'right') {
          current.right = false;
          neighbor.left = false;
        } else if (direction === 'bottom') {
          current.bottom = false;
          neighbor.top = false;
        } else if (direction === 'left') {
          current.left = false;
          neighbor.right = false;
        }

        // Mark neighbor as visited
        neighbor.visited = true;

        // Push neighbor onto stack
        stack.push(neighbor);
      } else {
        // Backtrack
        stack.pop();
      }
    }

    // Entry: open the LEFT wall of cell [0][0]
    grid[0][0].left = false;

    // Exit: open the RIGHT wall of cell [rows-1][cols-1]
    grid[r - 1][c - 1].right = false;

    return grid;
  }, []);

  const handleRegenerate = useCallback(() => {
    const numRows = Math.min(Math.max(parseInt(rows, 10) || 20, 5), 50);
    const numCols = Math.min(Math.max(parseInt(cols, 10) || 30, 5), 50);
    const newMaze = generateMaze(numRows, numCols);
    setMaze(newMaze);
    setPlayerPos({ row: 0, col: 0 });
    setHasWon(false);
    setMoveCount(0);
    setTrail([{ row: 0, col: 0 }]);
  }, [rows, cols, generateMaze]);

  // Auto-regenerate on rows/cols change
  useEffect(() => {
    const numRows = Math.min(Math.max(parseInt(rows, 10) || 20, 5), 50);
    const numCols = Math.min(Math.max(parseInt(cols, 10) || 30, 5), 50);
    const newMaze = generateMaze(numRows, numCols);
    setMaze(newMaze);
    setPlayerPos({ row: 0, col: 0 });
    setHasWon(false);
    setMoveCount(0);
    setTrail([{ row: 0, col: 0 }]);
  }, [rows, cols, generateMaze]);

  /**
   * Move the player in a direction if there's no wall blocking.
   * @param {'up' | 'down' | 'left' | 'right'} direction
   */
  const movePlayer = useCallback(
    (direction) => {
      if (!maze || hasWon) return;

      const { row, col } = playerPos;
      const currentCell = maze[row][col];
      let newRow = row;
      let newCol = col;

      switch (direction) {
        case 'up':
          if (!currentCell.top && row > 0) newRow = row - 1;
          break;
        case 'down':
          if (!currentCell.bottom && row < maze.length - 1) newRow = row + 1;
          break;
        case 'left':
          if (!currentCell.left && col > 0) newCol = col - 1;
          break;
        case 'right':
          if (!currentCell.right && col < maze[0].length - 1) newCol = col + 1;
          break;
        default:
          break;
      }

      // Only update if position actually changed
      if (newRow !== row || newCol !== col) {
        const newPos = { row: newRow, col: newCol };
        setPlayerPos(newPos);
        setMoveCount((prev) => prev + 1);
        setTrail((prev) => [...prev, newPos]);

        // Win check: reached the exit cell
        const exitRow = maze.length - 1;
        const exitCol = maze[0].length - 1;
        if (newRow === exitRow && newCol === exitCol) {
          setHasWon(true);
        }
      }
    },
    [maze, playerPos, hasWon]
  );

  return {
    maze,
    rows,
    cols,
    setRows,
    setCols,
    regenerate: handleRegenerate,
    playerPos,
    movePlayer,
    hasWon,
    moveCount,
    trail,
  };
}
