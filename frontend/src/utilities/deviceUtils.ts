import { v4 as uuidv4 } from 'uuid';

export const getDeviceId = (): string | null => {
  const KEY = 'device_id';
  let deviceId = localStorage.getItem(KEY) || null;
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem(KEY, deviceId);
  }
  return deviceId;
};

// Usage