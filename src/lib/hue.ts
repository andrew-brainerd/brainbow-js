import { EventSource } from 'eventsource';
import { fetch, Agent } from 'undici';

import { HueMessage } from 'types/hue';
import { convertHueToGovee } from 'utils/color';
import { OFFICE_LIGHT_ID } from 'constants/hue';
import { getLights, setLightColor, setLightPower } from 'lib/govee';

const customFetch = (url: string | URL) => {
  const headers: HeadersInit = {
    'hue-application-key': 'k9ayxh7kwhoKodCqpcdh6vqGxZU3Cydg-4CkyFHu',
    'Accept': 'text/event-stream'
  };

  return fetch(url, {
    dispatcher: new Agent({
      connect: {
        rejectUnauthorized: false
      }
    }),
    headers
  });
};

export const initHueMonitor = async () => {
  const lights = await getLights();

  if (lights) {
    console.info('Syncing Hue with Govee lights');
    await Promise.all([lights.map(light => setLightPower(light, 'on'))]);
  }

  const eventSource = new EventSource('https://10.0.0.195/eventstream/clip/v2', {
    withCredentials: true,
    fetch: customFetch
  });

  eventSource.addEventListener('message', event => {
    const hueEvents = JSON.parse(event.data) as HueMessage[];

    hueEvents.forEach(async hueEvent => {
      const colorEvent = hueEvent.data.find(eventData => !!eventData.color);

      if (colorEvent) {
        if (lights && colorEvent.id === OFFICE_LIGHT_ID) {
          const color = convertHueToGovee(colorEvent.color);
          await Promise.all(lights.map(async light => await setLightColor(light, color)));
        }
      }
    });
  });

  eventSource.addEventListener('error', err => {
    console.error(err);
  });
};