import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeRecipe } from './recipes.js';

const router = Router();
const recipeIdSchema = z.string().uuid();
const recipeInclude = { recipe: { include: { ingredients: true } } };

router.use(requireAuth);

router.get('/', async (request, response) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: request.user.id },
    include: recipeInclude,
    orderBy: { createdAt: 'desc' },
  });

  return response.json({
    status: 'success',
    data: { recipes: favorites.map(({ recipe }) => serializeRecipe(recipe)) },
  });
});

router.post('/:recipeId', async (request, response) => {
  const recipeId = recipeIdSchema.safeParse(request.params.recipeId);
  if (!recipeId.success) return response.status(400).json({ message: 'Invalid recipe id' });

  try {
    const favorite = await prisma.favorite.create({
      data: { userId: request.user.id, recipeId: recipeId.data },
      include: recipeInclude,
    });
    return response.status(201).json({ status: 'success', data: { recipe: serializeRecipe(favorite.recipe) } });
  } catch (error) {
    if (error.code === 'P2002') return response.status(200).json({ status: 'success' });
    if (error.code === 'P2003') return response.status(404).json({ message: 'Recipe not found' });
    throw error;
  }
});

router.delete('/:recipeId', async (request, response) => {
  const recipeId = recipeIdSchema.safeParse(request.params.recipeId);
  if (!recipeId.success) return response.status(400).json({ message: 'Invalid recipe id' });

  await prisma.favorite.deleteMany({
    where: { userId: request.user.id, recipeId: recipeId.data },
  });
  return response.status(204).send();
});

export default router;