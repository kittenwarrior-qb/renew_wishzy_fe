// System Settings Types
export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
}

export interface SystemSettingsResponse {
  items: SystemSetting[];
}

export interface UpdateSystemSettingDto {
  value: string;
  description?: string;
}

export interface UpdateSettingResponse {
  message: string;
  key: string;
  value: string;
}
