/* 术语速查的补充内容。与课程 tooltip 共用词条，不另建一套定义。 */
(()=>{
  const docs='https://docs.pytorch.org/docs/stable/';
  const entries=[];
  const add=(id,title,aliases,definition,example,why,pitfall,category,course,api='',code='',related=[])=>entries.push({id,title,aliases,definition,example,why,pitfall,category,course,api,code,related});
  add('requires-grad','梯度记录标志（requires_grad）',['requires_grad','requires_grad_'],
    'requires_grad 是张量上的标志，表示自动求导是否需要为它计算梯度。它与是否交给优化器、是否执行更新，是不同的问题。',
    '令 w=2，计算 L=w²；开启记录后执行 backward，w.grad 得到 4，w 本身仍是 2。',
    '用来决定哪些张量需要梯度，也用于冻结模型的一部分参数。',
    '开启记录不保证参数会更新；冻结时还应清除遗留梯度，并确认优化器参数组和模型状态。',
    'tensors','gradient-diagnostics','notes/autograd.html',
    'import torch\nw = torch.tensor(2.0, requires_grad=True)\nloss = w.square()\nloss.backward()\nprint(w.item(), w.grad.item())  # 2.0, 4.0',['autograd','freeze-parameters','optimizer']);
  add('leaf-tensor','叶子张量（leaf tensor）',['叶子张量','叶子节点','leaf tensor','is_leaf','grad_fn'],
    '在自动求导图中，叶子张量是梯度追踪的起点。需要梯度且由用户直接创建的张量通常是叶子；运算得到的中间结果通常不是。',
    'w 是直接创建的参数，z=2w 是中间结果。backward 后默认保留 w.grad，不默认保留 z.grad。',
    '帮助分清参数与中间结果，理解为什么读取某个结果的 .grad 会得到 None。',
    '非叶子张量若要保留梯度，需在反向前调用 retain_grad()；requires_grad=False 的张量按约定也属于叶子。',
    'tensors','gradient-chain-rule','generated/torch.Tensor.is_leaf.html',
    'import torch\nw = torch.tensor(3.0, requires_grad=True)\nz = 2 * w\nz.retain_grad()\nz.square().backward()\nprint(w.is_leaf, z.is_leaf)  # True, False\nprint(w.grad.item(), z.grad.item())  # 24.0, 12.0',['requires-grad','computation-graph','gradient']);
  add('detach','切断求导关系（detach）',['detach','detach()'],
    'detach() 返回一个不再跟踪原求导关系的张量。它通常与原张量共享存储，因此切断梯度不等于复制数值。',
    '把训练中的预测结果 detach 后保存，可以记录数值而不把整张求导图一起留住。',
    '用于记录结果或明确阻断某条分支的梯度。',
    '共享存储上的原地修改可能影响原张量；要独立副本可用 detach().clone()。切断后不能再期待梯度沿原路径返回。',
    'tensors','gradient-diagnostics','generated/torch.Tensor.detach.html',
    'import torch\nx = torch.tensor([2.0], requires_grad=True)\ny = x * 3\nsaved = y.detach().clone()\nprint(saved.requires_grad, saved.tolist())  # False, [6.0]',['no-grad','inference-mode','computation-graph']);
  add('no-grad','不记录梯度的上下文（no_grad）',['no_grad','torch.no_grad','no_grad()'],
    'torch.no_grad() 让上下文中的普通计算不被记录到反向求导图里。它控制梯度记录，不改变 Dropout 或 BatchNorm 的训练状态。',
    '计算验证集预测时通常只需要分数，不需要为这些预测保存反向所需的信息。',
    '减少不需要求导时的图记录开销；其结果可在合适条件下用于之后需要求导的计算。',
    '它不会自动调用 model.eval()，也不会移动数据到 CPU。部分创建张量的工厂函数有例外，不能把它当成全局冻结开关。',
    'tensors','checkpoint-inference','generated/torch.no_grad.html',
    'import torch\nlayer = torch.nn.Linear(2, 1)\nlayer.eval()\nwith torch.no_grad():\n    result = layer(torch.ones(1, 2))\nprint(result.requires_grad)  # False',['eval-mode','inference-mode','detach']);
  add('inference-mode','纯推理上下文（inference_mode）',['inference_mode','torch.inference_mode','inference_mode()'],
    'inference_mode 是面向纯推理的上下文：关闭求导记录，并进一步省去视图追踪、版本计数等开销。它比 no_grad 的限制更多。',
    '给新照片做分类，只取输出而不再把结果接入训练图，就是典型使用场景。',
    '降低纯评估和部署推理中的额外开销。',
    '其中创建的推理张量不能随意用于之后需要 autograd 保存中间值的运算。还需要单独调用 model.eval()。',
    'tensors','checkpoint-inference','generated/torch.autograd.grad_mode.inference_mode.html',
    'import torch\nmodel = torch.nn.Linear(2, 3).eval()\nwith torch.inference_mode():\n    scores = model(torch.ones(1, 2))\n    print(scores.argmax(dim=1))',['no-grad','eval-mode','inference']);
  add('nn-module','模型模块（nn.Module）',['nn.Module','torch.nn.Module'],
    'nn.Module 是 PyTorch 组织模型和网络层的基类。它管理子模块、注册参数与缓冲状态，并提供模式切换、设备迁移和保存接口。',
    '把 self.fc 定义成 nn.Linear，父模型就能找到这层的权重；放进普通 Python 列表则不会自动注册。',
    '让模型的组成部分能统一迁移、保存和参与优化。',
    '自定义模型先调用 super().__init__()；多个子层用 ModuleList 或 Sequential 注册。通常调用 model(x)，让模块调用机制处理 hooks。',
    'layers','network','generated/torch.nn.Module.html',
    'import torch\nfrom torch import nn\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc = nn.Linear(2, 3)\n    def forward(self, x):\n        return self.fc(x)\nmodel = Net()\nprint(model(torch.ones(4, 2)).shape)  # [4, 3]',['nn-parameter','buffer','forward-pass']);
  add('nn-parameter','可注册的参数张量（nn.Parameter）',['nn.Parameter','torch.nn.Parameter'],
    'nn.Parameter 是一种特殊 Tensor。把它赋给 nn.Module 的属性时会自动注册为模型参数，随后能由 model.parameters() 找到。',
    '自定义一层 y=x·scale，把 scale 写成 Parameter 后，优化器才能通过模型参数列表找到这个旋钮。',
    '用于定义需要交给优化器管理的自定义参数。',
    'Parameter 也可以被冻结；注册、梯度记录和优化器更新是不同环节。优化器也能直接接收独立的叶子张量，并非所有优化都必须先注册到模型。',
    'layers','network','generated/torch.nn.parameter.Parameter.html',
    'import torch\nfrom torch import nn\nmodel = nn.Module()\nmodel.scale = nn.Parameter(torch.tensor(1.0))\nprint([name for name, _ in model.named_parameters()])  # ["scale"]',['parameter','requires-grad','nn-module']);
  add('dataset-class','样本读取接口（Dataset 类）',['torch.utils.data.Dataset','Dataset 类','__getitem__','__len__'],
    'PyTorch 的 Dataset 是组织样本读取方式的接口。常见的映射式 Dataset 用索引取一个样本；可迭代式 Dataset 则按流逐条产生样本。',
    '索引 7 对应读取第 8 张图片和它的标签；DataLoader 再把多次读取的结果组合成批次。',
    '把数据读取逻辑与模型、训练循环分开。',
    '不是所有 Dataset 都必须实现 __len__ 和 __getitem__；IterableDataset 使用 __iter__。别把抽象的数据集合与具体接口完全等同。',
    'data','training-loop','data.html',
    'import torch\nfrom torch.utils.data import TensorDataset, DataLoader\ndata = TensorDataset(torch.arange(6).float().reshape(3, 2), torch.tensor([0, 1, 0]))\nloader = DataLoader(data, batch_size=2, shuffle=False)\nfor x, y in loader:\n    print(x.shape, y.shape)',['dataset','dataloader','batch']);
  add('shuffle','打乱样本顺序（shuffle）',['shuffle','shuffle=True'],
    'shuffle 指在数据遍历时重新排列样本顺序。对常见映射式数据集，DataLoader 的 shuffle=True 会在每轮生成新的随机顺序。',
    '原数据按猫、狗分段排列；打乱后，一个批次更可能同时遇到两种样本。',
    '减少固定顺序对小批次训练的影响。',
    '打乱不会修复数据泄漏或类别不平衡；验证时不打乱通常便于复现与对齐结果，打乱本身不必然让完整集指标错误。',
    'data','training-loop','data.html','','',['dataloader','random-seed','class-imbalance']);
  add('drop-last','丢弃不足批次（drop_last）',['drop_last','drop_last=True'],
    'drop_last 控制 DataLoader 是否舍弃最后一个不足 batch_size 的批次。默认 False，通常保留这些样本并返回较小批次。',
    '10 个样本、batch_size=4：保留时为 4、4、2；丢弃时只返回前两个满批次。',
    '某些依赖固定批次形状的训练设置需要满批次；多数评估应保留全部样本。',
    '打乱后各轮被丢弃的样本可能不同，不能说它们永远不参与训练。IterableDataset 多进程加载还有按 worker 丢弃尾批次的差别。',
    'data','training-engineering','data.html','','',['batch','shuffle','dataloader']);
  add('num-workers','数据加载子进程数（num_workers）',['num_workers'],
    'num_workers 指 DataLoader 使用多少个子进程准备数据；0 表示在主进程加载。它影响的是数据准备，不是 GPU 计算线程数。',
    '模型在处理上一批图片时，worker 可以读取和变换下一批，减少等待。',
    '帮助缓解读取、解码和预处理的瓶颈。',
    '数量更大不一定更快，还可能增加内存和进程开销；Windows 多进程入口通常需要 if __name__ == "__main__" 保护。',
    'data','training-loop','data.html','','',['dataloader','throughput','cpu']);
  add('pin-memory','固定页内存（pinned memory）',['pin_memory','pinned memory','固定页内存'],
    '固定页内存是不会被操作系统换出的主机内存。DataLoader 的 pin_memory=True 可把返回的张量放在这种 CPU 内存中，便于向加速设备传输。',
    '先在 CPU 准备批次，再把它送进 GPU；固定页内存优化的是这段搬运的条件。',
    '配合合适的异步拷贝与执行方式，可能降低数据传输等待。',
    '它不会自动把数据移到 GPU；non_blocking=True 也不保证计算与传输一定重叠，实际收益受设备和代码安排影响。',
    'data','training-loop','data.html','','',['device','dataloader','throughput']);
  add('reshape','重塑张量形状（reshape）',['reshape','reshape()'],
    'reshape 按目标形状重新组织同一组元素，不改变元素总数。内存布局允许时返回视图，否则可能复制数据。',
    '6 个连续数可以看成 2 行 3 列，也能重新看成 3 行 2 列；这不等于把原矩阵转置。',
    '把张量整理成下一层所需的形状。',
    'reshape 不负责交换轴的语义；不要把 HWC 图像直接 reshape 成 CHW。要换轴使用 permute。',
    'tensors','tensor-layout','generated/torch.reshape.html',
    'import torch\nx = torch.arange(6).reshape(2, 3)\nprint(x.reshape(3, 2))\nprint(x.permute(1, 0))  # 与上面的数值排列不同',['view','permute','shape']);
  add('view','共享存储的形状视图（view）',['view','view()','Tensor.view'],
    'Tensor.view 在满足步幅兼容条件时，返回与原张量共享存储的另一种形状视图。这里指 view 的形状版本。',
    '连续排列的 6 个数通常可直接 view 成 2×3；换轴后的布局不一定能直接展平为视图。',
    '在允许的内存布局上改变观察形状而不复制元素。',
    '并非任何非连续张量的 view 都失败，关键是所需维度是否满足步幅条件；不确定时可用 reshape，但它可能复制。',
    'tensors','tensor-layout','generated/torch.Tensor.view.html',
    'import torch\nx = torch.arange(6).view(2, 3)\ny = x.permute(1, 0)\nz = y.contiguous().view(-1)\nprint(z)  # [0, 3, 1, 4, 2, 5]',['reshape','stride','contiguous']);
  add('permute','重新排列轴（permute）',['permute','permute()'],
    'permute 按给定顺序重新排列张量各条轴，通常通过改变形状和步幅返回共享存储的视图。',
    '形状 [2,3,4] 用 permute(0,2,1) 变为 [2,4,3]；第二、三条轴的职责交换。',
    '用于图像布局、序列布局等轴顺序转换。',
    '换轴不是重塑；结果可能不连续，但换轴本身通常不复制所有元素。',
    'tensors','tensor-layout','generated/torch.permute.html',
    'import torch\nx = torch.arange(24).reshape(2, 3, 4)\ny = x.permute(0, 2, 1)\nprint(y.shape, y.is_contiguous())  # [2, 4, 3], False',['reshape','view','stride']);
  add('squeeze','移除长度为 1 的轴（squeeze）',['squeeze','squeeze()'],
    'squeeze 移除指定的、长度为 1 的轴；不指定轴时会移除全部长度为 1 的轴。元素数量不变。',
    '预测形状 [1,1] 只想去掉末尾输出轴：squeeze(-1) 得到 [1]，无参数 squeeze() 则得到标量。',
    '在保留批次语义的前提下整理输出形状。',
    'batch_size=1 时，不指定轴可能误删批次轴，造成损失或指标计算错误。',
    'tensors','tensor-layout','generated/torch.squeeze.html',
    'import torch\nx = torch.ones(1, 1)\nprint(x.squeeze().shape)     # []\nprint(x.squeeze(-1).shape)   # [1]',['shape','batch','broadcasting']);
  add('unsqueeze','插入长度为 1 的轴（unsqueeze）',['unsqueeze','unsqueeze()'],
    'unsqueeze 在指定位置插入一条长度为 1 的轴。它改变形状，通常与原张量共享数据。',
    '[3] 的向量用 unsqueeze(0) 变为 [1,3]，表示一个含 3 个特征的样本批次。',
    '让输入符合层的形状要求，或明确广播中的轴对应关系。',
    '加一条轴不会自动赋予正确语义；放错位置仍可能得到可运行但错误的广播。',
    'tensors','tensor-operations','generated/torch.unsqueeze.html',
    'import torch\nx = torch.tensor([1., 2., 3.])\nprint(x.unsqueeze(0).shape)  # [1, 3]\nprint(x.unsqueeze(1).shape)  # [3, 1]',['squeeze','broadcasting','axis']);
  add('tensor-item','提取单个数（Tensor.item）',['Tensor.item','item()','loss.item()'],
    'item() 从只包含一个元素的张量提取普通 Python 数字。这个数字不再携带张量的求导关系。',
    '用 loss.item() 记日志；反向传播仍应调用原来的 loss.backward()。',
    '把单个张量数值交给日志、格式化和普通 Python 控制流程。',
    '多元素张量不能直接 item()；CUDA 张量取值需要等待相关计算，频繁调用可能造成同步开销。',
    'tensors','gradient-diagnostics','generated/torch.Tensor.item.html',
    'import torch\nx = torch.tensor(3.0, requires_grad=True)\nloss = x.square()\nnumber = loss.item()\nloss.backward()\nprint(number, x.grad.item())  # 9.0, 6.0',['detach','backpropagation','latency']);
  add('bfloat16','脑浮点格式（Brain Floating Point，BF16）',['bfloat16','BF16','torch.bfloat16'],
    'BF16 是 16 位浮点格式，指数位数与 FP32 相同，数值范围较大，但有效精度较低。它与 FP16 的范围和精度取舍不同。',
    '接近 1 的细微差别可能在 BF16 中舍入为同一个数；较大的值却比 FP16 更不容易溢出。',
    '在支持的硬件上降低存储与计算成本，同时保留较大的指数范围。',
    '低精度不等于所有计算都适合低精度；硬件支持、算子选择和误差都要看实际环境。BF16 通常不需要 FP16 那样的梯度缩放。',
    'tensors','optimizer-tuning','amp.html','','',['dtype','fp16','amp']);
  add('layer-normalization','层归一化（Layer Normalization，LayerNorm）',['LayerNorm','层归一化','Layer Normalization'],
    'LayerNorm 对每个样本指定的末尾若干维计算均值、方差并归一化，通常再做可学习的缩放和平移。统计范围由 normalized_shape 决定。',
    '输入 [B,T,D] 使用 LayerNorm(D)，会分别对每个样本、每个位置的 D 个特征做归一化。',
    '在不依赖同一批其他样本统计量的情况下调节特征尺度，常见于 Transformer。',
    '不要把它理解为固定对整条样本所有轴归一化；要看 normalized_shape。训练与评估通常都用当前输入的统计量。',
    'layers','network-extensions','generated/torch.nn.LayerNorm.html',
    'import torch\nx = torch.randn(2, 3, 4)\nlayer = torch.nn.LayerNorm(4)\ny = layer(x)\nprint(y.shape)  # [2, 3, 4]\nprint(y.mean(dim=-1))  # 各位置接近 0（初始缩放和平移）',['batch-normalization','mean','variance']);
  add('rms-normalization','均方根归一化（Root Mean Square Normalization，RMSNorm）',['RMSNorm','均方根归一化','RMS Normalization'],
    'RMSNorm 用特征的均方根来缩放输入，通常带可学习的逐元素缩放。与 LayerNorm 不同，它不先减去均值。',
    '[3,4] 的均方根为 √((9+16)/2)，把各项除以这个值可统一整体尺度，但不会把均值移到 0。',
    '以较简洁的计算控制特征幅度，常用于现代语言模型。',
    '不要把 RMSNorm 的输出说成零均值；归一化轴和 epsilon 仍需对照具体实现。',
    'layers','network-extensions','generated/torch.nn.RMSNorm.html','','',['layer-normalization','normalization','mean']);
  add('embedding','嵌入向量与查表层（Embedding）',['Embedding','nn.Embedding','嵌入向量','嵌入层'],
    'Embedding 用离散编号查出一个稠密向量。nn.Embedding 把这些向量存成可学习的表；向量的数值通过训练调整。',
    '词编号 [2,5] 查表后得到两行向量；若每行长度 4，输出形状就是 [2,4]。',
    '把词、物品等离散身份转换成后续网络可计算的连续表示。',
    '编号大小不代表语义远近；输入一般用整型索引，需在词表范围内。padding_idx 可让指定行不获得这层的梯度更新。',
    'layers','network','generated/torch.nn.Embedding.html',
    'import torch\ntable = torch.nn.Embedding(10, 4)\nids = torch.tensor([[2, 5, 1]], dtype=torch.long)\nprint(table(ids).shape)  # [1, 3, 4]',['one-hot','feature','parameter']);
  add('attention','注意力（Attention）',['Attention','注意力','scaled dot-product attention'],
    '注意力根据查询 Query 与键 Key 的匹配分数计算权重，再对值 Value 加权求和。它让当前位置按内容选择要汇集的信息。',
    '阅读“它在睡觉”时，当前位置可给前文“猫”的表示更高权重，汇集与当前判断相关的信息。',
    '让不同位置建立依赖，动态组合上下文，而不是只用固定邻域。',
    '权重高不等于严格因果解释。标准密集注意力的分数矩阵随序列长度平方增长；特殊结构和实现有不同开销。',
    'layers','network-gated-activations','generated/torch.nn.functional.scaled_dot_product_attention.html','','',['transformer','mask','embedding']);
  add('multihead-attention','多头注意力（Multi-Head Attention，MHA）',['多头注意力','MultiheadAttention','Multi-Head Attention','MHA'],
    '多头注意力把表示投影到多个子空间，各自计算注意力，再拼接各头结果并做输出投影。不同头可以学习不同关系。',
    '256 维、8 个头时，每头通常处理 32 维投影，最后重新组合成 256 维输出。',
    '让同一位置从多种匹配方式汇集上下文。',
    'nn.MultiheadAttention 默认不是 batch_first=True；使用时要明确 [T,B,D] 还是 [B,T,D]，以及 mask 的 True 表示什么。',
    'layers','network-gated-activations','generated/torch.nn.MultiheadAttention.html',
    'import torch\nlayer = torch.nn.MultiheadAttention(8, 2, batch_first=True)\nx = torch.randn(2, 3, 8)\ny, _ = layer(x, x, x, need_weights=False)\nprint(y.shape)  # [2, 3, 8]',['attention','transformer','mask']);
  add('sequence-padding','序列补齐（sequence padding）',['序列补齐','sequence padding','pad_sequence','padding_idx'],
    '序列补齐用专门的占位值把不同长度的序列补到统一长度，以便组成一个形状规则的批次。占位内容不是真实输入。',
    '长度分别为 3 和 2 的两句话，第二句补一个 PAD，形成 [2,3] 的编号张量。',
    '让变长文本、音频等数据能够批量计算。',
    '补齐后通常还需掩码；仅设置 Embedding 的 padding_idx 不会自动让所有注意力、池化和损失忽略 PAD。',
    'data','tensor-operations','generated/torch.nn.utils.rnn.pad_sequence.html','','',['mask','embedding','batch']);
  add('causal-mask','因果掩码（causal mask）',['因果掩码','causal mask','causal masking'],
    '因果掩码限制某位置只能使用允许的历史信息，不能看到未来位置。它是自回归训练避免泄漏答案的重要约束。',
    '预测第 4 个词时，只允许使用前 3 个词；不能偷看第 4 个词及后面的正确内容。',
    '让训练中的可见信息符合逐步生成时的条件。',
    '不同 PyTorch 注意力 API 对布尔 mask 的约定可能相反：MultiheadAttention 中 True 表示禁止，scaled_dot_product_attention 中 True 表示允许参与。',
    'layers','training-data-splits','generated/torch.nn.functional.scaled_dot_product_attention.html','','',['mask','attention','autoregressive']);
  add('weight-initialization','权重初始化（weight initialization）',['权重初始化','参数初始化','weight initialization','Xavier','Kaiming','Glorot','He initialization'],
    '初始化是训练开始前为参数选择起始数值。Xavier、Kaiming 等方法结合层宽与激活特性设定随机数尺度，帮助信号和梯度传播。',
    '若每层都把输入放大许多倍，深层输出可能越来越大；尺度合适的起点有助于避免这种失控。',
    '打破神经元之间的对称，并改善训练起点。',
    '不是所有参数都该随机化；偏置、归一化层有不同习惯。初始化修改现有参数通常无需重建优化器，替换参数对象则需要重新管理参数组。',
    'training','network','nn.init.html',
    'import torch\nlayer = torch.nn.Linear(4, 3)\ntorch.nn.init.kaiming_normal_(layer.weight, nonlinearity="relu")\nif layer.bias is not None:\n    torch.nn.init.zeros_(layer.bias)',['parameter','activation','gradient']);
  add('label-smoothing','标签平滑（label smoothing）',['标签平滑','label smoothing','label_smoothing'],
    '标签平滑把完全确定的独热目标，改成正确类占大部分、其余类占少量的目标分布。它改变训练目标，减少过度尖锐的监督。',
    '3 类、平滑量 0.1 时，PyTorch 的目标是独热分布乘 0.9，再加 0.1 的均匀分布；正确类为 0.9333，其余各 0.0333。',
    '可作为正则化手段，但效果依赖数据与任务。',
    '不能修复错标签；平滑量的具体定义需看实现。PyTorch CrossEntropyLoss 支持 label_smoothing 参数。',
    'losses','loss-implementation','generated/torch.nn.CrossEntropyLoss.html',
    'import torch\nlogits = torch.tensor([[2., 0., -1.]])\ntarget = torch.tensor([0])\nloss = torch.nn.CrossEntropyLoss(label_smoothing=0.1)(logits, target)\nprint(loss)',['one-hot','cross-entropy-loss','regularization']);
  add('class-weight','类别权重（class weight）',['类别权重','class weight','class weights','pos_weight'],
    '类别权重调节不同类别的损失贡献。例如给少数类较大的系数，让它的错误在目标函数中更有分量。具体归约规则取决于损失接口。',
    '两类权重 [1,4] 表示在指定公式中第二类错误的单项损失乘 4，不表示它的准确率也乘 4。',
    '表达类别频次或错误代价差异，辅助处理类别不平衡。',
    'CrossEntropyLoss 的 weight 与 BCEWithLogitsLoss 的 pos_weight 语义不同；加权 mean 也不一定是除以样本数。',
    'losses','loss-implementation','generated/torch.nn.CrossEntropyLoss.html',
    'import torch\nlogits = torch.tensor([[2., 0.], [1., 2.]])\ny = torch.tensor([0, 1])\nloss = torch.nn.CrossEntropyLoss(weight=torch.tensor([1., 4.]))(logits, y)\nprint(loss)',['class-imbalance','reduction','bce-with-logits']);
  add('multi-task-learning','多任务学习（multi-task learning）',['多任务学习','multi-task learning','复合损失','composite loss'],
    '多任务学习让一个模型同时解决几个相关目标，常共享前面的表示，再用不同输出分支计算各自损失。',
    '检测既预测类别也预测框：总损失可写成分类损失加上带权重的框回归损失。',
    '复用特征并利用多种监督信号；任务是否互相帮助取决于它们的关联。',
    '各项数值尺度与梯度可能冲突；不能只看总 loss，要分别记录子项并检查标签和 mask。',
    'losses','yolo-loss','', '',['loss','head','gradient']);
  add('zero-grad','清理已存梯度（zero_grad）',['zero_grad','zero_grad()','optimizer.zero_grad'],
    'zero_grad 清理优化器所管理参数上的已存梯度。因为 backward 默认把新梯度累加到 .grad，普通单批次更新需要主动清理旧值。',
    '两次计算各得到梯度 2 和 3，不清理会存成 5；梯度累积训练会有意利用这个行为。',
    '控制这一次更新究竟使用哪些批次的梯度。',
    'set_to_none=True 与写零不同：标准优化器会跳过 grad=None 的参数；零梯度仍可能受到动量或权重衰减影响。',
    'training','gradient-diagnostics','generated/torch.optim.Optimizer.zero_grad.html',
    'import torch\np = torch.nn.Parameter(torch.tensor(1.0))\nopt = torch.optim.SGD([p], lr=0.1)\n(2 * p).backward()\n(3 * p).backward()\nprint(p.grad.item())  # 5.0\nopt.zero_grad(set_to_none=True)\nprint(p.grad)  # None',['gradient-accumulation','backpropagation','optimizer']);
  add('optimizer-step','优化器更新步（optimizer step）',['optimizer step','optimizer.step','optimizer.step()','参数更新步'],
    'optimizer.step() 根据当前参数、已有梯度和优化器状态尝试执行一次更新。它与 backward 计算梯度是两个步骤。',
    'SGD 中参数为 2，梯度为 4，学习率为 0.1，执行一次更新后为 1.6。',
    '把求导得到的信号转成参数变化。',
    '一个数据迭代不一定对应一次更新；梯度累积可能多批次更新一次，AMP 发现溢出还可能跳过更新。',
    'training','optimizer','optim.html',
    'import torch\np = torch.nn.Parameter(torch.tensor(2.0))\nopt = torch.optim.SGD([p], lr=0.1)\nopt.zero_grad(set_to_none=True)\np.square().backward()\nopt.step()\nprint(round(p.item(), 1))  # 1.6',['iteration','learning-rate','zero-grad']);
  add('ddp','分布式数据并行（Distributed Data Parallel，DDP）',['DDP','DistributedDataParallel','分布式数据并行'],
    'DDP 让多个进程各持有一份模型，处理不同的数据，并同步梯度，使各副本按一致规则更新参数。常见配置是每张 GPU 一个进程。',
    '两张卡每张处理 16 个样本，不做累积时，全局一个更新批次通常有 32 个样本。',
    '提升训练吞吐，利用多台设备协同训练。',
    '它主要复制模型，不自动让单个模型只占半张卡；数据分片、全局批次、日志和保存需要协调。DistributedSampler 通常每轮调用 set_epoch。',
    'training','training-accumulation','generated/torch.nn.parallel.DistributedDataParallel.html','','',['batch','gradient-accumulation','gpu']);
  add('eval-mode','训练／评估模式（train / eval）',['model.train','model.eval','model.eval()','model.train()','eval()','训练模式','评估模式'],
    'train() 与 eval() 设置模块的 training 标志，影响 Dropout、BatchNorm 等有模式差异的层。eval() 等价于 train(False)。',
    '验证时 Dropout 不再随机丢弃激活，默认 BatchNorm 使用训练中记录的运行统计量。',
    '让评估和部署使用预期的层行为。',
    'eval 不关闭求导，也不冻结全部参数；no_grad 或 inference_mode 才控制求导记录。BatchNorm 不追踪运行统计时仍会使用输入统计量。',
    'evaluation','checkpoint-inference','generated/torch.nn.Module.html','','',['no-grad','dropout','batch-normalization']);
  add('map-location','加载时的设备映射（map_location）',['map_location'],
    'map_location 是 torch.load 的加载参数，用于把保存的张量存储映射到指定设备，而不是机械使用保存时的设备。',
    '在 GPU 上保存的权重，可以用 map_location="cpu" 在没有 GPU 的电脑上读取。',
    '使模型文件能跨设备加载，并控制加载时的显存占用。',
    '它不提供模型结构，也不自动调用 eval；加载文件、把状态装入模型、切换模式是不同步骤。只加载可信来源文件。',
    'deployment','checkpoints','generated/torch.load.html',
    'import torch\n# 先准备与保存时结构一致的 model，以及自己可信的文件\n# state = torch.load("weights.pt", map_location="cpu", weights_only=True)\n# model.load_state_dict(state)\n# model.eval()',['state-dict','checkpoint','device']);
  add('confusion-matrix','混淆矩阵（confusion matrix）',['混淆矩阵','confusion matrix'],
    '混淆矩阵按真实类别和预测类别统计数量，展示哪些类被判对、哪些类被混淆。二分类可从中读出 TP、FP、TN、FN。',
    '真实有 10 只猫，其中 8 只预测猫、2 只预测狗；猫这一行就记录这两种去向。',
    '定位整体准确率掩盖的具体错误类型。',
    '先确认行、列分别代表真实还是预测；归一化方式也必须说明。检测中的框匹配规则还会影响矩阵统计。',
    'evaluation','metrics','', '',['true-positive','false-positive','false-negative','accuracy']);
  add('roc-auc','ROC 曲线下面积（Receiver Operating Characteristic AUC）',['ROC-AUC','ROC AUC','ROC曲线','ROC 曲线'],
    'ROC 曲线展示阈值变化时，真正率与假正率怎样变化；ROC-AUC 是曲线下面积，反映分数区分正负样本的排序能力。',
    '随机抽一对正负样本，正样本分数通常更高，往往对应较高的 AUC；它不指定最终使用哪个阈值。',
    '从多个阈值观察分类器区分能力。',
    '用连续分数计算，别先 argmax 或只给 0/1 决策。高度不平衡时还要看 PR 曲线及实际工作阈值。',
    'evaluation','metrics','', '',['recall','false-positive','pr-auc']);
  add('pr-auc','PR 曲线下面积（Precision–Recall AUC）',['PR-AUC','PR AUC','AUPRC'],
    'PR-AUC 汇总不同阈值下精确率与召回率之间的取舍，常用于关注少数正类的任务。数值受正类比例和积分约定影响。',
    '异常样本很少时，只说总体准确率很高可能没有意义；PR 曲线能显示找回异常的同时误报有多少。',
    '更直接检查正类检出与误报之间的关系。',
    '梯形积分得到的 PR-AUC 与 Average Precision 的求和定义未必相同；检测 AP 还涉及 IoU、匹配和特定评测约定。',
    'evaluation','metrics-map','', '',['precision-recall-curve','ap','roc-auc']);
  add('probability-calibration','概率校准（probability calibration）',['概率校准','probability calibration','calibration','ECE'],
    '概率校准关注模型给出的概率与实际发生频率是否一致。若许多预测都声称 80% 把握，理想情况下这些预测约有 80% 正确。',
    '100 个“置信度约 0.8”的预测只有 50 个正确，说明这组预测过于自信。',
    '帮助把概率用于风险判断、阈值选择和决策。',
    '准确率高、AUC 高都不保证校准好；需用独立验证数据评估，校准方法也不能保证分布变化后仍然可靠。',
    'evaluation','metrics','', '',['probability','confidence','accuracy']);
  add('top-k','Top-k 预测与准确率（top-k）',['Top-k','top-k accuracy','topk'],
    'Top-k 预测取分数最高的 k 个类别。Top-k 准确率统计真实类别是否落在这 k 个候选中，不要求排在第一。',
    '真实是兔子，模型前三名依次为猫、兔子、狗：Top-1 错，Top-3 对。',
    '适合评估候选列表是否包含正确答案。',
    'k 必须不超过类别数，比较时必须使用相同 k；这不是概率校准指标。',
    'evaluation','cnn-alexnet','generated/torch.topk.html',
    'import torch\nscores = torch.tensor([[2., 1., 0.]])\nprint(scores.topk(k=2, dim=1).indices)  # [[0, 1]]',['top5-accuracy','argmax','accuracy']);
  add('rnn','循环神经网络（Recurrent Neural Network，RNN）',['RNN','循环神经网络','Recurrent Neural Network'],
    'RNN 按序列位置重复使用同一组参数，把当前输入与上一时刻的隐藏状态组合成新状态。隐藏状态携带历史信息。',
    '逐个读取一串传感器读数，每读一个值就更新“目前看到什么”的状态。',
    '建模有先后关系的序列和流式输入。',
    '简单 RNN 学习很长依赖可能遇到梯度问题；batch 之间是否继承状态必须由任务决定，不能随意串联不同样本。',
    'layers','network','generated/torch.nn.RNN.html','','',['lstm','gru','transformer']);
  add('lstm','长短期记忆网络（Long Short-Term Memory，LSTM）',['LSTM','长短期记忆网络','Long Short-Term Memory'],
    'LSTM 是带门控的循环网络，利用输入门、遗忘门和输出门控制信息进入、保留和输出，并维护细胞状态。',
    '读一句长句时，保留与后文判断有关的信息，逐步淡化不再有用的部分。',
    '改善简单循环网络学习较长依赖时的困难。',
    '不能保证任意长记忆；注意隐藏状态 h 与细胞状态 c 的形状，以及 batch_first 不改变状态张量的轴约定。',
    'layers','network','generated/torch.nn.LSTM.html','','',['rnn','gru','mask']);
  add('gru','门控循环单元（Gated Recurrent Unit，GRU）',['GRU','门控循环单元','Gated Recurrent Unit'],
    'GRU 是用更新门和重置门调节历史信息的循环单元。相对标准 LSTM，它的状态结构更简洁。',
    '新读数到来后，更新门控制旧状态保留多少、加入多少新内容。',
    '在序列任务中以门控机制建模历史依赖。',
    '参数更少不保证所有任务都更快或更准；要明确输入布局和是否跨批次保留状态。',
    'layers','network','generated/torch.nn.GRU.html','','',['rnn','lstm','parameter']);
  add('vit','视觉 Transformer（Vision Transformer，ViT）',['ViT','Vision Transformer','视觉Transformer','视觉 Transformer'],
    'ViT 把图像划分成 patch，将每个 patch 变成向量 token，再用 Transformer 处理这些表示，通常还需要位置信息。',
    '224×224 图像按 16×16 划块，得到 14×14=196 个 patch；特殊 token 是否额外加入取决于结构。',
    '把序列建模结构用于视觉，并让不同图像区域交换信息。',
    '输入分辨率、patch 大小和位置编码会影响 token 数与开销；不能把所有视觉 Transformer 都说成同一种原始 ViT。',
    'layers','cnn-priors-limits','', '',['transformer','attention','embedding']);
  add('autoregressive','自回归生成（autoregressive generation）',['自回归','autoregressive','自回归生成'],
    '自回归模型把整体序列概率分解成一步步的条件概率：每一步根据已知前文预测下一个输出，再继续生成。',
    '先生成“今天”，再把它作为上下文生成“天气”，逐步扩展文本。',
    '把复杂序列生成拆成重复的下一步预测。',
    '语言模型不只有自回归一种；训练时可并行计算多个位置的损失，但必须保证每个位置看不到未来答案。',
    'layers','network-outputs','', '',['causal-mask','teacher-forcing','temperature']);
  add('teacher-forcing','教师强制（teacher forcing）',['teacher forcing','教师强制'],
    '教师强制在训练序列预测时，把真实的历史输出作为后续位置的输入，而不是始终使用模型刚生成的结果。',
    '训练预测第三个词时，给模型真实的前两个词；生成时通常只能用已经实际生成的词。',
    '提供稳定、可并行组织的监督输入。',
    '训练与生成的历史分布可能不同；目标序列需要正确右移，并配合因果约束，避免直接输入当前位置答案。',
    'training','training-data-splits','', '',['autoregressive','causal-mask','label']);
  add('temperature','采样温度（temperature）',['temperature','采样温度'],
    '采样温度通过把 logits 除以正数 T 再做 Softmax 来调整分布。T 小于 1 通常让分布更尖，T 大于 1 通常让分布更平。',
    '同样的分数 [2,1]，温度变小会扩大相对差异，让采样更偏向高分项。',
    '控制从模型分布中抽样时的随机程度。',
    '温度不是学习率；T=0 不可直接代入除法。温度缩放用于校准或蒸馏时，目标与使用方式还需另外说明。',
    'evaluation','loss-probabilities','generated/torch.nn.functional.softmax.html',
    'import torch\nz = torch.tensor([2., 1.])\nfor temperature in [0.5, 1.0, 2.0]:\n    print(temperature, (z / temperature).softmax(dim=-1))',['softmax','logit','knowledge-distillation']);
  add('knowledge-distillation','知识蒸馏（knowledge distillation）',['知识蒸馏','knowledge distillation','distillation'],
    '知识蒸馏让学生模型学习教师模型提供的输出分布或中间表示，常与真实标签损失一起训练。教师通常更大，但不是定义上的必要条件。',
    '教师认为一张图 70% 像猫、25% 像狐狸；学生能同时学习主类别与类别间的相似线索。',
    '把教师的行为迁移给成本更合适的模型。',
    '学生不会自动继承教师全部能力；蒸馏温度、损失权重和教师错误都会影响结果。',
    'training','transfer','', '',['temperature','kl-divergence','transfer-learning']);
  add('peft','参数高效微调（Parameter-Efficient Fine-Tuning，PEFT）',['PEFT','参数高效微调','Parameter-Efficient Fine-Tuning','adapter'],
    'PEFT 是只训练少量选定或新增参数的一类微调方法，通常冻结大部分预训练权重。LoRA、部分 adapter 方法属于这一类。',
    '给一个大模型增加较小的可训练模块，用较少训练参数适配新任务。',
    '降低优化器状态与梯度等训练开销，方便保存多个任务的适配参数。',
    '训练参数少不意味着基础模型不用加载，也不保证推理一定更快；适配参数通常需要匹配的基础模型才能使用。',
    'training','fine-tuning','', '',['lora','fine-tuning','freeze-parameters']);
  add('lora','低秩适配（Low-Rank Adaptation，LoRA）',['LoRA','低秩适配','Low-Rank Adaptation'],
    'LoRA 冻结原权重 W，用两个较小矩阵的乘积表示权重增量 ΔW，并主要训练这些增量参数。秩 r 控制这种增量表示的规模。',
    '一个 1000×1000 权重有 100 万个数；若用秩 8 的两矩阵表示增量，需 1000×8+8×1000=16000 个数，不计其他参数。',
    '减少为适配任务需要训练与保存的参数量。',
    '秩越大不保证越好；基础模型版本、目标层、缩放因子和合并方式都需一致。它不是把原权重矩阵直接换成低秩近似。',
    'training','fine-tuning','', '',['peft','matrix-multiplication','parameter']);

  add('token','序列中的基本单位（token）',['token','词元'],
    'token 是模型把序列分成的基本处理单位。在文本中，它可以是一个词、子词、标点或字节片段，具体由分词器决定。',
    '同一句中文可能被切成单字、词片段等不同 token；token 数不一定等于汉字数或英文单词数。',
    '把原始内容变成离散编号序列，供嵌入层和序列模型处理。',
    'token 的编号只在对应词表中有意义；不能拿一个分词器的编号直接交给另一个不匹配的模型。',
    'data','network-outputs','', '',['tokenization','embedding','autoregressive']);
  add('tokenization','分词与编号（tokenization）',['tokenization','分词器','tokenizer'],
    'tokenization 把文本等原始内容切成 token，再根据词表映射到编号。通常还会处理特殊标记、截断和补齐。',
    '“学习 AI”经过分词器后得到若干编号，再由 Embedding 查出对应向量；编号本身不是语义向量。',
    '建立原始文本与模型数值输入之间的一致规则。',
    '推理要使用与模型匹配的分词器、特殊 token 和最大长度；截断可能删掉关键信息。',
    'data','network-outputs','', '',['token','sequence-padding','embedding']);
  add('position-encoding','位置编码（positional encoding）',['位置编码','positional encoding','positional embedding'],
    '位置编码为序列表示提供位置信息，使模型能区分相同内容出现在不同位置或相距多远。可用固定函数、可学习向量或其他位置机制。',
    '“猫追狗”和“狗追猫”使用相似词汇，但顺序不同；模型需要能表达这种位置差别。',
    '弥补仅按内容匹配的注意力对顺序信息的不足。',
    '不同位置机制处理长度外推的能力不同；不能认为换任意序列长度都不需调整或验证。',
    'layers','network-gated-activations','', '',['transformer','attention','token']);
  add('mlp','多层感知机（Multi-Layer Perceptron，MLP）',['MLP','多层感知机','Multi-Layer Perceptron'],
    'MLP 通常由多层全连接变换与非线性激活组成，把输入特征逐层组合成新的表示或输出。',
    '把 4 个传感器特征映射为 8 个隐藏特征，经 ReLU 后再输出 2 个分类分数。',
    '作为向量数据模型、分类头，或复杂网络中的特征变换模块。',
    '没有中间非线性，多层仿射变换仍可合成一个仿射变换。层数和特征规模要与数据量、任务匹配。',
    'layers','network-activation','generated/torch.nn.Sequential.html',
    'import torch\nfrom torch import nn\nmodel = nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 2))\nprint(model(torch.ones(3, 4)).shape)  # [3, 2]',['fully-connected','activation','nn-sequential']);
  add('top-p','核采样（top-p / nucleus sampling）',['top-p','核采样','nucleus sampling'],
    'top-p 采样先按概率降序排列候选，保留累计概率达到阈值 p 所需的一组高概率候选，再在保留集合中重新归一化并抽样。',
    '概率 [0.6,0.25,0.1,0.05]，p=0.8 时通常保留前两个候选；它们累计概率为 0.85。',
    '让候选数量随当前分布自适应变化，控制生成随机性。',
    'top-p 的 p 是累计概率阈值，不是固定保留 p 个词，也不是 Top-k 准确率；与温度组合时要明确处理顺序。',
    'evaluation','loss-probabilities','', '',['top-k','temperature','autoregressive']);
  add('nn-sequential','顺序模块容器（nn.Sequential）',['nn.Sequential','Sequential'],
    'nn.Sequential 把多个已注册的子模块按顺序连接，前一个输出作为下一个输入。容器中的参数可被父模型统一管理。',
    'Linear→ReLU→Linear 可以放进一个 Sequential，调用时依次经过三层。',
    '简化直线式网络的定义，保留模块注册与状态管理。',
    '它不会自动实现分支、残差相加或复杂多输入逻辑；需要时在自定义 Module.forward 中组织。',
    'layers','network','generated/torch.nn.Sequential.html','','',['nn-module','module-list','mlp']);
  add('module-list','可注册的模块列表（nn.ModuleList）',['nn.ModuleList','ModuleList'],
    'ModuleList 像一个可索引的层列表，同时把其中子模块注册到父模型。它负责存放和注册，不自动规定怎样连接。',
    '先用 ModuleList 保存多层，再在 forward 中按循环、分支等规则逐层调用。',
    '让动态组织的子层仍能参与 parameters、state_dict 和设备迁移。',
    '普通 Python list 不自动注册子层；ModuleList 也不等于 Sequential，通常不能直接当作整条前向流水线调用。',
    'layers','network','generated/torch.nn.ModuleList.html','','',['nn-module','nn-sequential','parameter']);
  add('clone','复制张量数据（clone）',['clone','clone()'],
    'clone() 复制张量的数据，得到独立存储的张量。在正常梯度模式下，它仍可保留与原张量的求导关系。',
    '想保存数值快照且不保留求导图，可用 x.detach().clone()；只用 detach 通常仍共享存储。',
    '需要独立数据副本时，避免后续修改互相影响。',
    '复制数据与切断梯度是不同操作；clone 不自动关闭 requires_grad，detach 也不自动复制数据。',
    'tensors','tensor-layout','generated/torch.clone.html',
    'import torch\nx = torch.tensor([2.], requires_grad=True)\ny = x.clone()\ny.sum().backward()\nprint(x.grad)  # [1.]\nsnapshot = x.detach().clone()\nprint(snapshot.requires_grad)  # False',['detach','storage','requires-grad']);
  add('generative-model','生成模型（generative model）',['生成模型','生成式模型','generative model'],
    '生成模型学习数据或条件数据的分布，用于产生新样本，例如文本、图像或声音。不同模型用不同训练目标和生成过程。',
    '分类器回答图片是什么；图像生成模型则可以根据条件生成一张新图片。',
    '用于内容生成、数据建模和条件补全等任务。',
    '生成模型不等于语言模型，也不一定自回归；GAN、扩散模型等有不同机制，生成内容也不保证真实正确。',
    'layers','tasks-beyond-detection','', '',['autoregressive','gan','diffusion-model']);
  add('language-model','语言模型（language model，LM）',['语言模型','language model','LM'],
    '语言模型对语言序列建立概率模型。自回归语言模型预测下一 token；掩码语言模型等方法使用其他上下文与预测目标。',
    '看到“今天的天气很”，下一 token 预测模型为“好”等候选分配分数。',
    '为文本生成、补全及语言表示提供基础。',
    '不能把“语言模型”统一定义为只能预测下一个词；token 也不一定等于完整单词。',
    'layers','network-outputs','', '',['token','autoregressive','bert']);

  // 已有词条保留全站统一定义，只在独立速查页补充用法、例子和边界。
  const extra={
    'cross-entropy-loss':{category:'losses',why:'让互斥多分类模型提高正确类别的相对分数，并稳定地计算训练损失。',example:'logits=[2,1,0]、真实类别 0：正确类概率约 0.6652，交叉熵约 0.4076。',pitfall:'硬标签通常用 long，形状 [N]；概率目标也合法，但需为浮点、与 logits 同形状，并满足概率分布要求。one-hot 浮点目标是概率目标的特殊情况，不能一概说不支持。',api:'generated/torch.nn.CrossEntropyLoss.html',code:'import torch\nimport torch.nn.functional as F\nz = torch.tensor([[2., 1., 0.]])\nhard = torch.tensor([0])\nsoft = torch.tensor([[1., 0., 0.]])\nprint(F.cross_entropy(z, hard))  # 约 0.4076\nprint(F.cross_entropy(z, soft))  # 同一数值',formula:String.raw`\ell=-\ln p_y=\ln\!\left(\sum_{c=1}^{C}e^{z_c}\right)-z_y`,symbols:'z_c 是第 c 类原始分数；C 是类别总数；y 是真实类别索引；p_y 是该类的 Softmax 概率。这里为单样本、无类别权重的形式。',related:['logit','softmax','one-hot','numerical-stability']},
    'bce-with-logits':{category:'losses',why:'在二分类或多标签任务中，用原始分数稳定地计算二元交叉熵。',example:'一个样本同时有“猫”和“室内”标签，目标为 [1,1,0]；各位置分别是独立的二元判断。',pitfall:'输入不要先做 Sigmoid；目标使用浮点，形状与 logits 一致。两个互斥类别也可用两维 CE 表示，不能只靠输出维度判断任务。',api:'generated/torch.nn.BCEWithLogitsLoss.html',code:'import torch\nlogits = torch.tensor([[2., -1., 0.]])\ntarget = torch.tensor([[1., 0., 1.]])\nprint(torch.nn.BCEWithLogitsLoss()(logits, target))',formula:String.raw`\ell=-\big[y\ln\sigma(z)+(1-y)\ln(1-\sigma(z))\big]`,symbols:'z 是一个位置的 logit；y∈[0,1] 是对应目标；σ 是 Sigmoid。此式未加入权重；接口采用数值稳定的等价实现。',related:['sigmoid','multilabel-classification','bce']},
    'mse':{category:'losses',why:'用平方代价度量回归偏差，对较大的误差更敏感。',example:'预测 [2,5]，真实 [1,3]，误差 [1,2]，MSE=(1²+2²)/2=2.5。',pitfall:'默认 mean 对全部损失元素平均，不一定只对样本轴平均；先确保预测与目标形状一致。',api:'generated/torch.nn.MSELoss.html',formula:String.raw`L_{\mathrm{MSE}}=\frac1M\sum_{j=1}^{M}(\hat y_j-y_j)^2`,symbols:'ŷ_j 为预测；y_j 为真实值；M 为参与平均的元素数。',code:'import torch\npred = torch.tensor([2., 5.])\ntrue = torch.tensor([1., 3.])\nprint(torch.nn.MSELoss()(pred, true))  # 2.5',related:['mae','huber','reduction']},
    'mae':{category:'losses',why:'按绝对偏差计分，大误差的代价按线性增长。',example:'预测 [2,5]，真实 [1,3]，MAE=(|1|+|2|)/2=1.5。',pitfall:'对零点不可导不等于框架不能训练；PyTorch L1Loss 在差值为 0 时采用梯度 0。更稳健也不代表任何数据上更好。',api:'generated/torch.nn.L1Loss.html',formula:String.raw`L_{\mathrm{MAE}}=\frac1M\sum_{j=1}^{M}|\hat y_j-y_j|`,symbols:'ŷ_j 为预测；y_j 为真实值；M 为参与平均的元素数。',related:['mse','huber','reduction']},
    'huber':{category:'losses',why:'在零附近保留平方损失的平滑性，在大偏差处改为线性增长。',example:'δ=1：误差 0.5 的单项损失为 0.125；误差 3 的损失为 2.5。',pitfall:'HuberLoss 与 SmoothL1Loss 一般相差缩放；只有 δ=β=1 时数值相同。',api:'generated/torch.nn.HuberLoss.html',formula:String.raw`\ell_\delta(e)=\begin{cases}\frac12e^2,&|e|\le\delta\\\delta\!\left(|e|-\frac12\delta\right),&|e|>\delta\end{cases}`,symbols:'e=ŷ−y 是预测误差；δ>0 是从平方段切换到线性段的阈值。',related:['mse','mae','smooth-l1']},
    'reduction':{category:'losses',why:'明确逐元素损失怎样合成一个训练标量，也决定梯度的尺度。',example:'两个损失是 2 和 4：sum 为 6，普通 mean 为 3；none 则保留 [2,4]。',pitfall:'加权交叉熵、忽略标签和概率目标可能采用不同分母。要以对应接口公式为准，不能把所有 mean 都解释成除以 batch_size。',api:'generated/torch.nn.CrossEntropyLoss.html',related:['class-weight','gradient-accumulation','loss']},
    'numerical-stability':{category:'losses',why:'让数学上有限的结果，在有限精度的计算机里也尽量可靠地得到。',example:'z=[1000,999,−1000] 且真实类为第三类：float32 的概率可能为 0，但稳定交叉熵仍约为 2000.3133。',pitfall:'减去最大值可避免指数上溢，却仍可能让极小概率下溢；训练直接使用稳定的 logits 损失接口。稳定算法也不能自动修复已含 NaN/Inf 的输入。',api:'generated/torch.logsumexp.html',formula:String.raw`\ell=\ln\!\left(\sum_c e^{z_c-m}\right)+(m-z_y),\quad m=\max_c z_c`,symbols:'z_c 为各类 logits；m 为最大分数；z_y 为真实类分数。这里为单样本、无权重交叉熵，先在 logits 的差值上计算。',code:'import torch\nimport torch.nn.functional as F\nz = torch.tensor([[1000., 999., -1000.]])\ny = torch.tensor([2])\nprint(z.softmax(dim=1)[0, 2])  # float32 下为 0\nprint(F.cross_entropy(z, y))  # 约 2000.3133',related:['cross-entropy-loss','logit','fp16']},
    'gradient-clipping':{category:'training',why:'限制梯度过大的情况，缓解某次异常梯度对训练的影响。',example:'总梯度范数为 10，阈值为 1 时，按范数裁剪会近似把全部相关梯度乘 0.1。',pitfall:'它限制梯度，不直接保证 Adam、动量或带权重衰减时的参数更新幅度上限；AMP 通常先 unscale 再裁剪。',api:'generated/torch.nn.utils.clip_grad_norm_.html',code:'# 已有 model、optimizer 和标量 loss\n# loss.backward()\n# torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n# optimizer.step()',related:['gradient','grad-scaler','optimizer-step']},
    'gradient-accumulation':{category:'training',why:'显存不足时，跨多个小批次累积梯度，再执行一次参数更新。',example:'每小批次 8 个样本，累积 4 次，再更新一次；单设备有效更新批次通常为 32。',pitfall:'mean loss 直接除累积步数只在等大小、分母一致时对齐。尾部不足一个窗口要处理；BatchNorm 和随机层使它不一定等价于一次大批次前向。',api:'notes/amp_examples.html',related:['zero-grad','optimizer-step','batch-normalization']},
    'freeze-parameters':{category:'training',why:'保留预训练表示，只训练新任务需要调整的部分。',example:'先冻结图像主干，训练新分类头；之后可解冻部分层，用较小学习率继续微调。',pitfall:'冻结梯度不等于冻结 BatchNorm 统计量。参数仍在优化器中不必然是错误：通常 grad=None 时会跳过；但应清掉旧梯度并明确动量、衰减与参数组策略。',api:'notes/autograd.html',related:['requires-grad','eval-mode','fine-tuning']},
    'buffer':{category:'layers',why:'保存属于模型状态、但不由普通优化器直接学习的数值。',example:'BatchNorm 的 running_mean 随训练统计更新，随模型迁移设备和保存，但不是梯度训练的权重。',pitfall:'持久 buffer 默认进入 state_dict，persistent=False 的 buffer 不进入；不是所有模型状态都是可学习参数。',api:'generated/torch.nn.Module.html',related:['nn-module','nn-parameter','state-dict']},
    'batch-normalization':{category:'layers',why:'按指定范围重新调整特征的中心和尺度，在许多网络中帮助优化和训练稳定。',example:'单通道 [1,3,5,7]，均值为 4，按除以 4 的方差为 5，归一化后约为 [−1.342,−0.447,0.447,1.342]。',pitfall:'不保证正态分布或落在 0～1。BatchNorm2d 训练时每通道通常汇总 N、H、W；默认评估用运行统计量，track_running_stats=False 是例外。',api:'generated/torch.nn.BatchNorm2d.html',formula:String.raw`\hat x=\frac{x-\mu_B}{\sqrt{\sigma_B^2+\varepsilon}},\qquad y=\gamma\hat x+\beta`,symbols:'μ_B、σ_B² 为本批次指定范围的均值和方差；ε 防止分母过小；γ、β 是可学习缩放和平移。这里只展示训练时的核心计算。',related:['layer-normalization','eval-mode','buffer']},
    'amp':{category:'training',why:'让适合的运算使用较低精度，兼顾计算吞吐、内存与数值精度。',example:'前向和损失放在 autocast 上下文中；FP16 训练可配合 GradScaler 缓解小梯度下溢。',pitfall:'不要把 AMP 理解成把所有参数强制转 FP16；推理不需要 GradScaler，BF16 通常也无需梯度缩放。硬件与算子支持因环境而异。',api:'amp.html',related:['fp16','bfloat16','grad-scaler']},
    'state-dict':{category:'deployment',why:'用名称到张量的映射保存与恢复模型状态，便于与模型代码分开管理。',example:'先建立结构一致的模型，再 load_state_dict，把对应权重装回各层。',pitfall:'不自动包含完整模型结构、预处理和类别映射。state_dict 中的张量通常引用当前状态，若留在内存作 best 快照应 deepcopy 或及时保存。',api:'generated/torch.nn.Module.html',related:['checkpoint','map-location','buffer']},
    'weight-decay':{category:'training',why:'控制参数规模，作为正则化的一种方式。',example:'AdamW 的衰减部分把权重乘以近似 1−学习率×衰减系数，再结合自适应梯度更新。',pitfall:'对自适应优化器，把 L2 项加进梯度与解耦权重衰减一般不等价；偏置、归一化参数是否衰减需要明确配置。',api:'generated/torch.optim.AdamW.html',related:['adamw','l2-regularization','regularization']},
    'dataloader':{category:'data',why:'把样本读取、组合批次和迭代流程接起来，供训练循环逐批消费。',example:'Dataset 能取单个样本；DataLoader 每次返回 4 个输入与对应标签，最后一批可能不足 4 个。',pitfall:'多进程、shuffle、drop_last 和 sampler 会改变读取过程；验证通常保留全部样本并使用确定性预处理。',api:'data.html',related:['dataset-class','shuffle','drop-last','num-workers']},
    'mask':{category:'data',why:'明确哪些位置可参与当前计算，哪些是占位、忽略或被禁止访问的内容。',example:'一句话补齐到 5 个 token，最后两个是 PAD；掩码标记它们，避免把占位内容当真实词汇。',pitfall:'掩码的 True 不一定总表示有效或总表示忽略；需逐个核对注意力、损失等 API 的约定与形状。',api:'generated/torch.nn.MultiheadAttention.html',related:['sequence-padding','causal-mask','attention']},
    'softmax':{category:'losses',why:'在互斥候选之间把相对分数转换成和为 1 的分布。',example:'z=[2,1,0] 得到约 [0.6652,0.2447,0.0900]；最高分仍对应最大概率。',pitfall:'dim 指归一化轴，不是默认固定为 1；[N,C] 分类通常沿 C。训练 CrossEntropyLoss 前不需先 Softmax。',api:'generated/torch.nn.functional.softmax.html',formula:String.raw`p_c=\frac{e^{z_c}}{\sum_{j=1}^{C}e^{z_j}}`,symbols:'z_c 是第 c 类分数；C 是候选类别数；p_c 是沿类别轴归一化后的概率。',related:['sigmoid','logit','cross-entropy-loss']},
    'sigmoid':{category:'losses',why:'把一个实数分数变成 0 与 1 之间的值，常用于独立二元事件。',example:'logit 为 0 时输出 0.5；logit 为 2 时输出约 0.8808。',pitfall:'多个 Sigmoid 输出不要求和为 1；BCEWithLogitsLoss 前不应再手动做一次 Sigmoid。',api:'generated/torch.nn.Sigmoid.html',formula:String.raw`\sigma(z)=\frac1{1+e^{-z}}`,symbols:'z 是输入分数；e 是自然常数；输出 σ(z) 位于 (0,1)。',related:['softmax','bce-with-logits','multilabel-classification']},
    'transformer':{category:'layers',why:'用注意力、前馈网络、残差与归一化组合序列表示。',example:'一段文本变成 token 向量后，各位置通过注意力交换信息，再逐层更新表示。',pitfall:'Transformer 不只有生成式模型；编码器、解码器及其掩码不同。标准密集自注意力的关系矩阵具有平方长度开销。',api:'generated/torch.nn.Transformer.html',related:['attention','multihead-attention','embedding','causal-mask']},
    'quantization':{category:'deployment',why:'以较低位宽表示权重或激活，减少存储，并在合适硬件上降低计算成本。',example:'把 FP32 权重改用低位宽整数加缩放因子表示，数值会产生近似误差。',pitfall:'位宽更低不保证实际更快；算子、硬件、校准数据和端到端瓶颈都会影响收益。',api:'quantization.html',related:['dtype','latency','throughput']},
    'random-seed':{category:'training',why:'控制伪随机过程的起点，帮助定位实验变化来自哪里。',example:'记录种子、数据版本与依赖版本，再比较两次训练，比只记录最终准确率更容易复盘。',pitfall:'同一 seed 不保证跨硬件、跨版本逐位一致；worker、非确定性算子、采样器与恢复状态也会影响复现。',api:'notes/randomness.html',related:['shuffle','ddp','checkpoint']},
    'attention':{formula:String.raw`\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\!\left(\frac{QK^{\mathsf T}}{\sqrt{d_k}}\right)V`,symbols:'Q 是查询矩阵；K 是键矩阵；V 是值矩阵；d_k 是每个键的特征维数。Softmax 沿可访问的键位置归一化；此式省略掩码与 dropout。'},
    'layer-normalization':{formula:String.raw`y=\gamma\odot\frac{x-\mu}{\sqrt{\sigma^2+\varepsilon}}+\beta`,symbols:'μ、σ² 在 normalized_shape 指定的末尾维度内计算；γ、β 通常是逐元素可学习参数；⊙ 表示逐元素乘法；ε 避免分母过小。'},
    'lora':{formula:String.raw`W'=W+\frac{\alpha}{r}BA,\qquad B\in\mathbb R^{d_{\mathrm{out}}\times r},\quad A\in\mathbb R^{r\times d_{\mathrm{in}}}`,symbols:'W 是冻结的原权重；BA 是可训练增量；r 是秩，α 是缩放超参数。这里使用原始 LoRA 的常见缩放形式；具体实现可有变体。'},
    'entropy':{category:'losses',why:'按一个分布自身的概率衡量平均不确定性。',example:'公平硬币每面概率 0.5，熵为 −0.5ln0.5−0.5ln0.5=ln2≈0.693 nat；确定结果的熵为 0。',formula:String.raw`H(P)=-\sum_{c=1}^{C}P(c)\ln P(c)`,symbols:'P(c) 是结果 c 的概率；C 是结果个数；使用自然对数时单位为 nat，约定 0ln0=0。',related:['information-content','cross-entropy','kl-divergence']},
    'cross-entropy':{category:'losses',why:'用模型分布对真实结果计分，模型给常见真实结果的概率越低，平均代价越大。',example:'真实标签只确定为第 2 类，模型给该类 0.8，则单样本损失是 −ln0.8≈0.2231。',formula:String.raw`H(P,Q)=-\sum_{c=1}^{C}P(c)\ln Q(c)`,symbols:'P 是目标分布；Q 是模型分布；独热目标只剩真实类一项。P(c)>0 而 Q(c)=0 时理论交叉熵为无穷大。',related:['entropy','cross-entropy-loss','numerical-stability']}
  };
  const categories=[['basics','基础概念'],['math','数学与统计'],['tensors','张量与自动求导'],['data','数据与预处理'],['layers','网络层与结构'],['losses','输出与损失'],['training','训练与优化'],['evaluation','评估与决策'],['deployment','保存与部署'],['yolo','视觉检测与 YOLO']];
  const assignments={
    math:'function variable covariate probability probability-distribution natural-exponential floor-function e-constant logarithm natural-log summation mean variance standard-deviation derivative partial-derivative norm normal-cdf normal-distribution standard-normal-distribution euler-angles quaternion hamilton-product quaternion-conjugate axis-angle rotation-matrix radian degree gimbal-lock slerp rotation-order k-means genetic-algorithm',
    tensors:'scalar vector matrix tensor axis shape dimension index stride storage offset contiguous dot-product cross-product broadcasting matrix-multiplication dtype device cpu gpu vram uint8 float32 fp16 bfloat16 computation-graph intermediate-variable chain-rule autograd flatten',
    data:'dataset training-set validation-set test-set sample label feature ground-truth pixel channel rgb bgr hwc chw nchw normalization standardization data-augmentation data-leakage label-noise class-imbalance hard-negative data-quality hsv hue saturation hsv-value jpeg opencv pillow torchvision numpy scipy csv json albumentations mosaic-augmentation letterbox whitening',
    layers:'fully-connected weight bias affine activation relu tanh silu gelu neuron linear-layer convolution kernel feature-map conv-stride spatial-stride padding dilation pooling global-average-pooling receptive-field downsampling depthwise-convolution residual-connection concatenation dropout batch-normalization internal-covariate-shift swiglu glu ffn cnn alexnet lenet5 vgg-family resnet-family basicblock local-response-normalization radial-basis-function neocognitron transformer bert gpt2 groups local-connectivity weight-sharing translation-equivariance inductive-bias identity-mapping residual feature-pyramid',
    losses:'logit sigmoid softmax loss cross-entropy bce bce-with-logits bce-loss cross-entropy-loss binary-classification multiclass-classification multilabel-classification one-hot multi-hot argmax cross-entropy-example regression mse mae huber smooth-l1 kl-divergence information-content entropy reduction numerical-stability focal-loss',
    training:'training forward-pass gradient gradient-descent backpropagation optimizer sgd momentum adam adam-first-moment adam-second-moment adam-bias-correction ema-decay-coefficient adam-initial-state learning-rate weight-decay regularization overfitting underfitting early-stopping patience batch epoch iteration amp grad-scaler gradient-accumulation gradient-clipping l2-regularization freeze-parameters generalization lrn-scheduler warmup exponential-moving-average random-seed resume-training fine-tuning transfer-learning pretrained-weights',
    evaluation:'accuracy precision recall f1 ap map true-positive false-positive false-negative true-negative precision-envelope precision-recall-curve confidence confidence-threshold top5-accuracy psnr ssim oks fitness-score',
    deployment:'inference prediction checkpoint state-dict buffer model-weights-file quantization onnx runtime openvino tensorrt latency throughput fps gguf ggml torchscript api virtual-environment command-line working-directory source-repository python-language path preprint nan infinity none'
  };
  const sourceFor=item=>item.api?{label:'PyTorch 官方文档',url:docs+item.api}:null;
  function extend(items,register){
    for(const record of entries){
      register(record.id,record.title,record.definition,record.example,record.aliases,record.course,{dictionary:{...record,source:sourceFor(record)}});
    }
    const byId=Object.fromEntries(items.map(item=>[item.id,item]));
    for(const [category,ids] of Object.entries(assignments))for(const id of ids.split(' '))if(byId[id])byId[id].dictionary={category,...byId[id].dictionary};
    for(const [id,record] of Object.entries(extra))if(byId[id])byId[id].dictionary={...byId[id].dictionary,...record,source:sourceFor(record)||byId[id].dictionary?.source};
    const pages={4:'ai machine-learning deep-learning sample feature label',5:'model parameter hyperparameter nn-parameter forward-pass',6:'loss gradient mse',7:'backpropagation chain-rule optimizer optimizer-step zero-grad',8:'training-set validation-set test-set inference',9:'tensor shape axis flatten',10:'dtype device cpu gpu broadcasting',11:'reshape view permute contiguous requires-grad leaf-tensor autograd computation-graph',12:'detach clone no-grad inference-mode nn-module buffer module-list nn-sequential',13:'dataset dataset-class',14:'dataloader batch shuffle drop-last num-workers pin-memory normalization standardization',15:'data-augmentation data-leakage',16:'sequence-padding mask class-imbalance class-weight',17:'fully-connected linear-layer convolution conv-stride padding receptive-field',18:'activation relu gelu sigmoid softmax pooling downsampling',19:'weight-initialization dropout regularization',20:'batch-normalization layer-normalization rms-normalization residual-connection',21:'embedding attention multihead-attention transformer position-encoding',23:'regression mse mae huber',24:'logit probability argmax cross-entropy cross-entropy-loss',25:'bce-with-logits bce binary-classification multilabel-classification',26:'reduction label-smoothing multi-task-learning',27:'training epoch iteration',28:'zero-grad gradient-accumulation sgd adam adamw',29:'learning-rate lrn-scheduler warmup gradient-clipping',30:'overfitting underfitting generalization early-stopping weight-decay checkpoint',31:'random-seed amp grad-scaler bfloat16 fp16',32:'ddp',33:'eval-mode',34:'accuracy precision recall f1 confusion-matrix roc-auc pr-auc',35:'top-k top5-accuracy probability-calibration confidence',36:'state-dict map-location',38:'mlp cnn rnn lstm gru vit',39:'transfer-learning fine-tuning freeze-parameters language-model generative-model autoregressive teacher-forcing token tokenization causal-mask temperature top-p',40:'quantization knowledge-distillation peft lora'};
    for(const [page,ids] of Object.entries(pages))for(const id of ids.split(' '))if(byId[id])byId[id].dictionary={...byId[id].dictionary,pdfPage:Number(page)};
    const papers={attention:['Attention Is All You Need','https://arxiv.org/abs/1706.03762'],transformer:['Attention Is All You Need','https://arxiv.org/abs/1706.03762'],'position-encoding':['Attention Is All You Need','https://arxiv.org/abs/1706.03762'],vit:['An Image is Worth 16x16 Words','https://arxiv.org/abs/2010.11929'],lora:['LoRA: Low-Rank Adaptation of Large Language Models','https://arxiv.org/abs/2106.09685'],peft:['PEFT 官方概念指南','https://huggingface.co/docs/peft/conceptual_guides/adapter'],'knowledge-distillation':['Distilling the Knowledge in a Neural Network','https://arxiv.org/abs/1503.02531'],'top-p':['The Curious Case of Neural Text Degeneration','https://arxiv.org/abs/1904.09751'],'probability-calibration':['On Calibration of Modern Neural Networks','https://arxiv.org/abs/1706.04599'],'roc-auc':['scikit-learn · ROC AUC','https://scikit-learn.org/stable/modules/generated/sklearn.metrics.roc_auc_score.html'],'pr-auc':['scikit-learn · Average precision 与 PR 积分区别','https://scikit-learn.org/stable/modules/generated/sklearn.metrics.average_precision_score.html'],'confusion-matrix':['scikit-learn · 混淆矩阵','https://scikit-learn.org/stable/modules/generated/sklearn.metrics.confusion_matrix.html']};
    for(const [id,[label,url]] of Object.entries(papers))if(byId[id])byId[id].dictionary.source={label,url};
    // 未显式分类的旧词条按其已有课程入口归类，检测专有名词归入 YOLO。
    for(const item of items)if(!item.dictionary?.category)item.dictionary={...item.dictionary,category:/#lesson\/(?:yolo|architecture|anchors|iou|metrics|tasks|detection|inference|debugging)/.test(item.learnMore)?'yolo':'basics'};
  }
  window.visionlabDictionaryContent={extend,categories};
})();
