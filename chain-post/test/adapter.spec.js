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
    , tool = require(`../js/tool`)
    , AbstractAdapter = require(`../js/adapter`).AbstractAdapter
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
                AbstractAdapter.buildJsonMetadata(tags),
                expected,
                `JSON metadata should be build correctly`
            );
        });

    });

    describe(`golos`, function() {

        it(`should build simple operations`, function() {
            let section = `golos`
                , adapter = AbstractAdapter.factory(section)
                , author = `test-user`
                , postTitle = `some test title`
                , postBody = `Very important text`
                , tags = [`first-tag`, `second-tag`, `third-one`]
                , expectedOperations = [
                    [
                        `comment`,
                        {
                            parent_author: ``,
                            parent_permlink: tags[0],
                            author: author,
                            permlink: tool.stripAndTransliterate(postTitle, `-`, `ru-`),
                            title: postTitle,
                            body: postBody,
                            json_metadata: JSON.stringify(jsonMetadata)
                        }
                    ],
                    [
                        `comment_options`,
                        {
                            author: author,
                            permlink: permlink,
                            max_accepted_payout: '1000000.000 GOLD',
                            percent_steem_dollars: 10000,
                            allow_votes: true,
                            allow_curation_rewards: true,
                            extensions: [[
                                0,
                                {
                                    beneficiaries: beneficiariesLocal
                                }
                            ]]
                        }
                    ]
                ]
            ;

            assert.deepEqual(
                adapter.buildOperations(author, postTitle, postBody, tags, options),
                expectedOperations,
                `Operations should be build correctly`
            );
        });

    });

});
