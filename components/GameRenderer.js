"use client";
import dynamic from "next/dynamic";
import { Spinner } from "./ui";

const loading = () => (
  <div style={{ display: "grid", placeItems: "center", minHeight: 360 }}>
    <Spinner />
  </div>
);

const Snake = dynamic(() => import("@/games/Snake"), { ssr: false, loading });
const BrickBreaker = dynamic(() => import("@/games/BrickBreaker"), { ssr: false, loading });
const EndlessRunner = dynamic(() => import("@/games/EndlessRunner"), { ssr: false, loading });
const SpaceShooter = dynamic(() => import("@/games/SpaceShooter"), { ssr: false, loading });
const Merge2048 = dynamic(() => import("@/games/Merge2048"), { ssr: false, loading });
const SlidingPuzzle = dynamic(() => import("@/games/SlidingPuzzle"), { ssr: false, loading });
const Sudoku = dynamic(() => import("@/games/Sudoku"), { ssr: false, loading });
const MineFinder = dynamic(() => import("@/games/MineFinder"), { ssr: false, loading });
const Maze = dynamic(() => import("@/games/Maze"), { ssr: false, loading });
const Crossword = dynamic(() => import("@/games/Crossword"), { ssr: false, loading });
const TicTacToe = dynamic(() => import("@/games/TicTacToe"), { ssr: false, loading });
const FourInARow = dynamic(() => import("@/games/FourInARow"), { ssr: false, loading });
const ChessPuzzles = dynamic(() => import("@/games/ChessPuzzles"), { ssr: false, loading });
const RockPaperScissors = dynamic(() => import("@/games/RockPaperScissors"), { ssr: false, loading });
const MemorySequence = dynamic(() => import("@/games/MemorySequence"), { ssr: false, loading });
const MemoryMatch = dynamic(() => import("@/games/MemoryMatch"), { ssr: false, loading });
const Pattern = dynamic(() => import("@/games/Pattern"), { ssr: false, loading });
const NumberGuess = dynamic(() => import("@/games/NumberGuess"), { ssr: false, loading });
const Hangman = dynamic(() => import("@/games/Hangman"), { ssr: false, loading });
const SpotDifference = dynamic(() => import("@/games/SpotDifference"), { ssr: false, loading });
const ReactionTime = dynamic(() => import("@/games/ReactionTime"), { ssr: false, loading });
const TypingChallenge = dynamic(() => import("@/games/TypingChallenge"), { ssr: false, loading });

const map = {
  snake: Snake,
  "brick-breaker": BrickBreaker,
  "endless-runner": EndlessRunner,
  "space-shooter": SpaceShooter,
  "number-merge-2048": Merge2048,
  "sliding-puzzle": SlidingPuzzle,
  sudoku: Sudoku,
  "mine-finder": MineFinder,
  maze: Maze,
  crossword: Crossword,
  "tic-tac-toe": TicTacToe,
  "four-in-a-row": FourInARow,
  "chess-puzzles": ChessPuzzles,
  "rock-paper-scissors": RockPaperScissors,
  "memory-sequence": MemorySequence,
  "memory-match": MemoryMatch,
  "pattern-recognition": Pattern,
  "number-guessing": NumberGuess,
  hangman: Hangman,
  "spot-the-difference": SpotDifference,
  "reaction-time": ReactionTime,
  "typing-challenge": TypingChallenge,
};

export default function GameRenderer({ slug }) {
  const C = map[slug];
  return C ? <C /> : <p className="muted">This game is coming soon.</p>;
}
