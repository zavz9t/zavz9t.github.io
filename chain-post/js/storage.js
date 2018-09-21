const keyAccounts = `accounts`
    , keySecret = `user_secret`
;

let sprintf = require(`sprintf-js`).sprintf
    , ls = require(`local-storage`)
    , ss = require(`sessionstorage`)
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

    static getSecretKey()
    {
        let secretValue = ss.getItem(keySecret);
        if (!secretValue) {
            secretValue = (new Fingerprint2()).getSync().fprint;
            ss.setItem(keySecret, secretValue)
        }

        return secretValue;
    }
}

module.exports = {
    Storage: Storage
}
