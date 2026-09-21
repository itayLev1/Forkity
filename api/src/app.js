import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.js';
import recipesRouter from './routes/recipes.js';
import favoritesRouter from './routes/favorites.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    const configuredOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:1234';
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (!origin || isDevelopment || origin === configuredOrigin) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'forkity-api',
  });
});

app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);
app.use('/api/favorites', favoritesRouter);

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found' });
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({ message: 'Malformed JSON request body' });
  }

  if (error.name === 'ZodError') {
    return response.status(400).json({ message: 'Invalid request data' });
  }

  console.error(error);
  return response.status(500).json({ message: 'Internal server error' });
});

export default app;