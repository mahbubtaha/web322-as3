/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part * of this assignment has
been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.
Name:                   Mahbub Taha
Student ID:             108106238
Date:                   March 5th, 2025
Vercel Web App URL:     https://web322-eight-smoky.vercel.app/
GitHub Repository URL:  https://github.com/mahbubtaha/web322
********************************************************************************/
const path = require("path");
const express = require("express");
const storeService = require('./store-service.js')
const multer = require("multer");
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: 'dmbzenkoc',
  api_key: '573716817138661',
  api_secret: 'u4bn6xXu7xLJs3gOGUCDjJZZxq8',
  secure: true
});

const upload = multer(); 

// Initialize the store service
storeService
  .initialize()
  .then(() => {
    //Listen on port 8080
    app.listen(HTTP_PORT, () =>
      console.log(
        `"Express http server listening on port: \u001b[1;3;4;92mhttp://localhost:${HTTP_PORT}\u001b[0m`
      )
    );
  })
  .catch((err) => {
    // Log the error
    console.error("ERROR: Initialization Failure:", err);
    // Exit the process
    process.exit(1);
  });

app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "/views"));

// ROUTES
// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get('/shop', (req, res) => {
  storeService.getPublishedItems()
      .then(items => {
          /* send data to the client */
          res.json(items);
      })
      .catch(err => {
          /* return err message in the format: {message: err} */
          res.status(500).json({ message: err });
      });
});

app.get('/items', (req, res) => {
  if (req.query.category) {
      const category = parseInt(req.query.category);
      if (isNaN(category) || category < 1 || category > 5) {
          return res.status(400).json({ message: "Invalid category value" });
      }
      storeService.getItemsByCategory(category)
          .then(items => res.json(items))
          .catch(err => res.status(404).json({ message: err }));
  } 
  else if (req.query.minDate) {
      if (!storeService.isValidDate(req.query.minDate)) {
          return res.status(400).json({ message: "Invalid date format (Use YYYY-MM-DD)" });
      }
      storeService.getItemsByMinDate(req.query.minDate)
          .then(items => res.json(items))
          .catch(err => res.status(404).json({ message: err }));
  } 
  else {
      storeService.getAllItems()
          .then(items => {
              /* send data to the client */
              res.json(items);
          })
          .catch(err => {
              /* return err message in the format: {message: err} */
              res.status(500).json({ message: err });
          });
  }
});

app.get('/items/add', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/addItem.html'));
});

app.post('/items/add', upload.single("featureImage"), function (req, res, next) {
  if(req.file) {
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                      if (result) {
                          resolve(result);
                      } else {
                          reject(error);
                      }
                  }
              );
  
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };
  
      async function upload(req) {
          let result = await streamUpload(req);
          console.log(result);
          return result;
      }
  
      upload(req).then((uploaded)=>{
          processItem(uploaded.url);
      });
  }
  else {
      processItem("");
  }
   
  function processItem(imageUrl){
      req.body.featureImage = imageUrl;
  
      req.body.published = req.body.published ? true : false;
          
      storeService.addItem(req.body)
          .then(() => resolve())
          .catch(err => res.status(500).json({ message: err }));
  } 
});

app.get('/item/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  
  if (isNaN(itemId) || itemId < 1) {
      return res.status(400).json({ message: "Invalid item ID" });
  }

  storeService.getItemById(itemId)
      .then(item => res.json(item))
      .catch(err => {
          if (err === "no results returned") {
              res.status(404).json({ message: err });
          }
      });
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
      .then(categories => {
          res.json(categories);
      })
      .catch(err => {
          res.status(500).json({ message: err });
      });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '/views/404_page.html'));
});