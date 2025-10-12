let isAuthenticated = false;

const modal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');
const settingsContent = document.getElementById('settingsContent');
const websiteGrid = document.getElementById('websiteGrid');

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
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
};

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
  }
};

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

function selectIcon(icon) {
  selectedIcon = icon;
  renderIconSelector();
}

async function loadWebsites() {
  const response = await fetch('/api/websites');
  const websites = await response.json();
  
  if (websites.length === 0) {
    websiteGrid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📌</div>
        <h3>No websites yet</h3>
        <p>Click the Settings button to add your first website</p>
      </div>
    `;
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
        <button class="move-btn" onclick="moveWebsite(${site.id}, 'down')" ${index === websites.length - 1 ? 'disabled' : ''} title="Move down">
          ↓
        </button>
        <button class="delete-btn" onclick="deleteWebsite(${site.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

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

renderIconSelector();

async function deleteWebsite(id) {
  if (!confirm('Are you sure you want to delete this website?')) return;
  
  const response = await fetch(`/api/websites/${id}`, {
    method: 'DELETE'
  });
  
  if (response.ok) {
    loadWebsites();
    loadWebsitesForSettings();
  }
}

loadWebsites();
