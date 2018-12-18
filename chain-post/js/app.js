let doc = require(`./doc`)
    , commonDoc = require(`../../js/doc`)
    , constant = require(`../../js/constant`)
;

jQuery(document).ready(function($) {

    commonDoc.loadNavigation($);
    commonDoc.loadFooter($);

    $(`[data-toggle="tooltip"]`).tooltip();

    doc.addSections(constant.chainPostViewConfig);
    doc.fillAccountsList();
    commonDoc.fillEnabledChains($);

    commonDoc.setHideShowButtonsHandler($);
    commonDoc.setToTopHandler($);
    doc.setHandlerAddAccount($);
    doc.setHandlerChangeAccount();
    doc.setHandlerChangeGolosVik();
    doc.setHandlerPostPublish($, constant.chainPostSubmitConfig);
    doc.setHandlerLoadFacebook($);
    doc.setHandlerLoadEvernote($);
    doc.setHandlerLoadChainPost($);
    doc.setHandlerShowPostPreview($);
    doc.setHandlerSubmitFormButton($);
    doc.setHandlerResetFormButton($);
    doc.setHandlerResetAccountsButton($);
});
