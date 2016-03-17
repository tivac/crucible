crucible
========

Fully client-side single-page application talking to FireBase to build a customizable CMS backed by a robust RESTful API. (Because the API is just [FireBase](https://www.firebase.com/docs/rest/api/)!)

![Crucible](https://cloud.githubusercontent.com/assets/921652/12213718/8ed4ca7a-b632-11e5-8f4e-b166c786de28.png)

## Installation/Development

1. Clone
2. `npm i`
3. `npm start`
4. [Open browser for instructions](http://localhost:9966)

## Usage

You'll want to create a schema first. Schemas are JSON-ish documents that contain some number of fields.

Once you've created a schema you can create instances of that schema. All edits are synced in near-real-time to FireBase, so your data should always be in sync.

### Input Fields

#### `text`

Simple `<input type="text">` field

#### `textarea`

A `<textarea>` that will automatically grow in height (to a reasonable maximum) to fit its content.

#### `number`

Simple `<input type="number">` field

#### `date`

Simple `<input type="date">` field

#### `datetime`

Simple `<input type="datetime-local">` field

#### `email`

Simple `<input type="email">` field

#### `url`

Simple `<input type="url">` field

#### `radio`

A group of `<input type="radio">` fields

#### `checkbox`

A single `<input type="checkbox">` field

#### `select`

A `<select>` and a number of `<option>` elements contained within

#### `relationship`

Renders an input that autocompletes entries in the specified schema to set up many-to-many relationships.

#### `upload`

Draws a drop target that will upload files to a defined location. Depends on a web service existing on some other server that can feed it both the upload target location as well as any other form params required to be sent along. Implemented this way so that crucible's uploader can be agnostic and not particularly care about where the file is going. See [#97](https://github.com/tivac/crucible/pull/97) for configuration details.

### Structural Fields

#### `fieldset`

Renders a `<fieldset>` (with an optional `<legend>`) that will wrap all the child elements

#### `repeating`

Allows for repeating a group of child fields multiple times

#### `split`

Split multiple fields horizontally.

#### `tabs`

Group fields into a series of tabs.

### Miscellaneous Fields

#### `instructions`

Provide instructions for CMS end-users.

### Attributes

You can attach dom-specific attributes to most types by specifying an `attrs` key w/ an associated object.

```js
{
    "Number" : {
        type  : "number",
        attrs :  {
            min  : 0,
            max  : 10,
            step : 2
        }
    }
}
```

### Example schema

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
        type : "checkbox",
        options : {
            one : "option 1",
            two : "option 2"
        }
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
