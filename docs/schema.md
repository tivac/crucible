# Schema

A schema is a JSON-like object that contains some number of fields and describes a type of content that can be added to a crucible instance.

## Example Schema

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

## Input Fields

### `text`

Simple `<input type="text">` field

### `textarea`

A `<textarea>` that will automatically grow in height (to a reasonable maximum) to fit its content.

### `number`

Simple `<input type="number">` field

### `date`

Simple `<input type="date">` field

### `datetime`

Simple `<input type="datetime-local">` field

### `email`

Simple `<input type="email">` field

### `url`

Simple `<input type="url">` field

### `radio`

A group of `<input type="radio">` fields

### `checkbox`

A single `<input type="checkbox">` field

### `select`

A `<select>` and a number of `<option>` elements contained within

### `relationship`

Renders an input that autocompletes entries in the specified schema to set up many-to-many relationships.

### `upload`

Draws a drop target that will upload files to a defined location. Depends on a web service existing on some other server that can feed it both the upload target location as well as any other form params required to be sent along. Implemented this way so that crucible's uploader can be agnostic and not particularly care about where the file is going. See [#97](https://github.com/tivac/crucible/pull/97) for configuration details.

## Structural Fields

### `fieldset`

Renders a `<fieldset>` (with an optional `<legend>`) that will wrap all the child elements

### `repeating`

Allows for repeating a group of child fields multiple times

### `split`

Split multiple fields horizontally.

### `tabs`

Group fields into a series of tabs.

## Miscellaneous Fields

### `instructions`

Provide instructions for CMS end-users.

## Attributes

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

## Required Inputs

Append a field's name with an asterisk `*` to mark the field `required`, the field label will also turn red.

```js
    {
        "Favorite Word?*": "text"
    }
```
