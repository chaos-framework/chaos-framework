# Chaos Framework Socket.IO Client and Server

## Server

Implements the `Server` class from the core library as a simple Socket.IO server.

### Usage
Import the library into your project and create the server object, passing a `Game` module/object (one that implements `initialize`, `onPlayerConnect`, etc).

```
import { Server } from '@chaos-framework/server-ws';
const game = require('path/to/game/index.js`); // etc

const server = new Server(3000, game, { gameOptions.. });
```

## Client

TODO