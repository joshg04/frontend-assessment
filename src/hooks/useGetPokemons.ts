import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export interface Pokemon {
  id: string;
  name: string;
  types?: string[];
  sprite?: string;
}

export interface PokemonDetail extends Pokemon {
  weight?: number;
  height?: number;
  captureRate?: number;
  stats?: Array<{ name: string; value: number }>;
}

export const GET_POKEMONS = gql`
  query GetPokemons($search: String) {
    pokemon(
      limit: 151
      order_by: { id: asc }
      where: {
        pokemonspecy: {
          pokemonspeciesnames: { language: { name: { _eq: "en" } }, name: { _regex: $search } }
        }
      }
    ) {
      id
      pokemonspecy {
        pokemonspeciesnames(where: { language: { name: { _eq: "en" } } }) {
          name
        }
      }
      pokemonsprites {
        sprites(path: "other.official-artwork.front_default")
      }
      pokemontypes {
        type {
          typenames(where: { language: { name: { _eq: "en" } } }) {
            name
          }
        }
      }
    }
  }
`;

export const GET_POKEMON_DETAILS = gql`
  query GetPokemonDetails($id: Int!) {
    pokemon(where: { id: { _eq: $id } }) {
      id
      pokemonspecy {
        pokemonspeciesnames(where: { language: { name: { _eq: "en" } } }) {
          name
        }
        capture_rate
      }
      pokemonsprites {
        sprites(path: "other.official-artwork.front_default")
      }
      pokemontypes {
        type {
          typenames(where: { language: { name: { _eq: "en" } } }) {
            name
          }
        }
      }
      weight
      height
      pokemonstats {
        base_stat
        stat {
          name
        }
      }
    }
  }
`;

// Search should be done client-side for the mid-level assessment. Uncomment for the senior assessment.
export const useGetPokemons = (
  detailId?: string, // pass in detailId to grab pokemon detail
): {
  data: Pokemon[];
  loading: boolean;
  error: useQuery.Result['error'];
  detail: PokemonDetail | null;
  detailLoading: boolean;
  detailError: useQuery.Result['error'];
} => {
  const { data, loading, error } = useQuery<{ pokemon: any[] }>(GET_POKEMONS, {
    variables: {
      search: '', // `.*${search}.*`,
    },
  });

  const shouldSkipDetail = !detailId || Number.isNaN(parseInt(detailId, 10));
  const {
    data: detailData,
    loading: detailLoading,
    error: detailError,
  } = useQuery<{ pokemon: any[] }>(GET_POKEMON_DETAILS, {
    variables: { id: parseInt(detailId || '0', 10) },
    skip: shouldSkipDetail,
  });

  return {
    data:
      data?.pokemon?.map(
        (p): Pokemon => ({
          id: p.id,
          name: p.pokemonspecy.pokemonspeciesnames?.[0]?.name,
          types: p.pokemontypes?.map((pt: any) => pt.type?.typenames?.[0]?.name),
          sprite: p.pokemonsprites?.[0]?.sprites,
        }),
      ) ?? [],
    loading,
    error,
    detail: detailData?.pokemon?.[0]
      ? {
          id: detailData.pokemon[0].id,
          name: detailData.pokemon[0].pokemonspecy.pokemonspeciesnames?.[0]?.name,
          types: detailData.pokemon[0].pokemontypes?.map(
            (pt: any) => pt.type?.typenames?.[0]?.name,
          ),
          sprite: detailData.pokemon[0].pokemonsprites?.[0]?.sprites,
          weight: detailData.pokemon[0].weight,
          height: detailData.pokemon[0].height,
          captureRate: detailData.pokemon[0].pokemonspecy.capture_rate,
          stats: detailData.pokemon[0].pokemonstats?.map((ps: any) => ({
            name: ps.stat.name,
            value: ps.base_stat,
          })),
        }
      : null,
    detailLoading: shouldSkipDetail ? false : detailLoading,
    detailError: shouldSkipDetail ? undefined : detailError,
  };
};
