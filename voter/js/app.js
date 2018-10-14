let constant = require(`../../js/constant`)
    , tool = require(`../../js/tool`)
    , AbstractAdapter = require(`../../js/adapter`).AbstractAdapter
    , sprintf = require(`sprintf-js`).sprintf
    , Storage = require(`../../js/storage`).Storage
    , urlParse = require(`url-parse`)
;

function fillSections() {
    let element = jQuery(constant.htmlNavigation.voterSection);
    if (element.length < 1) {
        console.warn(`Section element not found.`);

        return false;
    }

    for (let i in constant.enabledAdapters) {
        element.append(sprintf(
            constant.htmlPieces.voterSectionSelectOption,
            constant.enabledAdapters[i],
            constant.adapterDisplayNames[constant.enabledAdapters[i]]
        ));
    }
}

function fillUrl() {
    let element = jQuery(constant.htmlNavigation.voterUrl);
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

function fillAccountsList(section) {
    let el = $(constant.htmlNavigation.voterAccountsContainer);
    if (el.length < 1) {
        console.error(sprintf(
            `Accounts container not found by selector "%s".`,
            constant.htmlNavigation.voterAccountsContainer
        ));

        return false;
    }

    if (!section) {
        el.collapse(`hide`);
        el.html(``);

        return;
    }

    let accounts = Storage.getAccounts(section);
    if (!accounts) {
        console.info(sprintf(`No saved accounts found for "%s" section.`, section));

        el.collapse(`hide`);
        el.html(``);

        return;
    }

    accounts.sort();
    el.html(``);
    for (let k in accounts) {
        el.append(sprintf(
            constant.htmlPieces.voterAccountItem,
            accounts[k]
        ));
    }

    el.collapse(`show`);
    Sortable.create(el.get(0));
}

function setSubmitHandler() {
    jQuery(constant.htmlNavigation.submitForm).on(`submit`, function (e) {
        e.preventDefault();
        e.stopPropagation();

        tool.startPublishing(jQuery(constant.htmlNavigation.submitButton));

        let url = jQuery(constant.htmlNavigation.voterUrl).val()
            , section = jQuery(constant.htmlNavigation.voterSection).val()
            , accounts = jQuery(sprintf(`%s input:checked`, constant.htmlNavigation.voterAccountsContainer))
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
            let accountName = jQuery(element).val();
            accountsList[accountName] = Storage.getAccountWif(section, accountName);
        });

        AbstractAdapter.factory(section).vote(url, accountsList);
    });
}

jQuery(document).ready(function($) {

    fillSections();
    fillUrl();

    let sectionEl = $(constant.htmlNavigation.voterSection);
    sectionEl.on(`change`, function () {
        fillAccountsList($(this).val());
    });
    sectionEl.selectpicker();

    setSubmitHandler();
});
