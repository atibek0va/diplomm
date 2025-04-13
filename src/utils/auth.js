import axios from 'axios';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const history = useHistory();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        const searchParams = new URLSearchParams(location.search);
        const loginSuccess = searchParams.get('login_success');
        
        if (loginSuccess === 'true') {
          history.replace(location.pathname);
        }

        try {
          const timestamp = new Date().getTime();
          const response = await axios.get(`http://localhost:8080/check-auth?t=${timestamp}`, { 
            withCredentials: true 
          });
          
          console.log('Auth check response:', response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check error:', error);
          history.push('/signin');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [history, location]);

    if (isLoading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh'}}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      );
    }

    return isAuthenticated ? <Component {...props} /> : null;
  };
}

export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    user: null
  });

  const checkAuth = async () => {
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

  useEffect(() => {
    checkAuth();
  }, []);

  return { ...authState, checkAuth };
}