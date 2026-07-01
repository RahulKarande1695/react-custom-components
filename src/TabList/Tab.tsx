import { useState, useRef } from "react";
import type { KeyboardEvent } from "react";
import { styled } from "@mui/material/styles";
import { PersonOutlined } from "@mui/icons-material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CodeIcon from "@mui/icons-material/Code";
import TuneIcon from "@mui/icons-material/Tune";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Tab {
  id: string
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  content: React.ReactNode;
}

export interface TabListProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "underline" | "pill" | "boxed";
  orientation?: "horizontal" | "vertical";
}

// ─── Styled components ────────────────────────────────────────────────────────

const Wrapper = styled("div")<{ isVertical: boolean }>(({ isVertical }) => ({
  display: isVertical ? "flex" : "block",
  fontFamily: "inherit",
}));

const TabBar = styled("div")<{
  isVertical: boolean;
  variant: NonNullable<TabListProps["variant"]>;
}>(({ isVertical, variant }) => ({
  display: "flex",
  flexDirection: isVertical ? "column" : "row",
  gap: variant === "pill" ? 4 : 0,
  padding: variant === "pill" ? 4 : 0,
  background: variant === "pill" ? "#f3f4f6" : "transparent",
  borderRadius: variant === "pill" ? 10 : 0,
  flexShrink: isVertical ? 0 : undefined,
  minWidth: isVertical ? 164 : undefined,
  ...(variant === "underline" && !isVertical && {
    borderBottom: "1.5px solid #e5e7eb",
  }),
  ...(variant === "underline" && isVertical && {
    borderRight: "1.5px solid #e5e7eb",
  }),
}));

const TabButton = styled("button")<{
  isActive: boolean;
  isVertical: boolean;
  variant: NonNullable<TabListProps["variant"]>;
}>(({ isActive, isVertical, variant }) => ({
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 14,
  fontWeight: isActive ? 600 : 400,
  color: isActive ? "#111827" : "#6b7280",
  background:
    (variant === "pill" || variant === "boxed") && isActive
      ? "#ffffff"
      : "transparent",
  border: "none",
  outline: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "color 0.15s, background 0.15s",

  // padding per variant
  padding:
    variant === "underline"
      ? isVertical
        ? "10px 20px 10px 12px"
        : "10px 16px"
      : variant === "pill"
      ? "7px 16px"
      : "9px 18px",

  // underline active indicator
  ...(variant === "underline" && !isVertical && {
    borderBottom: `2px solid ${isActive ? "#111827" : "transparent"}`,
    marginBottom: "-1.5px",
  }),
  ...(variant === "underline" && isVertical && {
    borderRight: `2px solid ${isActive ? "#111827" : "transparent"}`,
    marginRight: "-1.5px",
  }),

  // pill variant
  ...(variant === "pill" && {
    borderRadius: 7,
    boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
  }),

  // boxed variant
  ...(variant === "boxed" && {
    border: `1px solid ${isActive ? "#d1d5db" : "transparent"}`,
    borderRadius: isVertical
      ? "7px 0 0 7px"
      : "7px 7px 0 0",
  }),

  "&:disabled": {
    opacity: 0.38,
    cursor: "not-allowed",
  },

  "&:focus-visible": {
    boxShadow: "0 0 0 2px #6366f1",
    borderRadius: 4,
  },

  // icon sizing
  "& svg": {
    fontSize: 17,
    flexShrink: 0,
  },
}));

const PanelWrapper = styled("div")<{ isVertical: boolean }>(({ isVertical }) => ({
  flex: isVertical ? 1 : undefined,
}));

const Panel = styled("div")<{ isVertical: boolean }>(({ isVertical }) => ({
  padding: isVertical ? "0 0 0 20px" : "18px 0 0",
  outline: "none",
}));

// ─── TabList Component ────────────────────────────────────────────────────────

