const appName = `@chain-post`
    , keyConnBusy = `busy`
;

let items = []
    , sprintf = require(`sprintf-js`).sprintf
    , sleep = require(`sleep-promise`)
    , jQuery = require(`jquery`)
    , constant = require(`./constant`)
    , tool = require(`./tool`)
;

class AbstractAdapter
{
    constructor() {
        this.name = null;
        this.connection = null;
    }

    reconnect() {}

    static getCurrency()
    {
        return ``;
    }

    static factory(section) {
        if (!(section in items)) {
            switch (section) {
                case constant.adapterSteem:
                    items[section] = new Steem();
                    break;
                case constant.adapterGolos:
                    items[section] = new Golos();
                    break;
                case constant.adapterVox:
                    items[section] = new Vox();
                    break;
                case constant.adapterWls:
                    items[section] = new Wls();
                    break;
                case constant.adapterSerey:
                    items[section] = new Serey();
                    break;
                case constant.adapterWeku:
                    items[section] = new Weku();
                    break;
                case constant.adapterSmoke:
                    items[section] = new Smoke();
                    break;
                case constant.adapterViz:
                    items[section] = new Viz();
                    break;
                default:
                    throw sprintf(
                        `factory: Section "%s" is not implemented yet!`,
                        section
                    );
            }
        }

        return items[section];
    }

    static buildJsonMetadata(tags, options)
    {
        let imagesList = [];
        if (options && `images` in options) {
            imagesList = options.images;
        }

        return {
            app: appName,
            format: `markdown`,
            tags: tags,
            image: imagesList
        }
    }

    static buildBeneficiaries(options)
    {
        return [ {account: `chain-post`, weight: 500} ]
    }

    static buildPermlink(postTitle)
    {
        return tool.stripAndTransliterate(postTitle, `-`, ``);
    }

    static getPlaceholders()
    {
        return constant.placeholders;
    }

    static getPercentSteemDollars()
    {
        return 10000;
    }

    isWif(wif) {
        return this.connection.auth.isWif(wif);
    }

    async isWifValid(username, wif, successCallback, failCallback) {
        while (true === this.connection.config.get(keyConnBusy)) {
            console.log(this.name + `:isWifValid: wait execution for 1 sec`);

            await sleep(1000);
        }

        this.reconnect();
        let instance = this;

        instance.connection.config.set(keyConnBusy, true);
        instance.connection.api.getAccounts([username], function (err, result) {
            if (err) {
                failCallback(err.toString());

                instance.connection.config.set(keyConnBusy, false);

                return;
            }
            if (result.length < 1) {
                failCallback(sprintf(`Account "%s" was not found at "%s" server.`, username, instance.name));

                instance.connection.config.set(keyConnBusy, false);

                return;
            }

            let pubWif = result[0].posting.key_auths[0][0]
                , isValid = false;

            try {
                isValid = instance.connection.auth.wifIsValid(wif, pubWif);
            } catch(e) {
                console.error(instance.name, e);
            }

            instance.connection.config.set(keyConnBusy, false);

            if (isValid) {
                successCallback(instance.name, username, wif);
            } else {
                failCallback(sprintf(
                    `Received WIF and username "%s" are not match at "%s" server.`,
                    username,
                    instance.name
                ));
            }
        });
    }

    publish(wif, author, postTitle, postBody, tags, options)
    {
        let operations = this.buildOperations(author, postTitle, postBody, tags, options);

        if (tool.isTest()) {
            console.log(this.name, operations);
            tool.handleSuccessfulPost(this.name, operations);
        } else {
            this.broadcastSend(wif, author, this.constructor.buildPermlink(postTitle), operations);
        }
    }

