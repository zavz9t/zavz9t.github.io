let constant = require('./constant'),
    tool = require(`./tool`);

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
    publishForVik,
    callback
) {
    let golos = require(`golos-js`),
        section = 'golos',
        placeholdersLocal = {
            '{img_p_4}': `https://imgp.golos.io/400x0/`,
            '{img_p_8}': `https://imgp.golos.io/800x0/`,
            '{f_bl_ru}': `*ваш @lego-cat*

---

### Несколько слов о том, куда Вы попали

Однажды я обратил внимание, что прохожу мимо очень интересных вещей даже не обращая на них внимание...

Тогда я решил это исправить, в результате открыл для себя много интересного! А когда открыл, то решил поделиться ☺️

---

<center>![](https://i.postimg.cc/05thg3rP/Ukraine-_Flag-16.png) Пости даного розділу можна прочитати українською мовою в блозі @lego-cat</center>
`
        }
    ;

    if (false === tool.isTest() && false === golos.auth.isWif(wif)) {
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
        postBody = postBody.replace(new RegExp(key, 'g'), placeholdersLocal[key]);
    }
    for (let key in constant.placeholders) {
        postBody = postBody.replace(new RegExp(key, 'g'), constant.placeholders[key]);
    }
    postBody = tool.stripPlaceholders(postBody);

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

    if (tool.isTest()) {
        console.log(section, operations);

        return false;
    }

    broadcastSend(section, golos, wif, author, permlink, operations, callback)
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
    forDs,
    callback
) {
    let vox = require(`@steemit/steem-js`),
        placeholdersLocal = {},
        section = 'vox';

    vox.api.setOptions({ url: 'wss://vox.community/ws' });
    vox.config.set('address_prefix', 'VOX');
    vox.config.set('chain_id', '88a13f63de69c3a927594e07d991691c20e4cf1f34f83ae9bd26441db42a8acd');

    if (false === tool.isTest() && false === vox.auth.isWif(wif)) {
        return alert('Вы допустили ошибку в поле ввода постинг ключа. Будьте внимательны! Неправильное использование ключей влечет потерю аккаунта!');
    }

    let beneficiariesLocal = JSON.parse(JSON.stringify(beneficiaries));
    if (forDs) {
        beneficiariesLocal.push({"account": "denis-skripnik", "weight": 100});

        jsonMetadata['tags'].push('dpos-post');
    }

    for (let key in placeholdersLocal) {
        postBody = postBody.replace(new RegExp(key, 'g'), placeholdersLocal[key]);
    }
    for (let key in constant.placeholders) {
        postBody = postBody.replace(new RegExp(key, 'g'), constant.placeholders[key]);
    }
    postBody = tool.stripPlaceholders(postBody);

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

    if (tool.isTest()) {
        console.log(section, operations);

        return false;
    }

    broadcastSend(section, vox, wif, author, permlink, operations, callback)
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
    beneficiaries,
    callback
) {
    let steem = require(`@steemit/steem-js`),
        section = 'steem',
        placeholdersLocal = {
            '{img_p_4}': `https://steemitimages.com/400x0/`,
            '{img_p_8}': `https://steemitimages.com/800x0/`,
            '{f_bl_ru}': `*ваш @lego-cat*

---

### Несколько слов о том, куда Вы попали

Однажды я обратил внимание, что прохожу мимо очень интересных вещей даже не обращая на них внимание...

Тогда я решил это исправить, в результате открыл для себя много интересного! А когда открыл, то решил поделиться ☺️

---

<center>![](https://i.postimg.cc/05thg3rP/Ukraine-_Flag-16.png) Пости даного розділу можна прочитати українською мовою в блозі @lego-cat</center>
`
        };

    // steem.api.setOptions({ url: "https://api.steemit.com" });

    // steem.api.setOptions({ url: 'wss://gtg.steem.house:8090' });
    // steem.config.set('address_prefix','STM');
    // steem.config.set('chain_id','0000000000000000000000000000000000000000000000000000000000000000');

    if (false === tool.isTest() && false === steem.auth.isWif(wif)) {
        return alert('Вы допустили ошибку в поле ввода постинг ключа. Будьте внимательны! Неправильное использование ключей влечет потерю аккаунта!');
    }

    for (let key in placeholdersLocal) {
        postBody = postBody.replace(new RegExp(key, 'g'), placeholdersLocal[key]);
    }
    for (let key in constant.placeholders) {
        postBody = postBody.replace(new RegExp(key, 'g'), constant.placeholders[key]);
    }
    postBody = tool.stripPlaceholders(postBody);

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

    if (tool.isTest()) {
        console.log(section, operations);

        return false;
    }

    broadcastSend(section, steem, wif, author, permlink, operations, callback)
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
    beneficiaries,
    callback
) {
    let wlsjs = require(`wlsjs-staging`),
        section = 'wls',
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

    if (false === tool.isTest() && false === wlsjs.auth.isWif(wif)) {
        return alert('Вы допустили ошибку в поле ввода постинг ключа. Будьте внимательны! Неправильное использование ключей влечет потерю аккаунта!');
    }

    for (let key in placeholdersLocal) {
        postBody = postBody.replace(new RegExp(key, 'g'), placeholdersLocal[key]);
    }
    for (let key in constant.placeholders) {
        postBody = postBody.replace(new RegExp(key, 'g'), constant.placeholders[key]);
    }
    postBody = tool.stripPlaceholders(postBody);

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

    if (tool.isTest()) {
        console.log(section, operations);

        return false;
    }

    broadcastSend(section, wlsjs, wif, author, permlink, operations, callback)
}

