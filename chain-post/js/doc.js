const htmlAccountsList = `accounts-list`
    , htmlUsername = `username`
    , htmlWif = `wif`
;

let sprintf = require(`sprintf-js`).sprintf
    , jQuery = require(`jquery`)
    , urlParse = require(`url-parse`)
    , tool = require(`../../js/tool`)
    , Storage = require(`../../js/storage`).Storage
    , AbstractAdapter = require(`../../js/adapter`).AbstractAdapter
    , constant = require(`../../js/constant`)
;

function addSections(sections) {
    let funcName = tool.parseFunctionName(arguments.callee.toString());
    if (!sections || sections.length < 1) {
        console.info(funcName + `: No sections was received.`);

        return;
    }
    let containerId = `form`
        , container = jQuery(`#` + containerId)
    ;
    if (!container || container.length < 1) {
        console.info(sprintf(`%s: Container by id "%s" was not found.`, funcName, containerId));

        return;
    }
    for (let k in sections) {
        let html = sprintf(
                constant.htmlPieces.adapterSection,
                k,
                sections[k][`title`],
                sections[k][`title_style`],
                constant.adapterToHost[k]
            )
            , appendKey = `append_html`
        ;
        if (appendKey in sections[k]) {
            html += sections[k][appendKey];
        }
        jQuery(container).append(html);
    }
}

function fillAccountsList() {
    jQuery(sprintf(`.%s`, htmlAccountsList)).each(function() {
        let section = tool.getElementSection(this)
            , accounts = Storage.getAccounts(section)
        ;

        if (!accounts) {
            return;
        }

        accounts.sort();
        for (let k in accounts) {
            addAccountToList(section, accounts[k])
        }
    });
}

function addAccountToList(section, username, check) {
    let item = jQuery(sprintf(`#%s-%s`, section, htmlAccountsList))
        , contain = false
    ;

    item.children().each(function () {
        if (jQuery(this).attr(`value`) === username) {
            contain = true;
        }
    });

    if (false === contain) {
        item.append(
            sprintf(`<option value="%1$s">%1$s</option>`, username)
        );
        if (check) {
            item.val(username);
        }
    } else if (check) {
        item.val(username);
    }
}

function setHandlerAddAccount($) {
    $(`.btn-add-account`).on(`click`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        let element = jQuery(this)
            , section = tool.getElementSection(this)
            , usernameItem = jQuery(sprintf(`#%s-%s`, section, htmlUsername))
            , wifItem = jQuery(sprintf(`#%s-%s`, section, htmlWif))
        ;

        element.prop(constant.htmlNames.disabledPropName, true);

        usernameItem.removeClass(constant.htmlNames.invalidClassName);
        wifItem.removeClass(constant.htmlNames.invalidClassName);

        let dataValid = true
            , username = usernameItem.val()
            , wif = wifItem.val();

        if (!username) {
            usernameItem.addClass(constant.htmlNames.invalidClassName);
            dataValid = false;
        }
        if (!wif || false === AbstractAdapter.factory(constant.adapterGolos).isWif(wif)) {
            wifItem.addClass(constant.htmlNames.invalidClassName);
            dataValid = false;
        }
        if (false === dataValid) {
            element.prop(constant.htmlNames.disabledPropName, false);

            return false;
        }

        AbstractAdapter.factory(section).isWifValid(
            username,
            wif,
            function (section, username, wif) {
                Storage.addAccount(section, username, wif);

                addAccountToList(section, username, true);

                element.prop(constant.htmlNames.disabledPropName, false);
                console.info(section, `User WIF is correct.`);
            },
            function (msg) {
                console.error(msg);

                element.prop(constant.htmlNames.disabledPropName, false);
                wifItem.addClass(constant.htmlNames.invalidClassName);
            }
        );

        gtag(
            `event`,
            `add-account`,
            {
                event_category: `chain-post`,
                event_value: section
            }
        );
    });
}

