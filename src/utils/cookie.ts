import { CookieOptions } from 'express';

export const getCookieOptions = (maxAge: number = 31536000000) => {
  const cookieOptions: CookieOptions = { httpOnly: true, maxAge };
  // if (JSON.parse(process.env.SECURED_ENDPOINT || 'false')) cookieOptions.secure = true;
  // if (process.env.COOKIE_SAME_SITE) cookieOptions.sameSite = process.env.COOKIE_SAME_SITE as "lax" | "none" | "strict";
  // if (process.env.COOKIE_DOMAIN) cookieOptions.domain = process.env.COOKIE_DOMAIN;
  return cookieOptions;
};