function broadcastSend(section, connection, wif, author, permlink, operations, callback) {
    connection.api.getContent(author, permlink, function(err, result) {
        if (err) {
            tool.handlePublishError(section, err);

            return;
        }

        if (result[`permlink`] === permlink) {
            permlink = permlink + `-` + Math.floor(Date.now() / 1000);

            operations[0][1][`permlink`] = permlink;
            operations[1][1][`permlink`] = permlink;
        }

        connection.broadcast.send(
            {'extensions': [], 'operations': operations},
            {'posting': wif},
            function (err, result) {
                if (!err) {
                    tool.handleSuccessfulPost(section, result);
                } else {
                    tool.handlePublishError(section, err);
                }
                if (callback) {
                    callback();
                }
            }
        );
    });
}

function handlePublish(section, options) {
    switch (section) {
        case `steem`: publishToSteem.apply(null, options);
            break;
        case `golos`: publishToGolos.apply(null, options);
            break;
        case `vox`: publishToVox.apply(null, options);
            break;
        case `wls`: publishToWls.apply(null, options);
            break;
        default: tool.handlePublishError(section, `Section is not implemented yet!`);
    }
}

function handler() {
    return {
        adapters: [`steem`, `golos`, `vox`, `wls`],
        posts: [],
        addPost: function (section, options) {
            if (false === this.adapters.includes(section)) {
                tool.handlePublishError(section, `Section is not implemented yet!`);

                return;
            }
            // TODO: need to rewrite for several posts at one platform support
            this.posts[section] = options;
        },
        publish: function () {
            let steemKey = `steem`,
                voxKey = `vox`;
            if (steemKey in this.posts && voxKey in this.posts) {
                let steemVars = this.posts[steemKey],
                    voxVars = this.posts[voxKey];
                steemVars.push(function () {
                    publishToVox.apply(null, voxVars);
                });
                publishToSteem.apply(null, steemVars);

                delete this.posts[steemKey];
                delete this.posts[voxKey];
            }

            for (let key in this.posts) {
                handlePublish(key, this.posts[key])
            }

            this.posts = [];
        }
    }
}

function getConnectionBySection(section) {
    switch (section) {
        case `steem`:
            return require(`@steemit/steem-js`);
        case `golos`:
            return require(`golos-js`);
        case `vox`:
            let vox = require(`@steemit/steem-js`);

            vox.api.setOptions({ url: 'wss://vox.community/ws' });
            vox.config.set('address_prefix', 'VOX');
            vox.config.set('chain_id', '88a13f63de69c3a927594e07d991691c20e4cf1f34f83ae9bd26441db42a8acd');

            return vox;
        case `wls`:
            return require(`wlsjs-staging`);
        default:
            throw sprintf(`Section "%s" is not implemented yet!`, section);
    }
}

function isWif(wif) {
    let golos = require(`golos-js`);

    return golos.auth.isWif(wif);
}

function isWifValid(section, username, wif, successCallback, failCallback) {
    let connection = null;
    try {
        connection = getConnectionBySection(section);
    } catch (e) {
        failCallback(e.toString());
    }

    connection.api.getAccounts([username], function (err, result) {
        if (err) {
            failCallback(err.toString());

            return;
        }
        if (result.length < 1) {
            failCallback(sprintf(`Account "%s" was not found at "%s" server.`, username, section));

            return;
        }

        let pubWif = result[0].posting.key_auths[0][0]
            , isValid = false;

        try {
            isValid = connection.auth.wifIsValid(wif, pubWif);
        } catch(e) {
            console.error(e);
        }
        if (isValid) {
            successCallback(section, username, wif);
        } else {
            failCallback(sprintf(`Received WIF and username "%s" are not match at "%s" server.`, username, section));
        }
    });
}

module.exports = {
    handler: handler,
    isWif: isWif,
    isWifValid: isWifValid
}
