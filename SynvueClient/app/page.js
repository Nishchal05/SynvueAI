import React from 'react';
import Home from './_component/Home';
import { currentUser } from '@clerk/nextjs/server';
import Sidebar from './_component/Sidebar';
import Dashboard from './_component/Dashboard';
const Page = async () => {
const user = await currentUser();
  return (
    <div className="min-h-screen flex bg-gray-100">
      {!user ? (
        <>
          <Sidebar />
          <main className="w-full md:ml-60 transition-all duration-300">
            <Home />
          </main>
        </>
      ) : (
        <main className="flex justify-center md:ml-64 md:mt-18 p-4 items-center w-full h-screen text-xl text-black">
        <Sidebar/>
        <Dashboard/>
        </main>
      )}
    </div>
  );
};

export default Page;
