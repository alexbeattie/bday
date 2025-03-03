'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [name, setName] = useState('');
  const [celebrantName, setCelebrantName] = useState('Shafali'); // Change to the birthday person's name

  return (
    <div className="min-h-screen p-4 flex flex-col justify-center items-center bg-[#fefcff]">
      <main className="py-16 flex-1 flex flex-col justify-center items-center text-center max-w-4xl">
        <h1 className="m-0 text-5xl font-bold bg-gradient-to-r from-[#ff6b6b] via-[#ff9e7d] to-[#ffd670] text-transparent bg-clip-text">
         Birthday <span className="text-[#ff6b6b]">{celebrantName}</span>!
        </h1>

        <p className="mt-6 text-xl">
          Help us celebrate {celebrantName}'s !
        </p>

        <div className="mt-8 p-6 text-left bg-white rounded-lg shadow-md w-full max-w-md">
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 font-medium">Your Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border border-gray-300 rounded-md text-base mb-4"
            />
          </div>

          <Link href="/upload">
            <button className="w-full bg-gradient-to-r from-[#ff6b6b] to-[#ff9e7d] text-white border-none py-3 px-6 rounded-md text-base cursor-pointer transition-all hover:translate-y-[-2px] hover:shadow-md">
              Share Photos
            </button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-white/80 rounded-lg shadow-sm">
          <h2>Celebrating on April 7, 2025!</h2>
        </div>
      </main>

      <footer className="w-full h-24 border-t border-gray-200 flex justify-center items-center mt-8">
        {/* <p>With love from all of {celebrantName}'s friends and family ❤️</p> */}
      </footer>
    </div>
  );
}
