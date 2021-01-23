/**
 * 此模块将dom和css作为输入，并将他们匹配起来
 * 以确定任何给定节点的每个css属性的值
 * 称其为style tree，每个节点包括一个指向dom的指针，和它对应的css
*/

// 关注： dom和css是怎么匹配上的
// 关注： style tree是怎么构建的

class StyleNode {
    constructor() {
        // pointer to dom
        // each node in the DOM tree has exactly one node in the style tree
        this.node = node;
        // map from css property names to value.
        this.specifiedValue = {};
        // styleNode
        this.children = {};
    }

    // 选择器匹配
    // 遍历selector，看是否与elem匹配
    // 此处不考虑复合选择器
    matches(elem, selector) {
        // check type selector
        if (selector.tagName.iter().some(elem.tagName)) {
            return false;
        }

        if (selector.id.iter().some(elem.id)) {
            return false;
        }

        let eleClasses = elem.classes();

        if (selector.class.some(eleClasses)) {
            return false;
        }

        return true;
    }

    // 遍历dom tree
    // 对于树中的每个元素，我们将在样式表中搜索匹配的规则
    // 若有两条规则match了这个element,我们需要使用最高优先级的规则
    // 因为我们的css解析器从高到低优先级存储了selectors
    // 所以可以在匹配到一条规则后立刻停止

    // 真正的浏览器引擎可以通过基于标记名称，id，类等将规则存储在多个哈希表中来加快此过程
    matchRule(elem, rule) {
        rule.selectors
            .find(selector => matches(elem, selector))
            .map(selector => （selector.specificity(), rule))
    }

    matchRules(elem, stylesheet) {
        stylesheet.rules.filter(rule => {
            matchRule(elem, rule)
        })
    }

    // 在找到所有的规则当中，我们按照优先级排序
    // 因此较具体的规则将被优先处理
    specifiedValues(elem, stylesheet) {
        let values = {};
        let rules = matchRules(elem, stylesheet);

        // 将规则由低到高排序
        rules.sort();
        for (rule in rules) {
            for declaration in rule.declarations {
                vaules[declaration.name] = declaration.value;
            }
        }
    }

    // 本demo的css映射只对element有效，对text是一个空映射
    styleTree(root, stylesheet) {
        new StyleNode({
            node: root,
            specifiedValues: specifiedValues(elem, stylesheet),
            children: root.children.map(child => styleTree(child, stylesheet))
        });
    }

    // 用于layout模块
    value(name) {
        this.specifiedValues.get(name)
    }

    // 用于layout模块
    display() {
        let keywords = this.value('display');
        if (keywords) {
            if (keywords === 'block') {
                return Display.Block
            }
            else if (keywords === 'none') {
                return Display.None
            }
            else {
                // 默认
                return Display.Inline
            }
        }
    }

}

enum Display {
    Inline,
    Block,
    None
}

