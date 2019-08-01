const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();
//connect to DB

mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true },
    () => console.log('Connected DB')
);

//Middlewares
app.use(express.json());

//Import route

const authRoute = require('./routes/auth');


//Route middlewares

app.use('/api/user', authRoute);

app.listen(3000, () => {console.log('Server runiing')})