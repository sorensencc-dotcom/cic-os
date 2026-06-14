import WebSocket, { WebSocketServer } from 'ws';

interface RpcRequest {
  jsonrpc: '2.0';
  id?: string;
  method: string;
  params?: any;
}

interface RpcResponse {
  jsonrpc: '2.0';
  id?: string;
  result?: any;
  error?: { code: number; message: string; data?: any };
}

export class CicRpcServer {
  private wss: WebSocketServer;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', ws => this.handleConnection(ws));
    console.log(`[CIC Daemon] WebSocket Server listening on port ${port}`);
  }

  private handleConnection(ws: WebSocket) {
    ws.on('message', data => this.handleMessage(ws, data.toString()));
  }

  private async handleMessage(ws: WebSocket, raw: string) {
    const msg = JSON.parse(raw) as RpcRequest;
    const { id, method, params } = msg;

    try {
      switch (method) {
        case 'rpc/hello':
          this.sendNotification(ws, 'rpc/welcome', {
            server: 'cic-daemon',
            version: '1.0.0',
          });
          break;

        case 'session/create':
          // Create CIC session, return sessionId
          const sessionId = await this.handleSessionCreate(params);
          this.sendResponse(ws, id, { sessionId });
          break;

        case 'session/update':
          await this.handleSessionUpdate(params);
          this.sendResponse(ws, id, { ok: true });
          break;

        case 'session/submit':
          const submitRes = await this.handleSessionSubmit(ws, params);
          this.sendResponse(ws, id, submitRes);
          break;

        case 'ping':
          this.sendResponse(ws, id, { timestamp: Date.now() });
          break;

        default:
          this.sendError(ws, id, 400, `Unknown method: ${method}`);
      }
    } catch (err: any) {
      this.sendError(ws, id, 500, err.message || 'Internal error', { stack: err.stack });
    }
  }

  private sendResponse(ws: WebSocket, id: string | undefined, result: any) {
    if (!id) return;
    const resp: RpcResponse = { jsonrpc: '2.0', id, result };
    ws.send(JSON.stringify(resp));
  }

  private sendError(ws: WebSocket, id: string | undefined, code: number, message: string, data?: any) {
    if (!id) return;
    const resp: RpcResponse = { jsonrpc: '2.0', id, error: { code, message, data } };
    ws.send(JSON.stringify(resp));
  }

  private sendNotification(ws: WebSocket, method: string, params?: any) {
    const msg: RpcRequest = { jsonrpc: '2.0', method, params };
    ws.send(JSON.stringify(msg));
  }

  private async handleSessionCreate(params: any): Promise<string> {
    const sessionId = `cic-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return sessionId;
  }

  private async handleSessionUpdate(params: any): Promise<void> {
    console.log(`[CIC Daemon] Updated session with params:`, params);
  }

  private async handleSessionSubmit(ws: WebSocket, params: any): Promise<{ invocationId: string }> {
    const invocationId = `inv-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    
    // Asynchronously run pipeline simulation
    setImmediate(async () => {
      const phases: Array<"validate" | "plan" | "execute" | "review" | "emit"> = [
        "validate",
        "plan",
        "execute",
        "review",
        "emit"
      ];

      for (let i = 0; i < phases.length; i++) {
        const current = phases[i];
        const previous = i > 0 ? phases[i - 1] : "validate";

        const transition = {
          sessionId: params.sessionId,
          invocationId,
          previousPhase: previous,
          currentPhase: current,
          timestamp: new Date().toISOString()
        };
        this.sendNotification(ws, "notification/phase/transition", transition);

        // Stream logs
        this.sendNotification(ws, "notification/log/stream", {
          sessionId: params.sessionId,
          invocationId,
          stream: "stdout",
          chunk: `### [${current}] Processing...\n`
        });

        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    });

    return { invocationId };
  }
}
