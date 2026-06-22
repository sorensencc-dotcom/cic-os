import React from "react";
import { render, screen } from "@testing-library/react";
import { Checkbox } from "../../components/cic/Checkbox";

describe("Checkbox Component", () => {
  test("renders checkbox", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });

  test("renders with label", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
  });

  test("renders with description", () => {
    render(<Checkbox label="Test" description="This is a test" />);
    expect(screen.getByText("This is a test")).toBeInTheDocument();
  });

  test("can be checked", () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  test("forwards ref", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test("respects disabled prop", () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  test("generates unique id when not provided", () => {
    const { container: container1 } = render(<Checkbox label="One" />);
    const { container: container2 } = render(<Checkbox label="Two" />);

    const label1 = container1.querySelector(".cic-checkbox-label");
    const label2 = container2.querySelector(".cic-checkbox-label");

    expect(label1?.getAttribute("for")).not.toBe(
      label2?.getAttribute("for")
    );
  });
});
