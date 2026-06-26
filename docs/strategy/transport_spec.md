# CIC ↔ VS Code Transport Spec (WebSocket)

## Endpoint

- **Protocol:** `wss` (fallback `ws` for local dev)
- **URL (local dev):** `ws://127.0.0.1:7324/cic-vsc-rpc`
- **URL (remote/daemonized):** `wss://<host>:<port>/cic-vsc-rpc`

## Handshake

1. Client (VS Code extension) connects to WebSocket endpoint.
2. On `open`, client sends `rpc/hello`:

```json
{
  "jsonrpc": "2.0",
  "method": "rpc/hello",
  "params": {
    "client": "vscode-extension",
    "version": "1.0.0",
    "ide": "vscode",
    "ideVersion": "<VSCodeVersion>",
    "capabilities": {
      "microLoops": true,
      "backgroundSend": true,
      "agentsWindow": true
    }
  }
}
```

3. Server (CIC daemon) responds with `rpc/welcome`:

```json
{
  "jsonrpc": "2.0",
  "method": "rpc/welcome",
  "params": {
    "server": "cic-daemon",
    "version": "1.0.0",
    "cicVersion": "<CICVersion>",
    "capabilities": {
      "sessions": true,
      "timeline": true,
      "logs": true,
      "orchestration": true
    }
  }
}
```

4. After `rpc/welcome`, normal RPC traffic may begin.

## Framing

- All messages are **JSON-RPC 2.0** objects.
- One JSON object per WebSocket frame.
- No binary frames in v1.

Example request:

```json
{
  "jsonrpc": "2.0",
  "id": "sess-1234",
  "method": "session/create",
  "params": {}
}
```

Example notification:

```json
{
  "jsonrpc": "2.0",
  "method": "notification/session/update",
  "params": {}
}
```

## Heartbeats

- Direction: **server → client** and **client → server**
- Method: `rpc/heartbeat`
- Interval: **30s** (configurable)

Server heartbeat:

```json
{
  "jsonrpc": "2.0",
  "method": "rpc/heartbeat",
  "params": {
    "source": "cic-daemon",
    "ts": "<ISO8601>"
  }
}
```

Client heartbeat:

```json
{
  "jsonrpc": "2.0",
  "method": "rpc/heartbeat",
  "params": {
    "source": "vscode-extension",
    "ts": "<ISO8601>"
  }
}
```

## Liveness / Timeouts

- If **no heartbeat** or **no traffic** for **90s**, each side:
  - Marks connection as **stale**
  - Attempts **reconnect** (client)
  - Cleans up session handles (server)

## Error Frames

- Use JSON-RPC error format:

```json
{
  "jsonrpc": "2.0",
  "id": "sess-1234",
  "error": {
    "code": 500,
    "message": "Internal CIC error",
    "data": { "details": "..." }
  }
}
```
