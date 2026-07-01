import type { Position } from "./types";

interface Props {
  food: Position;
}

const Food = ({ food }: Props) => {
  return (
    <div
      className="food"
      style={{
        left: food.x * 20,
        top: food.y * 20,
      }}
    />
  );
};

export default Food;