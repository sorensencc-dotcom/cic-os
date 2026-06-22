/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { render } from "@testing-library/react";
import { Row } from "../../components/cic/Row";

describe("Row", () => {
  it("renders row with children", () => {
    const { getByText } = render(<Row>Content</Row>);
    expect(getByText("Content")).toBeInTheDocument();
  });

  it("applies selected false by default", () => {
    const { container } = render(<Row>Test</Row>);
    expect(container.querySelector('[data-selected="false"]')).toBeInTheDocument();
  });

  it("applies selected true", () => {
    const { container } = render(<Row selected>Test</Row>);
    expect(container.querySelector('[data-selected="true"]')).toBeInTheDocument();
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Row ref={ref}>Test</Row>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("accepts className", () => {
    const { container } = render(<Row className="custom">Test</Row>);
    expect(container.querySelector(".cic-row.custom")).toBeInTheDocument();
  });

  it("has tabindex for keyboard navigation", () => {
    const { container } = render(<Row>Test</Row>);
    expect(container.querySelector("[tabindex='0']")).toBeInTheDocument();
  });

  it("has data-cic-component attribute", () => {
    const { container } = render(<Row>Test</Row>);
    expect(container.querySelector('[data-cic-component="row"]')).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    const { getByText } = render(
      <Row>
        <span>Cell 1</span>
        <span>Cell 2</span>
      </Row>
    );
    expect(getByText("Cell 1")).toBeInTheDocument();
    expect(getByText("Cell 2")).toBeInTheDocument();
  });
});
