let constant = require('./constant');

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
    let golos = require(`golos-js`),
        section = 'golos',
        placeholdersLocal = {
            '{img_p_4}': `https://imgp.golos.io/400x0/`,
            '{img_p_8}': `https://imgp.golos.io/800x0/`
        };

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

    golos.broadcast.send(
        {'extensions': [], 'operations': operations},
        {'posting': wif},
        function (err, result) {
            if (!err) {
                tool.handleSuccessfulPost(section, result);
            } else {
                tool.handlePublishError(section, err);
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

    vox.broadcast.send(
        {'extensions': [], 'operations': operations},
        {'posting': wif},
        function (err, result) {
            console.log(section, err, result);
            if (!err) {
                tool.handleSuccessfulPost(section, result);
            } else {
                tool.handlePublishError(section, err)
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
    let steem = require(`@steemit/steem-js`),
        section = 'steem',
        placeholdersLocal = {
            '{img_p_4}': `https://steemitimages.com/400x0/`,
            '{img_p_8}': `https://steemitimages.com/800x0/`
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

    steem.broadcast.send(
        {'extensions': [], 'operations': operations},
        {'posting': wif},
        function (err, result) {
            if (!err) {
                tool.handleSuccessfulPost(section, result);
            } else {
                tool.handlePublishError(section, err)
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

    wlsjs.broadcast.send(
        {'extensions': [], 'operations': operations},
        {'posting': wif},
        function (err, result) {
            if (!err) {
                tool.handleSuccessfulPost(section, result);
            } else {
                tool.handlePublishError(section, err)
            }
        }
    );
}

module.exports = {
    publishToGolos: publishToGolos,
    publishToVox: publishToVox,
    publishToSteem: publishToSteem,
    publishToWls: publishToWls
}
