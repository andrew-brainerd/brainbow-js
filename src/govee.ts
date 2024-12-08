import { v4 as uuid } from 'uuid';

type GoveeDeviceType = 'devices.types.heater' | 'devices.types.light';

interface GoveeDevice {
  capabilities: any[];
  device: string;
  deviceName: string;
  sku: string;
  type: GoveeDeviceType;
}

const goveeClient = (path: string, method = 'GET', body?: BodyInit) => {
  return fetch(`https://openapi.api.govee.com/router/api/v1${path}`, {
    body,
    headers: {
      'Content-Type': 'application/json',
      'Govee-API-Key': 'ec9314b0-a9c6-46f0-a3aa-55ed248fda9b'
    },
    method
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
};

export const setLightPower = async (light: GoveeDevice, value: 'on' | 'off') => {
  const data = JSON.stringify({
    requestId: uuid(),
    payload: {
      sku: light.sku,
      device: light.device,
      capability: {
        type: 'devices.capabilities.on_off',
        instance: 'powerSwitch',
        value: value === 'on' ? 1 : 0
      }
    }
  });

  const response = await goveeClient('/device/control', 'POST', data);

  if (response.ok) {
    const json = await response.json();
    return json;
  }
};
