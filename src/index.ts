import { EventSource } from 'eventsource';
import { fetch, Agent } from 'undici';

import { getDevices } from './govee';

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

console.log('Starting event monitor...');

const eventSource = new EventSource('https://10.0.0.195/eventstream/clip/v2', {
  withCredentials: true,
  fetch: customFetch
});

/*
 * This will listen for events with the field `event: notice`.
 */
eventSource.addEventListener('notice', event => {
  console.log('\n\nNotice Event:', event.data);
});

/*
 * This will listen for events with the field `event: update`.
 */
eventSource.addEventListener('update', event => {
  console.log('\n\nUpdate Event:', event.data);
});

/*
 * The event "message" is a special case, as it will capture events _without_ an
 * event field, as well as events that have the specific type `event: message`.
 * It will not trigger on any other event type.
 */
eventSource.addEventListener('message', event => {
  const hueEvents = JSON.parse(event.data) as HueMessage[];

  hueEvents.forEach(hueEvent => console.log('\n\nMessage Event:', JSON.stringify(hueEvent, null, 2)));
});

eventSource.addEventListener('error', err => {
  console.error(err);
});

const initGovee = async () => {
  const devices = await getDevices();

  console.log('Devices', devices);
};

initGovee();
