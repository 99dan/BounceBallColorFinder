function onWindowResize()
{
    let b=canvasDiv.getBoundingClientRect();
    setCanvasSize(b.width,b.height);
    draw();
}

function setCanvasSize(x,y)
{
  canvas.width=x;
  canvas.height=y;
}

let drawWait=false;
function draw()
{
    if(drawWait)return;
    drawWait=true;
    window.requestAnimationFrame(drawAnimationFrame);
}

function realDraw()
{
    
}

function drawAnimationFrame()
{
    realDraw();
    drawWait=false;
}

window.onresize=onWindowResize;