//& Lesson: Helpers and Configuration files
//~ this file holds all of the constants that we use across the project.
//~ with this variables we can change the configuration of our project.


export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

export const API_URL = `${API_BASE_URL}/recipes`;

export const TIMEOUT_SEC = 10;

export const RESULTS_PER_PAGE = 10;

export const MODAL_CLOSE_SEC = 2.5;