let canvas = document.getElementById("drawing-board");
let ctx = canvas.getContext("2d");
let brush = document.getElementById("brush");
let reSetCanvas = document.getElementById("clear");
let aColorBtn = document.getElementsByClassName("color-item");
let undo = document.getElementById("undo");
let activeColor = 'black';
let lWidth = 8;

autoSetSize(canvas);

setCanvasBg('white');

listenToUser(canvas);

window.onbeforeunload = function() {
    return "Reload site?";
};

/**
 * 
 * @param {*} canvas 
 * 画布自匹配页面大小
 */
function autoSetSize(canvas) {
    canvasSetSize();

    function canvasSetSize() {
        let pageWidth = document.documentElement.clientWidth;
        let pageHeight = document.documentElement.clientHeight;

        canvas.width = pageWidth;
        canvas.height = pageHeight;
    }

    window.onresize = function() {
        canvasSetSize();
    }
}

function setCanvasBg(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
}

/**
 * 
 * @param {*} canvas 
 * 监听画布
 */
function listenToUser(canvas) {
    let painting = false;
    let touch = false;
    let lastPoint = { x: undefined, y: undefined };
    let path = []
    var pathway, pathangle, lastpastway;
    /**
     * 
     * @param {*} e 
     * 监听mousedown，以此为基础监听mousemove，mouseup，mouseleave
     */
    canvas.onmousedown = function(e) {
        console.log('down')
        this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height); //在这里储存绘图表面
        saveData(this.firstDot);
        painting = true;
        let x = e.clientX;
        let y = e.clientY;
        lastPoint = { "x": x, "y": y };
        ctx.save();
        drawStart(x, y, lWidth);
        var previousX;
        var previousY;
        var previousT;
        var controlPoint;
        var pointangle = false
        var linepoint;
        var linecontrolpoint;
        var lineendpoint;
        var linespeed;
        var linelwidth = 10
        canvas.onmousemove = function(e) {
            // console.log("mousemove")
            if (painting && !touch) {
                let x = e.clientX;
                let y = e.clientY;
                let newPoint = { "x": x, "y": y };
                //通过获取前点与现点的坐标与时间差，判断鼠标移动速度
                if (
                    previousX !== undefined &&
                    previousY !== undefined &&
                    previousT !== undefined &&
                    controlPoint !== undefined
                ) {
                    var deltaX = x - previousX;
                    var deltaY = y - previousY;
                    var deltaD = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)); //距离差
                    var deltaT = e.timeStamp - previousT; //时间差
                    var speed = deltaD / deltaT * 1000
                        // 通过鼠标速度快慢实现线宽变化
                    if (speed >= 1200) {
                        if (lWidth > 6) { lWidth = lWidth * 0.85 } else { lWidth = 6 }
                    } else if (1200 > speed >= 600) {
                        if (lWidth > 6) { lWidth = lWidth * 0.9 } else { lWidth = 6 }
                    } else if (speed <= 100) {
                        if (lWidth < 10) { lWidth = lWidth * 1.1 } else { lWidth = 10 }
                    } else {
                        if (lWidth > 8.1) { lWidth = lWidth * 0.95 } else if (lWidth < 7.9) { lWidth = lWidth * 1.05 } else { lWidth = 8 }
                    }
                    // 贝塞尔曲线起点 / 终点为绘制点两点之间， 控制点为绘制点， 绘制线连续可导
                    var endPoint = { "x": (controlPoint.x + newPoint.x) / 2, "y": (controlPoint.y + newPoint.y) / 2 }
                        //先画path，再画线
                    if (path.length < 11) {
                        if (path.length > 2) {
                            var path1_0 = Math.sqrt(Math.pow(path[path.length - 2][1].x - path[path.length - 3][1].x, 2) + Math.pow(path[path.length - 2][1].y - path[path.length - 3][1].y, 2));
                            var path1_2 = Math.sqrt(Math.pow(path[path.length - 2][1].x - path[path.length - 1][1].x, 2) + Math.pow(path[path.length - 2][1].y - path[path.length - 1][1].y, 2));
                            var path0_2 = Math.sqrt(Math.pow(path[path.length - 3][1].x - path[path.length - 1][1].x, 2) + Math.pow(path[path.length - 3][1].y - path[path.length - 1][1].y, 2));
                            var Cospathangle = (
                                Math.pow(path1_0, 2) + Math.pow(path1_2, 2) - Math.pow(path0_2, 2)
                            ) / (
                                2 * path1_0 * path1_2
                            );
                            //计算拐角角度，当角度大于50度时给中点位置打下一个宽度宽于当前线长的顿点。
                            pathangle = Math.round(Math.acos(Cospathangle) * 180 / Math.PI);
                            if (pathangle <= 50) {
                                path[path.length - 2][3] = true;
                            }
                        }
                        path.push([lastPoint, controlPoint, endPoint, pointangle]);

                        for (let i = 0; i < path.length; i++) {
                            Width = lWidth - i / 2;
                            if (path[i][3] === false) {
                                drawPath(path[i][0].x, path[i][0].y, path[i][1].x, path[i][1].y, path[i][2].x, path[i][2].y, Width);
                            } else {
                                drawLine(path[i][0].x, path[i][0].y, path[i][2].x, path[i][2].y, Width)
                            }
                        }
                    } else {
                        var path1_0 = Math.sqrt(Math.pow(path[path.length - 2][1].x - path[path.length - 3][1].x, 2) + Math.pow(path[path.length - 2][1].y - path[path.length - 3][1].y, 2));
                        var path1_2 = Math.sqrt(Math.pow(path[path.length - 2][1].x - path[path.length - 1][1].x, 2) + Math.pow(path[path.length - 2][1].y - path[path.length - 1][1].y, 2));
                        var path0_2 = Math.sqrt(Math.pow(path[path.length - 3][1].x - path[path.length - 1][1].x, 2) + Math.pow(path[path.length - 3][1].y - path[path.length - 1][1].y, 2));
                        var Cospathangle = (
                            Math.pow(path1_0, 2) + Math.pow(path1_2, 2) - Math.pow(path0_2, 2)
                        ) / (
                            2 * path1_0 * path1_2
                        );
                        //计算拐角角度，当角度大于50度时给中点位置打下一个宽度宽于当前线长的顿点。
                        pathangle = Math.round(Math.acos(Cospathangle) * 180 / Math.PI);
                        if (pathangle <= 50) {
                            path[path.length - 2][3] = true;
                        }
                        path.shift();
                        path.push([lastPoint, controlPoint, endPoint, pointangle]);
                        for (let i = 0; i < 10; i++) {
                            width = lWidth - i / 2;
                            if (path[i][3] === false) {
                                drawPath(path[i][0].x, path[i][0].y, path[i][1].x, path[i][1].y, path[i][2].x, path[i][2].y, width);
                            } else {
                                drawLine(path[i][0].x, path[i][0].y, path[i][2].x, path[i][2].y, width)
                            }
                        }
                    }
                    lastPoint = endPoint;
                    controlPoint = newPoint;
                } else {
                    controlPoint = newPoint;
                }
                previousX = x;
                previousY = y;
                previousT = e.timeStamp;
                // 将五个点用作笔锋，用于计算拐角出现以及最后的笔锋方向。
            }
        };

        /**
         * 鼠标抬起时绘制一次笔锋
         * 通过速度以及长度决定笔锋类型
         */
        canvas.onmouseup = function() {
            console.log('mouseup');

            lWidth = 8;
            painting = false
            pathangle = undefined
            path = []
        };

        /**
         * 鼠标移除时绘制一次笔锋
         */
        canvas.mouseleave = function() {
            console.log('mouseup');

            lWidth = 8;
            painting = false
            pathangle = undefined
            path = []
        }
    };

    /**
     * 监听touchstart，以此为基础坚挺touchmove，touchend
     */

    canvas.addEventListener('touchstart', function touchstart(event) {
        console.log('touchstart')
        touch = true
        this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height); //在这里储存绘图表面
        saveData(this.firstDot);
        let x = event.touches[0].clientX;
        let y = event.touches[0].clientY;
        lastPoint = { "x": x, "y": y };
        var lastPoint2 = lastPoint
        ctx.save();
        drawStart(x, y, lWidth);
        var previousX;
        var previousY;
        var previousT;
        var controlPoint;
        var pointangle = false
        canvas.addEventListener('touchmove', function(event) {
            //             console.log('touchmove')
            let x = event.touches[0].clientX;
            let y = event.touches[0].clientY;
            if (lastPoint2 === undefined) {
                lastPoint2 = { "x": x, "y": y };
                drawStart(x, y, lWidth);
                return;
            }
            let newPoint = { "x": x, "y": y };
            //通过获取前点与现点的坐标与时间差，判断触点移动速度
            if (
                previousX !== undefined &&
                previousY !== undefined &&
                previousT !== undefined &&
                controlPoint !== undefined
            ) {
                var deltaX = x - previousX;
                var deltaY = y - previousY;
                var deltaD = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
                var deltaT = event.timeStamp - previousT;
                var speed = deltaD / deltaT * 1000
                if (speed >= 1200) {
                    if (lWidth > 6) { lWidth = lWidth * 0.85 } else { lWidth = 6 }
                } else if (1200 > speed >= 600) {
                    if (lWidth > 6) { lWidth = lWidth * 0.9 } else { lWidth = 6 }
                } else if (speed <= 100) {
                    if (lWidth < 10) { lWidth = lWidth * 1.1 } else { lWidth = 10 }
                } else {
                    if (lWidth > 8.1) { lWidth = lWidth * 0.95 } else if (lWidth < 7.9) { lWidth = lWidth * 1.05 } else { lWidth = 8 }
                }

                // 贝塞尔曲线起点/终点为绘制点两点之间，控制点为绘制点，绘制线连续可导
                var endPoint = { "x": (controlPoint.x + newPoint.x) / 2, "y": (controlPoint.y + newPoint.y) / 2 }
                if (path.length < 11) {
                    if (path.length > 2) {
                        var path1_0 = Math.sqrt(Math.pow(path[path.length - 2][1].x - path[path.length - 3][1].x, 2) + Math.pow(path[path.length - 2][1].y - path[path.length - 3][1].y, 2));
                        var path1_2 = Math.sqrt(Math.pow(path[path.length - 2][1].x - path[path.length - 1][1].x, 2) + Math.pow(path[path.length - 2][1].y - path[path.length - 1][1].y, 2));
                        var path0_2 = Math.sqrt(Math.pow(path[path.length - 3][1].x - path[path.length - 1][1].x, 2) + Math.pow(path[path.length - 3][1].y - path[path.length - 1][1].y, 2));
                        var Cospathangle = (
                            Math.pow(path1_0, 2) + Math.pow(path1_2, 2) - Math.pow(path0_2, 2)
                        ) / (
                            2 * path1_0 * path1_2
                        );
                        //计算拐角角度，当角度大于50度时给中点位置打下一个宽度宽于当前线长的顿点。
                        pathangle = Math.round(Math.acos(Cospathangle) * 180 / Math.PI);
                        if (pathangle <= 50) {
                            path[path.length - 2][3] = true;
                        }
                    }
                    path.push([lastPoint2, controlPoint, endPoint, pointangle]);

                    for (let i = 0; i < path.length; i++) {
                        width = lWidth - i / 2;
                        if (path[i][3] === false) {
                            drawPath(path[i][0].x, path[i][0].y, path[i][1].x, path[i][1].y, path[i][2].x, path[i][2].y, width);
                        } else {
                            drawLine(path[i][0].x, path[i][0].y, path[i][2].x, path[i][2].y, width)
                        }
                    }
                } else {
                    var path1_0 = Math.sqrt(Math.pow(path[path.length - 2][1].x - path[path.length - 3][1].x, 2) + Math.pow(path[path.length - 2][1].y - path[path.length - 3][1].y, 2));
                    var path1_2 = Math.sqrt(Math.pow(path[path.length - 2][1].x - path[path.length - 1][1].x, 2) + Math.pow(path[path.length - 2][1].y - path[path.length - 1][1].y, 2));
                    var path0_2 = Math.sqrt(Math.pow(path[path.length - 3][1].x - path[path.length - 1][1].x, 2) + Math.pow(path[path.length - 3][1].y - path[path.length - 1][1].y, 2));
                    var Cospathangle = (
                        Math.pow(path1_0, 2) + Math.pow(path1_2, 2) - Math.pow(path0_2, 2)
                    ) / (
                        2 * path1_0 * path1_2
                    );
                    //计算拐角角度，当角度大于50度时给中点位置打下一个宽度宽于当前线长的顿点。
                    pathangle = Math.round(Math.acos(Cospathangle) * 180 / Math.PI);
                    if (pathangle <= 50) {
                        path[path.length - 2][3] = true;
                    }
                    path.shift();
                    path.push([lastPoint2, controlPoint, endPoint, pointangle]);
                    for (let i = 0; i < 10; i++) {
                        width = lWidth - i / 2;
                        if (path[i][3] === false) {
                            drawPath(path[i][0].x, path[i][0].y, path[i][1].x, path[i][1].y, path[i][2].x, path[i][2].y, width);
                        } else {
                            drawLine(path[i][0].x, path[i][0].y, path[i][2].x, path[i][2].y, width)
                        }
                    }
                }
                lastPoint2 = endPoint;
                controlPoint = newPoint;
            } else {
                controlPoint = newPoint;
            }
            previousX = x;
            previousY = y;
            previousT = event.timeStamp;
            // 将五个点用作笔锋，用于计算拐角出现以及最后的笔锋方向。
            // if (path.length < 5) {
            //     path.push(lastPoint2);
            // } else {
            //     path.shift();
            //     path.push(lastPoint2);
            // }
            // if (path.length === 5) {
            //     lastpastway = [(path[0].x - path[4].x), (path[0].y - path[4].y)];
            //     pathway = [Math.sqrt(Math.pow(path[0].x - path[4].x, 2) + Math.pow(path[0].y - path[4].y, 2)), (path[0].x - path[4].x), (path[0].y - path[4].y)];
            //     var path2_0 = Math.sqrt(Math.pow(path[2].x - path[0].x, 2) + Math.pow(path[2].y - path[0].y, 2));
            //     var path2_4 = Math.sqrt(Math.pow(path[2].x - path[4].x, 2) + Math.pow(path[2].y - path[4].y, 2));
            //     var path0_4 = Math.sqrt(Math.pow(path[0].x - path[4].x, 2) + Math.pow(path[0].y - path[4].y, 2));
            //     var Cospathangle = (
            //         Math.pow(path2_0, 2) + Math.pow(path2_4, 2) - Math.pow(path0_4, 2)
            //     ) / (
            //         2 * path2_0 * path2_4
            //     );
            //     pathangle = Math.round(Math.acos(Cospathangle) * 180 / Math.PI);
            //     //同上，当出现小于120度的角时，在角上添加一个顿点
            //     if (pathangle <= 120) {
            //         drawStart(path[2].x, path[2].y, 1.15 * lWidth)
            //     }
            // }

        });

        canvas.addEventListener('touchend', function() {
            // touch状态下将touchstart 移除，只添加一次，lastpoint需靠touchmove的第一个点重置。
            if (lastPoint2 === undefined) { return }
            // 根据速度与长度决定尾部笔锋。
            // if (lastpastway === undefined || (pathway[0] < 8 && pathway[1] <= 5)) {
            //     drawStart(lastPoint2.x, lastPoint2.y, lWidth)
            // } else {
            //     drawEnd(lastPoint2.x, lastPoint2.y, lWidth, lastpastway)
            // }
            path = []
            console.log("touchend")
            controlPoint = undefined;
            painting = false;
            touch = false;
            lWidth = 8;
            pathangle = undefined
            pathway = undefined
            lastpastway = undefined
            lastPoint2 = undefined
            canvas.removeEventListener('touchstart', touchstart, false);
        });
    }, false);
}


