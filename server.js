const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGODB_URI =
  "mongodb+srv://evanshankman:Testing1234@cluster0.61dimjd.mongodb.net/inethi_stories?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Category Schema and Model
const categorySchema = new mongoose.Schema({
  category: String,
});

// Story Schema and Model
const storySchema = new mongoose.Schema({
  category: String,
  title: String,
  content: String,
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
});

const Category = mongoose.model("Category", categorySchema);
const Story = mongoose.model("Story", storySchema);

// Routes
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    // console.log("Categories from MongoDB:", categories); // categories
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/stories/:category", async (req, res) => {
  const { category } = req.params;
  //console.log(`Received category parameter: ${category}`);
  try {
    const decodedCategory = decodeURIComponent(category);
    //console.log(`Fetching stories for category: ${decodedCategory}`);
    const allStories = await Story.find({ category: decodedCategory });
    //console.log("Fetched stories:", allStories);
    res.json(allStories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/stories/:id/download", async (req, res) => {
  const { id } = req.params;
  try {
    const story = await Story.findById(id);

    res.set({
      "Content-Disposition": `attachment; filename="${story.title}.html"`,
      "Content-Type": "text/html",
    });

    res.send(story.content);
  } catch (error) {
    console.error("THere was an issue downloading the story:", error);
    res.status(500).json({ message: error.message });
  }
});

app.post("/stories/:id/view", async (req, res) => {
  //Increment the views property on a story (how many views the story has)
  const { id } = req.params;
  try {
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json(story);
  } catch (error) {
    console.error("Could not increase number of views", error);
  }
});

app.post("/stories/:id/downloads", async (req, res) => {
  // Increment the downloads property for story (how many times the story has been downloaded)
  const { id } = req.params;
  // console.log(
  //   `Received request to increment download count for story ID: ${id}`
  // );
  try {
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    //console.log(`Updated story: ${story}`);
    res.json(story);
  } catch (error) {
    console.error("Could not increase number of downloads", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/healthcheck", (req, res) => {
  res.status(200).send("Server is up and running");
  //console.log(res.status(200));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
