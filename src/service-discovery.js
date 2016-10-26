const dbus = require('dbus-native');
const avahi = require('avahi-dbus');

let bus =  dbus.systemBus();
let dnsSd = new avahi.Daemon(bus);
let services = [];

// PROTO_UNSPEC, PROTO_INET, PROTO_INET6
const PROTO = avahi.PROTO_INET;

function dnsServiceResolved(err, interface, protocol, name, type, domain, host, aprotocol, address, port, txt, flags) {
  if (err) {
    console.log("Resolve error: " + err);
    return;
  }

  let service = {name, host, address, port};
  for (let item of txt) {
    let textItem = Buffer(item.data).toString('utf8');
    let [key, value] = textItem.split('=');
    service[key] = value;
  }
  services.push(service);
}

function newDnsItem(interface, protocol, name, type, domain, flags)
{
  dnsSd.ResolveService(interface, protocol, name, type, domain, PROTO, 0, dnsServiceResolved);
}

function removeDnsItem (interface, protocol, name, type, domain, flags)
{
  for (let i = (services.length - 1); i >= 0; i--) {
    if (services[i].name === name) {
      services.splice(i, 1);
    }
  }
}

dnsSd.ServiceBrowserNew(avahi.IF_UNSPEC, PROTO, '_machinekit._tcp', 'local', 0, (err, browser) => {
  if (err) {
    console.log("Error registering service discovery", err);
    return;
  }

  browser.on('ItemNew', newDnsItem);
  browser.on('ItemRemove', removeDnsItem);
});

exports.services = services;
