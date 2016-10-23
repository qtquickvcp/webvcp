import QtQuick 2.5

Rectangle {
    property bool checked: false

    id: root
    color: checked ? "green" : "gray"
    border.color: "black"
    border.width: 1
    height: 20
    width: height
    radius: width/2

    Rectangle {
        width: parent.width * 0.3
        height: width
        radius: width/2
        color: "white"
        opacity: 0.4
        x: parent.width * 0.2
        y: x
    }
}
