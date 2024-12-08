// import dtls from 'node-dtls-client';
var dtls = require("node-dtls-client");

const HUB_IP_ADDRESS = '10.0.0.195';
const username = 'k9ayxh7kwhoKodCqpcdh6vqGxZU3Cydg-4CkyFHu' as string;
const apiKey = '362352FC285E505F5D624D974D564571' as string;

export const monitorEntertainmentArea = () => {
  const socket = dtls.dtls
    // create a socket and initialize the secure connection
    .createSocket({
      type: 'udp4',
      address: HUB_IP_ADDRESS,
      port: 2100,
      psk: { [username]: Buffer.from(apiKey, 'hex').toString() },
      timeout: 10000,
      ciphers: ['TLS_PSK_WITH_AES_128_GCM_SHA256'] // The cipher suite used by Philips for DTLS
    })
    // subscribe events
    .on('connected', () => {
      console.log('connected!');
      /* start sending data */
    })
    .on('error', (e: any /* Error */) => {
      console.log(e);
    })
    .on('message', (msg: any /* Buffer */) => {
      console.log(msg);
    })
    .on('close', () => {});
};
