export type MovieCategory = 'popular' | 'top_rated' | 'now_playing' | 'upcoming';

export interface GenreDTO {
  id: number;
  name: string;
}

export interface MovieDTO {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  adult?: boolean;
  original_language?: string;
}

export interface ProductionCompanyDTO {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface MovieDetailsDTO {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  tagline: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime: number | null;
  status: string;
  genres: GenreDTO[];
  production_companies?: ProductionCompanyDTO[];
  budget?: number;
  revenue?: number;
  homepage?: string | null;
  original_language?: string;
}

export interface CastMemberDTO {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface MovieCreditsDTO {
  id: number;
  cast: CastMemberDTO[];
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}
