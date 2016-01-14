crucible
========

Mithril.js single-page application talking to FireBase to build a customizable API CMS.

![Crucible](https://cloud.githubusercontent.com/assets/921652/12213718/8ed4ca7a-b632-11e5-8f4e-b166c786de28.png)

## Installation/Development

1. Clone
2. `npm i`
3. `npm start`
4. [Open browser for instructions](http://localhost:9966)

## Usage

You'll want to create a schema first. Schemas are JSON-ish documents that look something like this.

```js
{
    // Comments are allowed, as are unquoted keys

    // The simplest types are just a string because they need no config
    Field : "text",

    // More complicated types always have at least a "type" property, and depending
    // on what they are will use a few more

    // instructions types have one of a head or body, or both.
    Start : {
        type : "instructions",
        head : "This is a content type",
        body : "Here is what you do with it, hello"
    },

    // Fieldsets are a direct mapping to <fieldset>
    Schedule : {
        type : "fieldset",
        fields : {
            Instructions : {
                type : "instructions",
                body : "Enter schedule information for this thing"
            },

            // Repeating fields allow for multiple data points to be added
            Repeating : {
                type : "repeating",
                fields : {
                    test : "text"
                }
            }
        }
    },
    Text : "text",
    Number : "number",

    // Split fields
    split : {
        type : "split",
        sections : {
            left : {
                location : "text"
            },
            right : {
                rank : "text"
            }
        }
    },

    // Tabbed fields
    tabs : {
        type : "tabs",
        tabs : {
            EN : {
                "Title" : "text",
                "Body" : "text"
            },

            DE : {
                "Title" : "text"
            }
        }
    },

    // <select> analogue, showing both short hand <option> values as well as
    // making one option selected by default
    "Make your choice" : {
        type : "select",
        options : {
            one : 1,
            two : {
                value : 2,
                selected : true
            },
            three : 3,
        }
    },

    // Checkbox
    Checkbox : {
        type : "checkbox"
    },

    // Radio buttons
    Radio : {
        type : "radio",
        options : {
            one : "foo",
            two : {
                value : "bar",
                checked : true
            }
        }
    }
}
```

(A proper schema for all the supported types of fields is on the todo list)

Once you've created a schema you can create instances of that schema. All edits are synced in near-real-time to FireBase, so your data should always be in sync.