/**
 * 
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} lWidth 
 * 触碰/点击 绘制的第一个点/或者最后一个一点（当运笔速度较慢时）
 */
function drawStart(x1, y1, lWidth) {

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1 + 2 * lWidth / 3, y1);
    ctx.quadraticCurveTo(x1 + 2 * lWidth / 3, y1 + 4 * lWidth / 3, x1 - 2 * lWidth / 3, y1);
    ctx.moveTo(x1 + 2 * lWidth / 3, y1);
    ctx.quadraticCurveTo(x1 - 2 * lWidth / 3, y1 - 4 * lWidth / 3, x1 - 2 * lWidth / 3, y1);

    ctx.closePath();
    ctx.fill();

}

/**
 * 
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} lWidth 
 * @param {*} pathway 最后五个点的轨迹方向
 * 绘制最后一个点处的尖型收尾（当运笔速度较快时）
 */
function drawEnd(x1, y1, lWidth, pathway) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1 - (pathway[1] / (Math.abs(pathway[0]) + Math.abs(pathway[1])) * lWidth / 2), y1 + (pathway[0] / (Math.abs(pathway[0]) + Math.abs(pathway[1])) * lWidth / 2))
    ctx.lineTo(x1 + (pathway[1] / (Math.abs(pathway[0]) + Math.abs(pathway[1])) * lWidth / 2), y1 - (pathway[0] / (Math.abs(pathway[0]) + Math.abs(pathway[1])) * lWidth / 2))
    ctx.lineTo(x1 + (pathway[1] / (Math.abs(pathway[0]) + Math.abs(pathway[1])) * lWidth / 2) - 2 * (pathway[0] / (Math.abs(pathway[0]) + Math.abs(pathway[1]))) * lWidth / 3, y1 - (pathway[0] / (Math.abs(pathway[0]) + Math.abs(pathway[1])) * lWidth / 2) - 2 * (pathway[1] / (Math.abs(pathway[0]) + Math.abs(pathway[1]))) * lWidth / 3)
    ctx.lineTo(x1 - 2 * (pathway[0] / (Math.abs(pathway[0]) + Math.abs(pathway[1]))) * lWidth, y1 - 2 * (pathway[1] / (Math.abs(pathway[0]) + Math.abs(pathway[1]))) * lWidth)
    ctx.lineTo(x1 - (pathway[1] / (Math.abs(pathway[0]) + Math.abs(pathway[1])) * lWidth / 2) - 2 * (pathway[0] / (Math.abs(pathway[0]) + Math.abs(pathway[1]))) * lWidth / 3, y1 + (pathway[0] / (Math.abs(pathway[0]) + Math.abs(pathway[1])) * lWidth / 2) - 2 * (pathway[1] / (Math.abs(pathway[0]) + Math.abs(pathway[1]))) * lWidth / 3)
    ctx.closePath();
    ctx.fill();

}


