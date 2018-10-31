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
    , constant = require(`../js/constant`)
    , tool = require(`../js/tool`)
    , adapter = require(`../js/adapter`)
;

describe(`adapter`, function () {

    describe(`abstract`, function() {

        it(`should build JSON metadata`, function() {
            let tags = [`first-tag`, `second-tag`, `third-one`]
                , images = [`https://some.host/some-image.png`]
                , options = { images: images }
                , expected = {
                    app: `@chain-post`,
                    format: `markdown`,
                    tags: tags,
                    image: images
                }
            ;

            assert.deepEqual(
                adapter.AbstractAdapter.buildJsonMetadata(tags, options),
                expected,
                `JSON metadata should be build correctly`
            );
        });

    });

    describe(`golos`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterGolos)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 GBG`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should not add ru- prefix to permlink`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterGolos)
                , author = `test-user`
                , postTitle = `Певний текст`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, ``)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 GBG`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should use specific placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterGolos)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text {img_p_4}bbb.png`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: `Very important text https://imgp.golos.io/400x0/bbb.png` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 GBG`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should remove unknown placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterGolos)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text {some-ph}bbb.png`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: `Very important text bbb.png` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 GBG`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should build operations as golos.io`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterGolos)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = { as_golosio: true }
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 GBG`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [
                                        { account: `chain-post`, weight: 500 },
                                        { account: `golosio`, weight: 1000 }
                                    ]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should build operations for VIK`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterGolos)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , vikValue = 10
                , options = { for_vik: vikValue }
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 GBG`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [
                                        { account: `chain-post`, weight: 500 },
                                        { account: `vik`, weight: vikValue * 100 },
                                        { account: `netfriend`, weight: 1000 }
                                    ]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

    describe(`steem`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterSteem)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 SBD`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should add images to metadata`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterSteem)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , images = [`https://some.host/any-image.png`]
                , options = { images: images }
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags, options))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 SBD`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should replace placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterSteem)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text {img_p_8}http://img.png`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: `Very important text https://steemitimages.com/800x0/http://img.png` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 SBD`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

    describe(`wls`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterWls)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 WLS`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should replace placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterWls)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text {img_p_4}some-image`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: `Very important text https://wls.rjght.com/imageproxy/400x0/some-image` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 WLS`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

    describe(`vox`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterVox)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 GOLD`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should build operations for denis-skripnik`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterVox)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , voxTags = tags.concat([`dpos-post`])
                , options = { for_ds: true }
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(voxTags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 GOLD`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [
                                        { account: `chain-post`, weight: 500 },
                                        { account: `denis-skripnik`, weight: 100 }
                                    ]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

    describe(`serey`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterSerey)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 SRD`,
                            percent_steem_dollars: 0,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should replace placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterSerey)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text {img_p_4}some-image`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: `Very important text https://serey.io/imageproxy/400x0/some-image` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 SRD`,
                            percent_steem_dollars: 0,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

    describe(`weku`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterWeku)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , wekuTags = [`community-deals`].concat(tags)
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(wekuTags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 WKD`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should replace placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterWeku)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text {img_p_4}some-image`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , wekuTags = [`community-deals`].concat(tags)
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle, `-`, `ru-`)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: `Very important text some-image` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(wekuTags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 WKD`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

    describe(`smoke`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterSmoke)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 SMOKE`,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should replace placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterSmoke)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text {img_p_4}some-image`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: `Very important text https://smoke.io/smokeimageproxy/400x0/some-image` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 SMOKE`,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

    describe(`viz`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterViz)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , expectedTags = tags.concat([`liveblogs`])
                , options = { as_liveblogs: true }
                , permlink = tool.stripAndTransliterate(postTitle)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(expectedTags))
                        }
                        ],
                        [
                            `comment_options`,
                            {
                                author: author,
                                permlink: permlink,
                                max_accepted_payout: `1000000.000 VIZ`,
                                percent_steem_dollars: 10000,
                                allow_votes: true,
                                allow_curation_rewards: true,
                                extensions: [[
                                    0,
                                    {
                                        beneficiaries: [
                                            { account: `chain-post`, weight: 500 }
                                            , { account: `denis-skripnik`, weight: 100 }
                                        ]
                                    }
                                ]]
                            }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should publish as liveblogs`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterViz)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: postBody + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: `1000000.000 VIZ`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: [{account: `chain-post`, weight: 500}]
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

        it(`should replace placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(constant.adapterViz)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text {img_p_4}some-image`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , options = []
                , permlink = tool.stripAndTransliterate(postTitle)
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: permlink,
                            title: postTitle,
                            body: `Very important text https://i.goldvoice.club/400x0/some-image` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
                        }
                        ],
                        [
                            `comment_options`,
                            {
                                author: author,
                                permlink: permlink,
                                max_accepted_payout: `1000000.000 VIZ`,
                                percent_steem_dollars: 10000,
                                allow_votes: true,
                                allow_curation_rewards: true,
                                extensions: [[
                                    0,
                                    {
                                        beneficiaries: [{account: `chain-post`, weight: 500}]
                                    }
                                ]]
                            }
                    ]
                ]
            ;

            assert.deepEqual(
                adapterObj.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

});
