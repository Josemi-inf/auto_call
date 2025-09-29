import { useState, useEffect } from 'react';
import { N8N_CONFIG } from '@/services/config';

export interface N8nConfigState {
  baseUrl: string;
  apiKey: string;
}

const STORAGE_KEY = 'n8n-config';
const STORAGE_KEY_BASE_URL = 'n8n-base-url';
const STORAGE_KEY_API_KEY = 'n8n-api-key';

// Default config from environment variables
const getDefaultConfig = (): N8nConfigState => ({
  baseUrl: N8N_CONFIG.baseUrl || '',
  apiKey: N8N_CONFIG.apiKey || ''
});

// Load config from localStorage
const loadConfigFromStorage = (): N8nConfigState => {
  try {
    // Try new format first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Fallback to old format (separate keys)
    const baseUrl = localStorage.getItem(STORAGE_KEY_BASE_URL) || '';
    const apiKey = localStorage.getItem(STORAGE_KEY_API_KEY) || '';

    if (baseUrl || apiKey) {
      return { baseUrl, apiKey };
    }

    // Use default config
    return getDefaultConfig();
  } catch (error) {
    console.error('Error loading n8n config from localStorage:', error);
    return getDefaultConfig();
  }
};

// Save config to localStorage
const saveConfigToStorage = (config: N8nConfigState): void => {
  try {
    // Save in new format
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

    // Also save in old format for backward compatibility
    localStorage.setItem(STORAGE_KEY_BASE_URL, config.baseUrl);
    localStorage.setItem(STORAGE_KEY_API_KEY, config.apiKey);

    console.log('N8n config saved to localStorage:', {
      baseUrl: config.baseUrl ? '✓' : '✗',
      apiKey: config.apiKey ? '✓' : '✗'
    });
  } catch (error) {
    console.error('Error saving n8n config to localStorage:', error);
  }
};

export const useN8nConfig = () => {
  const [config, setConfig] = useState<N8nConfigState>(() => loadConfigFromStorage());
  const [isInitialized, setIsInitialized] = useState(false);

  // Load config on mount
  useEffect(() => {
    const loadedConfig = loadConfigFromStorage();
    console.log('Loading n8n config on mount:', {
      baseUrl: loadedConfig.baseUrl ? '✓' : '✗',
      apiKey: loadedConfig.apiKey ? '✓' : '✗'
    });
    setConfig(loadedConfig);
    setIsInitialized(true);
  }, []);

  // Update config and persist to storage
  const updateConfig = (newConfig: Partial<N8nConfigState>) => {
    const updatedConfig = { ...config, ...newConfig };
    console.log('Updating n8n config:', {
      baseUrl: updatedConfig.baseUrl ? '✓' : '✗',
      apiKey: updatedConfig.apiKey ? '✓' : '✗'
    });

    setConfig(updatedConfig);
    saveConfigToStorage(updatedConfig);
  };

  // Reset config to defaults
  const resetConfig = () => {
    const defaultConfig = getDefaultConfig();
    setConfig(defaultConfig);
    saveConfigToStorage(defaultConfig);
  };

  // Clear all stored config
  const clearConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_BASE_URL);
      localStorage.removeItem(STORAGE_KEY_API_KEY);
      const emptyConfig = { baseUrl: '', apiKey: '' };
      setConfig(emptyConfig);
      console.log('N8n config cleared from storage');
    } catch (error) {
      console.error('Error clearing n8n config:', error);
    }
  };

  // Check if config is valid/complete
  const isConfigValid = () => {
    return config.baseUrl.trim().length > 0;
  };

  // Check if config has API key
  const hasApiKey = () => {
    return config.apiKey.trim().length > 0;
  };

  return {
    config,
    updateConfig,
    resetConfig,
    clearConfig,
    isConfigValid: isConfigValid(),
    hasApiKey: hasApiKey(),
    isInitialized
  };
};