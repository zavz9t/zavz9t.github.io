let constant = require(`../../js/constant`)
    , sprintf = require(`sprintf-js`).sprintf
;

function fillSections() {
    let element = jQuery(constant.htmlNavigation.voterSection);
    if (element.length < 1) {
        console.warn(`Section element not found.`);

        return false;
    }
    for (let i in constant.enabledAdapters) {
        element.append(sprintf(`<option value="%1$s"><img src="../img/logo/%1$s-32.png" alt="%1$s" /> %1$s</option>`, constant.enabledAdapters[i]));
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

jQuery(document).ready(function($) {

    fillSections();

});
