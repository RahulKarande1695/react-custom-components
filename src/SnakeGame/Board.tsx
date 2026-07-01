import Snake from "./Snake";
import Food from "./Food";
import type { Position } from "./types";

interface Props {
  snake: Position[];
  food: Position;
}

const Board = ({ snake, food }: Props) => {
  return (
    <div className="board">
      <Snake snake={snake} />
      <Food food={food} />
    </div>
  );
};

export default Board;