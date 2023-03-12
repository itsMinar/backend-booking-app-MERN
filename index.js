const express = require('express');
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cookieParser = require('cookie-parser');

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'valolagenakichubhai';

const app = express();

app.use(
    cors({
        credentials: true,
        origin: 'http://localhost:5173',
    })
);
app.use(express.json());
app.use(cookieParser());

// database connection
mongoose.connect('mongodb://127.0.0.1:27017/booking-app');

// register a user route
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });

        res.json(userDoc);
    } catch (error) {
        res.status(422).json(error);
    }
});

// login user route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const userDoc = await User.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign(
                { email: userDoc.email, id: userDoc._id },
                jwtSecret,
                {},
                (err, token) => {
                    if (err) throw err;
                    res.cookie('token', token).json(userDoc);
                }
            );
        } else {
            res.status(422).json('pass not ok');
        }
    } else {
        res.json('not found');
    }
});

// profile route for token
app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const { name, email, _id } = await User.findById(userData.id);
            res.json({ name, email, _id });
        });
    } else {
        res.json(null);
    }
});

// testing route
app.get('/test', (req, res) => {
    res.status(200).json({
        status: 'Ok',
    });
});

// server listening port
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is listening on Port ${port}`);
});
