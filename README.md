# laravel-elixir-rollup

Laravel Elixir [Rollup](https://github.com/rollup/rollup) Extension.

## Installation

```bash
npm install --save-dev laravel-elixir-rollup
```

## Usage

`mix.rollup(src, output, options)`

```javascript
var elixir = require('laravel-elixir');

require('laravel-elixir-rollup');

elixir(function (mix) {
    mix.rollup('app.js');

    mix.rollup('app.js', 'public/js/App.js', {
        format: 'umd', 
        moduleName: 'App'
    });
});
```
