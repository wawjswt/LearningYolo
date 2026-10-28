# YOLOv5 系统课程全面审读记录

**审读日期：2026-10-28**

**范围：YOLOv5 系统课程及其前置检测课程，共 24 课、85 节、444 段正文、111 组随堂题。**

## 审读结论

本轮按网站最终组合后的课程正文逐课检查，不只看课程目录或源码片段。核对定义第一次出现的位置、章节承接、手算过程、张量维度、训练和推理的区别、图文数字、练习答案及版本说明；涉及 YOLOv5 实现的内容以仓库 v7.0 为准。

发现并处理了以下问题：课程结尾的“跟着例子走一遍”在多课重复正文；数据路径课重复讲标签坐标和 letterbox；YAML、损失和训练课重复已经教过的推导；检查点解释容易让人把 `best.pt` / `last.pt` 文件名当作完整续训保证；验证指标没有讲清表格中的 P/R 是如何选取置信度点的。已清理重复讲解，保留各课新增的计算、故障检查、形状追踪和图解，并补充 P/R 的 v7.0 计算说明。

按本轮审读范围，未发现仍未处理的确定性公式、形状或答案错误。课程仍有可以继续深化的方向，例如让更多交互图支持手动改变输入并重新计算；这不影响本轮已核对的现有讲解准确性。

## 逐课检查清单

| # | 课程 | 检查重点 | 结果 |
|---:|---|---|---|
| 1 | 目标检测从哪里来 | 检测任务输出、框坐标、滑窗与重复候选 | 定义和例子相符 |
| 2 | 两阶段检测：从 R-CNN 到 Faster R-CNN | Selective Search、R-CNN 区域网络、Fast/Faster 的特征共享与 RPN | 网络分支与原论文一致 |
| 3 | 一阶段检测：YOLO 与 SSD | 初代 YOLO 输出、密集预测、多尺度与 Anchor 分类轴 | 与 YOLOv5 区分清楚 |
| 4 | 走到 YOLOv5：问题、改进与版本边界 | 初代 YOLO 到 v5 的差异，课程固定版本 | v7.0 配置和旧版 Focus 说法有边界 |
| 5 | YOLOv5 整机图 | 输入、Backbone、Neck、Detect、训练/推理分流 | 640 输入和两类输出相符 |
| 6 | 仓库地图 | 模型、数据、损失、训练、验证及推理源码职责 | 文件职责与本地仓库对应 |
| 7 | 图片、标签与数据配置 | YOLO 标签列、归一化、路径解析、Letterbox、数据划分 | 算例已复算；路径规则按仓库实现表述 |
| 8 | 读懂模型 YAML | `from`、模块、重复次数、深度/宽度缩放与 Concat | s/l 两种缩放例子已复算 |
| 9 | Backbone | 卷积输出公式、BN、SiLU、各层尺寸 | 640 方形输入的逐层尺寸已对照配置 |
| 10 | C3 与 Bottleneck | 分支投影、内部重复、Add 与 Concat | 通道例子和 shortcut 条件相符 |
| 11 | SPPF | 连续池化、尺寸不变与有效范围 | 5/9/13 的来源及通道拼接相符 |
| 12 | FPN 与 PAN | 上采样、下采样、层连接和拼接约束 | 来源层及张量空间尺寸相符 |
| 13 | Detect 检测头 | 每候选字段、卷积通道、换轴、解码、训练/推理输出 | `nc+5`、两类 7 字段及 25,200 候选相符 |
| 14 | Anchor 与 AutoAnchor | 宽高变换、匹配比例、BPR/AAT 与单位 | 像素/网格单位已统一；匹配阈值边界相符 |
| 15 | 样本分配 | 中心格、邻格偏移、尺度与 Anchor 匹配 | 本地 v7.0 `build_targets` 算例相符 |
| 16 | 检测损失 | CIoU、物体性、类别 BCE、各项权重和 batch 缩放 | BCE 与 CIoU 算例及损失路径相符 |
| 17 | 训练循环 | batch、梯度累积、更新、验证和日志 | batch/更新/epoch 没有混为一谈 |
| 18 | 预训练、微调与断点续训 | 权重、模型结构与优化器/轮次状态 | 文件名不再被当成状态完整性保证 |
| 19 | 训练策略 | Mosaic、几何变换、输入尺寸、超参数和消融 | 变换同步、对照变量与版本选项已区分 |
| 20 | 验证与选模型 | TP/FP/FN、P/R、AP、mAP、fitness 与 IoU | 修正 P/R 置信度点说明；AP 与固定阈值 P/R 分清 |
| 21 | 推理与后处理 | 解码、分数门槛、NMS、坐标映回原图 | 手算框、IoU 及坐标变换复算相符 |
| 22 | 导出与部署 | ONNX 输入输出、NMS 边界及数值比对 | 导出文件和完整部署系统没有混为一谈 |
| 23 | 实图串讲 | 图片预处理、逐层张量、训练与推理路线 | 人工案例值已标明，不冒充实测预测 |
| 24 | 复盘与改进 | 数据、损失、候选筛选、失败记录与对照实验 | 排查步骤从可观察证据出发 |

## 本轮实际修订

