'use strict';
var gElCanvas;
var gCtx;

var gCurrImgUrl;
var gCurrUpdatingIdx;
var gCurrHeight;

var gIsUpdating = false;
var gDontGrab = false;

var gCurrFont;

var gStartPos;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend']

function onInit() {
    loadImages();
    renderImageGallery(gImgs);
    renderCanvas();
    resizeCanvas();
    addListeners();
    loadMemes()
    document.querySelector('.color-input').value = '#ffffff'
}
function renderCanvas() {
    gElCanvas = document.getElementById('my-canvas');
    gCtx = gElCanvas.getContext('2d');
}
function resizeCanvas() {
    if (document.querySelector('.editor-view').classList.contains('hide')) return;
    var elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
    setCanvas();
}
function setCanvas() {
    drawImg(gCurrImgUrl);
    setTimeout(drawLines, .3)
    setTimeout(showFocus, .3)
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
function onSetMemeImage(imgId) {
    var imgUrl = setMemeImage(imgId);
    gCurrImgUrl = imgUrl;
    gMeme.lines = [];
    gMeme.selectedLineIdx = 0;
    document.querySelector('.gallery-view').classList.add('hide');
    document.querySelector('.editor-view').classList.remove('hide');
    resizeCanvas();
    drawImg(imgUrl)
}


function onAddText() {
    if (gIsUpdating === true) {
        if (!document.querySelector('.add-text-input').value) return;
        gMeme.lines[gCurrUpdatingIdx].txt = document.querySelector('.add-text-input').value;
        drawText(gMeme.lines[gCurrUpdatingIdx].txt);
        gIsUpdating = false;
        document.querySelector('.add-text-btn').innerHTML = `<img src="ICONS/add.png"
    alt="">`;
        drawImg(gCurrImgUrl);
        setTimeout(drawLines, 1)
    } else {
        var txt = document.querySelector('.add-text-input').value;
        if (!txt) return;
        var font = document.querySelector('.font-selector').value;
        var color = document.querySelector('.color-input').value;
        if (!color) color = 'white'
        createLine(txt, font, 'center', color);
        drawText();
        gCurrUpdatingIdx = gMeme.selectedLineIdx;
    }
    document.querySelector('.add-text-input').value = '';
    document.querySelector('.color-input').value = '#ffffff'
    gCurrHeight = null;
    dropText();
}


function drawText() {

    var currText = gMeme.lines[gMeme.selectedLineIdx];
    var txt = currText.txt;
    if (currText.posX && currText.posY) {
        gCtx.lineWidth = 2
        gCtx.font = `${currText.size}px ${currText.font}`
        gCtx.strokeStyle = 'black'
        gCtx.fillStyle = currText.color
        gCtx.textAlign = currText.align;
        currText.width = gCtx.measureText(txt).width;
        if (!currText.isGrab) {
            currText.posY = currText.height;
        } else {
            currText.height = currText.posY;
        }
        gCtx.fillText(txt, currText.posX + currText.width / 2, currText.posY)
        gCtx.strokeText(txt, currText.posX + currText.width / 2, currText.posY)
    } else {
        gCtx.lineWidth = 2
        gCtx.font = `${currText.size}px ${currText.font}`
        gCtx.strokeStyle = 'black'
        gCtx.fillStyle = currText.color
        var y = currText.height;
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
        gCtx.textAlign = currText.align;
        gCtx.fillText(txt, gElCanvas.width / 2, y)
        gCtx.strokeText(txt, gElCanvas.width / 2, y)
        currText.posY = y;
        currText.width = gCtx.measureText(txt).width;
        currText.posX = gElCanvas.width / 2 - currText.width / 2;
        currText.height = y;
    }
}


function biggerFont(elBtn) {
    var font = getComputedStyle(elBtn, null).fontSize;
    font = parseInt(font);
    console.log('font', font);
    elBtn.style.fontSize = font + 2 + 'px';
}
function onFontChange(diff) {
    if (!gIsUpdating) return;
    fontChange(diff);
    setCanvas();
    gMeme.selectedLineIdx = gCurrUpdatingIdx;
}
function onTextMove(diff) {
    if (!gIsUpdating) return;
    textMove(diff);
    setCanvas()
    gMeme.selectedLineIdx = gCurrUpdatingIdx;
}
function onDeleteText() {
    if (!gIsUpdating) return;
    deleteText();
    drawImg(gCurrImgUrl);
    setTimeout(drawLines, 0.3)
    gIsUpdating = false;
    document.querySelector('.add-text-btn').innerHTML = `<img src="ICONS/add.png"
    alt="">`;
    document.querySelector('.add-text-input').value = '';
}
function onSwitchText() {
    if (gMeme.lines.length === 0) return;
    gCurrHeight = null;
    gCurrUpdatingIdx++
    gMeme.selectedLineIdx = gCurrUpdatingIdx;
    if (gMeme.selectedLineIdx > (gMeme.lines.length - 1)) {
        gCurrUpdatingIdx = 0;
        gMeme.selectedLineIdx = 0;
    };
    gIsUpdating = true;
    document.querySelector('.add-text-btn').innerHTML = `<img src="ICONS/check.png"
    alt="">`;
    document.querySelector('.add-text-input').value = gMeme.lines[gCurrUpdatingIdx].txt;
    document.querySelector('.add-text-input').focus();
    setCanvas()
}
function onAlignText(align) {
    if (!gIsUpdating) return;
    alignText(align);
    setCanvas();
}
function onColorChange(color) {
    if (!gIsUpdating) return;
    colorChange(color);
    setCanvas();
}
function onFontFamilyChange(value) {
    gCurrFont = value
    if (gIsUpdating === false) return;
    fontFamilyChange();
    setCanvas();
}
function showFocus() {
    var currText = gMeme.lines[gCurrUpdatingIdx];
    if (!currText) return;
    gCtx.beginPath()
    var startX = (currText.posX - 5);
    var startY = (currText.posY - currText.size - 5);
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
function updateText() {
    if (!gIsUpdating) return;
    gMeme.lines[gCurrUpdatingIdx].txt = document.querySelector('.add-text-input').value
    setCanvas();
}


function onSetLang() {
    setLang();
    if (gCurrLang === 'he') document.body.classList.add('rtl')
    else document.body.classList.remove('rtl')
    doTrans();
}
function doTrans() {
    var els = document.querySelectorAll('[data-trans]')
    els.forEach(function (el) {
        var txt = getTrans(el.dataset.trans)
        if (el.nodeName === 'INPUT') el.placeholder = txt;
        else el.innerText = txt
    })
}
function onSetFilter(filterBy) {
    setFilter(filterBy)
    var imgsForDisplay = getImgsForDisplay();
    renderImageGallery(imgsForDisplay);
}



function onSetLang() {
    setLang();
    document.querySelector('.bg-screen').classList.remove('show')
    document.querySelector('.nav-bar').classList.remove('show')
    if (gCurrLang === 'he') document.body.classList.add('rtl')
    else document.body.classList.remove('rtl')
    doTrans();
}
function doTrans() {
    var els = document.querySelectorAll('[data-trans]')
    els.forEach(function (el) {
        var txt = getTrans(el.dataset.trans)
        if (el.nodeName === 'INPUT') el.placeholder = txt;
        else el.innerText = txt
    })
}
function onSetFilter(filterBy) {
    setFilter(filterBy)
    var imgsForDisplay = getImgsForDisplay();
    renderImageGallery(imgsForDisplay);
}


function toggleMenu() {
    document.querySelector('.nav-bar').classList.toggle('show');
    document.querySelector('.bg-screen').classList.toggle('show');
}

function showGallery() {
    document.querySelector('.gallery-view').classList.remove('hide');
    document.querySelector('.editor-view').classList.add('hide')
    document.querySelector('.memes-view').classList.add('hide')
    document.querySelector('.share-container').style.visibility = 'hidden';
    document.querySelector('.bg-screen').classList.remove('show')
    document.querySelector('.nav-bar').classList.remove('show')
    gIsUpdating = false;
    renderImageGallery(gImgs);
}
function renderImageGallery(imgs) {
    var strHTML = imgs.map((img) => {
        return `<div class="img-container">
        <img src="${img.url}" alt="" onclick="onSetMemeImage(${img.id})">
        </div>`
    }).join('');

    document.querySelector('.img-gallery').innerHTML = strHTML;
}


var elInput = document.querySelector('.add-text-input');
function addListeners() {
    addMouseListeners()
    addTouchListeners()
    window.addEventListener('resize', () => {
        resizeCanvas()
        renderCanvas()
    })
    elInput.addEventListener('keyup', (ev) => {
        if (ev.keyCode === 13) {
            onAddText();
            elInput.blur();
            dropText();
        }
        if (ev.keyCode === 46) {
            if (gIsUpdating) {
                onDeleteText();
            }
        }
    })
    window.addEventListener('keyup', (ev) => {
        if (ev.keyCode === 9) {
            ev.preventDefault();
            onSwitchText();
        }
        if (ev.keyCode === 38) {
            onTextMove(-1)
        }
        if (ev.keyCode === 40) {
            onTextMove(1)
        }
    })
}
function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove);
    gElCanvas.addEventListener('mousedown', chooseText);
    gElCanvas.addEventListener('mouseup', dropText);
}
function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove);
    gElCanvas.addEventListener('touchstart', chooseText);
    gElCanvas.addEventListener('touchend', dropText);
}

