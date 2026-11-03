import React from 'react';
import { SimpleProvider } from './context/SimpleContext';
import { SimpleApp } from './SimpleApp';

export default function App() {
  return (
    <SimpleProvider>
      <SimpleApp />
    </SimpleProvider>
  );
}
