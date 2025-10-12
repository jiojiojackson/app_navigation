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

async function loadWebsites() {
  const response = await fetch('/api/websites');
  const websites = await response.json();
  
  websiteGrid.innerHTML = websites.map(site => `
    <div class="website-card" onclick="window.open('${site.url}', '_blank')">
      <h3>${site.name}</h3>
    </div>
  `).join('');
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
