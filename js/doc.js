let constant = require(`./constant`);

function setHideShowButtonsHandler($) {
    $(constant.htmlNavigation.toolButtonsContainer).on(`show.bs.collapse`, function () {
        $(constant.htmlNavigation.toolButtonsShow).collapse(`hide`);
        $(constant.htmlNavigation.toolButtonsHide).collapse(`show`);
    }).on(`hide.bs.collapse`, function () {
        $(constant.htmlNavigation.toolButtonsShow).collapse(`show`);
        $(constant.htmlNavigation.toolButtonsHide).collapse(`hide`);
    })
}

module.exports = {
    setHideShowButtonsHandler: setHideShowButtonsHandler
}
