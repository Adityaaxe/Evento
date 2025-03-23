const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const eventoRoutes = require("./routes/eventoRoutes");

const app = express();
const dbURL = "mongodb+srv://krishanmanics19:a7UAMlWB0tVHwScx@cluster0.rkqs6.mongodb.net/eventdb?retryWrites=true&w=majority&appName=Cluster0"

app.use(express.json());
app.use(cors());

app.use("/api", eventoRoutes);

mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

