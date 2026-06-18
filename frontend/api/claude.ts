const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getRecipes = async (region?: string) => {
  const url = region
    ? `${API_URL}/recipes?region=${encodeURIComponent(region)}`
    : `${API_URL}/recipes`;
  const response = await fetch(url);
  const data = await response.json();
  return data.recipes ?? [];
};

export const getRecipeDetail = async (recipeId: number) => {
  const response = await fetch(`${API_URL}/recipes/${recipeId}`);
  const data = await response.json();
  return data;
};

export const getRecommendedRecipes = async (userId: number) => {
  const response = await fetch(`${API_URL}/recipes/recommended?user_id=${userId}`);
  const data = await response.json();
  return data;
};

export const followRecipe = async (userId: number, recipeId: number) => {
  const response = await fetch(`${API_URL}/recipe-follows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, recipe_id: recipeId }),
  });
  return response.json();
};

export const getMadeRecipes = async (userId: number) => {
  const response = await fetch(`${API_URL}/users/${userId}/recipes/made`);
  const data = await response.json();
  return data.recipes ?? [];
};

export const getFollowedRecipes = async (userId: number) => {
  const response = await fetch(`${API_URL}/users/${userId}/recipes/followed`);
  const data = await response.json();
  return data.recipes ?? [];
};

export const savePreferences = async (payload: {
  user_id: number;
  preferred_region: string;
  preferred_food_type: string;
  preferred_difficulty: number;
}) => {
  const response = await fetch(`${API_URL}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
};
