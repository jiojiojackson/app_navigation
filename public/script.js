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
    body: JSON.stringify({ name, url })
  });
  
  if (response.ok) {
    document.getElementById('websiteName').value = '';
    document.getElementById('websiteUrl').value = '';
    loadWebsites();
    loadWebsitesForSettings();
  }
};

function getScreenshotUrl(url) {
  try {
    const encodedUrl = encodeURIComponent(url);
    // Using screenshot.rocks API for website previews
    return `https://api.screenshotmachine.com/?key=demo&url=${encodedUrl}&dimension=1024x768`;
  } catch {
    return '';
  }
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
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
    const screenshot = getScreenshotUrl(site.url);
    const favicon = getFaviconUrl(site.url);
    const initials = getInitials(site.name);
    const domain = getDomain(site.url);
    
    return `
      <div class="website-card" onclick="window.open('${site.url}', '_blank')">
        <div class="card-preview">
          <img src="${screenshot}" alt="${site.name}" class="preview-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="preview-fallback" style="display:none;">
            <div class="fallback-icon">${initials}</div>
          </div>
          <div class="preview-overlay">
            <img src="${favicon}" alt="" class="overlay-favicon">
          </div>
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
  
  document.getElementById('websiteList').innerHTML = websites.map(site => `
    <div class="website-item">
      <div>
        <strong>${site.name}</strong><br>
        <small>${site.url}</small>
      </div>
      <button class="delete-btn" onclick="deleteWebsite(${site.id})">Delete</button>
    </div>
  `).join('');
}

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
