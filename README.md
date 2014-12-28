# Modular Bot (node.js)

Modular Bot is a modular irc bot written in node.js, It has an advanced parsers, timers, events and a permssion system.

### Version

0.0.1 alpha

### Tech

Modular Bot uses a number of open source projects to work properly:

* [node.js] - Evented I/O for the backend.
* [irc] - Modern IRC client library for Node.
* [irc-colors] - Color and formatting for irc bots made easy.
* [cline] - Command-line apps building library for Node.
* [mongoose] - MongoDB object modeling for Node.JS

### Installation

You need node.js and npm, we also recommend using pm2 to manage your processes.

```sh
$ git clone https://github.com/DanielGothenborg/modular-bot.git && cd modular-bot
$ npm install
```
Run with
```sh
$ node bot.js
```

### Modules

Modular Bot allows you to write your own modules, it wouldn't be very modular if not.
Modules must reside in the modules/ directory, there is already an Example.js file there
to get you started

### Plugins

Modular Bot is currently extended with the following plugins
* [mongoose] - Elegant mongodb object modeling for node.js
* [needle] - The leanest and most handsome HTTP client in the Nodelands.

### Todo's

 - Write Tests
 - Write Documentation
 - Implement more events

License
----

MIT


**Free Software, Hell Yeah!**
[node.js]:http://nodejs.org
[cline]:https://github.com/kucoe/cline
[irc-colors]:https://github.com/fent/irc-colors.js
[irc]:https://github.com/martynsmith/node-irc/
[mongoose]:https://github.com/LearnBoost/mongoose
[needle]:https://github.com/tomas/needle