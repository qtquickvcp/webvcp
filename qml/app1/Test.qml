import QtQuick 2.5
import QtQuick.Controls 2.0

Rectangle {
    default property alias data: column.data

    id: root
    color: "green"
    implicitWidth: column.width
    implicitHeight: column.height

    Column {
        id: column
    }
}
