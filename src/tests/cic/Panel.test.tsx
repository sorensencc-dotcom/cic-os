import { render } from "@testing-library/react";
import { Panel } from "../../components/cic/Panel";

describe("Panel", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<Panel>Hello</Panel>);
    expect(getByText("Hello")).toBeInTheDocument();
  });

  it("accepts className prop", () => {
    const { container } = render(<Panel className="custom">Test</Panel>);
    expect(container.querySelector(".cic-panel.custom")).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(
      <Panel>
        <span>Child content</span>
      </Panel>
    );
    expect(getByText("Child content")).toBeInTheDocument();
  });
});
