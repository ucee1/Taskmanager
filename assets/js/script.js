document.addEventListener("DOMContentLoaded", () => {
    const welcomeUserElement = document.getElementById("welcomeUser");
    const authButtons = document.getElementById("authButtons");

    // Function to display the welcome message
    function displayWelcomeMessage() {
        const token = localStorage.getItem("jwtToken");

        if (token) {
            // Decode the token to extract user information
            const userPayload = parseJwt(token);

            if (userPayload && userPayload.name) {
                // Update welcome message
                welcomeUserElement.textContent = `Hello, ${userPayload.name}!`;

                // Replace Sign up button with Logout button
                authButtons.innerHTML = `
                    <button id="logoutButton"
                            class="ms-auto btn btn-md rounded-2 py-1 ps-3 pe-3 text-light logout fw-bold">
                        Logout
                    </button>
                `;

                // Attach logout functionality
                document.getElementById("logoutButton").addEventListener("click", () => {
                    logoutUser();
                });
            } else {
                // Invalid token, clear storage and reset UI
                console.warn("Invalid token payload:", userPayload);
                clearUserSession();
            }
        } else {
            // No token, show default message
            resetToSignUp();
        }
    }

    // Function to decode JWT token
    function parseJwt(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error("Failed to parse JWT:", e);
            return null;
        }
    }

    // Function to clear user session
    function clearUserSession() {
        localStorage.removeItem("jwtToken");
        resetToSignUp();
    }

    // Function to reset to Sign up state
    function resetToSignUp() {
        welcomeUserElement.innerHTML = `
         <span class="text-light">Your <img src="./assets/images/favico.png" width="58"> TASKMANAGER </span> 
        `;
        authButtons.innerHTML = `
            <a href="https://taskmaster-capstone.netlify.app/login.html"
               class="ms-auto btn btn-md px-3 text-light signup fw-bold">
               Login
            </a>
        `;
    }

    // Function to handle logout
    function logoutUser() {
        clearUserSession();
        // alert("You have been logged out.");
        // window.location.reload(); // Reload to reset UI
        window.location.href = 'https://taskmaster-capstone.netlify.app/login.html';
    }

    // Call the function to display the welcome message on page load
    displayWelcomeMessage();
});


// document.getElementById("createTaskForm").addEventListener("submit", async function (event) {
//     event.preventDefault();

//     // Collect form data
//     const title = document.getElementById("taskTitle").value;
//     const description = document.getElementById("taskDescription").value;
//     const status = document.getElementById("taskStatus").value;
//     const dueDate = document.getElementById("dueDate").value;
//     const assignedUsersInput = document.getElementById("assignedUsers").value;
//     const files = document.getElementById("taskFiles").files;

//     // Convert assigned users input to an array of emails
//     const assignedUsers = assignedUsersInput.split(',').map(email => email.trim());

//     // Prepare form data (including files)
//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("status", status);
//     formData.append("dueDate", dueDate);
//     formData.append("assignedUsers", JSON.stringify(assignedUsers)); // Stringify the array
//     // Attach files
//     Array.from(files).forEach(file => formData.append("files", file));

//     console.log('form date =============>', formData);




//     // Retrieve token from localStorage
//     const token = localStorage.getItem("jwtToken");
//     console.log("Token from localStorage==========> ", token);

//     // Define API endpoint
//     const apiEndpoint = "http://localhost:5000/create";

//     try {
//         // Send POST request with form data
//         const response = await fetch(apiEndpoint, {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${token}`,
//             },
//             body: formData,

//         });


//         const data = await response.json();
//         const responseMessage = document.getElementById("responseMessage");

//         // Handle response
//         if (response.ok) {
//             responseMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
//         } else {
//             responseMessage.innerHTML = `<div class="alert alert-danger">${data.message || "An error occurred"}</div>`;
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         document.getElementById("responseMessage").innerHTML = `<div class="alert alert-danger">Failed to create task</div>`;
//     }
// });


document.getElementById("createTaskForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent normal form submission

    // Collect form data
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const status = document.getElementById("taskStatus").value;
    const dueDate = document.getElementById("dueDate").value;
    const assignedUsersInput = document.getElementById("assignedUsers").value;
    const files = document.getElementById("taskFiles").files;

    // Prepare form data (including files)
    const formData = new FormData();

    try {
        // Append non-file fields
        if (!title) throw new Error("Title is required");
        formData.append("title", title);

        if (!description) throw new Error("Description is required");
        formData.append("description", description);

        if (!status) throw new Error("Status is required");
        formData.append("status", status);

        if (!dueDate) throw new Error("Due date is required");
        formData.append("dueDate", dueDate);

        if (!assignedUsersInput) throw new Error("Assigned users are required");
        const assignedUsers = assignedUsersInput.split(',').map(email => email.trim());
        if (!assignedUsers.every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
            throw new Error("One or more assigned users' emails are invalid.");
        }
        formData.append("assignedUsers", JSON.stringify(assignedUsers)); // Stringify the array

        // Attach files (if present)
        if (files.length > 0) {
            Array.from(files).forEach(file => formData.append("files", file));
        } else {
            throw new Error("At least one file is required.");
        }

        // Send the form data
        const token = localStorage.getItem("jwtToken"); // Retrieve token from localStorage
        if (!token) throw new Error("No token found. User is not authenticated.");

        const response = await fetch("https://node-taskmaster-api.onrender.com/create", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData, // Send FormData object
        });

        const data = await response.json();
        const responseMessage = document.getElementById("responseMessage");

        if (response.ok) {
            responseMessage.innerHTML = `<div class="alert alert-success">${data.message}</div>`;
        } else {
            responseMessage.innerHTML = `<div class="alert alert-danger">${data.message || "An error occurred"}</div>`;
        }

    } catch (error) {
        // Log the specific error that occurred
        console.error("Error:", error);
        document.getElementById("responseMessage").innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
});


