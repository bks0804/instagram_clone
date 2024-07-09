const express = require("express");
const app = express();
const PORT = process.env.port || 5000;
const cors = require("cors");
const mongoose = require("mongoose");
const { mongoURL } = require("./keys");
const path = require("path");

// ** Database models
require("./models/model");
require("./models/Post");

// ** cors
app.use(cors());
app.use(express.json({}));

// ** API routes
app.use(require("./routes/auth"));
app.use(require("./routes/CreatePost"));
app.use(require("./routes/user"));

// ** Connect Database
mongoose.connect(mongoURL);

mongoose.connection.on("connected", () => {
  console.log("successfully connected to mongo");
});

mongoose.connection.on("error", (err) => {
  console.log("not connected to mongodb");
});

// serving the frontEnd
app.use(express.static(path.join(__dirname, "./frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./frontend/dist/index.html")),
    function (err) {
      res.status(500).send(err);
    };
});

// ** Server Listen
app.listen(PORT, () => {
  console.log("server is running on port :" + PORT);
});
