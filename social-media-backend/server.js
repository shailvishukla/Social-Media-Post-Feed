const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const { Sequelize } = require("sequelize");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const sequelize = new Sequelize(
  "postgres://postgres:1234@localhost:5432/social-media-server"
);

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Error: " + err));

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Models defined
const User = sequelize.define("user", {
  username: { type: Sequelize.STRING, unique: true },
  email: { type: Sequelize.STRING, unique: true },
  password: { type: Sequelize.STRING },
});

const Post = sequelize.define("post", {
  userId: {
    type: Sequelize.INTEGER,
    references: { model: "users", key: "id" },
  },
  caption: { type: Sequelize.TEXT },
  imagePath: { type: Sequelize.STRING },
});

const Comment = sequelize.define("comment", {
  postId: {
    type: Sequelize.INTEGER,
    references: { model: "posts", key: "id" },
  },
  userId: {
    type: Sequelize.INTEGER,
    references: { model: "users", key: "id" },
  },
  userComment: { type: Sequelize.TEXT },
});

// Relations
User.hasMany(Post);
User.hasMany(Comment);
Post.belongsTo(User);
Post.hasMany(Comment);
Comment.belongsTo(Post);
Comment.belongsTo(User);

// Sync models
sequelize.sync();

// API Endpoints
// Paginated API to fetch all the posts
// app.get('/posts', async (req, res) => {
//   let { page, limit } = req.query;
//   page = parseInt(page, 10);
//   limit = parseInt(limit, 10);

//   // Validate and set default values if needed
//   if (isNaN(page) || page < 1) {
//     page = 1;
//   }
//   if (isNaN(limit) || limit < 1) {
//     limit = 10;
//   }

//   const offset = (page - 1) * limit;

//   try {
//     const posts = await Post.findAndCountAll({
//       limit,
//       offset,
//       include: [User, Comment] ,
//       order: [['createdAt', 'DESC']]
//     });
//     res.json(posts);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal server error');
//   }
// });

// API to create a post
app.post("/posts", upload.single("image"), async (req, res) => {
  const { userId, caption } = req.body;
  const imagePath = req.file ? req.file.path : null;

  try {
    const post = await Post.create({ userId, caption, imagePath });
    io.emit("newPost", post);
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// API to fetch comments for a particular post
app.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.findAll({
      where: { postId },
      include: [User],
    });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// API to add a comment on a post
app.post("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;
  const { userId, userComment } = req.body;
  try {
    const comment = await Comment.create({ postId, userId, userComment });
    io.emit("newComment", comment);
    res.json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

io.on("connection", (socket) => {
  console.log("client connected");

  socket.on("getPost", async (payload) => {
    console.log("called on server");
    let { page, limit } = payload;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    // Validate and set default values if needed
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    if (isNaN(limit) || limit < 1) {
      limit = 10;
    }

    const offset = (page - 1) * limit;

    try {
      const posts = await Post.findAndCountAll({
        limit,
        offset,
        include: [User, Comment],
        order: [["createdAt", "DESC"]],
      });

      socket.emit("receivePost", posts.rows);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Run server on port 4001
server.listen(4001, () => console.log("Server running on port 4001"));
