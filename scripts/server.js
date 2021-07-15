'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(function (req, res, next) {
    if (req.get('Origin')) {
        res.header({'Access-Control-Allow-Origin': req.get('Origin')});
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE,XSRF-TOKEN");
    }
    next();
});

app.get('/get', (req, res) => {
    const query = req.query;

    res.send(query);
});

app.post('/post', (req, res) => {
    const body = req.body;

    res.send(body);
});

app.get('/jsonp', (req, res) => {
    const query = req.query;
    const { callback = 'callback', ...others } = query;

    res.header('Content-Type', 'application/javascript; charset=UTF-8');
    res.send(`${callback}(${JSON.stringify(others, null, 2)});`);
});

app.all('/csrf', (req, res) => {
    const query = req.query;
    const csrfHeadname = query.csrfHeadname;

    res.send({
        [csrfHeadname]: req.header(csrfHeadname),
    });
});

app.listen(3002);
console.log('Start mock server ok.....');