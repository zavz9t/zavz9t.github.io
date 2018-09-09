function stripAndTransliterate(input, spaceReplacement, ruPrefix) {
    spaceReplacement = spaceReplacement || '-';
    ruPrefix = ruPrefix || 'ru--';

    var translitAssoc = {
        "ые": "yie",
        "щ": "shch",
        "ш": "sh",
        "ч": "ch",
        "ц": "cz",
        "й": "ij",
        "ё": "yo",
        "э": "ye",
        "ю": "yu",
        "я": "ya",
        "х": "kh",
        "ж": "zh",
        "а": "a",
        "б": "b",
        "в": "v",
        "ґ": "g",
        "г": "g",
        "д": "d",
        "е": "e",
        "є": "e",
        "з": "z",
        "и": "i",
        "і": "i",
        "ї": "i",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "ъ": "xx",
        "ы": "y",
        "ь": "x"
    };

    if (!input) {
        return '';
    }

    var result = input.toLowerCase()
        .replace(/[\s,\.\/]/g, spaceReplacement);

    var origResult = result;
    for (var ruChar in translitAssoc) {
        result = result.replace(new RegExp(ruChar, 'gu'), translitAssoc[ruChar]);
    }
    var containRu = false;
    if (origResult !== result) {
        containRu = true;
    }

    result = result.replace(new RegExp('[^a-z0-9\\' + spaceReplacement + ']', 'g'), '')
        .replace(new RegExp(spaceReplacement + '+', 'g'), spaceReplacement);

    if (result[0] === spaceReplacement) {
        result = result.substring(1);
    }

    // If string include ru character it should be prefixed by special prefix to roll back
    if (containRu) {
        result = ruPrefix + result;
    }
    return result;
}

function buildDefaultPermlink(author, appName, date) {
    date = date || new Date();

    author = author.replace(/@/g, '');
    appName = appName.replace(/@/g, '');
    var datetime = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();

    return appName + '-' + author + '-' + datetime;
}

function isTest(urlString) {
    urlString = urlString || window.location.href;

    var url = new URL(urlString);

    return url.searchParams.get('test');
}

function publishPost() {
    var posttitle = document.getElementById("title").value,
//                    wssgolos = (document.getElementById("golosnode").value)?document.getElementById("golosnode").value:'wss://ws.golos.io',
        post_body = document.getElementById("body").value, //MD.value(),
//                    feature = document.getElementById("feature").value.replace(/ /g, ''),
        author = document.getElementById("account").value.toLowerCase().replace(/ /g, '').replace(/@/g, ''),
//                    appname = (document.getElementById("appname").value)?document.getElementById("appname").value:'@vik',
        appName = '@chain-post',
        wif = document.getElementById("wif").value.replace(/\s/g, '');

    if (false === isTest() && false === golos.auth.isWif(wif)) {
        return alert('Вы допустили ошибку в поле ввода постинг ключа. Будьте внимательны! Неправильное использование ключей влечет потерю аккаунта!');
    }

//                golos.config.set('websocket',wssgolos);

    var permlink = stripAndTransliterate(posttitle, '-', 'ru-') || buildDefaultPermlink(author, appName);

    var tagsRaw = document.getElementById('tags').value
            .replace(/,/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' '),
        tags = [];
    for (tagKey in tagsRaw) {
        tags.push(stripAndTransliterate(tagsRaw[tagKey]))
    }

    var jsonMetadata = {
            "app": appName,
            "format": "markdown",
            "tags": tags,
//                        "image": (feature)?[feature]:featuredImage
            "image": []
        },
//                    parentpermlink = document.getElementById("parentpermlink").value,
//                    parentPermlink =(isEditMode || parentpermlink)?parentpermlink:tags[0],
        parentPermlink = tags[0],
//                    beneficiaries = document.getElementById("benics").value,
        beneficiaries = "[{\"account\":\"chain-post\",\"weight\":500}]",
//                    Allinpower = document.getElementById("Allinpower").checked,
        Allinpower = false,
//                    declinePayout = document.getElementById("declinePayout").checked,
        declinePayout = false,
//                    allowCur = (document.getElementById("declineCur").checked)?false:true,
        allowCur = true,
//                    parentauthor = (document.getElementById("parentauthor").value)?(document.getElementById("parentauthor").value):"";
        parentauthor = "";
    var cleanBenef = "";

    try {
        cleanBenef = (beneficiaries) ? JSON.parse(beneficiaries) : ""
    } catch(e) {
        return alert("Вы ввели неправильный формат данных в поле бенефициаров! "+e);
    }

//                $('#alerts').fadeIn();

    var beneficiariesObj = [
        [0, {
            "beneficiaries": (beneficiaries) ? cleanBenef : ""
        }]
    ];
    /*
                    if(document.getElementById("benevik").checked){
                        beneficiariesObj = [[0,{"beneficiaries":[{"account":"vik","weight":1000},{"account":"netfriend","weight":1000}]}]];
                        beneficiaries = true
                    }
    */
    if(!permlink)return alert('Не удалось конвертировать ваш заголовок в ссылку. Задайте ссылку отдельно. Поле permlink в расширенных настройках поста')

    var commentOptions = {
        "author": author,
        "permlink": permlink,
        "max_accepted_payout": (declinePayout) ? '0.000 GBG' : '1000000.000 GBG',
        "percent_steem_dollars": (Allinpower) ? 0 : 10000,
        "allow_votes": true,
        "allow_curation_rewards": allowCur,
        "extensions": (beneficiaries) ? beneficiariesObj : []
    };

    var newTx = {
        "parent_author": parentauthor,
        "parent_permlink": parentPermlink,
        "author": author,
        "permlink": permlink,
        "title": posttitle,
        "body": post_body,
        "json_metadata": JSON.stringify(jsonMetadata)
    };

    if (isTest()) {
        console.log(newTx, commentOptions);

        return false;
    }

    golos.broadcast.comment(
        wif,
        newTx['parent_author'],
        newTx['parent_permlink'],
        newTx['author'],
        newTx['permlink'],
        newTx['title'],
        newTx['body'],
        newTx['json_metadata'],
        function(err, result) {
            //console.log(err, result);
            if (!err) {
                console.log('comment', result);

                golos.broadcast.commentOptions(
                    wif,
                    commentOptions['author'],
                    commentOptions['permlink'],
                    commentOptions['max_accepted_payout'],
                    commentOptions['percent_steem_dollars'],
                    commentOptions['allow_votes'],
                    commentOptions['allow_curation_rewards'],
                    commentOptions['extensions'],
                    function(err, result) {
                        console.log(err, result);
                    }
                );
            }
            else {
                console.error(err);
            }
        }
    );
}