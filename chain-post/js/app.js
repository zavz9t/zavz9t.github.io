let doc = require(`./doc`)
    , commonDoc = require(`../../js/doc`)
    , constant = require(`../../js/constant`)
;

jQuery(document).ready(function($) {

    $(`[data-toggle="tooltip"]`).tooltip();

    doc.addSections(constant.chainPostViewConfig);
    doc.fillAccountsList();

    commonDoc.setHideShowButtonsHandler($);
    doc.setHandlerAddAccount();
    doc.setHandlerChangeAccount();
    doc.setHandlerChangeGolosVik();
    doc.setHandlerPostPublish(constant.chainPostSubmitConfig);
    doc.setHandlerLoadFacebook($);
    doc.setHandlerLoadEvernote($);
    doc.setHandlerSubmitFormButton();
    doc.setHandlerResetFormButton();
    doc.setHandlerResetAccountsButton();
});
