const fs = require('fs');
const pkg = require('./package.json');


module.exports.render = (row) => {
    let data = fs.readFileSync('./head.html').toString();
    data = data.replace(/{{REDIRECT}}/g, row.url).replace(/{{NAME}}/g, row.name).replace(/{{DESCRIPTION}}/g, row.description).replace(/{{ICON}}/g, row.image).replace(/{{COLOUR}}/g, row.colour);
    return data;
}

module.exports.home = () => {
    return fs.readFileSync('./index.html').toString().replace(/{{VERSION}}/, pkg.version);
}