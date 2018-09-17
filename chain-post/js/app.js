let jQuery = require(`jquery`),
    ls = require(`local-storage`),
    ss = require(`sessionstorage`),
    Fingerprint2 = require(`fingerprintjs2`),
    AES = require(`crypto-js/aes`),
    tool = require(`./tool`),
    adapter = require(`./adapter`)
;

function publishPost() {
    let postTitle = document.getElementById('title').value,
//                    wssgolos = (document.getElementById("golosnode").value)?document.getElementById("golosnode").value:'wss://ws.golos.io',
        postBody = document.getElementById('body').value, //MD.value(),
//                    feature = document.getElementById("feature").value.replace(/ /g, ''),
        steemAuthor = tool.stripAccount(document.getElementById('account-steem').value),
        steemWif = tool.stripWif(document.getElementById('wif-steem').value),
        golosAuthor = tool.stripAccount(document.getElementById('account-golos').value),
        golosWif = tool.stripWif(document.getElementById('wif-golos').value),
        golosAsGolosio = document.getElementById('golos-as-golosio').checked,
        golosForVik = document.getElementById('golos-for-vik').value,
        voxAuthor = tool.stripAccount(document.getElementById('account-vox').value),
        voxWif = tool.stripWif(document.getElementById('wif-vox').value),
        voxForDs = document.getElementById('vox-for-ds').checked,
        wlsAuthor = tool.stripAccount(document.getElementById('account-wls').value),
        wlsWif = tool.stripWif(document.getElementById('wif-wls').value),
//                    appname = (document.getElementById("appname").value)?document.getElementById("appname").value:'@vik',
        appName = '@chain-post';

//                golos.config.set('websocket',wssgolos);

    let permlink = tool.stripAndTransliterate(postTitle, '-', 'ru-');

    let defaultTags = tool.handleTags(document.getElementById('tags').value),
        steemTags = tool.handleTags(document.getElementById('tags-steem').value),
        golosTags = tool.handleTags(document.getElementById('tags-golos').value),
        voxTags = tool.handleTags(document.getElementById('tags-vox').value),
        wlsTags = tool.handleTags(document.getElementById('tags-wls').value)
    ;


    let jsonMetadata = {
            "app": appName,
            "format": "markdown",
            "tags": defaultTags,
//                        "image": (feature)?[feature]:featuredImage
            "image": []
        },
//                    beneficiaries = document.getElementById("benics").value,
//         beneficiaries = "[{\"account\":\"chain-post\",\"weight\":500}]",
        beneficiaries = [{"account": "chain-post","weight":500}],
        parentPermlink = defaultTags[0],
//                    Allinpower = document.getElementById("Allinpower").checked,
        allInPower = false,
//                    declinePayout = document.getElementById("declinePayout").checked,
        declinePayout = false,
//                    allowCur = (document.getElementById("declineCur").checked)?false:true,
        allowCur = true,
        parentAuthor = "",
        cleanBenef = "";

    // try {
    //     cleanBenef = (beneficiaries) ? JSON.parse(beneficiaries) : ""
    // } catch(e) {
    //     return alert("Вы ввели неправильный формат данных в поле бенефициаров! "+e);
    // }

//                $('#alerts').fadeIn();

    /*
                    if(document.getElementById("benevik").checked){
                        beneficiariesObj = [[0,{"beneficiaries":[{"account":"vik","weight":1000},{"account":"netfriend","weight":1000}]}]];
                        beneficiaries = true
                    }
    */
    if (!permlink) {
        return alert('Не удалось конвертировать ваш заголовок в ссылку. Задайте ссылку отдельно. Поле permlink в расширенных настройках поста')
    }

    // Steem section
    if (steemAuthor && steemWif) {
        let jsonMetadataSteem = JSON.parse(JSON.stringify(jsonMetadata));
        if (steemTags) {
            jsonMetadataSteem['tags'] = steemTags;
        }

        adapter.publishToSteem(
            steemWif,
            steemAuthor,
            (permlink) ? permlink : tool.buildDefaultPermlink(steemAuthor, appName),
            parentAuthor,
            (steemTags) ? steemTags[0] : parentPermlink,
            postTitle,
            postBody,
            jsonMetadataSteem,
            declinePayout,
            allInPower,
            beneficiaries
        );
    }

    // GOLOS section
    if (golosAuthor && golosWif) {
        let jsonMetadataGolos = JSON.parse(JSON.stringify(jsonMetadata));
        if (golosTags) {
            jsonMetadataGolos['tags'] = golosTags;
        }

        adapter.publishToGolos(
            golosWif,
            golosAuthor,
            (permlink) ? permlink : tool.buildDefaultPermlink(golosAuthor, appName),
            parentAuthor,
            golosTags ? golosTags[0] : parentPermlink,
            postTitle,
            postBody,
            jsonMetadataGolos,
            declinePayout,
            allInPower,
            beneficiaries,
            golosAsGolosio,
            golosForVik
        );
    }

    // WhaleShare section
    if (wlsAuthor && wlsWif) {
        let jsonMetadataWls = JSON.parse(JSON.stringify(jsonMetadata));
        if (wlsTags) {
            jsonMetadataWls['tags'] = wlsTags;
        }

        adapter.publishToWls(
            wlsWif,
            wlsAuthor,
            (permlink) ? permlink : tool.buildDefaultPermlink(wlsAuthor, appName),
            parentAuthor,
            (wlsTags) ? wlsTags[0] : parentPermlink,
            postTitle,
            postBody,
            jsonMetadataWls,
            declinePayout,
            allInPower,
            beneficiaries
        );
    }

    // VOX section
    if (voxAuthor && voxWif) {
        let jsonMetadataVox = JSON.parse(JSON.stringify(jsonMetadata));
        if (voxTags) {
            jsonMetadataVox['tags'] = voxTags;
        }

        adapter.publishToVox(
            voxWif,
            voxAuthor,
            (permlink) ? permlink : tool.buildDefaultPermlink(voxAuthor, appName),
            parentAuthor,
            (voxTags) ? voxTags[0] : parentPermlink,
            postTitle,
            postBody,
            jsonMetadataVox,
            declinePayout,
            allInPower,
            beneficiaries,
            voxForDs
        );
    }
}

jQuery(document).ready(function($) {
    $('#form').on('submit', function(e) {
        e.preventDefault();

        publishPost();
    });
});