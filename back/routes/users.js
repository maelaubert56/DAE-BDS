const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authenticateToken = require('../utilities/authMiddleware');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();
const db = require('../utilities/db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files/forms/templates/');
    },
    filename: function (req, file, cb) { // file name will be 'DAE_template_file'+email+'.docx'
        cb(null, 'DAE_template_'+req.body.email+'.docx');
    }
});
const upload = multer({ storage: storage });



router.post('/login', async (req, res) => {
    console.log("route : POST api/users/login")
    try {
        const { email, password } = req.body;
        console.log(email, password)

        const allusers = await db.execute('SELECT * FROM users');

        // fetch the user with the email
        const [rows] = await db.execute('SELECT * FROM users WHERE users_email = ?', [email]);

        const user = rows[0];

        // check if user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.users_password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        // generate access token for the user
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

        // send the access token to the client
        res.status(200).json({ accessToken });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/users/me
router.get('/me', authenticateToken, async (req, res) => {
    console.log("route : GET api/users/me")
    try {
        // fetch the user with the email
        const [rows] = await db.execute('SELECT * FROM users WHERE users_username = ?', [req.user.users_username]);
        const user = rows[0];

        // send the user information to the client
        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    console.log("route : GET api/users/:id")
    try {
        //check if the user is admin (users_permissions == 2)
        if (req.user.users_permissions.toString() != '2') {
            console.log('permission : ' + req.user.users_permissions + 'with typ')
            return res.status(403).json({ message: 'Forbidden: Invalid permissions' });
        }
        // fetch the user with the email
        const [rows] = await db.execute('SELECT * FROM users WHERE users_email = ?', [req.params.id]);
        const user = rows[0];

        // send the user information to the client
        res.status(200).json({ user });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}
);

// GET /api/users
router.get('/', async (req, res) => {
    console.log("route : GET api/users")
    try {
        console.log("route : GET api/users")
        const [rows] = await db.execute('SELECT users_email, users_username, users_group FROM users');
        const users = rows;

        // send the user information to the client
        res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/users (auth middleware and saveFile middleware)
router.post('/', authenticateToken, upload.single('DAE_template_file'), async function (req, res){
    console.log("route : POST api/users")
    try {

        const { email, isAdmin, nom, prenom, username, password, users_group } = req.body;
        

        if (!req.file) {
            return res.status(400).send('Aucune image n\'a été envoyée.');
        }

        const userExist = await db.execute('SELECT * FROM users WHERE users_email = ?', [email]);
        if (userExist[0].length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        console.log(await db.execute('SELECT * FROM users WHERE users_email = ?', [email]));

        // hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // insert the user into the database
        await db.execute('INSERT INTO users (users_email, users_permissions, users_nom, users_prenom, users_username, users_password, users_group) VALUES (?, ?, ?, ?, ?, ?, ?)', [email, isAdmin, nom, prenom, username, hashedPassword, users_group]);

        // send the user information to the client
        res.status(200).json({ message: 'User added' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:email', authenticateToken, upload.single('DAE_template_file'), async function (req, res){
    console.log("route : PUT api/users")
    try {
        const {isAdmin, nom, prenom, username, password, users_group} = req.body;
        const email = req.params.email;

        // hash the password if it is not empty
        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await db.execute('UPDATE users SET users_permissions = ?, users_nom = ?, users_prenom = ?, users_username = ?, users_password = ?, users_group = ? WHERE users_email = ?', [isAdmin, nom, prenom, username, hashedPassword, users_group, email]);
        }

        // update the user in the database
        await db.execute('UPDATE users SET users_permissions = ?, users_nom = ?, users_prenom = ?, users_username = ?, users_password = ?, users_group = ? WHERE users_email = ?', [isAdmin, nom, prenom, username, hashedPassword, users_group, email]);

        // send the user information to the client
        res.status(200).json({ message: 'User updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router

module.exports = router;