/**
 * @module App
 */
import 'module-alias/register';

import * as Discord from 'discord.js';

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

console.log(Discord.Client);


class Bot extends Discord.Client {

    private userId: string;

    constructor(token: string, userId: string) {
        super();
        this.userId = userId;
        this.on('ready', this.onReady.bind(this));
        this.on('message', this.onMessage.bind(this));
        this.login(token);
    }
/*
const user = bot.users.find((user) => {
        return (`${user.username}#${user.discriminator}` === process.env.DISCORD_USER_ID);
    });

    user.send('ImmoBot ready');

 */
    onReady() {
        console.info((new Date()).toString(), 'discord bot ready');
    }

    onMessage(message: any) {
        if(!message.author.bot) {
            console.info((new Date()).toString(), 'new message');
            if(`${message.author.username}#${message.author.discriminator}` === this.userId) {
                console.log(this.users.map((user) => user.presence.status));
                message.reply("bonjour !");
            }
        }
    }
}

const bot = new Bot(process.env.DISCORD_TOKEN, process.env.DISCORD_USER_ID);
