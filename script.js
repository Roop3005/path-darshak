/**
 * This file contains the core JavaScript logic for the PathPradarshak application.
 * It handles user authentication, dynamic content rendering, and interactive features.
 */

// Map of streams to their corresponding emojis
const emojiMap = { Science: "🧪", Commerce: "💼", Arts: "🎨" };

/**
 * Handles the registration form submission.
 * - Prevents the default form submission.
 * - Validates user input.
 * - Checks if the email is already registered.
 * - Stores the new user in localStorage.
 */
document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const username = this.querySelector('input[placeholder="Username"]').value.trim();
  const email = this.querySelector('input[placeholder="Email"]').value.trim();
  const password = this.querySelector('input[placeholder="Password"]').value;
  const confirmPassword = this.querySelector('input[placeholder="Confirm Password"]').value;

  if (!username || !email || !password || !confirmPassword) {
    alert("Please fill out all fields.");
    return;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.some(u => u.email === email)) {
    alert("Email already registered.");
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registration successful! Please log in.");
  document.getElementById('authForm').classList.remove("right-panel-active");
});

/**
 * Handles the login form submission.
 * - Prevents the default form submission.
 * - Validates user credentials against localStorage.
 * - Manages session by setting 'loggedIn' and 'currentUser' in localStorage.
 * - Triggers the loading animation and transitions to the main app.
 */
document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = this.querySelector('input[placeholder="Enter your email"]').value.trim();
  const password = this.querySelector('input[placeholder="Enter your password"]').value;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert("Invalid email or password. Please try again.");
    return;
  }

  localStorage.setItem("loggedIn", "true");
  localStorage.setItem("currentUser", JSON.stringify(user));

  document.getElementById("authForm").style.display = "none";
  document.getElementById("loadingScreen").style.display = "block";

  // Loading animation timeline
  anime.timeline({ loop: false })
    .add({ targets: '.ml5 .line', opacity: [0.5, 1], scaleX: [0, 1], easing: "easeInOutExpo", duration: 700 })
    .add({ targets: '.ml5 .line', duration: 600, easing: "easeOutExpo", translateY: (el, i) => (-0.625 + 0.625 * 2 * i) + "em" })
    .add({ targets: '.ml5 .ampersand', opacity: [0, 1], scaleY: [0.5, 1], easing: "easeOutExpo", duration: 600, offset: '-=600' })
    .add({ targets: '.ml5 .letters-left', opacity: [0, 1], translateX: ["0.5em", 0], easing: "easeOutExpo", duration: 600, offset: '-=300' })
    .add({ targets: '.ml5 .letters-right', opacity: [0, 1], translateX: ["-0.5em", 0], easing: "easeOutExpo", duration: 600, offset: '-=600' })
    .add({ targets: '.ml5', opacity: 0, duration: 1000, easing: "easeOutExpo", delay: 1000 });

  // Transition to the main app after the loading animation
  setTimeout(() => {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("welcomeMessage").innerText = `Welcome back, ${user.username}!`;
    renderPosts();
  }, 4000);
});

// Toggles between the registration and login forms
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('authForm');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

// Toggles the visibility of the forgot password form
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const backToLogin = document.getElementById('backToLogin');
const signInContainer = document.querySelector('.sign-in-container');
const forgotPasswordContainer = document.querySelector('.forgot-password-container');

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        signInContainer.style.display = 'none';
        forgotPasswordContainer.style.display = 'block';
    });
}

if (backToLogin) {
    backToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordContainer.style.display = 'none';
        signInContainer.style.display = 'block';
    });
}

// Handles the submission of the forgot password form
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", function(e) {
      e.preventDefault();

      const email = this.querySelector('input[placeholder="Email"]').value.trim();

      let users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex(u => u.email === email);

      if (userIndex === -1) {
        alert("Email not found.");
        return;
      }

      const newPassword = prompt("Enter your new password:");
      if (newPassword) {
        users[userIndex].password = newPassword;
        localStorage.setItem("users", JSON.stringify(users));
        alert("Password updated successfully! Please log in with your new password.");
        forgotPasswordContainer.style.display = 'none';
        signInContainer.style.display = 'block';
      }
    });
}

// Toggles between light and dark themes and persists the choice in localStorage
document.querySelectorAll(".darkToggle").forEach(button => {
    button.addEventListener("click", () => {
        const html = document.documentElement;
        const current = html.getAttribute("data-theme");
        const newTheme = current === "dark" ? "light" : "dark";
        html.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
});

// Logs the user out by clearing session data from localStorage and reloading the page
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");
  location.reload();
});

// Scrolls to the post creation section
function scrollToPost() {
  document.getElementById("createPost").scrollIntoView({ behavior: "smooth" });
}

