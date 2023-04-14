# PureDeathMessages 死亡消息输出

适用于[LiteLoaderBDS](https://github.com/LiteLDev/LiteLoaderBDS)的死亡消息输出插件，支持多种可自定义的配置项，并提供API导出供其他插件监听，您可以：

- 在群内看到基岩版内原汁原味的死亡消息，包括已驯服生物
- 可选使用基岩版或Java版翻译
- 配置哪些实体不转发死亡消息
- 屏蔽实体或物品的自定义名称，防止敏感词汇被意外转发到群内
- 可选启用emoji，使消息更生动，可自行更改文件以自定义emoji列表
- 将游戏规则`showdeathmessages`设为`false`时，死亡消息转发可以像游戏内一样暂时停止
- 在您自己的插件里使用本插件导出的API监听并使用输出的死亡消息

最新支持的Minecraft Bedrock版本：1.19.x

理论最高支持的Minecraft Bedrock版本：1.20.x

## 安装

1. 安装LiteLoaderBDS。

2. [下载PureDeathMessages.zip](https://github.com/FtyLollipop/PureDeathMessages/releases)并解压。

3. 将解压出的`PureDeathMessages`文件夹和`PureDeathMessages.js`放到`BDS根目录\plugins`目录中，注意不要嵌套，安装后的目录结构应该如下：

   ```
   plugins
   ├── PureDeathMessages.js     // 插件主程序
   └── PureDeathMessages
       ├── config.json          // 配置文件
       └── assets
           ├── emoji.json       // emoji数据
           ├── entity.json      // 实体数据
           ├── message.json     // 死亡消息数据
           └── map.json         // 死亡消息映射数据
   ```

## 配置

配置文件为`config.json`，如果需要原汁原味的基岩版死亡消息，则除群号外无需改动任何配置项。

- `lang`：死亡消息内容遵循的语言，`"bedrock"`为基岩版中文翻译，`"java"`为Java版中文翻译，`"en_US"`为英文。Java版翻译建议配合镐老板的[基岩版译名修正包](https://github.com/ff98sha/mclangcn)食用。
- `enabledEntity`：启用死亡消息的实体列表，在对应生物的命名空间ID后设定是否启用。`true`为是，`false`为否。
- `enableMobCustomName`：是否启用生物的自定义名称。`true`为是，`false`为否。启用时，如果被驯服的生物死亡，拥有使用命名牌自定义的名称则优先使用名称，否则不使用。
- `enableItemCustomName`：是否启用物品的自定义名称。`true`为是，`false`为否。启用时，如果玩家使用了用铁砧重命名后的物品击杀了生物或其他玩家，则优先使用重命名后的名称，否则不使用。
- `emojiSeparator`：emoji和死亡消息之间的分隔符。
- `outputEmoji`：控制台和日志文件输出是否启用emoji，`true`为是，`false`为否。启用时，输出的每一条死亡信息开头都会带上与死亡消息内容有关联的2-3个emoji表情。
- `apiEmoji`：API获取的死亡消息是否启用emoji，`true`为是，`false`为否。启用时，API获取的每一条死亡信息开头都会带上与死亡消息内容有关联的2-3个emoji表情。
- `followGamerule`：死亡消息输出（包括API）是否跟随gamerule的`showdeathmessages`项，`true`为是，`false`为否。设为否则始终输出。
- `logToConsole`: 死亡消息是否输出到控制台。`true`为是，`false`为否。
- `logToFile`: 死亡消息是否输出到日志文件。`true`为是，`false`为否。日志文件路径：`BDS根目录\logs\PureDeathMessages.log`。

下面是默认的配置文件示例：

```json
{
    "lang": "bedrock",
    "enabledEntity": {
        "minecraft:cat": true,
        "minecraft:donkey": true,
        "minecraft:horse": true,
        "minecraft:mule": true,
        "minecraft:player": true,
        "minecraft:wolf": true
    },
    "enableMobCustomName": true,
    "enableItemCustomName": true,
    "emojiSeparator": "  ",
    "outputEmoji": false,
    "apiEmoji": false,
    "followGamerule": true,
    "logToConsole": true,
    "logToFile": true
}
```

  

## 已知问题

由于LiteLoaderBDS提供的API无法监听实体以外的伤害来源，所以无法很好地区分死于仙人掌的伤害或死于甜浆果丛的伤害。当玩家或生物死于仙人掌伤害或甜浆果丛伤害时，如果死亡点周围一格内同时存在仙人掌和甜浆果丛，死亡消息可能不准确。

死亡消息是否输出跟随gamerule功能使用LiteLoaderBDS的API`mc.runcmdEx`判断实现，虽然命令执行结果不会显示在控制台，但有些插件可能会捕获该消息并予以显示，如果对您有影响，请将配置项的`followGamerule`设为`false`。

有特殊死亡情况可能未手动覆盖到，请在GitHub提交[issue](https://github.com/FtyLollipop/spark-death-message/issues)。

## API使用指南

本插件提供API导出供其他插件使用，以Javascript插件为例：

1. 定义一个用来监听死亡消息时需要用到的函数作为回调函数，接收的唯一参数为`String`类型的死亡消息。

2. 使用`ll.exports`导出之前定义的回调函数。

3. 使用`ll.import`导入`PureDeathMessages`命名空间下的`registerListener`。

4. 使用`registerListener`函数向`PureDeathMessages`注册导出的回调函数，用法为：`registerListener(namespace, name)`

   - 参数

     - namespace : `String`

       回调函数使用的命名空间名称

     - name : `String`

       回调函数使用的导出名称

下面是完整的使用实例代码片段：

```javascript
ll.require('PureDeathMessages.js')
const onDeathMessage = function (msg) {
    // 插件中需要使用msg的代码
}
ll.exports(onDeathMessage, 'PureDeathMessagesAdapter', 'onDeathMessage')
const registerListener = ll.import('PureDeathMessages', 'registerListener')
registerListener('PureDeathMessagesAdapter', 'onDeathMessage')
```




## 协议

本插件按照[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-Hans)协议发布。