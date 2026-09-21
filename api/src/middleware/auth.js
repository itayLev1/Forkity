import { prisma } from '../lib/prisma.js';
import { sessionCookie, verifySessionToken } from '../lib/session.js';

export const requireAuth = async (request, response, next) => {
  const token = request.cookies[sessionCookie.name];

  if (!token) {
    return response.status(401).json({ message: 'Authentication required' });
  }

  try {
    const { payload } = await verifySessionToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, displayName: true },
    });

    if (!user) {
      return response.status(401).json({ message: 'Authentication required' });
    }

    request.user = user;
    return next();
  } catch (_error) {
    return response.status(401).json({ message: 'Invalid or expired session' });
  }
};