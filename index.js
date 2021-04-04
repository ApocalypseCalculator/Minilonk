const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const template = require('./template');
const config = require('./config.json');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy');

app.use('/', (req, res) => {
    if (req.url === '/') {
        res.header('Content-Type', 'text/html');
        res.sendFile(path.join(__dirname + '\\index.html'));
    }
    else if (req.url === '/icon.png' || req.url === '/icon.ico') {
        res.sendFile(path.join(__dirname + req.url));
    }
    else if (req.url.length == config.slug.length) {
        db.getLink(req.url.slice(1)).then(row => {
            if (row.redirect == 1) {
                res.redirect(row.url);
            }
            else {
                res.send(`${template.render(row)}`);
            }
        }).catch(err => res.sendStatus(404).end());
    }
    else {
        res.sendStatus(404).end();
    }
})

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});