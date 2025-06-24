'use client';

import React, { createContext, useState } from 'react';

export const DataContext = createContext();

const DataProvider = ({ children }) => {
  const [view, setView] = useState(false);
  return (
    <DataContext.Provider value={{ view, setView}}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
