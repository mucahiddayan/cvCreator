const express = require('express');
const router = express.Router();
const app = express();
const http = require('http');
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

var storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
var upload = multer({ storage: storage })

app.get('/', (req, res)=> {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});


app.use(express.static('public'));

/* app.get('/uploads',(req,res)=>{
    fs.readdir('./public/uploads',(err,files)=>{
        console.log(files);
    });
}); */

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
  });

app.post('/upload',upload.single('file'), function(req,res,next){
    console.log('Uploade Successful ', req.file, req.body);
    if(!req){
        res.status(500).send({ error: 'No file selected' })
    }else{
        res.sendStatus(200);
    }
});