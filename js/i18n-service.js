gTrans = {
    'gallery' : {
        en : 'Gallery',
        he : 'גלריה'
    },
    'lang' : {
        en : 'עברית',
        he : 'English' 
    },
    'search' : {
        en : 'Search',
        he : 'חיפוש'
    },
    'funny' : {
        en : 'Funny',
        he : 'מצחיק'
    },
    'animal' : {
        en : 'Animal',
        he : 'חיות'
    },
    'men' : {
        en : 'Men',
        he : 'גברים'
    },
    'kids' : {
        en : 'Kids',
        he : 'ילדים'
    },
    'happy' : {
        en : 'Happy',
        he : 'שמח'
    },
    'president' : {
        en : 'President',
        he : 'נשיא'
    },
    'add-text-here' : {
        en : 'Add Text Here',
        he : 'הוסף טקסט כאן'
    },
    'share' : {
        en : 'Share',
        he : 'שתף'
    },
    'download' : {
        en : 'Download',
        he : 'הורדה'
    }
}

gCurrLang = 'en';

function getTrans(transKey) {
    var keyTrans = gTrans[transKey]
    // console.log(keyTrans);

    // TODO: if key is unknown return 'UNKNOWN'
    if (!keyTrans) return 'UNKNOWN'
    // TODO: get from gTrans

    var txt = keyTrans[gCurrLang];
    // TODO: If translation not found - use english
    if (!txt) return keyTrans.en

    return txt
}

function doTrans() {
    // TODO: 
    var els = document.querySelectorAll('[data-trans]')
    // console.log(els);

    // for each el:
    //    get the data-trans and use getTrans to replace the innerText 
    els.forEach(function (el) {
        // console.dir(el)
        var txt = getTrans(el.dataset.trans)
        if (el.nodeName === 'INPUT') el.placeholder = txt;
        else el.innerText = txt
        //    ITP: support placeholder  
            
        // console.log('el.dataset', el.dataset.trans);       
    })
}

function setLang() {
    if(gCurrLang === 'en'){
        gCurrLang = 'he';
        return;
    } 
    console.log('HI');
    if(gCurrLang === 'he') gCurrLang = 'en';
}