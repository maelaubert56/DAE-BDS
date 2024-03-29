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
        cb(null, 'files/signatures');
    },
    filename: function (req, file, cb) {
        cb(null, 'signature_' + req.body.email + '.png');
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
        if (req.user.users_permissions != 2) {
            console.log('permission : ' + req.user.users_permissions + 'with type : ' + typeof (req.user.users_permissions));
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
        const [rows] = await db.execute('SELECT users_email, users_username, users_groups_name FROM users');
        const users = rows;

        // send the user information to the client
        res.status(200).json({ users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// POST /api/users (auth middleware and saveFile middleware)
router.post('/', authenticateToken, upload.single('signature'), async function (req, res){
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

        const groupExist = await db.execute('SELECT * FROM users_groups WHERE users_groups_name = ?', [users_group]);
        if (groupExist[0].length == 0) {
            // create the group
            await db.execute('INSERT INTO users_groups (users_groups_name, users_groups_type) VALUES (?, ASSO)', [users_group]);
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // insert the user into the database
        await db.execute('INSERT INTO users (users_email, users_permissions, users_nom, users_prenom, users_username, users_password, users_signature, users_groups_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [email, isAdmin, nom, prenom, username, hashedPassword, `signature_${email}.png`, users_group]);

        // send the user information to the client
        res.status(200).json({ message: 'User added' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.put('/:email', authenticateToken, upload.single('signature'), async function (req, res){
    console.log("route : PUT api/users")
    try {
        var {isAdmin, nom, prenom, username, password, users_group} = req.body;
        const email = req.params.email;

        //check if the user has the permission 2
        if (req.user.users_permissions === 2) {
            isAdmin = 2;
        }

        // hash the password if it is not empty
        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await db.execute('UPDATE users SET users_permissions = ?, users_nom = ?, users_prenom = ?, users_username = ?, users_password = ?, users_groups_name = ? WHERE users_email = ?', [isAdmin, nom, prenom, username, hashedPassword, users_group, email]);
        }
        else {

            // update the user in the database
            
            await db.execute('UPDATE users SET users_permissions = ?, users_nom = ?, users_prenom = ?, users_username = ?, users_groups_name = ? WHERE users_email = ?', [isAdmin, nom, prenom, username, users_group, email]);
        }
        // send the user information to the client
        res.status(200).json({ message: 'User updated' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.delete('/:email', authenticateToken, async function (req, res){
    console.log("route : DELETE api/users")
    try {
        const email = req.params.email;

        // check if the requester is permission == 2, check if the user to delete is permission != 2 and is not the requester, then delete the user
        const [rows] = await db.execute('SELECT * FROM users WHERE users_email = ?', [email]);
        const user = rows[0];
        if (req.user.users_permissions != 2 || user.users_permissions == 2){
            return res.status(403).json({ message: 'Forbidden: Invalid permissions' });
        }

        if (req.user.users_email == email){
            return res.status(403).json({ message: 'Forbidden: Cannot delete yourself' });
        }

        // delete the user from the database
        await db.execute('DELETE FROM users WHERE users_email = ?', [email]);

        // delete the signature file
        const signaturePath = path.join(__dirname, `../files/signatures/signature_${email}.png`);
        fs.unlinkSync(signaturePath);

        // send the user information to the client
        res.status(200).json({ message: 'User deleted' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

);


module.exports = router;