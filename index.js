const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// testing route
app.get('/test', (req, res) => {
    res.status(200).json({
        status: 'Ok',
    });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});
