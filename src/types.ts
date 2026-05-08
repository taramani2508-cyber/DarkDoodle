export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  genres: Array<{ id: number; name: string }>;
  runtime: number;
  tagline: string;
  original_language: string;
  videos?: {
    results: Array<{
      key: string;
      site: string;
      type: string;
    }>;
  };
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }>;
  };
  'watch/providers'?: {
    results: Record<string, {
      flatrate?: Array<{ provider_name: string; logo_path: string; provider_id: number }>;
      rent?: Array<{ provider_name: string; logo_path: string; provider_id: number }>;
      buy?: Array<{ provider_name: string; logo_path: string; provider_id: number }>;
      link: string;
    }>;
  };
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}
