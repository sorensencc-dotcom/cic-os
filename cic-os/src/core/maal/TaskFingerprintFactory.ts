import { TaskFingerprint } from './TaskFingerprint';

export class TaskFingerprintFactory {
  static compute(input: unknown): TaskFingerprint {
    return {
      taskClass: 'default',
      complexityBucket: 2,
      modality: 'text',
      schemaSignature: 'unknown',
      tokenBucket: 3,
    };
  }
}
