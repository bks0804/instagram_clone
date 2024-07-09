const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const USER = mongoose.model("USER");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../keys"); // Correctly import the jwtSecret
const requireLogin = require("../middleWare/requireLogin");

// router.get("/", (req, res) => {
//   res.send("hello");
// });

router.post("/signup", (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(422).json({ error: "Please add all the fields" });
  }

  try {
    USER.findOne({ $or: [{ email: email }, { username: username }] }).then(
      (savedUser) => {
        if (savedUser) {
          return res
            .status(422)
            .json({ error: "User already exist with that email or userName" });
        }

        bcrypt.hash(password, 12).then((hashedpassword) => {
          const user = new USER({
            name,
            username,
            email,
            password: hashedpassword,
          });

          user
            .save()
            .then((user) => {
              return res.status(200).json({ message: "saved successfully" });
            })
            .catch((err) => {
              console.log(err);
              return res.status(422).json({
                error: "User already exist with that email or userName",
              });
            });
        });
      }
    );
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Something is wrong. Try again later!" });
  }
});

router.post("/signin", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: "Please add email and password" });
  }

  USER.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid email" });
    }

    bcrypt
      .compare(password, savedUser.password)
      .then((match) => {
        if (match) {
          const token = jwt.sign({ _id: savedUser.id }, jwtSecret);
          const { _id, name, email, username } = savedUser;
          res.status(200).send({ token, user: { _id, name, email, username } });
        } else {
          return res.status(422).json({ error: "Invalid password" });
        }
      })
      .catch((err) => console.log(err));
  });
});

module.exports = router;
