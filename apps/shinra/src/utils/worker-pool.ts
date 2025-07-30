import { cpus } from 'os';
import Piscina from 'piscina';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../middleware.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKER_THREADS = parseInt(process.env.WORKER_THREADS || '0', 10) || Math.max(cpus().length - 1, 1);
const USE_WORKERS = process.env.USE_WORKER_THREADS === 'true';

let workerPool: any = null;

if (USE_WORKERS) {
  workerPool = new (Piscina as any)({
    filename: path.resolve(__dirname, './compression-worker.js'),
    minThreads: 1,
    maxThreads: WORKER_THREADS,
    idleTimeout: 60000,
  });

  logger.info({
    type: 'workers',
    threads: WORKER_THREADS,
    cpus: cpus().length,
  }, `Worker pool initialized with ${WORKER_THREADS} threads`);
}


// Function to decompress content using worker threads
export async function decompressWithWorker(
  buffer: Buffer, 
  contentEncoding?: string | null
): Promise<Buffer> {
  // If workers are disabled or not initialized, use in-process decompression
  if (!USE_WORKERS || !workerPool) {
    // Import the in-process version
    const { decompressContent } = await import('./helpers.js');
    return decompressContent(buffer, contentEncoding);
  }
  
  // Use worker pool
  try {
    const result = await workerPool.run({
      buffer: buffer.toString('base64'), // Convert to base64 for serialization
      contentEncoding
    }, { name: 'decompress' });
    
    return Buffer.from(result, 'base64'); // Convert back from base64
  } catch (error) {
    logger.error({
      type: 'workers',
      error: error instanceof Error ? error.message : String(error),
    }, 'Worker decompression failed, falling back to in-process');
    
    // Fallback to in-process on worker failure
    const { decompressContent } = await import('./helpers.js');
    return decompressContent(buffer, contentEncoding);
  }
}

// Get worker stats
export function getWorkerStats() {
  if (!workerPool) {
    return {
      enabled: false,
      threadsAvailable: 0,
      threadsRunning: 0,
      maxThreads: 0,
      queueSize: 0
    };
  }
  
  return {
    enabled: true,
    threadsAvailable: workerPool.threads.length,
    threadsRunning: workerPool.runTime,
    maxThreads: WORKER_THREADS,
    queueSize: workerPool.queueSize
  };
}

export default {
  decompressWithWorker,
  getWorkerStats,
  USE_WORKERS,
  WORKER_THREADS
};