/**
 * Do not edit this script, to add modules, check the modules/Example.js
**/

var Bot = new (require('./lib/Bot')).Bot();

var cli = require('cline')();

cli.interact('');

cli.command('connect', 'Connects bot to irc server', function() {
    Bot.Connect();
});

cli.command('disconnect', 'Disconnects bot from irc server', function() {
    Bot.Disconnect();
});

cli.command('join {channel}', 'Join specified channel', {channel: '[#A-Za-z0-9`_\\-\\[\\]\\|]+'}, function(input, args) {
    Bot.Join(args.channel);
});

cli.command('part {channel}', 'Parts specified channel', {channel: '[#A-Za-z0-9`_\\-\\[\\]\\|]+'}, function(input, args) {
    Bot.Part(args.channel);
});

cli.command('msg {destination} {text}', 'Sends a message to specified destination', {destination: '[#A-Za-z0-9`_\\-\\[\\]\\|]+', text: '.*'}, function(input, args) {
    if(args.destination.indexOf('#') > -1) {
        var f = true;
        Object.keys(Bot.Client.chans).forEach(function(channel) {
           if(channel.toLowerCase() == args.destination.toLowerCase()) {
               Bot.Send(args.destination, args.text);
               f= false;
           }
        });
        if(f) {
            console.log("You are not on " + args.destination);
            return;
        }
    }
    Bot.Send(args.destination, args.text);
});

cli.command('channels', 'List all channels the bot is connected to', function() {
    var channels = Object.keys(Bot.Client.chans).toString();
    
    console.log('Connected to the following channels: ' + channels);
});

cli.command('reload', 'Reloads modules', function () {
    Bot.Load();
});

cli.command('modules', 'List loaded modules', function() {
    console.log("Loaded modules:");
    if(Bot.Modules.length > 0) {
        Bot.Modules.forEach( function(Module) {
            console.log(Module.name);
        });
    } else {
        console.log("No modules loaded");
    }

});

cli.on('close', function () {
    process.exit();
});