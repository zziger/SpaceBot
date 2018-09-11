module.exports = class User {

    /**
     * @param {string} id
     * @param {function=} callback
     */
    constructor(id, callback) {
        let _this = this;
        this.data = {};
        this.id = id;
        console.log(1);
        let member = Bot.client.guilds.get('417266233562365952').members.get(id);
        if (!member || member.bot) return;
        callback = callback || function() {};
        this.getData((result) => {
            console.log(result);
            if (result.length >= 1) {
                this.data = result[0];
                callback(result[0], this);
            } else {
                _this.registerUser(() => {
                    console.log(_this.id);
                    _this.getData((result) => {
                        callback(result[0], this);
                        this.data = result[0];
                    });
                })
            }
        });
    }

    /**
     * @param {function} callback
     */
    getData(callback) {
        Bot.connection.query(`SELECT * FROM users WHERE id = ${this.id}`, (err, result) => {
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
            roles.forEach(role => {
                let role_obj = Bot.client.guilds.get('417266233562365952').roles.get(role);
                if (role_obj) Bot.client.guilds.get('417266233562365952').members.get(_this.id).addRole(role).catch(console.error);
            })
        })
    }


};