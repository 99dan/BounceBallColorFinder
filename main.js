const canvasDiv=document.getElementsByClassName('canvas-div')[0];

const colorPicker=document.getElementById('color-picker');
const colorList=document.getElementById('color-list');
const colorPickerLabel=document.getElementById('color-picker-label');

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

function arr2hex(arr)
{
    return arr.map(x=>Math.min(Math.max(Math.round(x),0),255).toString(16).padStart(2,'0')).join('')
}

function hex2arr(hex)
{
    return hex.split(/(..)/).filter((_,i)=>i%2).map(x=>parseInt(x,16));
}

function hexDarker(hex,n=0.9)
{
    return arr2hex(hex2arr(hex).map(x=>x*n));
}

function arrDarker(arr,n=0.9)
{
    return arr.map(x=>x*n);
}

function hexLighter(hex,n=0.9)
{
    return arr2hex(hex2arr(hex).map(x=>255-(255-x)*n));
}

function arrLighter(arr,n=0.9)
{
    return arr.map(x=>255-(255-x)*n);
}

function hexAdder(hex,n)
{
    return arr2hex(hex2arr(hex).map(x=>x+n));
}

function arrAdder(arr,n)
{
    return arr.map(x=>x+n);
}

function calcY(arr)
{
    let a=arr.map(x=>(x=Math.min(Math.max(x/255,0),1),x<=0.03928?x/12.92:((x+0.055)/1.055)**2.4));
    let r=a[0],g=a[1],b=a[2];
    return 0.299*r+0.587*g+0.114*b;
}

function calcL(a1,a2)
{
    a1=calcY(a1);
    a2=calcY(a2);
    let n=Math.min(a1,a2),m=Math.max(a1,a2);
    return (m+0.05)/(n+0.05);
}

function hexDis(h1,h2)
{
    let h=hex2arr(h1),k=hex2arr(h2);
    return h.reduce((a,c,i)=>a+(c-k[i])**2,0);
}

function hexVi(hex,n=128,n2=0.6)
{
    let arr=hex2arr(hex);
    let cl=[arrAdder(arr,n),arrAdder(arr,-n),arrDarker(arr,n2),arrLighter(arr,n2)];
    cl.sort((a,b)=>calcL(b,arr)-calcL(a,arr));
    return arr2hex(cl[0]);
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