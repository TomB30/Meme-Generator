'use strict';
var gElCanvas;
var gCtx;

var gCurrImgUrl;
var gCurrHeight;

var gIsUpdating = false;
var gDontGrab = false;

var gCurrFont;

var gStartPos;
const gTouchEvs = ['touchstart', 'touchmove', 'touchend']

function onInit() {
    loadImgs();
    renderImgGallery(gImgs);
    createCanvas();
    resizeCanvas();
    addListeners();
    loadMemes();
    document.querySelector('.color-input').value = '#ffffff';
}
function createCanvas() {
    gElCanvas = document.getElementById('my-canvas');
    gCtx = gElCanvas.getContext('2d');
}
function resizeCanvas() {
    if (document.querySelector('.editor-view').classList.contains('hide')) return;
    var elContainer = document.querySelector('.canvas-container')
    gElCanvas.width = elContainer.offsetWidth
    gElCanvas.height = elContainer.offsetHeight
    drawMeme(gCurrImgUrl, true);
}


function drawLines() {
    gMeme.lines.forEach((line) => {
        drawText(line);
    })
}
function drawMeme(imgUrl, isFocus) {
    var img = new Image()
    img.src = imgUrl;
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
        drawLines();
        if (isFocus) showFocus();
    }
}
function onSetMemeImg(imgId) {
    var imgUrl = setMemeImg(imgId);
    gCurrImgUrl = imgUrl;
    gMeme.lines = [];
    gMeme.selectedLineIdx = 0;
    document.querySelector('.gallery-view').classList.add('hide');
    document.querySelector('.editor-view').classList.remove('hide');
    document.querySelector('body').classList.remove('overflow-hidden');
    resizeCanvas();
    drawMeme(gCurrImgUrl, false)
}

function onAddText() {
    var elTextInput = document.querySelector('.add-text-input');
    if (gIsUpdating) {
        if (!elTextInput.value) return;
        gMeme.lines[gMeme.selectedLineIdx].txt = elTextInput.value;
        drawText(gMeme.lines[gMeme.selectedLineIdx]);
        gIsUpdating = false;
        document.querySelector('.add-text-btn').innerHTML = `<img src="ICONS/add.png" alt="">`;
        drawMeme(gCurrImgUrl, false);
    } else {
        var txt = elTextInput.value;
        if (!txt) return;
        var font = document.querySelector('.font-selector').value;
        var color = document.querySelector('.color-input').value;
        if (!color) color = 'white'
        createLine(txt, font, 'center', color);
        drawText(gMeme.lines[gMeme.selectedLineIdx]);
    }
    elTextInput.value = '';
    document.querySelector('.color-input').value = '#ffffff'
    gCurrHeight = null;
    dropText();
}
function drawText(line) {
    var txt = line.txt;
    gCtx.lineWidth = 2
    gCtx.font = `${line.size}px ${line.font}`
    gCtx.strokeStyle = 'black'
    gCtx.fillStyle = line.color
    gCtx.textAlign = line.align;
    line.width = gCtx.measureText(txt).width;

    if (line.posX && line.posY) {
        if (!line.isGrab) {
            line.posY = line.height;
        } else {
            line.height = line.posY;
        }
        gCtx.fillText(txt, line.posX + line.width / 2, line.posY)
        gCtx.strokeText(txt, line.posX + line.width / 2, line.posY)
    } else {
        var y = line.height;
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
        gCtx.fillText(txt, gElCanvas.width / 2, y)
        gCtx.strokeText(txt, gElCanvas.width / 2, y)
        line.posY = y;
        line.posX = gElCanvas.width / 2 - line.width / 2;
        line.height = y;
    }
}


function increaseFont(elBtn) {
    var font = getComputedStyle(elBtn, null).fontSize;
    font = parseInt(font);
    elBtn.style.fontSize = font + 2 + 'px';
}
function onFontChange(diff) {
    if (!gIsUpdating) return;
    fontChange(diff);
    drawMeme(gCurrImgUrl, true);
}
function onTextMove(diff) {
    if (!gIsUpdating) return;
    textMove(diff);
    drawMeme(gCurrImgUrl, true)
}
function onDeleteText() {
    if (!gIsUpdating) return;
    deleteText();
    drawMeme(gCurrImgUrl, false);
    gIsUpdating = false;
    document.querySelector('.add-text-btn').innerHTML = `<img src="ICONS/add.png"
    alt="">`;
    document.querySelector('.add-text-input').value = '';
}
function onSwitchText() {
    if (!gMeme.lines.length) return;
    gCurrHeight = null;
    gMeme.selectedLineIdx++;
    if (gMeme.selectedLineIdx > (gMeme.lines.length - 1)) {
        gMeme.selectedLineIdx = 0;
    };
    gIsUpdating = true;
    document.querySelector('.add-text-btn').innerHTML = `<img src="ICONS/check.png"
    alt="">`;
    document.querySelector('.add-text-input').value = gMeme.lines[gMeme.selectedLineIdx].txt;
    document.querySelector('.add-text-input').focus();
    drawMeme(gCurrImgUrl, true)
}
function onAlignText(align) {
    if (!gIsUpdating) return;
    alignText(align);
    drawMeme(gCurrImgUrl, true);
}
function onColorChange(color) {
    if (!gIsUpdating) return;
    colorChange(color);
    drawMeme(gCurrImgUrl, true);
}
function onFontFamilyChange(value) {
    gCurrFont = value
    if (gIsUpdating === false) return;
    fontFamilyChange();
    drawMeme(gCurrImgUrl, true);
}
function showFocus() {
    var currText = gMeme.lines[gMeme.selectedLineIdx];
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
    gMeme.lines[gMeme.selectedLineIdx].txt = document.querySelector('.add-text-input').value
    drawMeme(gCurrImgUrl, true);
}


