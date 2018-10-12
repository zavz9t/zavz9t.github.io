const htmlAccountsList = `accounts-list`
    , htmlUsername = `username`
    , htmlWif = `wif`
;

let sprintf = require(`sprintf-js`).sprintf
    , jQuery = require(`jquery`)
    , urlParse = require(`url-parse`)
    , tool = require(`./tool`)
    , Storage = require(`./storage`).Storage
    , adapter = require(`./adapter`)
    , constant = require(`./constant`)
;

function addSections(sections) {
    let funcName = tool.parseFunctionName(arguments.callee.toString());
    if (!sections || sections.length < 1) {
        console.log(funcName + `: No sections was received.`);

        return;
    }
    let containerId = `form`
        , container = jQuery(`#` + containerId)
    ;
    if (!container || container.length < 1) {
        console.log(sprintf(`%s: Container by id "%s" was not found.`, funcName, containerId));

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

function setHandlerAddAccount() {
    jQuery(`.btn-add-account`).on(`click`, function(e) {
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
        if (!wif || false === adapter.isWif(wif)) {
            wifItem.addClass(constant.htmlNames.invalidClassName);
            dataValid = false;
        }
        if (false === dataValid) {
            element.prop(constant.htmlNames.disabledPropName, false);

            return false;
        }

        adapter.AbstractAdapter.factory(section).isWifValid(
            username,
            wif,
            function (section, username, wif) {
                Storage.addAccount(section, username, wif);

                addAccountToList(section, username, true);

                element.prop(constant.htmlNames.disabledPropName, false);
                console.log(section, `User WIF is correct.`);
            },
            function (msg) {
                console.error(msg);

                element.prop(constant.htmlNames.disabledPropName, false);
                wifItem.addClass(constant.htmlNames.invalidClassName);
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

function setHandlerPostPublish(sections) {
    jQuery(`#form`).on(`submit`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        let buttonElement = jQuery(constant.htmlNavigation.submitButton)
            , dataValid = true
            , usernamePattern = `#%s-username`
            , wifPattern = `#%s-wif`
            , postTitleElement = jQuery(constant.htmlNavigation.titleBlock)
            , postTitle = postTitleElement.val().trim()
            , postBodyElement = jQuery(constant.htmlNavigation.bodyBlock)
            , postBody = postBodyElement.val()
            , tagsPattern = `#%s-tags`
            , postTagsElement = jQuery(constant.htmlNavigation.tagsBlock)
            , defaultTags = tool.handleTags(postTagsElement.val().trim())
            , imagesValue = jQuery(constant.htmlNavigation.imagesBlock).val()
        ;
        if (imagesValue) {
            imagesValue = JSON.parse(imagesValue);
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
            let sectionAuthor = tool.stripAccount(jQuery(sprintf(usernamePattern, section)).val())
                , sectionWif = tool.stripWif(jQuery(sprintf(wifPattern, section)).val())
                , sectionTags = tool.handleTags(jQuery(sprintf(tagsPattern, section)).val())
            ;

            if (sectionAuthor && sectionWif) {
                tool.increasePublishAdapters();

                let adapterObj = adapter.AbstractAdapter.factory(section)
                    , sectionOptions = {images: imagesValue}
                ;

                if (sections[section] && sections[section].length > 0) {
                    for (let i in sections[section]) {
                        let optionValue = null
                            , optionElement = jQuery(`#` + sections[section][i][`html_id`])
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
            }
        }

        tool.finishPublishing();
    });
}

function setHandlerLoadFacebook() {
    jQuery(constant.htmlNavigation.facebookLoadForm).on(`submit`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        let inputElement = jQuery(this).find(`input`)
            , facebookUrl = inputElement.val().replace(`www.facebook.com`, `m.facebook.com`)
            , photoUrl = null
            , buttonElement = jQuery(this).find(`.btn-primary`)
            , onePhotoMode = false
            , defaultTags = `facebook`
        ;

        buttonElement.prop(constant.htmlNames.disabledPropName, true);

        if (facebookUrl.startsWith(`https://m.facebook.com/photo.php`)) {
            onePhotoMode = true;
        }
        if (facebookUrl.startsWith(`https://m.facebook.com/permalink.php`)) {
            let parsed = urlParse(facebookUrl)
                , queryParts = parsed.query.slice(1).split(`&`)
                , queryParams = {}
                , urlPattern = `https://m.facebook.com/%s/posts/pcb.%s/`
            ;

            for (let i in queryParts) {
                let [key, val] = queryParts[i].split(`=`);
                queryParams[key] = decodeURIComponent(val);
            }

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
            // console.log(config);

            let el = jQuery( `<div></div>` );
            el.html(config.content[`__html`]);

            let voiceElement = jQuery(`#voice_replace_id`, el)
                , postTitle = voiceElement.text().replace(`—`, ``).trim()
            ;
            voiceElement.remove();

            // remove smiles images
            jQuery(`img.img`, el).each(function() {
                jQuery(this).remove();
            });

            let postBody = jQuery(`.msg div`, el).html().replace(/<br>/g, `<br /><br />`);
            if (postBody) {
                postBody = sprintf(
                    constant.htmlPieces.facebookPostBodyPattern,
                    postBody,
                    photoUrl,
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
        function fbStoryProcess(content) {
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
            }

            let textBody = content.match(/"message":{"text":"(.+?)","/);
            if (textBody && textBody.length > 1) {
                let textObj = JSON.parse(sprintf(`{"body":"%s"}`, textBody[1]));

                postBody = sprintf(
                    constant.htmlPieces.facebookPostBodyPattern,
                    textObj.body,
                    imagesUrls.join(`\n\n`),
                    facebookUrl.replace(`m.facebook.com`, `www.facebook.com`)
                );
            }

            fbFillSubmitFormAndCloseModal(postTitle, postBody, defaultTags, postImages);
        }
        function fbFillSubmitFormAndCloseModal(title, body, tags, images) {
            jQuery(constant.htmlNavigation.titleBlock).val(title);
            jQuery(constant.htmlNavigation.bodyBlock).val(body);
            jQuery(constant.htmlNavigation.tagsBlock).val(tags);
            jQuery(constant.htmlNavigation.imagesBlock).val(images);

            jQuery(`#facebookModal .close`).trigger(`click`);
            inputElement.val(``);
            buttonElement.prop(constant.htmlNames.disabledPropName, false);
        }

        jQuery.getJSON(
            `https://allorigins.me/get?url=` + encodeURIComponent(facebookUrl) + `&callback=?`,
            function(data) {
                if (onePhotoMode) {
                    let el = jQuery(`<div></div>`);
                    el.html(data.contents);

                    photoUrl = jQuery(`meta[property="og:image"]`, el).attr(`content`).replace(/&/g, `&amp;`);

                    let fbData = jQuery(`script:contains('require("MRenderingScheduler").getInstance().schedule({"id":"MPhotoContent"')`, el)
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
    });
}

function setHandlerResetButton() {
    jQuery(constant.htmlNavigation.resetButton).on(`click`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        location.reload();
    });
}

module.exports = {
    addSections: addSections
    , fillAccountsList: fillAccountsList
    , setHandlerAddAccount: setHandlerAddAccount
    , setHandlerChangeAccount: setHandlerChangeAccount
    , setHandlerChangeGolosVik: setHandlerChangeGolosVik
    , setHandlerPostPublish: setHandlerPostPublish
    , setHandlerLoadFacebook: setHandlerLoadFacebook
    , setHandlerResetButton: setHandlerResetButton
}
