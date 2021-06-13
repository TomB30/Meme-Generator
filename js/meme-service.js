'use strict';
var gImgs;

var gMeme = {
    selectedImgId: 0,
    selectedLineIdx: 0,
    lines: []
}
var gFilter = '';
var gSavedMemes;

function createLine(txt, font = 'impact', align = 'center', color = 'white', width, posX, posY) {
    var line = {
        txt,
        size: 40,
        font: 'impact',
        align,
        color,
        width,
        posX,
        posY,
        isGrab: false
    }
    gMeme.lines.push(line);
    gMeme.selectedLineIdx = gMeme.lines.length - 1;
}

function setMemeImg(imgId) {
    var img = gImgs.find((img) => img.id === imgId);
    gMeme.selectedImgId = img.id;
    return img.url;
}

function fontChange(diff) {
    gMeme.lines[gMeme.selectedLineIdx].size += (diff * 2);
}
function textMove(diff) {
    if (!gCurrHeight) {
        gCurrHeight = gMeme.lines[gMeme.selectedLineIdx].height;
    }
    gCurrHeight += (diff * 10);
    gMeme.lines[gMeme.selectedLineIdx].height = gCurrHeight;
}
function colorChange(color){
    gMeme.lines[gMeme.selectedLineIdx].color = color;
}
function deleteText() {
    gMeme.lines.splice(gMeme.selectedLineIdx, 1);
    if (gMeme.selectedLineIdx > 0) gMeme.selectedLineIdx--;
}
function alignText(align) {
    gMeme.lines[gMeme.selectedLineIdx].align = align;
}
function fontFamilyChange() {
    gMeme.lines[gMeme.selectedLineIdx].font = gCurrFont;
}


function setFilter(filterBy) {
    gFilter = filterBy;
}


function getImgsForDisplay() {
    var imgs = gImgs.filter((img) => {
        return img.keywords.some((word) => {
            return word.includes(gFilter);
        });
    })
    return imgs
}

// DRAG & DROP //

function moveText(dx, dy) {
    gMeme.lines[gMeme.selectedLineIdx].posX += dx
    gMeme.lines[gMeme.selectedLineIdx].posY += dy
}
function setTextGrab(isGrab) {
    gMeme.lines[gMeme.selectedLineIdx].isGrab = isGrab;
}

// SAVE MEMES //

function saveMemes() {
    saveToStorage('SavedMemes', gSavedMemes);
}
function loadMemes() {
    gSavedMemes = loadFromStorage('SavedMemes');
    if (!gSavedMemes) gSavedMemes = [];
}
function loadImgs(){
    gImgs = loadFromStorage('ImgsDB');
    if(!gImgs) gImgs = [
        { id: 1, url: 'meme-imgs (square)/1.jpg', keywords: ['ugly', 'trump', 'funny', 'president'] },
        { id: 2, url: 'meme-imgs (square)/2.jpg', keywords: ['happy', 'animal', 'love'] },
        { id: 3, url: 'meme-imgs (square)/3.jpg', keywords: ['kids', 'animal', 'cute', 'sleep'] },
        { id: 4, url: 'meme-imgs (square)/4.jpg', keywords: ['animal', 'sleep'] },
        { id: 5, url: 'meme-imgs (square)/5.jpg', keywords: ['happy', 'kids'] },
        { id: 6, url: 'meme-imgs (square)/6.jpg', keywords: ['happy', 'funny'] },
        { id: 7, url: 'meme-imgs (square)/7.jpg', keywords: ['happy', 'kids', 'funny'] },
        { id: 8, url: 'meme-imgs (square)/8.jpg', keywords: ['happy', 'men'] },
        { id: 9, url: 'meme-imgs (square)/9.jpg', keywords: ['happy', 'kids', 'funny'] },
        { id: 10, url: 'meme-imgs (square)/10.jpg', keywords: ['happy', 'obama', 'president'] },
        { id: 11, url: 'meme-imgs (square)/11.jpg', keywords: ['happy', 'men', 'sport'] },
        { id: 12, url: 'meme-imgs (square)/12.jpg', keywords: ['happy', 'men'] },
        { id: 13, url: 'meme-imgs (square)/13.jpg', keywords: ['happy', 'men', 'funny'] },
        { id: 14, url: 'meme-imgs (square)/14.jpg', keywords: ['happy', 'men', 'scary'] },
        { id: 15, url: 'meme-imgs (square)/15.jpg', keywords: ['happy', 'men'] },
        { id: 16, url: 'meme-imgs (square)/16.jpg', keywords: ['happy', 'funny', 'men'] },
        { id: 17, url: 'meme-imgs (square)/17.jpg', keywords: ['happy', 'putin', 'president'] },
        { id: 18, url: 'meme-imgs (square)/18.jpg', keywords: ['happy', 'kids', 'toys'] },
        { id: 19, url: 'meme-imgs (square)/19.png', keywords: ['bed', 'kids'] },
    ]
}

// UPLOAD IMAGE FROM COMPUTER // 

function createNewImg(img) {
    var newImg = {
        id: gImgs.length+1,
        url: img.src,
        keywords: ['happy']
    }
    gImgs.push(newImg);
    saveToStorage('ImgsDB' , gImgs)
}