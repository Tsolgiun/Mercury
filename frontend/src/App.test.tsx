import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders main navigation element', () => {
  render(<App />);
  const mainElement = screen.getByText(/Loading posts.../i);
  expect(mainElement).toBeInTheDocument();
});
