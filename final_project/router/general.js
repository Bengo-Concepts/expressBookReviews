const axios = require('axios'); // getting axios adfter npm install axios 
const express = require('express');
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js"); // Import the 'users' array from auth_users.js
const public_users = express.Router();
const { isValidISBN } = require('./booksdb.js');
const { response } = require('express');

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

public_users.get('/', async (req, res) => {
    try {
        const bookList = await fetchbooklistfromshop(); // Use async function
        console.log("Available Booklist fetched");
        return res.status(200).json(bookList);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});


public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;
    const authorBooks = Object.keys(books).reduce((result, isbn) => {
        if (books[isbn].author === author) {
            result[isbn] = books[isbn];
        }
        return result;
    }, {});
    
    if (Object.keys(authorBooks).length > 0) {
        return res.status(200).json(authorBooks);
    } else {
        return res.status(404).json({ message: "No books found by the provided author" });
    }
});

public_users.get('/title/:title', (req, res) => {
    const title = req.params.title;
    const booksWithTitle = Object.values(books).filter(book => book.title === title);

    if (booksWithTitle.length > 0) {
        return res.status(200).json(booksWithTitle);
    } else {
        return res.status(404).json({ message: "No books found with the provided title" });
    }
});

public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book review not found" });
    }
});
//axios fetch function 
const fetchbooklistfromshop = () => {
    return new Promise((resolve, reject) => {
        axios.get ('https://julienbengho-5500.theiadocker-3-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/')
        .then (response => {
            resolve (response.data);
        })
        .catch (error => {
            reject(error);

        });
    });
};

module.exports = {
    public_users // Export the router
};
