const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (isValid(username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    users.push({ username, password });
    
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    const bookList = JSON.stringify(books, null, 2);
    return res.status(200).send(bookList);
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
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
  

// Get all books based on title check exercise 3
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
}); //

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn] && books[isbn].reviews) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book review not found" });
  }
});

module.exports.general = public_users;
