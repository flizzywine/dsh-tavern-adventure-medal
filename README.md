# 酒馆游玩成就

在 DSH Tavern 中首次达成游玩成就时，屏幕中央会出现一张游玩成就卡。解锁后可在「设置 → 酒馆启动器 → 成就库」回看成就卡牌。

| 轮数 | 成就 |
| --- | --- |
| 50 | 佳作 |
| 100 | 名篇 |
| 300 | 传奇 |
| 500 | 史诗 |
| 1000 | 神话 |

任一游玩存档达到档位即可解锁。每档在同一酒馆档案中只颁发一次。首次启用或增加新档位时，插件根据已有存档补记已达成的档位。

## 安装

插件名为 `dsh-tavern-adventure-medal`。包含本插件的新版 DSH Tavern 会自动安装并启用，可在「设置 → 酒馆插件」停用。原先通过 ZIP 安装的同名插件会就地升级，保留成就记录和停用状态。

使用支持成就库的旧版酒馆时，可上传 [dsh-tavern-adventure-medal.zip](./dsh-tavern-adventure-medal.zip) 并按提示重启。

想试效果时，打开一段游玩对话，再到「设置 → 酒馆启动器 → 成就测试」选择档位。测试只预览弹窗和卡牌。

## 酒馆发行副本

酒馆发行版将本仓库的 `dsh-tavern-adventure-medal/` 放入 `tavern-plugin/packages/`。共用卡面的 `launcher-assets/` 同步到 `tavern-plugin/packages/dsh-tavern/assets/`，因此切换回原版 DSH 后，酒馆启动器仍能展示已解锁的卡牌。

本项目基于 [SilverLark257 的原版奖牌插件](https://github.com/SilverLark257/dsh-tavern-adventure-medal)。许可证见 [MIT License](./dsh-tavern-adventure-medal/LICENSE)。