function drawLine(x1, y1, x2, y2, lwidth) {
    ctx.lWidth = lwidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round"
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

/**
 * 
 * @param {*} x1 起始点x坐标
 * @param {*} y1 起始点y坐标
 * @param {*} x2 控制点x坐标
 * @param {*} y2 控制点y坐标
 * @param {*} x3 终点x坐标
 * @param {*} y3 终点v坐标
 * @param {*} l_width 线长
 */
function drawPath(x1, y1, x2, y2, x3, y3, l_width) {
    ctx.lineWidth = l_width;
    ctx.lineJoin = "round";
    ctx.lineCap = "round"
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.stroke();
}

/**
 * 使用画笔
 */
brush.onclick = function() {
    this.classList.add("active");
    debugger
};

/**
 * 清空画板
 */
reSetCanvas.onclick = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBg('white');
};

let historyDeta = [];

/**
 * 
 * @param {*} data 
 * 存储绘制笔迹
 */
function saveData(data) {
    (historyDeta.length === 10) && (historyDeta.shift()); // 上限为储存10步，太多了怕挂掉
    historyDeta.push(data);
}

/**
 * 返回上一步
 */
undo.onclick = function() {
    if (historyDeta.length < 1) return false;
    ctx.putImageData(historyDeta[historyDeta.length - 1], 0, 0);
    historyDeta.pop()
};
