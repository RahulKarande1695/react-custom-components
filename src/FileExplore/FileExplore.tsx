import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type NodeType = "file" | "folder";
type AddMode = "file" | "folder" | null;

interface FileNode {
  id: number;
  name: string;
  type: NodeType;
  ext?: string;
  expanded?: boolean;
  children?: FileNode[];
}

// ── Dummy data ───────────────────────────────────────────────────────────────

const initialTree: FileNode[] = [
  {
    id: 1, name: "src", type: "folder", expanded: true,
    children: [
      {
        id: 2, name: "components", type: "folder", expanded: false,
        children: [
          { id: 3, name: "Button.tsx", type: "file", ext: "tsx" },
          { id: 4, name: "Modal.tsx",  type: "file", ext: "tsx" },
          { id: 5, name: "Navbar.tsx", type: "file", ext: "tsx" },
        ],
      },
      {
        id: 6, name: "pages", type: "folder", expanded: false,
        children: [
          { id: 7, name: "Home.tsx",      type: "file", ext: "tsx" },
          { id: 8, name: "About.tsx",     type: "file", ext: "tsx" },
          { id: 9, name: "Dashboard.tsx", type: "file", ext: "tsx" },
        ],
      },
      { id: 10, name: "App.tsx",    type: "file", ext: "tsx" },
      { id: 11, name: "main.tsx",   type: "file", ext: "tsx" },
      { id: 12, name: "index.css",  type: "file", ext: "css" },
    ],
  },
  {
    id: 13, name: "public", type: "folder", expanded: false,
    children: [
      { id: 14, name: "vite.svg",    type: "file", ext: "svg" },
      { id: 15, name: "favicon.ico", type: "file", ext: "ico" },
    ],
  },
  { id: 16, name: "package.json",   type: "file", ext: "json" },
  { id: 17, name: "vite.config.ts", type: "file", ext: "ts"   },
  { id: 18, name: "tsconfig.json",  type: "file", ext: "json" },
  { id: 19, name: "README.md",      type: "file", ext: "md"   },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

let nextId = 100;

const extColor: Record<string, string> = {
  tsx: "#61dafb", ts: "#3178c6", css: "#f472b6", json: "#f59e0b",
  svg: "#a78bfa", ico: "#94a3b8", md: "#34d399",  js:  "#facc15",
};
const extBg: Record<string, string> = {
  tsx: "#e0f7ff", ts: "#dbeafe", css: "#fce7f3", json: "#fef3c7",
  svg: "#ede9fe", ico: "#f1f5f9", md: "#d1fae5",  js:  "#fef9c3",
};

const getExtColor = (ext?: string): string => extColor[ext ?? ""] ?? "#94a3b8";
const getExtBg    = (ext?: string): string => extBg[ext ?? ""]    ?? "#f1f5f9";

function findAndUpdate(
  nodes: FileNode[],
  targetId: number,
  updater: (n: FileNode) => FileNode,
): FileNode[] {
  return nodes.map(node => {
    if (node.id === targetId) return updater(node);
    if (node.children)
      return { ...node, children: findAndUpdate(node.children, targetId, updater) };
    return node;
  });
}

function findAndDelete(nodes: FileNode[], targetId: number): FileNode[] {
  return nodes
    .filter(n => n.id !== targetId)
    .map(n => n.children ? { ...n, children: findAndDelete(n.children, targetId) } : n);
}

function addChildTo(nodes: FileNode[], parentId: number, newNode: FileNode): FileNode[] {
  return nodes.map(node => {
    if (node.id === parentId)
      return { ...node, expanded: true, children: [...(node.children ?? []), newNode] };
    if (node.children)
      return { ...node, children: addChildTo(node.children, parentId, newNode) };
    return node;
  });
}

function countFiles(nodes: FileNode[]): number {
  return nodes.reduce<number>(
    (acc, n) => n.type === "file" ? acc + 1 : acc + countFiles(n.children ?? []),
    0,
  );
}

function countFolders(nodes: FileNode[]): number {
  return nodes.reduce<number>(
    (acc, n) => n.type === "folder" ? acc + 1 + countFolders(n.children ?? []) : acc,
    0,
  );
}

// ── FileIcon ─────────────────────────────────────────────────────────────────

interface FileIconProps { ext?: string; type: NodeType; }

function FileIcon({ ext, type }: FileIconProps) {
  if (type === "folder") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path
          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
          fill="#f59e0b" stroke="#d97706" strokeWidth="1"
        />
      </svg>
    );
  }
  const color = getExtColor(ext);
  const bg    = getExtBg(ext);
  const style: CSSProperties = {
    fontSize: 9, fontWeight: 700, background: bg, color,
    borderRadius: 3, padding: "1px 4px", flexShrink: 0,
    letterSpacing: "0.02em", border: `1px solid ${color}33`,
    fontFamily: "monospace", lineHeight: "14px",
  };
  return <span style={style}>{(ext ?? "?").toUpperCase()}</span>;
}

