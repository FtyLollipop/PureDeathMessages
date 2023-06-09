const config = new JsonConfigFile('plugins/PureDeathMessages/config.json')
const enabledEntity = config.get('enabledEntity')
const enableMobCustomName = config.get('enableMobCustomName')
const enableItemCustomName = config.get('enableItemCustomName')
const outputEmoji = config.get('outputEmoji')
const apiEmoji = config.get('apiEmoji')
const emojiSeparator = config.get('emojiSeparator')
const followGamerule = config.get('followGamerule')

const entity = (new JsonConfigFile(`plugins/PureDeathMessages/assets/entity.json`)).get(config.get('lang'))
const message = (new JsonConfigFile(`plugins/PureDeathMessages/assets/message.json`)).get(config.get('lang'))
const map = (new JsonConfigFile('plugins/PureDeathMessages/assets/map.json')).get("map")

const emoji = new JsonConfigFile('plugins/PureDeathMessages/assets/emoji.json')
const defaultEntityEmoji = emoji.get("defaultEntity")
const entityEmoji = emoji.get("entity")
const deathMessageEmoji = emoji.get("deathMessage")

ll.registerPlugin('PureDeathMessages', 'Output death messages.', [1, 0, 1])
logger.setConsole(config.get('logToConsole'))
logger.setFile(config.get('logToFile') ? 'logs/PureDeathMessages.log' : null)

let listenerFunctions = []
let registerListener = function (namespace, name) {
    listenerFunctions.push(ll.import(namespace, name))
}
ll.exports(registerListener, 'PureDeathMessages', 'registerListener')

mc.listen('onMobHurt', (mob, source, damage, cause) => {
    hurtEventHandler(mob, source, cause)
})
mc.listen('onMobDie', (mob, source, cause) => {
    const msg = deathEventHandler(mob, source, cause)
    if (msg) {
        logger.info(outputEmoji ? msg.join('') : msg[2])
        listenerFunctions.forEach(func => {
            func(apiEmoji ? msg.join('') : msg[2])
        })
    }
})

let lastDamageCause = {}

function stringFormat(str, args) {
    const regex = /%s/
    const _r = (p, c) => p.replace(regex, c)
    return args.reduce(_r, str)
}

function isTamed(mob) {
    return mob.getNbt(mob.uniqueId)?.getTag('IsTamed').toString() === '1' ? true : false
}

function deathEventHandler(mob, source, cause) {
    if (followGamerule && mc.runcmdEx('gamerule showdeathmessages').output.match(/true|false/).toString() === 'false') { return null }
    function getCustomName(mob) {
        return enableMobCustomName ? mob.getNbt().getTag('CustomName')?.toString() : null
    }

    let msg = null
    let args = []
    let emoji = ['', '', '']

    if (!enabledEntity[mob.type] || (!mob.isPlayer() && !isTamed(mob))) { return null }

    if (enableMobCustomName) {
        args.push(getCustomName(mob) ?? entity?.[mob.type] ?? mob.name)
    } else {
        if(mob.type === 'minecraft:player') {
            args.push(mob.name)
        } else {
            args.push(entity?.[mob.type] ?? mob.type)
        }
    }
    emoji[2] = entityEmoji[mob.type] ?? defaultEntityEmoji

    if (source) {
        if (enableMobCustomName) {
            args.push(getCustomName(source) ?? entity?.[source.type] ?? source.name)
        } else {
            if(source.type === 'minecraft:player') {
                args.push(source.name)
            } else {
                args.push(entity?.[source.type] ?? (getCustomName(source) ? source.type : source.name))
            }
        }
        emoji[0] = entityEmoji[source.type] ?? defaultEntityEmoji
        emoji[1] = deathMessageEmoji.exception?.[source.type]?.[cause]
    }

    if (cause === 1 && lastDamageCause[mob.uniqueId]?.['position']) {
        let pos = lastDamageCause[mob.uniqueId]?.['position']
        delete lastDamageCause[mob.uniqueId]
        for (let y = -1; y <= 2; y++) {
            for (let x = -1; x <= 1; x++) {
                for (let z = -1; z <= 1; z++) {
                    const block = mc.getBlock(pos.x + x, pos.y + y, pos.z + z, pos.dimid)?.type
                    if (block === 'minecraft:cactus') {
                        msg = message[map[cause]]
                        emoji[1] = deathMessageEmoji[cause]
                        break
                    } else if (block === 'minecraft:sweet_berry_bush') {
                        msg = message.exception?.['minecraft:sweet_berry_bush']?.[cause] ?? message[map[cause]]
                        emoji[1] = deathMessageEmoji.exception?.['minecraft:sweet_berry_bush']?.[cause] ?? deathMessageEmoji[cause]
                        break
                    }
                }
            }
        }
    } else if (cause === 2 && lastDamageCause[mob.uniqueId]?.['itemName']) {
        msg = message['death.attack.player.item']
        args.push(lastDamageCause[mob.uniqueId]?.['itemName'])
        delete lastDamageCause[mob.uniqueId]
    } else {
        msg = message?.[map.exception?.[source?.type]?.[cause]] ?? null
    }

    if (!msg) {
        msg = message?.[map?.[cause]] ?? `${message['death.attack.generic']} %Plugin data need to update * source:${args[0]} cause:${cause}%`
    }
    if (!emoji[1]) {
        emoji[1] = deathMessageEmoji[cause] ?? deathMessageEmoji['0']
    }

    return [emoji.join(''), emojiSeparator, stringFormat(msg, args)]
}

function hurtEventHandler(mob, source, cause) {
    if (!enabledEntity[mob.type] || (!mob.isPlayer() && !isTamed(mob))) { return }
    delete lastDamageCause[mob.uniqueId]
    if (source?.isPlayer() && cause === 2) {
        const item = mc.getPlayer(source.uniqueId).getHand()
        const itemNameNbt = item?.getNbt()?.getTag('tag')?.getTag('display')?.getTag('Name')
        if (itemNameNbt) {
            lastDamageCause[mob.uniqueId] = { 'itemName': enableItemCustomName ? itemNameNbt.toString() : mc.newItem(item.type, 1).name }
        }
    } else if (cause === 1) {
        let pos = mob.blockPos
        lastDamageCause[mob.uniqueId] = { 'position': { x: pos.x, y: pos.y, z: pos.z, dimid: pos.dimid } }
    }
}