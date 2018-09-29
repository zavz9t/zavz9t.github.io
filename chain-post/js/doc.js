const htmlAccountsList = `accounts-list`
    , htmlUsername = `username`
    , htmlWif = `wif`
;

let sprintf = require(`sprintf-js`).sprintf
    , jQuery = require(`jquery`)
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
        , htmlSection = `
            <hr />

            <h3 class="mx-auto" style="%3$s">%2$s Account</h3>

            <div class="form-group">
                <input type="text" class="form-control" id="%1$s-tags" placeholder="Optional: Specify tags for %2$s (will replace previous)" />
            </div>

            <div class="form-group">
                <select id="%1$s-accounts-list" class="form-control accounts-list">
                    <option value="" selected>Choose or fill new one 👇</option>
                </select>
            </div>

            <div class="form-row">
                <div class="form-group col-md-4">
                    <div class="input-group">
                        <div class="input-group-prepend">
                            <div class="input-group-text">@</div>
                        </div>
                        <input type="text" class="form-control" id="%1$s-username" placeholder="Enter your %2$s username">
                        <div class="invalid-feedback">
                            Username cannot be blank.
                        </div>
                    </div>
                </div>
                <div class="form-group col-md-6">
                    <input type="password" class="form-control" id="%1$s-wif" placeholder="WIF (Posting key)" />
                    <div class="invalid-feedback">
                        WIF is empty or has invalid value.
                    </div>
                </div>
                <div class="form-group col-md-2">
                    <button id="%1$s-add-account" class="btn btn-add-account btn-outline-success">Add to list 👆</button>
                </div>
            </div>
        `;
    ;
    if (!container || container.length < 1) {
        console.log(sprintf(`%s: Container by id "%s" was not found.`, funcName, containerId));

        return;
    }
    for (let k in sections) {
        let html = sprintf(
                htmlSection,
                k,
                sections[k][`title`],
                sections[k][`title_style`]
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

        element.prop(constant.htmlDisabledPropName, true);

        usernameItem.removeClass(constant.htmlInvalidClass);
        wifItem.removeClass(constant.htmlInvalidClass);

        let dataValid = true
            , username = usernameItem.val()
            , wif = wifItem.val();

        if (!username) {
            usernameItem.addClass(constant.htmlInvalidClass);
            dataValid = false;
        }
        if (!wif || false === adapter.isWif(wif)) {
            wifItem.addClass(constant.htmlInvalidClass);
            dataValid = false;
        }
        if (false === dataValid) {
            element.prop(constant.htmlDisabledPropName, false);

            return false;
        }

        adapter.AbstractAdapter.factory(section).isWifValid(
            username,
            wif,
            function (section, username, wif) {
                Storage.addAccount(section, username, wif);

                addAccountToList(section, username, true);

                element.prop(constant.htmlDisabledPropName, false);
                console.log(section, `User WIF is correct.`);
            },
            function (msg) {
                console.error(msg);

                element.prop(constant.htmlDisabledPropName, false);
                wifItem.addClass(constant.htmlInvalidClass);
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

        usernameItem.removeClass(constant.htmlInvalidClass);
        wifItem.removeClass(constant.htmlInvalidClass);

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

function setHandlerPostPublish(sections) {
    jQuery(`#form`).on(`submit`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        let buttonElement = jQuery(this).find(`.btn-primary`)
            , dataValid = true
            , usernamePattern = `#%s-username`
            , wifPattern = `#%s-wif`
            , postTitleElement = jQuery(`#title`)
            , postTitle = postTitleElement.val().trim()
            , postBodyElement = jQuery(`#body`)
            , postBody = postBodyElement.val()
            , tagsPattern = `#%s-tags`
            , postTagsElement = jQuery(`#tags`)
            , defaultTags = tool.handleTags(postTagsElement.val().trim())
        ;

        buttonElement.prop(constant.htmlDisabledPropName, true);

        postTitleElement.removeClass(constant.htmlInvalidClass);
        postBodyElement.removeClass(constant.htmlInvalidClass);
        postTagsElement.removeClass(constant.htmlInvalidClass);

        // validation
        if (!postTitle) {
            jQuery(postTitleElement).addClass(constant.htmlInvalidClass);
            dataValid = false;
        }
        if (!postBody) {
            postBodyElement.addClass(constant.htmlInvalidClass);
            dataValid = false;
        }
        if (!defaultTags || defaultTags.length < 1) {
            postTagsElement.addClass(constant.htmlInvalidClass);
            dataValid = false;
        }
        if (false === dataValid) {
            buttonElement.prop(constant.htmlDisabledPropName, false);

            return;
        }

        // publishing
        for (let section in sections) {
            let sectionAuthor = tool.stripAccount(jQuery(sprintf(usernamePattern, section)).val())
                , sectionWif = tool.stripWif(jQuery(sprintf(wifPattern, section)).val())
                , sectionTags = tool.handleTags(jQuery(sprintf(tagsPattern, section)).val())
            ;

            if (sectionAuthor && sectionWif) {
                let adapterObj = adapter.AbstractAdapter.factory(section)
                    , sectionOptions = {}
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

        buttonElement.prop(constant.htmlDisabledPropName, false);
    });
}

module.exports = {
    addSections: addSections
    , fillAccountsList: fillAccountsList
    , setHandlerAddAccount: setHandlerAddAccount
    , setHandlerChangeAccount: setHandlerChangeAccount
    , setHandlerPostPublish: setHandlerPostPublish
}
