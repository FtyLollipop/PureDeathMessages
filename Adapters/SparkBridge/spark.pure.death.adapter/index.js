const groups = new JsonConfigFile('plugins/nodejs/sparkbridge/plugins/spark.pure.death.adapter/config.json', '{"groups": []}').get('groups')
ll.require('PureDeathMessages.js')

function onStart(adapter) {
    const onDeathMessage = function(msg){
        groups.forEach(g => adapter.sendGroupMsg(g, msg))
    }
    ll.exports(onDeathMessage, 'PureDeathMessagesAdapter', 'onDeathMessage')
    const registerListener = ll.import('PureDeathMessages', 'registerListener')
    registerListener('PureDeathMessagesAdapter', 'onDeathMessage')
}

function info() {
    return {
        name: 'spark.pure.death.adapter',
        desc: 'PureDeathMessages适配器-死亡消息转发到群聊',
        author: 'FtyLollipop',
        version: [1, 0, 0]
    }
}

module.exports = { onStart, info }