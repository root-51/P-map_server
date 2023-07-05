//env
require('dotenv').config();

// create server
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const ejs = require('ejs');
app.set('view engine', 'ejs')


//connect MongoDB
var database;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(
    process.env.MONGODB_URL,
    { useUnifiedTopology: true },
    function (err, client) {     //callback function    
        if (err) {
            return console.log('connection err : ' + err);
        }
        database = client.db('test-database01');
        app.listen(8080, function () {
            console.log('connected : listening on 8080')
        })

    });

const path = require('path');
app.get('/', function (request, response) {
    response.render(path.join(__dirname, 'views', 'map.ejs'));
})