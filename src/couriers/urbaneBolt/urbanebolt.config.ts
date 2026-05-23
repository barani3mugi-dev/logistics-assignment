import { registerAs } from '@nestjs/config';

export default registerAs('urbanebolt', () => ({
  baseUrl: process.env.URBANEBOLT_BASE_URL,
  apiKey: process.env.URBANEBOLT_API_KEY,
  apiSecret: process.env.URBANEBOLT_API_SECRET,
  customerCode: process.env.URBANEBOLT_CUSTOMER_CODE,
  timeoutMs: parseInt(process.env.URBANEBOLT_TIMEOUT_MS || '10000'),
  retryCount: parseInt(process.env.URBANEBOLT_RETRY_COUNT || '3'),
}));