function onSetLang() {
    setLang();
    document.querySelector('.bg-screen').classList.remove('show')
    document.querySelector('.nav-bar').classList.remove('show')
    if (gCurrLang === 'he') document.body.classList.add('rtl')
    else document.body.classList.remove('rtl')
    document.querySelector('#nav-icon1').classList.remove('open');
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
    renderImgGallery(imgsForDisplay);
}


function toggleModal() {
    document.querySelector('.help-modal').classList.toggle('hide')
}
function toggleMenu() {
    document.querySelector('.nav-bar').classList.toggle('show');
    document.querySelector('.bg-screen').classList.toggle('show');
}


function showGallery() {
    document.querySelector('.gallery-view').classList.remove('hide');
    document.querySelector('.editor-view').classList.add('hide');
    document.querySelector('.memes-view').classList.add('hide');
    document.querySelector('.share-container').style.visibility = 'hidden';
    document.querySelector('.bg-screen').classList.remove('show');
    document.querySelector('.nav-bar').classList.remove('show');
    document.querySelector('body').classList.add('overflow-hidden');
    document.querySelector('#nav-icon1').classList.remove('open');
    gIsUpdating = false;
    renderImgGallery(gImgs);
}
function renderImgGallery(imgs) {
    var strHTML = imgs.map((img) => {
        return `<div class="img-container">
        <img src="${img.url}" alt="" onclick="onSetMemeImg(${img.id})">
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
        createCanvas()
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

    if (lineIdx >= 0) gMeme.selectedLineIdx = lineIdx;
    else {                  // deleting the square if clicking on picture
        drawMeme(gCurrImgUrl, false);
        return;
    }
    setTextGrab(true);

    gStartPos = pos;
    gCurrHeight = null
    gIsUpdating = true;
    document.querySelector('.add-text-btn').innerHTML = `<img src="ICONS/check.png" alt="">`
    document.querySelector('.add-text-input').value = gMeme.lines[gMeme.selectedLineIdx].txt;
    if (window.screen.width > 540) {
        document.querySelector('.add-text-input').focus();
    }
    drawMeme(gCurrImgUrl, true);
}
function onMove(ev) {
    // console.log(ev.type);
    ev.stopPropagation()
    const currLine = gMeme.lines[gMeme.selectedLineIdx];
    if (!currLine) return;
    if (currLine.isGrab) {
        const pos = getEvPos(ev)
        const dx = pos.x - gStartPos.x
        const dy = pos.y - gStartPos.y
        moveText(dx, dy)
        gStartPos = pos
        drawMeme(gCurrImgUrl, true);
    }
}
function dropText() {
    if (!gMeme.lines.length) return;
    if (!gMeme.lines[gMeme.selectedLineIdx].isGrab) {
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
    document.querySelector('body').classList.add('overflow-hidden');
    document.querySelector('#nav-icon1').classList.remove('open');
    renderMemes();
}
function onSaveMeme() {
    drawMeme(gCurrImgUrl, false)
    setTimeout(() => {
        var imgContent = gElCanvas.toDataURL('image/jpeg')
        var currMeme = {
            data: gMeme,
            url: imgContent
        }
        gSavedMemes.push(currMeme);
        saveMemes();
    }, 0);
    document.querySelector('.save-btn').style.backgroundColor = '#198754';
    document.querySelector('.memes-link').style.backgroundColor = '#198754';
    setTimeout(() => {
        document.querySelector('.save-btn').style.backgroundColor = 'white';
        document.querySelector('.memes-link').style.backgroundColor = '';
    }, 500);
}
function renderMemes() {
    var strHTML = gSavedMemes.map((meme, idx) => {
        return `<div class="meme" onclick="editMeme('${idx}')"><img src="${meme.url}" alt=""></div>`
    }).join('');
    if (!gSavedMemes.length) {
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

function editMeme(memeIdx) {
    gMeme = gSavedMemes[memeIdx].data;
    document.querySelector('.memes-view').classList.add('hide');
    document.querySelector('.editor-view').classList.remove('hide');
    drawMeme(gImgs[gMeme.selectedImgId - 1].url);
}

// DOWNLOAD MEME //

function onDownloadImg(elLink) {
    drawMeme(gCurrImgUrl, false);
    var imgContent = gElCanvas.toDataURL('image/jpeg')
    elLink.href = imgContent 
    drawMeme(gCurrImgUrl, false);

}

// LOAD IMAGE FROM COMPUTER //

function onImgInput(ev) {
    loadImgFromInput(ev, renderImg)
}
function loadImgFromInput(ev, onImageReady) {
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
    gCurrImgUrl = img.src;
    document.querySelector('.gallery-view').classList.add('hide');
    document.querySelector('.editor-view').classList.remove('hide');
    resizeCanvas();
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
}

//  Menu Button //

function toggleBtn() {
    document.querySelector('#nav-icon1').classList.toggle('open');
}