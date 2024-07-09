const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../keys");
const mongoose = require("mongoose");
const USER = mongoose.model("USER");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "you must have logged in 1" });
  }

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, jwtSecret, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "you must have logged in 2" });
    }

    const { _id } = payload;
    USER.findById(_id).then((userData) => {
      req.user = userData;
      // console.log(req.user);
      next();
    });
  });
};

// exchange code

// const requireLogin = (req, res, next) => {
//   const { authorization } = req.headers;

//   if (!authorization) {
//     return res.status(401).json({ error: "You must be logged in 1" });
//   }

//   const token = authorization.replace("Bearer ", "");

//   jwt.verify(token, jwtSecret, (err, payload) => {
//     if (err) {
//       return res.status(401).json({ error: "You must be logged in 2" });
//     }

//     const { _id } = payload;

//     USER.findById(_id)
//       .then((userData) => {
//         if (!userData) {
//           return res.status(401).json({ error: "User not found" });
//         }
//         req.user = userData;
//         next();
//         console.log("first");
//       })
//       .catch((err) => {
//         console.error(err);
//         res.status(500).json({ error: "Internal server error" });
//       });
//   });
// };

// module.exports = requireLogin;
