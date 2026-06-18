import { useEffect, useState } from "react";

function Skeleton() {
  return (
    <div
      style={{
        width: "300px",
        padding: "10px",
        border: "1px solid #ddd",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "150px",
          background: "#e0e0e0",
          marginBottom: "10px",
        }}
      />

      <div
        style={{
          width: "80%",
          height: "20px",
          background: "#e0e0e0",
          marginBottom: "8px",
        }}
      />

      <div
        style={{
          width: "60%",
          height: "20px",
          background: "#e0e0e0",
        }}
      />
    </div>
  );
}

export default function SkeletonCard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div>
      {loading ? (
        <Skeleton />
      ) : (
        <div
          style={{
            width: "300px",
            border: "1px solid #ddd",
            padding: "10px",
          }}
        >
          <img
            src="https://picsum.photos/300/150"
            alt="product"
          />

          <h3>Product Name</h3>

          <p>₹999</p>
        </div>
      )}
    </div>
  );
}