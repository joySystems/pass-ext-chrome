// Function to get browser language
function getBrowserLanguage() {
  const language = navigator.language.split('-')[0];
  const supportedLanguages = ['en', 'ru', 'fr', 'es', 'de', 'pt'];
  return supportedLanguages.includes(language) ? language : 'en';
}

// Function to update UI text
function updateUIText() {
  document.getElementById('languageLabel').textContent = chrome.i18n.getMessage('language');
  document.getElementById('passwordLengthLabel').textContent = chrome.i18n.getMessage('passwordLength');
  document.getElementById('characterTypesLabel').textContent = chrome.i18n.getMessage('characterTypes');
  document.getElementById('uppercaseLabel').textContent = chrome.i18n.getMessage('uppercaseLetters');
  document.getElementById('lowercaseLabel').textContent = chrome.i18n.getMessage('lowercaseLetters');
  document.getElementById('numbersLabel').textContent = chrome.i18n.getMessage('numbers');
  document.getElementById('specialLabel').textContent = chrome.i18n.getMessage('specialCharacters');
  document.getElementById('save').textContent = chrome.i18n.getMessage('saveSettings');
}

// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  // Load language setting
  chrome.storage.sync.get(['language', 'passwordSettings'], (data) => {
    // Set language
    const currentLanguage = data.language || getBrowserLanguage();
    document.getElementById('language').value = currentLanguage;
    updateUIText();

    // Set password settings
    if (data.passwordSettings) {
      document.getElementById('length').value = data.passwordSettings.length;
      document.getElementById('uppercase').checked = data.passwordSettings.useUppercase;
      document.getElementById('lowercase').checked = data.passwordSettings.useLowercase;
      document.getElementById('numbers').checked = data.passwordSettings.useNumbers;
      document.getElementById('special').checked = data.passwordSettings.useSpecial;
    }
  });

  // Add language change listener
  document.getElementById('language').addEventListener('change', (e) => {
    const newLanguage = e.target.value;
    chrome.storage.sync.set({ language: newLanguage }, () => {
      chrome.runtime.reload();
    });
  });
});

// Save settings when save button is clicked
document.getElementById('save').addEventListener('click', () => {
  const settings = {
    length: parseInt(document.getElementById('length').value),
    useUppercase: document.getElementById('uppercase').checked,
    useLowercase: document.getElementById('lowercase').checked,
    useNumbers: document.getElementById('numbers').checked,
    useSpecial: document.getElementById('special').checked
  };

  // Validate settings
  if (settings.length < 8 || settings.length > 32) {
    alert(chrome.i18n.getMessage('lengthError'));
    return;
  }

  if (!settings.useUppercase && !settings.useLowercase && 
      !settings.useNumbers && !settings.useSpecial) {
    alert(chrome.i18n.getMessage('typeError'));
    return;
  }



  // Save settings
  chrome.storage.sync.set({ passwordSettings: settings }, () => {
    // Show success message
    const status = document.createElement('div');
    status.textContent = chrome.i18n.getMessage('settingsSaved');
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