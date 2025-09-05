"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helloCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
exports.helloCommand = new commander_1.Command('hello')
    .description('Print Hello World')
    .action(() => {
    console.log(chalk_1.default.green('Hello World!'));
});
//# sourceMappingURL=hello.js.map