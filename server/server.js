const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Simulated database for requests
let tweetRequests = [];

// Endpoint to submit a tweet request
app.post("/submit-tweet", (req, res) => {
    const { tweet, userId } = req.body;
    if (!tweet || !userId) {
        return res.status(400).json({ message: "Tweet content and user ID are required!" });
    }

    const id = Date.now();
    tweetRequests.push({ id, tweet, status: "Pending", userId }); // Save userId with the request
    res.json({ message: "Request submitted successfully!", id });
});

app.get("/admin/requests", (req, res) => {
    res.json(tweetRequests); // Admin view includes userId for each request
});


// Endpoint to update tweet request status
app.post("/admin/update-status", (req, res) => {
    const { id, status } = req.body;
    const request = tweetRequests.find((r) => r.id === id);
    if (request) {
        request.status = status;
        res.json({ message: "Status updated successfully!" });
    } else {
        res.status(404).json({ message: "Request not found!" });
    }
});

app.listen(3000, () => {
    console.log("Server is running on https://tweet-ai-quvl.onrender.com");
});
