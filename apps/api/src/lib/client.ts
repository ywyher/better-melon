import axios from 'axios';
import axiosRetry from 'axios-retry';

const client = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

axiosRetry(client, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: axiosRetry.isNetworkOrIdempotentRequestError,
  onRetry: (retryCount, error, config) => {
    console.log(`Retry #${retryCount} for ${config.url}: ${error.message}`);
  }
});

export default client;