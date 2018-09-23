let each = require('each-sync');
/**
 * @type {module.User}
 * @namespace
 * @property {number} data.xp
 */
module.exports = class User {

    /**
     * @param {string} id
     * @param {function=} callback
     */
    constructor(id, callback) {
        let _this = this;
        this.data = {};
        this.id = id;
        let member = Bot.client.guilds.get('417266233562365952').members.get(id);
        if (!member || member.bot) return;
        callback = callback || function() {};
        this.getData((result) => {
            console.log(result.find(o => o.id === this.id));
            let rank = result.findIndex(o => o.id === this.id)+1;
            result = JSON.parse(JSON.stringify(result.find(o => o.id === this.id)));
            result['rank'] = rank;
            this.data = result;
            if (this.calculateLevel() !== result.level) {
                let level = this.calculateLevel();
                this.setLevel(level);
                result.level = level;
                this.data.level = level;
                this.newLevel(level);
            }
            console.log(result);
            if (result) {
                console.log('getdata');
                callback(result, this);
            } else {
                console.log('register');
                _this.registerUser(() => {
                    console.log(_this.id);
                    _this.getData((result) => {
                        callback(result, this);
                    });
                })
            }
        });
    }

    /**
     * @param {function} callback
     */
    getData(callback) {
        Bot.connection.query(`SELECT * FROM users ORDER BY xp DESC`, (err, result) => {
            if (err) throw err;
            callback(result);
        });
    }

    /**
     * @param {function=} callback
     */
    registerUser(callback) {
        callback = callback || function(){};
        Bot.connection.query(`INSERT INTO \`users\` (\`id\`, \`balance\`, \`balance_real\`, \`level\`, \`xp\`, \`noxp\`, \`member\`, \`roles\`) VALUES ('${this.id}', '250', '0', '0', '0', '0', '1', '[]')`, (err, result) => {
            if (err) throw err;
            console.log(result);
            callback(result);
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @param {function=} callback
     */
    updateData(callback) {
        callback = callback || function(){};
        this.getData((data) => {
            this.data = data;
            callback(data);
        });
    }

    /**
     * @param {function=} callback
     */
    restoreRoles(callback) {
        callback = callback || function(){};
        let _this = this;
        this.getData((data) => {
            let roles = JSON.parse(data[0].roles);
            // roles.forEach(role => {
            //     let role_obj = Bot.client.guilds.get('417266233562365952').roles.get(role);
            //     if (role_obj) Bot.client.guilds.get('417266233562365952').members.get(_this.id).addRole(role).catch(console.error);
            // });
            each(
                roles,
                (role, next) => {
                    let role_obj = Bot.client.guilds.get('417266233562365952').roles.get(role);
                    if (role_obj) Bot.client.guilds.get('417266233562365952').members.get(_this.id).addRole(role).catch(console.error).then(next);
                    else next();
                },
                callback
            );
        })
    }


    calculateLevel() {
        let xp = this.data.xp;
        let i = 0;
        while (xp > (5 * (i ^ 2) + 50 * i + 100)) {
            xp -= (5 * (i ^ 2) + 50 * i + 100);
            i++;
        }
        return i;
    }

    newLevel(level) {
        Bot.client.channels.get('466199224254595072').send(`<@${this.id}> получил **${level}** уровень`);
    }

    /**
     * @param {number} level
     * @param {function=} callback
     */
    setLevel(level, callback) {
        callback = callback || function () {};
        Bot.connection.query(`UPDATE users SET level = '${level}' WHERE id = ${this.id}`, (err, res) => {
            this.data.level = level;
            callback(err, res);
        });
    }

    /**
     * @param {number} balance
     * @param {function=} callback
     */
    setBalance(balance, callback) {
        callback = callback || function () {};
        Bot.connection.query(`UPDATE users SET balance = '${balance}' WHERE id = ${this.id}`, (err, res) => {
            this.data.balance = balance;
            callback(err,res);
        });
    }

    /**
     * @param {User} user
     * @param {number} amount
     * @param {function=} callback
     */
    transfer(user, amount, callback) {
        let _this = this;
        if (this.data.amount < amount) return callback('no_money');
        new Bot.User(user, (data, user_to) => {
            _this.setBalance(_this.data.balance-amount, (err) => {
                if (err) throw err;
                user_to.setBalance(data.data.balance+amount, (err) => {
                    if (err) throw err;
                    callback('success');
                });
            });
        })
    }

    /**
     * @param {function=} callback
     */
    addXP(callback) {
        callback = callback || function(){};
        let xp = Bot.Utilities.getRandomInt(15,25) + this.data.xp;
        Bot.connection.query(`UPDATE users SET xp = '${xp}' WHERE id = ${this.id}`, (err, res) => {
            this.data.xp = xp;
            let level = this.calculateLevel();
            if (level !== this.data.level) this.setLevel(level, () => {
                this.newLevel(level);
                callback(xp, level);
            })
        });
    }

};