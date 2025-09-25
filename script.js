// 🌟 Emoji Map
const emojiMap = { Science: "🧪", Commerce: "💼", Arts: "🎨" };

// 🆕 Register Submission
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
  document.querySelector(".register").classList.remove("active");
  document.querySelector(".login").classList.add("active");
});

// 🔐 Login Submission
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

  anime.timeline({ loop: false })
    .add({ targets: '.ml5 .line', opacity: [0.5, 1], scaleX: [0, 1], easing: "easeInOutExpo", duration: 700 })
    .add({ targets: '.ml5 .line', duration: 600, easing: "easeOutExpo", translateY: (el, i) => (-0.625 + 0.625 * 2 * i) + "em" })
    .add({ targets: '.ml5 .ampersand', opacity: [0, 1], scaleY: [0.5, 1], easing: "easeOutExpo", duration: 600, offset: '-=600' })
    .add({ targets: '.ml5 .letters-left', opacity: [0, 1], translateX: ["0.5em", 0], easing: "easeOutExpo", duration: 600, offset: '-=300' })
    .add({ targets: '.ml5 .letters-right', opacity: [0, 1], translateX: ["-0.5em", 0], easing: "easeOutExpo", duration: 600, offset: '-=600' })
    .add({ targets: '.ml5', opacity: 0, duration: 1000, easing: "easeOutExpo", delay: 1000 });

  setTimeout(() => {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("welcomeMessage").innerText = `Welcome back, ${user.username}!`;
    renderPosts();
  }, 4000);
});

// 🔄 Register/Login Toggle
document.querySelector(".switch-to-register").addEventListener("click", e => {
  e.preventDefault();
  document.querySelector(".login").classList.remove("active");
  document.querySelector(".register").classList.add("active");
});
document.querySelector(".switch-to-login").addEventListener("click", e => {
  e.preventDefault();
  document.querySelector(".register").classList.remove("active");
  document.querySelector(".login").classList.add("active");
});

// 🌓 Dark Mode Toggle with persistence
document.getElementById("darkToggle").addEventListener("click", () => {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// 🚪 Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");
  location.reload();
});

// ➕ Scroll to Post
function scrollToPost() {
  document.getElementById("createPost").scrollIntoView({ behavior: "smooth" });
}

// 📝 Create Post
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

// 🔍 Search Posts
function searchPosts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
}

// 🧠 Filter by Stream
function filterByStream() {
  const stream = document.getElementById("filterStream").value;
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const filtered = stream ? posts.filter(p => p.stream === stream) : posts;
  renderPosts(filtered);
}

// 💬 Render Posts
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

// ✏️ Edit Post
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

// 🗑️ Delete Post
function deletePost(id) {
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

// 💬 Add Comment
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

// ✏️ Edit Comment
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

// 🗑️ Delete Comment
function deleteComment(postId, commentIndex) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  post.comments.splice(commentIndex, 1);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
}

// 🧠 Quiz Submission
document.getElementById("quizForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const answers = Array.from(this.elements)
    .filter(el => el.tagName === "SELECT")
    .map(el => el.value);

  const counts = { Science: 0, Commerce: 0, Arts: 0 };
  answers.forEach(ans => counts[ans]++);

  const stream = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  document.getElementById("streamResult").innerText = `Suggested Stream: ${stream} ${emojiMap[stream]}`;
  triggerConfetti();
});

// 🎉 Confetti
function triggerConfetti() {
  if (typeof canvasConfetti === "function") {
    canvasConfetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

// 🚀 Auto-init on load (theme + session)
window.addEventListener("load", () => {
  // Theme persistence
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  // Session restore
  if (localStorage.getItem("loggedIn") === "true") {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    document.getElementById("authForm").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    if (user.username) {
      document.getElementById("welcomeMessage").innerText = `Welcome back, ${user.username}!`;
      
      // Set profile information
      document.getElementById("profileUsername").innerText = user.username;
      document.getElementById("profileEmail").innerText = user.email;
      document.getElementById("profilePassword").innerText = user.password;
    }
    renderPosts();
  }
});

// Navigation buttons functionality
document.getElementById("viewProfileBtn").addEventListener("click", () => {
  document.getElementById("profile").style.display = "block";
  document.getElementById("quiz").style.display = "none";
  document.getElementById("createPost").style.display = "none";
  document.getElementById("search").style.display = "none";
  document.getElementById("posts").style.display = "none";
});

document.getElementById("viewQuizBtn").addEventListener("click", () => {
  document.getElementById("profile").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  document.getElementById("createPost").style.display = "none";
  document.getElementById("search").style.display = "none";
  document.getElementById("posts").style.display = "none";
});
document.getElementById("deleteAccountBtn").addEventListener("click", () => {
  const confirmDelete = confirm("Are you sure you want to permanently delete your account? This cannot be undone.");
  if (!confirmDelete) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("No account found to delete.");
    return;
  }

  // Remove user from stored users list
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.email !== currentUser.email);
  localStorage.setItem("users", JSON.stringify(users));

  // Clear session
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");

  alert("Your account has been deleted permanently.");
  location.reload();
});
