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

function loadFooter($) {
    $(`footer`).load(`/common/footer.html`);
}

function loadNavigation($) {
    let url = new URL(window.location.href);

    $(`#navigation`).load(`/common/navigation.html`, function() {
        $(this).find(`a`).each(function() {
            if ($(this).attr(`href`) === url.pathname) {
                $(this).addClass(`active`)
            }
        })
    });
}

module.exports = {
    setHideShowButtonsHandler: setHideShowButtonsHandler
    , loadFooter: loadFooter
    , loadNavigation: loadNavigation
}
