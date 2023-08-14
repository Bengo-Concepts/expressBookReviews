const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let validusers = users.filter((user)=>{
    return (user.username === username)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}


const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
   if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(401).json({message: "Invalid Login. Check username and password"});
    }});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review; // Get the review from the query parameter
    const username = req.user; // Get the username from the session

    if (!isValidISBN(isbn)) {
        return res.status(400).json({ message: "Invalid ISBN" });
    }

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or modify the review for the book and the specific user
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Book review added/modified successfully" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // Get the username from the session

    if (!isbn) {
        return res.status(400).json({ message: "Invalid ISBN" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    // Delete the review for the book and the specific user
    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Book review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
