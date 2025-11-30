let isAuthenticated = false;
let editingWebsiteId = null;
let editSelectedIcon = '';

const modal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const settingsContent = document.getElementById('settingsContent');
const websiteGrid = document.getElementById('websiteGrid');

// Modal open/close
settingsBtn.onclick = () => {
  modal.style.display = 'block';
  if (!isAuthenticated) {
    loginForm.style.display = 'block';
    settingsContent.style.display = 'none';
  } else {
    loginForm.style.display = 'none';
    settingsContent.style.display = 'block';
    loadWebsitesForSettings();
  }
};

closeBtn.onclick = () => {
  modal.style.display = 'none';
  document.getElementById('loginError').textContent = '';
  cancelEdit();
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    cancelEdit();
  }
};

// Login
document.getElementById('loginBtn').onclick = async () => {
  const password = document.getElementById('password').value;
  const response = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });

  if (response.ok) {
    isAuthenticated = true;
    loginForm.style.display = 'none';
    settingsContent.style.display = 'block';
    document.getElementById('password').value = '';
    document.getElementById('loginError').textContent = '';
    loadWebsitesForSettings();
  } else {
    document.getElementById('loginError').textContent = 'Invalid password';
  }
};

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;

    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${targetTab}Tab`).classList.add('active');

    // Hide edit form when switching tabs
    document.getElementById('editForm').style.display = 'none';
  });
});

// Auto-select icon based on name/url
document.getElementById('websiteName').addEventListener('input', (e) => {
  const name = e.target.value;
  const url = document.getElementById('websiteUrl').value;
  if (name || url) {
    selectedIcon = autoSelectIcon(name, url);
    renderIconSelector();
  }
});

document.getElementById('websiteUrl').addEventListener('input', (e) => {
  const url = e.target.value;
  const name = document.getElementById('websiteName').value;
  if (name || url) {
    selectedIcon = autoSelectIcon(name, url);
    renderIconSelector();
  }
});

// Add website
document.getElementById('addBtn').onclick = async () => {
  const name = document.getElementById('websiteName').value;
  const url = document.getElementById('websiteUrl').value;

  if (!name || !url) {
    alert('Please fill in both fields');
    return;
  }

  const response = await fetch('/api/websites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      url,
      icon: selectedIcon,
      color: getRandomColor()
    })
  });

  if (response.ok) {
    document.getElementById('websiteName').value = '';
    document.getElementById('websiteUrl').value = '';
    selectedIcon = iconOptions[0].icon;
    selectedColor = colorOptions[0];
    renderIconSelector();
    loadWebsites();
    loadWebsitesForSettings();

    // Show success feedback
    showToast('Website added successfully!', 'success');
  }
};

// Search functionality
document.getElementById('searchWebsite').addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const items = document.querySelectorAll('.website-item');

  items.forEach(item => {
    const name = item.querySelector('.item-info strong').textContent.toLowerCase();
    const url = item.querySelector('.item-info small').textContent.toLowerCase();

    if (name.includes(searchTerm) || url.includes(searchTerm)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
});

const iconOptions = [
  { icon: '🌐', name: 'Globe' },
  { icon: '📧', name: 'Email' },
  { icon: '🎵', name: 'Music' },
  { icon: '🎬', name: 'Video' },
  { icon: '📰', name: 'News' },
  { icon: '🛒', name: 'Shopping' },
  { icon: '💼', name: 'Work' },
  { icon: '🎮', name: 'Gaming' },
  { icon: '📚', name: 'Books' },
  { icon: '🎨', name: 'Design' },
  { icon: '💻', name: 'Code' },
  { icon: '📱', name: 'Social' },
  { icon: '🏠', name: 'Home' },
  { icon: '⚙️', name: 'Tools' },
  { icon: '🔍', name: 'Search' },
  { icon: '📊', name: 'Analytics' },
  { icon: '💰', name: 'Finance' },
  { icon: '🎓', name: 'Education' },
  { icon: '🏋️', name: 'Fitness' },
  { icon: '🍔', name: 'Food' },
  { icon: '✈️', name: 'Travel' },
  { icon: '📷', name: 'Photo' },
  { icon: '🎯', name: 'Target' },
  { icon: '⭐', name: 'Star' }
];

const colorOptions = [
  '#667eea', '#764ba2', '#f093fb', '#4facfe',
  '#43e97b', '#fa709a', '#fee140', '#30cfd0',
  '#a8edea', '#ff6b6b', '#4ecdc4', '#45b7d1',
  '#f38181', '#aa96da', '#fcbad3', '#ffffd2'
];

let selectedIcon = iconOptions[0].icon;
let selectedColor = colorOptions[0];

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function getRandomColor() {
  return colorOptions[Math.floor(Math.random() * colorOptions.length)];
}

function autoSelectIcon(name, url) {
  const text = (name + ' ' + url).toLowerCase();

  const keywords = {
    '📧': ['mail', 'email', 'gmail', 'outlook'],
    '🎵': ['music', 'spotify', 'soundcloud', 'apple music'],
    '🎬': ['video', 'youtube', 'netflix', 'vimeo', 'twitch'],
    '📰': ['news', 'blog', 'medium', 'reddit'],
    '🛒': ['shop', 'amazon', 'store', 'buy', 'ebay'],
    '💼': ['work', 'office', 'slack', 'teams', 'notion'],
    '🎮': ['game', 'steam', 'gaming', 'play'],
    '📚': ['book', 'read', 'library', 'goodreads'],
    '🎨': ['design', 'figma', 'canva', 'art', 'dribbble'],
    '💻': ['code', 'github', 'gitlab', 'dev', 'stack'],
    '📱': ['social', 'facebook', 'twitter', 'instagram', 'linkedin'],
    '🔍': ['search', 'google', 'bing'],
    '📊': ['analytics', 'data', 'chart'],
    '💰': ['finance', 'bank', 'money', 'paypal'],
    '🎓': ['education', 'learn', 'course', 'university'],
    '🏋️': ['fitness', 'gym', 'health', 'workout'],
    '🍔': ['food', 'recipe', 'restaurant', 'delivery'],
    '✈️': ['travel', 'flight', 'hotel', 'booking'],
    '📷': ['photo', 'image', 'instagram', 'unsplash']
  };

  for (const [icon, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      return icon;
    }
  }

  return iconOptions[Math.floor(Math.random() * iconOptions.length)].icon;
}

function renderIconSelector() {
  const iconGrid = document.getElementById('iconGrid');
  iconGrid.innerHTML = iconOptions.map(opt => `
    <div class="icon-option ${opt.icon === selectedIcon ? 'selected' : ''}" 
         onclick="selectIcon('${opt.icon}')" 
         title="${opt.name}">
      ${opt.icon}
    </div>
  `).join('');
}

function renderEditIconSelector() {
  const iconGrid = document.getElementById('editIconGrid');
  iconGrid.innerHTML = iconOptions.map(opt => `
    <div class="icon-option ${opt.icon === editSelectedIcon ? 'selected' : ''}" 
         onclick="selectEditIcon('${opt.icon}')" 
         title="${opt.name}">
      ${opt.icon}
    </div>
  `).join('');
}

function selectIcon(icon) {
  selectedIcon = icon;
  renderIconSelector();
}

function selectEditIcon(icon) {
  editSelectedIcon = icon;
  renderEditIconSelector();
}

async function loadWebsites() {
  // 1. Try to load from cache first
  const cachedData = localStorage.getItem('cachedWebsites');
  if (cachedData) {
    const websites = JSON.parse(cachedData);
    renderWebsites(websites);
  }

  try {
    // 2. Fetch fresh data from API
    const response = await fetch('/api/websites');
    const websites = await response.json();

    // 3. Update cache
    localStorage.setItem('cachedWebsites', JSON.stringify(websites));

    // 4. Re-render with fresh data
    renderWebsites(websites);
  } catch (error) {
    console.error('Failed to fetch websites:', error);
    // If cache was empty and fetch failed, show empty state or error
    if (!cachedData) {
      renderEmptyState();
    }
  }
}

function renderEmptyState() {
  websiteGrid.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📌</div>
      <h3>No websites yet</h3>
      <p>Click the Settings button to add your first website</p>
    </div>
  `;
}

