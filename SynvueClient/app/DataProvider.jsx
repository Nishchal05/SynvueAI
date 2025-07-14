"use client";

import { useUser } from "@clerk/nextjs";
import React, { createContext, useEffect, useState } from "react";

export const DataContext = createContext();

const DataProvider = ({ children }) => {
  const { user} = useUser();
  const [view, setView] = useState(false);
  const [minutes, setminutes] = useState(0);
  const [userprofile, setuserprofile]=useState(null);
  return (
    <DataContext.Provider value={{ view, setView, minutes, setminutes, userprofile, setuserprofile}}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
