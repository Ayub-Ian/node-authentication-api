// Create express app
const express = require("express");
const app = express();
const db = require("./database.js");
const middleware = require("./middleware.js");

const jwt = require("jsonwebtoken");
const md5 = require("md5");
const tokenSecret = "my-token-secret";
// middleware
// parses incoming requests with JSON payloads
app.use(express.json());

// Server PORT
const PORT = 8080;

// Start server
app.listen(PORT, (err) => {
  if (err) console.log(err);
  console.log(
    "Server running on http://localhost:%PORT%".replace("%PORT%", PORT)
  );
});

// root endpoint
app.get("/", (req, res) => {
  res.send({ message: "OK" });
});

// GET /users - list of all users
app.get("/users", (req, res) => {
  const query = "select * from user";
  const params = [];
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.send({
      message: "success",
      data: rows,
    });
  });
});

// GET /users/:id - single user
app.get("/users/:id", (req, res) => {
  const query = "select * from user where id = ?";
  const params = [req.params.id];
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.send({
      message: "success",
      data: rows,
    });
  });
});

// POST /user - create new user
app.post("/user", (req, res, next) => {
  let errors = [];
  if (!req.body.password) {
    errors.push("No password specified");
  }
  if (!req.body.email) {
    errors.push("No email specified");
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password),
  };
  var sql = "INSERT INTO user (name, email, password) VALUES (?,?,?)";
  var params = [data.name, data.email, data.password];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: data,
      id: this.lastID,
    });
  });
});


app.get("/login", loadUser, (req, res) => {
  if (!req.user)
    res.status(404).json({ error: "no user with that email found" });
  else {
    if (md5(req.body.password) == req.user[0].password) {
      res.send({
        user: req.user,
        token: generateToken(req.user),
      });
    } else {
      res.status(403).json({ error: "passwords do not match" });
    }
  }
});

app.post("/signup", createUser, (req, res) => {
  if (!req.user)
    res.status(500).json({ error: "User not created successfully" });

  res.status(200).json({ user: req.user, token: generateToken(req.user) });
});

app.get("/jwt-test", middleware.verify, (req, res) => {
  res.status(200).json(req.user);
});

function generateToken(user) {
  return jwt.sign({ data: user }, tokenSecret, { expiresIn: "7h" });
}

function loadUser(req, res, next) {
  if (req.body.email) {
    const query = "select * from user where email = ?";
    const params = [req.body.email];
    db.all(query, params, (err, rows) => {
      if (err) {
        next(new Error(err.message));
        return;
      }

      if (rows.length === 0) {
        res.status(404).json({ message: "Couldn't find user" });
        return;
      }

      req.user = rows;
      next();
    });
  } else {
    next();
  }
}

function createUser(req, res, next) {
  let errors = [];
  if (!req.body.password) {
    errors.push("No password specified");
  }
  if (!req.body.email) {
    errors.push("No email specified");
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password),
  };
  let sql = "INSERT INTO user (name, email, password) VALUES (?,?,?)";
  let params = [data.name, data.email, data.password];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    req.user = {...data, id: this.lastID };
    next();
  });
}

// default response for any other request
app.use(function (req, res) {
  res.status(404);
});
