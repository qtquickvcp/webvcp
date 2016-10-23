const http = require('http');
const express = require('express');
const path = require('path');
const args = require('commander');
const sd = require('./src/express-sd');
const SocketManager = require('./src/socketmanager.js');

// parse arguments
args
  .version('0.1')
  .option('-a, --application [string]', 'Application to serve via WebVCP', path.join(__dirname, 'qml/app3'))
  .parse(process.argv);

let app = express();
let server = http.createServer(app);

// serve qmlweb library
//app.use('/lib', express.static(path.join(__dirname, 'node_modules/qmlweb/lib')));
app.use('/lib', express.static(path.resolve('../qmlweb/lib')));
app.use('/locallib', express.static(path.join(__dirname, 'lib')));
// serve qml files
app.use('/qml', express.static(args.application));
// serve module
app.use('/modules', express.static(path.join(__dirname, 'modules')));

// serve main HTML file
const data = `
<!DOCTYPE html>
<html>
  <head>
    <title>WebVCP</title>
    <script type="text/javascript" src="locallib/socket.io-1.4.0.js"></script>
    <script type="text/javascript" src="locallib/machinetalk-protobuf.js"></script>
    <script type="text/javascript" src="locallib/state-machine.min.js"></script>
    <script type="text/javascript" src="locallib/microevent.js"></script>
    <script type="text/javascript" src="lib/qt.js"></script>
  </head>
  <body style="margin: 0;" data-qml="qml/main.qml">
  </body>
</html>
`;

app.route('/')
    .get((request, response) => {
        response.send(data);
    });

sd.registerRoutes(app);
let socketManager = new SocketManager(server);

server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
