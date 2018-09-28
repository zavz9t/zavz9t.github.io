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
                , expected = {
                    app: `@chain-post`,
                    format: `markdown`,
                    tags: tags,
                    image: []
                }
            ;

            assert.deepEqual(
                adapter.AbstractAdapter.buildJsonMetadata(tags),
                expected,
                `JSON metadata should be build correctly`
            );
        });

    });

    describe(`golos`, function() {

        it(`should build simple operations`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameGolos)
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

        it(`should use specific placeholders`, function() {
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameGolos)
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameGolos)
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameGolos)
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameGolos)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , vikValue = 1000
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
                                        { account: `vik`, weight: vikValue },
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameSteem)
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
                            allow_curation_rewards: true
                            // extensions: [[
                            //     0,
                            //     {
                            //         beneficiaries: [{account: `chain-post`, weight: 500}]
                            //     }
                            // ]]
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameSteem)
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
                            allow_curation_rewards: true
                            // extensions: [[
                            //     0,
                            //     {
                            //         beneficiaries: [{account: `chain-post`, weight: 500}]
                            //     }
                            // ]]
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameWls)
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameWls)
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
                            body: `Very important text https://whaleshares.io/imageproxy/400x0/some-image` + constant.postBodySign,
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameVox)
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameVox)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameSerey)
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
                            allow_curation_rewards: true
                            // extensions: [[
                            //     0,
                            //     {
                            //         beneficiaries: [{account: `chain-post`, weight: 500}]
                            //     }
                            // ]]
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameSerey)
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
                            allow_curation_rewards: true
                            // extensions: [[
                            //     0,
                            //     {
                            //         beneficiaries: [{account: `chain-post`, weight: 500}]
                            //     }
                            // ]]
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameWeku)
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
                            max_accepted_payout: `1000000.000 WKD`,
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true
                            // extensions: [[
                            //     0,
                            //     {
                            //         beneficiaries: [{account: `chain-post`, weight: 500}]
                            //     }
                            // ]]
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
            let adapterObj = adapter.AbstractAdapter.factory(adapter.nameWeku)
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
                            body: `Very important text some-image` + constant.postBodySign,
                            json_metadata: JSON.stringify(adapter.AbstractAdapter.buildJsonMetadata(tags))
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
                            allow_curation_rewards: true
                            // extensions: [[
                            //     0,
                            //     {
                            //         beneficiaries: [{account: `chain-post`, weight: 500}]
                            //     }
                            // ]]
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
