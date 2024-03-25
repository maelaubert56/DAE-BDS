const jwt = require('jsonwebtoken');
const db = require('./db');
// find secret key in .env file
require('dotenv').config();

function authenticateToken(req, res, next) {
    process.stdout.write('Authenticating :');
    const token = req.header('Authorization');
    if (!token || token === 'null') {
        console.log('Token missing')
        return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.log(err);
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }
        db.execute('SELECT * FROM users WHERE users_email = ?', [user.users_email]).then(([rows]) => {
            if (rows.length === 0) {
                console.log('User not found');
                return res.status(403).json({ message: 'Forbidden: Invalid token' });
            }
            const user = rows[0];
            console.log('Ok (' + user.users_email + ')\n');
            req.user = user;
            next();
        });
    });
}

module.exports = authenticateToken;
