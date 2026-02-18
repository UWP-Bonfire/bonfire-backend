
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from '../Layout';

describe('Layout component', () => {
  it('renders its children', () => {
    const ChildComponent = () => <div>Child Component</div>;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<ChildComponent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });
});
