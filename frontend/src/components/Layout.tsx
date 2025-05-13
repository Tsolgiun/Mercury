import React from 'react';
import styled from 'styled-components';
import Header from './Header';

const Main = styled.main`
  min-height: calc(100vh - 64px);
  background-color: #f5f5f5;
`;

const Footer = styled.footer`
  padding: 1.5rem;
  background-color: #333;
  color: white;
  text-align: center;
`;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer>
        <p>&copy; {new Date().getFullYear()} Mercury MERN Stack App</p>
      </Footer>
    </>
  );
};

export default Layout;
