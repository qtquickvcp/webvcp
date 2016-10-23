import QtQuick 2.5
import QtQuick.Controls 2.0
import Machinekit.Service 1.0
import Machinekit.HalRemote 1.0

ServiceWindow {
    id: root
    //width: 500
    //height: 500
    anchors.fill: parent

    Rectangle {
        anchors.fill: parent
        color: "#1B1918"
    }

    Service {
        id: halrcmdService
        type: "halrcmd"
        required: false
    }

    Service {
        id: halrcompService
        type: "halrcomp"
        required: false
    }

    Service {
        id: launcherService
        type: "launcher"
        required: false
    }

    HalRemoteComponent {
        id: halremoteComponent
        name: "anddemo"
        halrcmdUri : halrcmdService.uri
        halrcompUri: halrcompService.uri
        ready: (halrcmdService.ready && halrcompService.ready) || connected
        containerItem: container
    }

    Row {
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: 10
        spacing: 10

        Led {
            checked: halrcmdService.ready && halrcompService.ready
        }

        Led {
            checked: halremoteComponent.connected
        }
    }

    Column {
        id: container
        anchors.centerIn: parent
        spacing: 10

        /*Text {
            width: 300
            height: 50
            text: halrcmdService.uri
        }

        Text {
            id: testText
            width: 300
            height: 50
            text: halrcompService.uri
        }*/

        StyledButton {
            id: button0
            text: "Button 0"
            checkable: true
            //onCheckedChanged: button0Pin.value = checked

            HalPin {
                id: button0Pin
                name: "button0"
                type: HalPin.Bit
                direction: HalPin.Out

                //onValueChanged: button0.checked = value
            }

            Binding { target: button0; prop: "checked"; value: button0Pin.value }
            Binding { target: button0Pin; prop: "value"; value: button0.checked }
        }

        StyledButton {
            id: button1
            checked: button1Pin.value
            text: "Button 1"

            HalPin {
                id: button1Pin
                name: "button1"
                type: HalPin.Bit
                direction: HalPin.Out
            }

            Binding { target: button1; prop: "checked"; value: button1Pin.value }
            Binding { target: button1Pin; prop: "value"; value: button1.pressed }
        }

        Led {
            anchors.horizontalCenter: parent.horizontalCenter
            checked: ledPin.value
            HalPin {
                id: ledPin
                name: "led"
                type: HalPin.Bit
                direction: HalPin.In
            }
        }
        /*Repeater {
            id: listView
            //anchors.fill: parent
            model: launcherService.items
            delegate: Text {
                text: index + ": " + listView.model[index].name
                height: 20
                width: 500
            }
        }*/
    }

    CheckBox {
        id: checkBox
        anchors.horizontalCenter: parent.horizontalCenter
        text: "Ready"
    }

    Timer {
        interval: 100
        running: true
        onTriggered: checkBox.checked = true;
    }
}
