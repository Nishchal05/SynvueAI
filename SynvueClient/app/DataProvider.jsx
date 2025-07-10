"use client";

import { useUser } from "@clerk/nextjs";
import React, { createContext, useEffect, useState } from "react";

export const DataContext = createContext();

const DataProvider = ({ children }) => {
  const { user} = useUser();
  const [view, setView] = useState(false);
  const [minutes, setminutes] = useState(0);
  const [userprofile, setuserprofile]=useState(null);
  const handleminutes = async (emailToUse) => {
    try {
      const response = await fetch("/api/createuser", {
        method: "PUT",
        body: JSON.stringify({ minutes, email: emailToUse }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result?.message) {
        console.log(result?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      handleminutes(user.primaryEmailAddress.emailAddress);
    }
  }, [minutes]);

  return (
    <DataContext.Provider value={{ view, setView, minutes, setminutes, userprofile, setuserprofile}}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
