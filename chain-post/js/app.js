var jQuery = require(`jquery`),
    sprintf = require(`sprintf-js`).sprintf,
    ls = require(`local-storage`),
    ss = require(`sessionstorage`),
    Fingerprint2 = require(`fingerprintjs2`),
    AES = require(`crypto-js/aes`),
    steem = require(`@steemit/steem-js`),
    vox = require(`@steemit/steem-js`),
    golos = require(`golos-js`),
    wlsjs = require(`wlsjs-staging`);

const placeholders = {
    '{f_zavz9t}': `---
<center>
### [![](https://s19.postimg.cc/855m162ab/27cb8858fa0dfe41d2b1190533c8af9a63-32x32.png) SteemIt](https://steemit.com/@zavz9t) [![](https://s19.postimg.cc/6er6dbmyr/download-32x32.jpg) WhaleShares](https://whaleshares.io/@zavz9t) [![](https://s19.postimg.cc/7tsr21vrn/1480-32x32.png) Golos](https://golos.io/@zavz9t) [![VOX](https://s19.postimg.cc/fgjyfjt4j/vox-32.png)](https://vox.community/@zavz9t)
</center>
`,
    '{f_lego-cat}': `---
<center>
### [![](https://s19.postimg.cc/855m162ab/27cb8858fa0dfe41d2b1190533c8af9a63-32x32.png) SteemIt](https://steemit.com/@lego-cat) [![](https://s19.postimg.cc/6er6dbmyr/download-32x32.jpg) WhaleShares](https://whaleshares.io/@lego-cat) [![](https://s19.postimg.cc/7tsr21vrn/1480-32x32.png) Golos](https://golos.io/@lego-cat) [![VOX](https://s19.postimg.cc/fgjyfjt4j/vox-32.png)](https://vox.community/@lego-cat)
</center>
`,
    '{f_v-mi}': `---
<center>
### [![](https://s19.postimg.cc/855m162ab/27cb8858fa0dfe41d2b1190533c8af9a63-32x32.png) SteemIt](https://steemit.com/@v-mi) [![](https://s19.postimg.cc/6er6dbmyr/download-32x32.jpg) WhaleShares](https://whaleshares.io/@v-mi) [![](https://s19.postimg.cc/7tsr21vrn/1480-32x32.png) Golos](https://golos.io/@v-mi) [![VOX](https://s19.postimg.cc/fgjyfjt4j/vox-32.png)](https://vox.community/@v-mi)
</center>
`,
    '{f_cp_ua}': `---

## Декілька слів про те, куди Ви попали

Даний розділ починався з того, що я ділився горнятками кави, які я отримував і бачив у різноманітних закладах. Оскільки вони часто бували яскравими та веселими, то я вирішив ними ділитися з тими, кому це цікаво. Пізніше, я побачив, що є багато різноманітних горняток навколо, то я почав ділитися і ними також, а назва залишилася, як ознака того, з чого все почалося 😉

<center>![](https://s19.postimg.cc/bw7u1jeyr/shutterstock_1012867498.jpg)</center>
`,
    '{f_cp_ru}': `---

## Несколько слов о том, куда Вы попали

Данный раздел начинался с того, что я делился чашечками кофе, которые я видел в различных заведениях. Поскольку они были весёлыми и забавными, то я решил ними делиться с теми, кому интересно. Позже я увидел много интересных чашек без кофе и не смог пройти мимо, а название осталось как воспоминание о том, с чего все началось 😉

<center>![](https://s19.postimg.cc/bw7u1jeyr/shutterstock_1012867498.jpg)</center>

---

<center>Оригінальні пости українською в блозі @zavz9t</center>
`,
    '{f_ad_ua}': `---

### Декілька слів про розділ

В книжці **"Бог завжди подорожує інкогніто"** я прочитав про метод підвищення/формування самооцінки, вона ж впевненість у собі: протягом 100 днів записувати мінімум 3 речі, якими пишаєшся, завдяки яким - день не пройшов дарма. Мене це зацікавило, то я вирішив спробувати.

<center>**Подивимось що з цього вийде 🙂**</center>

---

<center>[Джерело картинки](https://pixabay.com/en/list-icon-symbol-paper-sign-flat-2389219/)</center>
`
};

