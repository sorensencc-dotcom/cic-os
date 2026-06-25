import type { Meta, StoryObj } from "@storybook/react";
import { AgentDetailPanel } from "../../components/agents/AgentDetailPanel";
import { DarkModeWrapper } from "../utils/DarkModeWrapper";

const meta = {
  title: "Panels/AgentDetail",
  component: AgentDetailPanel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof AgentDetailPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OverviewTab: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <AgentDetailPanel agentId="agent-1" />
      </div>
    </DarkModeWrapper>
  ),
};

export const LogsTab: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <AgentDetailPanel agentId="agent-1" />
      </div>
    </DarkModeWrapper>
  ),
};

export const ExecutionsTab: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <AgentDetailPanel agentId="agent-1" />
      </div>
    </DarkModeWrapper>
  ),
};

export const SystemTab: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <AgentDetailPanel agentId="agent-1" />
      </div>
    </DarkModeWrapper>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <div data-theme="dark" style={{ padding: "2rem", background: "#1a1a1a" }}>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <AgentDetailPanel agentId="agent-1" />
      </div>
    </div>
  ),
};

export const DegradedAgent: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <AgentDetailPanel agentId="agent-3" />
      </div>
    </DarkModeWrapper>
  ),
};

export const ResponsiveTest: Story = {
  render: () => (
    <DarkModeWrapper>
      <div style={{ width: "100%", resize: "both", overflow: "auto", border: "1px solid #999" }}>
        <div style={{ minWidth: "400px" }}>
          <AgentDetailPanel agentId="agent-1" />
        </div>
      </div>
    </DarkModeWrapper>
  ),
};
