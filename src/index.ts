import ColorConverter from 'cie-rgb-color-converter';
import { EventSource } from 'eventsource';
import { fetch, Agent } from 'undici';

const OFFICE_LIGHT_ID = '141eb238-9305-4677-a8a4-5a0dbef185ec';

import { getLights, setLightColor, setLightPower } from './govee';

let eventCount = 0;

const MAX_GOVEE_VALUE = 16777215;

interface HueMessage {
  creationtime: string;
  data: HueMessageData[];
  id: string;
  type: string;
}

interface HueColor {
  xy: { x: number; y: number };
}

interface HueMessageData {
  color: HueColor;
  id: string;
  id_v1: string;
  type: string;
}

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

const convertHueToGovee = (hueColor: HueColor) => {
  const { x, y } = hueColor.xy;
  const rgb = ColorConverter.xyBriToRgb(x, y, 75);
  const value = (rgb.r * 256 + rgb.g) * 256 + rgb.b;

  console.log(`${eventCount}) Updating color`, { hueColor, rgb, value, isValid: value <= MAX_GOVEE_VALUE });

  if (value > MAX_GOVEE_VALUE) {
    return 0;
  }

  return value;
};

const initHueMonitor = async () => {
  const lights = await getLights();

  if (lights) {
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
          // console.log('\n\nMessage Event:', JSON.stringify(colorEvent.color, null, 2));
          const color = convertHueToGovee(colorEvent.color);
          await Promise.all(lights.map(async light => await setLightColor(light, color)));
        }
        eventCount++;
      } else {
        // console.log('\n\nMessage Event:', JSON.stringify(hueEvent, null, 2));
      }
    });
  });

  eventSource.addEventListener('error', err => {
    console.error(err);
  });
};

initHueMonitor();
