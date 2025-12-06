import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tss } from '../tss';
import { useGetPokemons } from 'src/hooks/useGetPokemons';
import { Modal } from 'antd';

export const PokemonListPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const { id } = useParams();
  const [search, setSearch] = React.useState('');
  const {
    data,
    loading,
    error,
    detail: pokemon,
    detailLoading: pokemonLoading,
    detailError: pokemonError,
  } = useGetPokemons(id);

  // Filter data set for querying
  const filteredData = React.useMemo(() => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(searchLower);
      const idMatch = p.id?.toString().includes(search);
      const typeMatch = p.types?.some((type) => type?.toLowerCase().includes(searchLower));
      return nameMatch || idMatch || typeMatch;
    });
  }, [data, search]);

  // Handle loading
  if (loading) {
    return <div className={classes.root}>Loading...</div>;
  }

  // Handle error
  if (error) {
    return <div className={classes.root}>Error: {error.message}</div>;
  }

  const handleCloseModal = () => {
    navigate('/list');
  };

  return (
    <div>
      <div className={classes.searchContainer}>
        <input
          type="search"
          placeholder="Search Pokemon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={classes.searchInput}
        />
      </div>
      <div className={classes.root}>
        {filteredData && filteredData.length > 0 ? (
          <div className={classes.gridContainer}>
            {filteredData.map((d) => (
              <div
                key={d.id}
                className={classes.pokemonWrapper}
                onClick={() => navigate(`/list/pokemon/${d.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/list/pokemon/${d.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div>
                  <span>#{d.id}</span> <span>{d.name}</span>
                </div>
                <div>{d.types?.join(', ')}</div>
                <img src={d.sprite} alt={d.name} className={classes.pokemonImage} />
              </div>
            ))}
          </div>
        ) : (
          <div className={classes.noResults}>
            <p>No Pokemon found</p>
          </div>
        )}
      </div>
      {/* modal that opens when pokemon is clicked */}
      <Modal open={!!id} onCancel={handleCloseModal} footer={null} width={600} centered>
        {pokemonLoading && <div>Loading...</div>}
        {pokemonError && <div>Error: {pokemonError.message}</div>}
        {!pokemonLoading && !pokemonError && !pokemon && <div>Pokemon not found</div>}
        {!pokemonLoading && !pokemonError && pokemon && (
          <div className={classes.modalContent}>
            <div className={classes.header}>
              <h2>
                #{pokemon.id} {pokemon.name}
              </h2>
              <div className={classes.types}>
                {pokemon.types?.map((type: string) => (
                  <span key={type} className={classes.typeBadge}>
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {pokemon.sprite && (
              <img src={pokemon.sprite} alt={pokemon.name} className={classes.sprite} />
            )}

            <div className={classes.info}>
              <div className={classes.infoItem}>
                <strong>Height:</strong> {pokemon.height ? pokemon.height / 10 : 'N/A'} m
              </div>
              <div className={classes.infoItem}>
                <strong>Weight:</strong> {pokemon.weight ? pokemon.weight / 10 : 'N/A'} kg
              </div>
              <div className={classes.infoItem}>
                <strong>Capture Rate:</strong> {pokemon.captureRate ?? 'N/A'}
              </div>
            </div>

            {pokemon.stats && pokemon.stats.length > 0 && (
              <div className={classes.stats}>
                <h3>Stats</h3>
                {pokemon.stats.map((stat: { name: string; value: number }) => (
                  <div key={stat.name} className={classes.statRow}>
                    <span className={classes.statName}>{stat.name}:</span>
                    <span className={classes.statValue}>{stat.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const useStyles = tss.create(({ theme }) => ({
  root: {
    color: theme.color.text.primary,
  },
  searchContainer: {
    marginBottom: '20px',
    padding: '0 16px',
  },
  searchInput: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid white',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: theme.color.text.primary,
  },
  noResults: {
    textAlign: 'center',
    padding: '60px 20px',
    color: theme.color.text.primary,
    '& p': {
      margin: '10px 0',
      fontSize: '18px',
    },
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '16px',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  pokemonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    border: '1px solid white',
    padding: '12px',
    width: '150px',
    height: '150px',
    cursor: 'pointer',
    '&:hover': {
      borderColor: '#00bcd4',
    },
  },
  pokemonImage: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    flexShrink: 0,
  },
  modalContent: {
    marginTop: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  types: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    marginTop: '10px',
  },
  typeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '14px',
    textTransform: 'capitalize',
    border: '1px solid #d9d9d9',
  },
  sprite: {
    display: 'block',
    margin: '0 auto',
    maxWidth: '200px',
    height: 'auto',
  },
  info: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoItem: {
    fontSize: '16px',
  },
  stats: {
    marginTop: '20px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  statName: {
    textTransform: 'capitalize',
  },
  statValue: {
    fontWeight: 'bold',
  },
}));
