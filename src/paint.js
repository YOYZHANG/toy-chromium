// 栅格化过程
// 浏览器经常借助图像api和像skia,cairo,direct2D这样的工具来绘图
// 以下仅可绘制矩形

// 为什么要放在显示列表中而不是立即执行
// 原因如下：
// 1. 你可以对那些后续会被覆盖掉的操作，直接废弃掉
// 2. 当只有部分更新时，你可以修改或重用display list
// 3. 你可以用同一个display list 生成不同的 output


const DisplayList = DisplayCommand[];

class DisplayCommand {
    constructor() {}
    // 遍历layoutTree并为每个盒子添加一些规则
    // 首先我们绘制盒子的background,然后我们在background上绘制border和content
    buildDisplayList(layoutRoot) {
        let list = [];
        renderLayoutBox(list, layoutRoot);
        return list;
    }
    renderLayoutBox(list, layoutBox) {
        renderBackground(list, layoutBox);
        renderBorder(list, layoutBox);
        // todo: render Text

        for (child in layoutBox.children) {
            renderLayoutBox(list, child);
        }
    }

    // 一般html元素会安他们出现的顺序堆叠，如果两个元素堆叠，那么后一个元素会覆盖在前一个上面
    // display list将按照元素显示的顺序来进行绘制。
    // 如果支持z-index,那么我们需要按要求对display list进行排序

    // background 就是一个方形，如果没有背景颜色，那么我们就不需要调用display命令
    renderBackground(list, layoutBox) {
        getColor(layoutBox, 'background').map(color => {
            list.push(solidColor(color, layoutBox.dimensions.borderBox());
        })
    }

    getColor(layoutBox, name) {
        if (layoutBox.boxType === ('blockNode' || 'inlineNode')) {
            if (style.value(name)) {
                return style.value(name);
            }
            else {
                return null;
            }
        }
        else if (layoutBox.boxType === 'anonymousBlock'){
            return null;
        }
    }
    // 绘制4个，分别对应四条边
    renderBorders(list, layoutBox) {
        let color = getColor(layoutBox, 'border-color');
        if (!color) {
            return;
        }

        let d = layoutBox.dimensions;
        let borderBox = d.borderBox();

        // left border
        list.push(solidColor(color, new Rect({
            x: borderBox.x,
            y: borderBox.y,
            width: d.border.left,
            height: borderBox.height
        })));

        // right border
        list.push(solidColor(color, new Rect({
            x: borderBox.x + borderBox.width - d.border.right,
            y: borderBox.y,
            width: d.border.right,
            height: borderBox.height
        })));

        // top border
        list.push(solidColor(color, new Rect({
            x: borderBox.x,
            y: borderBox.y,
            width: borderBox.width,
            height:d.border.top
        })));


        // bottom border
        list.push(solidColor(color, new Rect({
            x: borderBox.x,
            y: borderBox.y + borderBox.height - d.border.bottom,
            width: borderBox.width,
            height: d.border.bottom,
        })));

    }
}



// 现在，我们已经有了display 命令的 list
// 我们现在需要执行以上命令，绘制成像素点。
// 我们将在canvas中存储pixels

class Canvas {
    constructor(width, height) {
        let white = Color({r: 255, g: 255, b: 255, a: 255});
        // 画布
        this.pixels = repeat(white).take(width * height);
        this.width = width;
        this.height = height;
    }

    // 我们只需要递归row和column,
    // 用辅助函数确保我们不会画到canvas外面
    paintItem(item: DisplayCommand) {
        let color = item.color;
        let rect = item.rect;
        
        // x0 在[0, width]中取值
        let x0 = rect.x.clamp(0, this.width);
        let y0 = rect.y.clamp(0, this.height);
        let x1 = (rect.x + rect.width).clamp(0, this.width);
        let y1 = (rect.y + rect.height).clamp(0, this.height);

        // 不支持透明像素，若有这一需求，需要将overlap的像素进行混合
        for (y in {y0, y1}) {
            for(x in {x0, x1}) {
                this.pixels[x + y * this.width] = color;
            }
        }
    }

    // bounds是什么？
    paint(layoutRoot, bounds) {
        // 获取指令列表
        let displayList = buildDisplayList(layoutRoot);

        let canvas = new Canvas(bounds.width, bounds.height);

        for (item in displayList) {
            canvas.paintItem(item);
        }

        return canvas;


    }
}