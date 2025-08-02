import React, { createContext, useContext, useState } from 'react';

// Создание контекста поиска
const SearchContext = createContext();

// Хук для использования контекста поиска
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch должен использоваться внутри SearchProvider');
  }
  return context;
};

// Провайдер контекста поиска
export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const updateSearch = (query) => {
    setSearchQuery(query);
    setIsSearchActive(!!query.trim());
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };

  const value = {
    searchQuery,
    isSearchActive,
    updateSearch,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
