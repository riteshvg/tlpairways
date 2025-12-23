/**
 * Settings Service
 * Manages application settings that can be toggled at runtime
 */

const fs = require('fs');
const path = require('path');

// Settings file path
const SETTINGS_FILE = path.join(__dirname, '../../config/settings.json');

// Default settings
const DEFAULT_SETTINGS = {
    emailEnabled: true,
    lastUpdated: new Date().toISOString()
};

/**
 * Ensure settings file exists
 */
function ensureSettingsFile() {
    const configDir = path.dirname(SETTINGS_FILE);

    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }

    // Create settings file if it doesn't exist
    if (!fs.existsSync(SETTINGS_FILE)) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    }
}

/**
 * Read settings from file
 */
function getSettings() {
    try {
        ensureSettingsFile();
        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Write settings to file
 */
function saveSettings(settings) {
    try {
        ensureSettingsFile();
        settings.lastUpdated = new Date().toISOString();
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

/**
 * Get email enabled status
 */
function isEmailEnabled() {
    // First check environment variable (takes precedence)
    if (process.env.EMAIL_ENABLED !== undefined) {
        return process.env.EMAIL_ENABLED !== 'false';
    }

    // Then check settings file
    const settings = getSettings();
    return settings.emailEnabled !== false;
}

/**
 * Set email enabled status
 */
function setEmailEnabled(enabled) {
    const settings = getSettings();
    settings.emailEnabled = enabled;
    return saveSettings(settings);
}

/**
 * Get all settings
 */
function getAllSettings() {
    const settings = getSettings();

    // Add environment variable override info
    const envOverride = process.env.EMAIL_ENABLED !== undefined;

    return {
        ...settings,
        emailEnabled: isEmailEnabled(),
        envOverride,
        envValue: process.env.EMAIL_ENABLED
    };
}

module.exports = {
    getSettings,
    saveSettings,
    isEmailEnabled,
    setEmailEnabled,
    getAllSettings
};
