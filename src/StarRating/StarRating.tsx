import { useState } from "react";
import StarIcon from "@mui/icons-material/Star";

const StarRating = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div
      style={{ display: "flex", gap: "5px" }}
      onMouseLeave={() => setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hoverRating || rating); // hover nit bgh

        return (
          <div
            key={star}
            onMouseEnter={() => setHoverRating(star)}
            onClick={() =>
              setRating((prev) => (prev === star ? 0 : star))
            }
            style={{
              cursor: "pointer",
              display: "flex",
            }}
          >
            <StarIcon
              sx={{
                fontSize: 48,
                color: active ? "gold" : "#d1d5db",
                transition: "color 0.15s ease",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;