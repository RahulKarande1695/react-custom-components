import { useState } from "react";
import "./dragAndDrop.css";

const TableRowDrag = () => {

  // rows state
  const [rows, setRows] = useState(
    Array.from({ length: 50 }, (_, index) => ({
      id: index,
      value: `Row ${index}`,
    }))
  );

  // drag indicator
  const [dragOverRow, setDragOverRow] = useState<{
    rowId: number | null;
    position: "top" | "bottom" | null;
  }>({
    rowId: null,
    position: null,
  });

  // DRAG START
  const handleDragStart = (
    e: React.DragEvent<HTMLTableRowElement>,
    index: number
  ) => {
    e.dataTransfer.setData(
      "dragIndex",
      String(index)
    );
  };

  // DROP
  const handleDrop = (
    e: React.DragEvent<HTMLTableRowElement>,
    dropIndex: number
  ) => {
    e.preventDefault();

    const dragIndex = Number(
      e.dataTransfer.getData("dragIndex")
    );

    // same row ignore
    if (dragIndex === dropIndex) return;

    const updatedRows = [...rows];

    // remove dragged item
    const draggedItem =
      updatedRows.splice(dragIndex, 1)[0];

    // final insert index
    let finalDropIndex = dropIndex;

    // bottom insert
    if (dragOverRow.position === "bottom") {
      finalDropIndex += 1;
    }

    // index shift correction
    if (dragIndex < finalDropIndex) {
      finalDropIndex -= 1;
    }

    // insert item
    updatedRows.splice(
      finalDropIndex,
      0,
      draggedItem
    );

    setRows(updatedRows);

    // cleanup
    setDragOverRow({
      rowId: null,
      position: null,
    });
  };

  return (
    <div className="table-container">
      <table className="table">
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className="table-row"
              draggable

              // DRAG START
              onDragStart={(e) =>
                handleDragStart(e, index)
              }

              // DRAG OVER
              onDragOver={(e) => {
                e.preventDefault();

                const rect =
                  e.currentTarget.getBoundingClientRect();

                const middleY =
                  rect.top + rect.height / 2;

                const position =
                  e.clientY < middleY
                    ? "top"
                    : "bottom";

                setDragOverRow({
                  rowId: row.id,
                  position,
                });
              }}

              // DROP
              onDrop={(e) =>
                handleDrop(e, index)
              }

              // CLEANUP
              onDragLeave={() => {
                setDragOverRow({
                  rowId: null,
                  position: null,
                });
              }}

              style={{
                borderTop:
                  dragOverRow.rowId === row.id &&
                  dragOverRow.position === "top"
                    ? "4px solid blue"
                    : "1px solid black",

                borderBottom:
                  dragOverRow.rowId === row.id &&
                  dragOverRow.position === "bottom"
                    ? "4px solid blue"
                    : "1px solid black",
              }}
            >
              <td className="table-cell">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableRowDrag;

/*
grab ani grabbing sathi css cha use krun :avtive vaprl aahe. browser default behaviour breake hoth table inconsistency mule
*/
