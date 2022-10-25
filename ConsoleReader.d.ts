import * as Buffer from "buffer";

type Options = {
    stdin: NodeJS.ReadStream & { fd: 0 },
    stdout: NodeJS.WriteStream & { fd: 1 }
};

type SpecialKey = "UpArrow" | "DownArrow" | "RightArrow" | "LeftArrow" | "Backspace" | "HTab" | "VTab" | "Home" |
    "Insert" | "Delete" | "End" | "PageUp" | "PageDown" | "NumLock5" | "Escape";

type HandleEvent = {
    printing: string | null
    buffer: Buffer
    cancelled: boolean
    get specialName(): SpecialKey | null
    get ctrl(): boolean
    get alt(): boolean
};

type HandleEventFunction = (event: HandleEvent) => void;

export default class ConsoleReader {
    static Static: ConsoleReader;

    constructor(options?: Options);

    options: Options;
    handlers: Map<HandleEventFunction, { once: boolean }>;

    get enabled(): boolean;
    set enabled(v: boolean);

    get lineBuffers(): Buffer[];

    handle(handler: HandleEventFunction): { remove: () => void };

    handleOnce(handler: HandleEventFunction): { remove: () => void };

    removeHandler(handler: HandleEventFunction): void;

    readLine(options?: { show?: boolean, lineBreak?: boolean, asString?: true }): Promise<string>;
    readLine(options?: { show?: boolean, lineBreak?: boolean, asString?: false }): Promise<HandleEvent[]>;

    readKey(options?: { show?: boolean, amount?: number, asString?: true }): Promise<string>;
    readKey(options?: { show?: boolean, amount?: number, asString?: false }): Promise<HandleEvent[]>;

    input(options?: { show?: boolean, lineBreak?: boolean, asString?: true }): Promise<string>;
    input(options?: { show?: boolean, lineBreak?: boolean, asString?: false }): Promise<HandleEvent[]>;
}
