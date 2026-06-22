import React from "react";
import { render, screen } from "@testing-library/react";
import { Input } from "../../components/cic/Input";

describe("Input Component", () => {
  test("renders input with type", () => {
    render(<Input type="text" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "text");
  });

  test("renders with label", () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  test("applies error class", () => {
    const { container } = render(<Input error />);
    const input = container.querySelector(".cic-input--error");
    expect(input).toBeInTheDocument();
  });

  test("applies size class", () => {
    const { container } = render(<Input size="large" />);
    const input = container.querySelector(".cic-input--large");
    expect(input).toBeInTheDocument();
  });

  test("forwards ref", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  test("respects disabled prop", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  test("default size is medium", () => {
    const { container } = render(<Input />);
    const input = container.querySelector(".cic-input--medium");
    expect(input).toBeInTheDocument();
  });
});
