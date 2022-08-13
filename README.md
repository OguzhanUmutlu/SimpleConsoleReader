# SimpleConsoleReader
Simple console reader!

# Usage

```js
const ConsoleReader = require("console-reader");
const reader = new ConsoleReader();

reader.readLine().then(message => {
    console.log("You typed: " + message + "!");
    
    reader.readKey().then(key => {
        console.log("You pressed " + key + "!");
    });
});
```