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
});
