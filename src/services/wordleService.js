// src/services/WordleService.js
import axios from 'axios';

const API_ENDPOINT = 'https://wordle-apis.vercel.app/api/validate';

const validateWordleGuess = async (guess) => {
  try {
    const response = await axios.post(API_ENDPOINT, { guess });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error validating Wordle guess:', error);
    throw error;
  }
};

export { validateWordleGuess };
