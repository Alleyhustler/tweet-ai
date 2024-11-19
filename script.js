const adminPassword = "pad"; // Admin password
let isAdmin = false;

// Generate or retrieve user ID
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = `user-${Date.now()}`;
    localStorage.setItem("userId", userId);
}
addCliOutput(`User ID: ${userId}`);

// Admin login logic using a password field
document.getElementById("adminLoginButton").addEventListener("click", () => {
    const password = document.getElementById("adminPassword").value;
    if (password === adminPassword) {
        isAdmin = true;
        addCliOutput("Admin access granted. You can now manage requests.");
        loadRequests(); // Reload requests with admin options
    } else {
        addCliOutput("Error: Invalid admin password.");
    }
});

// Submit a new tweet
document.getElementById("submitTweet").addEventListener("click", async () => {
    const tweetContent = document.getElementById("tweetContent").value.trim();

    // Handle empty tweet content
    if (!tweetContent) {
        addCliOutput("Error: Tweet content cannot be empty.");
        return;
    }

    // Submit tweet if content is not empty
    try {
        const response = await fetch("http://localhost:3000/submit-tweet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tweet: tweetContent, userId }),
        });

        const result = await response.json();
        if (response.ok) {
            addCliOutput(result.message);
            document.getElementById("tweetContent").value = ""; // Clear input after successful submission
            loadRequests(); // Refresh requests after submission (optional)
        } else {
            addCliOutput(`Error: ${result.message}`);
        }
    } catch (error) {
        addCliOutput("Error: Unable to submit tweet.");
    }
});

// Load all requests for admin and non-admin users
async function loadRequests() {
    try {
        const response = await fetch("http://localhost:3000/admin/requests");
        const requests = await response.json();

        const requestsList = document.getElementById("requestsList");
        requestsList.innerHTML = ""; // Clear previous list

        requests.forEach((request) => {
            const li = document.createElement("li");
            const isCurrentUser = request.userId === userId;
            li.textContent = `[${request.id}] ${request.tweet} - Status: ${request.status} - User: ${request.userId}`;
            
            if (isCurrentUser) {
                li.style.color = "#ffff00"; // Highlight user's own requests
            }

            // Only show admin features for admins
            if (isAdmin && request.status === "Pending") {
                const approveButton = document.createElement("button");
                approveButton.textContent = "Mark as Done";
                approveButton.onclick = async () => {
                    await fetch("http://localhost:3000/admin/update-status", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: request.id, status: "Done" }),
                    });
                    loadRequests(); // Reload after status change
                };

                li.appendChild(approveButton);
            }

            // Add request to list
            requestsList.appendChild(li);
        });
    } catch (error) {
        addCliOutput("Error: Unable to load requests.");
    }
}

// Add CLI-style output
function addCliOutput(message) {
    const cliOutput = document.getElementById("cli-output");
    const span = document.createElement("span");
    span.className = "cli-prompt";
    span.textContent = message;
    cliOutput.appendChild(span);
}

// Fake loading animation
function fakeLoading(message, delay = 1000) {
    return new Promise((resolve) => {
        addCliOutput(message);
        setTimeout(resolve, delay);
    });
}

// Initialize the CLI (e.g., show welcome message, load requests)
async function initializeCLI() {
    await fakeLoading("Initializing Tweet Request System...");
    await fakeLoading("Loading previous requests...");
    loadRequests(); // Load requests after initialization
}

initializeCLI();
