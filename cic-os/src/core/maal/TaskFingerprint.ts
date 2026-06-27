export interface TaskFingerprint {
  taskClass: string;
  complexityBucket: 0 | 1 | 2 | 3 | 4 | 5;
  modality: "text" | "code" | "image+code";
  schemaSignature: string;
  tokenBucket: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}