//  DRAG & DROP //

function chooseText(ev) {
    ev.stopPropagation()
    if (gDontGrab) return;
    const pos = getEvPos(ev);
    var x = pos.x;
    var y = pos.y;
    var lineIdx = gMeme.lines.findIndex((line) => {
        return (x > line.posX && x < line.posX + line.width && y < line.posY && y > line.posY - line.size)
    })

    if (lineIdx >= 0) gCurrUpdatingIdx = lineIdx;
    else {                  // deleting the square if clicking on picture
        drawImg(gCurrImgUrl);
        setTimeout(drawLines, 1)
        return;
    }
    setTextGrab(true);

    gStartPos = pos;
    gCurrHeight = null
    gIsUpdating = true;
    document.querySelector('.add-text-btn').innerHTML = `<img src="ICONS/check.png" alt="">`
    document.querySelector('.add-text-input').value = gMeme.lines[gCurrUpdatingIdx].txt;
    document.querySelector('.add-text-input').focus();
    setCanvas();
}
function onMove(ev) {
    // console.log(ev.type);
    ev.stopPropagation()
    const currLine = gMeme.lines[gCurrUpdatingIdx];
    if (!currLine) return;
    if (currLine.isGrab) {
        const pos = getEvPos(ev)
        const dx = pos.x - gStartPos.x
        const dy = pos.y - gStartPos.y
        moveText(dx, dy)
        gStartPos = pos
        setCanvas();
    }
}
function dropText() {
    if(!gMeme.lines.length) return;
    if (!gMeme.lines[gCurrUpdatingIdx].isGrab) {
        onAddText();
        return;
    }
    setTextGrab(false);
    gDontGrab = true;
    setTimeout(() => {
        gDontGrab = false;
    }, 3)
    document.querySelector('.add-text-input').focus();
}



