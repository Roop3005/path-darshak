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

  users.push({ username, email, password, quizResult: null }); // Add quizResult to new user
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

console.log('signUpButton:', signUpButton);
console.log('authForm container:', container);

signUpButton.addEventListener('click', () => {
	console.log('Sign Up button clicked!');
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

function formatTimestamp(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const options = {
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: '2-digit', minute: '2-digit'
    };
    return date.toLocaleString(undefined, options);
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

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const post = {
    id: Date.now(),
    title,
    content,
    stream,
    author: currentUser.email,
    comments: [],
    timestamp: new Date().toISOString(),
    likes: []
  };

  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  posts.push(post);
  localStorage.setItem("posts", JSON.stringify(posts));
  
  alert("Your post has been posted Pls go to view profile to make changes in it");

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
  renderPosts(); // Re-render with the new filter applied
}

function getCommentHTML(post, comment, index) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    
    const isObject = typeof comment === 'object' && comment !== null;
    const commentText = isObject ? comment.text : comment;
    const commentAuthor = isObject ? comment.author : null;
    const commentTimestamp = isObject ? comment.timestamp : null;

    let buttons = '';
    if (commentAuthor === currentUser.email) {
        buttons = `
            <button onclick="editComment(${post.id}, ${index})">✏️</button>
            <button onclick="deleteComment(${post.id}, ${index})">🗑️</button>
        `;
    }

    const timestampHTML = commentTimestamp ? `<small class="comment-timestamp"> - ${formatTimestamp(commentTimestamp)}</small>` : '';

    return `<p>💬 ${commentText} ${buttons} ${timestampHTML}</p>`;
}

function toggleLike(postId) {
    let posts = JSON.parse(localStorage.getItem("posts")) || [];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const post = posts.find(p => p.id === postId);

    if (!post) return;

    if (!post.likes) post.likes = []; // Initialize likes array if it doesn't exist

    const likeIndex = post.likes.indexOf(currentUser.email);
    if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1); // Unlike
    } else {
        post.likes.push(currentUser.email); // Like
    }

    localStorage.setItem("posts", JSON.stringify(posts));

    if (document.getElementById('viewProfileBtn').classList.contains('active-nav')) {
        renderUserPosts();
    } else {
        renderPosts();
    }
}

// Renders the posts to the post feed
function renderPosts(data) {
  let posts;
  if (data) {
    posts = data;
  } else {
    const allPosts = JSON.parse(localStorage.getItem("posts")) || [];
    const viewPostsBtn = document.getElementById("viewPostsBtn");
    const createPostBtn = document.getElementById("createPostBtn");

    if (viewPostsBtn.classList.contains("active-nav") || createPostBtn.classList.contains("active-nav")) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      posts = allPosts.filter(p => !p.author || p.author !== currentUser.email);
    } else {
      posts = allPosts;
    }
  }

  // Handle filtering
  const streamFilter = document.getElementById("filterStream").value;
  if (streamFilter) {
      posts = posts.filter(p => p.stream === streamFilter);
  }

  // Handle sorting
  const sortValue = document.getElementById("sortPosts").value;
  if (sortValue === 'popular') {
      posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  } else {
      posts.sort((a, b) => b.id - a.id); // Newest first
  }

  const feed = document.getElementById("postFeed");
  feed.innerHTML = "";

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post-card";
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const isLiked = post.likes?.includes(currentUser.email);

    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <small>Stream: ${post.stream} ${emojiMap[post.stream]}</small>
      <br>
      <small>Posted on: ${formatTimestamp(post.timestamp)}</small>
      <div class="post-actions">
        <button onclick="toggleLike(${post.id})">${isLiked ? '❤️' : '🤍'} ${post.likes?.length || 0}</button>
        <button onclick="editPost(${post.id})">✏️ Edit</button>
        <button onclick="deletePost(${post.id})">🗑️ Delete</button>
      </div>
      <div class="comments">
        ${post.comments.map((c, i) => getCommentHTML(post, c, i)).join("")}
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

  // Conditionally render the correct view after deletion
  if (document.getElementById('viewProfileBtn').classList.contains('active-nav')) {
    renderUserPosts();
  } else {
    renderPosts();
  }
}