export function TabList({
  tabs,
  defaultTab,
  onChange,
  variant = "underline",
  orientation = "horizontal",
}: TabListProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab ?? tabs[0]?.id ?? ""
  );
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isVertical = orientation === "vertical";

  function selectTab(id: string) {
    setActiveTab(id);
    onChange?.(id);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIdx = enabledTabs.findIndex((t) => t.id === activeTab);
    const prev = isVertical ? "ArrowUp" : "ArrowLeft";
    const next = isVertical ? "ArrowDown" : "ArrowRight";

    if (e.key === prev) {
      e.preventDefault();
      const t = enabledTabs[(currentIdx - 1 + enabledTabs.length) % enabledTabs.length];
      selectTab(t.id);
      tabRefs.current[t.id]?.focus();
    } else if (e.key === next) {
      e.preventDefault();
      const t = enabledTabs[(currentIdx + 1) % enabledTabs.length];
      selectTab(t.id);
      tabRefs.current[t.id]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      selectTab(enabledTabs[0].id);
      tabRefs.current[enabledTabs[0].id]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = enabledTabs[enabledTabs.length - 1];
      selectTab(last.id);
      tabRefs.current[last.id]?.focus();
    }
  }

  return (
    <Wrapper isVertical={isVertical}>
      <TabBar
        role="tablist"
        aria-orientation={orientation}
        onKeyDown={handleKeyDown}
        isVertical={isVertical}
        variant={variant}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <TabButton
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && selectTab(tab.id)}
              isActive={isActive}
              isVertical={isVertical}
              variant={variant}
            >
              {tab.icon}
              {tab.label}
            </TabButton>
          );
        })}
      </TabBar>

      <PanelWrapper isVertical={isVertical}>
        {tabs.map((tab) => (
          <Panel
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={tab.id !== activeTab}
            tabIndex={0}
            isVertical={isVertical}
          >
            {tab.id === activeTab && tab.content}
          </Panel>
        ))}
      </PanelWrapper>
    </Wrapper>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

const demoTabs: Tab[] = [
  {
    id: "profile",
    label: "Profile",
    icon: <PersonOutlined />,
    content: (
      <div>
        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15 }}>Profile settings</p>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Manage your name, avatar, and personal details here.
        </p>
      </div>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <NotificationsNoneIcon />,
    content: (
      <div>
        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15 }}>Notifications</p>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Control which alerts you receive and how often.
        </p>
      </div>
    ),
  },
  {
    id: "api",
    label: "API",
    icon: <CodeIcon />,
    content: (
      <div>
        <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15 }}>API access</p>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Generate and manage API keys for external integrations.
        </p>
      </div>
    ),
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: <TuneIcon />,
    disabled: true,
    content: null,
  },
];

// ─── Demo Controls styled ─────────────────────────────────────────────────────

const DemoWrap = styled("div")({
  padding: 32,
  maxWidth: 600,
  margin: "0 auto",
});

const ControlRow = styled("div")({
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 28,
});

const Divider = styled("div")({
  width: 1,
  height: 20,
  background: "#e5e7eb",
});

const CtrlBtn = styled("button")<{ isActive: boolean }>(({ isActive }) => ({
  padding: "5px 13px",
  fontSize: 13,
  borderRadius: 7,
  border: "1px solid #d1d5db",
  background: isActive ? "#f3f4f6" : "transparent",
  color: "#111827",
  cursor: "pointer",
  fontWeight: isActive ? 600 : 400,
  transition: "background 0.15s",
  "&:hover": {
    background: "#f9fafb",
  },
}));

export default function Tab() {
  const [variant, setVariant] = useState<TabListProps["variant"]>("underline");
  const [orientation, setOrientation] = useState<TabListProps["orientation"]>("horizontal");

  return (
    <DemoWrap>
      <ControlRow>
        {(["underline", "pill", "boxed"] as const).map((v) => (
          <CtrlBtn key={v} isActive={variant === v} onClick={() => setVariant(v)}>
            {v}
          </CtrlBtn>
        ))}
        <Divider />
        {(["horizontal", "vertical"] as const).map((o) => (
          <CtrlBtn key={o} isActive={orientation === o} onClick={() => setOrientation(o)}>
            {o}
          </CtrlBtn>
        ))}
      </ControlRow>

      <TabList
        tabs={demoTabs}
        variant={variant}
        orientation={orientation}
        onChange={(id) => console.log("Active tab:", id)}
      />
    </DemoWrap>
  );
}