// Create express app
const express = require("express");
const app = express();
const db = require("./database.js")
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


app.get("/users", (req,res) => {
    const query =  "select * from user"
    const params = []
    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
          }
          res.send({
            message: "success",
            data: rows
          })
    })
    
})


// default response for any other request
app.use(function(req, res) {
    res.status(404);
})