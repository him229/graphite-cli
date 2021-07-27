import yargs from "yargs";
import AbstractCommand from "../../../lib/abstract_command";
declare const args: {};
declare type argsT = yargs.Arguments<yargs.InferredOptionTypes<typeof args>>;
export default class PrintStacksCommand extends AbstractCommand<typeof args> {
    static args: {};
    _execute(argv: argsT): Promise<void>;
}
export {};
