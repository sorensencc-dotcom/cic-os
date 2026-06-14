import WebSocket from 'ws';

export interface RpcRequest {
  jsonrpc: '2.0';
  id?: string;
  method: string;
  params?: any;
}

export interface RpcResponse {
  jsonrpc: '2.0';
  id?: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class CicTransport {
  private ws: WebSocket | null = null;
  private pending = new Map<string, (resp: RpcResponse) => void>();

  constructor(private url: string) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        this.sendNotification('rpc/hello', {
          client: 'vscode-extension',
          version: '1.0.0',
        });
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        this.handleMessage(data.toString());
      });

      this.ws.on('error', err => reject(err));
    });
  }

  private handleMessage(raw: string) {
    const msg = JSON.parse(raw) as RpcResponse | RpcRequest;

    if ('id' in msg && ((msg as RpcResponse).result !== undefined || (msg as RpcResponse).error)) {
      const resp = msg as RpcResponse;
      const handler = resp.id ? this.pending.get(resp.id) : undefined;
      if (handler) {
        handler(resp);
        if (resp.id) this.pending.delete(resp.id);
      }
      return;
    }

    const req = msg as RpcRequest;
    // Dispatch notifications (session/update, etc.) to listeners
    this.dispatchNotification(req);
  }

  private dispatchNotification(req: RpcRequest) {
    console.log(`[VSC Cockpit] Received notification: ${req.method}`, req.params);
  }

  sendRequest<T = any>(method: string, params?: any): Promise<T> {
    const id = `req-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const req: RpcRequest = { jsonrpc: '2.0', id, method, params };

    return new Promise<T>((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket not connected'));
      }
      this.pending.set(id, resp => {
        if (resp.error) return reject(new Error(resp.error.message));
        resolve(resp.result as T);
      });
      this.ws.send(JSON.stringify(req));
    });
  }

  sendNotification(method: string, params?: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const msg: RpcRequest = { jsonrpc: '2.0', method, params };
    this.ws.send(JSON.stringify(msg));
  }
}
