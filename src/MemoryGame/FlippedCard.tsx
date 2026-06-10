import { useState } from "react";
import "./flippedCard.css";

const FlippedCard = () => {
    const [flipped, setFlipped] = useState(false)
    return(
        <div className="card" data-toggle={flipped} onClick={()=>setFlipped(!flipped)}>
            <div className="front"></div>
            <div className="back">1</div>
        </div>
    )
}

export default FlippedCard;