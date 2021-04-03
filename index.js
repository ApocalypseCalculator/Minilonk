const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy');


const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});