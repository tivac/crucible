crucible
========

Mithril.js single-page application talking to FireBase to build a customizable API CMS.

## Installation

1. Clone
2. `npm i`
3. `npm start`

## Usage

You'll want to create a schema first. Schemas are JSON-ish documents that look something like this.

```js
{
	Start : {
        type : "instructions",
        head : "This is a content type",
        body : "Here is what you do with it, hello"
    },
    
    Schedule : {
        type : "fieldset",
        fields : {
            Instructions : {
                type : "instructions",
                body : "Enter schedule information for this thing"
            },
            
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
    }
}
```

(A proper schema for all the supported types of fields is on the todo list)

Once you've created a schema you can create instances of that schema. All edits are synced in near-real-time to FireBase, so your data should always be in sync.
