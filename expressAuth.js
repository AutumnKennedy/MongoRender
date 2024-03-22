require('dotenv').config();
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require('uuid');

// The uri string must be the connection string for the database (obtained on Atlas).
const uri = process.env.MONGODB_URI;

// --- This is the standard stuff to get it to work on the browser
const express = require('express');
const app = express();
const port = 3000;
app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

//Register route:
app.get('/api/mongo/register', function(req, res) {
    res.send(`
    <h2>Register</h2>
    <form action="/api/mongo/register" method="post">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit">Register</button>
    </form>
  `);
});

// Default route:
app.get('/', function(req, res) {
    res.send(`
    <h2>Login</h2>
    <form action="/api/mongo/login" method="post">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a href="/api/mongo/register">Register</a></p>
  `);
});


// app.get('/say/:name', function(req, res) {
//   res.send('Hello ' + req.params.name + '!');
// });


// Route to access database:
app.post('/api/mongo/register', function(req, res) {
    const { username, password } = req.body;
    
    const client = new MongoClient(uri);
  
    async function run() {
      try {
        const database = client.db('akmdb');
        const users = database.collection('AuthCMPS415');
  
        const query = { username, password };
  
        const userExists = await users.findOne({username});
  
        if (userExists) {
          res.send('Username is already taken.');
          return;
        } else{
            await users.insertOne({ username, password });
            res.send('User creation was successful!');
        }
      } finally {
        await client.close();
      }
    }
  
    run().catch(console.dir);
  });

app.post('/api/mongo/login', function(req, res) {
    const { username, password } = req.body;
    
    const client = new MongoClient(uri);
  
    async function run() {
      try {
        const database = client.db('akmdb');
        const users = database.collection('AuthCMPS415');
  
        const query = { username, password };
  
        const user = await users.findOne(query);
        console.log(user);
  
        if (user) {
            const authToken = uuidv4();
            res.send('Login successful');
            res.cookie('authToken', authToken, { 
                maxAge: 60 * 1000, 
                httpOnly: true
            });
        } else {
            res.send(`
          <p>Invalid username or password<p>
          <p>Return to  <a href="/">login</a></p>

          `);
        }
      } finally {
        await client.close();
      }
    }
  
    run().catch(console.dir);
  });

  
