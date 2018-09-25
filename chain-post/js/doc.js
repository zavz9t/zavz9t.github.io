const htmlAccountsList = `accounts-list`
    , htmlUsername = `username`
    , htmlWif = `wif`
;

let sprintf = require(`sprintf-js`).sprintf
    , jQuery = require(`jquery`)
    , tool = require(`./tool`)
    , Storage = require(`./storage`).Storage
    , adapter = require(`./adapter`)
;

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

        let invalidClass = `is-invalid`
            , section = tool.getElementSection(this)
            , usernameItem = jQuery(sprintf(`#%s-%s`, section, htmlUsername))
            , wifItem = jQuery(sprintf(`#%s-%s`, section, htmlWif))
        ;

        usernameItem.removeClass(invalidClass);
        wifItem.removeClass(invalidClass);

        let dataValid = true
            , username = usernameItem.val()
            , wif = wifItem.val();

        if (!username) {
            usernameItem.addClass(invalidClass);
            dataValid = false;
        }
        if (!wif || false === adapter.isWif(wif)) {
            wifItem.addClass(invalidClass);
            dataValid = false;
        }
        if (false === dataValid) {
            return false;
        }

        adapter.AbstractAdapter.factory(section).isWifValid(
            username,
            wif,
            function (section, username, wif) {
                Storage.addAccount(section, username, wif);

                addAccountToList(section, username, true);

                console.log(section, `User WIF is correct.`);
            },
            function (msg) {
                console.error(msg);

                wifItem.addClass(invalidClass);
            }
        );
    });
}

function setHandlerChangeAccount() {
    jQuery(sprintf(`.%s`, htmlAccountsList)).on(`change`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        let invalidClass = `is-invalid`
            , section = tool.getElementSection(this)
            , usernameItem = jQuery(sprintf(`#%s-%s`, section, htmlUsername))
            , wifItem = jQuery(sprintf(`#%s-%s`, section, htmlWif))
        ;

        usernameItem.removeClass(invalidClass);
        wifItem.removeClass(invalidClass);

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

function setHandlerPostPublish() {
    jQuery(`#form`).on(`submit`, function(e) {
        e.preventDefault();
        e.stopPropagation();

        let usernamePattern = `#%s-username`
            , wifPattern = `#%s-wif`
            , postTitle = jQuery(`#title`).val()
            , postBody = jQuery(`#body`).val()
            , steemAuthor = tool.stripAccount(jQuery(sprintf(usernamePattern, adapter.nameSteem)).val())
            , steemWif = tool.stripWif(jQuery(sprintf(wifPattern, adapter.nameSteem)).val())
            , golosAuthor = tool.stripAccount(jQuery(sprintf(usernamePattern, adapter.nameGolos)).val())
            , golosWif = tool.stripWif(jQuery(sprintf(wifPattern, adapter.nameGolos)).val())
            , golosAsGolosio = jQuery(sprintf(`#%s-as-golosio`, adapter.nameGolos)).is(`:checked`)
            , golosForVik = jQuery(sprintf(`#%s-for-vik`, adapter.nameGolos)).val()
            , voxAuthor = tool.stripAccount(jQuery(sprintf(usernamePattern, adapter.nameVox)).val())
            , voxWif = tool.stripWif(jQuery(sprintf(wifPattern, adapter.nameVox)).val())
            , voxForDs = jQuery(sprintf(`#%s-for-ds`, adapter.nameVox)).is(`:checked`)
            , wlsAuthor = tool.stripAccount(jQuery(sprintf(usernamePattern, adapter.nameWls)).val())
            , wlsWif = tool.stripWif(jQuery(sprintf(wifPattern, adapter.nameWls)).val())
            , sereyAuthor = tool.stripAccount(jQuery(sprintf(usernamePattern, adapter.nameSerey)).val())
            , sereyWif = tool.stripWif(jQuery(sprintf(wifPattern, adapter.nameSerey)).val())
        ;

        let tagsPattern = `#%s-tags`
            , defaultTags = tool.handleTags(jQuery(`#tags`).val())
            , steemTags = tool.handleTags(jQuery(sprintf(tagsPattern, adapter.nameSteem)).val())
            , golosTags = tool.handleTags(jQuery(sprintf(tagsPattern, adapter.nameGolos)).val())
            , voxTags = tool.handleTags(jQuery(sprintf(tagsPattern, adapter.nameVox)).val())
            , wlsTags = tool.handleTags(jQuery(sprintf(tagsPattern, adapter.nameWls)).val())
            , sereyTags = tool.handleTags(jQuery(sprintf(tagsPattern, adapter.nameSerey)).val())
        ;

        // Steem section
        if (steemAuthor && steemWif) {
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameSteem);

            adapterObj.publish(
                steemWif,
                steemAuthor,
                postTitle,
                postBody,
                steemTags ? steemTags : defaultTags
            );
        }

        // GOLOS section
        if (golosAuthor && golosWif) {
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameGolos);

            adapterObj.publish(
                golosWif,
                golosAuthor,
                postTitle,
                postBody,
                golosTags ? golosTags : defaultTags,
                {
                    as_golosio: golosAsGolosio,
                    for_vik: golosForVik
                }
            );
        }

        // WhaleShare section
        if (wlsAuthor && wlsWif) {
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameWls);

            adapterObj.publish(
                wlsWif,
                wlsAuthor,
                postTitle,
                postBody,
                wlsTags ? wlsTags : defaultTags
            );
        }

        // VOX section
        if (voxAuthor && voxWif) {
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameVox);

            adapterObj.publish(
                voxWif,
                voxAuthor,
                postTitle,
                postBody,
                voxTags ? voxTags : defaultTags,
                { for_ds: voxForDs }
            );
        }

        // Serey section
        if (sereyAuthor && sereyWif) {
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameSerey);

            adapterObj.publish(
                sereyWif,
                sereyAuthor,
                postTitle,
                postBody,
                sereyTags ? sereyTags : defaultTags
            );
        }
    });
}

module.exports = {
    fillAccountsList: fillAccountsList
    , setHandlerAddAccount: setHandlerAddAccount
    , setHandlerChangeAccount: setHandlerChangeAccount
    , setHandlerPostPublish: setHandlerPostPublish
}