- 移除了多门课程末尾重复正文式的通用复盘段，避免同一算例被重新讲一遍；课程专属正文和已有图解、交互入口保留。
- 数据课路径小节删去重复的标签坐标、补边计算，改用 YAML 路径→图片目录→标签文件的流程图；保留路径解析、文件配对、空标签/漏标区分和增强后框校验。数据划分小节增加固定划分清单与复现实验所需记录。
- YAML 课删去重复解释模块与 C3 的段落，留下按 `from` 检查形状、Concat 约束和运行前向核对的操作步骤。
- Anchor 课合并重复的解码数值与匹配门槛说明，集中讲清推理解码、训练样本匹配、AutoAnchor 几何检查各自回答的问题；不再在末尾重复同一算式。实图串讲课保留完整训练/推理回顾，删去重复的通用 recap。
- 损失课移除对 BCE / 物体性 / CIoU 已完成推导的重复回顾，保留单项计算、gain、尺度 balance 和反向传播标量之间的区别。
- 训练循环用一组明确的图片张量、标签行和三尺度原始输出维度，说明图片与标签各走哪条路径。
- 检查点课明确正常结束后的 `best.pt`、`last.pt` 可能被清理优化器状态；是否能完整续训要检查 checkpoint 内容。
- 验证课补充本地 v7.0 验证表格 P/R 的来源：按平滑后的平均 F1 选择一个共同置信度位置，再读取 P/R。AP 仍基于整条 PR 曲线，两者不能互换。部署门槛应按实际应用另行选择。

## 技术交叉核对

以下实现事实以 Ultralytics YOLOv5 **v7.0** 源码为准：

- Detect 的候选字段布局、每个尺度的 raw 输出、解码公式及 `nc + 5`：[`models/yolo.py`](https://github.com/ultralytics/yolov5/blob/v7.0/models/yolo.py)。
- Conv、Bottleneck、C3、SPPF 等模块：[`models/common.py`](https://github.com/ultralytics/yolov5/blob/v7.0/models/common.py)。
- 模型 YAML 的解析、深度/宽度缩放、来源层连接：[`models/yolo.py`](https://github.com/ultralytics/yolov5/blob/v7.0/models/yolo.py)。
- 标签读取与 batch 组装：[`utils/dataloaders.py`](https://github.com/ultralytics/yolov5/blob/v7.0/utils/dataloaders.py)；Anchor 匹配：[`utils/autoanchor.py`](https://github.com/ultralytics/yolov5/blob/v7.0/utils/autoanchor.py) 与 [`utils/loss.py`](https://github.com/ultralytics/yolov5/blob/v7.0/utils/loss.py)。
- 损失归约、对象性目标与训练更新：[`utils/loss.py`](https://github.com/ultralytics/yolov5/blob/v7.0/utils/loss.py)、[`train.py`](https://github.com/ultralytics/yolov5/blob/v7.0/train.py)。
- 验证匹配使用 IoU `>=` 对应阈值；源码相邻注释写有 `>`，实现比较符才是实际行为。验证曲线、P/R 点和 AP：[`val.py`](https://github.com/ultralytics/yolov5/blob/v7.0/val.py)、[`utils/metrics.py`](https://github.com/ultralytics/yolov5/blob/v7.0/utils/metrics.py)。
- 推理的预处理、NMS 和坐标还原：[`detect.py`](https://github.com/ultralytics/yolov5/blob/v7.0/detect.py)、[`utils/general.py`](https://github.com/ultralytics/yolov5/blob/v7.0/utils/general.py)；导出选项：[`export.py`](https://github.com/ultralytics/yolov5/blob/v7.0/export.py)。
- R-CNN 特征分支核对原论文：[`Rich feature hierarchies for accurate object detection`](https://arxiv.org/abs/1311.2524)；Fast R-CNN 与 Faster R-CNN：[`Fast R-CNN`](https://arxiv.org/abs/1504.08083)、[`Faster R-CNN`](https://arxiv.org/abs/1506.01497)。

## 数字、图解与练习核对

- 逐项核对了 24 课全部 111 组练习的题干、选项与正确答案索引；路径解析、Letterbox、YAML 缩放、卷积尺寸、Anchor、损失、AP/F1、解码与逆坐标等数值题均重新计算。
- 对照已组合课程中的架构、Detect、Anchor 匹配、损失、NMS 和训练流程图，检查图中文字与正文算例是否使用同一输入、类别数和坐标约定。
- 历史实测记录：YOLOv5l 两类模型在 640×640 输入的 raw 输出为 `[1,3,80,80,7]`、`[1,3,40,40,7]`、`[1,3,20,20,7]`，解码为 `[1,25200,7]`；640×480 为 `[1,18900,7]`。P2 四尺度两类例子为 `[1,102000,7]`。这些结构检查使用随机初始化权重，不代表精度结果。
- 历史本地前向还核对了 YOLOv5l 第 0～23 层形状，以及火焰标签在 P3/P4/P5 的 9/6/0 条匹配。检查点、Anchor 和图中示例的“真实训练结果”均需以当次运行日志为准。
- 曾在浏览器操作样本分配、物体性损失、NMS 类别开关及标签坐标互动，结果与相应手算相符。**本轮没有逐个点击全部 85 节的所有控件，也没有覆盖所有屏幕尺寸。**本次对交互图的全面性核对主要基于最终课程组件、图中数值和正文计算的一致性。

## 当前状态与范围说明

24 课的正文、章节结构、已知算例和答案键审读完毕；确定性重复与 P/R 说明问题已在本轮修正。本文没有声称所有图表控件均经过全组合浏览器操作，也没有把历史随机权重前向当成训练效果验证。YOLOv5 v7.0 之外的版本、分支或自定义配置，需按其实际配置和源码重新核对。
