// 🌙 Dark Mode Toggle
document.getElementById("darkToggle").onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
};

// 🧠 Career Quiz Logic
document.getElementById("quizForm").onsubmit = function(e) {
  e.preventDefault();
  const form = new FormData(e.target);
  const scores = { Science: 0, Commerce: 0, Arts: 0 };
  for (let [_, value] of form.entries()) {
    scores[value]++;
  }
  const stream = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  document.getElementById("streamResult").innerText = `Recommended Stream: ${stream}`;
};

// 📝 Post Creation
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

// 🗣️ Render Posts
function renderPosts(data = posts) {
  const feed = document.getElementById("postFeed");
  feed.innerHTML = "";

  data.forEach((post, index) => {
    const div = document.createElement("div");
    div.classList.add("post-card", "animate__animated", "animate__fadeInUp");
    div.innerHTML = `
      <h3>${post.title} (${post.stream})</h3>
      <p>${post.content}</p>
      <input type="text" placeholder="Add comment..." onkeypress="addComment(event, ${index})">
      ${post.comments.map(c => `<div class="comment">💬 ${c}</div>`).join("")}
    `;
    feed.appendChild(div);
  });
}

// 💬 Add Comment
function addComment(e, index) {
  if (e.key === "Enter") {
    const comment = e.target.value.trim();
    if (comment) {
      posts[index].comments.push(comment);
      renderPosts(posts);
    }
  }
}

// 🔍 Search Posts
function searchPosts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered);
}

// 🎯 Filter by Stream
function filterByStream() {
  const stream = document.getElementById("filterStream").value;
  const filtered = stream ? posts.filter(p => p.stream === stream) : posts;
  renderPosts(filtered);
}
