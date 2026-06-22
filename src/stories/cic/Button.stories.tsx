import { Button } from "../../../components/cic/Button";

export default {
  title: "CIC/Button",
  component: Button,
};

export const Default = () => <Button>Example</Button>;

export const Hover = () => (
  <div style={{ cursor: "pointer" }}>
    <Button>Hover me</Button>
  </div>
);

export const Disabled = () => <Button disabled>Disabled</Button>;
