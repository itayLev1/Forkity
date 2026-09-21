import { SignJWT, jwtVerify } from 'jose';

const sessionCookieName = 'forkity_session';
const sessionDuration = '7d';

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return new TextEncoder().encode(process.env.JWT_SECRET);
};

export const createSessionToken = (userId) => new SignJWT({})
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject(userId)
  .setIssuedAt()
  .setExpirationTime(sessionDuration)
  .sign(getSecret());

export const verifySessionToken = (token) => jwtVerify(token, getSecret());

export const sessionCookie = {
  name: sessionCookieName,
  options: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  },
};