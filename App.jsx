import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * Conway's Game of Life
 * -------------------------------------------------
 * • Tailwind‑powered dark UI
 * • Responsive board that scales with the window
 * • Generation counter & speed slider
 * • Separate board + control components for clarity
 */

//-------------------------------------------------------------------------
//   App                                                                   
//-------------------------------------------------------------------------
export default function App() {
  /* ─────────────────────────────────  state  ────────────────────────────────── */
  const DEFAULT_ROWS = 30;
  const DEFAULT_COLS = 50;
  const ALIVE = 1;
  const DEAD = 0;

  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [grid, setGrid] = useState(() => buildEmptyGrid(DEFAULT_ROWS, DEFAULT_COLS));
  const [running, setRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(150); // ms between ticks (slider can change it)

  // useRef lets the interval callback always read the latest value of `running`
  const runningRef = useRef(running);
  runningRef.current = running;

  /* ────────────────────────────────  helpers  ──────────────────────────────── */
  const neighbourCount = useCallback(
    (r, c, g) => {
      let count = 0;
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1],  [1, 0], [1, 1],
      ];
      for (const [dr, dc] of dirs) {
        const newR = (r + dr + rows) % rows;
        const newC = (c + dc + cols) % cols;
        count += g[newR][newC];
      }
      return count;
    },
    [rows, cols]
  );

  const nextGen = useCallback((current) => {
    const fresh = current.map((row, r) =>
      row.map((cell, c) => {
        const n = neighbourCount(r, c, current);
        if (cell === ALIVE) {
          return n === 2 || n === 3 ? ALIVE : DEAD;
        }
        return n === 3 ? ALIVE : DEAD;
      })
    );
    return fresh;
  }, [neighbourCount]);

  /* ────────────────────────────────  effects  ──────────────────────────────── */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (!runningRef.current) return;
      setGrid((g) => nextGen(g));
      setGeneration((g) => g + 1);
    }, speed);
    return () => clearInterval(id);
  }, [running, speed, nextGen]);

  /* ────────────────────────────────  actions  ──────────────────────────────── */
  const toggleCell = (r, c) => {
    if (running) return; // don’t allow edits during run
    setGrid((g) => {
      const copy = g.map((row) => [...row]);
      copy[r][c] = g[r][c] ? DEAD : ALIVE;
      return copy;
    });
  };

  const runToggle = () => setRunning((r) => !r);

  const step = () => {
    if (running) return;
    setGrid((g) => nextGen(g));
    setGeneration((g) => g + 1);
  };

  const clear = () => {
    setRunning(false);
    setGrid(buildEmptyGrid(rows, cols));
    setGeneration(0);
  };

  const randomise = () => {
    setRunning(false);
    const rand = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() > 0.7 ? ALIVE : DEAD))
    );
    setGrid(rand);
    setGeneration(0);
  };

  /* ─────────────────────────────────  render  ───────────────────────────────── */
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center py-10 px-4 font-sans">
      <h1 className="text-4xl md:text-5xl font-bold text-indigo-400 mb-8 tracking-tight">
        Conway's Game&nbsp;of&nbsp;Life
      </h1>

      {/* Controls & HUD */}
      <Controls
        running={running}
        onRunToggle={runToggle}
        onStep={step}
        onClear={clear}
        onRandom={randomise}
      />
      <HUD generation={generation} speed={speed} setSpeed={setSpeed} />

      {/* Board */}
      <Board grid={grid} rows={rows} cols={cols} onToggle={toggleCell} />

      <footer className="text-sm mt-10 text-zinc-400 text-center max-w-md">
        <p className="mb-1">Click cells to toggle their state.</p>
        <p>Slide "Speed" to change how quickly generations advance.</p>
      </footer>
    </main>
  );
}

//-------------------------------------------------------------------------
//   Board component                                                       
//-------------------------------------------------------------------------
function Board({ grid, rows, cols, onToggle }) {
  // Cell size shrinks a bit on small screens
  const CELL = 18; // px
  const GAP = 1;   // px between cells – matches board bg colour

  return (
    <section
      className="border-2 border-indigo-600 rounded shadow-2xl shadow-indigo-800/25 overflow-hidden"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
        gap: GAP,
        backgroundColor: "#4f46e5", // same as border colour → looks like grid lines
        userSelect: "none",
      }}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            onClick={() => onToggle(r, c)}
            className={`w-[${CELL}px] h-[${CELL}px] transition-colors duration-200 
                        ${cell ? "bg-emerald-400" : "bg-zinc-950 hover:bg-indigo-400"}`}
          />
        ))
      )}
    </section>
  );
}

//-------------------------------------------------------------------------
//   Controls component                                                    
//-------------------------------------------------------------------------
function Controls({ running, onRunToggle, onStep, onClear, onRandom }) {
  const base =
    "px-4 py-2 rounded-full font-semibold shadow-lg transition transform hover:scale-105";
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-6">
      <button
        onClick={onRunToggle}
        className={`${base} bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700`}
      >
        {running ? "Stop" : "Start"}
      </button>
      <button
        onClick={onStep}
        disabled={running}
        className={`${base} bg-gradient-to-r from-green-500 to-teal-500 enabled:hover:from-green-600 enabled:hover:to-teal-600 disabled:opacity-40`}
      >
        Next&nbsp;Gen
      </button>
      <button
        onClick={onClear}
        className={`${base} bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700`}
      >
        Clear
      </button>
      <button
        onClick={onRandom}
        className={`${base} bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600`}
      >
        Random
      </button>
    </div>
  );
}

//-------------------------------------------------------------------------
//   HUD component                                                         
//-------------------------------------------------------------------------
function HUD({ generation, speed, setSpeed }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-sm">
      <span className="font-mono tracking-tight">Generation: {generation}</span>

      <label className="flex items-center gap-2">
        <span className="whitespace-nowrap">Speed</span>
        <input
          type="range"
          min="60"
          max="600"
          step="30"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-40 accent-indigo-500"
        />
      </label>
    </div>
  );
}

//-------------------------------------------------------------------------
//   Utility                                                               
//-------------------------------------------------------------------------
function buildEmptyGrid(r, c) {
  return Array.from({ length: r }, () => Array.from({ length: c }, () => 0));
}
