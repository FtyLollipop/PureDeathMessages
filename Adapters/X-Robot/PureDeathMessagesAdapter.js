ll.registerPlugin('PureDeathMessagesAdapter for X-Robot', 'Forward death messages to QQ groups through X-Robot.', [1, 0, 0])
ll.require('PureDeathMessages.js')
const registerListener = ll.import('PureDeathMessages', 'registerListener')

let command = mc.newCommand('puredeathmessagesadapterxrobot', 'PureDeathMessagesAdapter for X-Robot dedicated command. Do not use.', PermType.Console)
command.mandatory('msg', ParamType.String)
command.overload('msg')
command.setCallback((cmd, origin, output, results) => {
    output.addMessage(results.msg)
})
command.setup()

const onDeathMessage = function (msg) {
    mc.runcmdEx('puredeathmessagesadapterxrobot "' + msg + '"')
}

ll.exports(onDeathMessage, 'PureDeathMessagesAdapter', 'onDeathMessage')
registerListener('PureDeathMessagesAdapter', 'onDeathMessage')