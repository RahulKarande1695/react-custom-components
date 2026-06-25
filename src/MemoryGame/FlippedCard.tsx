import "./flippedCard.css";

const FlippedCard = () => {
  return (
    <div className="card-wrapper">
      <div className="card">
        <div className="front">
          <h2>Front</h2>
        </div>

        <div className="back">
          <h2>Back</h2>
        </div>
      </div>
    </div>
  );
};

export default FlippedCard;