function stripAndTransliterate(input, spaceReplacement, ruPrefix) {
    spaceReplacement = spaceReplacement || '-';
    ruPrefix = ruPrefix || 'ru--';

    let translitAssoc = {
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

    let result = input.toLowerCase()
        .replace(/[\s,\.\/]/g, spaceReplacement);

    let origResult = result;
    for (let ruChar in translitAssoc) {
        result = result.replace(new RegExp(ruChar, 'gu'), translitAssoc[ruChar]);
    }
    let containRu = false;
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

function stripAccount(account) {
    return account.toLowerCase().replace(/\s+/g, '').replace(/@/g, '');
}

function stripWif(wif) {
    return wif.replace(/\s+/g, '');
}

function buildDefaultPermlink(author, appName, date) {
    date = date || new Date();

    author = author.replace(/@/g, '');
    appName = appName.replace(/@/g, '');
    let datetime = date.getUTCFullYear() + '-' + (date.getUTCMonth() + 1) + '-' + date.getUTCDate() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds();

    return appName + '-' + author + '-' + datetime;
}

function isTest(urlString) {
    urlString = urlString || window.location.href;

    let url = new URL(urlString);

    return url.searchParams.get('test');
}

function handleTags(tags) {
    tags = tags.replace(/,/g, ` `)
        .replace(/\s+/g, ` `)
        .trim();

    if (!tags) {
        return ``;
    }

    tags = tags.split(` `);

    let result = [];
    for (let tagKey in tags) {
        result.push(stripAndTransliterate(tags[tagKey]))
    }

    return result;
}

function stripPlaceholders(body) {
    return body.replace(/{.*}/g, '');
}

function handleSuccessfulPost(section, result) {
    console.log(section, result);

    let sectionToHost = {
            'golos': `https://golos.io`,
            'steem': `https://steemit.com`,
            'vox': `https://vox.community`,
            'wls': `https://whaleshares.io`
        },
        urlFormat = `%s/%s/@%s/%s`,
        operation = undefined
    ;

    if (!(section in sectionToHost)) {
        console.warn(sprintf(`Received section "%s" is not implemented yet!`, section));

        return
    }

    for (let key in result.operations) {
        if (`comment` === result.operations[key][0]) {
            operation = result.operations[key][1];
            break;
        }
    }

    if (!operation) {
        console.warn(sprintf(`Operation "comment" for section "%s" was not found in result.`, section));

        return;
    }

    let url = sprintf(
        urlFormat,
        sectionToHost[section],
        operation['parent_permlink'],
        operation['author'],
        operation['permlink']
    );

    jQuery(`#result`).append(
        sprintf(`<p>%s: <a href="%s" target="_blank" rel="noopener noreferrer">%s</a></p>`, section, url, url)
    )
}

function handlePublishError(section, error) {
    console.error('section', error);
    jQuery(`#errors`).append(
        sprintf(`<p>%s: %s</p>`, section, error)
    )
}

function publishToGolos(
    wif,
    author,
    permlink,
    parentAuthor,
    parentPermlink,
    postTitle,
    postBody,
    jsonMetadata,
    declinePayout,
    allInPower,
    beneficiaries,
    publishAsGolosio,
    publishForVik
) {
    let section = 'golos',
        placeholdersLocal = {
        '{img_p_4}': `https://imgp.golos.io/400x0/`,
        '{img_p_8}': `https://imgp.golos.io/800x0/`
    };

    if (false === isTest() && false === golos.auth.isWif(wif)) {
        return alert('Вы допустили ошибку в поле ввода постинг ключа. Будьте внимательны! Неправильное использование ключей влечет потерю аккаунта!');
    }

    let beneficiariesLocal = JSON.parse(JSON.stringify(beneficiaries));

    if (publishAsGolosio) {
        beneficiariesLocal.push({"account": "golosio", "weight": 1000});
    }
    if (publishForVik) {
        beneficiariesLocal.push({"account": "netfriend", "weight": 1000});
        beneficiariesLocal.push({"account": "vik", "weight": publishForVik * 1});
    }

    for (let key in placeholdersLocal) {
        postBody = postBody.replace(key, placeholdersLocal[key]);
    }
    for (let key in placeholders) {
        postBody = postBody.replace(key, placeholders[key]);
    }
    postBody = stripPlaceholders(postBody);

    let operations = [
        [
            `comment`,
            {
                'parent_author': parentAuthor,
                'parent_permlink': parentPermlink,
                'author': author,
                'permlink': permlink,
                'title': postTitle,
                'body': postBody,
                'json_metadata': JSON.stringify(jsonMetadata)
            }
        ],
        [
            `comment_options`,
            {
                'author': author,
                'permlink': permlink,
                'max_accepted_payout': (declinePayout) ? '0.000 GBG' : '1000000.000 GBG',
                'percent_steem_dollars': (allInPower) ? 0 : 10000,
                'allow_votes': true,
                'allow_curation_rewards': true,
                'extensions': [[
                    0,
                    {
                        'beneficiaries': beneficiariesLocal
                    }
                ]]
            }
        ]
    ];

    if (isTest()) {
        console.log(section, operations);

        return false;
    }

    golos.broadcast.send(
        {'extensions': [], 'operations': operations},
        {'posting': wif},
        function (err, result) {
            if (!err) {
                handleSuccessfulPost(section, result);
            } else {
                handlePublishError(section, err);
            }
        }
    );
}

function publishToVox(
    wif,
    author,
    permlink,
    parentAuthor,
    parentPermlink,
    postTitle,
    postBody,
    jsonMetadata,
    declinePayout,
    allInPower,
    beneficiaries,
    forDs
) {
    let placeholdersLocal = {},
        section = 'vox';

    vox.api.setOptions({ url: 'wss://vox.community/ws' });
    vox.config.set('address_prefix', 'VOX');
    vox.config.set('chain_id', '88a13f63de69c3a927594e07d991691c20e4cf1f34f83ae9bd26441db42a8acd');

    if (false === isTest() && false === vox.auth.isWif(wif)) {
        return alert('Вы допустили ошибку в поле ввода постинг ключа. Будьте внимательны! Неправильное использование ключей влечет потерю аккаунта!');
    }

    let beneficiariesLocal = JSON.parse(JSON.stringify(beneficiaries));
    if (forDs) {
        beneficiariesLocal.push({"account": "denis-skripnik", "weight": 100});

        jsonMetadata['tags'].push('dpos-post');
    }

    for (let key in placeholdersLocal) {
        postBody = postBody.replace(key, placeholdersLocal[key]);
    }
    for (let key in placeholders) {
        postBody = postBody.replace(key, placeholders[key]);
    }
    postBody = stripPlaceholders(postBody);

    let operations = [
        [
            `comment`,
            {
                'parent_author': parentAuthor,
                'parent_permlink': parentPermlink,
                'author': author,
                'permlink': permlink,
                'title': postTitle,
                'body': postBody,
                'json_metadata': JSON.stringify(jsonMetadata)
            }
        ],
        [
            `comment_options`,
            {
                'author': author,
                'permlink': permlink,
                'max_accepted_payout': (declinePayout) ? '0.000 GOLD' : '1000000.000 GOLD',
                'percent_steem_dollars': (allInPower) ? 0 : 10000,
                'allow_votes': true,
                'allow_curation_rewards': true,
                'extensions': [[
                    0,
                    {
                        'beneficiaries': beneficiariesLocal
                    }
                ]]
            }
        ]
    ];

    if (isTest()) {
        console.log(section, operations);

        return false;
    }

    vox.broadcast.send(
        {'extensions': [], 'operations': operations},
        {'posting': wif},
        function (err, result) {
            console.log(section, err, result);
            if (!err) {
                handleSuccessfulPost(section, result);
            } else {
                handlePublishError(section, err)
            }
        }
    );
}

function publishToSteem(
    wif,
    author,
    permlink,
    parentAuthor,
    parentPermlink,
    postTitle,
    postBody,
    jsonMetadata,
    declinePayout,
    allInPower,
    beneficiaries
) {

    let section = 'steem',
        placeholdersLocal = {
        '{img_p_4}': `https://steemitimages.com/400x0/`,
        '{img_p_8}': `https://steemitimages.com/800x0/`
    };

    steem.api.setOptions({ url: "https://api.steemit.com" });

    // steem.api.setOptions({ url: 'wss://gtg.steem.house:8090' });
    // steem.config.set('address_prefix','STM');
    // steem.config.set('chain_id','0000000000000000000000000000000000000000000000000000000000000000');

    if (false === isTest() && false === steem.auth.isWif(wif)) {
        return alert('Вы допустили ошибку в поле ввода постинг ключа. Будьте внимательны! Неправильное использование ключей влечет потерю аккаунта!');
    }

    for (let key in placeholdersLocal) {
        postBody = postBody.replace(key, placeholdersLocal[key]);
    }
    for (let key in placeholders) {
        postBody = postBody.replace(key, placeholders[key]);
    }
    postBody = stripPlaceholders(postBody);

    let operations = [
        [
            `comment`,
            {
                'parent_author': parentAuthor,
                'parent_permlink': parentPermlink,
                'author': author,
                'permlink': permlink,
                'title': postTitle,
                'body': postBody,
                'json_metadata': JSON.stringify(jsonMetadata)
            }
        ],
        [
            `comment_options`,
            {
                'author': author,
                'permlink': permlink,
                'max_accepted_payout': (declinePayout) ? '0.000 SBD' : '1000000.000 SBD',
                'percent_steem_dollars': (allInPower) ? 0 : 10000,
                'allow_votes': true,
                'allow_curation_rewards': true,
                // 'extensions': [[
                //     0,
                //     {
                //         'beneficiaries': beneficiaries
                //     }
                // ]]
                'extensions': []
            }
        ]
    ];

    if (isTest()) {
        console.log(section, operations);

        return false;
    }

    steem.broadcast.send(
        {'extensions': [], 'operations': operations},
        {'posting': wif},
        function (err, result) {
            if (!err) {
                handleSuccessfulPost(section, result);
            } else {
                handlePublishError(section, err)
            }
        }
    );
}

function publishToWls(
    wif,
    author,
    permlink,
    parentAuthor,
    parentPermlink,
    postTitle,
    postBody,
    jsonMetadata,
    declinePayout,
    allInPower,
    beneficiaries
) {
    let section = 'wls',
        placeholdersLocal = {
        '{img_p_4}': `https://whaleshares.io/imageproxy/400x0/`,
        '{img_p_8}': `https://whaleshares.io/imageproxy/800x0/`,
        '{f_wls}': `---
<center>
Join our Whaleshares curation Group On Discord.
We look for quality contents and help the needful.
You are formally invited to out Group.
https://discord.gg/JAW8fBt
</center>
`
    };

    if (false === isTest() && false === wlsjs.auth.isWif(wif)) {
        return alert('Вы допустили ошибку в поле ввода постинг ключа. Будьте внимательны! Неправильное использование ключей влечет потерю аккаунта!');
    }

    for (let key in placeholdersLocal) {
        postBody = postBody.replace(key, placeholdersLocal[key]);
    }
    for (let key in placeholders) {
        postBody = postBody.replace(key, placeholders[key]);
    }
    postBody = stripPlaceholders(postBody);

    let operations = [
        [
            `comment`,
            {
                'parent_author': parentAuthor,
                'parent_permlink': parentPermlink,
                'author': author,
                'permlink': permlink,
                'title': postTitle,
                'body': postBody,
                'json_metadata': JSON.stringify(jsonMetadata)
            }
        ],
        [
            `comment_options`,
            {
                'author': author,
                'permlink': permlink,
                'max_accepted_payout': (declinePayout) ? '0.000 WLS' : '1000000.000 WLS',
                'percent_steem_dollars': (allInPower) ? 0 : 10000,
                'allow_votes': true,
                'allow_curation_rewards': true,
                'extensions': [[
                    0,
                    {
                        'beneficiaries': beneficiaries
                    }
                ]]
            }
        ]
    ];

    if (isTest()) {
        console.log(section, operations);

        return false;
    }

    wlsjs.broadcast.send(
        {'extensions': [], 'operations': operations},
        {'posting': wif},
        function (err, result) {
            if (!err) {
                handleSuccessfulPost(section, result);
            } else {
                handlePublishError(section, err)
            }
        }
    );
}

function publishPost() {
    let postTitle = document.getElementById('title').value,
//                    wssgolos = (document.getElementById("golosnode").value)?document.getElementById("golosnode").value:'wss://ws.golos.io',
        postBody = document.getElementById('body').value, //MD.value(),
//                    feature = document.getElementById("feature").value.replace(/ /g, ''),
        steemAuthor = stripAccount(document.getElementById('account-steem').value),
        steemWif = stripWif(document.getElementById('wif-steem').value),
        golosAuthor = stripAccount(document.getElementById('account-golos').value),
        golosWif = stripWif(document.getElementById('wif-golos').value),
        golosAsGolosio = document.getElementById('golos-as-golosio').checked,
        golosForVik = document.getElementById('golos-for-vik').value,
        voxAuthor = stripAccount(document.getElementById('account-vox').value),
        voxWif = stripWif(document.getElementById('wif-vox').value),
        voxForDs = document.getElementById('vox-for-ds').checked,
        wlsAuthor = stripAccount(document.getElementById('account-wls').value),
        wlsWif = stripWif(document.getElementById('wif-wls').value),
//                    appname = (document.getElementById("appname").value)?document.getElementById("appname").value:'@vik',
        appName = '@chain-post';

//                golos.config.set('websocket',wssgolos);

    let permlink = stripAndTransliterate(postTitle, '-', 'ru-');

    let defaultTags = handleTags(document.getElementById('tags').value),
        steemTags = handleTags(document.getElementById('tags-steem').value),
        golosTags = handleTags(document.getElementById('tags-golos').value),
        voxTags = handleTags(document.getElementById('tags-vox').value),
        wlsTags = handleTags(document.getElementById('tags-wls').value)
    ;


    let jsonMetadata = {
            "app": appName,
            "format": "markdown",
            "tags": defaultTags,
//                        "image": (feature)?[feature]:featuredImage
            "image": []
        },
//                    beneficiaries = document.getElementById("benics").value,
//         beneficiaries = "[{\"account\":\"chain-post\",\"weight\":500}]",
        beneficiaries = [{"account": "chain-post","weight":500}],
        parentPermlink = defaultTags[0],
//                    Allinpower = document.getElementById("Allinpower").checked,
        allInPower = false,
//                    declinePayout = document.getElementById("declinePayout").checked,
        declinePayout = false,
//                    allowCur = (document.getElementById("declineCur").checked)?false:true,
        allowCur = true,
        parentAuthor = "",
        cleanBenef = "";

    // try {
    //     cleanBenef = (beneficiaries) ? JSON.parse(beneficiaries) : ""
    // } catch(e) {
    //     return alert("Вы ввели неправильный формат данных в поле бенефициаров! "+e);
    // }

//                $('#alerts').fadeIn();

    /*
                    if(document.getElementById("benevik").checked){
                        beneficiariesObj = [[0,{"beneficiaries":[{"account":"vik","weight":1000},{"account":"netfriend","weight":1000}]}]];
                        beneficiaries = true
                    }
    */
    if (!permlink) {
        return alert('Не удалось конвертировать ваш заголовок в ссылку. Задайте ссылку отдельно. Поле permlink в расширенных настройках поста')
    }

    // Steem section
    if (steemAuthor && steemWif) {
        let jsonMetadataSteem = JSON.parse(JSON.stringify(jsonMetadata));
        if (steemTags) {
            jsonMetadataSteem['tags'] = steemTags;
        }

        publishToSteem(
            steemWif,
            steemAuthor,
            (permlink) ? permlink : buildDefaultPermlink(steemAuthor, appName),
            parentAuthor,
            (steemTags) ? steemTags[0] : parentPermlink,
            postTitle,
            postBody,
            jsonMetadataSteem,
            declinePayout,
            allInPower,
            beneficiaries
        );
    }

    // GOLOS section
    if (golosAuthor && golosWif) {
        let jsonMetadataGolos = JSON.parse(JSON.stringify(jsonMetadata));
        if (golosTags) {
            jsonMetadataGolos['tags'] = golosTags;
        }

        publishToGolos(
            golosWif,
            golosAuthor,
            (permlink) ? permlink : buildDefaultPermlink(golosAuthor, appName),
            parentAuthor,
            golosTags ? golosTags[0] : parentPermlink,
            postTitle,
            postBody,
            jsonMetadataGolos,
            declinePayout,
            allInPower,
            beneficiaries,
            golosAsGolosio,
            golosForVik
        );
    }

    // WhaleShare section
    if (wlsAuthor && wlsWif) {
        let jsonMetadataWls = JSON.parse(JSON.stringify(jsonMetadata));
        if (wlsTags) {
            jsonMetadataWls['tags'] = wlsTags;
        }

        publishToWls(
            wlsWif,
            wlsAuthor,
            (permlink) ? permlink : buildDefaultPermlink(wlsAuthor, appName),
            parentAuthor,
            (wlsTags) ? wlsTags[0] : parentPermlink,
            postTitle,
            postBody,
            jsonMetadataWls,
            declinePayout,
            allInPower,
            beneficiaries
        );
    }

    // VOX section
    if (voxAuthor && voxWif) {
        let jsonMetadataVox = JSON.parse(JSON.stringify(jsonMetadata));
        if (voxTags) {
            jsonMetadataVox['tags'] = voxTags;
        }

        publishToVox(
            voxWif,
            voxAuthor,
            (permlink) ? permlink : buildDefaultPermlink(voxAuthor, appName),
            parentAuthor,
            (voxTags) ? voxTags[0] : parentPermlink,
            postTitle,
            postBody,
            jsonMetadataVox,
            declinePayout,
            allInPower,
            beneficiaries,
            voxForDs
        );
    }
}

jQuery(document).ready(function($) {
    $('#form').on('submit', function(e) {
        e.preventDefault();

        publishPost();
    });
});