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

function setToTopHandler($) {
    $(`body`).append(`<div id="to-top" class="btn btn-outline-secondary">👆</div>`);
    $(window).scroll(function () {
        if ($(this).scrollTop() !== 0) {
            $(constant.htmlNavigation.toTopButton).fadeIn();
        } else {
            $(constant.htmlNavigation.toTopButton).fadeOut();
        }
    });
    $(constant.htmlNavigation.toTopButton).click(function() {
        $(`html, body`).animate({ scrollTop: 0 }, 600);
        return false;
    });
}

function setDeletableInputHandler($) {
    $(constant.htmlNavigation.inputDeletable).wrap(`<span class="deleteicon" />`)
        .after($(`<span/>`).click(function() {
                $(this).prev(`input`).val(``).trigger(`keyup`).trigger(`change`).focus()
            }).fadeOut()
        ).keyup(function() {
            if ($(this).val().length > 0) {
                $(this).siblings(`span`).fadeIn()
            } else {
                $(this).siblings(`span`).fadeOut()
            }
        })
    ;
}

function fillSections($) {
    let element = $(constant.htmlNavigation.chooseSection);
    if (element.length < 1) {
        console.warn(`Section element not found.`);

        return false;
    }

    for (let i in constant.enabledAdapters) {
        element.append(sprintf(
            constant.htmlPieces.sectionSelectOption,
            constant.enabledAdapters[i],
            constant.adapterDisplayNames[constant.enabledAdapters[i]]
        ));
    }

    element.selectpicker();
}

module.exports = {
    setHideShowButtonsHandler: setHideShowButtonsHandler
    , loadFooter: loadFooter
    , loadNavigation: loadNavigation
    , setToTopHandler: setToTopHandler
    , setDeletableInputHandler: setDeletableInputHandler
    , fillSections: fillSections
}
