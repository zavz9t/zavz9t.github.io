let tool = require(`./tool`)
    , adapter = require(`./adapter`)
    , doc = require(`./doc`)
;

jQuery(document).ready(function() {

    doc.fillAccountsList();

    doc.setHandlerAddAccount();
    doc.setHandlerChangeAccount();
    doc.setHandlerPostPublish();

});
