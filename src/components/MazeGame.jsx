import { useRef, useEffect, useCallback } from 'react';
import { useMaze } from '../hooks/useMaze';
import { drawMaze } from '../utils/drawMaze';
import styles from './MazeGame.module.css';

const CELL_SIZE = 20;

export default function MazeGame() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const {
    maze,
    rows,
    cols,
    setRows,
    setCols,
    regenerate,
    playerPos,
    movePlayer,
    hasWon,
    moveCount,
    trail,
  } = useMaze(5, 10);

  // Redraw canvas whenever maze, player, or trail changes
  useEffect(() => {
    if (maze && canvasRef.current) {
      drawMaze(canvasRef.current, maze, CELL_SIZE, playerPos, trail);
    }
  }, [maze, playerPos, trail]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Focus the container on mount so keyboard works immediately
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const handleRowsChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value === '') {
        setRows('');
        return;
      }
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        setRows(Math.min(Math.max(num, 5), 50));
      }
    },
    [setRows]
  );

  const handleColsChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (value === '') {
        setCols('');
        return;
      }
      const num = parseInt(value, 10);
      if (!isNaN(num)) {
        setCols(Math.min(Math.max(num, 5), 50));
      }
    },
    [setCols]
  );

  const displayRows = Math.min(Math.max(parseInt(rows, 10) || 20, 5), 50);
  const displayCols = Math.min(Math.max(parseInt(cols, 10) || 30, 5), 50);

  return (
    <div className={styles.container} ref={containerRef} tabIndex={-1}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          Maze <span>Generator</span>
        </h1>
        <p className={styles.subtitle}>
          Use <kbd className={styles.kbd}>↑</kbd> <kbd className={styles.kbd}>↓</kbd>{' '}
          <kbd className={styles.kbd}>←</kbd> <kbd className={styles.kbd}>→</kbd> or{' '}
          <kbd className={styles.kbd}>W</kbd> <kbd className={styles.kbd}>A</kbd>{' '}
          <kbd className={styles.kbd}>S</kbd> <kbd className={styles.kbd}>D</kbd> to move
        </p>
      </header>

      {/* Canvas + Win Overlay */}
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />

        {hasWon && (
          <div className={styles.winOverlay}>
            <div className={styles.winContent}>
              <span className={styles.winEmoji}>🏆</span>
              <h2 className={styles.winTitle}>You Solved It!</h2>
              <p className={styles.winMoves}>{moveCount} moves</p>
              <button
                className={styles.winBtn}
                onClick={regenerate}
                type="button"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend + Move Counter */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDotEntry} />
          Player
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDotExit} />
          Exit
        </div>
        <div className={styles.legendItem}>
          <span className={styles.moveCounter}>
            Moves: {moveCount}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label htmlFor="maze-rows">Rows</label>
          <input
            id="maze-rows"
            type="number"
            min={5}
            max={50}
            value={rows}
            onChange={handleRowsChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="maze-cols">Cols</label>
          <input
            id="maze-cols"
            type="number"
            min={5}
            max={50}
            value={cols}
            onChange={handleColsChange}
          />
        </div>

        <div className={styles.divider} />

        <span className={styles.sizeBadge}>
          {displayRows} × {displayCols}
        </span>

        <div className={styles.divider} />

        <button
          className={styles.generateBtn}
          onClick={regenerate}
          type="button"
        >
          <span className={styles.btnIcon}>⟳</span>
          New Maze
        </button>
      </div>
    </div>
  );
}
