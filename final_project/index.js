const express = require('express');
const axios = require('axios'); 
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { isValid, authenticatedUser } = require('./router/auth_users.js');
const { regd_users } = require('./router/auth_users.js');
const { public_users } = require('./router/general.js');
const app = express();
const PORT = 5000;

app.use(express.json());

app.use(session({
    secret: "fingerpint",
    resave: true,
    saveUninitialized: true
}));

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

app.post("/customer/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
        req.session.authorization = { accessToken, username };
        return res.status(200).json({ message: "User successfully logged in", accessToken });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

app.use("/customer/auth/*", (req, res, next) => {
    if (req.session.authorization && req.session.authorization.accessToken) {
        const token = req.session.authorization.accessToken;
        jwt.verify(token, 'secret_key', (err, decoded) => {
            if (!err) {
                req.user = decoded.username;
                next();
            } else {
                res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        res.status(403).json({ message: "User not logged in" });
    }
});

app.use("/customer", regd_users);
app.use("/", public_users); // Mount the public_users router

app.listen(5000, () => {
    console.log("Server is running on port", PORT);
});
