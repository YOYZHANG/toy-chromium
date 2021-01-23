class Stylesheet {
    constructor(rules) {
        this.rules = rules
    }
}

class Rule {
    constructor() {
        this.selectors = selectors;
        this.declarations = declarations;
    }
}

// id: xxx
class Selector {
    constructor(tagName, id) {
        this.tagName = tagName | '';
        this.id = id | '';
        this.class = [];
    }

    // 多个选择器的优先级选择
    specificity() {
        let a = this.id.count()
        let b = this.class.len();
        let c = this.tag_name.count();

        return [a,b,c];
    }
}

// margin: auto;
class Declaration {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}

enum Value {
    keyword,
    length,
    colorValue
}

// mock code
// Parse one simple selector, e.g.: `type#id.class1.class2.class3`
function parseSelector() {
    let selector = new Selector();
    while(length) {
        if (char === '#') {
            selector.id = parseIdentifier();
            consumeChar();
        }
        else if (char === '.') {
            selector.class.push(parseIdentifier());
            consumeChar();
        }
        else if (char === '*') {
            consumeChar();
        }
        else {
            selector.tagName = parseIdentifier();
        }
        char = char.next();
    }

    return selector;
}

function parseRule() {
    return new Rule(parseSelector(), parseDeclarations());
}







