import { render } from "@testing-library/react";
import { Alert } from "../../components/cic/Alert";

describe("Alert", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<Alert>Hello</Alert>);
    expect(getByText("Hello")).toBeInTheDocument();
  });

  it("accepts className prop", () => {
    const { container } = render(<Alert className="custom">Test</Alert>);
    expect(container.querySelector(".cic-alert.custom")).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(
      <Alert>
        <span>Child content</span>
      </Alert>
    );
    expect(getByText("Child content")).toBeInTheDocument();
  });
});
