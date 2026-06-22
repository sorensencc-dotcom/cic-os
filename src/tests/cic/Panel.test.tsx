/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render } from "@testing-library/react";
import { Panel } from "../../components/cic/Panel";

describe("Panel", () => {
  it("renders panel with children", () => {
    const { getByText } = render(<Panel>Content</Panel>);
    expect(getByText("Content")).toBeInTheDocument();
  });

  it("applies padding default", () => {
    const { container } = render(<Panel>Test</Panel>);
    expect(container.querySelector('[data-padding="default"]')).toBeInTheDocument();
  });

  it("applies padding none", () => {
    const { container } = render(<Panel padding="none">Test</Panel>);
    expect(container.querySelector('[data-padding="none"]')).toBeInTheDocument();
  });

  it("applies elevation default", () => {
    const { container } = render(<Panel>Test</Panel>);
    expect(container.querySelector('[data-elevation="default"]')).toBeInTheDocument();
  });

  it("applies elevation none", () => {
    const { container } = render(<Panel elevation="none">Test</Panel>);
    expect(container.querySelector('[data-elevation="none"]')).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Panel ref={ref}>Test</Panel>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("accepts className", () => {
    const { container } = render(<Panel className="custom">Test</Panel>);
    expect(container.querySelector(".cic-panel.custom")).toBeInTheDocument();
  });
});
