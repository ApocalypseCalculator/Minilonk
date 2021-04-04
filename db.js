const sqlite = require('sqlite3');
const nanoid = require('nanoid');
const axios = require('axios').default;
const fs = require('fs');
const config = require('./config.json');

module.exports.newLink = (options) => {
    /*
    options is an object
    {
        custom: {name, description, image, colour},
        slug: "",
        url: ""
    }
    */
    return new Promise((resolve, reject) => {
        axios.get(`${options.url}`).then(res => {
            if (options.slug === "") {
                options.slug = nanoid.nanoid(config.slug.length);
            }
            let db = new sqlite.Database('./data.db');
            db.get(`SELECT * FROM links WHERE slug = ?`, [options.slug], (row, err) => {
                if (err) {
                    db.close((err) => {
                        reject('Slug validation failed');
                    });
                }
                else if (row) {
                    db.close((err) => {
                        reject('Slug already in use');
                    });
                }
                else {
                    if (options.custom) {
                        db.run(`INSERT INTO links(date, url, slug, name, description, image, colour, redirect) VALUES(?,?,?,?,?,?,?,?)`,
                            [Date.now(), options.url, options.slug, options.custom.name, options.custom.description, options.custom.image, options.custom.colour, 0], (err) => {
                                db.close((err) => {
                                    if (err) {
                                        reject('An error occurred.');
                                    }
                                    else {
                                        resolve(options.slug);
                                    }
                                })
                            })
                    }
                    else {
                        db.run(`INSERT INTO links(date, url, slug, redirect) VALUES(?,?,?,?)`, [Date.now(), options.url, options.slug, 1], (err) => {
                            db.close((err) => {
                                if (err) {
                                    reject('An error occurred.');
                                }
                                else {
                                    resolve(options.slug);
                                }
                            })
                        })
                    }
                }
            })
        }).catch(err => reject('URL invalid.'));
    })
}

module.exports.getLink = (slug) => {
    return new Promise((resolve, reject) => {
        let db = new sqlite.Database('./data.db');
        db.get(`SELECT * FROM links WHERE slug = ?`, [slug], (row, err) => {
            db.close((err) => {
                if (err) {
                    reject('Error fetching slug information');
                }
                else if (row) {
                    resolve(row);
                }
                else {
                    reject('Not found');
                }
            });
        })
    })
}