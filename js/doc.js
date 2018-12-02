let constant = require(`./constant`)
    , tool = require(`./tool`)
    , numeral = require(`numeral`)
    , urlParse = require(`url-parse`)
;

function setHideShowButtonsHandler($) {
    $(constant.htmlNavigation.toolButtonsContainer).on(`show.bs.collapse`, function () {
        $(constant.htmlNavigation.toolButtonsShow).collapse(`hide`);
        $(constant.htmlNavigation.toolButtonsHide).collapse(`show`);

        gtag(
            `event`,
            `show`,
            { event_category: `tool-buttons` }
        );
    }).on(`hide.bs.collapse`, function () {
        $(constant.htmlNavigation.toolButtonsShow).collapse(`show`);
        $(constant.htmlNavigation.toolButtonsHide).collapse(`hide`);

        gtag(
            `event`,
            `hide`,
            { event_category: `tool-buttons` }
        );
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

        gtag(
            `event`,
            `to-top`,
            { event_category: `tool-buttons` }
        );

        return false;
    });
}

function setDeletableInputHandler($) {
    $(constant.htmlNavigation.inputDeletable).wrap(`<span class="deleteicon" />`)
        .after($(`<span/>`).click(function() {
                $(this).prev(`input`).val(``).trigger(`keyup`).trigger(`change`).focus()
            }).fadeOut()
        ).on(`keyup change paste`, function() {
            if ($(this).val().length > 0) {
                $(this).siblings(`span`).fadeIn()
            } else {
                $(this).siblings(`span`).fadeOut()
            }
        })
    ;
}

function fillEnabledChains($) {
    let element = $(constant.htmlNavigation.chooseChain);
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

    setAutoChangeChainHandler($, element);

    element.selectpicker();
}

function setAutoChangeChainHandler($, chainElement) {
    let urlSelector, urlElement;
    if (
        !(urlSelector = chainElement.data(`url-container`))
        || (urlElement = $(urlSelector)).length < 1
    ) {
        console.error(sprintf(`Can't find url element to watch. Used selector: "%s"`, urlSelector));

        return false;
    }

    urlElement.on(`keyup change paste`, function(e) {
        let hostname = urlParse($(this).val()).hostname
            , chainName = ``
        ;

        for (let i in constant.adapterToClients) {
            if (constant.adapterToClients[i].includes(hostname)) {
                chainName = i;
                break;
            }
        }

        if (!chainName) {
            if (tool.isDebug()) {
                console.warn(sprintf(`Chain wasn't found for domain: "%s"`, hostname));
            }

            return;
        }
        let chainExists = false;
        chainElement.find(`option`).each(function(i, item) {
            if ($(item).val() === chainName) {
                chainExists = true;
            }
        });

        if (!chainExists) {
            console.error(sprintf(`Chain "%s" doesn't exists in enabled chains.`, chainName));

            return;
        }

        if (chainElement.val() !== chainName) {
            chainElement.val(chainName)
                .trigger(`change`)
                .selectpicker(`refresh`)
            ;
        }
    });
}

function setSortHandler($, containerSelector) {
    $(`body`).on(`click`, containerSelector + ` .sort-control`, function (e) {
        e.preventDefault();
        e.stopPropagation();

        let selector = $(this).data(`selector`)
            , sortAttr = $(this).data(`attr`)
            , sortDir = $(this).data(`direction`)
        ;

        $(this).data(`direction`, (sortDir === 1) ? -1 : 1);

        $(selector).sort(function (a, b) {
            let valueA = $(a).attr(sortAttr)
                , valueB = $(b).attr(sortAttr)
                , numA = numeral(valueA).value()
                , numB = numeral(valueB).value()
            ;

            if (numA !== null && numB !== null) {
                valueA = numA;
                valueB = numB;
            }

            if (sortDir === 1) {
                return (valueB < valueA) ? 1 : -1;
            } else {
                return (valueB > valueA) ? 1 : -1;
            }
        }).appendTo(containerSelector);
    });
}

module.exports = {
    setHideShowButtonsHandler: setHideShowButtonsHandler
    , loadFooter: loadFooter
    , loadNavigation: loadNavigation
    , setToTopHandler: setToTopHandler
    , setDeletableInputHandler: setDeletableInputHandler
    , fillEnabledChains: fillEnabledChains
    , setSortHandler: setSortHandler
}
