const ConsoleReader = require("../ConsoleReader");
const reader = new ConsoleReader();

(async () => {
    const WAYS = {
        UP: 0,
        RIGHT: 1,
        DOWN: 2,
        LEFT: 3
    };
    const COLORS = {
        Reset: "\x1b[0m",
        FgBlack: "\x1b[30m",
        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgBlue: "\x1b[44m",
        BgWhite: "\x1b[47m",
        Clear: "\u001b[2J\u001b[0;0H"
    };
    const GameColors = {
        Normal: COLORS.Reset + COLORS.BgWhite + COLORS.FgBlack,
        Red: COLORS.Reset + COLORS.BgRed,
        Green: COLORS.Reset + COLORS.BgGreen,
        Blue: COLORS.Reset + COLORS.BgBlue,
        Black: COLORS.Reset + COLORS.BgBlack,
        Reset: COLORS.Reset
    };
    const sendGameColor = color => process.stdout.write(GameColors[color]);
    const width = () => process.stdout.columns;
    const height = () => process.stdout.rows;
    let game;
    const resetGame = () => {
        game = {x: width() / 2, y: height() / 2, sub: [], way: WAYS.UP, apple: null, score: 0};
        generateApple();
    };
    const getGameArea = () => {
        let area = "";
        let lastCol = "";
        for (let i = 0; i < height(); i++) {
            for (let j = 0; j < width(); j++) {
                let col;
                if (i === game.y && j === game.x) col = GameColors.Green;
                else if (game.sub.some(s => s.x === j && s.y === i)) col = GameColors.Blue;
                else if (game.apple && game.apple.x === j && game.apple.y === i) col = GameColors.Red;
                else col = GameColors.Normal;
                if (col === lastCol) col = "";
                else lastCol = col;
                area += col + " ";
            }
            area += GameColors.Normal + "\n";
        }
        return area;
    };
    const generateApple = () => {
        const posL = [..." ".repeat(width())]
            .map((_, i) => [..." ".repeat(height())]
                .map((_, j) => [i, j]))
            .flat()
            .filter(p => !game.sub.some(s => s.x === p[0] && s.y === p[1]));
        const pos = posL[Math.floor(Math.random() * posL.length)];
        game.apple = {x: pos[0], y: pos[1]};
    };
    const render = () => {
        console.clear();
        sendGameColor("Normal");
        console.log("Score: " + game.score + "\n" + getGameArea());
        sendGameColor("Reset");
    };
    resetGame();
    render();
    const keyHandler = async () => {
        const key = await reader.readKey({show: false});
        switch (key) {
            case "w":
                game.way = WAYS.UP;
                break;
            case "d":
                game.way = WAYS.RIGHT;
                break;
            case "s":
                game.way = WAYS.DOWN;
                break;
            case "a":
                game.way = WAYS.LEFT;
                break;
        }
        setTimeout(keyHandler);
    };
    keyHandler().then(_ => _);
    const loop = async () => {
        let newSub = [...game.sub];
        newSub.push({x: game.x, y: game.y});
        if (newSub.length > game.score) newSub.shift();
        game.sub = newSub;
        switch (game.way) {
            case WAYS.UP:
                game.y--;
                break;
            case WAYS.RIGHT:
                game.x++;
                break;
            case WAYS.DOWN:
                game.y++;
                break;
            case WAYS.LEFT:
                game.x--;
                break;
        }
        if (game.x < 0) game.x = width() - 1;
        if (game.x >= width()) game.x = 0;
        if (game.y < 0) game.y = height() - 1;
        if (game.y >= height()) game.y = 0;
        if (game.apple && game.apple.x === game.x && game.apple.y === game.y) {
            game.score++;
            generateApple();
        }
        if (game.sub.some(s => s.x === game.x && s.y === game.y)) {
            console.clear();
            console.log("You lost! You touched yourself! Game will be reset in 5 seconds...");
            await new Promise(r => setTimeout(r, 5000));
            resetGame();
        }
        render();
        const speedAlgorithm = () => {
            const speed = Math.floor(Math.sqrt(game.score) * 0.5);
            return speed > 0 ? speed : 1;
        };
        setTimeout(loop, 1 / speedAlgorithm() * 500);
    };
    loop().then(_ => _);
})();