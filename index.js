let Discord = require('discord.js');
let fs = require('fs');
let mysql = require('mysql');
let each = require('sync-each');

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
        let _this = this;
        this.client = new Discord.Client();
        this.Discord = Discord;
        this.mysql = mysql;
        this.categories = [];
        this.commands = {};
        this.prefix = '.';
        console.info(`Connecting...`);
        this.client.login(process.env.TOKEN).catch(console.error);
        delete process.env.TOKEN;

        this.connection = this.mysql.createConnection(JSON.parse(process.env.MYSQL));

        this.client.on('ready', () => {
            _this.connection.connect((err) => {
                if (err) throw new Error(err);
                _this.init();
            })
        });
    }



    init() {
        let _this = this;
        console.info(`Connected successfully`);
        this._Utilities = require(`./classes/Utilities.js`);
        this.Utilities = new this._Utilities();
        this._Response = require(`./classes/Response.js`);
        this.Response = new this._Response();
        // noinspection JSUnusedGlobalSymbols
        this.User = require(`./classes/User.js`);
        console.log('Updating database...');

        this.connection.query(`SELECT * FROM users`, (err, res) => {
            let res1 = res.map(obj => obj.id);
            each(this.client.guilds.get('417266233562365952').members.keyArray(),
                (key, next) => {
                    function next0() {
                        function next1() {
                            let roles = _this.client.guilds.get('417266233562365952').members.get(key).roles.keyArray();
                            delete roles[_this.client.guilds.get('417266233562365952').roles.find((r) => r.name === '@everyone')];
                            if (res.filter(obj => obj.id === key)[0] && res.filter(obj => obj.id === key)[0].roles !== JSON.stringify(_this.client.guilds.get('417266233562365952').members.get(key).roles.keyArray())) _this.connection.query(`UPDATE \`users\` SET \`roles\` = '${JSON.stringify(_this.client.guilds.get('417266233562365952').members.get(key).roles.keyArray())}' WHERE \`users\`.\`id\` = '${key}'`, (err) => {
                                if (err) throw err;
                                next();
                            });
                            else next();
                        }
                        if (res.filter(obj => obj.id === key)[0] && !res.filter(obj => obj.id === key)[0].member) _this.connection.query(`UPDATE \`users\` SET \`member\` = '1' WHERE \`users\`.\`id\` = '${key}'`, (err) => {if (err) throw err; next1()});
                        else next1();
                    }
                    if (!res1.includes(key)) return this.connection.query(`INSERT INTO \`users\` (\`id\`, \`balance\`, \`balance_real\`, \`level\`, \`xp\`, \`noxp\`, \`member\`, \`roles\`) VALUES ('${key}', '250', '0', '0', '0', '0', '1', '${JSON.stringify(_this.client.guilds.get('417266233562365952').members.get(key).roles.keyArray())}')`, (err) => {
                        if (err) console.error(err);
                        next0();
                    });
                    else next0();
                },
                () => {
                    each(
                        res1,
                        (id, next) => {
                            if (!_this.client.guilds.get('417266233562365952').members.get(id)) _this.connection.query(`UPDATE \`users\` SET \`member\` = '0' WHERE \`users\`.\`id\` = '${id}'`, (err) => {if (err) throw err; next()});
                            else next();
                        },
                        () => {
                            _this.registerCommands(() => {
                                console.info('Commands registered');
                                _this.registerEvents(() => {
                                    console.info('Events registered');
                                    _this.client.on('message', (message) => _this.onMessage(message));
                                })
                            });
                        }
                    )
                });
        });
    }
    /**
     * @param {Object} message
     */
    onMessage(message) {
        let _this = this;
        if (!message.content.startsWith(this.prefix)) return;
        let args = message.content.slice(this.prefix.length).trim().split(/ +/g);
        let command = args.shift();

        for (let regex in this.commands) {
            if (this.commands.hasOwnProperty(regex)) {
                if (command.match(new RegExp(`^${regex}$`, 'im'))) {
                        if (this.commands[regex].args) {
                            let args_min = this.commands[regex].args.filter(arg => arg.required).length;
                            let args_max = this.commands[regex].args.length;
                            let err = function () {
                                _this.Response.error(message.channel, 'Ошибка использования команды', `Указаны неправильные аргументы.\n\n**Использование команды:**\n\`${_this.commands[regex].getUsage()}\``);
                            };
                            if (args.length > args_max || args.length < args_min) return err();
                            let mention_count = 0;
                            for (let num in args) {
                                let arg = args[num];
                                let arg_normal = this.commands[regex].args[num];
                                if (!['channel', 'user', 'member', 'role'].includes(arg_normal.type)) {
                                    if (typeof arg !== arg_normal.type) return;
                                } else {
                                    mention_count++;
                                    if (!_this.Utilities.isMention(arg)) return err();
                                    args[num] = Object.values(message.mentions[`${arg_normal.type}s`].array())[mention_count - 1];
                                }
                            }
                        }
                        if (this.commands[regex].access) {
                            switch (this.commands[regex].access.type) {
                                case 'right':
                                    if (!message.member.hasPermission(this.commands[regex].access.data)) return _this.Response.error(message.channel, `Не достаточно прав`, `Для выполнения данной команды вам нужно право \`${this.commands[regex].access.data}\``)
                            }
                        }
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
                            access: command_file.info.access
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
        fs.readdir(`./events/`, (err, events) => {
            if (events == null) return callback();
            events.forEach((event, event_num) => {
                if (event.includes('.')) return console.error(`File in events dir`);
                fs.readdir(`./events/${event}/`, (err, event_listeners) => {
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