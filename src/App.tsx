import { useState } from "react";
import DigitalClock from "./Clock/Clock";
import VirtualScroll from "./VirtualScroll";
import Popover from "./Popover/Popover";
import Stopwatch from "./Stopwatch/Stopwatch";
import ToastContainer from "./Toast/Toast";
import InfiniteScroll from "./InfiniteScroll/InfiniteScroll";
import GridColor from "./GridColor/GridColor";
import TraficLights from "./TrafficLights/TraficLights";
import OverLappingCircle from "./OverLappingCircle/OverLappingCircle";
import DragAndDrop from "./DragAndDrop/DragAndDrop";
import TableRowDrag from "./DragAndDrop/TableRowDrag";
import Switch from "./Switch/Switch";
import MemoryGame from "./MemoryGame/FlippedCard";
import TicTacToe from "./TicTacToe/TicTacToe";
import StarRating from "./StarRating/StarRating";
import OTP from "./OTP/OTP";
import FileExplore from "./FileExplore/FileExplore";
import TabList from "./TabList/Tab";
import Pagination from "./Pagination/Pagination";
import type { PageRenderProps } from "./Pagination/Pagination";
import DynamicForm from "./DynamicForm/DynamicForm";
import DarkLightMode from "./DarkLightMode/DarkLightMode";
import Accordion from "./Accordion/Accordion";
import TodoApp from "./Todo/Todo";
import Modal from "./Modal/Modal";
import Carousel from "./Carousel/Carousel";
import Autocomplete from "./AutoComplete/AutoComplete";
import TypingEffect from "./TypingEffect/TypingEffect";
import { Breadcrumb } from "./Breadcrumb/Breadcrumb";
import ProgressBar from "./ProgressBar/ProgressBar ";
import SkeletonCard from "./SkeletonCard/SkeletonCard";
import CustomCalendar from "./CustomCalendar/CustomCalendar";
import TimePicker from "./TimePicker/TimePicker";
import "./App.css";
import Stepper from "./Stepper/Stepper ";
import UseState from "./UseState/UseState";
import UseReducerDemo from "./Usereducerdemo/Usereducerdemo";
import UseEffectDemo from "./Useeffectdemo/Useeffectdemo";
import UseLayoutEffectDemo from "./Uselayouteffectdemo/Uselayouteffectdemo";
import UseInsertionEffectDemo from "./Useinsertioneffectdemo/Useinsertioneffectdemo";
import UseRefDemo from "./Userefdemo/Userefdemo";
import UseContextDemo from "./Usecontextdemo/Usecontextdemo";
import UseMemoDemo from "./Usememodemo/Usememodemo";
import UseCallbackDemo from "./Usecallbackdemo/Usecallbackdemo";
import UseTransitionDemo from "./Usetransitiondemo/Usetransitiondemo";
import UseDeferredValueDemo from "./Usedeferredvaluedemo/Usedeferredvaluedemo";
import UseIdDemo from "./Useiddemo/Useiddemo";
import UseSyncExternalStoreDemo from "./Usesyncexternalstoredemo/Usesyncexternalstoredemo";
import UseDebugValueDemo from "./UseDebugValueDemo/UseDebugValueDemo";
import UseOptimisticDemo from "./UseOptimisticDemo/UseOptimisticDemo";
import UseHookDemo from "./UseDemo/UseDemo";
import UseFormStatusDemo from "./useFormStatus/useFormStatus";
import UseActionStateDemo from "./useActionState/Useactionstatedemo";
import UseDebounceDemo from "./Usedebouncedemo/Usedebouncedemo";
import UseThrottleDemo from "./UseThrottleDemo/UseThrottleDemo";
import UseWindowSizeDemo from "./UseWindowSizeDemo/UseWindowSizeDemo";
import MultiSelectDemo from "./MultiSelect/MultiSelectDemo";
import SnakeGame from "./SnakeGame/SnakeGame";

type ComponentEntry = {
  label: string;
  category: string;
  component: React.ReactNode;
};

async function fetchSuggestions(query: string): Promise<string[]> {
  const mock = [
    "react hooks",
    "react router",
    "react context",
    "redux toolkit",
    "typescript generics",
    "typescript types",
    "vite config",
    "mui components",
    "mui icons",
    "node express",
    "mongodb atlas",
    "tailwind css",
  ];

  await new Promise((res) => setTimeout(res, 150));

  return mock.filter((s) => s.toLowerCase().startsWith(query.toLowerCase()));
}

