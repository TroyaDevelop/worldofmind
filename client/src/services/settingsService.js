import api from './api';

// Получить все настройки пользователя
export const getUserSettings = async (settingName = null) => {
  try {
    const params = settingName ? { setting_name: settingName } : {};
    const response = await api.get('/settings', { params });
    return response.data.settings;
  } catch (error) {
    console.error('Ошибка при получении настроек:', error);
    throw error;
  }
};

// Сохранить одну настройку
export const saveUserSetting = async (settingName, settingValue) => {
  try {
    const response = await api.post('/settings', {
      setting_name: settingName,
      setting_value: settingValue
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при сохранении настройки:', error);
    throw error;
  }
};

// Сохранить множественные настройки
export const saveUserSettings = async (settings) => {
  try {
    const response = await api.post('/settings/bulk', {
      settings: settings
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка при сохранении настроек:', error);
    throw error;
  }
};

// Удалить настройку
export const deleteUserSetting = async (settingName) => {
  try {
    const response = await api.delete(`/settings/${settingName}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении настройки:', error);
    throw error;
  }
};

// Константы для названий настроек
export const SETTING_NAMES = {
  CATEGORIES_HIERARCHY: 'categories_hierarchy',
  UI_PREFERENCES: 'ui_preferences',
  NEURON_MAP_SETTINGS: 'neuron_map_settings'
};

// Получить настройки иерархии категорий
export const getCategoriesHierarchySettings = async () => {
  try {
    const settings = await getUserSettings(SETTING_NAMES.CATEGORIES_HIERARCHY);
    return settings[SETTING_NAMES.CATEGORIES_HIERARCHY] || null;
  } catch (error) {
    console.error('Ошибка при получении настроек иерархии:', error);
    return null;
  }
};

// Сохранить настройки иерархии категорий
export const saveCategoriesHierarchySettings = async (hierarchyData) => {
  try {
    return await saveUserSetting(SETTING_NAMES.CATEGORIES_HIERARCHY, hierarchyData);
  } catch (error) {
    console.error('Ошибка при сохранении настроек иерархии:', error);
    throw error;
  }
};
