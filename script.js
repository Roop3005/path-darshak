/**
 * This file contains the core JavaScript logic for the PathPradarshak application.
 * It handles user authentication, dynamic content rendering, and interactive features.
 */

// Map of streams to their corresponding emojis
const emojiMap = { Science: "🧪", Commerce: "💼", Arts: "🎨" };

// Global UI state used across sections (e.g., alumni flow transitions)
let activeSection = null;
let isTransitioning = false;

document.addEventListener("DOMContentLoaded", () => {

    // --- NEW GSAP-BASED UI LOGIC ---

    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('main > section');
    activeSection = document.querySelector('#posts'); // Default active section

    // Initial animation for the app loading
    const initialLoad = () => {
        if (document.body.classList.contains('logged-in')) {
            gsap.from(".header-bar", { y: -100, opacity: 0, duration: 0.8, ease: 'power3.out' });
            gsap.from(".nav-menu", { x: -200, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
            gsap.from(activeSection, { opacity: 0, y: 50, duration: 0.8, ease: 'power3.out', delay: 0.4 });
        }
    };

    // Translucent full-screen intro animation shown on every page load
    const showIntro = () => {
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'introOverlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            background: 'cyan',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            opacity: '0',
            pointerEvents: 'auto', // block interaction while intro plays
            cursor: 'wait'
        });

        // Inject provided markup scoped inside overlay
        overlay.innerHTML = `
          <h1 class="ml4">
            <span class="letters letters-1">Ready</span>
            <span class="letters letters-2">Set</span>
            <span class="letters letters-3">Go!</span>
          </h1>
        `;

        // Add scoped styles
        const style = document.createElement('style');
        style.textContent = `
          /* Solid background for the intro overlay */
          #introOverlay { position: fixed; isolation: isolate; background: cyan; display: flex; align-items: center; justify-content: center; text-align: center; }

          /* Title styles (scoped) */
          #introOverlay .ml4 { position: relative; margin: 0; text-align: center; font-weight: 900; font-size: clamp(28px, 6vw, 72px); color: #ffffff; text-shadow: 0 6px 24px rgba(0,0,0,0.35); }
          #introOverlay .ml4 .letters { position: absolute; margin: auto; left: 0; right: 0; top: 0; bottom: 0; opacity: 0; }
        `;

        document.body.appendChild(style);
        document.body.appendChild(overlay);

        const run = () => {
            // Fade in overlay
            gsap.to(overlay, { opacity: 1, duration: 0.25, ease: 'power2.out' });

            const ml4 = { opacityIn: [0,1], scaleIn: [0.2,1], scaleOut: 3, durationIn: 800, durationOut: 600, delay: 500 };

            anime.timeline({ loop: false })
              .add({ targets: '#introOverlay .ml4 .letters-1', opacity: ml4.opacityIn, scale: ml4.scaleIn, duration: ml4.durationIn })
              .add({ targets: '#introOverlay .ml4 .letters-1', opacity: 0, scale: ml4.scaleOut, duration: ml4.durationOut, easing: 'easeInExpo', delay: ml4.delay })
              .add({ targets: '#introOverlay .ml4 .letters-2', opacity: ml4.opacityIn, scale: ml4.scaleIn, duration: ml4.durationIn })
              .add({ targets: '#introOverlay .ml4 .letters-2', opacity: 0, scale: ml4.scaleOut, duration: ml4.durationOut, easing: 'easeInExpo', delay: ml4.delay })
              .add({ targets: '#introOverlay .ml4 .letters-3', opacity: ml4.opacityIn, scale: ml4.scaleIn, duration: ml4.durationIn })
              .add({ targets: '#introOverlay .ml4 .letters-3', opacity: 0, scale: ml4.scaleOut, duration: ml4.durationOut, easing: 'easeInExpo', delay: ml4.delay })
              .add({
                  targets: '#introOverlay .ml4', opacity: 0, duration: 500, delay: 500, complete: () => {
                      gsap.to(overlay, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => { overlay.remove(); style.remove(); } });
                  }
              });
        };

        // Load anime.js if needed, then run
        if (typeof anime === 'undefined') {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js';
            s.onload = run;
            document.body.appendChild(s);
        } else {
            run();
        }
    };

    // (Removed showWelcome animation per request)

    // Always show intro on load
    showIntro();

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isTransitioning) return;

            const buttonId = button.id;
            let targetId;

            // New, more robust mapping
            switch (buttonId) {
                case 'homeBtn':
                case 'viewPostsBtn':
                    targetId = 'posts';
                    break;
                case 'viewProfileBtn':
                    targetId = 'profile';
                    break;
                case 'viewQuizBtn':
                    targetId = 'quiz';
                    break;
                case 'searchPostsBtn':
                    targetId = 'search';
                    break;
                default:
                    // Default behavior: remove 'Btn'
                    targetId = buttonId.replace('Btn', '');
                    break;
            }

            const targetSection = document.getElementById(targetId);

            if (targetSection && targetSection !== activeSection) {
                isTransitioning = true;

                // Run section-specific logic BEFORE transition
                if (targetId === 'profile') {
                    populateProfile();
                    renderUserPosts();
                } else if (targetId === 'posts') {
                    renderPosts();
                } else if (targetId === 'roadmaps') {
                    renderRoadmaps();
                } else if (targetId === 'alumniExperience') {
                    renderAlumniStories();
                } else if (targetId === 'search') {
                    // Do not auto-render posts in search; keep it empty until user searches
                    const searchFeed = document.getElementById('searchPostFeed');
                    if (searchFeed) searchFeed.innerHTML = '';
                }

                // Always reset the main scroll position to top when switching tabs
                const mainEl = document.querySelector('main');
                if (mainEl) mainEl.scrollTop = 0;

                gsap.timeline({ onComplete: () => isTransitioning = false })
                    .to(activeSection, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' })
                    .set(activeSection, { visibility: 'hidden' })
                    .set(targetSection, { visibility: 'visible', y: 30 })
                    .to(targetSection, { 
                        opacity: 1, 
                        y: 0, 
                        duration: 0.5, 
                        ease: 'power2.out',
                        onComplete: () => {
                            // Animate children of the new section
                            const children = targetSection.querySelectorAll('.post-card, .profile-item, .quiz-question, .roadmap-card, .alumni-story-card');
                            if(children.length > 0) {
                                gsap.from(children, { opacity: 0, y: 20, stagger: 0.1, duration: 0.4, ease: 'power2.out' });
                            }
                        }
                    });

                activeSection = targetSection;

                navButtons.forEach(btn => btn.classList.remove('active-nav'));
                button.classList.add('active-nav');
            }
        });
    });

    // --- EXISTING AUTH AND LOGIC ADAPTED FOR NEW UI ---

    // Check login state on load
    if (localStorage.getItem("loggedIn") === "true") {
        document.body.classList.add("logged-in");
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
        initialLoad(); // Trigger app load animation
    } else {
        document.body.classList.remove("logged-in");
        // Mobile-first auth flow: show Sign Up first for users who haven't registered yet
        try {
            const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
            const hasSignedUp = localStorage.getItem('hasSignedUp') === 'true';
            const authContainer = document.getElementById('authForm');
            if (authContainer) {
                if (isMobile && !hasSignedUp) {
                    // Show Sign Up panel first on phones
                    authContainer.classList.add('right-panel-active');
                } else {
                    // Default to Sign In
                    authContainer.classList.remove('right-panel-active');
                }
            }
        } catch (e) {}
    }

    // Theme toggle
    document.querySelectorAll(".darkToggle").forEach(button => {
        button.addEventListener("click", () => {
            const html = document.documentElement;
            const current = html.getAttribute("data-theme");
            const newTheme = current === "dark" ? "light" : "dark";
            html.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    });

    // Restore theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }
});