// Adds a comment to a post
function addComment(e, postId) {
  if (e.key === "Enter") {
    const commentText = e.target.value.trim();
    if (!commentText) return;

    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const newComment = {
      text: commentText,
      author: currentUser.email,
      timestamp: new Date().toISOString()
    };

    post.comments.push(newComment);
    localStorage.setItem("posts", JSON.stringify(posts));

    if (document.getElementById('viewProfileBtn').classList.contains('active-nav')) {
        renderUserPosts();
    } else {
        renderPosts();
    }

    e.target.value = "";
  }
}

// Edits a comment on a post
function editComment(postId, commentIndex) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const comment = post.comments[commentIndex];
  const commentText = (typeof comment === 'string') ? comment : comment.text;
  const commentAuthor = (typeof comment === 'string') ? null : comment.author;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (commentAuthor !== currentUser.email) {
    alert("You can only edit your own comments.");
    return;
  }

  const updatedText = prompt("Edit comment:", commentText);
  if (updatedText !== null) {
    comment.text = updatedText;
    localStorage.setItem("posts", JSON.stringify(posts));

    if (document.getElementById('viewProfileBtn').classList.contains('active-nav')) {
        renderUserPosts();
    } else {
        renderPosts();
    }
  }
}

// Deletes a comment from a post
function deleteComment(postId, commentIndex) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const comment = post.comments[commentIndex];
  const commentAuthor = (typeof comment === 'string') ? null : comment.author;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (commentAuthor !== currentUser.email) {
    alert("You can only delete your own comments.");
    return;
  }

  post.comments.splice(commentIndex, 1);
  localStorage.setItem("posts", JSON.stringify(posts));

  if (document.getElementById('viewProfileBtn').classList.contains('active-nav')) {
      renderUserPosts();
  } else {
      renderPosts();
  }
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
  
  const detailedResults = {
      Science: "Your answers suggest a strong inclination towards the Science stream. You might enjoy careers in Engineering, Medicine, or Scientific Research.",
      Commerce: "Your answers suggest a strong inclination towards the Commerce stream. You might enjoy careers in Accounting, Finance, or Business Management.",
      Arts: "Your answers suggest a strong inclination towards the Arts stream. You might enjoy careers in Design, Journalism, or Psychology."
  };

  const resultText = detailedResults[stream];

  // Save result to user profile
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = allUsers.findIndex(u => u.email === currentUser.email);

  if (userIndex !== -1) {
      allUsers[userIndex].quizResult = stream;
      currentUser.quizResult = stream;
      localStorage.setItem("users", JSON.stringify(allUsers));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  // Displays the quiz result with an animation
  const resultElement = document.getElementById("streamResult");
  resultElement.classList.remove("error-message");
  resultElement.classList.add("animate__animated", "animate__bounceIn");
  resultElement.innerHTML = `
    <div class="result-icon"><i class="fas fa-graduation-cap"></i></div>
    <div class="result-text">${resultText}</div>
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

function populateProfile() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (!user.username) return;

  document.getElementById("profileUsername").innerText = user.username;
  document.getElementById("profileEmail").innerText = user.email;
  document.getElementById("profilePassword").innerText = '••••••••'; // Keep password masked by default
  
  const quizResultEl = document.getElementById("profileQuizResult");
  if (user.quizResult) {
    quizResultEl.innerText = user.quizResult;
    quizResultEl.style.fontWeight = 'bold';
  } else {
    quizResultEl.innerText = "Not taken yet";
    quizResultEl.style.fontWeight = 'normal';
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
      populateProfile();
    }
  }
});

function renderUserPosts() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  let userPosts = posts.filter(p => p.author === currentUser.email);

  // Sort user's own posts by newest first
  userPosts.sort((a, b) => b.id - a.id);

  const feed = document.getElementById("userPostsFeed");
  feed.innerHTML = "";

  if (userPosts.length === 0) {
    feed.innerHTML = "<p>You haven't created any posts yet.</p>";
    return;
  }

  userPosts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post-card";
    const isLiked = post.likes?.includes(currentUser.email);

    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <small>Stream: ${post.stream} ${emojiMap[post.stream]}</small>
      <br>
      <small>Posted on: ${formatTimestamp(post.timestamp)}</small>
      <div class="post-actions">
        <button onclick="toggleLike(${post.id})">${isLiked ? '❤️' : '🤍'} ${post.likes?.length || 0}</button>
        <button onclick="editPost(${post.id})">✏️ Edit</button>
        <button onclick="deletePost(${post.id})">🗑️ Delete</button>
      </div>
      <div class="comments">
        ${post.comments.map((c, i) => getCommentHTML(post, c, i)).join("")}
      </div>
      <input type="text" placeholder="Add comment" onkeydown="addComment(event, ${post.id})"/>
    `;
    feed.appendChild(div);
  });
}

