import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';


const minuteLimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(15, '1m'), // 15 requests per minute
});

const hourLimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(250, '1h'), // 250 requests per hour
});

const dayLimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(500, '24h'), // 500 requests per day
});

// Function to check rate limits
export async function checkRateLimit(ip: string) {
  const minuteResult = await minuteLimit.limit(`minute_${ip}`);
  const hourResult = await hourLimit.limit(`hour_${ip}`);
  const dayResult = await dayLimit.limit(`day_${ip}`);

  const success = minuteResult.success && hourResult.success && dayResult.success;

  return {
    success,
    limits: {
      minute: minuteResult,
      hour: hourResult,
      day: dayResult,
    },
  };
}
