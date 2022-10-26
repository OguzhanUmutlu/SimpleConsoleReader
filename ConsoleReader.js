class ConsoleReader {
    static Static = new ConsoleReader();

    constructor(options) {
        if (typeof options !== "object" || Array.isArray(options)) options = {};
        const def = {
            stdin: process.stdin,
            stdout: process.stdout
        };
        Object.keys(def).forEach(i => typeof options[i] !== def[i] ? options[i] = def[i] : null);
        this.options = options;
        this.options.stdin.setRawMode(true);
        this.handlers = new Map;
        let lineLen = 0;
        this.options.stdin.on("data", buffer => {
            const length = buffer.length;
            //const string = [...buffer].map(i => String.fromCharCode(i)).join("");
            const ch = (...arr) => arr.length === buffer.length && arr.every((i, j) => buffer[j] === i);
            const key = {
                printing: null,
                specialName: null,
                ctrl: false,
                alt: false,
                cancelled: false,
                buffer
            };
            let specialName = null;
            let ctrl = false;
            let alt = false;
            const pc = t => key.printing = t || buffer.toString();
            const sp = t => specialName = t;
            if (length === 1 && buffer[0] === 3) {
                process.exit();
            } else if (ch(13)) {
                pc("\n");
                lineLen = 0;
            } else if (ch(27, 91, 65)) {
                sp("UpArrow");
            } else if (ch(27, 91, 66)) {
                sp("DownArrow");
            } else if (ch(27, 91, 67)) {
                sp("RightArrow");
            } else if (ch(27, 91, 68)) {
                sp("LeftArrow");
            } else if (ch(127)) {
                ctrl = true;
                sp("Backspace");
            } else if (ch(27, 8)) {
                alt = true;
                sp("Backspace");
            } else if (ch(8)) {
                if (lineLen > 0) {
                    pc("\b \b");
                    lineLen -= 2;
                }
                sp("Backspace");
            } else if (ch(9)) {
                sp("HTab");
            } else if (ch(11)) {
                sp("VTab");
            } else if (ch(27, 91, 49, 126)) {
                sp("Home");
            } else if (ch(27, 91, 50, 126)) {
                sp("Insert");
            } else if (ch(27, 91, 51, 126)) {
                sp("Delete");
            } else if (ch(27, 91, 52, 126)) {
                sp("End");
            } else if (ch(27, 91, 53, 126)) {
                sp("PageUp");
            } else if (ch(27, 91, 54, 126)) {
                sp("PageDown");
            } else if (ch(27, 91, 71)) {
                // Num Lock 5? What does it really do? idk.
                sp("NumLock5");
            } else if (ch(27)) {
                sp("Escape");
            } else pc();
            this.handlers.forEach((opt, fn) => {
                if (typeof opt === "object" && opt.once) this.removeHandler(fn);
                key.specialName = specialName;
                key.ctrl = ctrl;
                key.alt = alt;
                // so they can't overwrite it
                fn(key);
            });
            if (!key.cancelled && key.printing) {
                process.stdout.write(key.printing);
                lineLen++;
            }
        });
    };

    get enabled() {
        return this.options.stdin.isPaused();
    };

    set enabled(v) {
        if (v) this.options.stdin.resume();
        else this.options.stdin.pause();
    };

    handle(fn) {
        this.handlers.set(fn, {once: false});
        return {remove: () => this.removeHandler(fn)};
    };

    handleOnce(fn) {
        this.handlers.set(fn, {once: true});
        return {remove: () => this.removeHandler(fn)};
    };

    removeHandler(fn) {
        this.handlers.delete(fn);
    };

    readLine({show = true, asString = true, lineBreak = true} = {}) {
        let res = asString ? "" : [];
        return new Promise(r => {
            const h = this.handle(ev => {
                if (!show) ev.cancelled = true;
                if (ev.printing === "\n") {
                    h.remove();
                    r(res);
                    if (!lineBreak) ev.cancelled = true;
                } else {
                    if (asString) res += ev.printing || "";
                    else res.push(ev);
                }
            });
        });
    };

    readKey({show = true, amount = 1, asString = true} = {}) {
        let res = asString ? "" : [];
        return new Promise(r => {
            const h = this.handle(ev => {
                if (!show) ev.cancelled = true;
                if (asString) res += ev.printing || "";
                else res.push(ev);
                if (res.length >= amount) {
                    h.remove();
                    r(res);
                }
            });
        });
    };

    input = this.readLine;
}

ConsoleReader.new = (...args) => new ConsoleReader(...args);

module.exports = ConsoleReader;