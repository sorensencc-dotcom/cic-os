/// <reference types="@testing-library/jest-dom" />
/// <reference types="jest" />
import React from "react";
import { render } from "@testing-library/react";
import { Panel } from "../../components/cic/Panel";

describe("Panel", () => {
  it("renders panel with children", () => {
    const { getByText } = render(<Panel>Content</Panel>);
    expect(getByText("Content")).toBeInTheDocument();
  });

  test.each<[string, "default" | "none" | undefined]>([
    ["default", undefined],
    ["none", "none"],
  ])("applies padding %s", (expected, padding) => {
    const { container } = render(<Panel padding={padding}>Test</Panel>);
    expect(container.querySelector(`[data-padding="${expected}"]`)).toBeInTheDocument();
  });

  test.each<[string, "default" | "none" | undefined]>([
    ["default", undefined],
    ["none", "none"],
  ])("applies elevation %s", (expected, elevation) => {
    const { container } = render(<Panel elevation={elevation}>Test</Panel>);
    expect(container.querySelector(`[data-elevation="${expected}"]`)).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = React.createRef<any>();
    render(<Panel ref={ref}>Test</Panel>);
    expect(ref.current?.tagName).toBe("SECTION");
  });

  it("accepts className", () => {
    const { container } = render(<Panel className="custom">Test</Panel>);
    expect(container.querySelector(".cic-panel.custom")).toBeInTheDocument();
  });

  it("renders header when provided", () => {
    const { getByText } = render(<Panel header="Title">Content</Panel>);
    expect(getByText("Title")).toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    const { getByText } = render(<Panel footer="Footer text">Content</Panel>);
    expect(getByText("Footer text")).toBeInTheDocument();
  });

  it("applies loading state", () => {
    const { container } = render(<Panel loading>Content</Panel>);
    const panel = container.querySelector(".cic-panel");
    expect(panel).toHaveAttribute("data-loading", "true");
  });

  describe("snapshots", () => {
    it("renders default panel snapshot", () => {
      const { container } = render(<Panel>Content</Panel>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("renders panel with header+footer snapshot", () => {
      const { container } = render(
        <Panel header="Title" footer="Footer">
          Content
        </Panel>
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it("renders loading panel snapshot", () => {
      const { container } = render(<Panel loading>Content</Panel>);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("responsive", () => {
    const sizes = [
      { name: "mobile", width: 375, height: 667 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1920, height: 1080 },
    ];

    test.each(sizes)("renders at $name ($width×$height)", ({ width, height }) => {
      window.innerWidth = width;
      window.innerHeight = height;
      const { container } = render(<Panel>Content</Panel>);
      expect(container.querySelector(".cic-panel")).toBeInTheDocument();
    });
  });
});
