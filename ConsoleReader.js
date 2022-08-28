class ConsoleReader {
    constructor({stdin = process.stdin, stdout = process.stdout} = {}) {
        stdin.setRawMode(true);
        this.stdin = stdin;
        this._stdinData = [];
    }

    resumeStdin() {
        this.stdin.resume();
    };

    pauseStdin() {
        this.stdin.pause();
    }

    onStdinData(callback) {
        this._stdinData.push(callback);
        this.stdin.on("data", callback);
        return {
            remove: () => {
                this._stdinData.splice(this._stdinData.indexOf(callback), 1);
                this.stdin.off("data", callback);
            }
        };
    };

    removeStdinCallbacks = () => {
        this._stdinData.forEach(i => this.stdin.removeListener("data", i));
        this._stdinData = [];
    };

    readLine({show = true, asString = true} = {}) {
        return new Promise(resolve => {
            this.resumeStdin();
            let dat = [];
            const rem = this.onStdinData(dataB => {
                const data = dataB.toString();
                if (data === "\x03") return process.exit();
                if (data[0] === "\n" || data[0] === "\r") {
                    this.pauseStdin();
                    rem.remove();
                    resolve(asString ? dat.map(i => i.toString()).join("") : dat);
                } else if (data === "\b") {
                    if (dat.length > 0) {
                        dat = dat.substring(0, dat.length - 1);
                        if (show) process.stdout.write("\b ");
                    }
                } else dat.push(dataB);
                if (show) process.stdout.write(data);
            });
        });
    };

    readKey({show = true, amount = 1, asString = true} = {}) {
        return new Promise(resolve => {
            this.resumeStdin();
            let dat = "";
            const rem = this.onStdinData(dataB => {
                const data = dataB.toString();
                if (data === "\x03") return process.exit();
                if (data === "\b") {
                    if (dat.length > 0) {
                        dat = dat.substring(0, dat.length - 1);
                        if (show) process.stdout.write("\b ");
                    }
                } else dat += data;
                if (dat.length >= amount) {
                    this.pauseStdin();
                    rem.remove();
                    resolve(asString ? data : dataB);
                }
                if (show) process.stdout.write(data);
            });
        });
    };
}

module.exports = ConsoleReader;