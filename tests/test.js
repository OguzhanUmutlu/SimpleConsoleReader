const ConsoleReader = require("../ConsoleReader");
const reader = ConsoleReader.Static;
(async () => {
    const number = parseInt(await reader.readLine({show: true}));
    reader.enabled = false;
    if(isNaN(number)) return console.log("You didn't enter a number!");
    console.log("The square of your number is " + number * number)
})();