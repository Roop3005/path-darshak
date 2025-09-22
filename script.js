// 🔐 LOGIN / REGISTER SYSTEM
const authForm = document.getElementById("authForm");
const mainApp = document.getElementById("mainApp");

// Show main app if user is logged in
if (localStorage.getItem("loggedIn") === "true") {
  authForm.style.display = "none";
  mainApp.style.display = "block";
}

// Toggle between login and register forms
document.querySelector(".switch-to-register").onclick = function(e) {
  e.preventDefault();
  document.querySelector(".login").classList.remove("active");
  document.querySelector(".register").classList.add("active");
};
document.querySelector(".switch-to-login").onclick = function(e) {
  e.preventDefault();
  document.querySelector(".register").classList.remove("active");
  document.querySelector(".login").classList.add("active");
};

// Handle login form submission
document.querySelector(".login form").onsubmit = function(e) {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value.trim();
  const password = e.target.querySelector('input[type="password"]').value.trim();
  const stored = JSON.parse(localStorage.getItem("user"));

  if (stored && stored.email === email && stored.password === password) {
    alert("Login successful!");
    localStorage.setItem("loggedIn", "true");
    authForm.style.display = "none";
    mainApp.style.display = "block";
  } else {
    alert("Invalid email or password.");
  }
};

// Handle register form submission
document.querySelector(".register form").onsubmit = function(e) {
  e.preventDefault();
  const inputs = e.target.querySelectorAll("input");
  const username = inputs[0].value.trim();
  const email = inputs[1].value.trim();
  const password = inputs[2].value.trim();
  const confirm = inputs[3].value.trim();

  if (password !== confirm) {
    alert("Passwords do not match.");
    return;
  }

  localStorage.setItem("user", JSON.stringify({ username, email, password }));
  alert("Registration successful!");
  document.querySelector(".register").classList.remove("active");
  document.querySelector(".login").classList.add("active");
};

// 🌙 DARK MODE TOGGLE
document.getElementById("darkToggle").onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
};

// 🎉 QUIZ LOGIC + CONFETTI
document.getElementById("quizForm").onsubmit = function(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const scores = { Science: 0, Commerce: 0, Arts: 0 };

  for (let [_, value] of form.entries()) {
    scores[value]++;
  }

  const stream = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  document.getElementById("streamResult").innerText = `Recommended Stream: ${stream}`;

  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
};

// 📝 POST CREATION
let posts = [];

function createPost() {
  const title = document.getElementById("postTitle").value;
  const content = document.getElementById("postContent").value;
  const stream = document.getElementById("postStream").value;

  if (!title || !content) {
    alert("Fill all fields");
    return;
  }

  posts.unshift({ title, content, stream, comments: [] });
  renderPosts(posts);
}

// 🗣️ RENDER POSTS WITH STREAM BADGES
function renderPosts(data = posts) {
  const feed = document.getElementById("postFeed");
  feed.innerHTML = "";

  data.forEach((post, index) => {
    const badge = post.stream === "Science" ? "🧪" :
                  post.stream === "Commerce" ? "💼" :
                  post.stream === "Arts" ? "🎭" : "";

    const div = document.createElement("div");
    div.classList.add("post-card", "animate__animated", "animate__fadeInUp");
    div.innerHTML = `
      <h3>${badge} ${post.title} (${post.stream})</h3>
      <p>${post.content}</p>
      <input type="text" placeholder="Add comment..." onkeypress="addComment(event, ${index})">
      ${post.comments.map(c => `<div class="comment">💬 ${c}</div>`).join("")}
    `;
    feed.appendChild(div);
  });
}

// 💬 ADD COMMENT
function addComment(e, index) {
  if (e.key === "Enter") {
    const comment = e.target.value.trim();
    if (comment) {
      posts[index].comments.push(comment);
      renderPosts(posts);
    }
  }
}

// 🔍 SEARCH POSTS
function searchPosts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
}

// 🎯 FILTER BY STREAM
function filterByStream() {
  const stream = document.getElementById("filterStream").value;
  const filtered = stream ? posts.filter(p => p.stream === stream) : posts;
  renderPosts(filtered);
}

// ➕ SCROLL TO POST CREATION
function scrollToPost() {
  document.getElementById("createPost").scrollIntoView({ behavior: "smooth" });
}
// 🔓 LOGOUT FUNCTIONALITY
document.getElementById("logoutBtn").onclick = function() {
  localStorage.removeItem("loggedIn");
  alert("You have been logged out.");
  location.reload(); // Refresh to show login form again
};
