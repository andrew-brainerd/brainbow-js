const goveeClient = (path: string) => {
  return fetch(`https://openapi.api.govee.com/router/api/v1${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Govee-API-Key': 'ec9314b0-a9c6-46f0-a3aa-55ed248fda9b',
    }
  })
};

export const getDevices = async () => {
  const response = await goveeClient('/user/devices');

  if (response.ok) {
    const data = await response.json();
    return data;
  }
};