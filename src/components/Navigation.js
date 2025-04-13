// import { useContext } from 'react';
// import { Container, Nav, Navbar } from 'react-bootstrap';
// import { Link, useLocation } from 'react-router-dom';
// import { ThemeContext } from '../contexts/ThemeContext';

// const Navigation = () => {
//   const { theme } = useContext(ThemeContext);
//   const location = useLocation();
  
//   if (location.pathname === '/') {
//     return null;
//   }
  
//   return (
//     <Navbar bg={theme === 'dark' ? 'dark' : 'light'} variant={theme === 'dark' ? 'dark' : 'light'} expand="lg">
//       <Container>
//         <Navbar.Brand as={Link} to="/">
//           <span style={{ color: '#2E8B57', fontWeight: 'bold' }}>Nutri</span>
//           <span style={{ color: '#4682B4', fontWeight: 'bold' }}>Mind</span>
//         </Navbar.Brand>
//         <Navbar.Toggle aria-controls="basic-navbar-nav" />
//         <Navbar.Collapse id="basic-navbar-nav">
//           <Nav className="ms-auto">
//             <Nav.Link as={Link} to="/recipes">Рецепты</Nav.Link>
//             <Nav.Link as={Link} to="/profile">Профиль</Nav.Link>
//             <Nav.Link as={Link} to="/product-search">Поиск продуктов</Nav.Link>
//             <Nav.Link as={Link} to="/settings">Настройки</Nav.Link>
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// };

// export default Navigation;