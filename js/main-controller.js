'use strict';
var gElCanvas;
var gCtx;
var gCurrImg;
var gCurrUpdatingIdx;
var gCurrHeight;
var gIsUpdating;
var gCurrFont;

function onInit() {
    renderImageGallery(gImgs);
    renderCanvas();
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas()
        setCanvas()
    })
}


function renderCanvas() {
    gElCanvas = document.getElementById('my-canvas');
    gCtx = gElCanvas.getContext('2d');
}
function resizeCanvas() {
    var elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
}



function onAddText() {
    if (gIsUpdating === true) {
        gMeme.lines[gCurrUpdatingIdx].txt = document.querySelector('.add-text-input').value;
        drawText(gMeme.lines[gCurrUpdatingIdx].txt);
        gIsUpdating = false;
        drawImg(gCurrImg);
        setTimeout(drawLines, 1)
    } else {
        var txt = document.querySelector('.add-text-input').value;
        if (!txt) return;
        var color = document.querySelector('.text-color').value;
        if (!color) color = 'black';
        var font = document.querySelector('.font-selector').value;
        createLine(txt, font, 'center', color);
        drawText();
        gCurrUpdatingIdx = gMeme.selectedLineIdx;
    }
    document.querySelector('.add-text-input').value = '';
    gCurrHeight = null;
}
function drawText() {
    var txt = gMeme.lines[gMeme.selectedLineIdx].txt;
    gCtx.lineWidth = 2
    gCtx.font = `${gMeme.lines[gMeme.selectedLineIdx].size}px ${gMeme.lines[gMeme.selectedLineIdx].font}`
    gCtx.strokeStyle = 'black'
    gCtx.fillStyle = 'white'
    var y = gMeme.lines[gMeme.selectedLineIdx].height;
    if (!y) {
        switch (gMeme.selectedLineIdx) {
            case 0:
                var y = gElCanvas.height - (gElCanvas.height - 50);
                break;
            case 1:
                var y = gElCanvas.height - 50;
                break;
            default:
                var y = gElCanvas.height / 2;
        }
    }
    gCtx.textAlign = gMeme.lines[gMeme.selectedLineIdx].align;;
    gCtx.fillText(txt, gElCanvas.width / 2, y)
    gCtx.strokeText(txt, gElCanvas.width / 2, y)
    gMeme.lines[gMeme.selectedLineIdx].posY = y;
    gMeme.lines[gMeme.selectedLineIdx].posX = gElCanvas.width / 2 - gMeme.lines[gMeme.selectedLineIdx].width / 2;
    gMeme.lines[gMeme.selectedLineIdx].width = gCtx.measureText(txt).width;
    gMeme.lines[gMeme.selectedLineIdx].height = y;
}

function onSetFilter(filterBy){
    setFilter(filterBy)
    var imgsForDisplay = getImgsForDisplay();
    renderImageGallery(imgsForDisplay);
}

function biggerFont(elBtn){
    var font = getComputedStyle(elBtn,null).fontSize;
    font = parseInt(font);
    console.log('font',font);
    elBtn.style.fontSize = font+2+'px';
}



function onFontChange(diff) {
    fontChange(diff);
    setCanvas();
    gMeme.selectedLineIdx = gCurrUpdatingIdx;
}

function onTextMove(diff) {
    textMove(diff);
    setCanvas()
    gMeme.selectedLineIdx = gCurrUpdatingIdx;
}

function onDeleteText() {
    deleteText();
    setCanvas()
    // gIsUpdating = false;
    document.querySelector('.add-text-btn').innerText = 'Add';
}

function onSwitchText() {
    gCurrHeight = null;
    gCurrUpdatingIdx++
    gMeme.selectedLineIdx = gCurrUpdatingIdx;
    if (gMeme.selectedLineIdx > (gMeme.lines.length - 1)) {
        gCurrUpdatingIdx = 0;
        gMeme.selectedLineIdx = 0;
    };
    gIsUpdating = true;
    document.querySelector('.add-text-input').value = gMeme.lines[gCurrUpdatingIdx].txt;
    setCanvas()
}

function onAlignText(align) {
    alignText(align);
    setCanvas();
}

function onFontFamilyChange(value) {
    gCurrFont = value
    fontFamilyChange();
    setCanvas();
}

function showFocus() {
    var currText = gMeme.lines[gCurrUpdatingIdx];
    gCtx.beginPath()
    var startX = (gElCanvas.width / 2 - currText.width / 2 - 5);
    var startY = (currText.height - currText.size - 5);
    var width = (currText.width + 10);
    var height = (currText.size + 15);
    switch (currText.align) {
        case 'left':
            startX += currText.width / 2;
            break;
        case 'right':
            startX -= currText.width / 2;
            break;
    }
    gCtx.rect(startX, startY, width, height)
    gCtx.strokeStyle = 'black'
    gCtx.stroke()
}



function setCanvas() {
    drawImg(gCurrImg);
    setTimeout(drawLines, 2)
    setTimeout(showFocus, 2)
}



function drawLines() {
    gMeme.selectedLineIdx = 0
    gMeme.lines.forEach(() => {
        drawText();
        if (gMeme.selectedLineIdx < gMeme.lines.length - 1) {
            gMeme.selectedLineIdx++
        }
    })
}
function drawImg(imgUrl) {
    var img = new Image()
    img.src = imgUrl;
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
    }
}

function onSetLang() {
    setLang();
    console.log('HI');
    if (gCurrLang === 'he') document.body.classList.add('rtl')
    else document.body.classList.remove('rtl')
    // render();
    doTrans();
}

function showGallery() {
    document.querySelector('.gallery-view').classList.remove('hide');
    document.querySelector('.editor-view').classList.add('hide')
    document.querySelector('.share-container').style.visibility = 'hidden';
}
function renderImageGallery(imgs) {
    var strHTML = imgs.map((img) => {
        return `<div class="img-container">
        <img src="${img.url}" alt="" onclick="onSetMemeImage(${img.id})">
        </div>`
    }).join('');
    
    document.querySelector('.img-gallery').innerHTML = strHTML;
}

function onSetMemeImage(imgId) {
    var imgUrl = setMemeImage(imgId);
    gCurrImg = imgUrl;
    gMeme.lines = [];
    gMeme.selectedLineIdx = 0;
    document.querySelector('.gallery-view').classList.add('hide');
    document.querySelector('.editor-view').classList.remove('hide');
    resizeCanvas();
    drawImg(imgUrl)
}






















// function onSaveMeme(){
//     var image = gElCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
//     saveMeme(image);
// }

// function showMemes(){
//     document.querySelector('.gallery-view').classList.add('hide');
//     document.querySelector('.editor-view').classList.add('hide');
//     renderSavedMemes();
//     document.querySelector('.saved-memes-container').classList.remove('hide');
// }

// function renderSavedMemes(){
//     strHTML = `<div class="saved-meme"><img src="" alt=""></div>`
// }