    buildOperations(author, postTitle, postBody, tags, options)
    {
        let permlink = this.constructor.buildPermlink(postTitle)
            , beneficiaries = this.constructor.buildBeneficiaries(options)
            , operations = [
                [
                    `comment`,
                    {
                        parent_author: ``,
                        parent_permlink: tags[0],
                        author: author,
                        permlink: permlink,
                        title: postTitle,
                        body: this.buildPostBody(postBody),
                        json_metadata: JSON.stringify(this.constructor.buildJsonMetadata(tags, options))
                    }
                ],
                [
                    `comment_options`,
                    {
                        author: author,
                        permlink: permlink,
                        max_accepted_payout: '1000000.000 ' + this.constructor.getCurrency(),
                        percent_steem_dollars: this.constructor.getPercentSteemDollars(),
                        allow_votes: true,
                        allow_curation_rewards: true
                    }
                ]
            ]
        ;
        if (beneficiaries && beneficiaries.length > 0) {
            operations[1][1][`extensions`] = [[
                0,
                {
                    beneficiaries: beneficiaries
                }
            ]];
        }
        return operations;
    }

    buildPostBody(postBody)
    {
        let placeholders = this.constructor.getPlaceholders();
        for (let key in placeholders) {
            postBody = postBody.replace(new RegExp(key, 'g'), placeholders[key]);
        }

        return tool.stripPlaceholders(postBody) + constant.postBodySign;
    }

    async broadcastSend(wif, author, permlink, operations) {
        while (true === this.connection.config.get(keyConnBusy)) {
            console.info(this.name + `:broadcastSend: wait execution for 1 sec`);

            await sleep(1000);
        }

        this.reconnect();
        let adapterInstance = this;

        adapterInstance.connection.config.set(keyConnBusy, true);
        adapterInstance.connection.api.getContent(author, permlink, function(err, result) {
            if (err) {
                tool.handlePublishError(adapterInstance.name, err);
                adapterInstance.connection.config.set(keyConnBusy, false);

                return;
            }

            if (result[`permlink`] === permlink) {
                permlink = permlink + `-` + Math.floor(Date.now() / 1000);

                operations[0][1][`permlink`] = permlink;
                operations[1][1][`permlink`] = permlink;
            }

            adapterInstance.connection.broadcast.send(
                {'extensions': [], 'operations': operations},
                {'posting': wif},
                function (err, result) {
                    adapterInstance.connection.config.set(keyConnBusy, false);
                    if (!err) {
                        tool.handleSuccessfulPost(adapterInstance.name, result);
                    } else {
                        tool.handlePublishError(adapterInstance.name, err);
                    }
                }
            );
        });
    }

    vote(url, accounts) {
        let params = tool.parsePostUrl(url);

        this.reconnect();
        let adapterInstance = this;

        adapterInstance.connection.api.getContent(params[`author`], params[`permlink`], function(err, result) {
            if (err) {
                tool.handlePublishError(adapterInstance.name, err);

                return;
            }
            if (result.id === 0) {
                tool.handlePublishError(
                    adapterInstance.name,
                    sprintf(
                        `Post with url: "%s" was not found at "%s" chain.`,
                        url,
                        constant.adapterDisplayNames[adapterInstance.name]
                    )
                );

                return;
            }

            for (let i in result.active_votes) {
                if (result.active_votes[i].voter in accounts) {
                    delete accounts[result.active_votes[i].voter];
                }
            }

            if (tool.isEmptyObject(accounts)) {
                tool.handlePublishWarning(adapterInstance.name, `This post were upvoted by chosen accounts earlier.`)

                return;
            }

            let operations = adapterInstance.buildVoteOperations(params[`author`], params[`permlink`], 10000, accounts);

            if (tool.isTest()) {
                console.log(operations, Object.values(accounts));
                tool.finishPublishing();

                return;
            }

            adapterInstance.connection.broadcast.send(
                {'extensions': [], 'operations': operations},
                Object.values(accounts),
                function (err, result) {
                    if (!err) {
                        tool.handleSuccessfulVote(adapterInstance.name, Object.keys(accounts));
                    } else {
                        tool.handlePublishError(adapterInstance.name, err);
                    }
                }
            );
        });
    }

    async processAccountsInfo(accounts, callback) {
        let adapterInstance = this;

        adapterInstance.reconnect();
        adapterInstance.connection.api.getDynamicGlobalProperties(function(err, dynamicProperties) {
            if (err) {
                console.error(sprintf(
                    `%s: Failed to load dynamic global properties`,
                    adapterInstance.name
                ));
                console.error(err);

                return;
            }

            adapterInstance.reconnect();
            adapterInstance.connection.api.getAccounts(accounts, function (err, result) {
                if (err) {
                    console.error(sprintf(
                        `%s: Failed to load accounts: "%s"`,
                        adapterInstance.name,
                        JSON.stringify(accounts)
                    ));
                    console.error(err);

                    return;
                }

                callback(result, dynamicProperties);
            });
        });
    }

