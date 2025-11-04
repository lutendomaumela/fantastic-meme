import React, { useContext, useEffect, useState } from 'react';
import { ThemeContext, ThemeProvider } from './ThemeContext';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import FontAwesome

const App = () => {
  const [meme, setMeme] = useState('');
  const [joke, setJoke] = useState('');
  const { theme, setTheme } = useContext(ThemeContext);

  const fetchMeme = async () => {
    const response = await fetch('https://api.humorapi.com/memes/random', {
      headers: {
        'X-API-Key': 'a7ee39145c754e84afb61e114e5786c8' // Replace with your API key
      }
    });
    const data = await response.json();
    console.log('Humor API response:', data); // Log the response to check the structure
    setMeme(data.url); // Ensure the path is correct
  };

  const fetchJoke = async () => {
    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const data = await response.json();
    setJoke(data.setup + ' - ' + data.punchline);
  };

  useEffect(() => {
    fetchMeme();
    fetchJoke();
  }, []);

  return (
    <>
      <div className="header-container">
        <header className={`header ${theme === 'light' ? 'light-mode' : 'dark-mode'}`}>
          <h1>😂 House of Laughter 😂</h1> {/* Added laughing emoji */}
        </header>
        <p className="description">
          Welcome to the House of Laughter! Here, you'll find a treasure trove of hilarious memes and jokes 
          that are sure to brighten your day. Whether you need a quick laugh or a prolonged giggle, 
          we've got you covered. Dive in and let the joy flow! 🌟
        </p>
      </div>
      <div className={`container ${theme === 'light' ? 'light-mode' : 'dark-mode'}`}>
        <button className={`toggle ${theme}`} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
        </button>
        <div className="card">
          <h2 className={theme === 'light' ? 'light-mode' : 'dark-mode'}>Meme for you</h2>
          <img src={meme} alt="Meme" className="meme-image" />
          <div className="button-container">
            <button className="primary" onClick={fetchMeme}>Get New Meme</button> {/* Centered button below image */}
          </div>
        </div>
        <div className="card">
          <h2 className={theme === 'light' ? 'light-mode' : 'dark-mode'}>Random Joke:</h2>
          <p className={theme === 'light' ? 'light-mode' : 'dark-mode'}>{joke}</p>
          <button className="primary" onClick={fetchJoke}>Get New Joke</button>
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





