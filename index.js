const express = require('express');
const path = require('path');
const db = require('./db');
const config = require('./config.json');
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

    if (!req.body.slug || req.body.slug.length < config.slug.custom.min || req.body.slug.length > config.slug.custom.max) {
        res.status(400).send(`Custom slugs cannot be less than ${config.slug.custom.min} characters or longer than ${config.slug.custom.max}!`);
    }
    else if (req.body.url.includes(req.hostname)) {
        res.status(400).send('You may not do that.');
    }
    else if (!testSafeURI(req.body.slug)) {
        res.status(400).send('You may not use those characters.');
    }
    else if (pattern.test(req.body.url)) {
        if (req.body.url && (req.body.slug || req.body.slug === '') && !req.body.custom) {
            db.newLink(req.body).then((slug) => {
                res.send(slug);
            }).catch(err => res.status(400).send('Slug in use already'));
        }
        else if (req.body.url && (req.body.slug || req.body.slug === '') && req.body.custom) {
            if (req.body.custom.name || req.body.custom.description || req.body.custom.image || req.body.custom.colour) {
                [req.body.custom.name, req.body.custom.description, req.body.custom.image, req.body.custom.colour] = replace([req.body.custom.name, req.body.custom.description, req.body.custom.image, req.body.custom.colour]);
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

const PORT = config.server.port;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

function testSafeURI(target) {
    const str = config.chars.allowedCharset;
    let chars = target.toLowerCase().split("");
    for (let i = 0; i < chars.length; i++) {
        if (!str.includes(`${chars[i]}`)) {
            return false;
        }
    }
    return true;
}

function replace(arr) {
    let newarr = [];
    arr.forEach(e => {
        let val = e;
        for (const property in config.chars.replaces) {
            let piece = val.split(property);
            val = `${piece.join(config.chars.replaces[property])}`;
        }
        newarr.push(val);
    });
    return newarr;
}