// Generate bundle.js using browserify
//   ./node_modules/grunt-browserify/node_modules/browserify/bin/cmd.js -d -t coffeeify test/examples/js/browserify/main.js -o test/examples/js/browserify/bundle.js
var ErrorMaker = require("./error_maker_module");
var ErrorCoffeeMaker = require("./error_coffee_maker_module.coffee");

global.ErrorMaker = ErrorMaker;
global.ErrorCoffeeMaker = ErrorCoffeeMaker;
