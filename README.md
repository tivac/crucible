anthracite
========

Fully client-side single-page application talking to FireBase to build a customizable CMS backed by a robust RESTful API. (Because the API is just [FireBase](https://www.firebase.com/docs/rest/api/)!)

<p align="center">
   <a href="https://en.wikipedia.org/wiki/Anthracite#/media/File:Ibbenbueren_Anthracite.JPG">
      <img src="http://i.imgur.com/CUZunGj.jpg" width="400" height="300" />
   </a>
</p>

## Installation

1. `npm install anthracite`
2. Rename `index-example.html` to `index.html`, changing the `<base>` tag if necessary
3. Rename `config-example.js` to `config.js` and set your firebase endpoint
4. Open `index.html` in a browser

## Development

1. Create a fork of `https://github.com/tivac/anthracite`
2. `git clone https://github.com/<username>/anthracite.git`
3. `cd anthracite`
4. `npm install`
5. Rename `index-example.html` to `index.html`, changing the `<base>` tag if necessary
6. Rename `config-example.js` to `config.js` and set your firebase endpoint
7. `npm run build`
8. `npm start`
9. Open `http://localhost:9966` in a browser

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

Draws a drop target that will upload files to a defined location. Depends on a web service existing on some other server that can feed it both the upload target location as well as any other form params required to be sent along. Implemented this way so that anthracite's uploader can be agnostic and not particularly care about where the file is going. See [#97](https://github.com/tivac/anthracite/pull/97) for configuration details.

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

### Conditionally Hidden / Shown Fields

You can display or not display fields based on the current value of another field.

`value` can be either RegExp or a primitive -- please note, primitive `value`s are tested with loose equality.

```js
{
    "Favorite dessert?" :{
        type: "select",
        options : {
            "Pie" : "pie",
            "Ice Cream" : "icecream"
        }
    },

    "And what is your favorite flavor of ice cream?": {
        type : "text",
        show : {
            field : "Favorite dessert?",
            value : /icecream/
        }
    },

    /* ... */
}
```

### Required Inputs

Append a field's name with an asterisk `*` to mark the field `required`, the field label will also turn red.

```js
    { 
        "Favorite Word?*": "text"
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
                selected : true
            }
        }
    }
}
```
