import QtQuick 2.5
import Machinekit.Service 1.0

Item {
    id: root

    ServiceDiscovery {
        id: serviceDiscovery
        running: checkBox.checked

        serviceLists: [
            ServiceList {
                id: serviceList
            }
        ]

        filter: ServiceDiscoveryFilter {
            id: serviceDiscoveryFilter
        }
    }

    function recurseServices(qmlItem, services)
    {
        if (qmlItem.data == undefined) {
            return;
        }

        for (var i = 0; i < qmlItem.data.length; ++i)
        {
            var item = qmlItem.data[i];
            if (item.objectName === "Service") {
                services.push(item);
            }
            else {
                recurseServices(item, services);
            }
        }
    }

    Component.onCompleted: {
        var services = [];
        recurseServices(root, services);
        for (var i = 0; i < services.length; ++i) {
            var item = services[i];
            serviceList.services.push(item);
        }
    }

}
