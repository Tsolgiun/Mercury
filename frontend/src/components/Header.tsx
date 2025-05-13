import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setCurrentUser } from '../redux/slices/userSlice';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #333;
  color: white;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #555;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #555;
  }
`;

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(setCurrentUser(null));
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <Logo to="/">Mercury</Logo>
      <Nav>
        <NavLink to="/">Home</NavLink>
        {currentUser ? (
          <>
            <NavLink to="/profile">Profile</NavLink>
            {currentUser.isAdmin && <NavLink to="/admin">Admin</NavLink>}
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </Nav>
    </HeaderContainer>
  );
};

export default Header;
