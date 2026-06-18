# React UI Components

A collection of 25+ production-quality UI components built from scratch using **React 18**, **TypeScript**, and **MUI** — covering compound components, render props, custom hooks, accessibility, and performance patterns.

> Built as a hands-on learning playground for mastering React internals and interview-ready component design.

---

## 🚀 Live Demo

🔗 [**View Live →**](https://react-ui-components.vercel.app) *(deploy link — update after Vercel deploy)*

---

## 🧩 Components

| Component | Key Concepts |
|---|---|
| **TabList** | Compound components, ARIA roles, keyboard navigation, orientation variants |
| **Accordion** | Compound components, Context, single/multi open modes |
| **Pagination** | Compound components, render props, page size control |
| **Modal** | Portal rendering, focus trap, backdrop click, keyboard dismiss |
| **Popover** | Compound components, positioning, click-outside detection |
| **Toast** | Context-driven notifications, auto-dismiss, queue management |
| **Carousel** | Touch/swipe support, auto-play, dot navigation |
| **DynamicForm** | Schema-driven form rendering, validation |
| **DarkLightMode** | Theme switching, CSS variables, system preference detection |
| **TodoApp** | CRUD, local state management, filter views |
| **MemoryGame** | Game state, card flip logic, match detection |
| **TicTacToe** | Game logic, win detection, turn management |
| **StarRating** | Controlled/uncontrolled input, hover state |
| **OTP Input** | Multi-input coordination, auto-focus, paste handling |
| **FileExplorer** | Recursive tree rendering, expand/collapse |
| **Switch** | Controlled toggle, accessible ARIA |
| **VirtualScroll** | Windowing, performance optimization for large lists |
| **InfiniteScroll** | Intersection Observer API, paginated data fetching |
| **Stopwatch** | `useRef` vs `useState`, interval management |
| **DigitalClock** | Real-time updates, `setInterval` cleanup |
| **DragAndDrop** | HTML5 Drag API, reorder logic |
| **TableRowDrag** | Drag-to-reorder table rows |
| **TrafficLights** | Sequential state machine, auto-cycle |
| **OverlappingCircle** | CSS geometry, SVG/clip-path |
| **GridColor** | 2D array state, cell interaction |

---

## 🛠 Tech Stack

- **React 18** — Concurrent features, hooks
- **TypeScript** — Strict mode, `verbatimModuleSyntax`
- **Vite** — Fast dev server and optimized builds
- **MUI (`@mui/material`)** — Component library base
- **Emotion** — CSS-in-JS styling

---

## 📦 Run Locally

```bash
git clone https://github.com/RahulKarande1695/react-ui-components.git
cd react-ui-components
npm install
npm run dev
```

---

## 📁 Project Structure

```
src/
├── Accordion/
├── Carousel/
├── DarkLightMode/
├── DragAndDrop/
├── DynamicForm/
├── FileExplore/
├── GridColor/
├── InfiniteScroll/
├── MemoryGame/
├── Modal/
├── OTP/
├── OverLappingCircle/
├── Pagination/
├── Popover/
├── StarRating/
├── Stopwatch/
├── Switch/
├── TabList/
├── TicTacToe/
├── Toast/
├── Todo/
├── TrafficLights/
├── VirtualScroll/
└── Clock/
```

---

## 💡 Patterns Used

- **Compound Components** — TabList, Accordion, Pagination, Popover, Modal
- **Render Props** — Pagination.Pages
- **Context API** — Toast, DarkLightMode, Accordion
- **Custom Hooks** — Stopwatch, InfiniteScroll, DarkLightMode
- **Recursive Rendering** — FileExplorer
- **Performance** — VirtualScroll (windowing), InfiniteScroll (Intersection Observer)

---

## 👤 Author

**Rahul Karande**
[GitHub](https://github.com/RahulKarande1695)