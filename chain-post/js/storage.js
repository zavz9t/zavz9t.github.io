const keyAccounts = `accounts`
    , keySecret = `u-s`
;

let sprintf = require(`sprintf-js`).sprintf
    , ls = require(`local-storage`)
    , Fingerprint2 = require(`fingerprintjs2sync`)
    , CryptoJS = require(`crypto-js`)
;

class Storage
{
    static addAccount(section, username, wif)
    {
        let accounts = ls.get(keyAccounts);
        if (!accounts) {
            accounts = {};
        }
        if (!accounts[section]) {
            accounts[section] = {};
        }
        accounts[section][username] = CryptoJS.AES.encrypt(wif, Storage.getSecretKey()).toString();

        ls.set(keyAccounts, accounts);
    }

    static getAccountWif(section, username)
    {
        let accounts = ls.get(keyAccounts);
        if (!accounts || !accounts[section] || !accounts[section][username]) {
            return null;
        }

        return CryptoJS.AES.decrypt(accounts[section][username], Storage.getSecretKey())
            .toString(CryptoJS.enc.Utf8);
    }

    static getAccounts(section)
    {
        let accounts = ls.get(keyAccounts);
        if (!accounts || !accounts[section]) {
            return [];
        } else {
            return Object.keys(accounts[section])
        }
    }

    static getSecretKey()
    {
        let secretValue = ls.get(keySecret);
        if (!secretValue) {
            secretValue = (new Fingerprint2()).getSync().fprint;
            ls.set(keySecret, secretValue)
        }

        return secretValue;
    }
}

module.exports = {
    Storage: Storage
}