// Creates a new post and saves it to localStorage
function createPost() {
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const stream = document.getElementById("postStream").value;
  if (!title || !content) {
    alert("Please fill out all fields.");
    return;
  }

  const post = {
    id: Date.now(),
    title,
    content,
    stream,
    comments: []
  };

  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  posts.push(post);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();

  document.getElementById("postTitle").value = "";
  document.getElementById("postContent").value = "";
  document.getElementById("postStream").value = "Science";
}

// Searches for posts based on a query and renders the filtered results
function searchPosts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
}

// Filters posts by the selected stream and renders the results
function filterByStream() {
  const stream = document.getElementById("filterStream").value;
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const filtered = stream ? posts.filter(p => p.stream === stream) : posts;
  renderPosts(filtered);
}

// Renders the posts to the post feed
function renderPosts(data) {
  const posts = data || JSON.parse(localStorage.getItem("posts")) || [];
  const feed = document.getElementById("postFeed");
  feed.innerHTML = "";

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post-card";
    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <small>Stream: ${post.stream} ${emojiMap[post.stream]}</small>
      <button onclick="editPost(${post.id})">✏️ Edit</button>
      <button onclick="deletePost(${post.id})">🗑️ Delete</button>
      <div class="comments">
        ${post.comments.map((c, i) => `
          <p>💬 ${c}
            <button onclick="editComment(${post.id}, ${i})">✏️</button>
            <button onclick="deleteComment(${post.id}, ${i})">🗑️</button>
          </p>
        `).join("")}
      </div>
      <input type="text" placeholder="Add comment" onkeydown="addComment(event, ${post.id})"/>
    `;
    feed.appendChild(div);
  });
}

// Edits a post and updates it in localStorage
function editPost(id) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === id);
  if (!post) return;

  const newTitle = prompt("Edit title:", post.title);
  const newContent = prompt("Edit content:", post.content);
  if (newTitle !== null) post.title = newTitle;
  if (newContent !== null) post.content = newContent;

  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

// Deletes a post from localStorage
function deletePost(id) {
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

// Adds a comment to a post
function addComment(e, postId) {
  if (e.key === "Enter") {
    const comment = e.target.value.trim();
    if (!comment) return;

    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    post.comments.push(comment);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();

    e.target.value = "";
  }
}

// Edits a comment on a post
function editComment(postId, commentIndex) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const current = post.comments[commentIndex];
  const updated = prompt("Edit comment:", current);
  if (updated !== null) {
    post.comments[commentIndex] = updated;
    localStorage.setItem("posts", JSON.stringify(posts));
    renderPosts();
  }
}

// Deletes a comment from a post
function deleteComment(postId, commentIndex) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  post.comments.splice(commentIndex, 1);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

// Handles the submission of the career quiz
document.getElementById("quizForm").addEventListener("submit", function(e) {
  e.preventDefault();
  
  const answers = [];
  let allAnswered = true;
  for (let i = 1; i <= 10; i++) {
    const questionName = `q${i}`;
    const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
    if (selectedOption) {
      answers.push(selectedOption.value);
    } else {
      allAnswered = false;
      break;
    }
  }

  if (!allAnswered) {
    alert("answer every question");
    return;
  }

  const counts = { Science: 0, Commerce: 0, Arts: 0 };
  answers.forEach(ans => counts[ans]++);

  const stream = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  
  // Displays the quiz result with an animation
  const resultElement = document.getElementById("streamResult");
  resultElement.classList.remove("error-message");
  resultElement.classList.add("animate__animated", "animate__bounceIn");
  resultElement.innerHTML = `
    <div class="result-icon"><i class="fas fa-graduation-cap"></i></div>
    <div class="result-text">Suggested Stream: <span class="stream-highlight">${stream} ${emojiMap[stream]}</span></div>
  `;
  
  // Scrolls to the result and triggers a confetti animation
  resultElement.scrollIntoView({ behavior: "smooth" });
  triggerConfetti();
});

// Triggers a confetti animation for the quiz result
function triggerConfetti() {
  if (typeof canvasConfetti === "function") {
    canvasConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// Initializes the application on page load
window.addEventListener("load", () => {
  // Restores the theme from localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  // Restores the user session from localStorage
  if (localStorage.getItem("loggedIn") === "true") {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    document.getElementById("authForm").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    if (user.username) {
      document.getElementById("welcomeMessage").innerText = `Welcome back, ${user.username}!`;
      
      // Populates the user's profile information
      document.getElementById("profileUsername").innerText = user.username;
      document.getElementById("profileEmail").innerText = user.email;
      document.getElementById("profilePassword").innerText = user.password;
    }
  }
});

// Handles navigation between sections
const navButtons = ["homeBtn", "viewProfileBtn", "viewQuizBtn", "viewPostsBtn", "createPostBtn", "searchPostsBtn"];

navButtons.forEach(buttonId => {
  document.getElementById(buttonId).addEventListener("click", (event) => {
    const clickedButton = event.currentTarget;

    // Hide all content sections first
    document.getElementById("profile").style.display = "none";
    document.getElementById("quiz").style.display = "none";
    document.getElementById("createPost").style.display = "none";
    document.getElementById("search").style.display = "none";
    document.getElementById("posts").style.display = "none";

    // Remove active class from all buttons
    navButtons.forEach(id => document.getElementById(id).classList.remove("active-nav"));

    if (clickedButton.classList.contains("active-nav")) {
      // If already active, clicking again hides everything (go to "home page")
      // No further action needed as everything is already hidden and active class removed
    } else {
      // If not active, show its associated sections and set active class
      clickedButton.classList.add("active-nav");

      switch (buttonId) {
        case "homeBtn":
              // Home button just hides everything, which is already done above
              break;
        case "viewProfileBtn":
          document.getElementById("profile").style.display = "block";
          break;
        case "viewQuizBtn":
          document.getElementById("quiz").style.display = "block";
          break;
        case "viewPostsBtn":
          document.getElementById("posts").style.display = "block";
          renderPosts();
          break;
        case "createPostBtn":
          document.getElementById("createPost").style.display = "block";
          document.getElementById("posts").style.display = "block";
          renderPosts();
          break;
        case "searchPostsBtn":
          document.getElementById("search").style.display = "block";
          document.getElementById("posts").style.display = "block";
          renderPosts();
          break;
      }
    }
  });
});

// Toggles the visibility of the password in the profile section
document.getElementById("togglePassword").addEventListener("click", function() {
  const passwordField = document.getElementById("profilePassword");
  const icon = this.querySelector("i");
  
  if (passwordField.classList.contains("password-field")) {
    // Show password
    passwordField.classList.remove("password-field");
    passwordField.textContent = JSON.parse(localStorage.getItem("currentUser")).password;
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    // Hide password
    passwordField.classList.add("password-field");
    passwordField.textContent = "••••••••";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

// Handles the functionality of the 'Update Profile' button
document.getElementById("updateProfileBtn").addEventListener("click", function() {
  const profileSection = document.getElementById("profile");
  const isEditMode = profileSection.classList.contains("edit-mode");

  const usernameValue = document.getElementById("profileUsername");
  const passwordValue = document.getElementById("profilePassword");
  const updateBtn = document.getElementById("updateProfileBtn");
  const togglePasswordBtn = document.getElementById("togglePassword");

  if (isEditMode) {
    // Save mode: saves the updated profile information
    const newUsername = usernameValue.querySelector("input").value;
    const newPassword = passwordValue.querySelector("input").value;

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Updates the user in the main users list
    users = users.map(user => {
      if (user.email === currentUser.email) {
        return { ...user, username: newUsername, password: newPassword };
      }
      return user;
    });

    // Updates the currently logged-in user's data
    currentUser.username = newUsername;
    currentUser.password = newPassword;

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("users", JSON.stringify(users));

    // Reverts to view mode
    usernameValue.textContent = newUsername;
    passwordValue.textContent = '••••••••';
    passwordValue.classList.add("password-field");
    togglePasswordBtn.style.display = 'inline-block';


    updateBtn.innerHTML = '<i class="fas fa-save"></i> Update Profile';
    profileSection.classList.remove("edit-mode");

    // Updates the welcome message with the new username
    document.getElementById("welcomeMessage").innerText = `Welcome back, ${newUsername}!`;

    alert("Profile updated successfully!");

  } else {
    // Edit mode: allows the user to edit their profile information
    const currentUsername = JSON.parse(localStorage.getItem("currentUser")).username;
    const currentPassword = JSON.parse(localStorage.getItem("currentUser")).password;

    usernameValue.innerHTML = `<input type="text" value="${currentUsername}" class="profile-edit-input">`;
    passwordValue.innerHTML = `<input type="text" value="${currentPassword}" class="profile-edit-input">`;
    passwordValue.classList.remove("password-field");
    togglePasswordBtn.style.display = 'none';


    updateBtn.innerHTML = '<i class="fas fa-save"></i> Save Profile';
    profileSection.classList.add("edit-mode");
  }
});

// Handles the deletion of a user account
document.getElementById("deleteAccountBtn").addEventListener("click", () => {
  const confirmDelete = confirm("Are you sure you want to permanently delete your account? This cannot be undone.");
  if (!confirmDelete) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("No account found to delete.");
    return;
  }

  // Removes the user from the stored users list
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.email !== currentUser.email);
  localStorage.setItem("users", JSON.stringify(users));

  // Clears the user's session
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");

  alert("Your account has been deleted permanently.");
  location.reload();
});
