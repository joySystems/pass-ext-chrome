// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('passwordSettings', (data) => {
    if (data.passwordSettings) {
      document.getElementById('length').value = data.passwordSettings.length;
      document.getElementById('uppercase').checked = data.passwordSettings.useUppercase;
      document.getElementById('lowercase').checked = data.passwordSettings.useLowercase;
      document.getElementById('numbers').checked = data.passwordSettings.useNumbers;
      document.getElementById('special').checked = data.passwordSettings.useSpecial;
      document.getElementById('email').value = data.passwordSettings.emailNotification;
    }
  });
});

// Save settings when save button is clicked
document.getElementById('save').addEventListener('click', () => {
  const settings = {
    length: parseInt(document.getElementById('length').value),
    useUppercase: document.getElementById('uppercase').checked,
    useLowercase: document.getElementById('lowercase').checked,
    useNumbers: document.getElementById('numbers').checked,
    useSpecial: document.getElementById('special').checked,
    emailNotification: document.getElementById('email').value.trim()
  };

  // Validate settings
  if (settings.length < 8 || settings.length > 32) {
    alert('Password length must be between 8 and 32 characters');
    return;
  }

  if (!settings.useUppercase && !settings.useLowercase && 
      !settings.useNumbers && !settings.useSpecial) {
    alert('Please select at least one character type');
    return;
  }

  if (settings.emailNotification && 
      !settings.emailNotification.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    alert('Please enter a valid email address or leave it empty');
    return;
  }

  // Save settings
  chrome.storage.sync.set({ passwordSettings: settings }, () => {
    // Show success message
    const status = document.createElement('div');
    status.textContent = 'Settings saved!';
    status.style.cssText = `
      color: #4CAF50;
      text-align: center;
      margin-top: 10px;
      font-weight: bold;
    `;
    document.body.appendChild(status);
    setTimeout(() => status.remove(), 2000);
  });
});