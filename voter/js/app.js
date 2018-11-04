let constant = require(`../../js/constant`)
    , tool = require(`../../js/tool`)
    , commonDoc = require(`../../js/doc`)
    , AbstractAdapter = require(`../../js/adapter`).AbstractAdapter
    , Storage = require(`../../js/storage`).Storage
    , sprintf = require(`sprintf-js`).sprintf
    , urlParse = require(`url-parse`)
;

function fillUrl($) {
    let element = $(constant.htmlNavigation.voterUrl);
    if (element.length < 1) {
        console.warn(sprintf(`Url element not found by selector "%s".`, constant.htmlNavigation.voterUrl));

        return false;
    }

    let parsed = urlParse(window.location.href);
    if (!parsed.query) {
        return;
    }

    let queryParams = tool.parseQueryParams(parsed.query)
        , urlParamName = `url`
    ;
    if (urlParamName in queryParams) {
        element.val(queryParams[urlParamName]);
    }
}

function fillAccountsList($, section) {
    let el = $(constant.htmlNavigation.voterAccountsContainer);
    if (el.length < 1) {
        console.error(sprintf(
            `Accounts container not found by selector "%s".`,
            constant.htmlNavigation.voterAccountsContainer
        ));

        return false;
    }

    el.html(`<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>`)
        .collapse(`show`);

    if (!section) {
        el.collapse(`hide`).html(``);

        return;
    }

    let accounts = Storage.getAccounts(section);
    if (!accounts) {
        console.info(sprintf(`No saved accounts found for "%s" section.`, section));

        el.collapse(`hide`).html(``);

        return;
    }

    AbstractAdapter.factory(section).processAccountsInfo(accounts, function (accountsInfo, gp) {
        accountsInfo.sort(function(a, b) {
            if (a.name > b.name) {
                return 1;
            }
            if (a.name < b.name) {
                return -1;
            }
            return 0;
        });

        el.html(``)
            .append(constant.htmlPieces.voterCheckAllAccountsItem);
        for (let k in accountsInfo) {
            el.append(sprintf(
                constant.htmlPieces.voterAccountItem,
                accountsInfo[k].name,
                tool.vestsToPower(accountsInfo[k], gp)
            ));
        }
        el.collapse(`show`);
        Sortable.create(el.get(0));
    });
}

function setSubmitHandler($) {
    $(constant.htmlNavigation.submitForm).on(`submit`, function (e) {
        e.preventDefault();
        e.stopPropagation();

        tool.startPublishing($(constant.htmlNavigation.submitFormButton));

        let url = $(constant.htmlNavigation.voterUrl).val()
            , section = $(constant.htmlNavigation.voterSection).val()
            , accounts = $(sprintf(`%s:checked`, constant.htmlNavigation.voterAccountItem))
        ;
        if (!section) {
            tool.handlePublishError(section, `No blockchain was chosen.`);

            return;
        }
        if (accounts.length < 1) {
            tool.handlePublishError(section, `No accounts were checked.`);

            return;
        }

        let accountsList = {};
        accounts.each(function (k, element) {
            let accountName = $(element).val();
            accountsList[accountName] = Storage.getAccountWif(section, accountName);
        });

        AbstractAdapter.factory(section).vote(url, accountsList);
    });
}

function setChangeChainHandler($) {
    $(constant.htmlNavigation.chooseSection).on(`change`, function() {
        fillAccountsList($, $(this).val());
    });
}

function setCheckAllHandler($) {
    $(`body`).on(`change`, constant.htmlNavigation.voterCheckAll, function (e) {
        e.preventDefault();
        e.stopPropagation();

        let elements = $(constant.htmlNavigation.voterAccountItem);
        if (elements.length < 1) {
            return;
        }
        if (!$(this).prop(`checked`)) {
            elements.prop(`checked`, false);
        } else {
            elements.prop(`checked`, true);
        }
    });
}

jQuery(document).ready(function($) {

    commonDoc.loadNavigation($);
    commonDoc.loadFooter($);

    commonDoc.fillSections($);

    commonDoc.setToTopHandler($);
    commonDoc.setDeletableInputHandler($);

    fillUrl($);

    setChangeChainHandler($);
    setCheckAllHandler($);
    setSubmitHandler($);
});
