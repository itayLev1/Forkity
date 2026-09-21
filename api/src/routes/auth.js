import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  createSessionToken,
  sessionCookie,
} from '../lib/session.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const credentialsSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
});

const registrationSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(1).max(80),
});

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
});

const setSessionCookie = async (response, userId) => {
  const token = await createSessionToken(userId);
  response.cookie(sessionCookie.name, token, sessionCookie.options);
};

router.post('/register', async (request, response) => {
  const parsed = registrationSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({
      message: 'Invalid registration data',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { email, password, displayName } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash, displayName },
      select: { id: true, email: true, displayName: true },
    });

    await setSessionCookie(response, user.id);
    return response.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === 'P2002') {
      return response.status(409).json({ message: 'Email is already registered' });
    }

    throw error;
  }
});

router.post('/login', async (request, response) => {
  const parsed = credentialsSchema.safeParse(request.body);

  if (!parsed.success) {
    return response.status(400).json({ message: 'Invalid login data' });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = user && await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return response.status(401).json({ message: 'Invalid email or password' });
  }

  await setSessionCookie(response, user.id);
  return response.json({ user: publicUser(user) });
});

router.post('/logout', (_request, response) => {
  response.clearCookie(sessionCookie.name, sessionCookie.options);
  return response.status(204).send();
});

router.get('/me', requireAuth, (request, response) => {
  response.json({ user: request.user });
});

export default router;