// ── ActionBtn ─────────────────────────────────────────────────────────────────

interface ActionBtnProps {
  children: ReactNode;
  onClick: () => void;
  title: string;
  danger?: boolean;
}

function ActionBtn({ children, onClick, title, danger = false }: ActionBtnProps) {
  const [hover, setHover] = useState(false);
  const style: CSSProperties = {
    background: hover ? (danger ? "#fee2e2" : "var(--color-background-secondary)") : "transparent",
    border: "none", borderRadius: 4, padding: "3px 4px", cursor: "pointer",
    color: hover && danger ? "#dc2626" : "var(--color-text-secondary)",
    display: "flex", alignItems: "center", transition: "all 0.1s",
  };
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
    >
      {children}
    </button>
  );
}

// ── TreeNode ──────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  selectedId: number | null;
  onToggle: (id: number) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
  onAdd: (parentId: number, newNode: FileNode) => void;
  onSelect: (id: number) => void;
}

function TreeNode({
  node, depth, selectedId,
  onToggle, onRename, onDelete, onAdd, onSelect,
}: TreeNodeProps) {
  const [editMode, setEditMode] = useState(false);
  const [editVal,  setEditVal]  = useState(node.name);
  const [hovering, setHovering] = useState(false);
  const [addMode,  setAddMode]  = useState<AddMode>(null);
  const [addVal,   setAddVal]   = useState("");

  const isSelected = selectedId === node.id;
  const indent     = depth * 16;

  function handleRename(): void {
    if (editVal.trim()) onRename(node.id, editVal.trim());
    setEditMode(false);
  }

  function handleAdd(): void {
    if (!addVal.trim() || !addMode) { setAddMode(null); return; }
    const ext     = addMode === "file" ? addVal.trim().split(".").pop() : undefined;
    const newNode: FileNode = {
      id: nextId++,
      name: addVal.trim(),
      type: addMode,
      ext,
      ...(addMode === "folder" ? { children: [], expanded: false } : {}),
    };
    onAdd(node.id, newNode);
    setAddVal(""); setAddMode(null);
  }

  const rowStyle: CSSProperties = {
    display: "flex", alignItems: "center", gap: 6,
    padding: `4px 8px 4px ${indent + 8}px`,
    cursor: "pointer", borderRadius: 6,
    background: isSelected ? "rgba(55,138,221,0.1)" : hovering ? "rgba(0,0,0,0.03)" : "transparent",
    border: isSelected ? "1px solid rgba(55,138,221,0.25)" : "1px solid transparent",
    transition: "background 0.12s",
    userSelect: "none",
  };

  return (
    <div>
      {/* Row */}
      <div
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={() => { onSelect(node.id); if (node.type === "folder") onToggle(node.id); }}
        style={rowStyle}
      >
        {node.type === "folder" && (
          <span style={{ fontSize: 10, color: "#94a3b8", width: 12, flexShrink: 0, lineHeight: 1 }}>
            {node.expanded ? "▾" : "▸"}
          </span>
        )}
        {node.type === "file" && <span style={{ width: 12, flexShrink: 0 }} />}

        <FileIcon ext={node.ext} type={node.type} />

        {editMode ? (
          <input
            autoFocus
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => {
              if (e.key === "Enter")  handleRename();
              if (e.key === "Escape") setEditMode(false);
            }}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: 13, border: "1px solid #378add", borderRadius: 4,
              padding: "1px 6px", outline: "none", flex: 1,
              background: "var(--color-background-primary)",
              color: "var(--color-text-primary)",
            }}
          />
        ) : (
          <span style={{
            fontSize: 13, flex: 1,
            color: isSelected ? "var(--color-text-info)" : "var(--color-text-primary)",
            fontFamily: node.type === "file" ? "monospace" : "inherit",
          }}>
            {node.name}
          </span>
        )}

        {(hovering || isSelected) && !editMode && (
          <span
            style={{ display: "flex", gap: 2, marginLeft: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            {node.type === "folder" && (
              <>
                <ActionBtn title="New file" onClick={() => { setAddMode("file"); setAddVal(""); onSelect(node.id); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="12" y1="12" x2="12" y2="18"/>
                    <line x1="9"  y1="15" x2="15" y2="15"/>
                  </svg>
                </ActionBtn>
                <ActionBtn title="New folder" onClick={() => { setAddMode("folder"); setAddVal(""); onSelect(node.id); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h9a2 2 0 012 2z"/>
                    <line x1="12" y1="11" x2="12" y2="17"/>
                    <line x1="9"  y1="14" x2="15" y2="14"/>
                  </svg>
                </ActionBtn>
              </>
            )}
            <ActionBtn title="Rename" onClick={() => { setEditMode(true); setEditVal(node.name); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </ActionBtn>
            <ActionBtn title="Delete" danger onClick={() => onDelete(node.id)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </ActionBtn>
          </span>
        )}
      </div>

      {/* Inline add input */}
      {addMode && (
        <div style={{ paddingLeft: indent + 36, paddingRight: 8, paddingBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FileIcon
              type={addMode}
              ext={addMode === "file" ? (addVal.split(".").pop() ?? "") : undefined}
            />
            <input
              autoFocus
              placeholder={addMode === "file" ? "filename.tsx" : "folder-name"}
              value={addVal}
              onChange={e => setAddVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter")  handleAdd();
                if (e.key === "Escape") setAddMode(null);
              }}
              onBlur={handleAdd}
              style={{
                fontSize: 13, border: "1px solid #378add", borderRadius: 4,
                padding: "2px 8px", outline: "none", flex: 1,
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>
        </div>
      )}

      {/* Recursive children */}
      {node.type === "folder" && node.expanded && node.children?.map(child => (
        <TreeNode
          key={child.id} node={child} depth={depth + 1}
          onToggle={onToggle} onRename={onRename}
          onDelete={onDelete} onAdd={onAdd}
          selectedId={selectedId} onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ── FileExplorer (root) ───────────────────────────────────────────────────────

export default function FileExplorer() {
  const [tree,        setTree]        = useState<FileNode[]>(initialTree);
  const [selectedId,  setSelectedId]  = useState<number | null>(null);
  const [rootAddMode, setRootAddMode] = useState<AddMode>(null);
  const [rootAddVal,  setRootAddVal]  = useState("");

  const handleToggle = (id: number): void => {
    setTree(t => findAndUpdate(t, id, n => ({ ...n, expanded: !n.expanded })));
  };
  const handleRename = (id: number, name: string): void => {
    setTree(t => findAndUpdate(t, id, n => ({ ...n, name })));
  };
  const handleDelete = (id: number): void => {
    setTree(t => findAndDelete(t, id));
    setSelectedId(s => (s === id ? null : s));
  };
  const handleAdd = (parentId: number, newNode: FileNode): void => {
    setTree(t => addChildTo(t, parentId, newNode));
  };

  const handleRootAdd = (): void => {
    if (!rootAddVal.trim() || !rootAddMode) { setRootAddMode(null); return; }
    const ext = rootAddMode === "file" ? rootAddVal.trim().split(".").pop() : undefined;
    const newNode: FileNode = {
      id: nextId++,
      name: rootAddVal.trim(),
      type: rootAddMode,
      ext,
      ...(rootAddMode === "folder" ? { children: [], expanded: false } : {}),
    };
    setTree(t => [...t, newNode]);
    setRootAddVal(""); setRootAddMode(null);
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "var(--color-background-primary)", minHeight: 480 }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#378add" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M3 3h18v18H3zM9 3v18M3 9h6M3 15h6" />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Explorer</span>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", borderRadius: 4, padding: "1px 7px" }}>
            {countFiles(tree)} files · {countFolders(tree)} folders
          </span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <ActionBtn title="New file at root" onClick={() => { setRootAddMode("file"); setRootAddVal(""); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="12" y1="12" x2="12" y2="18"/>
              <line x1="9"  y1="15" x2="15" y2="15"/>
            </svg>
          </ActionBtn>
          <ActionBtn title="New folder at root" onClick={() => { setRootAddMode("folder"); setRootAddVal(""); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h9a2 2 0 012 2z"/>
              <line x1="12" y1="11" x2="12" y2="17"/>
              <line x1="9"  y1="14" x2="15" y2="14"/>
            </svg>
          </ActionBtn>
        </div>
      </div>

      {/* Tree */}
      <div style={{ padding: "6px 4px" }}>
        {tree.map(node => (
          <TreeNode
            key={node.id} node={node} depth={0}
            onToggle={handleToggle} onRename={handleRename}
            onDelete={handleDelete} onAdd={handleAdd}
            selectedId={selectedId} onSelect={setSelectedId}
          />
        ))}

        {rootAddMode && (
          <div style={{ paddingLeft: 20, paddingRight: 8, paddingTop: 2, paddingBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FileIcon
                type={rootAddMode}
                ext={rootAddMode === "file" ? (rootAddVal.split(".").pop() ?? "") : undefined}
              />
              <input
                autoFocus
                placeholder={rootAddMode === "file" ? "filename.tsx" : "folder-name"}
                value={rootAddVal}
                onChange={e => setRootAddVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter")  handleRootAdd();
                  if (e.key === "Escape") setRootAddMode(null);
                }}
                onBlur={handleRootAdd}
                style={{
                  fontSize: 13, border: "1px solid #378add", borderRadius: 4,
                  padding: "2px 8px", outline: "none", flex: 1,
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {selectedId !== null && (
        <div style={{
          margin: "0 8px 8px", padding: "8px 12px",
          background: "var(--color-background-secondary)",
          borderRadius: "var(--border-radius-md)",
          fontSize: 12, color: "var(--color-text-secondary)",
        }}>
          Selected ID: {selectedId} · Hover on any item to see edit / delete / add actions
        </div>
      )}
    </div>
  );
}

// State machine म्हणजे काय?
// UI मध्ये बऱ्याचदा हा bug येतो — loading असताना button परत click होतो, success आणि error एकत्र दिसतात, किंवा impossible state create होतो. State machine हे fix करतो कारण फक्त valid transitions allow होतात.

// type State = 'idle' | 'loading' | 'success' | 'error'

// type Event =
//   | { type: 'FETCH' }
//   | { type: 'RESOLVE'; data: string }
//   | { type: 'REJECT'; error: string }
//   | { type: 'RESET' }

// function transition(state: State, event: Event): State {
//   switch (`${state}.${event.type}`) {
//     case 'idle.FETCH': return 'loading'
//     case 'loading.RESOLVE': return 'success'
//     case 'loading.REJECT': return 'error'
//     case 'error.RESET':
//     case 'success.RESET': return 'idle'
//     default: return state // invalid transitions ignore
//   }
// }

// function useFetchMachine() {
//   const [state, setState] = useState<State>('idle')
//   const send = (ev: Event) =>
//     setState(s => transition(s, ev))
//   return { state, send }
// }