function setHandlerChangeAccount() {
    jQuery(sprintf(`.%s`, htmlAccountsList)).on(`change`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        let section = tool.getElementSection(this)
            , usernameItem = jQuery(sprintf(`#%s-%s`, section, htmlUsername))
            , wifItem = jQuery(sprintf(`#%s-%s`, section, htmlWif))
        ;

        usernameItem.removeClass(constant.htmlNames.invalidClassName);
        wifItem.removeClass(constant.htmlNames.invalidClassName);

        let username = jQuery(this).val();

        if (!username) {
            usernameItem.val(``);
            wifItem.val(``);

            return false;
        }

        let wif = Storage.getAccountWif(section, username);
        usernameItem.val(username);
        wifItem.val(wif);
    });
}

function setHandlerChangeGolosVik() {
    jQuery(constant.htmlNavigation.golosVik).on(`change`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (jQuery(this).is(`:checked`)) {
            jQuery(constant.htmlNavigation.golosVikValue).val(10);
            jQuery(constant.htmlNavigation.golosVikSettings).removeClass(constant.htmlNames.invisibleClassName);
        } else {
            jQuery(constant.htmlNavigation.golosVikValue).val(``);
            jQuery(constant.htmlNavigation.golosVikSettings).addClass(constant.htmlNames.invisibleClassName);
        }
    });
}

function setHandlerPostPublish($, sections) {
    $(constant.htmlNavigation.submitForm).on(`submit`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        let buttonElement = $(constant.htmlNavigation.submitFormButton)
            , dataValid = true
            , usernamePattern = `#%s-username`
            , wifPattern = `#%s-wif`
            , postTitleElement = $(constant.htmlNavigation.titleBlock)
            , postTitle = postTitleElement.val().trim()
            , postBodyElement = $(constant.htmlNavigation.bodyBlock)
            , postBody = postBodyElement.val()
            , tagsPattern = `#%s-tags`
            , postTagsElement = $(constant.htmlNavigation.tagsBlock)
            , defaultTags = tool.handleTags(postTagsElement.val().trim())
            , imagesValue = $(constant.htmlNavigation.imagesBlock).val()
        ;
        if (imagesValue) {
            imagesValue = JSON.parse(imagesValue);
        } else {
            imagesValue = tool.receiveImagesUrlFromText(postBody);
        }

        tool.startPublishing(buttonElement);

        postTitleElement.removeClass(constant.htmlNames.invalidClassName);
        postBodyElement.removeClass(constant.htmlNames.invalidClassName);
        postTagsElement.removeClass(constant.htmlNames.invalidClassName);

        // validation
        if (!postTitle) {
            postTitleElement.addClass(constant.htmlNames.invalidClassName);
            tool.scrollTo(constant.htmlNavigation.titleBlock);
            dataValid = false;
        }
        if (!postBody) {
            postBodyElement.addClass(constant.htmlNames.invalidClassName);
            if (dataValid) {
                tool.scrollTo(constant.htmlNavigation.bodyBlock);
            }
            dataValid = false;
        }
        if (!defaultTags || defaultTags.length < 1) {
            postTagsElement.addClass(constant.htmlNames.invalidClassName);
            if (dataValid) {
                tool.scrollTo(constant.htmlNavigation.tagsBlock);
            }
            dataValid = false;
        }
        if (false === dataValid) {
            tool.finishPublishing();

            return;
        }

        tool.scrollTo(constant.htmlNavigation.resultBlock);

        // publishing
        for (let section in sections) {
            let sectionAuthor = tool.stripAccount($(sprintf(usernamePattern, section)).val())
                , sectionWif = tool.stripWif($(sprintf(wifPattern, section)).val())
                , sectionTags = tool.handleTags($(sprintf(tagsPattern, section)).val())
            ;

            if (sectionAuthor && sectionWif) {
                tool.increasePublishAdapters();

                let adapterObj = AbstractAdapter.factory(section)
                    , sectionOptions = {images: imagesValue}
                ;

                if (sections[section] && sections[section].length > 0) {
                    for (let i in sections[section]) {
                        let optionValue = null
                            , optionElement = $(`#` + sections[section][i][`html_id`])
                        ;
                        switch (sections[section][i][`type`]) {
                            case `checkbox`:
                                optionValue = optionElement.is(`:checked`);
                                break;
                            case `int`:
                                optionValue = optionElement.val() * 1;
                                break;
                            case `text`:
                                optionValue = optionElement.val();
                                break;
                            default:
                                throw sprintf(`Option type "%s" is not implemented yet...`, sections[section][i][`type`]);
                        }
                        sectionOptions[sections[section][i][`key`]] = optionValue;
                    }
                }

                adapterObj.publish(
                    sectionWif,
                    sectionAuthor,
                    postTitle,
                    postBody,
                    sectionTags ? sectionTags : defaultTags,
                    sectionOptions
                );

                gtag(
                    `event`
                    , `post-publish`
                    , {
                        event_category: `chain-post`
                        , event_value: section
                    }
                );
            }
        }

        tool.finishPublishing();
    });
}

