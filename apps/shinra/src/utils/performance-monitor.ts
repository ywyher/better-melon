import os from 'os';
import { logger } from '../middleware.js';

// Store performance metrics
const metrics = {
  // Request counters
  requestCount: 0,
  successCount: 0,
  errorCount: 0,
  
  // Response time metrics
  totalResponseTime: 0,
  maxResponseTime: 0,
  
  // Streaming metrics
  streamingRequestCount: 0,
  streamingTotalSize: 0,
  
  // Size metrics
  totalBytesIn: 0,
  totalBytesOut: 0,
  
  // Cache metrics 
  cacheHits: 0,
  cacheMisses: 0,
  
  // Worker metrics
  workerTasks: 0,
  workerErrors: 0,
  
  // Reset time
  startTime: Date.now()
};

// Record request metrics
export function recordRequest() {
  metrics.requestCount++;
  return Date.now(); // Return current time for response time tracking
}

// Record response metrics
export function recordResponse(startTime: number, success: boolean, bytesIn: number, bytesOut: number) {
  const responseTime = Date.now() - startTime;
  
  // Update counters
  if (success) {
    metrics.successCount++;
  } else {
    metrics.errorCount++;
  }
  
  // Update response time metrics
  metrics.totalResponseTime += responseTime;
  if (responseTime > metrics.maxResponseTime) {
    metrics.maxResponseTime = responseTime;
  }
  
  // Update byte metrics
  metrics.totalBytesIn += bytesIn;
  metrics.totalBytesOut += bytesOut;
  
  return responseTime;
}

// Record streaming request
export function recordStreamingRequest(size: number) {
  metrics.streamingRequestCount++;
  metrics.streamingTotalSize += size;
}

// Record cache metrics
export function recordCacheHit() {
  metrics.cacheHits++;
}

export function recordCacheMiss() {
  metrics.cacheMisses++;
}

// Record worker metrics
export function recordWorkerTask(success: boolean) {
  metrics.workerTasks++;
  if (!success) {
    metrics.workerErrors++;
  }
}

// Format bytes to human-readable string
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format milliseconds to human-readable string
function formatTime(ms: number): string {
  if (ms < 1000) return ms + ' ms';
  const seconds = ms / 1000;
  if (seconds < 60) return seconds.toFixed(2) + ' sec';
  const minutes = seconds / 60;
  if (minutes < 60) return minutes.toFixed(2) + ' min';
  const hours = minutes / 60;
  return hours.toFixed(2) + ' hr';
}

// Get system information
function getSystemInfo() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  
  return {
    uptime: formatTime(os.uptime() * 1000),
    cpus: os.cpus().length,
    loadAvg: os.loadavg(),
    memory: {
      total: formatBytes(totalMem),
      used: formatBytes(usedMem),
      free: formatBytes(freeMem),
      usedPercent: ((usedMem / totalMem) * 100).toFixed(2) + '%'
    },
    platform: os.platform(),
    arch: os.arch()
  };
}

// Get process information
function getProcessInfo() {
  const memUsage = process.memoryUsage();
  
  return {
    uptime: formatTime(process.uptime() * 1000),
    pid: process.pid,
    memory: {
      rss: formatBytes(memUsage.rss),
      heapTotal: formatBytes(memUsage.heapTotal),
      heapUsed: formatBytes(memUsage.heapUsed),
      external: formatBytes(memUsage.external)
    },
    versions: {
      node: process.version
    }
  };
}

// Get performance metrics
export function getPerformanceMetrics() {
  const avgResponseTime = metrics.requestCount > 0 
    ? Math.round(metrics.totalResponseTime / metrics.requestCount) 
    : 0;
  
  const cacheHitRatio = (metrics.cacheHits + metrics.cacheMisses) > 0
    ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100).toFixed(2)
    : '0.00';
  
  const workerSuccessRate = metrics.workerTasks > 0
    ? (((metrics.workerTasks - metrics.workerErrors) / metrics.workerTasks) * 100).toFixed(2)
    : '100.00';
  
  return {
    server: {
      uptime: formatTime(Date.now() - metrics.startTime),
      system: getSystemInfo(),
      process: getProcessInfo(),
    },
    requests: {
      total: metrics.requestCount,
      success: metrics.successCount,
      error: metrics.errorCount,
      successRate: metrics.requestCount > 0 
        ? ((metrics.successCount / metrics.requestCount) * 100).toFixed(2) + '%'
        : '0.00%'
    },
    performance: {
      avgResponseTime: formatTime(avgResponseTime),
      maxResponseTime: formatTime(metrics.maxResponseTime),
      throughput: {
        bytesIn: formatBytes(metrics.totalBytesIn),
        bytesOut: formatBytes(metrics.totalBytesOut),
        totalTransferred: formatBytes(metrics.totalBytesIn + metrics.totalBytesOut)
      }
    },
    features: {
      streaming: {
        requests: metrics.streamingRequestCount,
        totalSize: formatBytes(metrics.streamingTotalSize),
        avgSize: metrics.streamingRequestCount > 0
          ? formatBytes(metrics.streamingTotalSize / metrics.streamingRequestCount)
          : '0 Bytes'
      },
      cache: {
        hits: metrics.cacheHits,
        misses: metrics.cacheMisses,
        hitRatio: cacheHitRatio + '%',
      },
      workers: {
        tasks: metrics.workerTasks,
        errors: metrics.workerErrors,
        successRate: workerSuccessRate + '%'
      }
    }
  };
}

// Reset metrics
export function resetMetrics() {
  Object.keys(metrics).forEach(key => {
    if (key !== 'startTime') {
      // @ts-ignore
      metrics[key] = 0;
    }
  });
  metrics.startTime = Date.now();
  logger.info('Performance metrics reset');
}

export default {
  recordRequest,
  recordResponse,
  recordStreamingRequest,
  recordCacheHit,
  recordCacheMiss,
  recordWorkerTask,
  getPerformanceMetrics,
  resetMetrics
};