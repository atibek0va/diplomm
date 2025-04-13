import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
    }

    const fetchSettings = async () => {
      try {
        const response = await axios.get('http://localhost:8080/settings', {
          withCredentials: true
        });
        
        if (response.data && response.data.theme) {
          setTheme(response.data.theme);
          localStorage.setItem('theme', response.data.theme);
          document.body.setAttribute('data-theme', response.data.theme);
        }
      } catch (error) {
        console.error('Не удалось загрузить настройки:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    try {
      await axios.put('http://localhost:8080/settings', {
        theme: newTheme
      }, {
        withCredentials: true
      });
      
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
      document.body.setAttribute('data-theme', newTheme);
    } catch (error) {
      console.error('Не удалось обновить настройки темы:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};