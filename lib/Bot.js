/**
 * Do not edit this script, to add modules, check the modules/Example.js
**/

var irc = require('irc');
var colors = require('irc-colors');
var fs = require('fs');
var Utils = require('./Utils.js');
var Authentication = require("./Authentication.js");
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');
var needle = require('needle');

needle.defaults({ timeout: 10000, 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'});

function Bot() {
    
    EventEmitter.call( this );
    var self = this;
    
    // Read config
    this.ReadJSON(process.cwd() + '/config.json', function(err, json) {
        if(!err) {
            self.Config = json;
                // Read permissions
                self.ReadJSON(process.cwd() + '/permissions.json', function(err, json) {
                    if(!err) {
                        self.Permissions = json;
                    } else {
                        console.log("Error reading permissions.json: " + err); 
                        process.exit(1);
                    }
                });
                
                console.log("["+self.Config.irc.nick+"] Starting");
                
                self.Modules = [];
                self.Commands = [];
            
                console.log("["+self.Config.irc.nick+"] Connecting to " + self.Config.irc.server.hostname + ":" + self.Config.irc.server.port);
                self.Client = new irc.Client(self.Config.irc.server.hostname, self.Config.irc.nick, {
                    userName: self.Config.irc.ident,
                    realName: self.Config.irc.name,
                    autoConnect: self.Config.irc.autoconnect,
                    port    : self.Config.irc.server.port,
                    channels: self.Config.irc.server.channels
                });
                
                self.Client.on('registered', function() {
                   self.emit('connected');
                });
                
                self.Client.addListener('invite', function(channel , from) {
                    self.emit('invite', {channel: channel, from: from});
                    if(self.Config.irc.invite.join)
                        self.Join(channel);
                });
                
                self.Client.addListener('part', function(channel, nick, reason, message) {
                    self.emit('part', {channel: channel, nick: nick, reason: reason, message: message});
                });
                
                self.Client.addListener('quit', function(nick, reason, channels, message) {
                    self.emit('quit', {nick: nick, reason: reason, channels: channels, message: message});
                });
                
                self.Client.addListener('kick', function(channel, victim, kicker, reason, message) {
                    self.emit('kick', {channel: channel, victim: victim, kicker: kicker, reason: reason, message: message});
                });
                
                self.Client.addListener('notice', function(nick, to, text, message) {
                    self.emit('notice', {nick: nick, to: to, text: text, message: message});
                });
                
                self.Client.addListener('nick', function(o, n, c, m) {
                    self.emit('nick', {old: o, "new": n, channels: c, message: m});
                });
                
                self.Client.addListener('ctcp-version', function(from, to, text, message) {
                    self.Client.ctcp(to, "privmsg", '\001VERSION ModularBot:0.0.1:Node.js\001');
                });
                
                self.Client.addListener('topic', function(channel, topic, nick, message) {
                    self.emit('topic', {channel: channel, topic: topic, nick: nick});
                });
                
                self.Client.addListener('join', function(channel, nick, message) {
                    self.emit('join', {channel: channel, nick: nick, message: message});
                });
                
                self.Client.addListener('kill', function(nick, reason, channels, message) {
                    self.emit('kill', {nick: nick, reason: reason, channels: channels, message: message});
                });
                
                self.Mongoose.connect('mongodb://' + self.Config.database.hostname + '/' + self.Config.database.path);
                
                self.Database.on('error', function(err) {
                    self.emit('db', 'Database: ' + err);
                    console.log("["+self.Config.irc.nick+"] [Database] " + err);
                    if(self.Config.database.require) {
                        console.log("["+self.Config.irc.nick+"] [Database] Not loading modules, if you want to load modules even though database is not connected, set require: false in database settings.");
                    } else {
                        self.Load();
            
                    }
                });
                
                self.Database.once('open', function() {
                    self.emit('db', 'Database: Connected');
                    console.log("["+self.Config.irc.nick+"] [Database] Connected");
                    if(self.Config.database.require)
                        self.Load();
                });
            
                return(self);
        } else {
            console.log("Error reading config.json: " + err);
            process.exit(1);
        }
    });
    

}



Bot.prototype = Object.create( EventEmitter.prototype );
Bot.prototype.Needle = needle;
Bot.prototype.Mongoose = mongoose;
Bot.prototype.Database = mongoose.connection;
Bot.prototype.Text = colors;
Bot.prototype.Authentication = Authentication;

Bot.prototype.ReadJSON = function(file, callback) {
    fs.readFile(file, 'utf8', function (err, data) {
        if (!err) {
            try {
                callback(null, JSON.parse(data));
            } catch(e) {
                callback(e, null);
            }
        } else {
            callback(err, null);
        }
    });
};

Bot.prototype.Join = function(channel) {
    this.Client.join(channel);
};

Bot.prototype.Part = function(channel, message) {
    this.Client.part(channel);
};

Bot.prototype.Connect = function() {
    this.Client.connect();
};

Bot.prototype.Disconnect = function(message, callback) {
    var self = this;
    if(!message) { message = "ModularBot" }
    this.Client.disconnect(message, function () {
        console.log("[" + self.Config.irc.nick + "] Disconnected");
    });
};

Bot.prototype.Whois = function(nick, callback) {
    this.Client.whois(nick, function(data) {
        callback(data);
    });
};

Bot.prototype.Send = function(target, message) {
    this.Client.say(target, message);
};

Bot.prototype.Command = function(target, trigger, args, callback) {
    var self = this;
    if (!callback && typeof args == 'function') {
        callback = args;
        args = {};
    }
    this.Client.addListener("message", function(from, to, message) {
        if(target == '#' && to != self.Config.irc.nick) {
            // Random Channel Trigger
            self.Parse(from, to, message, trigger, args,  function(parsed) {
                callback(parsed);
            });
        } else if(target === "*") {
            // Trigger all
            self.Parse(from, to, message, trigger, args,  function(parsed) {
                callback(parsed);
            });
        } else if(target.toLowerCase() == "msg" && to == self.Config.irc.nick) {
            // Trigger Message
            self.Parse(from, to, message, trigger, args,  function(parsed) {
                callback(parsed);
            });
        } else if(target.indexOf('#') > -1 && target.toLowerCase() == to.toLowerCase()) {
            // Specific Channel Trigger
            self.Parse(from, to, message, trigger, args,  function(parsed) {
                callback(parsed);
            });
        }
    });
};

Bot.prototype.Parse = function(from, to, message, trigger, args, callback) {
    var self = this;
    if(Object.keys(args).length === 0 && message == trigger) {
        // Simple Trigger
        self.Whois(from, function(from) {
            if(to.indexOf('#') > -1)
                for(var i in from.channels) {
                    if(from.channels[i] == to)
                        from.prefix = '';
                    if(from.channels[i].substr(1, from.channels[i].length) == to)
                        from.prefix = from.channels[i].substr(0,1);
                }
            self.Authentication.Check(self, trigger, from, function() {
                callback({from: from, to: to, message: message});
            });
        });
    } else {
        // Advanced Trigger
        var parser = {};
        var exp = '^' + trigger.replace('?', '\\?').replace('$', '\\$').replace('+', '\\+').replace('^', '\\^').replace('*', '\\*') + " ";
        Object.keys(args).forEach(function(key) {
            exp += args[key] + " ";
        });
        exp = exp.substr(0, -1 + exp.length) + "$";
        var regex = new RegExp(exp);
        if(regex.test(message)) {
            // Message matches command
            Object.keys(args).forEach(function(key) {
                parser[key] = Utils.Match(message.replace(trigger, ''), args[key])[1].trim();
            });
            self.Whois(from, function(from) {
                if(to.indexOf('#') > -1)
                    for(var i in from.channels) {
                        if(from.channels[i] == to)
                            from.prefix = '';
                        if(from.channels[i].substr(1, from.channels[i].length) == to)
                            from.prefix = from.channels[i].substr(0,1);
                    }
                self.Authentication.Check(self, trigger, from, function() {
                    callback({from: from, to: to, message: message, args: parser});
                });
            });
        } else {
            // Message does not match command
            return;
        }
    }
};

Bot.prototype.Timer = function(callback, duration) {
    setInterval(function() {
        callback();
    }, duration);
};

Bot.prototype.Load = function() {
    var self = this;
    
    // Reload permissions
    this.ReadJSON(process.cwd() + '/permissions.json', function(err, json) {
        if(!err) {
            self.Permissions = json;
        } else {
            console.log("Error reading permissions.json: " + err);   
        }
    });
    
    // Remove old listeners
    this.Client.removeAllListeners("message");

    // Add back default listener
    this.Client.addListener('message', function(from, channel, message) {
        self.emit('message', {from: from, channel: channel, message: message});
    });

    // Unload old modules, even if they're deleted
    Object.keys(require.cache).forEach(function(module) {
       if(module.indexOf('/modules/') > -1) {
           delete require.cache[module];
           console.log("["+self.Config.irc.nick+"] ["+module.split(process.cwd() + '/modules/')[1].split('.js')[0]+"] Unloaded");
       }
       self.Modules = [];
    });
    
    // Load new modules
    fs.readdir("./modules", function(err,files){
        if(err) {
            // Module directory does not exist.
            console.log("["+self.Config.irc.nick + "] : Fatal error, modules directory does not exist.");
            process.exit(1);
        } else {
            files.forEach(function(file){
                var Module = {
                    name    : file.split('.')[0],
                    file    : process.cwd() + "/modules/"+file,
                    loaded  : false
                };
                try {
                    Module.loaded = true;
                    Module.script = new (require(process.cwd() + "/modules/"+file)).Module(self, Module);
                    self.Modules.push(Module);

                    console.log("["+self.Config.irc.nick+"] ["+Module.name+"] Loaded");

                } catch(e) {
                    console.trace("["+self.Config.irc.nick+"] ["+Module.name+"]" + e.message);
                }
            });
        }
    });
};

exports.Bot = Bot;