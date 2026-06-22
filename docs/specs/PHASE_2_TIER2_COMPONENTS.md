# Phase 2 — Tier 2 Components (Panel, Card, Row, Grid)

**Duration:** Weeks 4–6  
**Parallel tracks:** 4 (one per component)  
**Output:** 16 files (4 TSX + 4 CSS + 4 test suites + 4 story files)  
**Tests:** 28 unit tests + 8 snapshot tests  
**Commits:** 4 atomic commits (one per component)

---

## Component Dependency Chain

```
Grid → Panel + Card + Row
      ↑
All use: density tokens, dark mode v2, motion tokens, spacing tokens
```

**Implementation order (no blockers):**
1. Panel v2 (foundation for others)
2. Card (independent)
3. Row v2 (independent)
4. Grid (depends on spacing tokens, not on above)

---

# Component 1: Panel v2

## Purpose
Structural container for all CIC dashboard panels. Elevation + border + density-aware padding. Dark mode v2.0 support.

## API

```typescript
export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline";
  elevation?: 0 | 1 | 2 | 3;
  padding?: "compact" | "cozy" | "comfortable";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ variant = "default", elevation = 0, padding = "cozy", header, footer, loading, children, className, ...props }, ref) => {
    // Implementation
  }
);
```

## Styling (src/components/cic/panel.css)

```css
/* Panel Base */
.cic-panel {
  position: relative;
  background-color: var(--cic-surface-layer-0);
  border-radius: 8px;
  border: 1px solid var(--cic-color-border);
  transition: all var(--cic-motion-fade) ease;
}

/* Variants */
.cic-panel--default {
  background-color: var(--cic-surface-layer-0);
  border: 1px solid var(--cic-color-border);
}

.cic-panel--elevated {
  background-color: var(--cic-surface-layer-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--cic-color-border);
}

.cic-panel--outline {
  background-color: transparent;
  border: 2px solid var(--cic-color-accent);
}

/* Elevation Layers */
.cic-panel[data-elevation="0"] {
  background-color: var(--cic-surface-layer-0);
}

.cic-panel[data-elevation="1"] {
  background-color: var(--cic-surface-layer-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.cic-panel[data-elevation="2"] {
  background-color: var(--cic-surface-layer-2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
}

.cic-panel[data-elevation="3"] {
  background-color: var(--cic-surface-layer-3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.20);
}

/* Padding Density */
.cic-panel[data-padding="compact"] {
  padding: calc(8px * var(--cic-density-factor));
}

.cic-panel[data-padding="cozy"] {
  padding: calc(12px * var(--cic-density-factor));
}

.cic-panel[data-padding="comfortable"] {
  padding: calc(16px * var(--cic-density-factor));
}

/* Header + Footer */
.cic-panel-header {
  padding-bottom: calc(8px * var(--cic-density-factor));
  border-bottom: 1px solid var(--cic-color-border);
  margin-bottom: calc(8px * var(--cic-density-factor));
  font-weight: 600;
  font-size: 14px;
  color: var(--cic-color-text);
}

.cic-panel-footer {
  padding-top: calc(8px * var(--cic-density-factor));
  border-top: 1px solid var(--cic-color-border);
  margin-top: calc(8px * var(--cic-density-factor));
  font-size: 12px;
  color: var(--cic-color-text-muted);
}

.cic-panel-body {
  flex: 1;
}

/* Loading State */
.cic-panel.loading {
  opacity: 0.6;
  pointer-events: none;
}

.cic-panel.loading::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

## Implementation (src/components/cic/Panel.tsx)

```typescript
import React from "react";
import "./panel.css";

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline";
  elevation?: 0 | 1 | 2 | 3;
  padding?: "compact" | "cozy" | "comfortable";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
}

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      variant = "default",
      elevation = 0,
      padding = "cozy",
      header,
      footer,
      loading = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const variantClass = `cic-panel--${variant}`;
    const paddingAttr = `data-padding="${padding}"`;
    const elevationAttr = `data-elevation="${elevation}"`;
    const loadingClass = loading ? "loading" : "";

    return (
      <div
        ref={ref}
        className={["cic-panel", variantClass, loadingClass, className]
          .filter(Boolean)
          .join(" ")}
        data-padding={padding}
        data-elevation={elevation}
        {...props}
      >
        {header && <div className="cic-panel-header">{header}</div>}
        <div className="cic-panel-body">{children}</div>
        {footer && <div className="cic-panel-footer">{footer}</div>}
      </div>
    );
  }
);

