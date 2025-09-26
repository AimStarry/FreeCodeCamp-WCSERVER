require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();


const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


let urlDatabase = [];
let idCounter = 1;


app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  
  try {
    let urlObj = new URL(originalUrl);

    dns.lookup(urlObj.hostname, (err, address) => {
      if (err) {
        res.json({ error: 'invalid url' });
      } else {
        
        let found = urlDatabase.find(u => u.original_url === originalUrl);
        if (found) {
          res.json(found);
        } else {
          let newUrl = {
            original_url: originalUrl,
            short_url: idCounter++
          };
          urlDatabase.push(newUrl);
          res.json(newUrl);
        }
      }
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  let shortUrl = parseInt(req.params.short_url);
  let found = urlDatabase.find(u => u.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
