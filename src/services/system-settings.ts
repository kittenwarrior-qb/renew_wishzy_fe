import api from "./api";
import type {
  SystemSetting,
  SystemSettingsResponse,
  UpdateSystemSettingDto,
  UpdateSettingResponse,
} from "@/types/system-settings.types";

export const systemSettingsService = {
  // Get all system settings
  getAll: async (): Promise<SystemSettingsResponse> => {
    const response = await api.get("/system-settings");
    return response.data.data; // Extract from { success, data, message } wrapper
  },

  // Get setting by key
  getByKey: async (key: string): Promise<SystemSetting> => {
    const response = await api.get(`/system-settings/${key}`);
    return response.data.data; // Extract from { success, data, message } wrapper
  },

  // Update setting by key (Admin only)
  update: async (
    key: string,
    payload: UpdateSystemSettingDto
  ): Promise<UpdateSettingResponse> => {
    const response = await api.put(`/system-settings/${key}`, payload);
    return response.data.data; // Extract from { success, data, message } wrapper
  },
};

// Commonly used setting keys
export const SETTING_KEYS = {
  INSTRUCTOR_REVENUE_PERCENTAGE: "instructor_revenue_percentage",
} as const;
