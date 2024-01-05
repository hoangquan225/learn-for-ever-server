import { CookieOptions } from 'express';

export const getCookieOptions = (maxAge: number = 31536000000) => {
  const cookieOptions: CookieOptions = { httpOnly: true, maxAge };
  // if (JSON.parse(process.env.SECURED_ENDPOINT || 'false')) cookieOptions.secure = true;
  // if (process.env.COOKIE_SAME_SITE) cookieOptions.sameSite = process.env.COOKIE_SAME_SITE as "lax" | "none" | "strict";
  // if (process.env.COOKIE_DOMAIN) cookieOptions.domain = process.env.COOKIE_DOMAIN;
  return cookieOptions;
};


// import { CookieOptions } from 'express';
// import dotenv from './dotenv';
// import { COOKIE_EXPIRED } from './constant';
// dotenv.config();

// // export const getCookieOptions = (maxAge: number = 31536000000) => {
// export const getCookieOptions = (
//   expires = new Date(Date.now() + COOKIE_EXPIRED * 24 * 60 * 60 * 1000),
//   maxAge?: any
// ) => {
//   const cookieOptions: CookieOptions = {
//     httpOnly: true,
//     expires,
//     // maxAge,
//   };
//   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
//   return cookieOptions;
// };
