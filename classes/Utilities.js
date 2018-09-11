module.exports = class Utilities {
    // noinspection JSMethodCanBeStatic
    /**
     * @param {Number} number
     * @param {Array} titles
     * @returns {*}
     */
    declOfNum (number, titles) {
        let cases = [2, 0, 1, 1, 1, 2];
        return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ];
    };

    // noinspection JSMethodCanBeStatic
    /**
     * @param {String} text
     * @returns {boolean}
     */
    isMention (text) {
        return Boolean(text.match(/<.?\d+>/));
    }
};