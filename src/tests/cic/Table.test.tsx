import { render } from "@testing-library/react";
import { Table } from "../../components/cic/Table";

describe("Table", () => {
  it("renders without crashing", () => {
    const { getByText } = render(<Table>Hello</Table>);
    expect(getByText("Hello")).toBeInTheDocument();
  });

  it("accepts className prop", () => {
    const { container } = render(<Table className="custom">Test</Table>);
    expect(container.querySelector(".cic-table.custom")).toBeInTheDocument();
  });

  it("renders children", () => {
    const { getByText } = render(
      <Table>
        <span>Child content</span>
      </Table>
    );
    expect(getByText("Child content")).toBeInTheDocument();
  });
});
