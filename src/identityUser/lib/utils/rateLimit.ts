// utils/rateLimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";


const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const resetPasswordLimiter = new Ratelimit({
    redis, // instance
    limiter: Ratelimit.slidingWindow(1, "2 m"), // 1 request per 2 minutes
    analytics: true,
});

/* ------------------ Init Upstash ------------------ */
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL!;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN!;

if (!upstashUrl || !upstashToken) {
    throw new Error("❌ Upstash ENV variables are missing!");
}

export const redisInstance = new Redis({
    url: upstashUrl,
    token: upstashToken,
});

/* ------------------ Create Limiters ------------------ */

// Email: 1 request per 2 minutes
export const emailLimiter = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(2, "2m"),
});

// phone: 1 request per 2 minutes
export const PhoneLimiter = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(2, "2m"),
});

// IP: 1 request per 30 seconds
export const ipLimiter = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(2, "2m"),
});

// Global: 10 requests per 5 minutes
export const globalLimiter = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(1000, "5m"),
});

// Username limiter: 5 attempts per 10 minutes
export const loginUserLimiter = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(5, "10m"),
});

// IP limiter: 20 attempts per 10 minutes
export const loginIpLimiter = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(20, "10m"),
});