    buildVoteOperations(author, permlink, weight, accounts) {
        let operations = [];
        for (let username in accounts) {
            operations.push([
                `vote`,
                {
                    voter: username,
                    author: author,
                    permlink: permlink,
                    weight: weight
                }
            ]);
        }

        return operations;
    }
}

class Steem extends AbstractAdapter
{
    constructor() {
        super();

        this.name = constant.adapterSteem;
        this.connection = require(`@steemit/steem-js`);

        if (false === this.connection.config.get(keyConnBusy)) {
            this.reconnect();
        }
    }

    static getCurrency()
    {
        return `SBD`;
    }

    static getPlaceholders()
    {
        return Object.assign({}, super.getPlaceholders(), constant.steemPlaceholders);
    }

    reconnect() {
        this.connection.api.setOptions({ url: `https://api.steemit.com` });
        this.connection.config.set(`address_prefix`, `STM`);
        this.connection.config.set(`chain_id`, `0000000000000000000000000000000000000000000000000000000000000000`);
    }

    async processAccountsInfo(accounts, callback) {
        function rcLoadCallback(resultAccounts, dynamicProperties) {
            // load RC data
            let requestData = {
                jsonrpc: `2.0`,
                id: 1,
                method: `rc_api.find_rc_accounts`,
                params: {
                    accounts: accounts
                }
            };
            jQuery.ajax({
                url: `https://api.steemit.com`,
                type: `POST`,
                data: JSON.stringify(requestData),
                success: function (response) {
                    let nameToIndex = {};
                    for (let i in resultAccounts) {
                        nameToIndex[resultAccounts[i].name] = i;
                    }

                    for (let i in response.result.rc_accounts) {
                        let account = response.result.rc_accounts[i]
                            , key = nameToIndex[account.account]
                        ;
                        resultAccounts[key][`max_rc`] = account.max_rc;
                        resultAccounts[key][`max_rc_creation_adjustment`] = account.max_rc_creation_adjustment;
                        resultAccounts[key][`rc_manabar`] = account.rc_manabar;
                    }

                    callback(resultAccounts, dynamicProperties);
                },
                error: function(e) {
                    console.error(e);

                    callback(resultAccounts, dynamicProperties);
                }
            });
        }

        super.processAccountsInfo(accounts, rcLoadCallback);
    }
}

class Golos extends AbstractAdapter
{
    constructor() {
        super();

        this.name = constant.adapterGolos;
        this.connection = require(`golos-js`);
    }

    static getCurrency()
    {
        return `GBG`;
    }

    static getPlaceholders()
    {
        return Object.assign({}, super.getPlaceholders(), constant.golosPlaceholders);
    }

    static buildBeneficiaries(options)
    {
        let beneficiaries = super.buildBeneficiaries(options)
            , keyGolosIo = `as_golosio`
            , keyVik = `for_vik`
        ;

        if (keyGolosIo in options && options[keyGolosIo]) {
            beneficiaries.push({ account: `golosio`, weight: 1000 });
        }
        if (keyVik in options && options[keyVik]) {
            beneficiaries.push({ account: `vik`, weight: options[keyVik] * 100 });
            beneficiaries.push({ account: `netfriend`, weight: 1000 });
        }

        return beneficiaries;
    }
}

class Vox extends AbstractAdapter
{
    constructor() {
        super();

        this.name = constant.adapterVox;
        this.connection = require(`@steemit/steem-js`);

        if (false === this.connection.config.get(keyConnBusy)) {
            this.reconnect();
        }
    }

    static getCurrency()
    {
        return `GOLD`;
    }

    static getPlaceholders()
    {
        return Object.assign({}, super.getPlaceholders(), constant.voxPlaceholders);
    }

    static buildBeneficiaries(options)
    {
        let beneficiaries = super.buildBeneficiaries(options)
            , keyDs = `for_ds`
        ;

        if (keyDs in options && options[keyDs]) {
            beneficiaries.push({ account: `denis-skripnik`, weight: 100 });
        }

        return beneficiaries;
    }

