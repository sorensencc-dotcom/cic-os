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

  describe("snapshots", () => {
    it("renders default row snapshot", () => {
      const { container } = render(<Row>Content</Row>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("renders selected row snapshot", () => {
      const { container } = render(<Row selected>Content</Row>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("renders multiple cells snapshot", () => {
      const { container } = render(
        <Row>
          <span>Cell 1</span>
          <span>Cell 2</span>
        </Row>
      );
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
      const { container } = render(<Row>Content</Row>);
      expect(container.querySelector(".cic-row")).toBeInTheDocument();
    });
  });
});
