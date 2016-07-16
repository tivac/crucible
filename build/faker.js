"use strict";

var faker = require("faker"),
    Randexp = require("randexp"),
    format = require("date-fns/format"),
    data = {},
    count = 100,
    x, y, repeating;

for(x = 0; x < count; x++) {
    repeating = [];

    for(y = faker.random.number({ min : 1, max : 10 }); y > 0; y--) {
        repeating.push({
            start : format(faker.date.future(), "YYYY-MM-DD")
        });
    }

    data[new Randexp(/-\w{19}/).gen()] = {
        name    : faker.company.catchPhrase(),
        version : faker.random.number({ min : 1, max : 100 }),
        created : faker.date.past().valueOf(),
        updated : faker.date.recent().valueOf(),
        fields  : {
            "make-your-choice" : faker.random.arrayElement([ 1, 2, 3 ]),

            number    : faker.random.number(),
            text      : faker.lorem.sentence(),
            repeating : repeating,

            tabs : faker.random.objectElement({
                en : {
                    en : {
                        title : faker.company.catchPhrase(),
                        body  : faker.lorem.paragraph()
                    }
                },

                de : {
                    de : {
                        title : "DE " + faker.company.catchPhrase(),
                        body  : "DE " + faker.lorem.paragraph()
                    }
                }
            })
        }
    };
}

require("fs").writeFileSync("./fake.json", JSON.stringify({ "blog-post" : data }, null, 4), "utf8");
