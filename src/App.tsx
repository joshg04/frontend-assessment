import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PokemonListPage } from './screens/PokemonListPage';
import { LayoutWrapper } from './LayoutWrapper';
import { ApolloProvider } from '@apollo/client/react';
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { HomePage } from './screens/HomePage';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://graphql.pokeapi.co/v1beta2',
  }),
  cache: new InMemoryCache(),
});

const App = () => (
  <ApolloProvider client={client}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutWrapper />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/list" element={<PokemonListPage />} />
          <Route path="/list/pokemon/:id" element={<PokemonListPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </ApolloProvider>
);

export default App;
