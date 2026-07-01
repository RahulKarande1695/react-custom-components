import type { Position } from "./types";

interface Props {
  snake: Position[];
}

const Snake = ({ snake }: Props) => {
  return (
    <>
      {snake.map((item, index) => (
        <div
          key={index}
          className="snake"
          style={{
            left: item.x * 20,
            top: item.y * 20,
          }}
        />
      ))}
    </>
  );
};

export default Snake;