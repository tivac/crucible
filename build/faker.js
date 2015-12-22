"use strict";

var faker = require("faker"),
    Randexp = require("randexp"),
    data = {},
    count = 100,
    x, y, repeating;

for(x = 0; x < count; x++) {
    repeating = [];
    
    for(y = faker.random.number({ min : 1, max : 10 }); y > 0; y--) {
        repeating.push({
            start : faker.date.future().valueOf()
        });
    }
    
    data[new Randexp(/-\w{19}/).gen()] = {
        _name : faker.company.catchPhrase(),
        _schema : "blog-post",
        _version : faker.random.number(),
        _updated : faker.date.recent().valueOf(),
        "make-your-choice": faker.random.arrayElement([ 1, 2, 3 ]),
        number : faker.random.number(),
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
        }),
        text : faker.lorem.sentence(),
        repeating : repeating
    };
}

require("fs").writeFileSync("./fake.json", JSON.stringify(data, null, 4), "utf8");
