let sprintf = require(`sprintf-js`).sprintf
    , jQuery = require(`jquery`)
;

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

function getElementSection(element) {
    return jQuery(element).attr(`id`).match(/[^-]+/).toString()
}

module.exports = {
    stripAndTransliterate: stripAndTransliterate,
    stripAccount: stripAccount,
    stripWif: stripWif,
    buildDefaultPermlink: buildDefaultPermlink,
    isTest: isTest,
    handleTags: handleTags,
    stripPlaceholders: stripPlaceholders,
    handleSuccessfulPost: handleSuccessfulPost,
    handlePublishError: handlePublishError,
    getElementSection: getElementSection
}