    static buildJsonMetadata(tags, options)
    {
        let metadata = super.buildJsonMetadata(tags, options)
            , keyDs = `for_ds`
        ;

        if (keyDs in options && options[keyDs]) {
            metadata[`tags`] = tags.concat([`dpos-post`]);
        }

        return metadata;
    }

    reconnect() {
        this.connection.api.setOptions({ url: `wss://vox.community/ws` });
        this.connection.config.set(`address_prefix`, `VOX`);
        this.connection.config.set(`chain_id`, `88a13f63de69c3a927594e07d991691c20e4cf1f34f83ae9bd26441db42a8acd`);
    }
}

class Wls extends AbstractAdapter
{
    constructor() {
        super();

        this.name = constant.adapterWls;
        this.connection = require(`wlsjs-staging`);
        this.connection.api.setOptions({ url: `https://rpc.wls.services` })
    }

    static getCurrency()
    {
        return `WLS`;
    }

    static getPlaceholders()
    {
        return Object.assign({}, super.getPlaceholders(), constant.wlsPlaceholders);
    }
}

class Serey extends AbstractAdapter
{
    constructor() {
        super();

        this.name = constant.adapterSerey;
        this.connection = require(`@steemit/steem-js`);

        if (false === this.connection.config.get(keyConnBusy)) {
            this.reconnect();
        }
    }

    static getCurrency()
    {
        return `SRD`;
    }

    static getPlaceholders()
    {
        return Object.assign({}, super.getPlaceholders(), constant.sereyPlaceholders);
    }

    static getPercentSteemDollars()
    {
        return 0;
    }

    reconnect() {
        this.connection.api.setOptions({ url: `wss://serey.io/wss` });
        this.connection.config.set(`address_prefix`, `SRY`);
        this.connection.config.set(`chain_id`, `3b9a062c4c1f4338f6932ec8bfc083d99369df7479467bbab1811976181b0daf`);
    }
}

class Weku extends AbstractAdapter
{
    constructor() {
        super();

        this.name = constant.adapterWeku;
        this.connection = require(`@steemit/steem-js`);

        if (false === this.connection.config.get(keyConnBusy)) {
            this.reconnect();
        }
    }

    static getCurrency()
    {
        return `WKD`;
    }

    static getPlaceholders()
    {
        return Object.assign({}, super.getPlaceholders(), constant.wekuPlaceholders);
    }

    static buildJsonMetadata(tags, options)
    {
        let metadata = super.buildJsonMetadata(tags, options);
        metadata[`tags`] = [`community-deals`].concat(tags);

        return metadata;
    }

    reconnect() {
        this.connection.api.setOptions({ url: `wss://news.weku.io:8190` });
        this.connection.config.set(`address_prefix`, `WKA`);
        this.connection.config.set(`chain_id`, `b24e09256ee14bab6d58bfa3a4e47b0474a73ef4d6c47eeea007848195fa085e`);
    }
}

class Smoke extends AbstractAdapter
{
    constructor() {
        super();

        this.name = constant.adapterSmoke;
        this.connection = require(`@steemit/steem-js`);

        if (false === this.connection.config.get(keyConnBusy)) {
            this.reconnect();
        }
    }

    static getCurrency()
    {
        return `SMOKE`;
    }

    static getPlaceholders()
    {
        return Object.assign({}, super.getPlaceholders(), constant.smokePlaceholders);
    }

    reconnect() {
        this.connection.api.setOptions({ url: `https://rpc.smoke.io` });
        this.connection.config.set(`address_prefix`, `SMK`);
        this.connection.config.set(`chain_id`, `1ce08345e61cd3bf91673a47fc507e7ed01550dab841fd9cdb0ab66ef576aaf0`);
    }

    buildOperations(author, postTitle, postBody, tags, options)
    {
        let operations = super.buildOperations(author, postTitle, postBody, tags, options);

        operations.splice(1, 1);

        return operations;
    }
}

class Viz extends AbstractAdapter
{
    constructor() {
        super();

        this.name = constant.adapterViz;
        this.connection = require(`viz-world-js`);
    }

    static getCurrency()
    {
        return `VIZ`;
    }

