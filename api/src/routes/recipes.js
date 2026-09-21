import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const ingredientSchema = z.object({
  quantity: z.number().nonnegative().nullable().optional(),
  unit: z.string().trim().max(40).default(''),
  description: z.string().trim().min(1).max(200),
});

const recipeSchema = z.object({
  title: z.string().trim().min(1).max(160),
  publisher: z.string().trim().min(1).max(120),
  sourceUrl: z.string().url().max(2_000),
  imageUrl: z.string().url().max(2_000),
  servings: z.number().int().positive().max(100),
  cookingTime: z.number().int().positive().max(1_440),
  ingredients: z.array(ingredientSchema).min(1).max(100),
});

const serializeIngredient = (ingredient) => ({
  quantity: ingredient.quantity === null ? null : Number(ingredient.quantity),
  unit: ingredient.unit,
  description: ingredient.description,
});

export const serializeRecipe = (recipe) => ({
  id: recipe.id,
  title: recipe.title,
  publisher: recipe.publisher,
  source_url: recipe.sourceUrl,
  image_url: recipe.imageUrl,
  servings: recipe.servings,
  cooking_time: recipe.cookingTime,
  ingredients: recipe.ingredients?.map(serializeIngredient),
  ...(recipe.authorId ? { key: recipe.authorId } : {}),
});

const recipeInclude = { ingredients: true };

router.get('/', async (request, response) => {
  const query = z.string().trim().max(100).parse(request.query.search ?? '');
  const recipes = await prisma.recipe.findMany({
    where: query ? {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { publisher: { contains: query, mode: 'insensitive' } },
      ],
    } : {},
    include: recipeInclude,
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return response.json({ status: 'success', data: { recipes: recipes.map(serializeRecipe) } });
});

router.get('/:id', async (request, response) => {
  const id = z.string().uuid().safeParse(request.params.id);
  if (!id.success) return response.status(400).json({ message: 'Invalid recipe id' });

  const recipe = await prisma.recipe.findUnique({ where: { id: id.data }, include: recipeInclude });
  if (!recipe) return response.status(404).json({ message: 'Recipe not found' });

  return response.json({ status: 'success', data: { recipe: serializeRecipe(recipe) } });
});

router.post('/', requireAuth, async (request, response) => {
  const parsed = recipeSchema.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({
      message: 'Invalid recipe data',
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const { ingredients, ...recipeData } = parsed.data;
  const recipe = await prisma.recipe.create({
    data: {
      ...recipeData,
      authorId: request.user.id,
      ingredients: { create: ingredients },
    },
    include: recipeInclude,
  });

  return response.status(201).json({ status: 'success', data: { recipe: serializeRecipe(recipe) } });
});

export default router;