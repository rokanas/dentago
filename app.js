const express = require('express');         // web app framework
const httpProxy = require('http-proxy');
const { spawn } = require('child_process');

// load environmental variables from .env file to process.env object
require('dotenv').config();

const host = process.env.HOST || process.env.CI_HOST;
const port = process.env.PORT || process.env.CI_PORT;

const app = express();
const proxy = httpProxy.createProxyServer();

const apiInstances = [];
let nextInstance = Number(port) + 1;

const minServer = process.env.MIN_SERVER;
const maxServer = process.env.MAX_SERVER;

for(let i = 0; i < maxServer; i++) {
  const apiInstance = spawn('node', ['patientApi.js', String(nextInstance)]);
  iterateInstance();
  apiInstances.push(apiInstance);

  apiInstance.stdout.on('data', (data) => {
    console.log(`API Server ${i + 1}: ${data.toString()}`);
  });

  apiInstance.stderr.on('data', (data) => {
    console.error(`API Server ${i + 1}: ${data.toString()}`);
  });
};

app.use('/', (req, res) => {
  const target = `${host}:${nextInstance}`;
  iterateInstance();
  proxy.web(req, res, { target });
});

app.listen(port, () => {
  console.log(`Load Balancer is running on port ${port}`);
});

// handle process termination
process.on('SIGINT', () => {
  // terminate API server instances
  apiInstances.forEach((apiInstance) => apiInstance.kill());

  // terminate the main server
  process.exit();
});

function iterateInstance() {
  nextInstance = nextInstance >= (Number(port)) + (Number(maxServer))  ? 3001 : nextInstance + 1;
}

module.exports = app;