import type { Meta, StoryObj } from "@storybook/react";
import { AgentCard } from "../../components/agents/AgentCard";
import { mockAgentsList } from "../../mocks/agents";
import { DarkModeWrapper } from "../utils/DarkModeWrapper";

const meta = {
  title: "Cards/AgentCard",
  component: AgentCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof AgentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "300px" }}>
        <AgentCard agent={mockAgentsList[0]} />
      </div>
    </DarkModeWrapper>
  ),
};

export const Degraded: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "300px" }}>
        <AgentCard agent={mockAgentsList[2]} />
      </div>
    </DarkModeWrapper>
  ),
};

export const Offline: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "300px" }}>
        <AgentCard agent={mockAgentsList[3]} />
      </div>
    </DarkModeWrapper>
  ),
};

export const Starting: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "300px" }}>
        <AgentCard agent={mockAgentsList[4]} />
      </div>
    </DarkModeWrapper>
  ),
};

export const Grid: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", width: "900px" }}>
        {mockAgentsList.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </DarkModeWrapper>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div data-theme="dark" style={{ padding: "2rem", background: "#1a1a1a" }}>
      <div style={{ width: "300px" }}>
        <AgentCard agent={mockAgentsList[0]} />
      </div>
    </div>
  ),
};

export const HighContrast: Story = {
  render: () => (
    <div data-theme="dark" data-density="compact" style={{ padding: "2rem", background: "#0a0a0a" }}>
      <div style={{ width: "300px" }}>
        <AgentCard agent={mockAgentsList[0]} />
      </div>
    </div>
  ),
};
