import { useEffect, useState } from "react";
import "./flippedCard.css";

interface CardType {
  id: number;
  emoji: string;
  uniqueId: number;
  flipped: boolean;
  matched: boolean;
}

const initialCards = [
  { id: 1, emoji: "🍎" },
  { id: 2, emoji: "🍎" },
  { id: 3, emoji: "🍌" },
  { id: 4, emoji: "🍌" },
  { id: 5, emoji: "🍇" },
  { id: 6, emoji: "🍇" },
  { id: 7, emoji: "🍉" },
  { id: 8, emoji: "🍉" },
];

const shuffleCards = (): CardType[] => {
  return [...initialCards]
    .sort(() => Math.random() - 0.5)
    .map((card, index) => ({
      ...card,
      uniqueId: index,
      flipped: false,
      matched: false,
    }));
};

const MemoryGame = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [choiceOne, setChoiceOne] = useState<CardType | null>(null);
  const [choiceTwo, setChoiceTwo] = useState<CardType | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [turns, setTurns] = useState<number>(0);

  useEffect(() => {
    setCards(shuffleCards());
  }, []);

  const handleClick = (card: CardType) => {
    if (disabled || card.flipped || card.matched) return;

    setCards((prev) =>
      prev.map((c) =>
        c.uniqueId === card.uniqueId ? { ...c, flipped: true } : c
      )
    );

    if (!choiceOne) {
      setChoiceOne(card);
    } else {
      setChoiceTwo(card);
    }
  };

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true);

      if (choiceOne.emoji === choiceTwo.emoji) {
        setCards((prev) =>
          prev.map((card) =>
            card.emoji === choiceOne.emoji
              ? { ...card, matched: true }
              : card
          )
        );

        resetTurn();
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.uniqueId === choiceOne.uniqueId ||
              card.uniqueId === choiceTwo.uniqueId
                ? { ...card, flipped: false }
                : card
            )
          );

          resetTurn();
        }, 1000);
      }
    }
  }, [choiceOne, choiceTwo]);

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setDisabled(false);
    setTurns((prev) => prev + 1);
  };

  const newGame = () => {
    setCards(shuffleCards());
    setChoiceOne(null);
    setChoiceTwo(null);
    setTurns(0);
  };

  return (
    <div className="container">
      <h1>Memory Game</h1>

      <button onClick={newGame}>New Game</button>

      <h3>Turns: {turns}</h3>

      <div className="grid">
        {cards.map((card) => (
          <div
            key={card.uniqueId}
            className="card-wrapper"
            onClick={() => handleClick(card)}
          >
            <div
              className={`card ${
                card.flipped || card.matched ? "flipped" : ""
              }`}
            >
              <div className="front">?</div>
              <div className="back">{card.emoji}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;