import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ThemeContext, ThemeProvider } from './ThemeContext';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Cache implementation
const createCache = (maxAge = 10 * 60 * 1000) => {
  return {
    get: (key) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) return null;
        
        const { value, timestamp } = JSON.parse(item);
        if (Date.now() - timestamp > maxAge) {
          localStorage.removeItem(key);
          return null;
        }
        return value;
      } catch {
        return null;
      }
    },
    set: (key, value) => {
      try {
        const item = JSON.stringify({
          value,
          timestamp: Date.now()
        });
        localStorage.setItem(key, item);
      } catch (error) {
        console.warn('Cache set failed:', error);
      }
    }
  };
};

const cache = createCache();

const App = () => {
  const [meme, setMeme] = useState('');
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState({ meme: false, joke: false });
  const [error, setError] = useState({ meme: '', joke: '' });
  const { theme, setTheme } = useContext(ThemeContext);

  const fetchMeme = useCallback(async (forceRefresh = false) => {
    if (loading.meme) return;
    
    setLoading(prev => ({ ...prev, meme: true }));
    setError(prev => ({ ...prev, meme: '' }));

    try {
      const cacheKey = 'cachedMeme';
      if (!forceRefresh) {
        const cachedMeme = cache.get(cacheKey);
        if (cachedMeme) {
          setMeme(cachedMeme);
          setLoading(prev => ({ ...prev, meme: false }));
          return;
        }
      }

      const response = await fetch('https://api.humorapi.com/memes/random', {
        headers: {
          'X-API-Key': 'a7ee39145c754e84afb61e114e5786c8'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load meme`);
      }

      const data = await response.json();
      
      if (data.url) {
        setMeme(data.url);
        cache.set(cacheKey, data.url);
      } else {
        throw new Error('No meme found');
      }
    } catch (error) {
      console.error('Error fetching meme:', error);
      setError(prev => ({ ...prev, meme: error.message }));
      
      const cachedMeme = cache.get('cachedMeme');
      if (cachedMeme) {
        setMeme(cachedMeme);
      }
    } finally {
      setLoading(prev => ({ ...prev, meme: false }));
    }
  }, [loading.meme]);

  const fetchJoke = useCallback(async (forceRefresh = false) => {
    if (loading.joke) return;
    
    setLoading(prev => ({ ...prev, joke: true }));
    setError(prev => ({ ...prev, joke: '' }));

    try {
      const cacheKey = 'cachedJoke';
      if (!forceRefresh) {
        const cachedJoke = cache.get(cacheKey);
        if (cachedJoke) {
          setJoke(cachedJoke);
          setLoading(prev => ({ ...prev, joke: false }));
          return;
        }
      }

      const response = await fetch('https://official-joke-api.appspot.com/random_joke');
      
      if (!response.ok) {
        throw new Error(`Failed to load joke`);
      }

      const data = await response.json();
      const jokeText = `${data.setup} - ${data.punchline}`;
      
      setJoke(jokeText);
      cache.set(cacheKey, jokeText);
    } catch (error) {
      console.error('Error fetching joke:', error);
      setError(prev => ({ ...prev, joke: error.message }));
      
      const cachedJoke = cache.get('cachedJoke');
      if (cachedJoke) {
        setJoke(cachedJoke);
      }
    } finally {
      setLoading(prev => ({ ...prev, joke: false }));
    }
  }, [loading.joke]);

  useEffect(() => {
    fetchMeme();
    fetchJoke();
  }, [fetchMeme, fetchJoke]);

  const refreshAll = () => {
    fetchMeme(true);
    fetchJoke(true);
  };

  return (
    <>
      <div className="header-container">
        <header className={`header ${theme === 'light' ? 'light-mode' : 'dark-mode'}`}>
          <h1>😂 House of Laughter 😂</h1>
        </header>
        <p className="description">
          Welcome to the House of Laughter! Here, you'll find a treasure trove of hilarious memes and jokes 
          that are sure to brighten your day. Whether you need a quick laugh or a prolonged giggle, 
          we've got you covered. Dive in and let the joy flow! 🌟
        </p>
      </div>
      
      <div className={`container ${theme === 'light' ? 'light-mode' : 'dark-mode'}`}>
        {/* Control Buttons Container */}
        <div className="control-buttons">
          <button 
            className="refresh-all" 
            onClick={refreshAll}
            disabled={loading.meme || loading.joke}
          >
            <i className="fas fa-sync-alt"></i> Refresh All
          </button>
          
          <button 
            className={`theme-toggle ${theme}`} 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
          >
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
          </button>
        </div>

        {/* Meme Card */}
        <div className="card">
          <h2 className={theme === 'light' ? 'light-mode' : 'dark-mode'}>
            Meme for you {loading.meme && <i className="fas fa-spinner fa-spin"></i>}
          </h2>
          
          {error.meme && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i> {error.meme}
            </div>
          )}
          
          {meme && !loading.meme ? (
            <img src={meme} alt="Meme" className="meme-image" />
          ) : (
            !error.meme && <div className="loading-placeholder">Loading meme...</div>
          )}
          
          <div className="button-container">
            <button 
              className="primary" 
              onClick={() => fetchMeme(true)}
              disabled={loading.meme}
            >
              {loading.meme ? 'Loading...' : 'Get New Meme'}
            </button>
          </div>
        </div>

        {/* Joke Card */}
        <div className="card">
          <h2 className={theme === 'light' ? 'light-mode' : 'dark-mode'}>
            Random Joke {loading.joke && <i className="fas fa-spinner fa-spin"></i>}
          </h2>
          
          {error.joke && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i> {error.joke}
            </div>
          )}
          
          <p className={`joke-text ${theme === 'light' ? 'light-mode' : 'dark-mode'}`}>
            {joke || (!loading.joke && !error.joke ? 'Loading joke...' : '')}
          </p>
          
          <button 
            className="primary" 
            onClick={() => fetchJoke(true)}
            disabled={loading.joke}
          >
            {loading.joke ? 'Loading...' : 'Get New Joke'}
          </button>
        </div>
      </div>
    </>
  );
};

function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default Root;