// Handles navigation between sections
const navButtons = ["homeBtn", "viewProfileBtn", "viewQuizBtn", "roadmapsBtn", "viewPostsBtn", "createPostBtn", "searchPostsBtn", "alumniExperienceBtn"];

navButtons.forEach(buttonId => {
  document.getElementById(buttonId).addEventListener("click", (event) => {
    const clickedButton = event.currentTarget;

    // Hide all content sections first
    document.getElementById("profile").style.display = "none";
    document.getElementById("quiz").style.display = "none";
    document.getElementById("createPost").style.display = "none";
    document.getElementById("search").style.display = "none";
    document.getElementById("posts").style.display = "none";
    document.getElementById("roadmaps").style.display = "none";
    document.getElementById("alumniExperience").style.display = "none";
    document.getElementById("alumni-start").style.display = "none";
    document.getElementById("alumni-q1-stream").style.display = "none";
    document.getElementById("alumni-q2-details").style.display = "none";

    // Remove active class from all buttons
    navButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove("active-nav");
    });

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
          populateProfile();
          renderUserPosts();
          break;
        case "viewQuizBtn":
          document.getElementById("quiz").style.display = "block";
          break;
        case "roadmapsBtn":
          document.getElementById("roadmaps").style.display = "block";
          renderRoadmaps();
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
            renderPosts(); // Initial render for search view
            break;
        case "alumniExperienceBtn":
            document.getElementById("alumniExperience").style.display = "block";
            renderAlumniStories();
            break;
      } // Closing brace for switch statement
    } // Closing brace for else block
  }); // Closing brace for navButtons.forEach
}); // Missing closing brace for navButtons.forEach

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

const roadmapsData = [
    {
        title: "Software Engineer",
        steps: [
            "Complete 12th Grade with a focus on Math and Physics.",
            "Pursue a Bachelor's degree in Computer Science or a related field.",
            "Learn core programming languages like Python, Java, or C++.",
            "Build personal projects and contribute to open-source.",
            "Complete internships to gain practical experience.",
            "Prepare for technical interviews (Data Structures & Algorithms).",
            "Apply for entry-level software engineering roles."
        ]
    },
    {
        title: "Chartered Accountant (CA)",
        steps: [
            "Clear 12th Grade in Commerce.",
            "Register for the CA Foundation course after 12th.",
            "Clear the CA Foundation exam.",
            "Register for the CA Intermediate course.",
            "Complete three years of practical training (articleship) under a practicing CA.",
            "Clear both groups of the CA Intermediate exam.",
            "Register for and clear the CA Final exam."
        ]
    },
    {
        title: "Graphic Designer",
        steps: [
            "Develop a strong foundation in drawing and art fundamentals.",
            "Pursue a degree or diploma in Graphic Design, Fine Arts, or a related field.",
            "Master industry-standard software like Adobe Photoshop, Illustrator, and InDesign.",
            "Build a strong portfolio showcasing a variety of design work.",
            "Do freelance projects or internships to gain real-world experience.",
            "Network with other designers and professionals in the industry.",
            "Apply for junior designer roles or start a freelance business."
        ]
    },
    {
        title: "Doctor (MBBS)",
        steps: [
            "Complete 12th Grade with Physics, Chemistry, and Biology (PCB).",
            "Qualify the NEET (National Eligibility cum Entrance Test) exam.",
            "Complete the 5.5-year MBBS degree program.",
            "Complete a one-year compulsory rotating internship.",
            "Register with the Medical Council of India (MCI) or State Medical Council.",
            "Optional: Pursue post-graduation (MD/MS) for specialization.",
            "Practice as a registered medical doctor."
        ]
    },
    {
        title: "Lawyer",
        steps: [
            "Complete 12th Grade from any stream.",
            "Appear for law entrance exams like CLAT, AILET, LSAT.",
            "Pursue a 5-year integrated LLB or a 3-year LLB after graduation.",
            "Enroll with a State Bar Council.",
            "Pass the All India Bar Examination (AIBE).",
            "Practice as an advocate in courts or join a law firm."
        ]
    },
    {
        title: "Data Scientist",
        steps: [
            "Obtain a Bachelor's degree in a quantitative field (e.g., Computer Science, Stats).",
            "Master programming languages like Python or R.",
            "Learn statistics, probability, and machine learning concepts.",
            "Gain proficiency in data analysis libraries (e.g., Pandas, NumPy).",
            "Learn data visualization tools (e.g., Tableau, Matplotlib).",
            "Build a portfolio of data science projects.",
            "Consider a Master's degree or specialized certification."
        ]
    }
];