Panel.displayName = "Panel";
```

## Tests (src/tests/cic/Panel.test.tsx)

```typescript
import React from "react";
import { render, screen } from "@testing-library/react";
import { Panel } from "../../components/cic/Panel";

describe("Panel Component", () => {
  test("renders panel with children", () => {
    render(<Panel>Content</Panel>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("renders with header", () => {
    render(<Panel header="Title">Content</Panel>);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  test("renders with footer", () => {
    render(<Panel footer="Footer">Content</Panel>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  test("applies variant class", () => {
    const { container } = render(<Panel variant="elevated">Content</Panel>);
    expect(container.querySelector(".cic-panel--elevated")).toBeInTheDocument();
  });

  test("forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Panel ref={ref}>Content</Panel>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test("applies elevation attribute", () => {
    const { container } = render(<Panel elevation={2}>Content</Panel>);
    expect(container.querySelector('[data-elevation="2"]')).toBeInTheDocument();
  });

  test("applies loading state", () => {
    const { container } = render(<Panel loading>Content</Panel>);
    expect(container.querySelector(".loading")).toBeInTheDocument();
  });

  test("default padding is cozy", () => {
    const { container } = render(<Panel>Content</Panel>);
    expect(container.querySelector('[data-padding="cozy"]')).toBeInTheDocument();
  });
});
```

## Stories (src/stories/cic/Panel.stories.tsx)

```typescript
import React from "react";
import { Panel } from "../../components/cic/Panel";

export default {
  title: "Components/Panel",
  component: Panel,
};

export const Default = () => <Panel header="Default Panel">Content goes here</Panel>;

export const Elevated = () => <Panel variant="elevated" header="Elevated Panel">Content with elevation</Panel>;

export const Outline = () => <Panel variant="outline" header="Outline Panel">Content with accent outline</Panel>;

export const WithFooter = () => (
  <Panel header="Panel with Footer" footer="Footer text">
    Main content area
  </Panel>
);

export const Loading = () => (
  <Panel header="Loading State" loading>
    This content appears faded during loading
  </Panel>
);

export const DensityCompact = () => (
  <Panel padding="compact" header="Compact">
    Reduced padding for dense layouts
  </Panel>
);

export const DensityComfortable = () => (
  <Panel padding="comfortable" header="Comfortable">
    Increased padding for relaxed layouts
  </Panel>
);
```

---

# Component 2: Card

## Purpose
Lightweight container for grouped content. Smaller footprint than Panel. Used in grids and lists.

## API

```typescript
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  image?: React.ReactNode;
  footer?: React.ReactNode;
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, image, footer, interactive = false, children, className, ...props }, ref) => {
    // Implementation
  }
);
```

## Styling (src/components/cic/card.css)

```css
.cic-card {
  display: flex;
  flex-direction: column;
  background-color: var(--cic-surface-layer-1);
  border: 1px solid var(--cic-color-border);
  border-radius: 8px;
  padding: calc(12px * var(--cic-density-factor));
  transition: all var(--cic-motion-fade) ease;
}

.cic-card.interactive:hover {
  border-color: var(--cic-color-accent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.cic-card.interactive:focus-within {
  outline: 2px solid var(--cic-color-accent);
  outline-offset: 2px;
}

.cic-card-image {
  margin: calc(-12px * var(--cic-density-factor)) calc(-12px * var(--cic-density-factor)) calc(8px * var(--cic-density-factor)) calc(-12px * var(--cic-density-factor));
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}

.cic-card-header {
  margin-bottom: calc(8px * var(--cic-density-factor));
}

.cic-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--cic-color-text);
  margin: 0;
}

.cic-card-subtitle {
  font-size: 12px;
  color: var(--cic-color-text-muted);
  margin: calc(4px * var(--cic-density-factor)) 0 0 0;
}

.cic-card-body {
  flex: 1;
  font-size: 14px;
  color: var(--cic-color-text);
  line-height: 1.5;
}

.cic-card-footer {
  margin-top: calc(8px * var(--cic-density-factor));
  padding-top: calc(8px * var(--cic-density-factor));
  border-top: 1px solid var(--cic-color-border);
  font-size: 12px;
  color: var(--cic-color-text-muted);
}
```

## Implementation (src/components/cic/Card.tsx)

```typescript
import React from "react";
import "./card.css";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  image?: React.ReactNode;
  footer?: React.ReactNode;
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      subtitle,
      image,
      footer,
      interactive = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const interactiveClass = interactive ? "interactive" : "";

    return (
      <div
        ref={ref}
        className={["cic-card", interactiveClass, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {image && <div className="cic-card-image">{image}</div>}
        {(title || subtitle) && (
          <div className="cic-card-header">
            {title && <h3 className="cic-card-title">{title}</h3>}
            {subtitle && <p className="cic-card-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="cic-card-body">{children}</div>
        {footer && <div className="cic-card-footer">{footer}</div>}
      </div>
    );
  }
);

Card.displayName = "Card";
```

## Tests (src/tests/cic/Card.test.tsx)

```typescript
import React from "react";
import { render, screen } from "@testing-library/react";
import { Card } from "../../components/cic/Card";

describe("Card Component", () => {
  test("renders card with children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  test("renders title and subtitle", () => {
    render(<Card title="Title" subtitle="Subtitle">Content</Card>);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Subtitle")).toBeInTheDocument();
  });

  test("renders footer", () => {
    render(<Card footer="Footer text">Content</Card>);
    expect(screen.getByText("Footer text")).toBeInTheDocument();
  });

  test("renders image slot", () => {
    const { container } = render(
      <Card image={<img alt="test" src="test.jpg" />}>Content</Card>
    );
    expect(container.querySelector(".cic-card-image")).toBeInTheDocument();
  });

  test("applies interactive class", () => {
    const { container } = render(<Card interactive>Content</Card>);
    expect(container.querySelector(".interactive")).toBeInTheDocument();
  });

  test("forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test("renders with all slots", () => {
    render(
      <Card
        title="Full Card"
        subtitle="With everything"
        image={<div>Image</div>}
        footer="Footer"
      >
        Main content
      </Card>
    );
    expect(screen.getByText("Full Card")).toBeInTheDocument();
    expect(screen.getByText("With everything")).toBeInTheDocument();
    expect(screen.getByText("Image")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
```

## Stories (src/stories/cic/Card.stories.tsx)

```typescript
import React from "react";
import { Card } from "../../components/cic/Card";

export default {
  title: "Components/Card",
  component: Card,
};

export const Default = () => <Card>Simple card content</Card>;

export const WithTitle = () => <Card title="Card Title">Content area with title</Card>;

export const WithImage = () => (
  <Card
    title="Image Card"
    image={<div style={{ height: 120, background: "#4a9eff" }} />}
  >
    Content below image
  </Card>
);

export const Interactive = () => (
  <Card title="Clickable Card" interactive>
    Hover to see interaction feedback
  </Card>
);

export const WithFooter = () => (
  <Card title="Card" footer="Footer information">
    Main content area
  </Card>
);
```

---

# Component 3: Row v2

## Purpose
Fixed-height row (36px default) for lists, tables, agent lists, queues. Hover/selected/focus states. Density-aware.

## API

```typescript
export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  hover?: boolean;
  height?: number;
  gap?: "compact" | "cozy" | "comfortable";
  children: React.ReactNode;
}

export const Row = React.forwardRef<HTMLDivElement, RowProps>(
  ({ selected = false, hover = false, height, gap = "cozy", children, className, ...props }, ref) => {
    // Implementation
  }
);
```

## Styling (src/components/cic/row.css)

```css
.cic-row {
  display: flex;
  align-items: center;
  height: calc(36px * var(--cic-density-factor));
  padding: 0 calc(8px * var(--cic-density-factor));
  border-bottom: 1px solid var(--cic-color-border);
  background-color: var(--cic-surface-layer-0);
  transition: all var(--cic-motion-fade) ease;
  font-size: 14px;
  color: var(--cic-color-text);
}

/* Gap Variants */
.cic-row[data-gap="compact"] {
  gap: calc(4px * var(--cic-density-factor));
}

.cic-row[data-gap="cozy"] {
  gap: calc(8px * var(--cic-density-factor));
}

.cic-row[data-gap="comfortable"] {
  gap: calc(12px * var(--cic-density-factor));
}

/* Hover State */
.cic-row:hover {
  background-color: var(--cic-surface-layer-1);
}

/* Selected State */
.cic-row.selected {
  background-color: var(--cic-surface-layer-2);
  border-left: 3px solid var(--cic-color-accent);
  padding-left: calc(5px * var(--cic-density-factor));
}

/* Focus */
.cic-row:focus-within {
  outline: 2px solid var(--cic-color-accent);
  outline-offset: -2px;
}

/* Cell */
.cic-row-cell {
  flex: 0 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cic-row-cell--expand {
  flex: 1 1 auto;
}

.cic-row-cell--icon {
  width: calc(24px * var(--cic-density-factor));
  height: calc(24px * var(--cic-density-factor));
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Zebra Striping */
.cic-row:nth-child(even) {
  background-color: rgba(0, 0, 0, 0.02);
}

[data-theme="dark"] .cic-row:nth-child(even) {
  background-color: rgba(255, 255, 255, 0.02);
}

.cic-row:nth-child(even):hover {
  background-color: var(--cic-surface-layer-1);
}
```

## Implementation (src/components/cic/Row.tsx)

```typescript
import React from "react";
import "./row.css";

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  height?: number;
  gap?: "compact" | "cozy" | "comfortable";
  children: React.ReactNode;
}

export const Row = React.forwardRef<HTMLDivElement, RowProps>(
  (
    {
      selected = false,
      height,
      gap = "cozy",
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const selectedClass = selected ? "selected" : "";
    const customStyle = height ? { ...style, height: `${height}px` } : style;

    return (
      <div
        ref={ref}
        className={["cic-row", selectedClass, className]
          .filter(Boolean)
          .join(" ")}
        data-gap={gap}
        style={customStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Row.displayName = "Row";

export interface RowCellProps extends React.HTMLAttributes<HTMLDivElement> {
  expand?: boolean;
  icon?: boolean;
  children: React.ReactNode;
}

export const RowCell = React.forwardRef<HTMLDivElement, RowCellProps>(
  ({ expand = false, icon = false, children, className, ...props }, ref) => {
    const expandClass = expand ? "cic-row-cell--expand" : "";
    const iconClass = icon ? "cic-row-cell--icon" : "";

    return (
      <div
        ref={ref}
        className={["cic-row-cell", expandClass, iconClass, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </div>
    );
  }
);

RowCell.displayName = "RowCell";
```

## Tests (src/tests/cic/Row.test.tsx)

```typescript
import React from "react";
import { render, screen } from "@testing-library/react";
import { Row, RowCell } from "../../components/cic/Row";

describe("Row Component", () => {
  test("renders row with children", () => {
    render(<Row>Row content</Row>);
    expect(screen.getByText("Row content")).toBeInTheDocument();
  });

  test("applies selected class", () => {
    const { container } = render(<Row selected>Selected row</Row>);
    expect(container.querySelector(".selected")).toBeInTheDocument();
  });

  test("applies custom height", () => {
    const { container } = render(<Row height={48}>Tall row</Row>);
    expect(container.querySelector(".cic-row")).toHaveStyle("height: 48px");
  });

  test("forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Row ref={ref}>Row</Row>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test("applies gap attribute", () => {
    const { container } = render(<Row gap="comfortable">Row</Row>);
    expect(container.querySelector('[data-gap="comfortable"]')).toBeInTheDocument();
  });

  test("default gap is cozy", () => {
    const { container } = render(<Row>Row</Row>);
    expect(container.querySelector('[data-gap="cozy"]')).toBeInTheDocument();
  });

  test("RowCell expands", () => {
    const { container } = render(
      <Row>
        <RowCell expand>Expanding cell</RowCell>
      </Row>
    );
    expect(container.querySelector(".cic-row-cell--expand")).toBeInTheDocument();
  });

  test("RowCell icon variant", () => {
    const { container } = render(
      <Row>
        <RowCell icon>🔹</RowCell>
      </Row>
    );
    expect(container.querySelector(".cic-row-cell--icon")).toBeInTheDocument();
  });
});
```

## Stories (src/stories/cic/Row.stories.tsx)

```typescript
import React from "react";
import { Row, RowCell } from "../../components/cic/Row";

export default {
  title: "Components/Row",
  component: Row,
};

export const Default = () => (
  <Row>
    <RowCell icon>📌</RowCell>
    <RowCell expand>Row content</RowCell>
    <RowCell>Action</RowCell>
  </Row>
);

export const Selected = () => (
  <Row selected>
    <RowCell icon>✓</RowCell>
    <RowCell expand>Selected item</RowCell>
  </Row>
);

export const List = () => (
  <>
    <Row>
      <RowCell>Item 1</RowCell>
    </Row>
    <Row>
      <RowCell>Item 2</RowCell>
    </Row>
    <Row selected>
      <RowCell>Item 3 (selected)</RowCell>
    </Row>
  </>
);

export const DensityVariants = () => (
  <>
    <Row gap="compact">
      <RowCell>Compact spacing</RowCell>
    </Row>
    <Row gap="cozy">
      <RowCell>Cozy spacing</RowCell>
    </Row>
    <Row gap="comfortable">
      <RowCell>Comfortable spacing</RowCell>
    </Row>
  </>
);
```

---

# Component 4: Grid

## Purpose
12-column responsive grid system. Density-aware gaps. Panel alignment. Foundation for dashboard layouts.

## API

```typescript
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 12 | 6 | 4 | 3 | 2 | 1;
  gap?: "compact" | "cozy" | "comfortable";
  children: React.ReactNode;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ columns = 12, gap = "cozy", children, className, ...props }, ref) => {
    // Implementation
  }
);

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 6 | 12;
  children: React.ReactNode;
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ span = 1, children, className, ...props }, ref) => {
    // Implementation
  }
);
```

## Styling (src/components/cic/grid.css)

```css
.cic-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  transition: gap var(--cic-motion-fade) ease;
}

/* Gap Variants */
.cic-grid[data-gap="compact"] {
  gap: calc(8px * var(--cic-density-factor));
}

.cic-grid[data-gap="cozy"] {
  gap: calc(12px * var(--cic-density-factor));
}

.cic-grid[data-gap="comfortable"] {
  gap: calc(16px * var(--cic-density-factor));
}

/* Column Presets */
.cic-grid[data-columns="12"] {
  grid-template-columns: repeat(12, 1fr);
}

.cic-grid[data-columns="6"] {
  grid-template-columns: repeat(6, 1fr);
}

.cic-grid[data-columns="4"] {
  grid-template-columns: repeat(4, 1fr);
}

.cic-grid[data-columns="3"] {
  grid-template-columns: repeat(3, 1fr);
}

.cic-grid[data-columns="2"] {
  grid-template-columns: repeat(2, 1fr);
}

.cic-grid[data-columns="1"] {
  grid-template-columns: 1fr;
}

/* Grid Item Span */
.cic-grid-item {
  min-width: 0; /* Prevent text overflow */
}

.cic-grid-item[data-span="1"] {
  grid-column: span 1;
}

.cic-grid-item[data-span="2"] {
  grid-column: span 2;
}

.cic-grid-item[data-span="3"] {
  grid-column: span 3;
}

.cic-grid-item[data-span="4"] {
  grid-column: span 4;
}

.cic-grid-item[data-span="6"] {
  grid-column: span 6;
}

.cic-grid-item[data-span="12"] {
  grid-column: span 12;
}

/* Responsive Breakpoints */
@media (max-width: 1200px) {
  .cic-grid[data-columns="12"] {
    grid-template-columns: repeat(6, 1fr);
  }

  .cic-grid-item[data-span="12"] {
    grid-column: span 6;
  }

  .cic-grid-item[data-span="6"] {
    grid-column: span 3;
  }
}

@media (max-width: 768px) {
  .cic-grid[data-columns="12"] {
    grid-template-columns: repeat(2, 1fr);
  }

  .cic-grid-item[data-span="12"],
  .cic-grid-item[data-span="6"],
  .cic-grid-item[data-span="4"],
  .cic-grid-item[data-span="3"] {
    grid-column: span 2;
  }

  .cic-grid-item[data-span="2"],
  .cic-grid-item[data-span="1"] {
    grid-column: span 1;
  }
}

@media (max-width: 480px) {
  .cic-grid {
    grid-template-columns: 1fr;
  }

  .cic-grid-item {
    grid-column: span 1 !important;
  }
}
```

## Implementation (src/components/cic/Grid.tsx)

```typescript
import React from "react";
import "./grid.css";

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 12 | 6 | 4 | 3 | 2 | 1;
  gap?: "compact" | "cozy" | "comfortable";
  children: React.ReactNode;
}

export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    { columns = 12, gap = "cozy", children, className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={["cic-grid", className].filter(Boolean).join(" ")}
        data-columns={columns}
        data-gap={gap}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4 | 6 | 12;
  children: React.ReactNode;
}

export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ span = 1, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={["cic-grid-item", className].filter(Boolean).join(" ")}
        data-span={span}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = "GridItem";
```

## Tests (src/tests/cic/Grid.test.tsx)

```typescript
import React from "react";
import { render } from "@testing-library/react";
import { Grid, GridItem } from "../../components/cic/Grid";

describe("Grid Component", () => {
  test("renders grid with children", () => {
    const { container } = render(
      <Grid>
        <GridItem>Item</GridItem>
      </Grid>
    );
    expect(container.querySelector(".cic-grid")).toBeInTheDocument();
  });

  test("applies column preset", () => {
    const { container } = render(<Grid columns={6}>Content</Grid>);
    expect(container.querySelector('[data-columns="6"]')).toBeInTheDocument();
  });

  test("default columns is 12", () => {
    const { container } = render(<Grid>Content</Grid>);
    expect(container.querySelector('[data-columns="12"]')).toBeInTheDocument();
  });

  test("applies gap variant", () => {
    const { container } = render(<Grid gap="comfortable">Content</Grid>);
    expect(container.querySelector('[data-gap="comfortable"]')).toBeInTheDocument();
  });

  test("GridItem applies span", () => {
    const { container } = render(
      <Grid>
        <GridItem span={6}>Half width</GridItem>
      </Grid>
    );
    expect(container.querySelector('[data-span="6"]')).toBeInTheDocument();
  });

  test("forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Grid ref={ref}>Content</Grid>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test("GridItem forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <Grid>
        <GridItem ref={ref}>Item</GridItem>
      </Grid>
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test("multiple items in grid", () => {
    const { container } = render(
      <Grid>
        <GridItem span={4}>Item 1</GridItem>
        <GridItem span={4}>Item 2</GridItem>
        <GridItem span={4}>Item 3</GridItem>
      </Grid>
    );
    const items = container.querySelectorAll(".cic-grid-item");
    expect(items).toHaveLength(3);
  });
});
```

## Stories (src/stories/cic/Grid.stories.tsx)

```typescript
import React from "react";
import { Grid, GridItem } from "../../components/cic/Grid";
import { Panel } from "../../components/cic/Panel";

export default {
  title: "Components/Grid",
  component: Grid,
};

export const TwelveColumn = () => (
  <Grid>
    {Array.from({ length: 12 }).map((_, i) => (
      <GridItem key={i} span={1}>
        <Panel>{i + 1}</Panel>
      </GridItem>
    ))}
  </Grid>
);

export const ThreeColumns = () => (
  <Grid>
    {Array.from({ length: 3 }).map((_, i) => (
      <GridItem key={i} span={4}>
        <Panel>Column {i + 1}</Panel>
      </GridItem>
    ))}
  </Grid>
);

export const SixColumns = () => (
  <Grid>
    {Array.from({ length: 6 }).map((_, i) => (
      <GridItem key={i} span={2}>
        <Panel>Item {i + 1}</Panel>
      </GridItem>
    ))}
  </Grid>
);

export const MixedSpans = () => (
  <Grid>
    <GridItem span={6}>
      <Panel>Half width</Panel>
    </GridItem>
    <GridItem span={3}>
      <Panel>Quarter</Panel>
    </GridItem>
    <GridItem span={3}>
      <Panel>Quarter</Panel>
    </GridItem>
  </Grid>
);

export const ResponsiveLayout = () => (
  <Grid gap="comfortable">
    <GridItem span={12}>
      <Panel>Full width header</Panel>
    </GridItem>
    <GridItem span={6}>
      <Panel>Sidebar</Panel>
    </GridItem>
    <GridItem span={6}>
      <Panel>Main content</Panel>
    </GridItem>
  </Grid>
);

export const DensityVariants = () => (
  <>
    <Grid gap="compact">
      <GridItem span={6}>
        <Panel>Compact gap</Panel>
      </GridItem>
      <GridItem span={6}>
        <Panel>Compact gap</Panel>
      </GridItem>
    </Grid>
    <Grid gap="comfortable">
      <GridItem span={6}>
        <Panel>Comfortable gap</Panel>
      </GridItem>
      <GridItem span={6}>
        <Panel>Comfortable gap</Panel>
      </GridItem>
    </Grid>
  </>
);
```

---

# Token Map: Phase 2 Components

| Component | Token | Purpose |
|-----------|-------|---------|
| Panel/Card/Row/Grid | `--cic-surface-layer-0` to `3` | Elevation/backgrounds |
| Panel/Card/Row/Grid | `--cic-color-border` | Borders |
| Panel/Card/Row/Grid | `--cic-color-text` | Primary text |
| Panel/Card/Row/Grid | `--cic-color-text-muted` | Secondary/footer text |
| Panel/Card/Row/Grid | `--cic-color-accent` | Focus/selected states |
| Panel/Card/Row/Grid | `--cic-density-factor` | Padding/gap scaling |
| Panel/Card/Row/Grid | `--cic-motion-fade` | Transition timing |
| Panel | `--cic-motion-slide` | Potential animations |
| Grid | Default breakpoints | Responsive: 1200/768/480px |

---

# Execution Plan

## File Checklist (16 total)

**Components (4):**
- [ ] `src/components/cic/Panel.tsx`
- [ ] `src/components/cic/Card.tsx`
- [ ] `src/components/cic/Row.tsx`
- [ ] `src/components/cic/Grid.tsx`

**Styles (4):**
- [ ] `src/components/cic/panel.css`
- [ ] `src/components/cic/card.css`
- [ ] `src/components/cic/row.css`
- [ ] `src/components/cic/grid.css`

**Tests (4):**
- [ ] `src/tests/cic/Panel.test.tsx`
- [ ] `src/tests/cic/Card.test.tsx`
- [ ] `src/tests/cic/Row.test.tsx`
- [ ] `src/tests/cic/Grid.test.tsx`

**Stories (4):**
- [ ] `src/stories/cic/Panel.stories.tsx`
- [ ] `src/stories/cic/Card.stories.tsx`
- [ ] `src/stories/cic/Row.stories.tsx`
- [ ] `src/stories/cic/Grid.stories.tsx`

## Commits

1. **Panel v2** (5 files: component, style, test, story, index export)
2. **Card** (5 files)
3. **Row v2** (5 files)
4. **Grid** (5 files)

## Tests
- Panel: 8 unit tests
- Card: 7 unit tests
- Row: 8 unit tests
- Grid: 8 unit tests
- **Total: 31 unit tests**
- Snapshot coverage: 4 components × ~3 stories each = 12 snapshot tests

## Parallel Dispatch
All 4 components can be built in parallel. No inter-component dependencies.

---

# Phase 2 Status

**Ready to dispatch:** Yes  
**Specs locked:** Yes  
**Token compliance:** Yes (all components use design tokens)  
**Snapshot ready:** Yes (Playwright config stable)  
**Next gate:** All 28 unit tests + 8 snapshot tests passing
