let doc = require(`./doc`)
    , constant = require(`./constant`)
;

jQuery(document).ready(function($) {

    $(`[data-toggle="tooltip"]`).tooltip();

    // view section
    let sectionsView = {};
    sectionsView[constant.adapterSteem] = { title: `Steem`, title_style: `width: 200px;` };
    sectionsView[constant.adapterGolos] = {
        title: `Golos`,
        title_style: `width: 190px;`,
        append_html: `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="golos-as-golosio" />
                <label class="form-check-label" for="golos-as-golosio">Publish as golos.io</label>
            </div>

            <div class="form-group">
                <label for="golos-for-vik">Publish for VIK</label>
                <input type="number" step="1" min="1" max="9000" class="form-control" id="golos-for-vik" />
            </div>
        `
    };
    sectionsView[constant.adapterWls] = { title: `Whaleshares`, title_style: `width: 280px;` };
    sectionsView[constant.adapterSerey] = { title: `Serey`, title_style: `width: 200px;` };
    sectionsView[constant.adapterWeku] = { title: `Weku`, title_style: `width: 190px;` };
    sectionsView[constant.adapterVox] = {
        title: `Vox`,
        title_style: `width: 170px;`,
        append_html: `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="vox-for-ds" />
                <label class="form-check-label" for="vox-for-ds">Publish for Denis-Skripnik</label>
            </div>
        `
    };
    // submit section
    let sectionsSubmit = {}
        , defaultOptions = []
    ;
    sectionsSubmit[constant.adapterSteem] = defaultOptions;
    sectionsSubmit[constant.adapterGolos] = [
        { type: `checkbox`, html_id: constant.adapterGolos + `-as-golosio`, key: `as_golosio` }
        , { type: `int`, html_id: constant.adapterGolos + `-for-vik`, key: `for_vik` }
    ];
    sectionsSubmit[constant.adapterWls] = defaultOptions;
    sectionsSubmit[constant.adapterSerey] = defaultOptions;
    sectionsSubmit[constant.adapterWeku] = defaultOptions;
    sectionsSubmit[constant.adapterVox] = [ { type: `checkbox`, html_id: constant.adapterVox + `-for-ds`, key: `for_ds` } ];

    doc.addSections(sectionsView);
    doc.fillAccountsList();

    doc.setHandlerAddAccount();
    doc.setHandlerChangeAccount();
    doc.setHandlerPostPublish(sectionsSubmit);

});