function renderRoadmaps() {
    const container = document.getElementById('roadmapsContainer');
    container.innerHTML = '';
    roadmapsData.forEach(roadmap => {
        const card = document.createElement('div');
        card.className = 'roadmap-card';
        
        const title = document.createElement('h3');
        title.className = 'roadmap-title';
        title.textContent = roadmap.title;
        card.appendChild(title);
        
        const stepsList = document.createElement('ul');
        stepsList.className = 'roadmap-steps';
        
        roadmap.steps.forEach(stepText => {
            const step = document.createElement('li');
            step.className = 'roadmap-step';
            step.textContent = stepText;
            stepsList.appendChild(step);
        });
        
        card.appendChild(stepsList);
        container.appendChild(card);
    });
}

// --- Alumni Feature Listeners ---
let alumniStoryData = {};

document.getElementById('addAlumniStoryBtn').addEventListener('click', () => {
    document.getElementById('roadmaps').style.display = 'none';
    document.getElementById('alumni-start').style.display = 'block';
    document.getElementById('roadmapsBtn').classList.remove('active-nav');
});

document.getElementById('alumni-no-btn').addEventListener('click', () => {
    document.getElementById('alumni-start').style.display = 'none';
    document.getElementById('viewProfileBtn').click();
});

document.getElementById('alumni-yes-btn').addEventListener('click', () => {
    document.getElementById('alumni-start').style.display = 'none';
    document.getElementById('alumni-q1-stream').style.display = 'block';
});

document.querySelectorAll('.stream-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const stream = e.target.dataset.stream;
        if (confirm(`You selected ${stream}. Is this correct?`)) {
            alumniStoryData.stream = stream;
            document.getElementById('alumni-q1-stream').style.display = 'none';
            document.getElementById('alumni-q2-details').style.display = 'block';
        }
    });
});

document.getElementById('alumni-details-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alumniStoryData.whyStream = document.getElementById('whyStream').value;
    alumniStoryData.regret = document.getElementById('regretStream').value;
    alumniStoryData.currentStatus = document.getElementById('currentStatus').value;

    alert("Thank you for sharing your story! Your experience will help guide others.");
    
    const alumniStories = JSON.parse(localStorage.getItem("alumniStories")) || [];
    alumniStories.push(alumniStoryData);
    localStorage.setItem("alumniStories", JSON.stringify(alumniStories));

    console.log("Collected Alumni Story:", alumniStoryData);

    // Reset and hide form
    document.getElementById('alumni-details-form').reset();
    document.getElementById('alumni-q2-details').style.display = 'none';
    document.getElementById('homeBtn').click();
});

function renderAlumniStories() {
    const container = document.getElementById('alumniExperienceContainer');
    container.innerHTML = '';
    const stories = JSON.parse(localStorage.getItem("alumniStories")) || [];

    if (stories.length === 0) {
        container.innerHTML = "<p>No alumni stories have been shared yet.</p>";
        return;
    }

    stories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'alumni-story-card';
        
        card.innerHTML = `
            <h3>Stream: ${story.stream}</h3>
            <p><strong>Why this stream?</strong> ${story.whyStream}</p>
            <p><strong>Any regrets?</strong> ${story.regret}</p>
            <p><strong>Current Status:</strong> ${story.currentStatus}</p>
        `;
        
        container.appendChild(card);
    });
}


