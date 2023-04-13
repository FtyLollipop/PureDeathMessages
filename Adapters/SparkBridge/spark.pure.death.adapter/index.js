const config = new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/death.message/config.json')
ll.require('PureDeathMessages.js')
const registerListener = ll.import('PureDeathMessages', 'registerListener')

function onStart(adapter) {
    const groups = config.get('groups')
    const onDeathMessage = function(msg){
        groups.forEach(g => adapter.sendGroupMsg(g, msg))
    }
    registerListener('spark.pure.death.adapter', 'onDeathMessage')
    ll.exports(onDeathMessage, 'spark.pure.death.adapter', 'onDeathMessage')
}

function info() {
    return {
        name: 'spark.pure.death.adapter',
        desc: 'PureDeathMessage适配器-死亡消息转发到群聊',
        author: 'FtyLollipop',
        version: [1, 0, 0]
    }
}

module.exports = { onStart, info }