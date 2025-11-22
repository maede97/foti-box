import React from 'react';

export const H1: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <h1 className="font-heading mt-6 mb-4 max-w-4xl pt-8 text-3xl font-extrabold text-balance hyphens-auto">
      {children}
    </h1>
  );
};
