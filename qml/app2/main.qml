import QtQuick 2.5
import QtQuick.Controls 2.0
import "./solver.js" as Solver

Rectangle {
    id: root
    color: 'black'
    implicitWidth: 500
    implicitHeight: 500

    Column {
        id: column
        anchors.fill: parent

        TextEdit {
            id: edit
            anchors.left: parent.left
            anchors.right: parent.right
            height: 300
            color: "white"
        }
        Button {
            id: solveButton
            text: "Solve!"
        }
    }
}
