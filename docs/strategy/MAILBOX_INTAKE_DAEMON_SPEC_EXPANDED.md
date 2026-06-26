# Archival-Mailbox-Intake Daemon Specification v1.1 (Expanded)

## Section 4: Mailpit API Client Implementation

### 4.1 Connection Management

#### 4.1.1 Connection Pool

```typescript
interface MailpitPoolConfig {
  baseUrl: string;           // http://localhost:8025 (API) + :1025 (SMTP)
  timeout_ms: number;        // 30000
  maxConnections: number;    // 5
  maxRetries: number;        // 3
  retryBackoffMs: number;    // 500 (exponential)
  healthCheckIntervalMs: number; // 30000
  circuitBreakerThreshold: number; // 5 failures → OPEN
  circuitBreakerResetMs: number; // 60000
}

class MailpitClient {
  private pool: Map<string, HTTPConnection>;
  private circuitBreaker: CircuitBreaker;
  private lastHealthCheck: number;
  private config: MailpitPoolConfig;

  constructor(config: MailpitPoolConfig) {
    this.pool = new Map();
    this.circuitBreaker = new CircuitBreaker(config.circuitBreakerThreshold, config.circuitBreakerResetMs);
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/info`, {
        timeout: this.config.timeout_ms,
      });
      if (!response.ok) throw new Error(`Mailpit API unreachable: ${response.status}`);
      this.circuitBreaker.recordSuccess();
      this.lastHealthCheck = Date.now();
    } catch (err) {
      this.circuitBreaker.recordFailure();
      throw new MailpitConnectionError(`Failed to connect to Mailpit: ${err.message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    if (this.circuitBreaker.isOpen()) return false;
    if (Date.now() - this.lastHealthCheck < this.config.healthCheckIntervalMs) return true;
    
    try {
      await this.connect();
      return true;
    } catch {
      return false;
    }
  }
}
```

#### 4.1.2 Retry Logic

```typescript
interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number[];  // [500, 1000, 2000]
  retryableErrors: string[]; // ['ECONNREFUSED', 'ETIMEDOUT', '503', '429']
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy,
  logger: Logger
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new TimeoutError()), this.config.timeout_ms)
        ),
      ]);
    } catch (err) {
      lastError = err;
      
      if (!isRetryable(err, policy.retryableErrors)) {
        throw err; // Non-retryable, fail fast
      }
      
      if (attempt < policy.maxAttempts) {
        const backoffMs = policy.backoffMs[Math.min(attempt - 1, policy.backoffMs.length - 1)];
        logger.warn(`Attempt ${attempt} failed, retrying in ${backoffMs}ms: ${err.message}`);
        await sleep(backoffMs);
      }
    }
  }
  
  throw lastError;
}
```

---

### 4.2 Message Polling & Extraction

#### 4.2.1 Poll Loop

```typescript
interface PollConfig {
  intervalMs: number;           // 5000
  maxMessagesPerPoll: number;   // 50
  maxAttachmentSizeMb: number;  // 500
  timeoutMs: number;            // 30000
  extractionTimeoutMs: number;  // 15000 per attachment
}

class MailpitPoller {
  private client: MailpitClient;
  private config: PollConfig;
  private logger: Logger;
  private running: boolean = false;
  private pollHandle: NodeJS.Timer;

  async startPolling(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.logger.info('Mailpit poller started');
    
    this.pollHandle = setInterval(async () => {
      try {
        await this.pollOnce();
      } catch (err) {
        this.logger.error(`Poll cycle failed: ${err.message}`);
        // Notify Slack if configured
        await notifySlack({
          channel: 'alerts',
          message: `⚠️ Mailpit poll failed: ${err.message}`,
          severity: 'warning',
        });
      }
    }, this.config.intervalMs);
  }

  async stopPolling(): Promise<void> {
    if (!this.running) return;
    this.running = false;
    clearInterval(this.pollHandle);
    this.logger.info('Mailpit poller stopped');
  }

  private async pollOnce(): Promise<void> {
    // Check Mailpit health before polling
    const isHealthy = await this.client.healthCheck();
    if (!isHealthy) {
      this.logger.warn('Mailpit unreachable, skipping poll');
      return;
    }

    // Fetch unseen messages
    const messages = await retryWithBackoff(
      () => this.fetchMessages(),
      { maxAttempts: 3, backoffMs: [500, 1000], retryableErrors: ['ECONNREFUSED', '503'] },
      this.logger
    );

    if (messages.length === 0) {
      this.logger.debug('No new messages');
      return;
    }

    this.logger.info(`Fetched ${messages.length} new messages`);

    // Process each message
    for (const msg of messages) {
      try {
        await this.processMessage(msg);
      } catch (err) {
        this.logger.error(`Failed to process message ${msg.id}: ${err.message}`);
      }
    }
  }

  private async fetchMessages(): Promise<MailpitMessage[]> {
    const response = await fetch(
      `${this.client.baseUrl}/api/v1/messages?limit=${this.config.maxMessagesPerPoll}&search=is:unread`,
      { timeout: this.config.timeoutMs }
    );

    if (!response.ok) {
      throw new MailpitAPIError(`Failed to fetch messages: ${response.status}`);
    }

    const data = await response.json();
    return data.messages || [];
  }
}
```

#### 4.2.2 Message Processing & Extraction

```typescript
interface MailpitMessage {
  id: string;
  from: { address: string; name: string };
  to: { address: string; name: string }[];
  cc?: { address: string; name: string }[];
  subject: string;
  text: string;
  html?: string;
  inReplyTo?: string;
  messageId: string;
  date: string;
  attachments: MailpitAttachment[];
  read: boolean;
  tags: string[];
}

interface MailpitAttachment {
  partID: string;
  fileName: string;
  mimeType: string;
  size: number; // bytes
}

async function processMessage(msg: MailpitMessage): Promise<Batch> {
  const batchId = generateBatchId(msg.id, msg.date);
  const batchDir = path.join(STAGING_ROOT, 'pending', batchId);
  
  // Pre-flight validation
  const validation = validateMessage(msg);
  if (!validation.valid) {
    await handleValidationFailure(batchId, msg, validation);
    return;
  }

  // Create batch directory
  await fs.mkdir(batchDir, { recursive: true });

  // Extract attachments in parallel (with concurrency limit = 3)
  const extractions = [];
  for (const att of msg.attachments) {
    extractions.push(
      extractAttachmentWithTimeout(msg.id, att, batchDir, this.config.extractionTimeoutMs)
    );
  }

  const extractedFiles = await Promise.allSettled(extractions);

  // Build manifest
  const manifest = buildManifest({
    batchId,
    message: msg,
    extractedFiles,
    validation,
  });

  // Write manifest + intake log
  await fs.writeFile(
    path.join(batchDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  await appendIntakeLog(batchDir, {
    timestamp: new Date().toISOString(),
    event: 'batch_created',
    batchId,
    attachmentCount: msg.attachments.length,
  });

  // Trigger classification
  await classifyBatch(batchDir, manifest);

  // Mark message as read in Mailpit
  await markMessageRead(msg.id);
}

async function extractAttachmentWithTimeout(
  msgId: string,
  att: MailpitAttachment,
  batchDir: string,
  timeoutMs: number
): Promise<ExtractionResult> {
  return Promise.race([
    extractAttachment(msgId, att, batchDir),
    new Promise<ExtractionResult>((_, reject) =>
      setTimeout(() => reject(new ExtractionTimeoutError(att.fileName)), timeoutMs)
    ),
  ]);
}

async function extractAttachment(
  msgId: string,
  att: MailpitAttachment,
  batchDir: string
): Promise<ExtractionResult> {
  const attPath = path.join(batchDir, sanitizeFilename(att.fileName));

  // Download via Mailpit API
  const response = await fetch(
    `${MAILPIT_API_BASE}/api/v1/message/${msgId}/part/${att.partID}/download`,
    { timeout: 30000 }
  );

  if (!response.ok) {
    throw new MailpitAPIError(`Failed to download attachment: ${response.status}`);
  }

  const buffer = await response.buffer();

  // Validate size
  if (buffer.byteLength > this.config.maxAttachmentSizeMb * 1024 * 1024) {
    throw new ValidationError(`Attachment exceeds size limit: ${att.fileName}`);
  }

  // Write to disk
  await fs.writeFile(attPath, buffer);

  return {
    fileName: att.fileName,
    mimeType: att.mimeType,
    sizeBytes: buffer.byteLength,
    path: attPath,
    extractedAt: new Date().toISOString(),
  };
}
```

---

### 4.3 Error Handling & Recovery

#### 4.3.1 Partial Extraction Rollback

```typescript
interface ExtractionState {
  batchId: string;
  extractedFiles: string[];
  manifest: Manifest;
  failureReason?: string;
}

async function rollbackExtraction(state: ExtractionState): Promise<void> {
  const logger = getLogger();
  
  logger.warn(`Rolling back extraction for batch ${state.batchId}`);

  // Delete extracted files
  for (const file of state.extractedFiles) {
    try {
      await fs.unlink(file);
    } catch (err) {
      logger.error(`Failed to delete extracted file ${file}: ${err.message}`);
    }
  }

  // Move batch to rejected/
  const rejectedDir = path.join(STAGING_ROOT, 'rejected', state.batchId);
  await fs.mkdir(rejectedDir, { recursive: true });
  
  // Write rejection manifest
  await fs.writeFile(
    path.join(rejectedDir, 'rejection.json'),
    JSON.stringify({
      reason: state.failureReason,
      originalManifest: state.manifest,
      rolledBackAt: new Date().toISOString(),
    }, null, 2)
  );

  // Notify Slack
  await notifySlack({
    channel: 'alerts',
    message: `❌ Batch ${state.batchId} extraction failed and rolled back: ${state.failureReason}`,
  });

  logger.info(`Batch ${state.batchId} rolled back to rejected/`);
}
```

#### 4.3.2 Stuck Message Detection

```typescript
interface StuckMessageConfig {
  thresholdMinutes: number; // 30
  checkIntervalMinutes: number; // 5
  mailpitApiBase: string;
  slackConfig: SlackNotificationConfig;
}

async function detectAndHandleStuckMessages(config: StuckMessageConfig): Promise<void> {
  const logger = getLogger();

  // Query Mailpit for messages not marked read after N minutes
  const cutoff = new Date(Date.now() - config.thresholdMinutes * 60 * 1000);
  
  const stuckMessages = await fetch(
    `${config.mailpitApiBase}/api/v1/messages?before=${cutoff.toISOString()}`,
    { timeout: 30000 }
  ).then(r => r.json());

  for (const msg of stuckMessages.messages || []) {
    logger.warn(`Stuck message (${config.thresholdMinutes}+ minutes old): ${msg.id}`);

    // Notify Slack
    await notifySlack({
      channel: 'alerts',
      message: `⚠️ Stuck message in Mailpit (${config.thresholdMinutes}+ min): ${msg.subject} from ${msg.from.address}`,
      actions: [
        { label: 'Retry Now', value: `retry:${msg.id}` },
        { label: 'Mark as Read', value: `read:${msg.id}` },
      ],
    });
  }
}
```

---

### 4.4 Message Validation (Pre-flight)

#### 4.4.1 Validation Rules

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationConfig {
  requireAttachments: boolean;
  maxAttachments: number;
  maxTotalSizeMb: number;
  blockedMimeTypes: string[];
  blockedFilePatterns: RegExp[];
  maxAttachmentSizeMb: number;
}

function validateMessage(msg: MailpitMessage, config: ValidationConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 1: Require attachments
  if (config.requireAttachments && msg.attachments.length === 0) {
    errors.push('No attachments found');
  }

  // Rule 2: Attachment count limit
  if (msg.attachments.length > config.maxAttachments) {
    errors.push(`Exceeds max attachments (${config.maxAttachments})`);
  }

  // Rule 3: Total size limit
  const totalSize = msg.attachments.reduce((sum, att) => sum + att.size, 0);
  if (totalSize > config.maxTotalSizeMb * 1024 * 1024) {
    errors.push(`Exceeds total size limit (${config.maxTotalSizeMb}MB)`);
  }

  // Rule 4: Blocked MIME types
  for (const att of msg.attachments) {
    if (config.blockedMimeTypes.includes(att.mimeType)) {
      errors.push(`Attachment ${att.fileName} has blocked MIME type: ${att.mimeType}`);
    }

    // Rule 5: Blocked filename patterns
    for (const pattern of config.blockedFilePatterns) {
      if (pattern.test(att.fileName)) {
        errors.push(`Attachment ${att.fileName} matches blocked pattern: ${pattern}`);
      }
    }

    // Rule 6: Individual attachment size limit
    if (att.size > config.maxAttachmentSizeMb * 1024 * 1024) {
      warnings.push(`Attachment ${att.fileName} exceeds recommended size`);
    }
  }

  // Rule 7: Zero-byte attachments
  for (const att of msg.attachments) {
    if (att.size === 0) {
      warnings.push(`Attachment ${att.fileName} is zero-byte`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

## Section 5: Catalog Ingest Handoff

### 5.1 Batch Routing & Drive Upload

#### 5.1.1 Deterministic Routing Logic

```typescript
interface TierRoute {
  tier: 'tier-1-images' | 'tier-2-research' | 'tier-3-local';
  destination: string; // Drive folder ID or local path
  uploadMethod: 'drive-api' | 'rclone' | 'local-copy';
  retryPolicy: RetryPolicy;
}

interface RoutingConfig {
  tier1: TierRoute;
  tier2: TierRoute;
  tier3: TierRoute;
  unmappedTier: TierRoute; // Fallback for unknown tiers
}

function routeBatch(manifest: Manifest, config: RoutingConfig): TierRoute {
  // Determine primary tier from manifest.classification.primary_tier
  const primaryTier = manifest.classification.primary_tier;

  switch (primaryTier) {
    case 'tier-1':
      return config.tier1;
    case 'tier-2':
      return config.tier2;
    case 'tier-3':
      return config.tier3;
    default:
      return config.unmappedTier;
  }
}

function validateRoutingDecision(manifest: Manifest, route: TierRoute): { valid: boolean; reason?: string } {
  // Prevent routing Tier 2 to local storage
  if (manifest.classification.primary_tier === 'tier-2' && route.uploadMethod === 'local-copy') {
    return { valid: false, reason: 'Tier 2 must be uploaded to Drive' };
  }

  // Prevent routing Tier 1 to local storage if Drive is available
  if (
    manifest.classification.primary_tier === 'tier-1' &&
    route.uploadMethod === 'local-copy' &&
    config.tier1.uploadMethod !== 'local-copy'
  ) {
    return { valid: false, reason: 'Tier 1 should be uploaded to Drive' };
  }

  return { valid: true };
}
```

#### 5.1.2 Drive Upload Implementation

```typescript
interface DriveUploadConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId: string; // Destination folder
  maxConcurrentUploads: number;
  chunkSizeMb: number;
  timeoutMs: number;
}

class DriveUploader {
  private client: GoogleAuthClient;
  private drive: GoogleDriveAPI;
  private config: DriveUploadConfig;
  private uploadQueue: PQueue;

  constructor(config: DriveUploadConfig) {
    this.config = config;
    this.uploadQueue = new PQueue({ concurrency: config.maxConcurrentUploads });
  }

  async uploadBatch(batchDir: string, manifest: Manifest): Promise<DriveUploadResult> {
    const logger = getLogger();
    const fileEntries = manifest.attachments
      .filter(att => att.extraction_status === 'success')
      .map(att => ({
        fileName: att.filename,
        localPath: path.join(batchDir, att.filename),
        mimeType: att.mime_type,
      }));

    logger.info(`Uploading ${fileEntries.length} files to Drive folder ${this.config.folderId}`);

    const uploadPromises = fileEntries.map(entry =>
      this.uploadQueue.add(() =>
        this.uploadFileWithRetry(entry, this.config.folderId)
      )
    );

    const uploadResults = await Promise.allSettled(uploadPromises);

    const successful = uploadResults.filter(r => r.status === 'fulfilled').length;
    const failed = uploadResults.filter(r => r.status === 'rejected').length;

    logger.info(`Upload complete: ${successful} succeeded, ${failed} failed`);

    // Determine overall status
    const allSucceeded = failed === 0;

    return {
      batchId: manifest.batch_id,
      totalFiles: fileEntries.length,
      successCount: successful,
      failureCount: failed,
      uploadedFileIds: uploadResults
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<DriveFileInfo>).value.fileId),
      allSucceeded,
      completedAt: new Date().toISOString(),
    };
  }

  private async uploadFileWithRetry(
    entry: { fileName: string; localPath: string; mimeType: string },
    folderId: string
  ): Promise<DriveFileInfo> {
    const policy: RetryPolicy = {
      maxAttempts: 3,
      backoffMs: [500, 1000, 2000],
      retryableErrors: ['ECONNREFUSED', '503', '429'],
    };

    return retryWithBackoff(
      () => this.uploadFileToDrive(entry, folderId),
      policy,
      getLogger()
    );
  }

  private async uploadFileToDrive(
    entry: { fileName: string; localPath: string; mimeType: string },
    folderId: string
  ): Promise<DriveFileInfo> {
    const fileStream = fs.createReadStream(entry.localPath);
    const fileSize = (await fs.stat(entry.localPath)).size;

    // Use resumable upload for large files
    if (fileSize > this.config.chunkSizeMb * 1024 * 1024) {
      return this.uploadFileResumable(entry, folderId, fileSize);
    }

    // Simple upload for small files
    const response = await this.drive.files.create(
      {
        requestBody: {
          name: entry.fileName,
          parents: [folderId],
          mimeType: entry.mimeType,
        },
        media: {
          body: fileStream,
          mimeType: entry.mimeType,
        },
      },
      { timeout: this.config.timeoutMs }
    );

    return {
      fileId: response.data.id,
      fileName: entry.fileName,
      webViewLink: response.data.webViewLink,
      uploadedAt: new Date().toISOString(),
    };
  }

  private async uploadFileResumable(
    entry: { fileName: string; localPath: string; mimeType: string },
    folderId: string,
    fileSize: number
  ): Promise<DriveFileInfo> {
    // Resumable upload with progress tracking
    const fileStream = fs.createReadStream(entry.localPath, {
      highWaterMark: this.config.chunkSizeMb * 1024 * 1024,
    });

    const response = await this.drive.files.create(
      {
        requestBody: {
          name: entry.fileName,
          parents: [folderId],
        },
        media: {
          body: fileStream,
        },
      },
      {
        timeout: this.config.timeoutMs,
        onUploadProgress: (evt) => {
          const progress = Math.round((evt.bytesRead / fileSize) * 100);
          getLogger().debug(`Upload progress: ${entry.fileName} ${progress}%`);
        },
      }
    );

    return {
      fileId: response.data.id,
      fileName: entry.fileName,
      webViewLink: response.data.webViewLink,
      uploadedAt: new Date().toISOString(),
    };
  }
}
```

---

### 5.2 File Watching & Polling

#### 5.2.1 File Watcher (Primary)

```typescript
interface FileWatcherConfig {
  watchDir: string; // C:\research-intake\pending
  debounceMs: number; // 500
  enablePolling: boolean; // fallback
  pollingIntervalMs: number; // 5000
  ignorePatterns: string[];
}

class BatchFileWatcher {
  private watcher: FSWatcher;
  private config: FileWatcherConfig;
  private logger: Logger;
  private debounceTimers: Map<string, NodeJS.Timeout>;

  constructor(config: FileWatcherConfig) {
    this.config = config;
    this.debounceTimers = new Map();
  }

  async start(): Promise<void> {
    this.logger.info(`Starting file watcher on ${this.config.watchDir}`);

    this.watcher = chokidar.watch(this.config.watchDir, {
      persistent: true,
      awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 },
      ignored: this.config.ignorePatterns,
      usePolling: this.config.enablePolling,
      interval: this.config.pollingIntervalMs,
    });

    this.watcher.on('add', (filePath) => {
      // Debounce manifest.json writes
      if (filePath.endsWith('manifest.json')) {
        this.debounceManifestDetected(filePath);
      }
    });

    this.watcher.on('error', (err) => {
      this.logger.error(`File watcher error: ${err.message}`);
      // Fallback to polling if watcher fails
      if (!this.config.enablePolling) {
        this.startPollingFallback();
      }
    });

    this.logger.info('File watcher ready');
  }

  private debounceManifestDetected(manifestPath: string): void {
    const batchId = path.basename(path.dirname(manifestPath));

    // Clear existing timer
    if (this.debounceTimers.has(batchId)) {
      clearTimeout(this.debounceTimers.get(batchId));
    }

    // Set new timer
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(batchId);
      
      // Check manifest is fully written
      const batchDir = path.dirname(manifestPath);
      const isReady = await this.isBatchReady(batchDir);

      if (isReady) {
        await this.triggerIngest(batchDir);
      }
    }, this.config.debounceMs);

    this.debounceTimers.set(batchId, timer);
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.logger.info('File watcher stopped');
    }

    // Clear all debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
}
```

#### 5.2.2 Polling Fallback

```typescript
class BatchPoller {
  private config: FileWatcherConfig;
  private logger: Logger;
  private running: boolean = false;
  private pollHandle: NodeJS.Timer;
  private processedBatches: Set<string>;

  constructor(config: FileWatcherConfig) {
    this.config = config;
    this.processedBatches = new Set();
  }

  async startPolling(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.logger.info(`Starting batch poller (interval: ${this.config.pollingIntervalMs}ms)`);

    this.pollHandle = setInterval(async () => {
      try {
        await this.pollOnce();
      } catch (err) {
        this.logger.error(`Poll cycle failed: ${err.message}`);
      }
    }, this.config.pollingIntervalMs);
  }

  private async pollOnce(): Promise<void> {
    const pendingDir = path.join(this.config.watchDir, 'pending');

    try {
      const batches = await fs.readdir(pendingDir);

      for (const batchId of batches) {
        // Skip if already processed in this session
        if (this.processedBatches.has(batchId)) continue;

        const batchDir = path.join(pendingDir, batchId);
        const manifestPath = path.join(batchDir, 'manifest.json');

        // Check if manifest exists and batch is ready
        if (await fileExists(manifestPath)) {
          const isReady = await this.isBatchReady(batchDir);
          if (isReady) {
            this.processedBatches.add(batchId);
            await this.triggerIngest(batchDir);
          }
        }
      }
    } catch (err) {
      this.logger.error(`Polling error: ${err.message}`);
    }
  }

  async stopPolling(): Promise<void> {
    if (!this.running) return;
    this.running = false;
    clearInterval(this.pollHandle);
    this.logger.info('Batch poller stopped');
  }
}
```

#### 5.2.3 Readiness Check

```typescript
async function isBatchReady(batchDir: string): Promise<boolean> {
  // Check manifest exists
  const manifestPath = path.join(batchDir, 'manifest.json');
  if (!await fileExists(manifestPath)) return false;

  // Check manifest is valid JSON
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    if (!manifest.batch_id) return false;
  } catch {
    return false;
  }

  // Check intake log exists
  const intakePath = path.join(batchDir, 'intake.log');
  if (!await fileExists(intakePath)) return false;

  // Check all extracted attachments still exist
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
  for (const att of manifest.attachments) {
    if (att.extraction_status === 'success') {
      const attPath = path.join(batchDir, att.filename);
      if (!await fileExists(attPath)) return false;
    }
  }

  return true;
}
```

---

### 5.3 Ingest Workflow Integration

#### 5.3.1 Trigger Ingest

```typescript
interface IngestTrigger {
  batchId: string;
  batchDir: string;
  manifest: Manifest;
  route: TierRoute;
  triggeredAt: string;
}

async function triggerIngest(batchDir: string): Promise<void> {
  const logger = getLogger();
  const manifestPath = path.join(batchDir, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
  const batchId = manifest.batch_id;

  logger.info(`Triggering ingest for batch ${batchId}`);

  // Route batch
  const route = routeBatch(manifest, getRoutingConfig());
  const validation = validateRoutingDecision(manifest, route);

  if (!validation.valid) {
    logger.error(`Routing validation failed: ${validation.reason}`);
    await appendIntakeLog(batchDir, {
      timestamp: new Date().toISOString(),
      event: 'ingest_failed',
      reason: validation.reason,
      batchId,
    });
    return;
  }

  try {
    // Update manifest with ingest status
    manifest.ingest_status = {
      status: 'in_progress',
      tier_route: route.tier,
      started_at: new Date().toISOString(),
    };
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    // Execute upload based on tier
    const uploadResult = await executeUpload(batchDir, manifest, route);

    // Update manifest with upload result
    manifest.ingest_status.status = uploadResult.allSucceeded ? 'completed' : 'partial_failure';
    manifest.ingest_status.upload_result = uploadResult;
    manifest.ingest_status.completed_at = new Date().toISOString();
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    // Log ingest completion
    await appendIntakeLog(batchDir, {
      timestamp: new Date().toISOString(),
      event: 'ingest_completed',
      batchId,
      uploadResult,
    });

    // Move batch to archive if successful
    if (uploadResult.allSucceeded) {
      await moveBatchToArchive(batchDir, batchId);
    }

    // Notify Slack
    await notifySlack({
      channel: 'ingest-summary',
      message: `✅ Batch ${batchId} ingested: ${uploadResult.successCount}/${uploadResult.totalFiles} files uploaded`,
    });
  } catch (err) {
    logger.error(`Ingest failed for batch ${batchId}: ${err.message}`);

    manifest.ingest_status = {
      status: 'failed',
      error: err.message,
      failed_at: new Date().toISOString(),
    };
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    await appendIntakeLog(batchDir, {
      timestamp: new Date().toISOString(),
      event: 'ingest_failed',
      batchId,
      error: err.message,
    });

    await notifySlack({
      channel: 'alerts',
      message: `❌ Batch ${batchId} ingest failed: ${err.message}`,
    });
  }
}

async function executeUpload(batchDir: string, manifest: Manifest, route: TierRoute): Promise<UploadResult> {
  switch (route.uploadMethod) {
    case 'drive-api':
      return new DriveUploader(getDriveConfig()).uploadBatch(batchDir, manifest);

    case 'rclone':
      return executeRcloneUpload(batchDir, manifest, route);

    case 'local-copy':
      return executeLocalCopy(batchDir, manifest, route);

    default:
      throw new Error(`Unknown upload method: ${route.uploadMethod}`);
  }
}
```

#### 5.3.2 Failure Recovery

```typescript
interface FailedIngest {
  batchId: string;
  error: string;
  failedAt: string;
  retryCount: number;
  nextRetryAt?: string;
}

async function handleIngestFailure(batchDir: string, error: Error): Promise<void> {
  const logger = getLogger();
  const manifestPath = path.join(batchDir, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
  const batchId = manifest.batch_id;

  // Check if retryable error
  const isRetryable = ['ECONNREFUSED', '503', 'ETIMEDOUT'].some(msg =>
    error.message.includes(msg)
  );

  if (!isRetryable) {
    logger.error(`Non-retryable ingest error for batch ${batchId}: ${error.message}`);
    manifest.ingest_status.status = 'failed';
    manifest.ingest_status.non_retryable = true;
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    return;
  }

  // Increment retry count
  const retryCount = (manifest.ingest_status.retry_count || 0) + 1;
  const maxRetries = 5;

  if (retryCount > maxRetries) {
    logger.error(`Batch ${batchId} exceeded max retries (${maxRetries})`);
    manifest.ingest_status.status = 'failed';
    manifest.ingest_status.max_retries_exceeded = true;
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    // Notify Slack
    await notifySlack({
      channel: 'alerts',
      message: `❌ Batch ${batchId} exceeded max ingest retries`,
    });
    return;
  }

  // Schedule retry with exponential backoff
  const backoffMs = Math.pow(2, retryCount) * 1000;
  const nextRetryAt = new Date(Date.now() + backoffMs);

  manifest.ingest_status.retry_count = retryCount;
  manifest.ingest_status.next_retry_at = nextRetryAt.toISOString();
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  logger.info(
    `Scheduled retry ${retryCount}/${maxRetries} for batch ${batchId} at ${nextRetryAt.toISOString()}`
  );

  // Schedule timeout to trigger retry
  setTimeout(async () => {
    try {
      await triggerIngest(batchDir);
    } catch (retryErr) {
      logger.error(`Retry failed for batch ${batchId}: ${retryErr.message}`);
    }
  }, backoffMs);
}
```

#### 5.3.3 Archive Rotation

```typescript
async function moveBatchToArchive(batchDir: string, batchId: string): Promise<void> {
  const logger = getLogger();
  const archiveDir = path.join(STAGING_ROOT, 'archive', batchId);

  logger.info(`Moving batch ${batchId} to archive`);

  try {
    await fs.mkdir(archiveDir, { recursive: true });
    await copyDirRecursive(batchDir, archiveDir);
    await fs.rm(batchDir, { recursive: true, force: true });

    logger.info(`Batch ${batchId} archived successfully`);
  } catch (err) {
    logger.error(`Failed to archive batch ${batchId}: ${err.message}`);
    throw err;
  }
}

async function archiveRotation(config: ArchiveRotationConfig): Promise<void> {
  const logger = getLogger();
  const archiveDir = path.join(STAGING_ROOT, 'archive');

  // Find batches older than retention period
  const cutoffDate = new Date(Date.now() - config.retentionDays * 24 * 60 * 60 * 1000);
  const batches = await fs.readdir(archiveDir);

  for (const batchId of batches) {
    const batchDir = path.join(archiveDir, batchId);
    const stats = await fs.stat(batchDir);

    if (stats.mtime < cutoffDate) {
      logger.info(`Archiving batch ${batchId} to cold storage`);

      const coldDir = path.join(STAGING_ROOT, 'cold', batchId);
      await fs.mkdir(coldDir, { recursive: true });
      await copyDirRecursive(batchDir, coldDir);
      await fs.rm(batchDir, { recursive: true, force: true });
    }
  }
}
```

---

### 5.4 Monitoring & Alerting

#### 5.4.1 Ingest Metrics

```typescript
interface IngestMetrics {
  timestamp: string;
  batches_total: number;
  batches_pending: number;
  batches_in_progress: number;
  batches_completed: number;
  batches_failed: number;
  files_uploaded: number;
  files_failed: number;
  total_bytes_uploaded: number;
  avg_upload_time_ms: number;
  drive_quota_remaining_gb: number;
}

async function collectIngestMetrics(): Promise<IngestMetrics> {
  const logger = getLogger();
  const stagingRoot = STAGING_ROOT;

  const pending = await fs.readdir(path.join(stagingRoot, 'pending'));
  const completed = await fs.readdir(path.join(stagingRoot, 'archive'));
  const failed = await fs.readdir(path.join(stagingRoot, 'rejected'));

  // Calculate average upload time from intake logs
  let totalUploadTime = 0;
  let uploadCount = 0;

  for (const batchId of completed) {
    const logPath = path.join(stagingRoot, 'archive', batchId, 'intake.log');
    if (await fileExists(logPath)) {
      const lines = (await fs.readFile(logPath, 'utf-8')).split('\n');
      const started = lines.find(l => l.includes('ingest_triggered'));
      const ended = lines.find(l => l.includes('ingest_completed'));

      if (started && ended) {
        const startTime = new Date(JSON.parse(started).timestamp).getTime();
        const endTime = new Date(JSON.parse(ended).timestamp).getTime();
        totalUploadTime += endTime - startTime;
        uploadCount++;
      }
    }
  }

  const avgUploadTime = uploadCount > 0 ? totalUploadTime / uploadCount : 0;

  // Get Drive quota
  const drive = getGoogleDriveAPI();
  const aboutResult = await drive.about.get({ fields: 'storageQuota' });
  const quotaRemainingGb =
    (aboutResult.data.storageQuota.limit - aboutResult.data.storageQuota.usage) / (1024 * 1024 * 1024);

  return {
    timestamp: new Date().toISOString(),
    batches_total: pending.length + completed.length + failed.length,
    batches_pending: pending.length,
    batches_in_progress: 0, // TODO: count from pending with ingest_status.in_progress
    batches_completed: completed.length,
    batches_failed: failed.length,
    files_uploaded: 0, // TODO: aggregate from manifests
    files_failed: 0, // TODO: aggregate from manifests
    total_bytes_uploaded: 0, // TODO: sum from manifests
    avg_upload_time_ms: avgUploadTime,
    drive_quota_remaining_gb: quotaRemainingGb,
  };
}

async function reportIngestMetrics(): Promise<void> {
  const metrics = await collectIngestMetrics();
  const logger = getLogger();

  logger.info(`Ingest Metrics: ${JSON.stringify(metrics)}`);

  // Send to monitoring system (Prometheus, Grafana, etc.)
  await fetch('http://localhost:9090/metrics', {
    method: 'POST',
    body: formatPrometheusMetrics(metrics),
  }).catch(err => logger.error(`Failed to report metrics: ${err.message}`));
}
```

---

## Implementation Checklist

- [ ] Mailpit API client (connection pool, retry logic, polling)
- [ ] Message validation (pre-flight checks, blocked patterns)
- [ ] Attachment extraction (streaming, timeout, rollback)
- [ ] Batch routing (deterministic tier mapping)
- [ ] Drive upload (resumable, progress tracking, error recovery)
- [ ] File watcher (chokidar, debounce, polling fallback)
- [ ] Ingest workflow (trigger, failure recovery, archive rotation)
- [ ] Monitoring (metrics collection, Slack alerts, log aggregation)
- [ ] MCP tool handlers (status, classify, trigger, logs)
- [ ] Windows Task Scheduler launcher

---

## Configuration Examples

```json
{
  "mailpit": {
    "baseUrl": "http://localhost:8025",
    "timeout_ms": 30000,
    "maxConnections": 5,
    "pollIntervalMs": 5000,
    "maxMessagesPerPoll": 50
  },
  "validation": {
    "requireAttachments": true,
    "maxAttachments": 100,
    "maxTotalSizeMb": 500,
    "maxAttachmentSizeMb": 100,
    "blockedMimeTypes": ["application/x-msdownload", "application/x-exe"],
    "blockedFilePatterns": ["\\.exe$", "\\.dll$", "\\.sys$"]
  },
  "routing": {
    "tier1": {
      "destination": "Drive-Folder-ID-Tier-1",
      "uploadMethod": "drive-api"
    },
    "tier2": {
      "destination": "Drive-Folder-ID-Tier-2",
      "uploadMethod": "drive-api"
    },
    "tier3": {
      "destination": "C:\\research-intake\\cold",
      "uploadMethod": "local-copy"
    }
  },
  "drive": {
    "clientId": "xxx.apps.googleusercontent.com",
    "maxConcurrentUploads": 3,
    "chunkSizeMb": 100,
    "timeoutMs": 300000
  },
  "monitoring": {
    "checkStuckIntervalMinutes": 5,
    "stuckThresholdMinutes": 30,
    "archiveRotationDays": 90
  }
}
```
