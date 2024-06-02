const ctx=canvas.getContext('2d');

const canvasDiv=document.getElementsByClassName('canvas-div')[0];

const colorPicker=document.getElementById('color-picker');
const colorList=document.getElementById('color-list');
const colorPickerLabel=document.getElementById('color-picker-label');
const fileElement=document.getElementById('file--element');

let selectedImage=null;

const backgroundBitmap=(function()
{
  let size=20;
  const canvas=new OffscreenCanvas(size,size);
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fff';
  ctx.fillRect(0,0,size,size);
  ctx.fillStyle='#ccc';
  ctx.fillRect(0,0,size/2,size/2);
  ctx.fillRect(size/2,size/2,size/2,size/2);
  return canvas;
})();

let camera=
{
    x:0,y:0,zoom:1
};

function drawBackground(ctx)
{
    for(let x=0;x<canvas.width;x+=backgroundBitmap.width)
        for(let y=0;y<canvas.height;y+=backgroundBitmap.height)
            ctx.drawImage(backgroundBitmap,x,y);
}

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
    drawBackground(ctx);

    ctx.translate(-camera.x,-camera.y);
    ctx.scale(camera.zoom,camera.zoom);

    ctx.imageSmoothingEnabled=false;
    if(selectedImage!==null)
        ctx.drawImage(selectedImage,0,0);
    ctx.imageSmoothingEnabled=true;

    ctx.resetTransform();
}

function isInCanvas(x,y)
{
    let b=canvas.getBoundingClientRect();
    return b.left<=x&&x<=b.right&&b.top<=y&&y<=b.bottom;
}

let pointers={},lastX=0,lastY=0,zoomPointersIds=null,lastZoomPos=null;
window.onpointerdown=function(e)
{
    if(e.isPrimary)
    {
        lastX=e.clientX;
        lastY=e.clientY;
    }
    let x=e.clientX,y=e.clientY;
    if(!isInCanvas(x,y))return;

    let ids=Object.keys(pointers);if(ids.length>=2)zoomPointersIds=ids.slice(0,2);else lastZoomPos=zoomPointersIds=null;
    
    pointers[e.pointerId]=e;
};
window.onpointermove=function(e)
{
    if(e.isPrimary)
    {
        lastX=e.clientX;
        lastY=e.clientY;
    }
    let pe=pointers[e.pointerId];
    pointers[e.pointerId]=e;
    if(e.pressure<=0)return;

    let ids=Object.keys(pointers);if(ids.length>=2)zoomPointersIds=ids.slice(0,2);else lastZoomPos=zoomPointersIds=null;

    if(zoomPointersIds!==null)
    {
        let p1=pointers[zoomPointersIds[0]],p2=pointers[zoomPointersIds[1]];
        let p1x=p1.clientX,p1y=p1.clientY,p2x=p2.clientX,p2y=p2.clientY;

        if(lastZoomPos!==null)
        {
            let [[pp1x,pp1y],[pp2x,pp2y]]=lastZoomPos;

            let cx=(p1x+p2x)/2,cy=(p1y+p2y)/2;
            let pcx=(pp1x+pp2x)/2,pcy=(pp1y+pp2y)/2;

            let zp=((p1x-p2x)**2+(p1y-p2y)**2)**.5/((pp1x-pp2x)**2+(pp1y-pp2y)**2)**.5

            let newZoom=camera.zoom*zp;

            let cmx=(cx+camera.x)/camera.zoom;
            let cmy=(cy+camera.y)/camera.zoom;

            let ncx=(cmx*newZoom)-cx;
            let ncy=(cmy*newZoom)-cy;

            camera.x=ncx;
            camera.y=ncy;

            camera.zoom=newZoom;


            camera.x-=cx-pcx;
            camera.y-=cy-pcy;
        }
        lastZoomPos=[[p1x,p1y],[p2x,p2y]];
    }
    else
    {
        camera.x-=e.clientX-pe.clientX;
        camera.y-=e.clientY-pe.clientY;
    }
    
    draw();
};
window.onpointerup=function(e)
{
    if(e.isPrimary)
    {
        lastX=e.clientX;
        lastY=e.clientY;
    }
    delete pointers[e.pointerId];

    let ids=Object.keys(pointers);if(ids.length>=2)zoomPointersIds=ids.slice(0,2);else lastZoomPos=zoomPointersIds=null;
};
window.onwheel=function(e)
{
    let pe=null;
    for(let id in pointers)
    {
        if(pointers[id].isPrimary)
        {
            pe=pointers[id];
            break;
        }
    }
    if(pe===null)return;

    let dir=-Math.sign(e.deltaY);
    let newZoom=camera.zoom*1.5**dir;

    let cx=(e.clientX+camera.x)/camera.zoom;
    let cy=(e.clientY+camera.y)/camera.zoom;

    let ncx=(cx*newZoom)-e.clientX;
    let ncy=(cy*newZoom)-e.clientY;

    camera.x=ncx;
    camera.y=ncy;

    camera.zoom=newZoom;

    draw();
}


function drawAnimationFrame()
{
    realDraw();
    drawWait=false;
}

function colorListUpdate(list)
{
    while(colorList.firstChild)colorList.removeChild(colorList.lastChild);

    for(let i=0;i<list.length;i++)
    {
        let c=list[i];
        let h=arr2hex(c[0]);

        let div=document.createElement('div');
        div.className='color-info';
        div.style.border='3px solid #'+hexDarker(h,0.8);
        div.style.backgroundColor='#'+h;

        let hexP=document.createElement('span');
        hexP.className='color-info-hex';
        hexP.innerText='#'+h;
        hexP.style.color='#'+hexVi(h);
        div.appendChild(hexP);

        let orgColorD=document.createElement('div');
        orgColorD.className='color-info-orignal-color';
        orgColorD.style.backgroundColor=colorPicker.value;
        div.appendChild(orgColorD);
        
        let hsvP=document.createElement('span');
        hsvP.className='color-info-hsv';
        hsvP.innerText=c[1][0].join('\n');
        hsvP.style.color='#'+hexVi(h);
        div.appendChild(hsvP);

        colorList.appendChild(div);
    }
}

colorPicker.oninput=function()
{
    let hex=colorPicker.value;
    colorPickerLabel.innerText=' '+hex;
    let arr=hex2arr(hex.slice(1));
    colorListUpdate(findNearN(arr,20));
}

window.onresize=onWindowResize;

fileElement.onchange=()=>
{
    if(fileElement.files.length==0)return;

    selectedImage=new Image();
    var r=new FileReader();
    r.onload=()=>
    {
        selectedImage.onload=imageOnLoad;
        selectedImage.src=r.result;
    };
    r.readAsDataURL(fileElement.files[0]);
};

function imageOnLoad()
{
    document.getElementsByClassName('first-screen')[0].style.display='none';

    camera.zoom=Math.min(canvas.width/selectedImage.width,canvas.height/selectedImage.height)*0.8;
    camera.x=(selectedImage.width*camera.zoom-canvas.width)/2;
    camera.y=(selectedImage.height*camera.zoom-canvas.height)/2;

    draw();
}

window.onload=function()
{
    onWindowResize();
};