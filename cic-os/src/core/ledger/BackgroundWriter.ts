export interface BackgroundWriter {
  start(): void;
  stop(): void;
  flush(): Promise<void>;
}