// TaskList
document.addEventListener('DOMContentLoaded', async function () {
    // Retrieve the token and user ID from localStorage (or wherever it's stored)
    const userId = localStorage.getItem("userId"); // Make sure userId is set in localStorage when the user logs in

    if (!userId) {
        alert("User ID is required!");
        return;
    }

    try {
        // Fetch tasks for the logged-in user from the backend
        const response = await fetch(`https://node-taskmaster-api.onrender.com/tasks/${userId}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwtToken")}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayTasks(data.tasks);
        } else {
            const errorData = await response.json();
            // alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        // alert('There was an error fetching tasks.');
    }
});

// Function to display the tasks
function displayTasks(tasks) {
    const taskListContainer = document.getElementById("taskList");
    taskListContainer.innerHTML = '';

    if (tasks.length === 0) {
        taskListContainer.innerHTML = "<p>No tasks found.</p>";
        return;
    }

    tasks.forEach(task => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        taskElement.innerHTML = `
                <table class="table table-striped table-hover">
                <thead>
                <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Descrption</th>
                    <th scope="col">Assigned Users</th>
                    <th scope="col">Status</th>
                    <th scope="col">Due Date</th>
                    <th scope="col"></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    
                    <td>${task.title}</td>
                    <td>${task.description}</td>
                    <td colspan="2">${task.assignedUsers.map(user => `${user.name} (${user.email})`).join('')}</td>
                    <td>${task.status}</td>
                    <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                    <td>
                    <div class="edit-and-delete">
                        <a href="#" class="deleteTask" data-task-id="${task._id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor"
                                class="bi bi-trash-fill text-danger" viewBox="0 0 16 16">
                                <path
                                    d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z" />
                            </svg>
                        </a>
                    </div>
                    </td>
                    <td></td>
                </tr>
                </tbody>
            </table>
                
        `;
        taskListContainer.appendChild(taskElement);
    });
}



// Event listener for delete buttons
document.querySelectorAll("#taskList").forEach(deleteButton => {
    deleteButton.addEventListener("click", async (event) => {
        event.preventDefault(); // Prevent the default action of the anchor tag

        const taskId = event.target.closest('a').getAttribute('data-task-id');

        if (!taskId) {
            alert("Task ID not found");
            return;
        }

        // Confirm before deleting
        const confirmDelete = confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("jwtToken");

            const response = await fetch(`https://node-taskmaster-api.onrender.com/task/${taskId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Show success message
                alert(data.message);
                // Optionally, remove the task element from the DOM
                // Find the task element
                const taskElement = event.target.closest('.task');
                // Remove the task from the DOM
                taskElement.remove();
            } else {
                alert(data.message || "Failed to delete task");
            }
        } catch (error) {
            console.error("Error deleting task:", error);
            alert("Error deleting task");
        }
    });
});

{/* <div class="card">
    <div class="card-header"><h6 class="fw-bold text-light"> ${task.title}</h6></div>
    <div class="card-body">
        <p>Description: ${task.description}</p>
        <p>Assigned Users:
            <ul>
                ${task.assignedUsers.map(user => `<li>${user.name} (${user.email})</li>`).join('')}
            </ul>
        </p>
        <p>Status: ${task.status}</p>
        <p>Due Date: ${new Date(task.dueDate).toLocaleDateString()}</p>
    </div>
</div>
                </div >
            </div > */}

// Function to fetch and display tasks
const userId = localStorage.getItem("userId");


async function fetchAndDisplayTasks() {
    try {
        // Make a GET request to fetch tasks
        const response = await fetch(`https://node-taskmaster-api.onrender.com/tasks/assigned/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch tasks');
        }

        // Get the tasks container
        const tasksContainer = document.getElementById('tasks-container');

        // Clear the container before adding tasks
        tasksContainer.innerHTML = '';

        // Check if tasks exist
        if (data.tasks.length === 0) {
            tasksContainer.innerHTML = '<p>No tasks assigned to you.</p>';
            return;
        }

        // Loop through tasks and render each one
        data.tasks.forEach(task => {
            // Create a task card
            const taskElement = document.createElement('div');
            taskElement.classList.add('task');

            // Task details
            taskElement.innerHTML = `
            <table class="table table-striped table-hover">
                <thead>
                <tr>
                    <th scope="col">Title</th>
                    <th scope="col">Descrption</th>
                    <th scope="col">Assigned Users</th>
                    <th scope="col">Status</th>
                    <th scope="col">Due Date</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <th scope="row"></th>
                    <td>${task.title}</td>
                    <td>${task.description}</td>
                    <td colspan="2">${task.assignedUsers.map(user => `<br>${user.name} (${user.email})`).join('')}</td>
                    <td>${task.status}</td>
                    <td>${new Date(task.dueDate).toLocaleDateString()}</td>
                </tr>
                </tbody>
            </table>
            `;

            // Append to the container
            tasksContainer.appendChild(taskElement);
        });
    } catch (error) {
        console.error(error.message);
        document.getElementById('tasks-container').innerHTML = `<p>Task(s): ${error.message}</p>`;
    }
}

// Call the function when the page loads
fetchAndDisplayTasks();




// file upload
const fileUploadDiv = document.querySelector('.custom-file-upload');

fileUploadDiv.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadDiv.classList.add('dragover');
});

fileUploadDiv.addEventListener('dragleave', () => {
    fileUploadDiv.classList.remove('dragover');
});

fileUploadDiv.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadDiv.classList.remove('dragover');
    const files = e.dataTransfer.files;
    console.log('Files dropped:', files); // Handle files
});