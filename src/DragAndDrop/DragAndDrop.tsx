import React, { useState } from "react";

type ItemType = {
  id: number;
  src: string;
  x: number;
  y: number;
};

const DragAndDrop: React.FC = () => {
  const [items, setItems] = useState<ItemType[]>([]);

  // START DRAG
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: ItemType
  ) => {
    e.dataTransfer.setData("item", JSON.stringify(item));
  };

  // ALLOW DROP
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // DROP HANDLER
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const containerRect =
      e.currentTarget.getBoundingClientRect();

    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;

    const draggedItem = JSON.parse(
      e.dataTransfer.getData("item")
    );

    const existingItem = items.find(
      (el) => el.id === draggedItem.id
    );

    // MOVE EXISTING ITEM
    if (existingItem) {
      setItems((prev) =>
        prev.map((el) =>
          el.id === draggedItem.id
            ? {
                ...el,
                x,
                y,
              }
            : el
        )
      );
    } else {
      // ADD NEW ITEM
      const newItem: ItemType = {
        id: Date.now(),
        src: draggedItem.src,
        x,
        y,
      };

      setItems((prev) => [...prev, newItem]);
    }
  };

  // REMOVE ITEM
  const handleRemove = (id: number) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  // SOURCE ITEM
  const sourceItem: ItemType = {
    id: 1,
    src: "../images1.jpg",
    x: 0,
    y: 0,
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      {/* MAIN FLEX AREA */}
      <div
        style={{
          display: "flex",
          gap: "50px",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT DRAG SOURCE */}
        <div
          draggable
          onDragStart={(e) =>
            handleDragStart(e, sourceItem)
          }
          style={{
            width: "250px",
            height: "250px",
            border: "2px solid black",
            overflow: "hidden",
            cursor: "grab",
            flexShrink: 0,
          }}
        >
          <img
            src="../images1.jpg"
            draggable={false}
            alt="img"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* DROP AREA */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            width: "900px",
            height: "600px",
            border: "3px dashed red",
            position: "relative",
            overflow: "visible", // IMPORTANT
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) =>
                handleDragStart(e, item)
              }
              style={{
                position: "absolute",
                left: item.x,
                top: item.y,
                width: "140px",
                height: "140px",
                cursor: "grab",
              }}
            >
              {/* IMAGE */}
              <img
                src={item.src}
                draggable={false}
                alt="dropped"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  border: "2px solid black",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />

              {/* REMOVE BUTTON */}
              <button
                onClick={() => handleRemove(item.id)}
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "-12px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragAndDrop;

/*
bydefault drag drop nast
explicitly serv krayala lagt security purpose mule

onDragStart -	Drag start hote hi
onDrag -	Dragging ke time continuously
onDragEnd	- Drag complete hone ke baad
onDragEnter	- Draggable item kisi drop area me enter kare
onDragOver - 	Item drop area ke upar ho, mandatory e.preventDefault() 
onDragLeave	- Drop area se bahar nikle
onDrop	- Item drop ho jaye

flow
onDragStart
   ↓
onDrag
   ↓
onDragEnter
   ↓
onDragOver
   ↓
onDrop
   ↓
onDragEnd

image container madhe auto fit kashi kraychi example
  <div
        draggable="true"
        style={{ width: "25vw", height: "25vh", border: "1px solid black", overflow:"hidden" }}
      >
        <img
          src="../images1.jpg"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

*/
