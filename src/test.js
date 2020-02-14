const event = require('events');

const emitter = new event();

emitter.once('test', (value) => { console.log(value[0]) });
emitter.on('test', (value) => { console.log(value) });
setInterval(() => {emitter.emit("test", "test");}, 1000);