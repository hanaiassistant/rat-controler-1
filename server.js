const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = {
  controllers: new Map(),
  targets: new Map()
};

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const params = new URLSearchParams(req.url.slice(1));
  const deviceType = params.get('type');
  const deviceId = params.get('id');

  if (!deviceType || !deviceId) {
    ws.close(1008, 'Invalid connection parameters');
    return;
  }

  // Add to appropriate collection
  if (deviceType === 'controller') {
    clients.controllers.set(deviceId, ws);
    console.log(`Controller connected: ${deviceId}`);
    
    // Notify all targets about new controller
    broadcastToTargets({
      type: 'controller-status',
      status: 'connected',
      controllerId: deviceId
    });
  } 
  else if (deviceType === 'target') {
    clients.targets.set(deviceId, ws);
    console.log(`Target connected: ${deviceId}`);
    
    // Notify all controllers about new target
    broadcastToControllers({
      type: 'target-status',
      status: 'connected',
      targetId: deviceId
    });
  }

  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(deviceType, deviceId, data);
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    if (deviceType === 'controller') {
      clients.controllers.delete(deviceId);
      console.log(`Controller disconnected: ${deviceId}`);
      
      // Notify targets
      broadcastToTargets({
        type: 'controller-status',
        status: 'disconnected',
        controllerId: deviceId
      });
    } 
    else if (deviceType === 'target') {
      clients.targets.delete(deviceId);
      console.log(`Target disconnected: ${deviceId}`);
      
      // Notify controllers
      broadcastToControllers({
        type: 'target-status',
        status: 'disconnected',
        targetId: deviceId
      });
    }
  });
});

function handleMessage(deviceType, deviceId, data) {
  switch (data.type) {
    case 'command':
      if (deviceType === 'controller') {
        // Forward command to target
        const targetWs = clients.targets.get(data.targetId);
        if (targetWs) {
          targetWs.send(JSON.stringify({
            type: 'command',
            command: data.command,
            args: data.args,
            controllerId: deviceId
          }));
        }
      }
      break;

    case 'response':
      if (deviceType === 'target') {
        // Forward response to controller
        const controllerWs = clients.controllers.get(data.controllerId);
        if (controllerWs) {
          controllerWs.send(JSON.stringify({
            type: 'response',
            response: data.response,
            targetId: deviceId
          }));
        }
      }
      break;

    case 'permission-response':
      if (deviceType === 'target') {
        // Forward permission response to controller
        const controllerWs = clients.controllers.get(data.controllerId);
        if (controllerWs) {
          controllerWs.send(JSON.stringify({
            type: 'permission-response',
            granted: data.granted,
            targetId: deviceId,
            permissions: data.permissions
          }));
        }
      }
      break;
  }
}

function broadcastToControllers(message) {
  clients.controllers.forEach((ws) => {
    ws.send(JSON.stringify(message));
  });
}

function broadcastToTargets(message) {
  clients.targets.forEach((ws) => {
    ws.send(JSON.stringify(message));
  });
}

// Serve static files
app.use('/controller', express.static(path.join(__dirname, 'controller')));
app.use('/target', express.static(path.join(__dirname, 'target')));

// Routes
app.get('/', (req, res) => res.redirect('/controller'));
app.get('/controller', (req, res) => res.sendFile(path.join(__dirname, 'controller/index.html')));
app.get('/target', (req, res) => res.sendFile(path.join(__dirname, 'target/index.html')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});