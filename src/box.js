// layout 模块
// 把style tree 转换成一系列的方块。
// box: width,height,position



// css box Model. All size are in px
type Dimensions {
    content: Rect,
    padding: EdgeSizes,
    border: EdgeSizes,
    margin: EdgeSizes
}

class Rect = {
    constrcutor ({x, y, width, height}) {
    }
    expandBy(edge) {
        return new Rect({
            x: this.x - edge.left,
            y: this.y - edge.top,
            width: this.width + edge.left + edge.right,
            height: this.height + edge.top + edge.bottom
        })
    }
}

type EdgeSizes = {
    left,
    right,
    top,
    bottom
}

// display: inline & block
// 每个box必须仅包含 block,或者 inline
// 当dom元素的children同时包含block和inline children
// 那么layout引擎就会添加 “匿名盒子” 来分离这两种类型。
// 匿名盒子不会和dom数里的节点产生关联。


class LayoutBox {
    constructor(boxType) {
        // 默认各项都是0
        this.dimensions: Dimensions;
        this.boxType: BoxType = boxType;
        this.children = [];
    }

    // 如果一个块节点包含一个内联节点，创建一个匿名盒子
    // 如果在一行中有多个内联盒子，那么就把他们放在同一个匿名盒子中
    getInlineContainer() {
        if (this.boxType === 'block') {
            if (this.children.last() !== 'anonymousBlock') {
                this.children.push(new LayoutBox('anonymousBlock'))
            }
        }
    }

    // Lay out a box and its descendants.
    // 获取layoutbox并计算dimensions
    layout() {
        if (this.boxType === 'BlockNode') {
            // 方块的宽度取决于parent，height取决与children
            // 这意味在计算宽度时代码需要从上到下遍历tree
            // 所以他可以在知道父亲节点的宽度后，给孩子节点的宽度布局。
            // 在计算高度时，从下到上，这样parent的高度的计算会在child之后
            this.layoutBlock();
        }
        else if (this.boxType === 'InlineNode') {
            // Todo
        }
        else if (this.boxType === 'AnonymousBlock') {
            // Todo
        }
    }

    layoutBlock(containBlock) {
        // 计算盒子宽度
        this.calculateBlockWidth(containBlock);

        // 计算盒子的位置
        this.caculateBlockPosition(containBlock);

        // 递归的layout chidlren
        this.layoutBlockChildren();

        // 父亲的高度依赖孩子，所以caculate_height必须在children layout后
        this.caculateBlockHeight();

        // 实际的搜索引擎会执行数个遍历，有的向上，有的向下。
    }

    calculateBlockWidth() {
        // 我们需要css中width属性，和所有left 和 right的值
        let style = this.getStyleNode();

        let width = style.value('width') || 'auto';

        let marginLeft = style.lookup('margin-left', 'margin', 0);
        let marginRight = style.lookup('margin-right', 'margin', 0);

        let borderLeft = style.lookup('border-left-width', 'border-width', 0);
        let borderRight = style.lookup('border-right-width', 'border-width', 0);

        let paddingLeft = style.lookup('padding-left', 'padding', 0);
        let paddingRight = style.lookup('padding-right', 'padding', 0);


        // 由于child 不能改变 parent的宽度，因此要确保child的宽度是fit parent的
        // 首先，我们将margin,padding,border和width相加
        // 这是容器需要的最小空间
        let total = marginLeft
            + marginRight
            + borderLeft
            + borderRight
            + paddingLeft
            + paddingRight
            + width
        // 如果width和margin被设置为 auto,是可以自适应的
        // 我们首先检查box是否过大，若是，我们把所有可扩展的margin设为0
        if (width !== 'auto' && total > containBlock.content.width) {
            if (marginLeft == 'auto') {
                marginLeft = 0;
            }

            if (marginRight == 'auto') {
                marginRight = 0;
            }
        }

        // 如果盒子过于大，就会溢出
        // 如果过小，就会下溢，离开特定的位置。
        // 我们计算underFlow
        let underFlow = containBlock.content.width - total;
        
        // 如果没有auto,我们就来调整右边距
        if (width!== 'auto' && marginLeft !== 'auto' && marginRight !== 'auto') {
            marginRight = marginRight + underFlow;
        }

        if (width!== 'auto' && marginLeft !== 'auto' && marginRight == 'auto') {
            marginRight = underFlow;
        }

        if (width!== 'auto' && marginLeft == 'auto' && marginRight !== 'auto') {
            marginLeft = underFlow;
        }

        if (width == 'auto') {
            if (marginLeft == 'auto') {
                marginLeft = 0;
            }
            if (marginRight == 'auto') {
                marginRight = 0;
            }

            if (underFlow >= 0) {
                width = underFlow
            }
            else {
                width = 0;
                marginRight = marginRight + underFlow;
            }
        }

        if (width!== 'auto' && marginLeft == 'auto' && marginRight == 'auto') {
            marginLeft = underFlow/2;
            marginRight = underFlow/2;
        }


    }

    // margin/padding/border
    caculateBlockPosition(containBlock) {
        let style = this.getStyleNode();
        let d = this.dimensions;
        
        d.margin.top = style.lookup("margin-top", "margin", 0);
        d.margin.bottom = style.lookup("margin-bottom", "margin", 0);

        d.border.top = style.lookup("border-top-width", "border-width", 0);
        d.border.bottom = style.lookup("border-bottom-width", "border-width", 0);

        d.padding.top = style.lookup("padding-top", "padding", 0);
        d.padding.bottom = style.lookup("padding-bottom", "padding", 0);

        d.content.x = containBlock.content.x + d.margin.left + d.border.left + d.padding.left;
        d.content.y = containBlock.content.height + containBlock.content.y + d.margin.top + d.border.top + d.padding.top;
    }

    // 每次递归时，他会跟踪总内容的高度，上面的定位代码使用它来寻找下一个节点
    layoutBlockChildren() {
        let d = this.dimensions;
        for (child in this.children) {
            child.layout(d);
            // 跟踪高度，以便每个孩子都在上一个的下方
            d.content.height = d.content.height + children.dimensions.marginBox().height;
        }
    }

    // 默认是使用内容的高度，但如果设置了height属性，就使用它
    caculateBlockHeight() {
        if (this.getStyleNode().value('height')) {
            this.dimensions.content.height = this.getStyleNode().value('height');
        }
    }

    paddingBox() {
        this.content.expandBy(this.padding)
    }

    borderBox() {
        this.paddingBox().expandBy(this.border);
    }

    marginBox() {
        this.borderbox().expandBy(this.margin);
    }
} 

enum BoxType {
    BlockNode,
    InlineNode,
    AnonymousBlock
}

// 根据style tree 建立layout tree
// 为每个节点建立layoutBox, 并将这些box插入到node children上
// 如果display为none,那么就不会插入到layout tree中

function buildLayoutTree(styleNode): LayoutBox {
    let displayVal = styleNode.display();
    let node;
    if (displayVal === 'Block') {
        node = new BlockNode(styleNode)
    }
    else if (displayVal === 'Inline') {
        node = new InlineNode(styleNode)
    }

    // 1. 确定nodeType
    let root = new LayoutBox(node);

    for(child in styleNode.children) {
        let childDisplay = child.display();
        if (childDisplay === 'Block') {
            root.children.push(buildLayoutTree(child));
        }
        else if (childDisplay === 'Inline') {
            root.getInlineContainer().children.push(buildLayoutTree(child));
        }
    }

    return root;
}



