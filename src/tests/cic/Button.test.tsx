import { render } from "@testing-library/react";
import { Button } from "../../components/cic/Button";

describe("Button", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<Button>Hello</Button>);
    expect(getByText("Hello")).toBeInTheDocument();
  });

  it("accepts className prop", () => {
    const { container } = render(<Button className="custom">Test</Button>);
    expect(container.querySelector(".cic-button.custom")).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(
      <Button>
        <span>Child content</span>
      </Button>
    );
    expect(getByText("Child content")).toBeInTheDocument();
  });
});
