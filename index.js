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
     * Bot constructor.
     */
    constructor() {
        this.client = new Discord.Client();
        this.Discord = Discord;
        this.categories = [];
        this.commands = {};
        this.prefix = '.';
        console.info(`Connecting...`);
        this.client.login(process.env.TOKEN).catch(console.error);
        delete process.env.TOKEN;
        this.client.on('ready', () => this.init(this));
    }

    init() {
        let _this = this;
        console.info(`Connected successfully`);
        this._Utilities = require(`./classes/Utilities.js`);
        this.Utilities = new this._Utilities();
        this._Response = require(`./classes/Response.js`);
        this.Response = new this._Response();
        _this.registerCommands(() => {
            console.info('Commands registered');
            _this.registerEvents(() => {
                console.info('Events registered');
                _this.client.on('message', (message) => _this.onMessage(message));
            })
        });
    }
    /**
     * @param {Object} message
     */
    onMessage(message) {
        if (!message.content.startsWith(this.prefix)) return;
        let args = message.content.slice(this.prefix.length).trim().split(/ +/g);
        let command = args.shift();

        for (let regex in this.commands) {
            if (this.commands.hasOwnProperty(regex)) {
                if (command.match(new RegExp(`^${regex}$`, 'im'))) {
                        let args_min = this.commands[regex].args.filter(arg => arg.required).length;
                        let args_max = this.commands[regex].args.length;
                        if (args.length > args_max || args.length < args_min) return this.Response.error(message.channel, 'Ошибка использования команды', `Указано неправильное количество аргументов (\`${args.length}\`)\n\n**Использование команды:**\n\`${this.commands[regex].getUsage()}\``);
                        this.commands[regex].run(message, command, args);
                }
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
            if (categories == null) return callback();
            categories.forEach((category, category_num) => {
                if (category.includes('.')) return console.error(`File in commands dir`);
                if (!fs.existsSync(`./commands/${category}/config.json`)) return console.error(`There isn't config for category ${category}`);
                let data = require(`./commands/${category}/config.json`);
                _this.categories.push(data);
                fs.readdir(`./commands/${category}/`, (err, commands) => {
                    if (commands == null) return callback();
                    commands.forEach((command, command_num) => {
                        if (!command.match(/.*?\.js$/)) return;
                        let command_file = require(`./commands/${category}/${command}`);
                        _this.registerCommand({
                            name: command_file.info.name,
                            description: command_file.info.description,
                            regex: command_file.info.regex,
                            category,
                            run: command_file.run,
                            args: command_file.info.args,
                        });
                        if (command_num === commands.length-1 && category_num === categories.length-1) callback();
                    })
                });
            });
        });
    }


    registerCommand(object) {
        let _this = this;
        this.commands[object.regex] = object;
        this.commands[object.regex].getUsage = () => {
            let usage = `${_this.prefix}${_this.commands[object.regex].name}`;
            _this.commands[object.regex].args.forEach((arg) => {
                let arg_string = arg.description;
                if (arg.required) arg_string = `[${arg_string}]`;
                else arg_string = `<${arg_string}>`;
                usage += ` ${arg_string}`;
            });
            return usage;
        }
    }

    /**
     * @param {function=} callback
     */
    registerEvents(callback) {
        let _this = this;
        callback = callback || function () {};
        fs.readdir(`./events/`, (events) => {
            if (events == null) return callback();
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
}

global.Bot = new Bot();