function getEvPos(ev) {
    
    var pos = {
        x: ev.offsetX,
        y: ev.offsetY
    }
    if (gTouchEvs.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop
        }
    }
    return pos
}


//  SAVE MEMES //

function showMemes() {
    document.querySelector('.editor-view').classList.add('hide');
    document.querySelector('.gallery-view').classList.add('hide');
    document.querySelector('.memes-view').classList.remove('hide');
    document.querySelector('.bg-screen').classList.remove('show')
    document.querySelector('.nav-bar').classList.remove('show')
    renderMemes();
}

function onSaveMeme() {
    var imgContent = gElCanvas.toDataURL('image/jpeg')
    gSavedMemes.push(imgContent);
    saveMemes();
    document.querySelector('.save-btn').style.backgroundColor = '#198754';
    document.querySelector('.memes-link').style.backgroundColor = '#198754';
    setTimeout(() => {
        document.querySelector('.save-btn').style.backgroundColor = 'white';
        document.querySelector('.memes-link').style.backgroundColor = '';
    }, 500)
}

function renderMemes() {
    var strHTML = gSavedMemes.map((meme) => {
        return `<div class="meme"><img src="${meme}" alt=""></div>`
    }).join('');
    if (gSavedMemes.length === 0) {
        switch (gCurrLang) {
            case 'en':
                strHTML = 'No Saved Memes Yet';
                break;
            case 'he':
                strHTML = 'אין ממים שמורים'
        }
    }
    document.querySelector('.memes-container').innerHTML = strHTML;
}

// DOWNLOAD MEME //

function onDownloadImg(elLink) {
    var imgContent = gElCanvas.toDataURL('image/png')
    elLink.href = imgContent
    setTimeout(setCanvas, 100)
}

// LOAD IMAGE FROM COMPUTER //

function onImgInput(ev) {
    loadImageFromInput(ev, renderImg)
}

function loadImageFromInput(ev, onImageReady) {
    document.querySelector('.share-container').innerHTML = ''
    var reader = new FileReader()

    reader.onload = function (event) {
        console.log('event:', event)
        var img = new Image()
        img.onload = onImageReady.bind(null, img)
        img.src = event.target.result
    }
    reader.readAsDataURL(ev.target.files[0])
}


function renderImg(img) {
    createNewImg(img);
    gCurrImgUrl = gImgs[gImgs.length - 1].url;
    document.querySelector('.gallery-view').classList.add('hide');
    document.querySelector('.editor-view').classList.remove('hide');
    resizeCanvas();
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
}