import axios from 'axios';
import { Movie, MovieDetails } from '../types';

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || "11216cd2be65f89b88083329dd8149d9";
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_KEY,
  },
});

export const getTrendingMovies = async (language: string = 'en-US', page: number = 1): Promise<Movie[]> => {
  const { data } = await tmdb.get('/trending/movie/week', {
    params: { language, page },
  });
  return data.results;
};

export const getDiscoverMovies = async (genreIds: number[], language: string = 'en-US', page: number = 1): Promise<Movie[]> => {
  const { data } = await tmdb.get('/discover/movie', {
    params: {
      with_genres: genreIds.join(','),
      language,
      page,
      sort_by: 'popularity.desc',
      include_adult: false,
    },
  });
  return data.results;
};

export const getMoviesByOriginalLanguage = async (origLang: string, language: string = 'en-US', page: number = 1): Promise<Movie[]> => {
  const { data } = await tmdb.get('/discover/movie', {
    params: {
      with_original_language: origLang,
      language,
      page,
      sort_by: 'popularity.desc',
      include_adult: false,
    },
  });
  return data.results;
};

export const getMovieVideos = async (movieId: number, language: string = 'en-US'): Promise<any[]> => {
  try {
    // Primary fetch with user language
    const { data: primaryData } = await tmdb.get(`/movie/${movieId}/videos`, {
      params: { language },
    });

    if (primaryData.results && primaryData.results.length > 0) {
      return primaryData.results;
    }

    // Fallback: try English
    const { data: fallbackData } = await tmdb.get(`/movie/${movieId}/videos`, {
      params: { language: 'en-US' },
    });

    return fallbackData.results || [];
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    return [];
  }
};

export const getMovieDetails = async (movieId: number, language: string = 'en-US'): Promise<MovieDetails> => {
  const { data } = await tmdb.get(`/movie/${movieId}`, {
    params: {
      language,
      append_to_response: 'videos,credits,watch/providers',
    },
  });
  return data;
};

export const searchMovies = async (query: string, language: string = 'en-US', page: number = 1): Promise<Movie[]> => {
  const { data } = await tmdb.get('/search/movie', {
    params: {
      query,
      language,
      page,
      include_adult: false,
    },
  });
  return data.results;
};

export const getRecommendations = async (movieId: number, language: string = 'en-US'): Promise<Movie[]> => {
  const { data } = await tmdb.get(`/movie/${movieId}/recommendations`, {
    params: { language },
  });
  return data.results;
};
