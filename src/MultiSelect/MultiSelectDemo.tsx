import { useState } from "react";
import MultiSelect from "./MultiSelect";

export default function MultiSelectDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  const options = [
    { value: "react", label: "React" },
    { value: "typescript", label: "TypeScript" },
    { value: "redux", label: "Redux Toolkit" },
    { value: "mui", label: "MUI" },
    { value: "vite", label: "Vite" },
  ];

  return (
    <MultiSelect
      options={options}
      selected={selected}
      setSelected={setSelected}
      placeholder="Select frameworks..."
      maxVisible={3}
    />
  );
}