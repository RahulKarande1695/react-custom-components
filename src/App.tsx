import "./App.css";
import DigitalClock from "./Clock/Clock";
import ImagePlayGround from "./DragAndDrop/DragAndDrop";
import VirtualScroll from "./VirtualScroll";
import Popover from "./Popover/Popover";
import Stopwatch from "./Stopwatch/Stopwatch";
import ToastContainer from "./Toast/Toast";
import InfiniteScroll from "./InfiniteScroll/InfiniteScroll";
import GridColor from "./GridColor/GridColor";
import ToastCall from "./Toast/Toast";
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

function App() {

  return (
    // <VirtualScroll />
    // <InfiniteScroll />
    /* <ToastContainer>
      <MyToast />
     </ToastContainer>  */
    // <GridColor />
    // <ToastCall />
    //  <ImagePlayGround />
    // <Stopwatch />
    // <DigitalClock />
    /* <Popover >
    <Popover.Action>Click Me</Popover.Action>
    <Popover.Content>Hello There!!!</Popover.Content>
    </Popover>  */
    // <TraficLights />
    // <OverLappingCircle />
    // <DragAndDrop />
    // <TableRowDrag />
    // <Switch />
    // <MemoryGame />
    // <TicTacToe />
    // <StarRating />
    // <OTP />
    // <FileExplore />
    // <TabList />
    /* <Pagination
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
    </Pagination> */
    // <DynamicForm />
    // <DarkLightMode />
    /* <Accordion defaultOpen="q1" multiple={false}>
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
    </Accordion> */
    // <TodoApp />
    // <Modal />
    // <Carousel /> 
  );
}

export default App;
