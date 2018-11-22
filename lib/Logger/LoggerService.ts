/**
 * @module Lib/Logger
 */
import 'reflect-metadata';
import { ReflectiveInjector, Injectable, Injector } from 'injection-js';
import { Logger, transports } from 'winston';

@Injectable()
export default class LoggerService extends Logger {
    constructor() {
        super();
        this.level = 'debug';
        this.add(
            transports.Console,
            {
                name: 'console',
                level: 'debug',
                timestamp : true,
                colorize : true
            }
        );
    }
}
