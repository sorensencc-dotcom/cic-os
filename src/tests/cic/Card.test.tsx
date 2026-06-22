/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render } from "@testing-library/react";
import { Card } from "../../components/cic/Card";

describe("Card", () => {
  it("renders card with children", () => {
    const { getByText } = render(<Card>Content</Card>);
    expect(getByText("Content")).toBeInTheDocument();
  });

  it("applies variant default", () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.querySelector('[data-variant="default"]')).toBeInTheDocument();
  });

  it("applies variant subtle", () => {
    const { container } = render(<Card variant="subtle">Test</Card>);
    expect(container.querySelector('[data-variant="subtle"]')).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Test</Card>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("accepts className", () => {
    const { container } = render(<Card className="custom">Test</Card>);
    expect(container.querySelector(".cic-card.custom")).toBeInTheDocument();
  });

  it("renders with multiple children", () => {
    const { getByText } = render(
      <Card>
        <span>Child 1</span>
        <span>Child 2</span>
      </Card>
    );
    expect(getByText("Child 1")).toBeInTheDocument();
    expect(getByText("Child 2")).toBeInTheDocument();
  });

  it("has data-cic-component attribute", () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.querySelector('[data-cic-component="card"]')).toBeInTheDocument();
  });
});
