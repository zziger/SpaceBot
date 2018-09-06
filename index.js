let Discord = require('discord.js');
let fs = require('fs');

/**
 * Main class.
 * @namespace
 * @property {[Object]} categories
 * @property {Object<String, Object>} commands
 */
class Bot {
    /**
     * @param {Object} message
     */
    onMessage(message) {
        for (let regex in Object.keys(this.commands)) {
            if (message.content.match(new RegExp(regex, 'im'))) {
                this.commands[regex].run();
            }
        }
    }

    /**
     * @param {function=} callback
     */
    registerCommands(callback) {
        let _this = this;
        callback = callback || function () {};
        fs.readdir(`./commands/`, (err, categories) => {
            if (err) throw new Error();
            categories.forEach((category, category_num) => {
                if (category.includes('.')) return console.error(`File in commands dir`);
                if (!fs.existsSync(`./commands/${category}/config.json`)) return console.error(`There isn't config for category ${category}`);
                let data = require(`./commands/${category}/config.json`);
                _this.categories.push(data);
                fs.readdir(`./commands/${category}/`, (err, commands) => {
                    commands.forEach((command, command_num) => {
                        if (!command.match(/.*?\.js$/)) return;
                        let command_file = require(`./commands/${category}/${command}`);
                        _this.commands[command_file.info.regex] = {
                            name: command_file.info.name,
                            description: command_file.info.description,
                            regex: command_file.info.regex,
                            category,
                            run: command_file.run,
                        };
                        if (command_num === commands.length-1 && category_num === categories.length-1) callback();
                    })
                });
            });
        });
    }

    /**
     * @param {function=} callback
     */
    registerEvents(callback) {
        let _this = this;
        callback = callback || function () {};
        fs.readdir(`./events/`, (events) => {
            events.forEach((event, event_num) => {
                if (event.includes('.')) return console.error(`File in events dir`);
                fs.readdir(`./events/${event}/`, (event_listeners) => {
                    event_listeners.forEach((event_listener, event_listener_num) => {
                        if (!event_listener.match(/.*?\.js$/)) return;
                        let event_listener_file = require(`./events/${event}/${event_listener}`);
                        _this.client.on(event, event_listener_file);
                        if (event_num === events.length-1 && event_listener_num === event_listeners.length-1) callback();
                    });
                });
            });
        })
    }

    /**
     * Bot constructor.
     */
    constructor() {
        this.client = new Discord.Client();
        this.categories = [];
        this.commands = {};
        console.info(`Connecting...`);
        this.client.login(process.env.TOKEN).catch(console.error);
        delete process.env.TOKEN;
        this.client.on('ready', this.init);
    }

    init() {
        let _this = this;
        console.info(`Connected successfully`);
        this._Utilities = require(`./classes/Utilities.js`);
        this.Utilities = new this._Utilities();
        this._Response = require(`./classes/Utilities.js`);
        this.Response = new this._Response();
        this.registerCommands(() => {
            console.info('Commands registered');
            _this.registerEvents(() => {
                console.info('Events registered');
                _this.client.on('message', _this.onMessage);
            })
        });
    }
}

global.Bot = new Bot();