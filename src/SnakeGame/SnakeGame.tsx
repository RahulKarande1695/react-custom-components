import { useEffect, useState } from "react";
import Board from "./Board";
import type { Position } from "./types";
import "./snake.css";

const BOARD_SIZE = 20;

const randomFood = (): Position => ({
  x: Math.floor(Math.random() * BOARD_SIZE),
  y: Math.floor(Math.random() * BOARD_SIZE),
});

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>([
    { x: 5, y: 5 },
  ]);

  const [food, setFood] = useState<Position>(randomFood());

  const [direction, setDirection] = useState<Position>({
    x: 1,
    y: 0,
  });

  const [gameOver, setGameOver] = useState(false);

  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          setDirection({ x: 0, y: -1 });
          break;

        case "ArrowDown":
          setDirection({ x: 0, y: 1 });
          break;

        case "ArrowLeft":
          setDirection({ x: -1, y: 0 });
          break;

        case "ArrowRight":
          setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKey);

    return () =>
      window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    if (gameOver) return;

    const timer = setInterval(() => {
      setSnake((prev) => {
        const head = prev[0];

        const newHead = {
          x: head.x + direction.x,
          y: head.y + direction.y,
        };

        // Wall Collision
        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE
        ) {
          setGameOver(true);
          return prev;
        }

        // Self Collision
        if (
          prev.some(
            (item) =>
              item.x === newHead.x &&
              item.y === newHead.y
          )
        ) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];

        // Food
        if (
          newHead.x === food.x &&
          newHead.y === food.y
        ) {
          setScore((s) => s + 1);
          setFood(randomFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 200);

    return () => clearInterval(timer);
  }, [direction, food, gameOver]);

  const restart = () => {
    setSnake([{ x: 5, y: 5 }]);
    setFood(randomFood());
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Score : {score}</h3>

      <Board snake={snake} food={food} />

      {gameOver && (
        <>
          <h2>Game Over</h2>

          <button onClick={restart}>
            Restart
          </button>
        </>
      )}
    </div>
  );
};

export default SnakeGame;