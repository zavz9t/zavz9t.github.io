let doc = require(`./doc`)
    , constant = require(`../../js/constant`)
;

function getViewConfig() {
    let sectionsView = {};
    sectionsView[constant.adapterSteem] = { title: `Steem`, title_style: `width: 235px;` };
    sectionsView[constant.adapterGolos] = {
        title: `Golos`,
        title_style: `width: 225px;`,
        append_html: `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="golos-as-golosio" />
                <label class="form-check-label" for="golos-as-golosio">Publish as golos.io</label>
            </div>

            <div class="form-row align-items-center">
                <div class="form-group col-md-3">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input" id="golos-vik-enable" />
                        <label class="form-check-label" for="golos-vik-enable">Publish for VIK</label>
                    </div>
                </div>
                
                <div class="form-group col-md-2 golos-vik-settings invisible">
                    <input type="number" step="1" min="10" max="85" class="form-control" id="golos-for-vik" />
                </div>
                
                <div class="form-group col-md-2 golos-vik-settings invisible">
                    <strong>%</strong>
                </div>
            </div>
        `
    };
    sectionsView[constant.adapterWls] = { title: `Whaleshares`, title_style: `width: 315px;` };
    sectionsView[constant.adapterSerey] = { title: `Serey`, title_style: `width: 230px;` };
    sectionsView[constant.adapterWeku] = { title: `Weku`, title_style: `width: 225px;` };
    sectionsView[constant.adapterSmoke] = { title: `Smoke`, title_style: `width: 240px;` };
    sectionsView[constant.adapterVox] = {
        title: ``,
        title_style: `width: 270px;`,
        append_html: `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="vox-for-ds" />
                <label class="form-check-label" for="vox-for-ds">Publish for Denis-Skripnik</label>
            </div>
        `
    };

    return sectionsView;
}

function getSubmitConfig() {
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
    sectionsSubmit[constant.adapterSmoke] = defaultOptions;
    sectionsSubmit[constant.adapterVox] = [ { type: `checkbox`, html_id: constant.adapterVox + `-for-ds`, key: `for_ds` } ];

    return sectionsSubmit;
}

jQuery(document).ready(function($) {

    $(`[data-toggle="tooltip"]`).tooltip();

    doc.addSections(getViewConfig());
    doc.fillAccountsList();

    doc.setHandlerAddAccount();
    doc.setHandlerChangeAccount();
    doc.setHandlerChangeGolosVik();
    doc.setHandlerPostPublish(getSubmitConfig());
    doc.setHandlerLoadFacebook();
    doc.setHandlerResetButton();
});
