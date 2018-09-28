let tool = require(`./tool`)
    , adapter = require(`./adapter`)
    , doc = require(`./doc`)
;

jQuery(document).ready(function() {

    let sectionsView = {}
        , sectionsSubmit = {}
    ;
    sectionsView[adapter.nameSteem] = { title: `Steem`, title_style: `width: 200px;` };
    sectionsView[adapter.nameGolos] = {
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
    sectionsView[adapter.nameWls] = { title: `Whaleshares`, title_style: `width: 280px;` };
    sectionsView[adapter.nameSerey] = { title: `Serey`, title_style: `width: 200px;` };
    sectionsView[adapter.nameWeku] = { title: `Weku`, title_style: `width: 190px;` };
    sectionsView[adapter.nameVox] = {
        title: `Vox`,
        title_style: `width: 170px;`,
        append_html: `
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="vox-for-ds" />
                <label class="form-check-label" for="vox-for-ds">Publish for Denis-Skripnik</label>
            </div>
        `
    };

    doc.addSections(sectionsView);
    doc.fillAccountsList();

    doc.setHandlerAddAccount();
    doc.setHandlerChangeAccount();
    doc.setHandlerPostPublish();

});
