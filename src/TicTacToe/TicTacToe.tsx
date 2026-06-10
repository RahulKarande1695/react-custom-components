import { useRef, useState } from "react";
import "./ticTacToe.css";

const emptyBoard = Array(9).fill("");

const TicTacToe = () => {
  const [data, setData] = useState(emptyBoard);
  const turn = useRef(true);
  const history = useRef<any[]>([]);
  const currentIndex = useRef(0);

  const handleClick = (i: number) => {
   if (data[i] || winner) return;

    const board = structuredClone(data);
    board[i] = turn.current ? "O" : "X";
    turn.current = !turn.current;
    history.current = history.current.slice(
      0,
      currentIndex.current + 1
    );
    history.current.push(structuredClone(board));
    currentIndex.current += 1;
    setData(board);
  };

  const handleUndo = () => {
    if (currentIndex.current < 0) return;
    currentIndex.current -= 1;
    if (currentIndex.current < 0) {
      setData(structuredClone(emptyBoard));
      return;
    }
    setData(
      structuredClone(history.current[currentIndex.current])
    );
  };

  const handleRedo = () => {
    if (
      currentIndex.current >=
      history.current.length - 1
    )
      return;

    currentIndex.current += 1;
    setData(
      structuredClone(history.current[currentIndex.current])
    );
  };

  const handleReset = () => {
  setData(structuredClone(emptyBoard));
  turn.current = true;
  history.current = [];
  currentIndex.current = 0;
};

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const getWinner = (board: string[]) => {
  for (const [a, b, c] of winningCombos) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
};

const winner = getWinner(data);

  return (
    <div className="tic">
      {data.map((item, i) => (
        <div
          key={i}
          className="tac"
          onClick={() => handleClick(i)}
        >
          {item}
        </div>
      ))}
      <div className="action">
      <button onClick={handleUndo}>Undo</button>
      <button onClick={handleRedo}>Redo</button>
      <button onClick={handleReset}>Reset</button>
       {winner && <p>{winner} जिंकला! 🎉</p>}
       </div>
    </div>
  );
};

export default TicTacToe;