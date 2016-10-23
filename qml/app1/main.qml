import QtQuick 2.5
import QtQuick.Controls 2.0
import QtWebSockets 1.0
import MyModule 1.0

Rectangle {
    id: root
    width: 500
    height: 400
    color: "red"

    Rectangle {
        id: rect
        anchors.fill: parent
        clip: true
        radius: 10
        Image {
            anchors.fill: parent
            source: "./carbon-tile.png"
            fillMode: Image.Tile
        }
    }

    MyJoystick {
        id: joystick
        anchors.centerIn: parent
    }

    AwesomeItem {
        id: myItem
        test: []
        }
    /*WebSocket {
        id: socket
    }*/

    Test {
        Button {
            id: button
            text: "Test"
        }
        Text {
            text: "Foo Bar"
        }
        Text {
            text: "Foo Bar"
        }
    }
    Timer {
        interval: 100
        running: false
        repeat: true
        onTriggered: button.rotation += 5
    }
}
