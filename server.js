const express = require('express');
const router = express.Router();
const app = express();
const path = require('path');

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});


app.use(express.static('public'));



app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });