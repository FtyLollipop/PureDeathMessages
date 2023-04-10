const config = new JsonConfigFile('plugins/death.message/config.json', '{"groups": [], "edition": "java"}')
const entityData = (new JsonConfigFile(`plugins/death.message/resources/entity.json`)).get(config.get('edition'))
const messageData = (new JsonConfigFile(`plugins/death.message/resources/message.json`)).get(config.get('edition'))
const mapData = (new JsonConfigFile('plugins/death.message/resources/map.json')).get("map")
const enabledEntity = config.get('enabledEntity')
const defaultEnabledEntity = {
    "minecraft:cat": true,
    "minecraft:donkey": true,
    "minecraft:horse": true,
    "minecraft:mule": true,
    "minecraft:player": true,
    "minecraft:worf": true
}
const enableMobCustomName = config.get('enableMobCustomName')
const enableItemCustomName = config.get('enableItemCustomName')
let lastDamageItemName = {}

ll.registerPlugin('death.message', '死亡信息转发', [1,0,0])
logger.setConsole(config.get('isLogPrt'))
logger.setFile(config.get('isLogFile') ? 'logs/death.message.log' : null)

mc.listen('onMobHurt', (mob, source, damage, cause) => {
    hurtEventHandler(mob, source, cause, enabledEntity)
})
mc.listen('onMobDie', (mob, source, cause) => {
    const msg = deathEventHandler(mob, source, cause, entityData, messageData, mapData, enabledEntity)
    if(msg) logger.info(msg)
})

function stringFormat(str, args) {
    const regex = /%s/
    const _r=(p,c) => p.replace(regex,c)
    return args.reduce(_r, str)
}

function isTamed(mob) {
    return mob.getNbt(mob.uniqueId)?.getTag('IsTamed').toString() === '1' ? true : false
}

function deathEventHandler(mob, source, cause, entity, message, map, enabledEntity = defaultEnabledEntity, enableMobCustomName = true) {
    function getCustomName(mob) {
        return enableMobCustomName ? mob.getNbt().getTag('CustomName')?.toString() : null
    }
    let msg = null
    let args = []
    if(!enabledEntity[mob.type] || (!mob.isPlayer() && !isTamed(mob))) { return null }
    delete lastDamageItemName[mob.uniqueId]

    // const pos = mc.getPlayer(mob.name).lastDeathPos
    // if(cause === 1) {
    //     for(let x = -1; x <= 1; x++) {
    //         for(let y = -2; y <= 1; y++) {
    //             for(let z = -1; z <= 1; z++) {
    //                 const block = mc.getBlock(pos.x + x, pos.y + y, pos.z + z, pos.dimid)?.type
    //                 if(block === 'minecraft:cactus') {
    //                     msg = message['death.attack.cactus']
    //                     break
    //                 } else if (block === 'minecraft:sweet_berry_bush') {
    //                     msg = message['death.attack.sweetBerry']
    //                     break
    //                 }
    //             }
    //         }
    //     }
    // } else {
    //     msg = message?.[map.exception?.[source?.type]?.[cause]] ?? null
    // }

    args.push(getCustomName(mob) ?? entity?.[mob?.type] ?? mob.name)

    if(source) {
        args.push(getCustomName(mob) ?? entity?.[source.type] ?? source.name)
    }

    if(lastDamageItemName[mob.uniqueId]){
        msg = message['death.attack.player.item']
        args.push(lastDamageItemName[mob.uniqueId])
    }
    if(!msg) {
        msg = message?.[map?.[cause]] ?? `${message['death.attack.generic']} %插件消息数据需要更新 source:${args[0]} cause:${cause}%`
    }
    return stringFormat(msg, args)
}

function hurtEventHandler(mob, source, cause, enabledEntity = defaultEnabledEntity, enableItemCustomName = true) {
    if(!enabledEntity[mob.type] || (!mob.isPlayer() && !isTamed(mob))) { return }
    if(!source?.isPlayer() || cause !== 2) {
        delete lastDamageItemName[mob.uniqueId]
        return
    }
    const item = mc.getPlayer(source.uniqueId).getHand()
    const itemNameNbt = item?.getNbt()?.getTag('tag')?.getTag('display')?.getTag('Name')
    if(enableItemCustomName && itemNameNbt) {
        lastDamageItemName[mob.uniqueId] = itemNameNbt.toString()
    } else {
        delete lastDamageItemName[mob.uniqueId]
    }
}