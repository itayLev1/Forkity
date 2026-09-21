//& Lesson: Refactoring for MVC (Model - View - Controller)
//~ Encapsulating the model part
//~ By using export on the state variable it will automatically update the variable on the import side which is the controller in this case. 

import { async } from 'regenerator-runtime';
import { API_BASE_URL, API_URL, RESULTS_PER_PAGE } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js'
// import { search } from 'core-js/fn/symbol';



//* initialize state
export const state = {
  user: null,
  recipe: {},
  search: {
    query: '',
    results: [],
    pageNum: 1,
    resultsPerPage: RESULTS_PER_PAGE,
  },
  bookmarks: [],
};

export const restoreSession = async function () {
  try {
    const data = await AJAX(`${API_BASE_URL}/auth/me`);
    state.user = data.user;
    return state.user;
  } catch (_error) {
    state.user = null;
    return null;
  }
};

export const register = async function ({ displayName, email, password }) {
  const data = await AJAX(`${API_BASE_URL}/auth/register`, {
    displayName,
    email,
    password,
  });
  state.user = data.user;
  return state.user;
};

export const login = async function ({ email, password }) {
  const data = await AJAX(`${API_BASE_URL}/auth/login`, { email, password });
  state.user = data.user;
  return state.user;
};

export const logout = async function () {
  await AJAX(`${API_BASE_URL}/auth/logout`, {});
  state.user = null;
  state.bookmarks = [];
};

const createRecipeObject = function(data) {
      //* save the recipe 
      const { recipe } = data.data;
    
      return {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && {key: recipe.key}) // short circuiting
      }
    }
    
    export const loadRecipe = async function (id) {
      try {
        
    //* load recipe data
    const data = await AJAX(`${API_URL}/${id}`);
        
    //* set state with fetched recipe
    state.recipe = createRecipeObject(data)

    //* save the recipe 
    const { recipe } = data.data;
    
    //* set state with fetched recipe
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    }
    if(state.bookmarks.some(bookmark => bookmark.id === id)) state.recipe.bookmarked = true
    else state.recipe.bookmarked = false

    console.log('recipe in state: ', state.recipe);

  } catch (err) {
    console.error(`loadRecipe Error 😎: ${err}`);
    throw err
  }
}

//* Search
export const loadSearchResults = async (query) => {
  try {

    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${encodeURIComponent(query)}`);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && {key: rec.key}),
      }
    })

    state.search.pageNum = 1

  } catch (err) {
    console.log(`loadSearchResults Error 😎: ${err}`);
    throw err
  }
}

export const getSearchResultsPage = (pageNum = state.search.pageNum) => {

  state.search.pageNum = pageNum;

  // dynamic start and end point for slice: lets say we look for page 1, so pageNum = 1.
  const start = (pageNum - 1) * state.search.resultsPerPage // 0
  const end = pageNum * state.search.resultsPerPage // 9

  return state.search.results.slice(start, end)
}


//* Update servings

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings
    // newQt = oldQt * newServings / oldServings
  });

  state.recipe.servings = newServings
}

//* add bookmark
export const loadBookmarks = async function () {
  if (!state.user) {
    state.bookmarks = [];
    return state.bookmarks;
  }
  const data = await AJAX(`${API_BASE_URL}/favorites`);
  state.bookmarks = data.data.recipes.map(createRecipeObjectFromRecipe);
  return state.bookmarks;
}

const createRecipeObjectFromRecipe = (recipe) => ({
  id: recipe.id,
  title: recipe.title,
  publisher: recipe.publisher,
  sourceUrl: recipe.source_url,
  image: recipe.image_url,
  servings: recipe.servings,
  cookingTime: recipe.cooking_time,
  ingredients: recipe.ingredients,
  ...(recipe.key && { key: recipe.key }),
});

export const addBookmark = async function (recipe) {
  if (!state.user) throw new Error('Please sign in to save recipes.');
  await AJAX(`${API_BASE_URL}/favorites/${recipe.id}`, {});
  if (!state.bookmarks.some((bookmark) => bookmark.id === recipe.id)) state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
};

export const deleteBookmark = async function (id) {
  await fetch(`${API_BASE_URL}/favorites/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  state.bookmarks = state.bookmarks.filter((bookmark) => bookmark.id !== id);
  if (id === state.recipe.id) state.recipe.bookmarked = false;
};


export const uploadRecipe = async function(newRecipe) {
  try {
  const ingredients = Object.entries(newRecipe)
  .filter(entry => 
    entry[0].startsWith('ingredient') && entry[1] !== '')
    .map(ing => {
      const ingArr =  ing[1].split(',').map(el => el.trim());

      if(ingArr.length !== 3) throw new Error('Wrong ingredient format, Please use the correct format')
      
      const [quantity, unit, description] = ingArr; 
      
      return {quantity: quantity ? +quantity : null, unit, description}

    });
  
  const recipe = {
    title: newRecipe.title,
    sourceUrl: newRecipe.sourceUrl,
    imageUrl: newRecipe.image,
    publisher: newRecipe.publisher,
    cookingTime: +newRecipe.cookingTime,
    servings: +newRecipe.servings,
    ingredients,
  }
  
  const data = await AJAX(API_URL, recipe)

  state.recipe = createRecipeObject(data);

  await addBookmark(state.recipe);

} catch(err) {
  throw err; 
}
}