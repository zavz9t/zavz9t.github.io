let mock = require(`mock-require`);

mock(
    `fingerprintjs2sync`,
    function() {
        return {
            getSync: function() {
                return { fprint: `some-secure-key` }
            }
        }
    }
);

let assert = require(`assert`)
    , ls = require(`local-storage`)
    , storage = require(`../js/storage`);

describe(`storage`, function () {
    beforeEach(function() {
        ls.clear()
    });

    afterEach(function() {
        ls.clear()
    });

    it(`should store and return user credentials`, function() {
        let section = `test-section`
            , username = `test-user`
            , pass = `some-random-pass`
        ;

        storage.Storage.addAccount(section, username, pass);

        let result = storage.Storage.getAccountWif(section, username);

        assert.equal(result, pass, `User pass should be stored`);
    });

    it(`should rewrite user credentials`, function() {
        let section = `test-section`
            , username = `test-user`
            , pass = `some-random-pass`
            , newPass = `some-random-pass-new`
        ;

        assert.notEqual(newPass, pass, `First and second password should be different`);

        storage.Storage.addAccount(section, username, pass);
        storage.Storage.addAccount(section, username, newPass);

        let result = storage.Storage.getAccountWif(section, username);

        assert.equal(result, newPass, `Second pass should be stored`);
    });

    it(`should store several users credentials`, function() {
        let section = `test-section`
            , username1 = `test-user-first`
            , username2 = `test-user-second`
            , pass1 = `some-random-pass-first`
            , pass2 = `some-random-pass-second`
        ;

        assert.notEqual(pass2, pass1, `First and second password should be different`);

        storage.Storage.addAccount(section, username1, pass1);
        storage.Storage.addAccount(section, username2, pass2);

        let result1 = storage.Storage.getAccountWif(section, username1);
        assert.equal(result1, pass1, `First section should be stored`);

        let result2 = storage.Storage.getAccountWif(section, username2);
        assert.equal(result2, pass2, `Second section should be stored`);
    });

    it(`should return empty list when section not set`, function() {
        let section = `test-section`
        ;

        let users = storage.Storage.getAccounts(section);
        assert.equal(users.length, 0, `Should return empty list for non existing section`);
    });

    it(`should return list of users`, function() {
        let section = `test-section`
            , username1 = `test-user-first`
            , username2 = `test-user-second`
            , pass1 = `some-random-pass-first`
            , pass2 = `some-random-pass-second`
        ;

        assert.notEqual(username1, username2, `First and second users should be different`);

        storage.Storage.addAccount(section, username1, pass1);
        storage.Storage.addAccount(section, username2, pass2);

        let users = storage.Storage.getAccounts(section);
        assert.equal(users.length, 2, `Both users should be returned`);
        assert(users.includes(username1), `First user should be returned.`);
        assert(users.includes(username2), `Second user should be returned.`);
    });

    it(`should store several sections`, function() {
        let section1 = `test-section-first`
            , section2 = `test-section-second`
            , username1 = `test-user-first`
            , username2 = `test-user-second`
            , pass1 = `some-random-pass-first`
            , pass2 = `some-random-pass-second`
        ;

        assert.notEqual(pass2, pass1, `First and second password should be different`);

        storage.Storage.addAccount(section1, username1, pass1);
        storage.Storage.addAccount(section2, username2, pass2);

        let result1 = storage.Storage.getAccountWif(section1, username1);
        assert.equal(result1, pass1, `First section should be stored`);

        let result2 = storage.Storage.getAccountWif(section2, username2);
        assert.equal(result2, pass2, `Second section should be stored`);
    });


    // describe('isValidUserId', function(){
    //
    //     it('should return true if valid user id', function(){
    //         var isValid = loginController.isValidUserId(['abc123','xyz321'], 'abc123')
    //         assert.equal(isValid, true);
    //     });
    //
    //     it('should return false if invalid user id', function(){
    //         var isValid = loginController.isValidUserId(['abc123','xyz321'],'abc1234')
    //         assert.equal(isValid, false);
    //     });
    //
    // });

});