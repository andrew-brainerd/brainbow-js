type GoveeDeviceType = 'devices.types.heater' | 'devices.types.light';

interface GoveeDevice {
  capabilities: any[];
  device: string;
  deviceName: string;
  type: GoveeDeviceType;
}

const goveeClient = (path: string) => {
  return fetch(`https://openapi.api.govee.com/router/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Govee-API-Key': 'ec9314b0-a9c6-46f0-a3aa-55ed248fda9b'
    }
  });
};

export const getDevices = async () => {
  const response = await goveeClient('/user/devices');

  if (response.ok) {
    const { data } = await response.json();
    return data as GoveeDevice[];
  }
};

export const getLights = async () => {
  const devices = await getDevices();

  if (devices) {
    return devices.filter(device => device.type === 'devices.types.light');
  }
};

export const getLightIds = async () => {
  const lights = await getLights();

  if (lights) {
    return lights.map(light => light.device);
  }
}
