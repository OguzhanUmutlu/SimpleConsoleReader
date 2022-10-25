# SimpleConsoleReader
Simple console reader!

# Usage

```js
const reader = require("console-reader").Static;

reader.readLine().then(message => {
    console.log("You typed: " + message + "!");
    
    reader.readKey().then(key => {
        console.log("You pressed " + key + "!");
    });
});
```