    static getPlaceholders()
    {
        return Object.assign({}, super.getPlaceholders(), constant.vizPlaceholders);
    }

    static buildJsonMetadata(tags, options)
    {
        let metadata = super.buildJsonMetadata(tags, options)
            , keyLiveBlogs = `as_liveblogs`
        ;

        if (keyLiveBlogs in options && options[keyLiveBlogs]) {
            metadata[`tags`] = tags.concat([`liveblogs`]);
        }

        return metadata;
    }

    static buildBeneficiaries(options)
    {
        let beneficiaries = super.buildBeneficiaries(options)
            , keyLiveBlogs = `as_liveblogs`
        ;

        if (keyLiveBlogs in options && options[keyLiveBlogs]) {
            beneficiaries.push({ account: `denis-skripnik`, weight: 100 });
        }

        return beneficiaries;
    }

    async broadcastSend(wif, author, permlink, operations) {
        while (true === this.connection.config.get(keyConnBusy)) {
            console.info(this.name + `:broadcastSend: wait execution for 1 sec`);

            await sleep(1000);
        }

        this.reconnect();
        let adapterInstance = this;

        adapterInstance.connection.config.set(keyConnBusy, true);
        adapterInstance.connection.api.getContent(author, permlink, 0, function(err, result) {
            if (err) {
                tool.handlePublishError(adapterInstance.name, err);
                adapterInstance.connection.config.set(keyConnBusy, false);

                return;
            }

            if (result[`permlink`] === permlink) {
                permlink = permlink + `-` + Math.floor(Date.now() / 1000);

                operations[0][1][`permlink`] = permlink;
                operations[1][1][`permlink`] = permlink;
            }

            adapterInstance.connection.broadcast.content(
                wif,
                operations[0][1][`parent_author`],
                operations[0][1][`parent_permlink`],
                operations[0][1][`author`],
                operations[0][1][`permlink`],
                operations[0][1][`title`],
                operations[0][1][`body`],
                5000, // curation_percent - 50%
                operations[0][1][`json_metadata`],
                (`extensions` in operations[1][1]) ? operations[1][1][`extensions`] : [],
                function (err, result) {
                    adapterInstance.connection.config.set(keyConnBusy, false);
                    if (!err) {
                        tool.handleSuccessfulPost(adapterInstance.name, result);
                    } else {
                        tool.handlePublishError(adapterInstance.name, err);
                    }
                }
            );
        });
    }

    vote(url, accounts) {
        let params = tool.parsePostUrl(url);

        this.reconnect();
        let adapterInstance = this;

        adapterInstance.connection.api.getContent(params[`author`], params[`permlink`], -1, function(err, result) {
            if (err) {
                tool.handlePublishError(adapterInstance.name, err);

                return;
            }
            if (result.id === 0) {
                tool.handlePublishError(
                    adapterInstance.name,
                    sprintf(
                        `Post with url: "%s" was not found at "%s" chain.`,
                        url,
                        constant.adapterDisplayNames[adapterInstance.name]
                    )
                );

                return;
            }

            for (let i in result.active_votes) {
                if (result.active_votes[i].voter in accounts) {
                    delete accounts[result.active_votes[i].voter];
                }
            }

            if (tool.isEmptyObject(accounts)) {
                tool.handlePublishWarning(adapterInstance.name, `This post were upvoted by chosen accounts earlier.`)

                return;
            }

            let operations = adapterInstance.buildVoteOperations(params[`author`], params[`permlink`], 10000, accounts);

            if (tool.isTest()) {
                console.log(operations, Object.values(accounts));
                tool.finishPublishing();

                return;
            }

            adapterInstance.connection.broadcast.send(
                {'extensions': [], 'operations': operations},
                Object.values(accounts),
                function (err, result) {
                    if (!err) {
                        tool.handleSuccessfulVote(adapterInstance.name, Object.keys(accounts));
                    } else {
                        tool.handlePublishError(adapterInstance.name, err);
                    }
                }
            );
        });
    }
}

function isWif(wif) {
    let golos = require(`golos-js`);

    return golos.auth.isWif(wif);
}

module.exports = {
    isWif: isWif
    , AbstractAdapter: AbstractAdapter
}
