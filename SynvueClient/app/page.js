import React from 'react';
import Home from './_component/Home';
import { useUser } from "@clerk/nextjs";
import Sidebar from './_component/Sidebar';
import Dashboard from './_component/Dashboard';
const Page = async () => {
const user = useUser();
  return (
    <div className="h-100vh flex ">
      {!user ? (
        <>
          <Sidebar />
          <main className="w-full md:ml-60 transition-all duration-300">
            <Home />
          </main>
        </>
      ) : (
        <main className="flex justify-center md:ml-64 md:mt-18 p-4 items-center w-full h-100vh bg-transparent text-xl text-black">
        <Sidebar/>
        <Dashboard/>
        </main>
      )}
    </div>
  );
};

export default Page;
