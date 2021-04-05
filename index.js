const express = require('express');
const path = require('path');
const db = require('./db');
const template = require('./template');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy');

app.post('/', (req, res) => {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    if (!req.body.url || req.body.url.length <= 2) {
        res.status(400).send('Custom slug cannot be less than 3 characters');
    }
    else if (req.body.url.includes(req.hostname)) {
        res.status(400).send('You may not do that.');
    }
    else if (pattern.test(req.body.url)) {
        if (req.body.url && (req.body.slug || req.body.slug === '') && !req.body.custom) {
            db.newLink(req.body).then((slug) => {
                res.send(slug);
            }).catch(err => res.status(400).send('Slug in use already'));
        }
        else if (req.body.url && (req.body.slug || req.body.slug === '') && req.body.custom) {
            if (req.body.custom.name || req.body.custom.description || req.body.custom.image || req.body.custom.colour) {
                req.body.custom.name = req.body.custom.name.replace(/</g, '&gt;').replace(/>/g, '&lt;');
                req.body.custom.description = req.body.custom.description.replace(/</g, '&gt;').replace(/>/g, '&lt;');
                req.body.custom.image = req.body.custom.image.replace(/</g, '&gt;').replace(/>/g, '&lt;');
                req.body.custom.colour = req.body.custom.colour.replace(/</g, '&gt;').replace(/>/g, '&lt;');
                db.newLink(req.body).then((slug) => {
                    res.send(slug);
                }).catch(err => res.status(400).send('Slug in use already'));
            }
            else {
                res.status(400).send('Invalid request');
            }
        }
        else {
            res.status(400).send('Invalid request');
        }
    }
    else {
        res.status(400).send('Not a URL');
    }
})

app.use('/', (req, res) => {
    if (req.url === '/') {
        res.send(template.home());
    }
    else if (req.url === '/icon.png' || req.url === '/icon.ico') {
        res.sendFile(path.join(__dirname + req.url));
    }
    else if (req.url.length >= 3) {
        db.getLink(req.url.slice(1)).then(row => {
            if (row.redirect == 1) {
                res.redirect(row.url);
            }
            else {
                res.send(`${template.render(row)}`);
            }
        }).catch(err => { res.sendStatus(404).end() });
    }
    else {
        res.sendStatus(404).end();
    }
})

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});