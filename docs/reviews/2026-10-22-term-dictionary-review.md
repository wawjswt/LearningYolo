# 术语速查专栏：内容整理与实现记录

## 目标与资料

为 VisionLab 增加可独立访问的「术语速查」，服务于读课时遇到陌生词、阅读 PyTorch 代码和快速区分相近概念的学习者。

已读取用户提供的《深度学习常见术语与 PyTorch 实践手册》全部 49 页文本，并查看实际页面样例。手册涵盖整体训练流程、张量与自动求导、数据、模型层、损失、训练工程、评估、推理和保存；后半部分含模型概览、代码骨架、排错清单与 API 索引。

原始参考手册保存在网站 `resources/deep-learning-terms-pytorch-guide.pdf`，相关词条提供对应页入口。网页解释为独立整理，资料中提到某个术语不代表对应网页已有完整专题课程。

## 页面与数据

- 新入口：`#dictionary`，词条直达链接：`#dictionary/<term-id>`。
- 复用现有 354 个词条，补充 60 个独立词条，总计 414 个。
- 1505 个唯一名称／别名。合并后未发现不同词条占用同一别名的冲突。
- 10 类：基础概念 19、数学与统计 33、张量与自动求导 42、数据与预处理 48、网络层与结构 71、输出与损失 30、训练与优化 47、评估与决策 27、保存与部署 28、视觉检测与 YOLO 69。
- 84 个词条提供额外的用途、具体例子和边界说明，14 个词条含排版公式，32 个词条含可复制的代码示例／用法片段。
- 其余既有词条保留统一定义、例子或直觉、相关词和课程入口；不把全部词条包装成已完成长篇专题。
- 搜索匹配中文名、英文名、缩写、API、解释及扩展内容，优先完整名称匹配；忽略大小写及常见分隔符差异。课程搜索保留最多 8 个术语预览，完整词典不受这个上限限制。
- 支持主题筛选、每页 24 项的分页、空结果提示、词条链接复制、相关词导航和原始资料查阅。
- 课程中的术语卡增加「打开完整词条」，原有「去课程里继续学」仍可使用。
- 内容与自动提示共用 `visionlabGlossary`，没有第二套重复的术语定义。

## 从手册中需要澄清的表述

### 1. CrossEntropyLoss 不能一概排除 one-hot／浮点目标

手册第 4、24 页把此类输入概括为错误。准确说法是：常见硬标签为 long 类别索引；接口也支持与输入同形状的浮点概率目标。合法 one-hot 浮点分布是其特例。概率范围、各行和及形状应由使用者保证。

依据：[PyTorch CrossEntropyLoss](https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html)。词典同时给出两种目标的最小示例。

### 2. 模块注册、梯度记录与优化器管理不是同一件事

手册第 5 页把注册为模型参数写成更新的必要条件，对独立叶子张量优化来说过于绝对。优化器可以直接接收合适的张量；注册的作用是让模型统一找到与管理参数。

手册第 39 页把冻结后仍传给优化器一概列为错误也需要加条件。冻结应处理旧梯度，并明确参数组、动量及衰减行为；标准优化器通常跳过 grad=None 的参数，零梯度与 None 不同。

依据：[Autograd mechanics](https://docs.pytorch.org/docs/stable/notes/autograd.html)、[Optimizer.zero_grad](https://docs.pytorch.org/docs/stable/generated/torch.optim.Optimizer.zero_grad.html)、[Module](https://docs.pytorch.org/docs/stable/generated/torch.nn.Module.html)。

### 3. 梯度裁剪不直接约束任意优化器的参数更新上限

手册第 29 页的“限制一次更新的最大方向／大小”容易混淆梯度与更新。按范数裁剪限制的是输入优化器的梯度；动量、自适应缩放和权重衰减仍会影响最终参数变化。词条使用梯度范数的数值例子，并补充 AMP 先 unscale 的条件。

依据：[clip_grad_norm_](https://docs.pytorch.org/docs/stable/generated/torch.nn.utils.clip_grad_norm_.html)。

### 4. drop_last 不代表固定的样本永远不参与训练

第 14 页的说法只有固定顺序等条件下才成立。打乱后尾部样本可能每轮不同；可迭代数据集多进程加载还有额外边界。词条给出 10 个样本、batch_size=4 的明确分组。

依据：[torch.utils.data](https://docs.pytorch.org/docs/stable/data.html)。

### 5. 其他边界

- Dataset 类区分映射式与可迭代式接口；不是所有数据集都必须实现 `__getitem__` 与 `__len__`。
- `eval()` 改变相关层行为；`no_grad`、`inference_mode` 控制求导记录，职责不同。
- `view` 的形状操作取决于步幅兼容性；不能说所有非连续张量都无法 view。
- `detach` 切求导关系但通常共享存储；`clone` 复制数据但不自动断开求导。
- 梯度累积与单次大批次前向在 BatchNorm、随机性和损失分母等方面存在差别。
- `MultiheadAttention` 与 `scaled_dot_product_attention` 的布尔 mask 约定不同。
- 语言模型不只有下一 token 预测一种；注意力权重不自动构成因果解释。
- PR-AUC、Average Precision 与检测 AP 应按各自积分／匹配约定区分。

这些说明是针对已整理内容的核对记录，不表示原始手册每段代码都已实际运行。

## 实现文件

- `dist/textbook-dictionary-data.js`：新增词条与扩展内容、主题和来源映射。
- `dist/textbook-dictionary.js`：列表、搜索与筛选、分页、详情和复制交互。
- `dist/textbook-dictionary.css`：沿用现有字体、纸色与紫色标识，含窄屏列表／详情布局。
- `dist/textbook-glossary.js`：加载补充词条，复用名称匹配，增加完整词条入口。
- `dist/textbook-ui-v3.js`、`dist/textbook-app.js`、`dist/index.html`：接入路由、搜索、侧栏和资源。

## 本轮实际检查范围

- 检查修改的 JavaScript 语法。
- 按页面实际加载顺序读取词条，审阅名称冲突、分类数量、相关词与课程目标；没有发现冲突别名或失效的课程 ID／相关词 ID。
- 在本地页面查看中文／英文 API 搜索、带空格的英文搜索、分类与分页、空结果提示、详情跳转和代码复制反馈。
- 查看 CrossEntropyLoss、LoRA 详情和公式排版；所查看页面没有 KaTeX 错误节点，也没有页面横向溢出，浏览器错误日志为空。
- 未执行 PyTorch 示例代码，未新增或运行自动化测试；窄屏样式已提供，未模拟移动设备。

发布版本及对应提交以本次发布工具返回结果为准。
