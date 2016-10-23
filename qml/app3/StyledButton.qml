import QtQuick 2.5
//import "singletons"

Item {
    property string text: ""
    property bool checked: false
    property bool checkable: false
    property alias pressed: mouseArea.pressed

    signal clicked()

    id: root
    implicitWidth: 200
    implicitHeight: 60

    /*BorderImage {
        anchors.fill: parent
        source: checked ? "icons/button-highlight.png" : "icons/button.png"
        border { left: 30; top: 30; right: 30; bottom: 30 }
        horizontalTileMode: BorderImage.Repeat
        verticalTileMode: BorderImage.Repeat
        }*/

    Image {
        id: icon
        anchors.fill: parent
        source: checked ? "icons/button-highlight.png" : "icons/button.png"
    }

    Text {
        anchors.centerIn: parent
        text: root.text
        font.family: "Arial"
        font.pixelSize: 20
        color: root.checked ? "#25ff00" : "white"
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent

        onClicked: {
            root.clicked();
            if (root.checkable) {
                root.checked = !root.checked;
            }
        }
    }
}