const componentList: ComponentEntry[] = [
  {
    label: "UseState",
    category: "Hooks",
    component: <UseState />,
  },
  {
    label: "UseReducer",
    category: "Hooks",
    component: <UseReducerDemo />,
  },
  {
    label: "UseEffect",
    category: "Hooks",
    component: <UseEffectDemo />,
  },

  {
    label: "UseLayoutEffect",
    category: "Hooks",
    component: <UseLayoutEffectDemo />,
  },
  {
    label: "UseInsertionEffect",
    category: "Hooks",
    component: <UseInsertionEffectDemo />,
  },
  {
    label: "UseRefDemo",
    category: "Hooks",
    component: <UseRefDemo />,
  },
  {
    label: "UseContext",
    category: "Hooks",
    component: <UseContextDemo />,
  },
  {
    label: "UseMemo",
    category: "Hooks",
    component: <UseMemoDemo />,
  },
  {
    label: "UseCallback",
    category: "Hooks",
    component: <UseCallbackDemo />,
  },
  {
    label: "UseTransition",
    category: "Hooks",
    component: <UseTransitionDemo />,
  },
  {
    label: "UseDeferred",
    category: "Hooks",
    component: <UseDeferredValueDemo />,
  },
  {
    label: "UseId",
    category: "Hooks",
    component: <UseIdDemo />,
  },
  {
    label: "Usesyncexternalstore",
    category: "Hooks",
    component: <UseSyncExternalStoreDemo />,
  },
  {
    label: "UseDebugValue",
    category: "Hooks",
    component: <UseDebugValueDemo />,
  },
  {
    label: "Use",
    category: "Hooks",
    component: <UseHookDemo />,
  },
  {
    label: "UseOptimistic",
    category: "Hooks",
    component: <UseOptimisticDemo />,
  },
  {
    label: "useFormStatus",
    category: "Hooks",
    component: <UseFormStatusDemo />,
  },
  {
    label: "useActionState",
    category: "Hooks",
    component: <UseActionStateDemo />,
  },
  {
    label: "UseDebounce",
    category: "Hooks",
    component: <UseDebounceDemo />,
  },
  {
    label: "UseThrottle",
    category: "Hooks",
    component: <UseThrottleDemo />,
  },
  {
    label: "UseWindowSize",
    category: "Hooks",
    component: <UseWindowSizeDemo />,
  },
  {
    label: "TabList",
    category: "Compound",
    component: <TabList />,
  },
  {
    label: "Accordion",
    category: "Compound",
    component: (
      <Accordion defaultOpen="q1" multiple={false}>
        <Accordion.Item id="q1">
          <Accordion.Trigger>What is React?</Accordion.Trigger>
          <Accordion.Panel>A JS library for building UIs.</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item id="q2">
          <Accordion.Trigger>What is a compound component?</Accordion.Trigger>
          <Accordion.Panel>
            Components that share implicit state via Context.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    ),
  },
  {
    label: "Pagination",
    category: "Compound",
    component: (
      <Pagination
        total={500}
        defaultPageSize={10}
        defaultPage={1}
        onChange={(page, pageSize) => console.log(page, pageSize)}
      >
        <Pagination.Prev />
        <Pagination.Pages
          renderPage={({ page, isActive, onClick }: PageRenderProps) => (
            <button
              key={page}
              onClick={onClick}
              aria-label={`Page ${page}`}
              style={{ fontWeight: isActive ? 700 : 400 }}
            >
              {page}
            </button>
          )}
        />
        <Pagination.Next />
        <Pagination.PageSize options={[10, 25, 50, 100]} label="Per page:" />
      </Pagination>
    ),
  },
  {
    label: "Popover",
    category: "Compound",
    component: (
      <Popover>
        <Popover.Action>Click Me</Popover.Action>
        <Popover.Content>Hello There!!!</Popover.Content>
      </Popover>
    ),
  },
  {
    label: "AutoComplete",
    category: "Overlay",
    component: (
      <Autocomplete
        // ghost text -Ghost text align होत नाही कारण input चा exact pixel position match होत नाही.
        fetchSuggestions={fetchSuggestions}
        onSearch={(query) => console.log("Search:", query)}
        placeholder="Search products..."
        historyKey="my_search_history"
        maxHistory={5}
      />
    ),
  },
  {
    label: "MultiSelect",
    category: "Overlay",
    component: <MultiSelectDemo />,
  },
  {
    label: "Modal",
    category: "Overlay",
    component: <Modal />,
  },
  {
    label: "Toast",
    category: "Overlay",
    component: <ToastContainer />,
  },
  {
    label: "CustomCalendar",
    category: "Overlay",
    component: <CustomCalendar />,
  },
  {
    label: "TimePicker",
    category: "Overlay",
    component: <TimePicker />,
  },
  {
    label: "DynamicForm",
    category: "Forms",
    component: <DynamicForm />,
  },
  {
    label: "OTP Input",
    category: "Forms",
    component: <OTP />,
  },
  {
    label: "StarRating",
    category: "Forms",
    component: <StarRating />,
  },
  {
    label: "Switch",
    category: "Forms",
    component: <Switch />,
  },
  {
    label: "DarkLightMode",
    category: "Theme",
    component: <DarkLightMode />,
  },
  {
    label: "MemoryGame",
    category: "Games",
    component: <MemoryGame />,
  },
  {
    label: "TicTacToe",
    category: "Games",
    component: <TicTacToe />,
  },
  {
    label: "SnakeGame",
    category: "Games",
    component: <SnakeGame />,
  },
  {
    label: "TodoApp",
    category: "Apps",
    component: <TodoApp />,
  },
  {
    label: "FileExplorer",
    category: "Apps",
    component: <FileExplore />,
  },
  {
    label: "Carousel",
    category: "UI",
    component: <Carousel />,
  },
  {
    label: "Stopwatch",
    category: "UI",
    component: <Stopwatch />,
  },
  {
    label: "DigitalClock",
    category: "UI",
    component: <DigitalClock />,
  },
  {
    label: "GridColor",
    category: "UI",
    component: <GridColor />,
  },
  {
    label: "TrafficLights",
    category: "UI",
    component: <TraficLights />,
  },
  {
    label: "OverlappingCircle",
    category: "UI",
    component: <OverLappingCircle />,
  },
  {
    label: "TypingEffect",
    category: "UI",
    component: (
      <TypingEffect
        texts={["Frontend Developer", "React Enthusiast", "TypeScript Lover"]}
        typeSpeed={80}
        deleteSpeed={40}
        pauseAfter={1500}
        loop={true}
        render={({ text, cursor }) => (
          <h1 style={{ fontSize: 32 }}>
            I am a {text}
            {cursor}
          </h1>
        )}
      />
    ),
  },
  {
    label: "Breadcrumb",
    category: "UI",
    component: (
      <>
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/products">Products</Breadcrumb.Item>
          <Breadcrumb.Item>Shoes</Breadcrumb.Item>
        </Breadcrumb>
        <Breadcrumb separator="›">
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item>Settings</Breadcrumb.Item>
        </Breadcrumb>
        <Breadcrumb maxItems={4}>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Item href="/a">Category</Breadcrumb.Item>
          <Breadcrumb.Item href="/a/b">Sub</Breadcrumb.Item>
          <Breadcrumb.Item href="/a/b/c">Product</Breadcrumb.Item>
          <Breadcrumb.Item>Detail</Breadcrumb.Item>
        </Breadcrumb>
      </>
    ),
  },
  {
    label: "ProgressBar",
    category: "UI",
    component: <ProgressBar />,
  },
  {
    label: "SkeletonCard",
    category: "UI",
    component: <SkeletonCard />,
  },
  {
    label: "Stepper",
    category: "UI",
    component: <Stepper />,
  },
  {
    label: "DragAndDrop",
    category: "Drag",
    component: <DragAndDrop />,
  },
  {
    label: "TableRowDrag",
    category: "Drag",
    component: <TableRowDrag />,
  },
  {
    label: "VirtualScroll",
    category: "Performance",
    component: <VirtualScroll />,
  },
  {
    label: "InfiniteScroll",
    category: "Performance",
    component: <InfiniteScroll />,
  },
];

