const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Load credentials from environment variables
const MQTT_HOST = process.env.MQTT_HOST;
const MQTT_PORT = process.env.MQTT_PORT || 8884;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;
const MQTT_TOPIC = process.env.MQTT_TOPIC || 'esp8266/control';

const client = mqtt.connect(`wss://${MQTT_HOST}:${MQTT_PORT}/mqtt`, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  rejectUnauthorized: false,
});

client.on('connect', () => {
  console.log('? Connected to HiveMQ over WebSocket');
});

client.on('error', (err) => {
  console.error('? MQTT error:', err.message);
});

app.post('/send', (req, res) => {
  const { command } = req.body;
  if (!command) {
    return res.status(400).send("Missing 'command' in body");
  }

  client.publish(MQTT_TOPIC, command, {}, (err) => {
    if (err) {
      console.error('? Failed to publish:', err.message);
      return res.status(500).send('MQTT publish failed');
    }
    console.log(`?? Sent to ${MQTT_TOPIC}: ${command}`);
    res.send(`? Sent: ${command}`);
  });
});

// Health check
app.get('/', (req, res) => {
  res.send("?? MQTT Webhook Bridge is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`?? HTTP server listening on port ${PORT}`);
});
