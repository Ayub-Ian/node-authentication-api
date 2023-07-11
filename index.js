// Create express app
const express = require("express");
const app = express();

// middleware
// parses incoming requests with JSON payloads
app.use(express.json());

// Server PORT
const PORT = 8080

// Start server
app.listen(PORT,(err) => {
    if (err) console.log(err);
    console.log("Server running on http://localhost:%PORT%".replace("%PORT%", PORT))
});

// root endpoint 
app.get("/", (req, res) => {
    res.send({"message" : "OK"})
})


// default response for any other request
app.use(function(req, res) {
    res.status(404);
})