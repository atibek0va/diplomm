import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import AiScannerPage from './pages/AiScannerPage';
import HomePage from './pages/HomePage';
import ProductSearchPage from './pages/ProductSearchPage';
import ProfilePage from './pages/ProfilePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RecipePage from './pages/RecipePage';
import SettingsPage from './pages/SettingsPage';
import MainPage from './pages/MainPage';
import Calendar from './pages/Calendar';
import './styles/theme.css';
import { withAuth } from './utils/auth';

export const AuthContext = React.createContext({
  isAuthenticated: false,
  isLoading: true,
  refreshAuth: () => {}
});

const App = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false, // No authentication by default
    isLoading: false, // No loading state as we don't need to load auth
    user: null
  });

  const refreshAuth = async () => {
    setAuthState({
      ...authState,
      isLoading: true
    });
    
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(`http://localhost:8080/check-auth?t=${timestamp}`, { 
        withCredentials: true 
      });
      
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.data.user || null
      });
      
      return true;
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null
      });
      
      return false;
    }
  };

  
  return (
    <AuthContext.Provider value={{ ...authState, refreshAuth }}>
      <ThemeProvider>
        <Router>
          <div className="app-container">
            <main>
              {authState.isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                  </div>
                </div>
              ) : (
                <Switch>
                  <Route path="/recipe/:recipeId/:fromList" component={RecipeDetailPage} />
                  <Route path="/recipe/:recipeId" component={(RecipeDetailPage)} />
                  <Route path="/recipes" component={(RecipePage)} />
                  <Route path="/profile" component={(ProfilePage)} />
                  <Route path="/product-search" component={(ProductSearchPage)} />
                  <Route path="/ai-scanner" component={(AiScannerPage)} />
                  <Route path="/calendar" component={(Calendar)} />
                  <Route path="/settings" component={(SettingsPage)} />
                  <Route path="/homePage" component={(HomePage)}/> 
                  <Route path="/" component={(MainPage)}/>
                </Switch>
              )}
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

export default App;
