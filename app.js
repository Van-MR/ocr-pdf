const express = require('express');
const fs = require('fs');
const multer = require('multer');
const { TesseractWorker } = require('tesseract.js');
const worker = new TesseractWorker();


//storage files to disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({ storage: storage }).single('avatar');

const app = express();
//template
app.set('view engine','ejs');

//public folder
app.use(express.static('public'));

//Route
app.get('/',(req,res) => {
  res.render('index')
})

app.get('/download',(req,res) => {
  const file = `${__dirname}/tesseract.js-ocr-result.pdf`
  res.download(file)
})


app.post('/upload',(req,res) => {
  upload(req,res,err => {
     fs.readFile(`./uploads/${req.file.originalname}`,(err,data) => {
        if(err) return console.log('file mistake' + err);
        worker
            .recognize(data,"eng",{ tessjs_create_pdf: "1"})
            .progress(progress => {
              console.log(progress);
            })
            .then(result => {
               res.send(result.text)
               //res.redirect('/download')
            })
            .finally(() => worker.terminate())
     });
  });
});

const PORT = 5000 || process.env.PORT;

app.listen(PORT, () => console.log(`app is running on port ${PORT}`));
