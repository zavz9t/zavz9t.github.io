let sprintf = require(`sprintf-js`).sprintf
    , urlParse = require(`url-parse`)
    , constant = require(`../../js/constant`)
    , commonDoc = require(`../../js/doc`)
    , tool = require(`../../js/tool`)
    , doc = require(`../../js/doc`)
    , AbstractAdapter = require(`../../js/adapter`).AbstractAdapter
    , Storage = require(`../../js/storage`).Storage
;

const STEEMIT_BANDWIDTH_AVERAGE_WINDOW_SECONDS = 60 * 60 * 24 * 7
    , STEEM_VOTING_MANA_REGENERATION_SECONDS = 432000 // 432000 sec = 5 days
    , STEEM_RC_MANA_REGENERATION_SECONDS = 432000 // 432000 sec = 5 days
;

function calculateVotingPower(account) {
    if (`voting_manabar` in account) {
        let totalShares = parseFloat(account.vesting_shares) + parseFloat(account.received_vesting_shares) - parseFloat(account.delegated_vesting_shares) - parseFloat(account.vesting_withdraw_rate)
            , elapsed = Math.floor(Date.now() / 1000) - account.voting_manabar.last_update_time
            , maxMana = totalShares * 1000000
            , currentMana = parseFloat(account.voting_manabar.current_mana) + elapsed * maxMana / STEEM_VOTING_MANA_REGENERATION_SECONDS;

        if (currentMana > maxMana) {
            currentMana = maxMana;
        }

        return (currentMana * 100 / maxMana).toFixed(2);
    } else if (`energy` in account) {
        return (account.energy / 100)
    } else {
        return (account.voting_power / 100)
    }
}

function calculateResources(account, properties) {
    if (`max_rc` in account) {
        return calculateRc(account);
    } else {
        return calculateBandwidth(account, properties);
    }
}

function calculateBandwidth(account, properties) {
    let totalVestingShares = parseFloat(properties.total_vesting_shares.replace(` VESTS`, ``))
        , max_virtual_bandwidth = parseInt(properties.max_virtual_bandwidth, 10)
        , vestingShares = parseFloat(account.vesting_shares.replace(` VESTS`, ``))
        , receivedVestingShares = (`received_vesting_shares` in account)
            ? parseFloat(account.received_vesting_shares.replace(` VESTS`, ``))
            : 0
        , delegatedVestingShares = (`delegated_vesting_shares` in account)
            ? parseFloat(account.delegated_vesting_shares.replace(` VESTS`, ``))
            : 0
        , average_bandwidth = parseInt(account.average_bandwidth, 10)
        , delta_time = (new Date - new Date(account.last_bandwidth_update + `Z`)) / 1000
        , bandwidthAllocated = (max_virtual_bandwidth  * (vestingShares + receivedVestingShares - delegatedVestingShares) / totalVestingShares)
    ;
    bandwidthAllocated = Math.round(bandwidthAllocated / 1000000);

    let new_bandwidth = 0;
    if (delta_time < STEEMIT_BANDWIDTH_AVERAGE_WINDOW_SECONDS) {
        new_bandwidth = (((STEEMIT_BANDWIDTH_AVERAGE_WINDOW_SECONDS - delta_time)*average_bandwidth)/STEEMIT_BANDWIDTH_AVERAGE_WINDOW_SECONDS)
    }
    new_bandwidth = Math.round(new_bandwidth / 1000000);

    return (100 - ((new_bandwidth / bandwidthAllocated) * 100)).toFixed(2);
}

function calculateRc(account) {
    let estimated_max = parseFloat(account.max_rc)
        , current_mana = parseFloat(account.rc_manabar.current_mana)
        , last_update_time = parseFloat(account.rc_manabar.last_update_time)
        , diff_in_seconds = Math.round(Date.now() / 1000 - last_update_time)
        , estimated_mana = (current_mana + diff_in_seconds * estimated_max / STEEM_RC_MANA_REGENERATION_SECONDS);

    if (estimated_mana > estimated_max) {
        estimated_mana = estimated_max;
    }

    return (estimated_mana / estimated_max * 100).toFixed(2);
}

function addSectionLevels(sectionId, sectionName, accounts, properties) {
    if (accounts.length < 1) {
        console.warn(sprintf(`addSectionLevels: No accounts found for section "%s".`, sectionId));

        return;
    }
    accounts.sort(function(a, b) {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        return 0;
    });
    let sectionEl = jQuery(sprintf(
        constant.htmlPieces.levelsSectionItem
        , sectionId
        , sectionName
    ));

    jQuery(constant.htmlNavigation.levelsSectionsContainer).append(sectionEl);
    sectionEl = jQuery(`#` + sectionId);

    for (let i in accounts) {
        sectionEl.append(sprintf(
            constant.htmlPieces.levelsAccountItem
            , accounts[i].name
            , calculateVotingPower(accounts[i])
            , calculateResources(accounts[i], properties)
            , (`reward_vesting_steem` in accounts[i]) ? accounts[i].reward_vesting_steem : `N/A`
        ));
    }
}

function fillSectionsButtons($) {
    if (!constant.enabledAdapters || constant.enabledAdapters.length < 0) {
        return;
    }
    let container = $(constant.htmlNavigation.toolButtonsContainer);
    container.append(sprintf(constant.htmlPieces.levelsSectionButton, ``, `cross`, `All sections`));

    for (let i in constant.enabledAdapters) {
        let sectionId = constant.enabledAdapters[i]
            , sectionName = constant.adapterDisplayNames[sectionId]
        ;
        container.append(sprintf(constant.htmlPieces.levelsSectionButton, sectionId, sectionId, sectionName))
    }
}

function loadLevels() {
    let onlySection = ``
        , parsed = urlParse(window.location.href);
    if (parsed.query) {
        let queryParams = tool.parseQueryParams(parsed.query);
        if (`s` in queryParams) {
            onlySection = queryParams.s;
        }
    }

    for (let i in constant.enabledAdapters) {
        if (onlySection && constant.enabledAdapters[i] !== onlySection) {
            continue;
        }
        let sectionId = constant.enabledAdapters[i]
            , sectionName = constant.adapterDisplayNames[sectionId]
            , accounts = Storage.getAccounts(sectionId)
        ;
        if (!accounts) {
            console.info(sprintf(`No saved accounts found for "%s" section.`, sectionId));

            continue;
        }

        AbstractAdapter.factory(sectionId).processAccountsInfo(accounts, function (accountsInfo, properties) {
            addSectionLevels(sectionId, sectionName, accountsInfo, properties)
        });
    }
}

jQuery(document).ready(function($) {

    commonDoc.loadNavigation($);
    commonDoc.loadFooter($);

    fillSectionsButtons($);

    doc.setHideShowButtonsHandler($);

    loadLevels();

});