function setHandlerLoadFacebook($) {
    $(constant.htmlNavigation.facebookLoadForm).on(`submit`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        formElementsReset($);

        let inputElement = $(this).find(`input`)
            , facebookUrl = inputElement.val()
                .replace(`www.facebook.com`, `m.facebook.com`)
                .replace(`/posts/pcb.`, `/posts/`)
                .replace(`/posts/`, `/posts/pcb.`)
            , photoUrl = null
            , buttonElement = $(this).find(`.btn-primary`)
            , onePhotoMode = false
            , defaultTags = `facebook`
            , queryParams = tool.parseQueryParams(urlParse(facebookUrl).query)
        ;

        buttonElement.prop(constant.htmlNames.disabledPropName, true);

        if (facebookUrl.startsWith(`https://m.facebook.com/photo.php`)) {
            onePhotoMode = true;
        }
        if (`substory_index` in queryParams && facebookUrl.startsWith(`https://m.facebook.com/story.php`)) {
            facebookUrl = sprintf(`https://m.facebook.com/photo.php?fbid=%s`, queryParams.story_fbid);
            onePhotoMode = true;
        }
        if (
            facebookUrl.startsWith(`https://m.facebook.com/permalink.php`)
            || facebookUrl.startsWith(`https://m.facebook.com/story.php`)
        ) {
            let urlPattern = `https://m.facebook.com/%s/posts/pcb.%s/`;

            facebookUrl = sprintf(urlPattern, queryParams.id, queryParams.story_fbid);
        }
        if (false === facebookUrl.includes(`locale=`)) {
            let localeString = `locale=ru_RU`;
            if (facebookUrl.endsWith(`/`)) {
                localeString = `?` + localeString;
            } else {
                localeString = `&` + localeString;
            }
            facebookUrl += localeString;
        }

        function fbOnePhotoProcess(config) {
            let el = $( `<div></div>` );
            el.html(config.content[`__html`]);

            let voiceElement = $(`#voice_replace_id`, el)
                , postTitle = voiceElement.text().replace(`—`, ``).trim()
            ;
            voiceElement.remove();

            // remove smiles images
            $(`img.img`, el).each(function() {
                $(this).remove();
            });

            let postBody = $(`.msg div`, el).html().replace(/<br>/g, `<br /><br />`);
            if (postBody) {
                postBody = sprintf(
                    constant.htmlPieces.facebookPostBodyPattern,
                    postBody,
                    sprintf(constant.htmlPieces.facebookPhotoPattern, photoUrl),
                    facebookUrl.replace(`m.facebook.com`, `www.facebook.com`)
                );
            }

            fbFillSubmitFormAndCloseModal(
                postTitle,
                postBody,
                defaultTags,
                JSON.stringify([photoUrl.replace(/&amp;/g, `&`)])
            );
        }
        function fbStoryProcess(content) { // permalink
            let postTitle = ``
                , postBody = ``
                , postImages = ``
            ;

            let textTitles = content.match(/"title":{"text":"(.+?)","/g)
                , titles = []
            ;
            for (let i in textTitles) {
                let titleObj = JSON.parse(sprintf(`{%s}}`, textTitles[i].slice(0, -2)));

                titles.push(titleObj.title.text);
            }
            if (titles.length > 1) {
                postTitle = titles[1];
            } else if (titles.length > 0) {
                postTitle = titles[0];
            }

            let images = content.match(/"full_width_image":{"uri":"(.+?)"/g)
                , imagesUrls = []
            ;
            for (let i in images) {
                let imageObj = JSON.parse(sprintf(`{%s}}`, images[i]));

                imagesUrls.push(imageObj.full_width_image.uri);
            }
            if (imagesUrls.length > 0) {
                postImages = JSON.stringify(imagesUrls);
                imagesUrls.forEach(function(element, index, theArray) {
                    theArray[index] = sprintf(constant.htmlPieces.facebookPhotoPattern, element);
                });
            }

            let textBody = content.match(/"message":{"text":"(.+?)","/);
            if (textBody && textBody.length > 1) {
                let textObj = JSON.parse(sprintf(`{"body":"%s"}`, textBody[1]));

                postBody = sprintf(
                    constant.htmlPieces.facebookPostBodyPattern,
                    textObj.body,
                    imagesUrls.join(`\n\n`),
                    facebookUrl.replace(`m.facebook.com`, `www.facebook.com`).replace(`/posts/pcb.`, `/posts/`)
                );
            }

            fbFillSubmitFormAndCloseModal(postTitle, postBody, defaultTags, postImages);
        }
        function fbFillSubmitFormAndCloseModal(title, body, tags, images) {
            fillPostForm(title, body, tags, images);

            $(`#facebookModal .close`).trigger(`click`);
            inputElement.val(``);
            buttonElement.prop(constant.htmlNames.disabledPropName, false);
        }

        $.getJSON(
            tool.buildCorsUrl(facebookUrl),
            function(data) {
                if (onePhotoMode) {
                    let el = $(`<div></div>`);
                    el.html(data.contents);

                    photoUrl = $(`meta[property="og:image"]`, el).attr(`content`);

                    let fbData = $(`script:contains('require("MRenderingScheduler").getInstance().schedule({"id":"MPhotoContent"')`, el)
                        .text()
                        .replace(
                            `require("MRenderingScheduler").getInstance().schedule`,
                            `fbOnePhotoProcess`
                        )
                    ;

                    eval(fbData);
                } else {
                    fbStoryProcess(data.contents);
                }
            }
        );

        gtag(
            `event`,
            `load-facebook`,
            { event_category: `chain-post` }
        );
    });
}

function setHandlerLoadEvernote($) {
    $(constant.htmlNavigation.evernoteLoadForm).on(`submit`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        formElementsReset($);

        let inputElement = $(this).find(`input`)
            , url = inputElement.val()
            , buttonElement = $(this).find(`.btn-primary`)
            , sharedNotePrefix = `https://www.evernote.com/shard/`
            , defaultTags = `evernote`
            , tagsSeparator = `---tags---`
        ;

        if (false === url.startsWith(sharedNotePrefix)) {
            console.error(sprintf(
                `Received url "%s" is not shared Evernote note. It should starts by "%s" string.`
                , url
                , sharedNotePrefix
            ));

            return;
        }

        function evernoteFillSubmitFormAndCloseModal(title, body, tags, sectionTags) {
            fillPostForm(title, body, tags, ``, sectionTags);

            $(`#evernoteModal .close`).trigger(`click`);
            inputElement.val(``);
            buttonElement.prop(constant.htmlNames.disabledPropName, false);
        }

        buttonElement.prop(constant.htmlNames.disabledPropName, true);

        let [stripUrl] = url.split(`?`)
            , urlSuffix = `?json=1&rdata=0`
        ;

        $.getJSON(
            tool.buildCorsUrl(stripUrl + urlSuffix),
            function(data) {
                let jsonData = JSON.parse(data.contents)
                    , postTitle = ``
                    , postBody = ``
                    , tagsList = []
                ;

                if (`title` in jsonData) {
                    postTitle = jsonData.title;
                } else {
                    console.warn(`Evernote: cannot find note title`)
                }

                if (!(`content` in jsonData)) {
                    console.warn(`Evernote: cannot find note content`);

                    evernoteFillSubmitFormAndCloseModal(
                        postTitle,
                        postBody,
                        defaultTags,
                        tagsList
                    );

                    return;
                }

                let el = $(`<div></div>`);
                el.html(jsonData.content);

                [postBody, tagsList] = $(`en-note`, el).html().split(tagsSeparator);

                evernoteFillSubmitFormAndCloseModal(
                    postTitle,
                    tool.htmlDecodeString(postBody),
                    defaultTags,
                    tool.parseSectionTags(tool.stripHtml(tagsList))
                );
            }
        );

        gtag(
            `event`,
            `load-evernote`,
            { event_category: `chain-post` }
        );
    });
}

function setHandlerLoadChainPost($) {
    $(constant.htmlNavigation.chainLoadForm).on(`submit`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        formElementsReset($);

        let inputElement = $(this).find(`input`)
            , url = inputElement.val()
            , selectElement = $(this).find(`select`)
            , section = selectElement.val()
            , buttonElement = $(this).find(`.btn-primary`)
        ;

        if (!url || !section) {
            console.error(sprintf(`URL or chain was not set. URL: "%s", Chain: "%s".`, url, section));

            return;
        }

        function chainFillSubmitFormAndCloseModal(title, body, tags, images) {
            fillPostForm(title, body, tags, images);

            $(`#chainModal .close`).trigger(`click`);
            inputElement.val(``);
            selectElement.val(``);
            buttonElement.prop(constant.htmlNames.disabledPropName, false);
        }

        buttonElement.prop(constant.htmlNames.disabledPropName, true);

        AbstractAdapter.factory(section).processContent(url, chainFillSubmitFormAndCloseModal);

        gtag(
            `event`,
            `load-chain-post`,
            { event_category: `chain-post` }
        );
    });
}

function setHandlerShowPostPreview($) {
    $(constant.htmlNavigation.postPreviewModal).on(`show.bs.modal`, function(e) {
        let postTitle = $(constant.htmlNavigation.titleBlock).val()
            , postBody = $(constant.htmlNavigation.bodyBlock).val()
            , postTags = $(constant.htmlNavigation.tagsBlock).val()
            , titleBlock = $(constant.htmlNavigation.postPreviewModalTitle)
            , bodyBlock = $(constant.htmlNavigation.postPreviewModalBody)
            , tagsBlock = $(constant.htmlNavigation.postPreviewModalTags)
        ;

        titleBlock.text(postTitle);
        bodyBlock.html(tool.steemMarkdownToHtml(AbstractAdapter.factory(`steem`).buildPostBody(postBody)));
        tagsBlock.text(postTags);

        gtag(
            `event`,
            `show-post-preview`,
            { event_category: `chain-post` }
        );
    });
}

function setHandlerSubmitFormButton($) {
    $(constant.htmlNavigation.submitFormButton).on(`click`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        $(constant.htmlNavigation.submitForm).trigger(`submit`);
    });
}

function setHandlerResetFormButton($) {
    $(constant.htmlNavigation.resetFormButton).on(`click`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        gtag(
            `event`,
            `reset-form`,
            { event_category: `chain-post` }
        );

        location.reload();
    });
}