const categories = [
  "All",
  ...Array.from(new Set(componentList.map((c) => c.category))),
];

function App() {
  const [activeLabel, setActiveLabel] = useState(componentList[0].label);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? componentList
      : componentList.filter((c) => c.category === activeCategory);

  const active = componentList.find((c) => c.label === activeLabel);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          borderRight: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          background: "#fafafa",
        }}
      >
        <div
          style={{ padding: "16px 12px 8px", fontWeight: 700, fontSize: 15 }}
        >
          React UI Components
        </div>

        {/* Category filter */}
        <div
          style={{
            padding: "0 8px 8px",
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 12,
                border: "1px solid #ccc",
                background: activeCategory === cat ? "#1976d2" : "#fff",
                color: activeCategory === cat ? "#fff" : "#333",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Component list */}
        <nav style={{ flex: 1 }}>
          {filtered.map((c) => (
            <div
              key={c.label}
              onClick={() => setActiveLabel(c.label)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: 13,
                background: activeLabel === c.label ? "#e3f2fd" : "transparent",
                borderLeft:
                  activeLabel === c.label
                    ? "3px solid #1976d2"
                    : "3px solid transparent",
                color: activeLabel === c.label ? "#1976d2" : "#333",
                fontWeight: activeLabel === c.label ? 600 : 400,
              }}
            >
              {c.label}
              <span
                style={{
                  float: "right",
                  fontSize: 10,
                  color: "#999",
                  marginTop: 2,
                }}
              >
                {c.category}
              </span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginBottom: 24, color: "#1976d2" }}>{active?.label}</h2>
        <div style={{ width: "100%", maxWidth: 800 }}>{active?.component}</div>
      </main>
    </div>
  );
}

export default App;
