const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

const app = express();
dotenv.config();

const port = process.env.PORT;

// Configure CORS (conect to react)
app.use(
  cors({
    // origin: process.env.ORIGIN,
    origin: "http://localhost:3000",
    methods: "GET,PUT,PATCH,POST,DELETE",
    optionsSuccessStatus: 204,
    credentials: true,
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((error) => console.error("MongoDB connection error:", error));

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "please enter a text !"],
  },
  isMarked: Boolean,
});

const Todo = mongoose.model("Todo", todoSchema);

app.use(bodyParser.json());

// Serve static files from the "build" folder
app.use(express.static(path.join(__dirname, "frontend/build")));

app.get("/api/items", async (req, res) => {
  try {
    const items = await Todo.find();
    res.json(items); // return to react as json object
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Error fetching items" });
  }
});

app.post("/api/items", async (req, res) => {
  const { text, isMarked } = req.body;
  const newItem = new Todo({ text, isMarked });
  try {
    console.log(newItem);
    const savedItem = await newItem.save();
    res.json(savedItem);
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ error: "Error adding item" });
  }
});

app.delete("/delete", async (req, res) => {
  const { ids } = req.body;

  try {
    // Delete items with matching IDs from the database
    await Todo.deleteMany({ _id: { $in: ids } });

    // Fetch the remaining items after deletion
    const remainingItems = await Todo.find();
    res.json(remainingItems);
  } catch (error) {
    console.error("Error deleting items:", error);
    res.status(500).json({ error: "Error deleting items" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
