const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const {
    Pool
} = require('pg');

const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('Lost PG connection'));

pgClient.query('CREATE TABLE IF NOT EXISTS values (numer INT)')
    .catch(err => console.log(err));

// Redis Client setup
const redis = require("redis");
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// Duplicate is necessary tu sobscribe, according to documentation when connection is being used it catn 'watch'
const redisPublisher = redisClient.duplicate();

//Expres route handlers

app.get('/', (req, res) => {
    res.send('Hi');
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM VALUES');
    res.send('')
})

app.get('/values/current', async (req, res) => {
    redisClient.hget('values', (err, values) => {
        res.send('values');
    })
})
 
app.get('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40 ) {
        return res.status(422).send('Index Too high');
    }

    redisClient.hset('values', index , 'Nothing Yet');
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT into  values (number) VALUES($1)',[index]);
    res.sendDate({working:true});

})


app.listen(5000, err => {
    console.log('Listening');
});

