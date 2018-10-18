// let mock = require(`mock-require`);
//
// mock(
//     `fingerprintjs2sync`,
//     function() {
//         return {
//             getSync: function() {
//                 return { fprint: `some-secure-key` }
//             }
//         }
//     }
// );

let assert = require(`assert`)
    , sprintf = require(`sprintf-js`).sprintf
    , tool = require(`../js/tool`)
;

describe(`tool`, function () {

    describe(`stripAndTransliterate`, function() {

        it(`should handle empty string`, function() {
            assert.equal(
                tool.stripAndTransliterate(``),
                ``,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle one word`, function() {
            assert.equal(
                tool.stripAndTransliterate(`hello`),
                `hello`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should strip special symbols`, function() {
            assert.equal(
                tool.stripAndTransliterate(`Hello dear friends!`),
                `hello-dear-friends`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle string with space replacement symbol`, function() {
            assert.equal(
                tool.stripAndTransliterate(`Word-to-Word text`),
                `word-to-word-text`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should replace several spaces by one`, function() {
            assert.equal(
                tool.stripAndTransliterate(`Several  spaces   test     fin`),
                `several-spaces-test-fin`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should use specified space replacement symbol`, function() {
            assert.equal(
                tool.stripAndTransliterate(`Several  spaces   test     fin`, `_`),
                `several_spaces_test_fin`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle strings with dots`, function() {
            assert.equal(
                tool.stripAndTransliterate(`Some, item. He-he`),
                `some-item-he-he`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle dots as space symbol`, function() {
            assert.equal(
                tool.stripAndTransliterate(`Another,item.Be-be`),
                `another-item-be-be`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle ukrainian symbols`, function() {
            assert.equal(
                tool.stripAndTransliterate(`Привіт друзі!`),
                `ru--privit-druzi`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle some russian symbols correctly`, function() {
            assert.equal(
                tool.stripAndTransliterate(`Странные вещи`),
                `ru--strannyie-veshchi`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle emoji`, function() {
            assert.equal(
                tool.stripAndTransliterate(`(💯 апвот) Очень злая собака 😨 - 7`),
                `ru--apvot-ochenx-zlaya-sobaka-7`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle emoji 2`, function() {
            assert.equal(
                tool.stripAndTransliterate(`(💯 апвот) Динозаври на вулиці 😱 - 2`),
                `ru--apvot-dinozavri-na-vuliczi-2`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should handle different symbols correctly`, function() {
            assert.equal(
                tool.stripAndTransliterate(`[Щоденник досягнень] День 32/100 | 08.09.2018`),
                `ru--shchodennik-dosyagnenx-denx-32-100-08-09-2018`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should use prefix parameter`, function() {
            assert.equal(
                tool.stripAndTransliterate(`[Щоденник досягнень] День 32/100 | 08.09.2018`, `_`, `ua-`),
                `ua-shchodennik_dosyagnenx_denx_32_100_08_09_2018`,
                `Strip with transliteration should be done correctly`
            );
        });

        it(`should trim last space symbol`, function() {
            assert.equal(
                tool.stripAndTransliterate(`[Горнятко кави] Я Морячка Ты Моряк ⛵`),
                `ru--gornyatko-kavi-ya-moryachka-ty-moryak`,
                `Strip with transliteration should be done correctly`
            );
        });

    });

    describe(`parseSectionTags`, function() {

        it(`should handle empty string`, function() {
            assert.deepEqual(
                tool.parseSectionTags(``),
                {},
                `Parsing should be done correctly`
            );
        });

        it(`should handle one section`, function() {
            let tags = `ua beautiful-life photography streetphotography life steemitbloggers`
                , section = `steem`
                , rawString = sprintf(`|%s: %s `, section, tags)
                , expectedData = {}
            ;

            expectedData[section] = tags;

            assert.deepEqual(
                tool.parseSectionTags(rawString),
                expectedData,
                `Parsing should be done correctly`
            );
        });

        it(`should handle several sections at one row`, function() {
            let tags = `ua beautiful-life photography streetphotography life steemitbloggers`
                , section1 = `steem`
                , section2 = `golos`
                , rawString = sprintf(`|%s, %s: %s `, section1, section2, tags)
                , expectedData = {}
            ;

            expectedData[section1] = tags;
            expectedData[section2] = tags;

            assert.deepEqual(
                tool.parseSectionTags(rawString),
                expectedData,
                `Parsing should be done correctly`
            );
        });

        it(`should handle combined usage`, function() {
            let rawString = `|steem: ua beautiful-life photography streetphotography life steemitbloggers |serey, golos, vox: beautiful-life photography en streetphotography life |wls: beautiful-life photography streetphotography life pixel|smoke: beautiful-life photography streetphotography life |weku: beautiful-life en photography streetphotography zealpro phototalent teamquality wekubloggers`
                , expectedData = {
                    steem: `ua beautiful-life photography streetphotography life steemitbloggers`
                    , serey: `beautiful-life photography en streetphotography life`
                    , golos: `beautiful-life photography en streetphotography life`
                    , vox: `beautiful-life photography en streetphotography life`
                    , wls: `beautiful-life photography streetphotography life pixel`
                    , smoke: `beautiful-life photography streetphotography life`
                    , weku: `beautiful-life en photography streetphotography zealpro phototalent teamquality wekubloggers`
                }
            ;

            assert.deepEqual(
                tool.parseSectionTags(rawString),
                expectedData,
                `Parsing should be done correctly`
            );
        });

    });

});
