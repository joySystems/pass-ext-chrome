// Function to find password confirmation field
function findConfirmationField(passwordField) {
  const form = passwordField.form;
  if (!form) return null;

  const inputs = form.querySelectorAll('input[type="password"]');
  for (const input of inputs) {
    if (input !== passwordField) {
      return input;
    }
  }
  return null;
}

// Function to find email/login field
function findEmailLoginField(form) {
  if (!form) return null;
  
  const emailLoginSelectors = [
    'input[type="email"]',
    'input[name*="email"]',
    'input[name*="login"]',
    'input[name*="username"]',
    'input[type="text"]'
  ];

  for (const selector of emailLoginSelectors) {
    const field = form.querySelector(selector);
    if (field && field.value) {
      return field;
    }
  }
  return null;
}

// Function to copy text to clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

// Function to show notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background-color: #4CAF50;
    color: white;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.5s ease';
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillPassword') {
    // Get the active element (password field)
    const passwordField = document.activeElement;
    if (passwordField && passwordField.type === 'password') {
      // Fill the password
      passwordField.value = request.password;
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));

      // Find and fill confirmation field if it exists
      const confirmField = findConfirmationField(passwordField);
      if (confirmField) {
        confirmField.value = request.password;
        confirmField.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Get domain and email/login information
      const domain = window.location.hostname;
      const form = passwordField.form;
      const emailLoginField = findEmailLoginField(form);
      const emailLogin = emailLoginField ? emailLoginField.value : '';

      // Format the credential information
      const credentialInfo = [
        `Domain: ${domain}`,
        `Password: ${request.password}`,
        emailLogin ? `Login/Email: ${emailLogin}` : ''
      ].filter(Boolean).join('\n');

      // Copy credential information to clipboard
      copyToClipboard(credentialInfo).then(success => {
        if (success) {
          showNotification('Credentials copied to clipboard');
        }
      });

      // Listen for form submission
      if (form) {
        form.addEventListener('submit', () => {
          chrome.runtime.sendMessage({
            action: 'formSubmitted',
            domain: domain,
            password: request.password
          });
        });
      }
    }
  } else if (request.action === 'showNotification') {
    showNotification(request.message);
  }
});