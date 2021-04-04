const fs = require('fs');


module.exports.render = (row) => {
    let data = fs.readFileSync('./head.html').toString();
    data = data.replace(/{{REDIRECT}}/g, row.url).replace(/{{NAME}}/g, row.name).replace(/{{DESCRIPTION}}/g, row.description).replace(/{{ICON}}/g, row.image).replace(/{{COLOUR}}/g, row.colour);
    return data;
}