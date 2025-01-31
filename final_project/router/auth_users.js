const express = require('express');
const jwt = require('jsonwebtoken');
const { books, addOrModifyReview, deleteReview } = require("./booksdb.js");
const regd_users = express.Router();
const { isValidISBN } = require('./booksdb.js'); // Import the isValidISBN function

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

regd_users.post("/login", (req, res) => {
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

regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    const result = isValidISBN(isbn) && addOrModifyReview(isbn, review, username);

    if (result) {
        return res.status(200).json({ message: "Book review added/modified successfully" });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!isbn) {
        return res.status(400).json({ message: "Invalid ISBN" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    const result = deleteReview(isbn, username);

    if (result) {
        return res.status(200).json({ message: "Book review deleted successfully" });
    } else {
        return res.status(404).json({ message: "Review not found for this user" });
    }
});

module.exports = {
    regd_users,
    isValid,
    authenticatedUser,
    users
};