function renderWebsites(websites) {
  if (websites.length === 0) {
    renderEmptyState();
    return;
  }

  websiteGrid.innerHTML = websites.map(site => {
    const domain = getDomain(site.url);
    const bgColor = site.color || getRandomColor();
    const icon = site.icon || '🌐';

    return `
      <div class="website-card" onclick="window.open('${site.url}', '_blank')">
        <div class="card-icon-header" style="background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%);">
          <div class="icon-display">${icon}</div>
        </div>
        <div class="card-content">
          <h3 class="card-title">${site.name}</h3>
          <p class="card-url">${domain}</p>
        </div>
        <div class="card-footer">
          <span class="visit-link">Visit →</span>
        </div>
      </div>
    `;
  }).join('');
}

async function loadWebsitesForSettings() {
  const response = await fetch('/api/websites');
  const websites = await response.json();

  document.getElementById('websiteList').innerHTML = websites.map((site, index) => `
    <div class="website-item">
      <div class="item-icon" style="background: ${site.color || '#667eea'}">
        ${site.icon || '🌐'}
      </div>
      <div class="item-info">
        <strong>${site.name}</strong><br>
        <small>${site.url}</small>
      </div>
      <div class="item-actions">
        <button class="move-btn" onclick="moveWebsite(${site.id}, 'up')" ${index === 0 ? 'disabled' : ''} title="Move up">
          ↑
        </button>
        <button class="move-btn" onclick="moveWebsite(${site.id}, 'down')\" ${index === websites.length - 1 ? 'disabled' : ''} title="Move down">
          ↓
        </button>
        <button class="edit-btn" onclick="editWebsite(${site.id}, '${site.name.replace(/'/g, "\\'")}', '${site.url}', '${site.icon || '🌐'}', '${site.color || '#667eea'}')" title="Edit">
          ✏️
        </button>
        <button class="delete-btn" onclick="deleteWebsite(${site.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

// Edit website function
function editWebsite(id, name, url, icon, color) {
  editingWebsiteId = id;
  editSelectedIcon = icon;

  document.getElementById('editWebsiteName').value = name;
  document.getElementById('editWebsiteUrl').value = url;

  renderEditIconSelector();

  document.getElementById('editForm').style.display = 'block';
}

// Cancel edit
function cancelEdit() {
  editingWebsiteId = null;
  document.getElementById('editForm').style.display = 'none';
  document.getElementById('editWebsiteName').value = '';
  document.getElementById('editWebsiteUrl').value = '';
}

// Save edited website
document.getElementById('saveEditBtn').onclick = async () => {
  if (!editingWebsiteId) return;

  const name = document.getElementById('editWebsiteName').value;
  const url = document.getElementById('editWebsiteUrl').value;

  if (!name || !url) {
    alert('Please fill in both fields');
    return;
  }

  const response = await fetch('/api/websites', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: editingWebsiteId,
      name,
      url,
      icon: editSelectedIcon
    })
  });

  if (response.ok) {
    cancelEdit();
    loadWebsites();
    loadWebsitesForSettings();
    showToast('Website updated successfully!', 'success');
  }
};

async function moveWebsite(id, direction) {
  const response = await fetch('/api/websites', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, direction })
  });

  if (response.ok) {
    loadWebsites();
    loadWebsitesForSettings();
  }
}

async function deleteWebsite(id) {
  if (!confirm('Are you sure you want to delete this website?')) return;

  const response = await fetch('/api/websites', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });

  if (response.ok) {
    loadWebsites();
    loadWebsitesForSettings();
    showToast('Website deleted successfully!', 'success');
  }
}

// Toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideInToast 0.3s ease;
    font-weight: 600;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutToast 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add toast animations to the page
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInToast {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutToast {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Initialize
renderIconSelector();
loadWebsites();
