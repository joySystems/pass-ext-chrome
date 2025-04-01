// Default password settings
let passwordSettings = {
  length: 12,
  useUppercase: true,
  useLowercase: true,
  useNumbers: true,
  useSpecial: true
};

// Load settings from storage
chrome.storage.sync.get('passwordSettings', (data) => {
  if (data.passwordSettings) {
    passwordSettings = data.passwordSettings;
  }
});

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'generatePassword',
    title: 'Generate Password',
    contexts: ['editable']
  });
});

// Generate password function
function generatePassword(settings) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (settings.useUppercase) chars += uppercase;
  if (settings.useLowercase) chars += lowercase;
  if (settings.useNumbers) chars += numbers;
  if (settings.useSpecial) chars += special;

  let password = '';
  for (let i = 0; i < settings.length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'generatePassword') {
    const password = generatePassword(passwordSettings);
    
    // Send password to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillPassword',
      password: password
    });

    // Copy to clipboard
    navigator.clipboard.writeText(password).then(() => {
      chrome.tabs.sendMessage(tab.id, {
        action: 'showNotification',
        message: 'Password has been copied to clipboard'
      });
    });
  }
});