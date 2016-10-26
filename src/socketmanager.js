const zmq = require('zmq');
const util = require('util');
const uuid = require('uuid');
const io = require('socket.io');
const tmp = require('tmp');
const EventEmitter = require('events').EventEmitter;
const protobufMessage = require('machinetalk-protobuf').message;
const Container = protobufMessage.Container;
const ContainerType = protobufMessage.ContainerType;

class ZmqConnection extends EventEmitter {
  constructor(uri, type, uuid) {
    super();
    this.uri = uri;
    this.type = type;
    this.socket = zmq.socket(type);
    this.timeout = 2000;

    this.socket.connect(this.uri);
    this.socket.on("message", this.emit.bind(this, "message"));
    //this.socket.on("message", this.refreshTimeout.bind(this));

    this.timer = null;
    //this.refreshTimeout();
  }

  // refresh a timeout
  refreshTimeout() {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.close.bind(this), this.timeout);
  }

  close() {
    clearTimeout(this.timer);
    this.socket.close();
    this.emit("closed", this);
    delete this;
  }
}

class ZmqBroker extends EventEmitter {
  constructor(uri, type, ipcDir) {
    super();
    let transport = (type === "dealer" ? "inproc://" : `ipc://${ipcDir}/`);
    let frontendType = (type === "sub" ? "xsub" : type);
    let backendType = (type === "dealer" ? "router" : "xpub");
    this.uri = uri;
    this.backendUri = transport + uuid.v4();
    this.type = type;
    this.frontend = zmq.socket(frontendType);
    this.backend = zmq.socket(backendType);
    this.connections = new Set();

    this.frontend.connect(this.uri);
    if (backendType === "xpub") {
      // enables subscriptions for all subscribers
      this.backend.setsockopt(zmq.ZMQ_XPUB_VERBOSE, 1);
    }
    this.backend.bindSync(this.backendUri);
    this.createBroker(this.frontend, this.backend);
  }

  createConnection() {
    let connection = new ZmqConnection(this.backendUri, this.type);
    connection.on("closed", this.connectionClosed.bind(this));
    this.connections.add(connection);
    return connection;
  }

  connectionClosed(connection) {
    this.connections.delete(connection);
    if (this.connections.size === 0) {
      this.close();
    }
  }

  createBroker(frontend, backend) {
    frontend.on("message", function() {
      // Note that separate message parts come as function arguments.
      let args = Array.apply(null, arguments);
      // Pass array of strings/buffers to send multipart messages.
      backend.send(args);
    });

    backend.on("message", function() {
      let args = Array.apply(null, arguments);
      frontend.send(args);
    });
  }

  close() {
    this.backend.close();
    this.frontend.close();
    this.emit("closed", this.type, this.uri);
  }
}

class SocketManager extends EventEmitter {
  constructor(server) {
    super();
    this.brokers = {sub: {}, dealer: {}}; // map of brokers
    this.io = io.listen(server);
    this.connections = {};
    this.ipcDir = tmp.dirSync().name;

    this.io.on("connection", this._handleConnection.bind(this));
  }

  _handleConnection(socket) {
    socket.on("message", this.websocketMsgReceived.bind(this, socket));
  }

  connectSocket(socket, msg) {
    let connection = this.createSocket(msg);
    if (connection !== undefined) {
      let uuid = msg.uuid;
      let type = msg.type;
      this.connections[uuid] = connection;

      socket.on("disconnect", this.websocketDisconnected.bind(this, uuid));
      connection.on("message", this.socketMessageReceived.bind(this, socket, type, uuid));
      if (type === "sub") {
        socket.on("subscribe", this.websocketSubscribeReceived.bind(this, connection));
        socket.on("unsubscribe", this.websocketUnsubscribeReceived.bind(this, connection));
      }
      else {
        socket.on("message", this.websocketMessageReceived.bind(this, connection));
      }
      socket.emit("connected");
    }
    else {
      socket.emit("error", "something went wrong");
    }
  }

  disconnectSocket(msg) {
    if (msg.uuid !== undefined) {
      this.closeSocket(msg.uuid);
    }
  }

  socketMessageReceived(socket, type, uuid) {
    let args = Array.apply(null, arguments);
    args.splice(0, 3);  // remove normal params
    if (type === "sub") {
      args[0] = args[0].toString();
    }
    socket.emit("message", args);
  }

  websocketMsgReceived(connection, msg) {
    if (msg.type === "connect socket") {
      this.connectSocket(connection, msg.data);
    }
  }

  websocketMessageReceived(connection, msg) {
    connection.socket.send(msg);
  }

  websocketSubscribeReceived(connection, msg) {
    connection.socket.subscribe(msg);
  }

  websocketUnsubscribeReceived(connection, msg) {
    connection.socket.unsubscribe(msg);
  }

  websocketDisconnected(uuid) {
    this.closeSocket(uuid);
  }

  createSocket(msg) {
    if ((msg.uri === undefined)
        || (msg.type === undefined)
        || (msg.uuid == undefined)) {
        return undefined;
    }

    if ((msg.type !== "sub") && (msg.type !== "dealer")) {
      return undefined;
    }

    let broker = this.brokers[msg.type][msg.uri];
    if (broker === undefined) {
      broker = new ZmqBroker(msg.uri, msg.type, this.ipcDir);
      this.brokers[msg.type][msg.uri] = broker;
      broker.on("closed", this.brokerClosed.bind(this));
    }
    return broker.createConnection();  // TODO use connection
  }

  closeSocket(uuid) {
    let connection = this.connections[uuid];
    if (connection !== undefined) {
      connection.close();
      delete this.connections[uuid];
    }
  }

  brokerClosed(type, uri) {
    delete this.brokers[type][uri];
  }
}

module.exports = SocketManager;
