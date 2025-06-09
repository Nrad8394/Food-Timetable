"use client";
import React from 'react';

interface HeroProps {
  children?: React.ReactNode;
}

export default function Hero( { children }: HeroProps) {
  return (
    // <section className="text-center py-20 bg-gradient-to-br from-yellow-100 via-rose-100 to-pink-200 rounded-lg shadow-md">
    <section className="text-center py-20 bg-white rounded-lg shadow-md">

      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6">
        🍽️ My weekly food planner
      </h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-4">
        Start every day with a plan — organize your breakfast, lunch, and dinner effortlessly.
      </p>
      <p className="text-md md:text-lg text-gray-600 max-w-2xl mx-auto">
        Whether you're cooking solo or feeding a family, our app helps you keep meals exciting, balanced, and always on time.
      </p>
    </section>
)};