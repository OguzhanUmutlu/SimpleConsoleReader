const ConsoleReader = require("../ConsoleReader");
const reader = new ConsoleReader();
reader.readLine({show: true}).then(line => {
    console.log("You typed:", line);
});
