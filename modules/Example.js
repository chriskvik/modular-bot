module.exports = {
    Module: function(Bot, Module) {
        
        // Some module permissions, you don't need to specify anything for public commands. 
        Module.Permissions = {
            Commands: {
                ".whois": { Groups: ['Admins'], Users: ['Test'] },
                ".test" : { Prefixes: ['@'] }
            }
        };
        
        // Advanced parsing with regex
        Bot.Command('#Test', ".whois", {user: '([0-9A-Za-z]+)'}, function(command) {
            Bot.Whois(command.args.user, function(whois) {
                Bot.Send(command.to, JSON.stringify(whois));
            });
        });
        
        // Listen for .test on all channels
        Bot.Command("#", ".test", function(command) {
            Bot.Send(command.to, "Hello " + command.from.nick + "!");
        });
        
        // Listen for $test in private messages
        Bot.Command("msg", "$test", function(command) {
            Bot.Send(command.from.nick, "Hi there!");
        })
        
        // Example of handling an emit, in this case a message
        Bot.on('message', function(from, to, message) {
           console.log(from + ": " + message); 
        });
        
        // Example of handling an emit, in this case an invite.
        Bot.on('invite', function(invite) {
            Bot.Join(invite.channel);
        });
    }
};