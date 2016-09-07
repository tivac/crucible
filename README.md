Crucible
========

Fully client-side single-page application talking to FireBase to build a customizable CMS backed by a robust RESTful API. (Because the API is just [FireBase](https://www.firebase.com/docs/rest/api/)!)

<p align="center">
   <img src="https://cloud.githubusercontent.com/assets/921652/12213718/8ed4ca7a-b632-11e5-8f4e-b166c786de28.png" title="Crucible" />
</p>

## Installation

1. `npm install crucible`
2. Rename `index-example.html` to `index.html`, changing the `<base>` tag if necessary
3. Rename `config-example.js` to `config.js` and set your firebase endpoint
4. Open `index.html` in a browser

## Development

1. Create a fork of `https://github.com/tivac/crucible`
2. `git clone https://github.com/<username>/crucible.git`
3. `cd crucible`
4. `npm install`
5. Rename `index-example.html` to `index.html`, changing the `<base>` tag if necessary
6. Rename `config-example.js` to `config.js` and set your firebase endpoint
7. `npm run build`
8. `npm start`
9. Open `http://localhost:9966` in a browser

## Usage

You'll want to create a schema first. Schemas are JSON-ish documents that contain some number of fields.

Once you've created a schema you can create instances of that schema. All edits are synced in near-real-time to FireBase, so your data should always be in sync.

[Schema Documentation](/docs/schema.md)
