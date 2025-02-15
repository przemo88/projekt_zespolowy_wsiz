const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Ustawienia middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));


const mysql = require('mysql');


const db = mysql.createConnection({
    host: 'localhost', // Adres hosta (np. '127.0.0.1' lub 'localhost')
    user: 'root',      // Użytkownik MySQL
    password: '',      // Hasło do bazy (pozostaw pusty string, jeśli brak hasła)
    database: 'pliki' // Nazwa bazy danych
  });



  db.connect((err) => {
    if (err) {
      console.error('Błąd połączenia z bazą danych:', err.message);
      return;
    }
    console.log('Połączono z bazą danych MySQL!');
  });



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public')); 
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.send(`
        <h1>Serwer plików</h1>
        <ul>
            <li><a href='/pliki'>Zobacz listę plików</a></li>
            <li><a href='/dodaj_pliki'>Dodaj plik</a></li>
            <li><a href='/login'>Zaloguj</a></li>
            <li><a href='/modyfikacje'>Historia modyfikacji</a></li>
            </ul>
    `);
});

app.get('/dodaj_pliki', (req, res) => {
    res.send(`
        <h1>Dodaj plik</h1>
        <form action="/upload" method="POST" enctype="multipart/form-data">
            <label for="file">Wybierz plik:</label>
            <input type="file" name="file" id="file" required>
            <button type="submit">Prześlij plik</button>
        </form>
    `);
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nie wybrano pliku!');
    }
    let d = new Date();
        let yyyy = d.getFullYear();
        let mm = d. getMonth() + 1;
        let dd = d.getDate() + 1;

        let createdAtDate = `${yyyy}-${mm}-${dd}`;
    nazwa = req.file.originalname;
    const insertUser = `INSERT INTO historia (typ_operacji, nazwa_pliku, data_modyfikacji) VALUES (?, ?, ?)`;
    const userData = ['Dodanie', nazwa,`${createdAtDate}`];
    db.query(insertUser, userData, (err, result) => {
      if (err) {
        console.error('Błąd podczas dodawania danych:', err.message);
        return;
      }
      console.log('Dodano wpis do bazy', result.insertId);
    });

    res.send(`Plik ${req.file.originalname} został przesłany! <a href="/pliki">Zobacz pliki</a>`);
});

app.get('/pliki', (req, res) => {
    const uploadsDir = path.join(__dirname, 'public');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Nie udało się odczytać listy plików.');
        }
        const fileList = files
            .map(file => `<li><a href="/${file}" target="_blank">${file}</a></li>`)
            .join('');
        res.send(`
            <h1>Lista plików</h1>
            <ul>${fileList}</ul>
            <a href="/">Powrót do strony głównej</a>
        `);
    });
});



app.get('/modyfikacje', (req, res) => {
  db.query('SELECT * FROM historia', (err, results) => {
      if (err) {
          console.error('Błąd podczas pobierania danych:', err.message);
          return res.status(500).send('Błąd podczas pobierania danych.');
      }
      const rows = results.map(row => `
          <tr>
              <td>${row.typ_operacji}</td>
              <td>${row.nazwa_pliku}</td>
              <td>${row.data_modyfikacji}</td>
          </tr>
      `).join('');
      res.send(`
          <h1>Historia modyfikacji</h1>
          <table border="1">
              <tr>
                  <th>Typ operacji</th>
                  <th>Nazwa pliku</th>
                  <th>Data modyfikacji</th>
              </tr>
              ${rows}
          </table>
          <a href="/">Powrót do strony głównej</a>
      `);
  });
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
      res.redirect('/poufne');
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

  // Poufne dane
  app.get('/poufne', (req, res) => {
    res.send(`
        <p>Poufne informacje</p>
    `);
});

app.listen(3000, () => {
    console.log('Serwer działa na http://localhost:3000');
});