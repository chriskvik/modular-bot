module.exports = {
    Check: function(Bot, trigger, sender, callback) {
        switch (Bot.Config.authentication.provider) {
            case 'NickServ':
                if(Permissions = this.Permissions(Bot, trigger)) {
                    if(sender.account)
                        if(Permissions.Groups)
                            if(Group = this.Group(Bot, sender.account))
                                if(Permissions.Groups.indexOf(Group) > -1)
                                    callback();
                                    
                        if(Permissions.Users)
                            if(Permissions.Users.indexOf(sender.account) > -1)
                                    callback();
                                    
                        if(Permissions.Prefixes)
                            if(Permissions.Prefixes.indexOf(sender.prefix) > -1)
                                callback();
                } else {
                    callback();
                }
                
                break;
            
            default:
                callback();
        }
    },
    Permissions: function(Bot, trigger) {
        for(var key in Bot.Modules) {
            var Module = Bot.Modules[key];
            if(Module.Permissions)
                if(Module.Permissions.Commands)
                    if(Module.Permissions.Commands[trigger])
                        return Module.Permissions.Commands[trigger];
        }
    },
    Group: function(Bot, sender) {
        if(Bot.Permissions.Groups)
            for(var key in Bot.Permissions.Groups) {
                if(Bot.Permissions.Groups[key].length > 0)
                    if(Bot.Permissions.Groups[key].indexOf(sender) > -1)
                        return key;
            }
    }
    
};