function setHandlerResetAccountsButton($) {
    $(constant.htmlNavigation.resetAccountsButton).on(`click`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        $(constant.htmlNavigation.accountsResetElements).each(function() {
            $(this).val(``);
        })

        gtag(
            `event`,
            `reset-accounts`,
            { event_category: `chain-post` }
        );
    });
}

function formElementsReset($) {
    // reset previous values for Form elements
    $(constant.htmlNavigation.formResetElements).val(``);
}

function fillPostForm(title, body, tags, images, sectionTags) {
    $(constant.htmlNavigation.titleBlock).val(title);
    $(constant.htmlNavigation.bodyBlock).val(body);
    $(constant.htmlNavigation.tagsBlock).val(tags);
    $(constant.htmlNavigation.imagesBlock).val(images);

    if (!sectionTags) {
        return;
    }
    for (let section in sectionTags) {
        $(sprintf(constant.htmlNavigation.sectionTagsPattern, section)).val(sectionTags[section]);
    }
}

module.exports = {
    addSections: addSections
    , fillAccountsList: fillAccountsList
    , setHandlerAddAccount: setHandlerAddAccount
    , setHandlerChangeAccount: setHandlerChangeAccount
    , setHandlerChangeGolosVik: setHandlerChangeGolosVik
    , setHandlerPostPublish: setHandlerPostPublish
    , setHandlerLoadFacebook: setHandlerLoadFacebook
    , setHandlerLoadEvernote: setHandlerLoadEvernote
    , setHandlerLoadChainPost: setHandlerLoadChainPost
    , setHandlerShowPostPreview: setHandlerShowPostPreview
    , setHandlerSubmitFormButton: setHandlerSubmitFormButton
    , setHandlerResetFormButton: setHandlerResetFormButton
    , setHandlerResetAccountsButton: setHandlerResetAccountsButton
}
