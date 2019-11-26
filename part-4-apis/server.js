const axios = require('axios');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const mongo = require('mongodb');

const mongoClient = mongo.MongoClient;
const app = express();
const server = http.createServer(app);

// Setting up our mongo database
const dbUrl = "mongodb://localhost:27017/memedb";
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// Variables to keep access of our database outside of our connection
let database;
let memeCollection;

mongoClient.connect(dbUrl, dbOptions, (err, db) => {
  if (err) throw err;
  // Grabs our database called memedb
  console.log("Database has been created.");
  let dbo = db.db("memedb");
  // Create a new collection called memes
  dbo.createCollection("memes", (err, db) => {
    if (err) throw err;
    console.log("Memes collection has been created.");
  });

  database = dbo;
  memeCollection = database.collection("memes");
});

// Server will always find an open port.
const port = process.env.PORT || 3001;
server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});

// Needed to process body parameters for POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

function sendToMemeDatabase(fields) {
  memeCollection.insertOne(fields, (err, res) => {
     if (err) throw err;
  });
}

function populateMemeFields(fields) {
  
}

app.get('/test', (req, res) => {
  sendToMemeDatabase({
    names: "Daniel Truong", 
    age: 19
  });
  res.sendStatus(200);
});

// TODO: Create an endpoing called /getmemes that sends the meme data from the database
// to the response. We want to use the find operation to retreive all of the documents 
// from the database. Then, we want to send our data to the response as string using
// JSON.stringify(data).
app.get('/getmemes', (req, res) => {
  // WHat should our query be if we want to retreive everything in our database?
  let query;
  // How do we use the find operaiton. We also want to make the data into an array so
  // consider using the .toArray function. 
  // (some collection).toArray((err, result) => {
  //    result represents the array
  // })
});

// TODO: Create an API endpoint using any of the APIs from the 
// https://github.com/public-apis/public-apis. Use this as an opportunity
// to learn how to use unfamiliar APIs (I'd recommend finding one that 
// does not reuqire an API key).


// TODO: Create an API endpoint called /bestmeme to grab the first meme given from the 
// get_memes endpoint for the api.imgflip.com host.
app.get('/bestmeme', (req, res) => {
    let meme;  
    axios.get("https://api.imgflip.com/get_memes").then(response => {
        meme = response.data.data.memes[0];
        res.send(meme);
    });
});

/*
 * TODO: Create a POST request that will have the JSON body formatted like
 * {
 *   template_id: [id],
 *   photoURL: [url of image],
 *   memeTexts: [array of text for the meme],
 *   user: [string of your name]
 * }
 * and creates the meme image. Once the image has been created, store it
 * in the instance variable, meme.
 */
let meme;
app.post('/upload', (req, res) => {
    // HINT: First step is to understand the imgflip API and make an object
    // that will be inputted in the caption_image endpoint from imgflip.
    const url = 'https://api.imgflip.com/caption_image';
    const params = req.body;
    const apiData = {
      template_id: params.template_id,
      username: config.username,
      password: config.password,
      text0: "hack school",
      text1: "works",
      text2: "doesn't work"
      // we will be using the boxes key instead of text0 and text1 since 
      // each memes takes in different amount of texts
      /*
      boxes: params.memeTexts.map((text) => {
        return { "text": text };
      })
      */
    };
    //res.send(apiData);
    axios({
      method: 'post',
      url: url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: qs.stringify(apiData)
    })
      .then((response) => {
        if (response.data.success){
          // Here, we only stored the  meme by putting it into a variable and logging it. 
          // TODO: Now that we have a database, send the meme we have to the mongo database.
          meme = response.data.data.url;
          console.log(meme);
          res.status(200).send();
        } else {
          console.log("Unsuccessful call to the imgflip API");
          console.log(response.data.error_message);
          res.status(404).send({
            success: false,
            error_message: response.data.error_message
          });
        }
      })
      .catch( (err) => { throw err; } );
});
