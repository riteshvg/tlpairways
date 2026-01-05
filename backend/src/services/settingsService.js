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
    try {
        const configDir = path.dirname(SETTINGS_FILE);

        // Create config directory if it doesn't exist
        if (!fs.existsSync(configDir)) {
            console.log('📁 Creating config directory:', configDir);
            fs.mkdirSync(configDir, { recursive: true });
        }

        // Create settings file if it doesn't exist
        if (!fs.existsSync(SETTINGS_FILE)) {
            console.log('📄 Creating settings file with defaults:', SETTINGS_FILE);
            fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
        }
    } catch (error) {
        console.error('❌ Error ensuring settings file:', error.message);
        console.warn('⚠️  Settings will use defaults and environment variables only');
        // Don't throw - allow the app to continue with defaults
    }
}

/**
 * Read settings from file
 */
function getSettings() {
    try {
        ensureSettingsFile();

        // Check if file exists before reading
        if (!fs.existsSync(SETTINGS_FILE)) {
            console.warn('⚠️  Settings file does not exist, using defaults');
            return { ...DEFAULT_SETTINGS };
        }

        const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Error reading settings:', error.message);
        console.warn('⚠️  Using default settings');
        return { ...DEFAULT_SETTINGS };
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
        console.log('✅ Settings saved successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving settings:', error.message);
        console.warn('⚠️  Settings could not be persisted. Use EMAIL_ENABLED environment variable for production.');
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
