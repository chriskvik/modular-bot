process.on('uncaughtException', function(err) {
  console.trace('Caught exception: ' + err);
});

module.exports = {
    Match: function(message, regex) {
        var res = message.toString().match(regex);
        if(res) {
            return res;
        } else {
            return false;
        }
    }
};