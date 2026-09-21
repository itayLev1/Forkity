import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './src/routes/auth.js';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    service: 'forkity-api',
  });
});

app.use('/api/auth', authRouter);

app.listen(port, () => {
  console.log(`Forkity API listening on port ${port}`);
});