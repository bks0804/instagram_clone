const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleWare/requireLogin");
const POST = mongoose.model("POST");

// Route
router.get("/allposts", requireLogin, (req, res) => {
  let limit = req.query.limit;
  let skip = req.query.skip;

  POST.find()
    .populate("postedBy", "_id name photo")
    .populate("comments.postedBy", "_id name")
    .limit(parseInt(limit))
    .skip(parseInt(skip))

    .sort("-createdAt")
    .then((posts) => {
      res.status(200).json(posts);
    })
    .catch((err) => res.status(400).json({ error: "Posts not found" }));
});

router.post("/createpost", requireLogin, (req, res) => {
  const { pic, body } = req.body;

  if (!pic || !body) {
    return res.status(422).json({ error: "Please fill all the fields" });
  }

  const post = new POST({
    body,
    photo: pic,
    postedBy: req.user,
  });

  post
    .save()
    .then((result) => {
      return res.json({ post: result });
    })
    .catch((err) => console.log(err));
});

router.get("/myposts", requireLogin, (req, res) => {
  POST.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")
    .then((myposts) => {
      res.json(myposts);
    });
});

router.put("/like", requireLogin, async (req, res) => {
  try {
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { likes: req.user._id },
      },
      {
        new: true,
      }
    )
      .populate("postedBy", "_id name photo")
      .exec();
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: err });
  }
});

router.put("/unlike", requireLogin, async (req, res) => {
  try {
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { likes: req.user._id },
      },
      {
        new: true,
      }
    )
      .populate("postedBy", "_id name photo")
      .exec();
    res.json(result);
  } catch (err) {
    res.status(422).json({ error: err });
  }
});

router.put("/comment", requireLogin, async (req, res) => {
  const comment = {
    comment: req.body.text,
    postedBy: req.user._id,
  };

  try {
    const result = await POST.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { comments: comment },
      },
      {
        new: true,
      }
    )

      .populate("comments.postedBy", "_id name")
      .populate("postedBy", "_id name")
      .exec();

    res.json(result);
  } catch (err) {
    res.status(422).json({ error: err });
  }
});
// api to delete post
router.delete("/deletePost/:postId", requireLogin, async (req, res) => {
  try {
    const post = await POST.findOne({ _id: req.params.postId }).populate(
      "postedBy",
      "_id"
    );

    if (!post) {
      return res.status(422).json({ error: "Post not found" });
    }

    if (post.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    } else {
      await POST.deleteOne({ _id: req.params.postId });
      // await post
      //   .remove()
      //   .then((res) => {
      //     console.log(res);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
      res.json({ message: "Successfully Deleted" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// to show following post
router.get("/myfollowingpost", requireLogin, (req, res) => {
  POST.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .then((posts) => {
      res.json(posts);

      // console.log(posts);
    })
    .catch((err) => {
      console.log(err);
    });
});
module.exports = router;
