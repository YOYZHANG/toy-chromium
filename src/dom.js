
enum NodeType = {
    Text,
    Element
}

class Node{
    constructor({children, nodeType, data}) {
        this.children = children;
        this.nodeType = nodeType;
        this.data = data;
    }
}
function text(data) {
    return new Node({
        children: [],
        nodeType: NodeType.Text
        data: data
    })
}

function element(name, attrs, children) {
    return new Node({
        children,
        nodeType: nodeType.Element,
        data: new ElementData(name, attrs)
    });
}


class ElementData {
    constructor(name, attrs) {
        this.tagname = name;
        this.attributes = attrs
    }

    getId(id) {
        return this.attributes[id]
    }

    getClasses() {

    }
}