const groups = new JsonConfigFile('YoyoRobot/PureDeathMessagesAdapter/config.json', '{"groups": []}').get('groups')
ll.require('PureDeathMessages.js')
const yoyorobot = require('plugins/nodejs/yoyorobot/llseapi.js')

yoyorobot((yoyo) => {
    yoyo.listen('online', (event) => {
        const onDeathMessage = function(msg){
            groups.forEach(g => yoyo.client.sendGroupMsg(g, msg))
        }
        ll.exports(onDeathMessage, 'PureDeathMessagesAdapter', 'onDeathMessage')
        const registerListener = ll.import('PureDeathMessages', 'registerListener')
        registerListener('PureDeathMessagesAdapter', 'onDeathMessage')
    })
}, 'PureDeathMessagesAdapter')