// --- ALL EXISTING APPLICATION LOGIC IS PRESERVED BELOW ---

/**
 * Handles the registration form submission.
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

  users.push({ username, email, password, quizResult: null });
  localStorage.setItem("users", JSON.stringify(users));

  // Mark that this device has completed sign-up once
  try { localStorage.setItem('hasSignedUp', 'true'); } catch (_) {}

  alert("Registration successful! Please log in.");
  document.getElementById('authForm').classList.remove("right-panel-active");
});

/**
 * Handles the login form submission.
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

  // Add logged-in class and reload to trigger the new UI flow
  document.body.classList.add("logged-in");
  // Mark that we just logged in so we can control which animation shows after reload
  try { sessionStorage.setItem('justLoggedIn', 'true'); } catch (_) {}
  location.reload();
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

// Forgot password logic
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

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");
  document.body.classList.remove("logged-in");
  location.reload();
});

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
  
  alert("Post created successfully!");

  document.getElementById("postTitle").value = "";
  document.getElementById("postContent").value = "";
  document.getElementById("postStream").value = "Science";

  // Switch back to home view after posting
  document.getElementById('homeBtn').click();
}

// Searches for posts based on a query and renders the filtered results
function searchPosts() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(query) || p.content.toLowerCase().includes(query)
  );
  renderPosts(filtered, document.getElementById('searchPostFeed'));
}

// Filters posts by the selected stream and renders the results
function filterByStream() {
  // Only render in search tab if a query exists; otherwise keep it empty
  const query = (document.getElementById('searchInput')?.value || '').trim();
  if (query.length > 0) {
    searchPosts();
  } else {
    const searchFeed = document.getElementById('searchPostFeed');
    if (searchFeed) searchFeed.innerHTML = '';
  }
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

    if (!post.likes) post.likes = [];

    const likeIndex = post.likes.indexOf(currentUser.email);
    if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
    } else {
        post.likes.push(currentUser.email);
    }

    localStorage.setItem("posts", JSON.stringify(posts));

    // Re-render the correct view
    if (document.getElementById('profile').style.visibility === 'visible') {
        renderUserPosts();
    } else if (document.getElementById('search').style.visibility === 'visible') {
        // In search tab, only re-render if a query is present
        const query = (document.getElementById('searchInput')?.value || '').trim();
        if (query.length > 0) {
            searchPosts();
        } else {
            const searchFeed = document.getElementById('searchPostFeed');
            if (searchFeed) searchFeed.innerHTML = '';
        }
    } else {
        renderPosts();
    }
}

// Renders the posts to the post feed
function renderPosts(data, targetFeed = document.getElementById("postFeed")) {
  let posts;
  if (data) {
    posts = data;
  } else {
    posts = JSON.parse(localStorage.getItem("posts")) || [];
  }

  const streamFilter = document.getElementById("filterStream").value;
  if (streamFilter) {
      posts = posts.filter(p => p.stream === streamFilter);
  }

  const sortValue = document.getElementById("sortPosts").value;
  if (sortValue === 'popular') {
      posts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  } else {
      posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  targetFeed.innerHTML = "";

  if (posts.length === 0) {
      targetFeed.innerHTML = "<p>No posts found.</p>";
      return;
  }

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post-card";
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const isLiked = post.likes?.includes(currentUser.email);

    let actionButtons = '';
    if (post.author === currentUser.email) {
        actionButtons = `
            <button onclick="editPost(${post.id})">✏️ Edit</button>
            <button onclick="deletePost(${post.id})">🗑️ Delete</button>
        `;
    }

    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <small>Stream: ${post.stream} ${emojiMap[post.stream]}</small>
      <br>
      <small>Posted on: ${formatTimestamp(post.timestamp)}</small>
      <div class="post-actions">
        <button onclick="toggleLike(${post.id})">${isLiked ? '❤️' : '🤍'} ${post.likes?.length || 0}</button>
        ${actionButtons}
      </div>
      <div class="comments">
        ${post.comments.map((c, i) => getCommentHTML(post, c, i)).join("")}
      </div>
      <input type="text" placeholder="Add comment" onkeydown="addComment(event, ${post.id})"/>
    `;
    targetFeed.appendChild(div);
  });
}

function editPost(id) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === id);
  if (!post) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.email !== post.author) {
    alert("You can only edit your own posts.");
    return;
  }

  const newTitle = prompt("Edit title:", post.title);
  const newContent = prompt("Edit content:", post.content);
  if (newTitle !== null) post.title = newTitle;
  if (newContent !== null) post.content = newContent;

  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
  renderUserPosts();
}

function deletePost(id) {
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === id);
  if (!post) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.email !== post.author) {
    alert("You can only delete your own posts.");
    return;
  }

  posts = posts.filter(p => p.id !== id);
  localStorage.setItem("posts", JSON.stringify(posts));

  if (document.getElementById('profile').style.visibility === 'visible') {
    renderUserPosts();
  } else {
    renderPosts();
  }
}

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

    if (document.getElementById('profile').style.visibility === 'visible') {
        renderUserPosts();
    } else {
        renderPosts();
    }

    e.target.value = "";
  }
}

function editComment(postId, commentIndex) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const comment = post.comments[commentIndex];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || currentUser.email !== comment.author) {
    alert("You can only edit your own comments.");
    return;
  }

  const commentText = (typeof comment === 'string') ? comment : comment.text;
  const updatedText = prompt("Edit comment:", commentText);
  if (updatedText !== null) {
    comment.text = updatedText;
    localStorage.setItem("posts", JSON.stringify(posts));

    if (document.getElementById('profile').style.visibility === 'visible') {
        renderUserPosts();
    } else {
        renderPosts();
    }
  }
}

function deleteComment(postId, commentIndex) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const comment = post.comments[commentIndex];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || currentUser.email !== comment.author) {
    alert("You can only delete your own comments.");
    return;
  }

  post.comments.splice(commentIndex, 1);
  localStorage.setItem("posts", JSON.stringify(posts));

  if (document.getElementById('profile').style.visibility === 'visible') {
      renderUserPosts();
  } else {
      renderPosts();
  }
}

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
    alert("Please answer all questions.");
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

  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  let allUsers = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = allUsers.findIndex(u => u.email === currentUser.email);

  if (userIndex !== -1) {
      allUsers[userIndex].quizResult = stream;
      currentUser.quizResult = stream;
      localStorage.setItem("users", JSON.stringify(allUsers));
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  const resultElement = document.getElementById("streamResult");
  resultElement.innerHTML = `<div class="result-text">${resultText}</div>`;
  
  triggerConfetti();
});

function triggerConfetti() {
  if (typeof confetti === "function") {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
}

function populateProfile() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (!user.username) return;

  document.getElementById("profileUsername").innerText = `= ${user.username}`;
  document.getElementById("profileEmail").innerText = `= ${user.email}`;
  document.getElementById("profilePassword").innerText = '= ••••••••';
  
  const quizResultEl = document.getElementById("profileQuizResult");
  if (user.quizResult) {
    quizResultEl.innerText = `= ${user.quizResult}`;
  } else {
    quizResultEl.innerText = "= Not taken yet";
  }
}

function renderUserPosts() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  let userPosts = posts.filter(p => p.author === currentUser.email);

  userPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

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

document.getElementById("togglePassword").addEventListener("click", function() {
  const passwordField = document.getElementById("profilePassword");
  const icon = this.querySelector("i");
  
  if (passwordField.classList.contains("password-field")) {
    passwordField.classList.remove("password-field");
    passwordField.textContent = `= ${JSON.parse(localStorage.getItem("currentUser")).password}`;
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    passwordField.classList.add("password-field");
    passwordField.textContent = "= ••••••••";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
});

document.getElementById("updateProfileBtn").addEventListener("click", function() {
  const profileSection = document.getElementById("profile");
  const isEditMode = profileSection.classList.contains("edit-mode");

  const usernameValue = document.getElementById("profileUsername");
  const passwordValue = document.getElementById("profilePassword");
  const updateBtn = document.getElementById("updateProfileBtn");
  const togglePasswordBtn = document.getElementById("togglePassword");

  if (isEditMode) {
    const newUsername = usernameValue.querySelector("input").value;
    const newPassword = passwordValue.querySelector("input").value;

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    let users = JSON.parse(localStorage.getItem("users")) || [];

    users = users.map(user => {
      if (user.email === currentUser.email) {
        return { ...user, username: newUsername, password: newPassword };
      }
      return user;
    });

    currentUser.username = newUsername;
    currentUser.password = newPassword;

    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("users", JSON.stringify(users));

    usernameValue.textContent = `= ${newUsername}`;
    passwordValue.textContent = '= ••••••••';
    passwordValue.classList.add("password-field");
    togglePasswordBtn.style.display = 'inline-block';

    updateBtn.innerHTML = '<i class="fas fa-save"></i> Update Profile';
    profileSection.classList.remove("edit-mode");

    alert("Profile updated successfully!");

  } else {
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

document.getElementById("deleteAccountBtn").addEventListener("click", () => {
  const confirmDelete = confirm("Are you sure you want to permanently delete your account? This cannot be undone.");
  if (!confirmDelete) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    alert("No account found to delete.");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter(u => u.email !== currentUser.email);
  localStorage.setItem("users", JSON.stringify(users));

  localStorage.removeItem("loggedIn");
  localStorage.removeItem("currentUser");

  alert("Your account has been deleted permanently.");
  location.reload();
});

const roadmapsData = [
    { title: "Software Engineer", steps: ["Complete 12th Grade with a focus on Math and Physics.", "Pursue a Bachelor's degree in Computer Science or a related field.", "Learn core programming languages like Python, Java, or C++.", "Build personal projects and contribute to open-source.", "Complete internships to gain practical experience.", "Prepare for technical interviews (Data Structures & Algorithms).", "Apply for entry-level software engineering roles."] },
    { title: "Chartered Accountant (CA)", steps: ["Clear 12th Grade in Commerce.", "Register for the CA Foundation course after 12th.", "Clear the CA Foundation exam.", "Register for the CA Intermediate course.", "Complete three years of practical training (articleship) under a practicing CA.", "Clear both groups of the CA Intermediate exam.", "Register for and clear the CA Final exam."] },
    { title: "Graphic Designer", steps: ["Develop a strong foundation in drawing and art fundamentals.", "Pursue a degree or diploma in Graphic Design, Fine Arts, or a related field.", "Master industry-standard software like Adobe Photoshop, Illustrator, and InDesign.", "Build a strong portfolio showcasing a variety of design work.", "Do freelance projects or internships to gain real-world experience.", "Network with other designers and professionals in the industry.", "Apply for junior designer roles or start a freelance business."] },
    { title: "Doctor (MBBS)", steps: ["Complete 12th Grade with Physics, Chemistry, and Biology (PCB).", "Qualify the NEET (National Eligibility cum Entrance Test) exam.", "Complete the 5.5-year MBBS degree program.", "Complete a one-year compulsory rotating internship.", "Register with the Medical Council of India (MCI) or State Medical Council.", "Optional: Pursue post-graduation (MD/MS) for specialization.", "Practice as a registered medical doctor."] },
    { title: "Lawyer", steps: ["Complete 12th Grade from any stream.", "Appear for law entrance exams like CLAT, AILET, LSAT.", "Pursue a 5-year integrated LLB or a 3-year LLB after graduation.", "Enroll with a State Bar Council.", "Pass the All India Bar Examination (AIBE).", "Practice as an advocate in courts or join a law firm."] },
    { title: "Data Scientist", steps: ["Obtain a Bachelor's degree in a quantitative field (e.g., Computer Science, Stats).", "Master programming languages like Python or R.", "Learn statistics, probability, and machine learning concepts.", "Gain proficiency in data analysis libraries (e.g., Pandas, NumPy).", "Learn data visualization tools (e.g., Tableau, Matplotlib).", "Build a portfolio of data science projects.", "Consider a Master's degree or specialized certification."] }
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

let alumniStoryData = {};

    // --- Alumni Story Flow ---
    const alumniExperienceSection = document.getElementById('alumniExperience');
    const alumniStartSection = document.getElementById('alumni-start');
    const alumniQ1Section = document.getElementById('alumni-q1-stream');
    const alumniQ2Section = document.getElementById('alumni-q2-details');

    const transitionToAlumniStep = (fromSection, toSection) => {
        if (isTransitioning) return;
        isTransitioning = true;
        gsap.timeline({ onComplete: () => isTransitioning = false })
            .to(fromSection, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' })
            .set(fromSection, { visibility: 'hidden' })
            .set(toSection, { visibility: 'visible', y: 30 })
            .to(toSection, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
        activeSection = toSection; // Update the global active section
    };

    document.getElementById('addAlumniStoryBtn').addEventListener('click', () => {
        transitionToAlumniStep(alumniExperienceSection, alumniStartSection);
    });

    document.getElementById('alumni-no-btn').addEventListener('click', () => {
        // Go back to the main alumni view
        transitionToAlumniStep(alumniStartSection, alumniExperienceSection);
    });

    document.getElementById('alumni-yes-btn').addEventListener('click', () => {
        transitionToAlumniStep(alumniStartSection, alumniQ1Section);
    });

    document.querySelectorAll('.stream-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const stream = e.target.dataset.stream;
            if (confirm(`You selected ${stream}. Is this correct?`)) {
                alumniStoryData.stream = stream;
                transitionToAlumniStep(alumniQ1Section, alumniQ2Section);
            }
        });
    });

    document.getElementById('alumni-details-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alumniStoryData.whyStream = document.getElementById('whyStream').value;
        alumniStoryData.regret = document.getElementById('regretStream').value;
        alumniStoryData.currentStatus = document.getElementById('currentStatus').value;
        alumniStoryData.alumniName = document.getElementById('alumniName').value.trim();
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        alumniStoryData.id = Date.now();
        alumniStoryData.author = currentUser.email;
        const alumniStories = JSON.parse(localStorage.getItem("alumniStories")) || [];
        alumniStories.push(alumniStoryData);
        localStorage.setItem("alumniStories", JSON.stringify(alumniStories));
        
        alert("Thank you for sharing your story!");
        
        document.getElementById('alumni-details-form').reset();
        
        renderAlumniStories();
        transitionToAlumniStep(alumniQ2Section, alumniExperienceSection);
    });



function renderAlumniStories() {
    const container = document.getElementById('alumniExperienceContainer');
    container.innerHTML = '';
    const stories = JSON.parse(localStorage.getItem("alumniStories")) || [];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (stories.length === 0) {
        container.innerHTML = "<p>No alumni stories have been shared yet. Be the first to share!</p>";
        return;
    }

    stories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'alumni-story-card';
        
        let actionButtons = '';
        if (currentUser && currentUser.email === story.author) {
            actionButtons = `
                <div class="alumni-story-actions">
                    <button onclick="editAlumniStory(${story.id})" class="action-btn edit-alumni-story-btn">Edit</button>
                    <button onclick="deleteAlumniStory(${story.id})" class="action-btn delete-alumni-story-btn">Delete</button>
                </div>
            `;
        }

        card.innerHTML = `
            <h3>Stream: ${story.stream}</h3>
            ${story.alumniName ? `<p><strong>Alumni Name:</strong> ${story.alumniName}</p>` : ''}
            <p><strong>Why this stream?</strong> ${story.whyStream}</p>
            <p><strong>Any regrets?</strong> ${story.regret}</p>
            <p><strong>Current Status:</strong> ${story.currentStatus}</p>
            ${actionButtons}
        `;
        
        container.appendChild(card);
    });
}

function editAlumniStory(id) {
    let stories = JSON.parse(localStorage.getItem("alumniStories")) || [];
    const storyIndex = stories.findIndex(s => s.id === id);

    if (storyIndex === -1) return;

    const story = stories[storyIndex];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.email !== story.author) {
        alert("You can only edit your own stories.");
        return;
    }

    const newWhyStream = prompt("Edit 'Why this stream?':", story.whyStream);
    const newRegret = prompt("Edit 'Any regrets?':", story.regret);
    const newCurrentStatus = prompt("Edit 'Current Status?':", story.currentStatus);
    const newAlumniName = prompt("Edit 'Alumni Name?':", story.alumniName);

    if (newWhyStream !== null) story.whyStream = newWhyStream;
    if (newRegret !== null) story.regret = newRegret;
    if (newCurrentStatus !== null) story.currentStatus = newCurrentStatus;
    if (newAlumniName !== null) story.alumniName = newAlumniName;

    stories[storyIndex] = story;
    localStorage.setItem("alumniStories", JSON.stringify(stories));
    renderAlumniStories();
}

function deleteAlumniStory(id) {
    let stories = JSON.parse(localStorage.getItem("alumniStories")) || [];
    const storyIndex = stories.findIndex(s => s.id === id);

    if (storyIndex === -1) return;

    const story = stories[storyIndex];
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || currentUser.email !== story.author) {
        alert("You can only delete your own stories.");
        return;
    }

    if (!confirm("Are you sure you want to delete this story?")) return;

    stories = stories.filter(s => s.id !== id);
    localStorage.setItem("alumniStories", JSON.stringify(stories));
    renderAlumniStories();
}
