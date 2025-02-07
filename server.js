const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Ustawienia middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Strona główna
app.get('/', (req, res) => {
  if (req.cookies.user) {
    res.send(`<h1>Witaj, ${req.cookies.user}!</h1><a href='/logout'>Wyloguj się</a>`);
  } else {
    res.send(`
      <h1>Witaj, gościu!</h1>
      <a href='/login'>Zaloguj się</a>
    `);
  }
});

// Strona logowania
app.get('/login', (req, res) => {
  res.send(`
    <h1>Logowanie</h1>
    <form action='/login' method='POST'>
      <input type='text' name='username' placeholder='Wprowadź nazwę użytkownika' required>
      <input type='password' name='password' placeholder='Wprowadź hasło' required>
      <button type='submit'>Zaloguj się</button>
    </form>
  `);
});

// Obsługa logowania
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Prosta weryfikacja loginu (w rzeczywistości należałoby to zrobić bezpieczniej)
  if (username === 'admin' && password === 'password') {
    res.cookie('user', username); // Zapisanie nazwy użytkownika w ciasteczkach
    res.redirect('/');
  } else {
    res.send(`
      <h1>Błędne dane logowania</h1>
      <a href='/login'>Spróbuj ponownie</a>
    `);
  }
});

// Wylogowanie
app.get('/logout', (req, res) => {
  res.clearCookie('user'); // Usunięcie ciasteczka
  res.redirect('/');
});

// Uruchomienie serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});