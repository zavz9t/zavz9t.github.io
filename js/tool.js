let sprintf = require(`sprintf-js`).sprintf
    , jQuery = require(`jquery`)
    , htmlToText = require(`html-to-text`)
    , constant = require(`./constant`)
    , ss = require(`sessionstorage`)
    , urlParse = require(`url-parse`)
    , numeral = require(`numeral`)
    , Remarkable = require(`remarkable`)
;

function stripAndTransliterate(input, spaceReplacement, ruPrefix) {
    spaceReplacement = undefined === spaceReplacement ? '-' : spaceReplacement;
    ruPrefix = undefined === ruPrefix ? 'ru--' : ruPrefix;

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
    if (result[result.length - 1] === spaceReplacement) {
        result = result.substring(0, result.length - 1);
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

function isDebug(urlString) {
    urlString = urlString || window.location.href;

    let url = new URL(urlString);

    return url.searchParams.get('debug');
}

function isTerminal() {
    if (!process.stdout) {
        return false;
    } else {
        return process.stdout.isTTY
    }
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

function increasePublishAdapters() {
    let number = ss.getItem(constant.storageKeys.publishAdaptersCount);
    if (!number) {
        number = 1;
    } else {
        number++;
    }
    ss.setItem(constant.storageKeys.publishAdaptersCount, number);
}

function decreasePublishAdapters() {
    let number = ss.getItem(constant.storageKeys.publishAdaptersCount);
    if (!number || 0 === (number * 1)) {
        number = 0;
    } else {
        number--;
    }
    ss.setItem(constant.storageKeys.publishAdaptersCount, number);
}

function resetPublishAdapters() {
    ss.setItem(constant.storageKeys.publishAdaptersCount, 0);
}

function areAdaptersPublishing() {
    let number = ss.getItem(constant.storageKeys.publishAdaptersCount);
    if (0 === (number * 1)) {
        return false;
    } else {
        return true;
    }
}

function startPublishing(buttonElement) {
    resetPublishAdapters();

    jQuery(buttonElement).prop(constant.htmlNames.disabledPropName, true);
    jQuery(buttonElement).addClass(constant.htmlNames.loadingClassName);
}

function finishPublishing(buttonElement) {
    if (!buttonElement) {
        buttonElement = jQuery(constant.htmlNavigation.submitFormButton);
    }

    if (false === areAdaptersPublishing()) {
        buttonElement.prop(constant.htmlNames.disabledPropName, false);
        buttonElement.removeClass(constant.htmlNames.loadingClassName);
    }
}

function handleSuccessfulPost(section, result) {
    decreasePublishAdapters();

    console.info(section, result);

    let funcName = parseFunctionName(arguments.callee.toString())
        , urlFormat = `%s/%s/@%s/%s`
        , vizUrlFormat = `%s/@%s/%s`
        , operation = undefined
    ;

    if (!(section in constant.adapterToHost)) {
        handlePublishWarning(section, sprintf(`%s: Received section "%s" is not implemented yet!`, funcName, section));

        return
    }

    for (let key in result.operations) {
        if (`comment` === result.operations[key][0]) {
            operation = result.operations[key][1];
            break;
        }
        if (`content` === result.operations[key][0]) {
            operation = result.operations[key][1];
            break;
        }
    }

    if (!operation) {
        handlePublishWarning(
            section,
            sprintf(`%s: Operation "comment" or "content" for section "%s" was not found in result.`, funcName, section)
        );

        return;
    }

    let url = sprintf(
        urlFormat,
        constant.adapterToHost[section],
        operation['parent_permlink'],
        operation['author'],
        operation['permlink']
    );
    if (section === constant.adapterViz) {
        url = sprintf(
            vizUrlFormat,
            constant.adapterToHost[section],
            operation['author'],
            operation['permlink']
        );
    }

    jQuery(constant.htmlNavigation.resultBlock).append(
        sprintf(constant.htmlPieces.publishSuccess, section, url)
    );

    finishPublishing();
    scrollTo(constant.htmlNavigation.resultLastItem);
}

function handleSuccessfulVote(section, accounts) {
    console.info(section, accounts);

    jQuery(constant.htmlNavigation.resultBlock).append(
        sprintf(
            constant.htmlPieces.voteSuccess,
            section,
            sprintf(`Post were upvoted by accounts: %s`, JSON.stringify(accounts))
        )
    );

    finishPublishing();
    scrollTo(constant.htmlNavigation.resultLastItem);
}

function handlePublishError(section, error) {
    decreasePublishAdapters();

    console.error(section, error);
    jQuery(constant.htmlNavigation.resultBlock).append(
        sprintf(constant.htmlPieces.publishError, section, error)
    );

    finishPublishing();
    scrollTo(constant.htmlNavigation.resultLastItem);
}

function handlePublishWarning(section, warn) {
    console.warn(warn);
    jQuery(constant.htmlNavigation.resultBlock).append(
        sprintf(constant.htmlPieces.publishWarning, section, warn)
    );

    finishPublishing();
    scrollTo(constant.htmlNavigation.resultLastItem);
}

function scrollTo(selector) {
    jQuery(`html, body`).stop().animate(
        {
            scrollTop: jQuery(selector).offset().top - 160
        },
        1000
    );
}

function getElementSection(element) {
    return jQuery(element).attr(`id`).match(/[^-]+/).toString()
}

function parseFunctionName(rawName) {
    let name = rawName.substr('function '.length); // trim off "function "

    return name.substr(0, name.indexOf('(')); // trim off everything after the function name
}

function parseQueryParams(queryString) {
    if (queryString[0] === `?`) {
        queryString = queryString.slice(1);
    }
    let queryParts = queryString.split(`&`)
        , queryParams = {}
    ;

    for (let i in queryParts) {
        let [key, val] = queryParts[i].split(`=`);
        queryParams[key] = decodeURIComponent(val);
    }

    return queryParams;
}

function parsePostUrl(url) {
    let parsed = urlParse(url)
        , parts = parsed.pathname.split(`/`)
        , queryParams = parseQueryParams(parsed.query)
        , authorIndex = 0
    ;
    if (`author` in queryParams && `permlink` in queryParams) {
        return {
            author: queryParams[`author`]
            , permlink: queryParams[`permlink`]
        };
    }

    for (let i in parts) {
        if (parts[i].length === 0) {
            continue;
        }
        if (parts[i][0] === `@`) {
            authorIndex = i * 1;
            break;
        }
    }
    if (authorIndex === 0) {
        return {};
    }

    return {
        author: parts[authorIndex].slice(1),
        permlink: parts[authorIndex + 1]
    };
}

function isEmptyObject(obj) {
    return jQuery.isEmptyObject(obj);
}

function buildCorsUrl(url) {
    return `https://allorigins.me/get?url=` + encodeURIComponent(url) + `&callback=?`
}

function htmlDecodeString(string) {
    string = string.replace(/<div>/g, `<div>\n`);

    return htmlToText.fromString(string, {
        wordwrap: false
        , preserveNewlines: true
        , format: {
            lineBreak: function (elem, fn, options) {
                return `\n\n`;
            }
        }
    }).trim();
}

function stripHtml(string) {
    let parser = new DOMParser
        , dom = parser.parseFromString(
            `<!doctype html><body>` + string,
            `text/html`
        )
    ;

    return dom.body.textContent;
}

function parseSectionTags(tagsString) {
    let blockSeparator = `|`
        , tagsSeparator = `:`
        , sectionSeparator = `,`
        , parts = tagsString.split(blockSeparator)
        , result = {}
    ;

    for (let k in parts) {
        if (!parts[k]) {
            continue;
        }
        let [section, tags] = parts[k].trim().split(tagsSeparator);

        if (section.includes(sectionSeparator)) {
            let sections = section.split(sectionSeparator);
            for (let i in sections) {
                if (!sections[i]) {
                    continue;
                }
                result[sections[i].trim()] = tags.trim();
            }
        } else {
            result[section.trim()] = tags.trim();
        }
    }

    return result;
}

function getArrayProperty(objects, propertyName) {
    let result = [];
    for (let i in objects) {
        result[i] = objects[i][propertyName];
    }

    return result;
}

function receiveImagesUrlFromText(content) {
    let images = content.match(/(https?:\/\/.*\.(?:png|jpg))/ig);

    return [...new Set(images)];
}

function vestsToPower(account, gp) {
    let totalVestingFundSteem = (`total_vesting_fund_steem` in gp)
            ? parseFloat(gp.total_vesting_fund_steem.split(` `)[0])
            : parseFloat(gp.total_vesting_fund.split(` `)[0])
        , totalVestingShares = parseFloat(gp.total_vesting_shares.split(` `)[0])
        , steemPerVests = 1e6 * totalVestingFundSteem / totalVestingShares
        , accountVests = parseFloat(account.vesting_shares.split(` `)[0]);

    if (`received_vesting_shares` in account) {
        accountVests += parseFloat(account.received_vesting_shares.split(` `)[0])
    }
    if (`delegated_vesting_shares` in account) {
        accountVests -= parseFloat(account.delegated_vesting_shares.split(` `)[0])
    }

    return numeral(accountVests / 1e6 * steemPerVests).format(`0,0.000`);
}

function steemMarkdownToHtml(markdownText) {
    function changeBrTag( html ) {
        return html.replace(/(\r\n\|\r|\n)/gi, `\<br\/\>`);
    }
    function changeYouTubeTag( html ) {
        return html.replace(/https:\/\/youtu.be\/([\w]*)/gi, `\<p\>\<iframe wdith="420" height="315" src="https:\/\/www.youtube.com\/embed\/$1"\>\<\/iframe\>\<\/p\>`);
    }
    function imageSetting(html)
    {
        let html_change = html
            , regex = /(<([^>]+)>)/ig
            , result = html_change.replace(regex, ``)
        ;

        regex = /(https?:\/\/.*\.(?:png|jpg|jpeg)(?:\?[^(?:<|\s)]+)?)/ig;
        let arrMatch = result.match(regex);

        if (arrMatch.length < 1) {
            return html_change
        }
        let uniqueArray = [...new Set(arrMatch)];
        for (let i in uniqueArray) {
            html_change = strReplace(html_change, uniqueArray[i], `<img src="` + uniqueArray[i] + `"/>`)
        }

        return html_change;
    }

    let remarkable = new Remarkable({
        html: true, // remarkable renders first then sanitize runs...
        breaks: true,
        linkify: false, // linkify is done locally
        typographer: false, // https://github.com/jonschlinkert/remarkable/issues/142#issuecomment-221546793
        quotes: `“”‘’`,
    });

    let renderedText = remarkable.render(markdownText);
    // If content isn't wrapped with an html element at this point, add it.
    if (renderedText.indexOf(`<html>`) !== 0) {
        renderedText = `<html>` + renderedText + `</html>`;
    }

    return changeYouTubeTag(changeBrTag(imageSetting(renderedText)));
}

function strReplace(string, orig, replace) {
    let index = string.indexOf(orig);

    if (index < 0) {
        return string;
    }

    do {
        string = string.replace(orig, replace);
    } while((index = string.indexOf(string, index + replace.length)) > -1);

    return string;
}

module.exports = {
    stripAndTransliterate: stripAndTransliterate
    , stripAccount: stripAccount
    , stripWif: stripWif
    , buildDefaultPermlink: buildDefaultPermlink
    , isTest: isTest
    , isDebug: isDebug
    , isTerminal: isTerminal
    , handleTags: handleTags
    , stripPlaceholders: stripPlaceholders
    , scrollTo: scrollTo
    , increasePublishAdapters: increasePublishAdapters
    , decreasePublishAdapters: decreasePublishAdapters
    , areAdaptersPublishing: areAdaptersPublishing
    , resetPublishAdapters: resetPublishAdapters
    , startPublishing: startPublishing
    , finishPublishing: finishPublishing
    , handleSuccessfulPost: handleSuccessfulPost
    , handleSuccessfulVote: handleSuccessfulVote
    , handlePublishWarning: handlePublishWarning
    , handlePublishError: handlePublishError
    , getElementSection: getElementSection
    , parseFunctionName: parseFunctionName
    , parseQueryParams: parseQueryParams
    , parsePostUrl: parsePostUrl
    , isEmptyObject: isEmptyObject
    , buildCorsUrl: buildCorsUrl
    , htmlDecodeString: htmlDecodeString
    , stripHtml: stripHtml
    , parseSectionTags: parseSectionTags
    , getArrayProperty: getArrayProperty
    , receiveImagesUrlFromText: receiveImagesUrlFromText
    , vestsToPower: vestsToPower
    , steemMarkdownToHtml: steemMarkdownToHtml
    , strReplace: strReplace
}
