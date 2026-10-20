/* 全站术语词典与可访问解释卡。每个词条必须有 title、plainExplanation、metaphor。 */
(()=>{
  const items=[];
  const add=(id,title,plainExplanation,metaphor,aliases,lesson='ai-foundations',extra={})=>{
    items.push({id,title,plainExplanation,metaphor,aliases:[...new Set([title,...(aliases||[])])],learnMore:'#lesson/'+lesson,...extra});
  };

  // 零基础起点
  add('ai','人工智能（Artificial Intelligence，AI）','让计算机完成过去通常需要人判断的任务，例如识别图片或回答问题。','像给计算机一套处理信息、完成任务的方法。',['人工智能','Artificial Intelligence','AI']);
  add('machine-learning','机器学习（Machine Learning，ML）','让计算机从例子中找出规律，再用这个规律处理新例子。','像看过许多练习题后学会解题方法。',['机器学习','Machine Learning','ML']);
  add('deep-learning','深度学习（Deep Learning）','用许多层数值计算逐步组合信息，让模型学会复杂任务。','像把简单线索一层层组合成完整判断。',['深度学习','Deep Learning']);
  add('model','模型（model）','模型是一套带有可调整数字的计算规则，用输入算出结果。','像一台可以调旋钮的机器：放入数据，得到答案。',['模型','model']);
  add('function','函数（function）','函数按规定的计算方式把输入变成输出。','像一台果汁机：放入材料，按固定步骤得到饮品。',['函数','function']);
  add('variable','变量（variable）','程序里用名字保存、以后还可以读取的值。','像贴了标签的盒子，盒中数字可以换。',['变量','variable']);
  add('input','输入（input）','交给模型处理的数据，例如一张图片或一串测量值。','像题目给出的已知条件。',['输入','input']);
  add('output','输出（output）','模型根据输入算出的结果，可能是分数、类别、坐标或数值。','像做完题后写下的答案。',['输出','output']);
  add('sample','样本（sample）','数据集中的一个例子，例如一张图片及其标注。','像练习册里的一道题。',['样本','sample']);
  add('label','标签（label）','告诉训练过程这个样本应该对应什么答案的信息。','像题目旁边由老师给出的标准答案。',['标签','label']);
  add('feature','特征（feature）','模型计算中能帮助区分对象的数值线索。','像判断水果时参考的颜色、形状和大小。',['特征','feature']);
  add('parameter','参数（parameter）','训练过程中模型会调整的数字，例如权重和偏置。','像机器内部能被训练过程转动的旋钮。',['参数','parameter','parameters']);
  add('hyperparameter','超参数（hyperparameter）','训练前由人设定、控制学习过程的选项，例如学习率。','像调机器前先选好的档位，不是机器从样本中直接学出的旋钮。',['超参数','hyperparameter']);
  add('training','训练（training）','模型反复预测、对照答案并调整参数的过程。','像做题、批改、改正，再做下一题。',['训练','training','train']);
  add('inference','推理（inference）','用已训练好的模型处理新输入并产生结果的过程。','像考试时用已经学会的方法解一道新题。',['推理','inference']);
  add('prediction','预测（prediction）','模型对输入给出的估计答案；它可能正确，也可能错误。','像学生先写下的答案，之后还要对照标准答案。',['预测','prediction']);
  add('ground-truth','真实标注（ground truth）','数据中记录的目标答案或目标位置，训练和评估时用来比较。','像老师核对时使用的标准答案。',['真实标注','真值','ground truth','ground-truth']);
  add('dataset','数据集（dataset）','按任务整理的一组样本，常包含输入与相应标签。','像一本按规则收集并整理好的练习册。',['数据集','dataset']);
  add('training-set','训练集（training set）','用于计算学习信号并更新模型参数的数据部分。','像平时用来练习的题目。',['训练集','training set']);
  add('validation-set','验证集（validation set）','训练期间用来比较方案和检查效果、但不直接更新参数的数据部分。','像阶段测验，帮助判断目前学得怎样。',['验证集','validation set','val']);
  add('test-set','测试集（test set）','最后用于独立检查模型效果、尽量不参与调参的数据部分。','像留到最后才打开的期末考卷。',['测试集','test set']);
  add('batch','批次（batch）','一次一起送进模型计算的一小组样本。','像一次端到老师面前批改的一摞作业。',['批次','批量','batch']);
  add('epoch','训练轮次（epoch）','训练过程把训练集完整使用一遍的计数单位。','像把整本练习册从头到尾做完一遍。',['epoch','训练轮次','轮次']);
  add('iteration','迭代步（iteration / step）','一次参数更新所对应的训练步骤；一个轮次可能包含很多步。','像每批练习批改后改一次学习方法。',['iteration','迭代','step','训练步']);
  add('dataloader','数据加载器（DataLoader）','按批次读取样本，并把它们整理成模型可接收形式的工具。','像把练习册按每页几题分好，再一页页送来。',['DataLoader','数据加载器','数据加载器']);

  // 网络输出与损失
  add('probability','概率（probability）','用 0 到 1 之间的数表示某件事发生的可能程度；1 表示确定发生，0 表示不发生。','像天气预报的降雨百分比；它表示可能性，不是原始打分。',['概率','probability']);
  add('probability-distribution','概率分布（probability distribution）','把总量为 1 的可能性分配给一组互斥结果。','像把 100 枚筹码分给几种互斥结果，分完刚好用尽。',['概率分布','probability distribution']);
  add('logit','logit / logits（模型原始分数）','模型在转换成概率之前给出的原始分数，可以是任意实数。','像评委先给候选人打原始分，还没有换算成百分比。',['logit','logits','原始分数'],'losses',{formalDefinition:'多类分类中，每个类别通常有一个 logit；同一组 logits 的相对差异决定 Softmax 概率。单个 logit 本身不是概率。'});
  add('sigmoid','Sigmoid（S 形函数）','把一个任意实数分数变成 0 到 1 之间的数，常用于表示二分类正类概率。','像把没有上下限的温度读数换成 0% 到 100% 的刻度。',['Sigmoid','sigmoid','逻辑函数'],'losses');
  add('softmax','Softmax（多类归一化函数）','把一组类别分数变成总和为 1 的概率，常用于互斥的多分类任务。','像先比较几位候选人的原始分，再把总票数按比例分给他们。',['Softmax','softmax'],'losses');
  add('loss','损失（loss）','把模型预测与目标之间的差异算成数字，供训练过程衡量和改进。','像一次作业的扣分；越不符合目标，通常损失越大。',['损失','损失函数','loss','loss function'],'losses');
  add('cross-entropy','交叉熵（Cross Entropy，CE）','根据模型分给真实答案的概率计算惩罚；真实答案概率越低，惩罚越大。','像猜盒中物品：把正确答案的可能性估得越低，扣分越多。',['交叉熵','Cross Entropy','cross entropy','CE','交叉熵损失'],'losses');
  add('bce','二元交叉熵（Binary Cross Entropy，BCE）','用于一个是/否答案的常见损失；按真实标签比较正类概率是否合理。','像判断“下雨/不下雨”：猜错且很肯定时扣分更多。',['二元交叉熵','Binary Cross Entropy','BCE'],'losses');
  add('bce-with-logits','带 logits 的二元交叉熵（BCEWithLogitsLoss）','PyTorch 的损失接口，直接接收原始分数，并以稳定方式组合 Sigmoid 与二元交叉熵。','像把原始打分直接交给评分器，由评分器内部完成换算和扣分。',['BCEWithLogitsLoss','带 logits 的 BCE'],'losses');
  add('bce-loss','二元交叉熵概率接口（BCELoss）','PyTorch 的二元交叉熵接口，输入应是已经算好的 0 到 1 概率。','像已经把分数换成百分比后，再交给扣分表。',['BCELoss'],'losses');
  add('cross-entropy-loss','多类交叉熵接口（CrossEntropyLoss）','PyTorch 常用多分类损失，常见用法是输入原始 logits 与类别编号标签。','像把每位候选人的原始得分和正确人选交给评分器。',['CrossEntropyLoss','nn.CrossEntropyLoss'],'losses');
  add('binary-classification','二分类（binary classification）','在两个互斥答案中作选择，例如“有/没有目标”。','像只有“是”和“否”两个按钮的问题。',['二分类','binary classification'],'losses');
  add('multiclass-classification','多分类（multiclass classification）','在三个或更多互斥类别中选一个答案。','像一道单选题，只能选一个选项。',['多分类','多类别分类','multiclass classification'],'losses');
  add('multilabel-classification','多标签分类（multi-label classification）','一个样本可以同时拥有多个成立标签，每个标签分别判断。','像一道可多选题，猫和户外可以同时为真。',['多标签分类','多标签','multi-label classification'],'losses');
  add('one-hot','独热编码（one-hot encoding）','用一串 0 和一个 1 表示互斥类别中的正确类别位置。','像只把单选题的正确选项灯点亮，其余灯关闭。',['独热','独热编码','one-hot','one hot'],'losses');
  add('multi-hot','多热编码（multi-hot encoding）','用多个 1 表示一个样本同时具备的多个标签。','像把多选题所有正确选项的灯同时点亮。',['多热','多热编码','multi-hot'],'losses');
  add('argmax','argmax（最大值位置）','返回一组数字里最大数所在的位置，常用于选出分数最高类别。','像在记分牌上指出分数最高的人，而不是保留所有分数。',['argmax','最大值位置'],'losses');
  add('cross-entropy-example','真实类概率（target-class probability）','模型分配给正确类别的概率；交叉熵主要根据这个数计算单样本惩罚。','像多选一时，模型给标准答案分到的那一份可能性。',['真实类概率','正确类别概率'],'losses');
  add('regression','回归（regression）','预测可连续变化的数量，例如温度、价格或坐标。','像预测下一小时的气温，答案不局限于几个选项。',['回归','regression'],'losses');
  add('mse','均方误差（Mean Squared Error，MSE）','把预测误差平方后再平均的损失；较大的误差会被放大。','像对偏差按平方收费，错得越远，增长越快。',['MSE','Mean Squared Error','均方误差'],'losses');
  add('mae','平均绝对误差（Mean Absolute Error，MAE）','把每个预测误差的绝对值取平均。','像按偏离目标的距离收取固定单价。',['MAE','Mean Absolute Error','平均绝对误差'],'losses');
  add('huber','Huber 损失（Huber loss）','小误差时采用平方惩罚，大误差时改为较缓的线性惩罚。','像小偏差按距离平方计费，偏差太大后改成固定单价。',['Huber','Huber loss','Smooth L1'],'losses');
  add('natural-exponential','自然指数函数（exp / e 的幂）','把数值变成 e 的相应次方；Softmax 用它把分数变为正数并放大差距。','像一种会快速增长的刻度尺。',['exp','指数函数','自然指数','exponential','e^']);
  add('e-constant','自然常数 e','约等于 2.718 的固定数学常数，自然指数与自然对数都以它为基础。','像一把固定单位尺上的常数刻度。',['自然常数','数学常数 e']);
  add('logarithm','对数（logarithm）','对数回答“一个底数要乘方多少次才能得到这个数”。','像反过来问：底数要重复相乘几次，才到目标数字？',['对数','logarithm','log']);
  add('natural-log','自然对数（natural logarithm，ln）','以 e 为底的对数；概率越低，负自然对数越大。','像把概率的稀少程度换成一把递增的惊讶刻度。',['自然对数','ln','natural logarithm'],'losses');
  add('summation','求和符号（Σ）','表示把指定范围内的数逐个加起来。','像把清单上的每项金额逐一相加。',['求和','求和符号','Σ','sum']);
  add('mean','平均值（mean）','把若干数相加后除以参与计算的数量。','像把一盒糖平均分给所有人。',['均值','平均值','mean']);
  add('variance','方差（variance）','衡量一组数离它们平均值有多分散的量。','像看同学成绩离班级平均分散得多不多。',['方差','variance']);
  add('standard-deviation','标准差（standard deviation）','方差开平方后得到的分散程度，单位与原数据相同。','像把“偏离得有多散”换回原数据熟悉的单位。',['标准差','standard deviation','std']);
  add('derivative','导数（derivative）','描述输入轻微变化时，输出大约会怎样变化。','像当前位置的坡度计，告诉你向前走一点会升多高。',['导数','derivative']);
  add('partial-derivative','偏导数（partial derivative）','有多个输入时，固定其他输入，只看其中一个输入变化造成的影响。','像只转动一个旋钮，观察仪表读数改变多少。',['偏导','偏导数','partial derivative','∂','∂L/∂w','∂L/∂θ']);
  add('gradient','梯度（gradient）','由多个偏导数组成，指出函数上升最快的局部方向。','像站在山坡上指向最陡上坡方向的箭头。',['梯度','gradient','∇','∇L']);
  add('norm','范数（norm）','把一组数的整体大小压成一个非负数；常见 L2 范数类似向量长度。','像把多根箭头的分量合成一个总长度。',['范数','norm','L2 范数','‖∇L‖']);
  add('matrix-multiplication','矩阵乘法（matrix multiplication）','用左边每一行和右边每一列对应相乘后求和，得到新表格。','像每位学生的成绩乘上各科权重，再分别汇总成总分。',['矩阵乘法','matrix multiplication','矩阵相乘','matmul'],'tensor');
  add('broadcasting','广播（broadcasting）','运算时把长度为 1 或缺失的轴按规则重复扩展，以便形状兼容。','像把一条统一规则复制到每一行，但要先确认行列能对齐。',['广播','broadcasting','广播机制','broadcast'],'tensor');
  add('gradient-descent','梯度下降（gradient descent）','沿梯度相反方向小步调整参数，尝试降低损失。','像沿着坡度最陡的下坡方向，一步步走向低处。',['梯度下降','gradient descent']);
  add('backpropagation','反向传播（backpropagation）','按链式法则把输出误差对各层参数的影响逐层算回去。','像从总账倒查每个环节各自贡献了多少误差。',['反向传播','backpropagation','backprop']);
  add('optimizer','优化器（optimizer）','根据梯度决定模型参数如何更新的算法。','像根据方向箭头和步幅规则，决定下一步怎么走。',['优化器','optimizer']);
  add('sgd','随机梯度下降（Stochastic Gradient Descent，SGD）','使用一个样本或一批样本估计梯度并更新参数的基本方法。','像每次根据一小批练习的表现调整学习方向。',['SGD','Stochastic Gradient Descent','随机梯度下降'],'optimizer');
  add('momentum','动量（momentum）','把过去的更新方向累积起来，让当前参数更新更平滑。','像推购物车时保留一点惯性，减少左右来回晃动。',['动量','momentum'],'optimizer');
  add('adam','Adam 优化器（Adaptive Moment Estimation）','结合梯度的平滑平均和平方大小的平滑平均来调整每个参数的更新。','像既参考最近的行进方向，也看每条路近期起伏有多大。',['Adam','Adaptive Moment Estimation'],'optimizer');
  add('learning-rate','学习率（learning rate）','控制每次参数更新步子大小的设置。','像每一步跨多远：过大容易越过目标，过小会走得很慢。',['学习率','learning rate','lr'],'optimizer');
  add('weight-decay','权重衰减（weight decay）','训练中限制参数持续变大的更新方式之一，用来减少复杂拟合。','像给旋钮的极端偏移加上温和的回拉力。',['权重衰减','weight decay','weight_decay'],'optimizer');
  add('regularization','正则化（regularization）','用训练策略或目标限制模型只记住训练例子的倾向。','像在背答案之外，也要求学生学会通用方法。',['正则化','regularization'],'regularization');
  add('overfitting','过拟合（overfitting）','模型在训练样本上表现很好，却在新样本上表现变差。','像把练习题答案背下来，换一道题就不会做。',['过拟合','overfitting'],'regularization');
  add('underfitting','欠拟合（underfitting）','模型连训练数据里的主要规律都还没学会。','像还没掌握基础方法，熟题也做不对。',['欠拟合','underfitting'],'regularization');
  add('dropout','随机失活（Dropout）','训练时随机暂时关闭部分神经元输出，减少模型依赖某一小组单元。','像练习时轮流遮住一部分提示，避免只记住某个提示。',['Dropout','dropout','随机失活'],'regularization');
  add('batch-normalization','批量归一化（Batch Normalization，BatchNorm / BN）','按通道整理中间数值的尺度，再用可学习参数调整。训练和评估时统计方式不同。','像先把每组测量值换成相近尺度，再允许模型重新调整。',['BatchNorm','Batch Normalization','BN','批量归一化'],'network');

  // 数字、张量与图像
  add('scalar','标量（scalar）','只有一个数值、没有轴的数据。','像一个温度读数。',['标量','scalar'],'tensor');
  add('vector','向量（vector）','按顺序排列的一串数值，常用来表示多个特征或坐标。','像一排有编号的小格子，每格放一个数。',['向量','vector'],'tensor');
  add('matrix','矩阵（matrix）','按行和列排成的数值表。','像一张有行列编号的成绩表。',['矩阵','matrix'],'tensor');
  add('tensor','张量（tensor）','计算机里可看作按多条轴分组的数值数组。','像一叠表格，表格里再按规则装着数字。',['张量','tensor'],'tensor');
  add('axis','轴（axis）','张量中代表一种排列方向或分组方式的维度。','像表格的行方向或列方向。',['轴','axis'],'tensor');
  add('shape','形状（shape）','按顺序列出每条轴有多少个位置。','像说明一个盒子里有几层、每层几行、每行几格。',['shape','形状'],'tensor');
  add('dimension','维度（dimension）','张量中轴的数量；在编程里也常用于说某条轴的长度，需看上下文。','像货架有几种排列方向；具体每格数量另看尺寸。',['维度','dimension','dim'],'tensor');
  add('index','索引（index）','用位置编号找到数组或张量中的元素；Python 通常从 0 开始编号。','像图书馆书架上的位置号。',['索引','index'],'tensor');
  add('stride','步幅（stride）','沿一条轴前进一个索引时，底层存储位置要跨过的元素数。','像在一排座位上每次隔几张椅子再坐下。',['stride','步幅'],'tensor',{contextNote:'张量内存步幅与卷积/池化窗口的移动步幅意思不同；本卡面向张量存储。'});
  add('storage','底层存储（storage）','实际保存张量元素的一段内存区域。','像仓库里实际摆放货物的货架。',['storage','底层存储'],'tensor');
  add('offset','存储偏移（storage offset）','张量的逻辑第一个元素从底层存储的哪个位置开始读取。','像从货架第几个格子开始清点。',['offset','storage_offset','存储偏移'],'tensor');
  add('contiguous','连续布局（contiguous）','元素的内存排列顺序符合张量当前默认轴顺序的布局。','像书页按阅读顺序连续摆放，翻页时不必跳来跳去。',['contiguous','连续张量','连续布局'],'tensor');
  add('dot-product','点积（dot product）','把两个等长向量相同位置的数字相乘，再把结果相加。','像两串同位置配对的数量相乘后总计。',['点积','内积','dot product','torch.dot'],'tensor');
  add('cross-product','叉积（cross product）','三维向量的一种运算，结果是同时垂直于两个输入向量的向量。','像用两根方向箭头确定一根垂直于它们的箭头。',['叉积','cross product'],'tensor');
  add('pixel','像素（pixel）','数字图像中的一个位置，保存该处的颜色或亮度数值。','像马赛克中的一个小色块。',['像素','pixel'],'image');
  add('channel','通道（channel）','图像或特征中一组对应位置的数值平面，例如红、绿、蓝三个颜色平面。','像三张透明彩色胶片叠起来组成一幅图。',['通道','channel'],'image');
  add('rgb','RGB（Red, Green, Blue；红、绿、蓝）','按红、绿、蓝三个颜色强度表示彩色像素的常见顺序。','像用红、绿、蓝三盏灯调出一个颜色。',['RGB','Red, Green, Blue'],'image');
  add('bgr','BGR（Blue, Green, Red；蓝、绿、红）','把蓝、绿、红按此顺序存放的颜色通道约定，OpenCV 读图常见此顺序。','像相同三盏灯换了排列顺序；顺序错会让颜色看起来不对。',['BGR','Blue, Green, Red'],'image');
  add('hwc','HWC 图像布局（Height, Width, Channels）','先按图像高度、再按宽度、最后按通道排列数值的布局。','像先按行列摆好画布，再在每个像素位置叠颜色。',['HWC'],'image');
  add('chw','CHW 图像布局（Channels, Height, Width）','先放通道，再放高度和宽度的布局，常见于 PyTorch 图像张量。','像先按颜色分三张图，再分别记录每张图的位置。',['CHW'],'image');
  add('nchw','NCHW 图像批次布局（Batch, Channels, Height, Width）','依次用批次、通道、高度、宽度表示一组图片的常见张量布局。','像一叠照片；每张照片又按颜色、行、列排数字。',['NCHW'],'image');
  add('normalization','归一化（normalization）','按明确规则缩放数值，让数值范围或尺度符合模型输入约定。','像把不同单位的刻度换成同一把量尺。',['归一化','normalization'],'image');
  add('standardization','标准化（standardization）','常见做法是减去平均值，再除以标准差，让数值围绕 0、尺度相近。','像先减去班级平均分，再用常见分差作为单位。',['标准化','standardization'],'image');
  add('uint8','无符号 8 位整数（uint8）','只能保存 0 到 255 的整数，常用于保存图像像素。','像只有 256 格刻度的计数器。',['uint8'],'tensor');
  add('float32','单精度浮点（FP32 / float32）','一种常见 32 位浮点数格式；FP32 与 float32 通常指同一精度表示。','像较细的刻度尺，但需要较多格子保存读数。',['float32','FP32','float32 dtype','single precision'],'tensor');
  add('dtype','数据类型（dtype）','说明张量里存放整数、小数或其他类型的数据，以及这些值如何表示。','像标明盒子里放的是整数积木还是小数液体。',['dtype','数据类型'],'tensor');
  add('device','计算设备（device）','张量所在或运算发生的位置，例如 CPU 或 GPU。','像选择在哪张工作台上处理材料。',['device','计算设备'],'tensor');
  add('cpu','中央处理器（Central Processing Unit，CPU）','通用计算部件，擅长执行多种程序任务。','像多技能的总控工作台。',['CPU','Central Processing Unit']);
  add('gpu','图形处理器（Graphics Processing Unit，GPU）','可并行处理大量相似数字运算的计算设备，常用于深度学习。','像许多工人同时做同一种计算。',['GPU','Graphics Processing Unit']);
  add('vram','显存（video memory / VRAM）','GPU 上用于暂存模型、图像和中间结果的内存。','像放在 GPU 工作台旁、可快速取用的桌面空间。',['显存','VRAM','video memory'],'training');
  add('fp16','半精度浮点（FP16）','一种 16 位浮点数格式，通常能降低内存和计算开销，但可表示范围较小。','像刻度更少的轻量尺，省空间但极端数值更容易超范围。',['FP16','float16'],'training');
  add('amp','自动混合精度（Automatic Mixed Precision，AMP）','在合适的运算中混用不同浮点精度，以节省资源并维持训练稳定性。','像大多数测量用轻便尺，关键测量再换更精细的尺。',['AMP','Automatic Mixed Precision','自动混合精度'],'training');

  // 网络与视觉模型
  add('fully-connected','全连接层 / Linear（fully connected layer）','让输入中的每个数都参与每个输出数的加权求和。','像每个输入线索都能给每个答案候选贡献分数。',['全连接层','Linear','nn.Linear','fully connected'],'network');
  add('weight','权重（weight）','乘在输入数前面的可训练数字，决定这条输入对输出的影响。','像混合配方里每种材料所占的比例。',['权重','weight'],'network');
  add('bias','偏置（bias）','加在加权求和结果上的可训练常数，可以整体移动输出。','像给整条刻度线加一个统一的起始偏移。',['偏置','bias'],'network');
  add('affine','仿射变换（affine transformation）','先做线性组合，再加一个偏置的计算，例如 z=w·x+b。','像先按比例缩放，再整体平移。',['仿射','仿射变换','affine'],'network');
  add('activation','激活函数（activation function）','作用于神经元计算结果的函数，让多层网络能表示非线性关系。','像每个路口的一道可调门，决定哪些信号通过、怎样变化。',['激活函数','activation function'],'network');
  add('relu','ReLU（Rectified Linear Unit，修正线性单元）','负数变成 0，正数保持不变的激活函数。','像只让正向信号通过的单向门。',['ReLU','Rectified Linear Unit'],'network');
  add('silu','SiLU（Sigmoid Linear Unit）','把输入乘以它的 Sigmoid 值，让较大正数通过、负数被平滑压小。','像一扇开合平滑、不会突然啪地关上的门。',['SiLU','Swish'],'network');
  add('gelu','GELU（Gaussian Error Linear Unit）','按输入大小平滑调整信号通过程度的激活函数。','像根据输入大小柔和调节水流的阀门。',['GELU','Gaussian Error Linear Unit'],'network');
  add('neuron','神经元（neuron）','网络中的一个计算单元，常把输入加权求和、加偏置并经过激活。','像一个小评委，把几条线索加权后给出自己的分数。',['神经元','neuron'],'network');
  add('linear-layer','线性层（linear layer）','按权重和偏置把一组输入数字变成一组输出数字的层。','像一组并排的小评委，每人按自己的权重打分。',['线性层','linear layer'],'network');
  add('convolution','卷积（convolution）','用同一组小权重在图像不同位置重复计算，提取局部模式。','像拿同一块模板在整张图片上逐处比对。',['卷积','convolution'],'cnn');
  add('kernel','卷积核 / 滤波器（kernel / filter）','一小组卷积权重，用于检测边缘、纹理等局部组合。','像一块可学习的小印章，扫过图像寻找相似图案。',['卷积核','滤波器','kernel','filter'],'cnn');
  add('feature-map','特征图（feature map）','卷积等计算后得到的一张数值图，表示某种模式在各位置的响应。','像一张热度图，亮处代表某种线索更明显。',['特征图','feature map'],'cnn');
  add('conv-stride','卷积步幅（convolution stride）','卷积窗口每次移动的像素格数；步幅越大，输出空间尺寸通常越小。','像模板每次向前跨几格。',['stride=','卷积步幅','convolution stride'],'cnn');
  add('padding','填充（padding）','在输入边缘补上数值，控制卷积窗口能访问哪些边界位置及输出尺寸。','像在画纸外侧补空白边，方便模板扫到边缘。',['padding','填充'],'cnn');
  add('dilation','空洞率（dilation）','卷积核内部元素之间隔开的位置数，用较少权重查看更大的区域。','像用带间隔的梳子，一次触到更宽的范围。',['dilation','空洞率'],'cnn');
  add('pooling','池化（pooling）','在小区域里汇总数值，常用来缩小特征图的宽和高。','像把一小块区域用最高分或平均分代表。',['池化','pooling'],'pooling');
  add('receptive-field','感受野（receptive field）','某个输出位置能通过网络影响或看到的输入范围。','像观察员从所在位置能看见的那片区域。',['感受野','receptive field'],'cnn');
  add('downsampling','下采样（downsampling）','减少特征图的空间位置数量，降低后续计算量。','像把大图缩小成较少格子的预览图。',['下采样','downsampling'],'cnn');
  add('depthwise-convolution','逐通道卷积（depthwise convolution）','每个输入通道分别使用卷积核，不在该步骤里混合通道。','像每张颜色胶片各自先做一次局部检查。',['depthwise convolution','逐通道卷积'],'cnn');

  // 三维旋转
  add('euler-angles','欧拉角（Euler angles）','用依次绕三个指定轴转动的角度表示三维朝向；必须说明旋转顺序和坐标约定。','像先转方向盘、再抬头、再侧倾；顺序一变，最终朝向通常也变。',['欧拉角','Euler angles'],'quaternion');
  add('quaternion','四元数（quaternion）','用四个数编码三维旋转的一种表示；旋转四元数通常先归一化。','像用一组可组合的四个旋钮记录三维朝向。',['四元数','quaternion'],'quaternion');
  add('axis-angle','轴角表示（axis-angle）','用一条旋转轴和绕该轴转过的角度描述一次三维旋转。','像指明绕哪根箭头旋转、转几度。',['轴角','轴角表示','axis-angle'],'quaternion');
  add('rotation-matrix','旋转矩阵（rotation matrix）','用矩阵乘法把向量转到新的方向，并保持长度与夹角。','像一张方向换算表，把旧坐标换成旋转后的坐标。',['旋转矩阵','rotation matrix'],'quaternion');
  add('radian','弧度（radian）','以圆弧长度相对半径表示角度的单位；一整圈是 2π 弧度。','像用圆的半径当作量角的尺。',['弧度','radian','radians'],'quaternion');
  add('degree','角度（degree）','把一整圈分成 360 份的角度单位。','像把圆盘均分成 360 格来量转动。',['角度','角度单位','degrees'],'quaternion');
  add('gimbal-lock','万向节锁（gimbal lock）','欧拉角表示中的一种特殊姿态，此时两个旋转轴对齐，独立调整方向会受限。','像三个套在一起的转环中，两个环转到同一方向后失去一个独立转动方向。',['万向节锁','gimbal lock'],'quaternion');
  add('slerp','球面线性插值（Spherical Linear Interpolation，SLERP）','沿单位球面上的较短弧，在两个旋转姿态之间平滑插值。','像沿球面最短路线从一个方向滑到另一个方向。',['SLERP','Spherical Linear Interpolation'],'quaternion');

  // 目标检测与 YOLOv5
  add('object-detection','目标检测（object detection）','找出图像里有哪些物体、每个物体在哪里，以及可能属于什么类别。','像在照片上圈出每辆车，再给每个框贴上类别名。',['目标检测','object detection'],'tasks');
  add('classification','分类（classification）','从规定的类别中判断一个样本属于哪一类。','像给整张照片选一个最合适的标签。',['分类','classification'],'tasks');
  add('segmentation','分割（segmentation）','为图像中的像素逐处标出类别或对象归属。','像沿着物体轮廓把照片涂成不同区域。',['分割','segmentation'],'tasks');
  add('backbone','骨干网络（backbone）','网络中负责从输入图像逐步提取特征的主体部分。','像先从照片里找边缘、纹理，再组合成物体线索的观察员。',['Backbone','backbone','骨干网络'],'architecture');
  add('neck','特征融合层（neck）','连接不同深浅、不同尺寸特征并进行融合的网络部分。','像把局部细节和整体场景线索放到同一张讨论桌上。',['Neck','neck','特征融合层'],'architecture');
  add('head','检测头（head / detection head）','把融合后的特征转换成框、类别等任务结果的网络部分。','像根据前面整理的线索，写出“是什么、在哪里”的答题员。',['Head','检测头','detection head'],'architecture');
  add('fpn','特征金字塔网络（Feature Pyramid Network，FPN）','把不同分辨率的特征逐级融合，让模型兼顾大小不同的目标。','像把全景地图与局部放大图逐层对照。',['FPN','Feature Pyramid Network'],'architecture');
  add('pan','路径聚合网络（Path Aggregation Network，PAN）','通过额外的信息传递路径融合不同尺度特征的网络结构。','像在楼层之间增加双向楼梯，让细节与整体线索更容易互通。',['PAN','Path Aggregation Network'],'architecture');
  add('csp','跨阶段局部连接（Cross Stage Partial，CSP）','把部分特征走过一段计算、另一部分走较短路径，再合并的结构思路。','像一组人分成两队，一队深入讨论，另一队保留原始线索，最后合并意见。',['CSP','Cross Stage Partial'],'architecture');
  add('c3','YOLOv5 C3 模块','YOLOv5 中一种 CSP 风格模块：分出并行特征路径，经过瓶颈计算后再合并。','像把线索分成两队，一队做更细加工，最后汇总。',['C3','C3 模块'],'architecture');
  add('bottleneck','瓶颈模块（bottleneck block）','先把通道压窄、做主要计算，再按需要恢复通道数的模块。','像先把宽材料收进窄管处理，再展开成原来的宽度。',['Bottleneck','瓶颈模块'],'architecture');
  add('sppf','快速空间金字塔池化（Spatial Pyramid Pooling–Fast，SPPF）','YOLOv5 中用多次池化汇集不同范围上下文的模块。','像先看一个小邻域，再看逐渐扩大的区域，最后把线索拼起来。',['SPPF','Spatial Pyramid Pooling','空间金字塔池化'],'architecture');
  add('residual-connection','残差连接 / 捷径连接（residual / shortcut connection）','把较早的输入直接加到后面的计算结果上，给信息和梯度留一条直达路径。','像在复杂路线旁保留一条直路，最终把两条路的结果相加。',['残差连接','捷径连接','shortcut','skip connection','residual connection'],'cnn');
  add('concatenation','拼接（concatenation / Concat）','沿指定轴把多组张量并排接在一起，不是逐项相加。','像把两列不同信息并排贴到一张表里。',['拼接','Concat','concatenation'],'architecture');
  add('feature-p3','P3 特征层','YOLOv5 检测头中空间分辨率较高的一层，保留较多位置细节，常用于小目标。','像较大比例尺的地图，格子多、位置看得细。',['P3'],'architecture');
  add('feature-p4','P4 特征层','YOLOv5 检测头中空间分辨率居中的一层，平衡位置细节与范围。','像中等比例尺地图，细节和覆盖范围折中。',['P4'],'architecture');
  add('feature-p5','P5 特征层','YOLOv5 检测头中空间分辨率较低、单格覆盖范围较大的一层。','像较小比例尺的地图，格子少但每格看得更广。',['P5'],'architecture');
  add('grid','网格（grid cell）','特征图上的一个位置单元，检测器可在这里产生物体预测。','像把地图分成许多方格，逐格检查附近是否有目标。',['网格','grid cell','grid'],'anchors');
  add('anchor','锚框（anchor）','预设的宽高参考框，帮助检测器组织候选框和训练匹配。','像先放在图上的空白模板，网络再调整它的位置和大小。',['anchor','anchors','锚框'],'anchors');
  add('candidate-box','候选框（candidate box）','模型产生、还未经过最终筛选的一种目标位置猜测。','像草稿上先圈出的一个可能位置。',['候选框','candidate box','候选预测框'],'anchors');
  add('positive-sample','正样本（positive sample）','训练中被分配为负责某个真实目标的预测位置或候选。','像老师指定负责回答某道题的那一位学生。',['正样本','positive sample'],'anchors');
  add('negative-sample','负样本（negative sample）','训练中被当作背景或不匹配目标来处理的候选。','像检查后确认并不负责该目标的候选位置。',['负样本','negative sample'],'anchors');
  add('objectness','目标存在性分数（objectness）','模型对某候选位置包含物体的预测分数。','像先问“这里有没有东西”的门卫。',['objectness','目标性','目标存在性'],'yolo-loss');
  add('class-score','类别分数（class score）','模型对候选目标属于某个类别的预测分数。','像目标通过门卫后，分类员再判断它是什么。',['class score','类别分数','分类分数'],'yolo-loss');
  add('confidence-threshold','置信度阈值（confidence threshold）','保留预测前设置的最低分数门槛。','像考试先设最低及格线，低于门槛的答案暂不保留。',['置信度阈值','confidence threshold'],'inference');
  add('decode','解码（decode）','把网络输出的偏移或分数组合成可读坐标、类别和分数的过程。','像把机器内部的简写草稿翻译成框和标签。',['解码','decode'],'inference');
  add('bounding-box','边界框（bounding box）','用矩形框近似表示物体在图像中的位置和大小。','像在照片上套一个刚好圈住物体的透明矩形。',['边界框','bounding box','bbox','检测框'],'iou');
  add('iou','交并比（Intersection over Union，IoU）','预测框与真实框的交集面积除以两框的并集面积。','像比较两个圈有多少共同覆盖，再除以它们总共覆盖的区域。',['IoU','Intersection over Union','交并比'],'iou');
  add('intersection','交集（intersection）','两个形状或集合中共同覆盖、重合的部分。','像两张透明纸叠在一起时，彼此重合的那一块。',['交集','intersection'],'iou');
  add('union','并集（union）','把两个形状或集合覆盖到的所有部分合在一起，重合处只算一次。','像把两张透明纸覆盖的范围都涂上颜色，交叠处不重复计算。',['并集','union'],'iou');
  add('ciou','完全交并比（Complete IoU，CIoU）','在 IoU 基础上还考虑框中心距离和宽高比例的定位损失指标。','像不仅看两个框重叠多少，还看中心偏多远、形状差多少。',['CIoU','Complete IoU'],'yolo-loss');
  add('nms','非极大值抑制（Non-Maximum Suppression，NMS）','按分数保留较好的框，并去掉与它高度重叠的重复框。','像重复报同一物体时，只保留最可信的一张报告。',['NMS','Non-Maximum Suppression','非极大值抑制'],'metrics');
  add('true-positive','真阳性（true positive，TP）','按评估规则与真实目标正确匹配的一项预测。','像正确找到目标并且类别、位置都符合要求。',['TP','true positive','真阳性'],'metrics');
  add('false-positive','假阳性（false positive，FP）','模型报出了目标，但评估规则判定这项预测不正确。','像把背景误认成目标，或同一个目标重复报了两次。',['FP','false positive','假阳性','误报'],'metrics');
  add('false-negative','假阴性（false negative，FN）','真实目标存在，但模型没有留下对应的正确预测。','像照片里有目标，模型却漏掉了它。',['FN','false negative','假阴性','漏检'],'metrics');
  add('precision','精确率（Precision）','所有被模型报出的预测中，有多少是正确的。','像问“我报出来的目标里，有多少真的找对了？”',['Precision','精确率'],'metrics');
  add('recall','召回率（Recall）','所有真实目标中，有多少被模型正确找到了。','像问“照片里的真实目标，我找回了多少？”',['Recall','召回率'],'metrics');
  add('f1','F1 分数（F1 score）','Precision 与 Recall 的调和平均，用一个数折中反映二者。','像同时考察误报控制和漏检控制的综合成绩。',['F1','F1 score','F1 分数'],'metrics');
  add('ap','平均精度（Average Precision，AP）','把不同置信度门槛下的 Precision 和 Recall 汇总成一项类别指标。','像沿着不同及格线记录的准确表现，再汇总成一张成绩单。',['AP','Average Precision','平均精度'],'metrics');
  add('map','平均平均精度（mean Average Precision，mAP）','对多个类别的 AP 求平均；具体结果还取决于 IoU 门槛等评估协议。','像先给每门课算成绩，再对各门课取平均。',['mAP','mean Average Precision','平均平均精度'],'metrics');

  // 数据、训练工程与部署
  add('yaml','YAML 配置文件（YAML Ain’t Markup Language）','用缩进组织的文本配置文件，常保存数据路径、类别名称等设置。','像一张按层级填写的实验设置表。',['YAML','yaml'],'dataset');
  add('path','文件路径（path）','指出文件或文件夹在电脑中的位置。','像写清楚一本书在图书馆的楼层、书架和格子号。',['路径','path'],'dataset');
  add('command-line','命令行界面（Command-Line Interface，CLI）','通过输入文字命令运行程序并传递参数的界面。','像用文字给机器逐条下达指令。',['命令行','CLI','Command-Line Interface','终端命令'],'train-yolo');
  add('working-directory','工作目录（working directory）','程序运行时默认查找相对路径文件的起点文件夹。','像打开文件柜时当前站的位置，之后的相对方向都从这里算。',['工作目录','working directory','当前目录'],'train-yolo');
  add('pretrained-weights','预训练权重（pretrained weights）','模型先前在其他数据上训练得到、可用于新任务起步的一组参数。','像从已经练过基本功的选手开始，再训练新项目。',['预训练权重','pretrained weights'],'transfer');
  add('checkpoint','检查点（checkpoint）','训练过程中保存的一份模型或训练状态，便于评估、部署或继续训练。','像学习进度的存档点。',['checkpoint','检查点'],'training');
  add('state-dict','参数字典（state_dict）','PyTorch 中以名称对应张量的方式保存模块参数和相关状态的结构。','像按零件名称登记的模型部件清单。',['state_dict','状态字典'],'training');
  add('buffer','缓冲状态（buffer）','保存在模型里、通常不是梯度训练参数的状态值，例如 BatchNorm 运行均值。','像仪器保存的参考读数，不是每次都靠梯度拧的旋钮。',['buffer','缓冲区'],'network');
  add('quantization','量化（quantization）','用较少位数或离散数值近似表示模型权重和运算。','像用较少刻度的尺记录数值，省空间但会有近似误差。',['量化','quantization'],'inference');
  add('onnx','开放神经网络交换格式（Open Neural Network Exchange，ONNX）','一种用于交换模型计算图的开放格式，可由支持它的运行工具加载。','像让不同软件都能读取的一种模型交换文件。',['ONNX','Open Neural Network Exchange'],'inference');
  add('runtime','运行时（runtime）','负责加载模型并实际执行模型运算的软件环境。','像真正把机器接电并执行工作的操作台。',['运行时','runtime'],'inference');
  add('openvino','OpenVINO 工具套件','面向 Intel 硬件部署和优化模型的一组工具与运行组件。','像针对一类工作台准备的模型转换和执行工具箱。',['OpenVINO'],'inference');
  add('tensorrt','TensorRT 推理 SDK','NVIDIA 提供的模型优化与推理软件开发工具包。','像针对 NVIDIA GPU 准备的模型加速工具箱。',['TensorRT'],'inference');
  add('api','应用程序接口（Application Programming Interface，API）','让一个程序按约定请求另一个程序提供功能的接口。','像按菜单格式下单，再接收厨房返回的结果。',['API','Application Programming Interface','接口'],'inference');
  add('latency','延迟（latency）','一次输入从发出到收到结果所经历的时间。','像按下按钮后等待机器给出答案的时长。',['延迟','latency'],'inference');
  add('throughput','吞吐量（throughput）','一段时间内系统能处理的输入数量。','像厨房每分钟能完成多少份订单。',['吞吐量','throughput'],'inference');
  add('fps','帧率（frames per second，FPS）','每秒处理或显示的图像帧数。','像每秒翻过多少张连续画面。',['FPS','frames per second','帧率'],'inference');
  add('nan','非数值（Not a Number，NaN）','浮点运算产生的无效数值标记，例如非法运算结果。','像仪表显示“这个读数算不出来”。',['NaN','Not a Number'],'debugging');
  add('infinity','无穷大（infinity / Inf）','浮点数中的正或负无穷标记，常见于数值溢出或除零。','像计数器已经超出可显示范围。',['Inf','infinity','无穷大'],'debugging');
  add('none','空值（None）','Python 中表示“这里没有对象或结果”的特殊值，不等同于数字 0。','像表格里空着没填，不是填了零分。',['None','空值'],'debugging');
  add('random-seed','随机种子（random seed）','控制伪随机数序列起点的数值，用于帮助复现实验。','像随机抽牌前选定洗牌序列的起始编号。',['随机种子','random seed','seed'],'training');

  const byId=Object.fromEntries(items.map(item=>[item.id,item]));
  const aliases=items.flatMap(item=>item.aliases.map(alias=>({alias,item}))).sort((a,b)=>b.alias.length-a.alias.length);
  const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const alternation=aliases.map(entry=>escapeRegExp(entry.alias)).join('|');
  const matcher=alternation?new RegExp('(^|[^A-Za-z0-9_])('+alternation+')(?=$|[^A-Za-z0-9_])','giu'):null;
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function lookup(alias){return aliases.find(entry=>entry.alias.toLocaleLowerCase()===String(alias).toLocaleLowerCase())?.item||null}
  function chip(id,label){const item=byId[id];if(!item)return '';return '<button class="glossary-chip" type="button" data-glossary-open="'+escapeHtml(id)+'" aria-haspopup="dialog">'+escapeHtml(label||item.title)+'<span aria-hidden="true">ⓘ</span></button>'}
  function renderSearch(query){
    const q=String(query||'').trim().toLocaleLowerCase();if(!q)return [];
    return items.filter(item=>[item.title,...item.aliases,item.plainExplanation].some(value=>String(value).toLocaleLowerCase().includes(q))).slice(0,8);
  }
  function eligible(node){
    const parent=node.parentElement;
    return parent&&!parent.closest('script,style,textarea,pre,option,svg,math,a,button,.katex,.glossary-term,.glossary-card,.glossary-chip,[contenteditable="true"]');
  }
  function firstTerm(text){matcher.lastIndex=0;const match=matcher.exec(String(text||''));matcher.lastIndex=0;return match?lookup(match[2]):null;}
  function addTooltipHint(element,item){
    if(!element||!item||element.dataset.termId||element.dataset.glossaryOpen||element.classList?.contains('glossary-chip'))return;
    element.dataset.glossaryTooltip=item.id;
    const descriptionId='glossary-description-'+item.id,described=(element.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);
    if(!described.includes(descriptionId))described.push(descriptionId);
    element.setAttribute('aria-describedby',described.join(' '));
    if(element.namespaceURI==='http://www.w3.org/2000/svg')element.setAttribute('tabindex','0');
  }
  function decorateHintTargets(root){
    const candidates=[];
    if(root.matches?.('a,button,label,select,input,svg text'))candidates.push(root);
    candidates.push(...(root.querySelectorAll?.('a,button,label,select,input,svg text')||[]));
    candidates.forEach(element=>{
      if(element.closest?.('.glossary-card,.glossary-chip'))return;
      const source=element.matches('input,select')?(element.getAttribute('aria-label')||element.labels?.[0]?.textContent||''):element.textContent;
      const item=firstTerm(source);if(item)addTooltipHint(element,item);
    });
  }
  function decorate(root){
    if(!root||!matcher)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())if(eligible(walker.currentNode)&&matcher.test(walker.currentNode.nodeValue)){matcher.lastIndex=0;nodes.push(walker.currentNode)}
    nodes.forEach(node=>{
      const source=node.nodeValue;matcher.lastIndex=0;let cursor=0,match,fragment=document.createDocumentFragment(),changed=false;
      while((match=matcher.exec(source))){
        const item=lookup(match[2]);if(!item)continue;
        const start=match.index+match[1].length,end=start+match[2].length;
        if(start<cursor)continue;
        fragment.append(document.createTextNode(source.slice(cursor,start)));
        const mark=document.createElement('dfn'),interactive=node.parentElement?.closest('a,button');mark.className='glossary-term';mark.dataset.termId=item.id;mark.tabIndex=0;mark.setAttribute('aria-label',item.title+'。按回车或点击查看解释。');mark.setAttribute('aria-haspopup','dialog');mark.setAttribute('aria-describedby','glossary-description-'+item.id);mark.textContent=source.slice(start,end);if(interactive){const ids=(interactive.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);if(!ids.includes('glossary-description-'+item.id))ids.push('glossary-description-'+item.id);interactive.setAttribute('aria-describedby',ids.join(' '));}fragment.append(mark);cursor=end;changed=true;
        if(match[0].length===0)matcher.lastIndex++;
      }
      if(changed){fragment.append(document.createTextNode(source.slice(cursor)));node.parentNode?.replaceChild(fragment,node);}
    });
    decorateHintTargets(root);
  }
  function init(){
    if(window.visionlabGlossary?.initialized)return;
    const descriptions=document.createElement('div');descriptions.className='glossary-screenreader-only';descriptions.setAttribute('aria-hidden','false');
    descriptions.innerHTML=items.map(item=>'<span id="glossary-description-'+escapeHtml(item.id)+'">'+escapeHtml(item.title+'。'+item.plainExplanation+'。比喻：'+item.metaphor)+'</span>').join('');
    document.body.append(descriptions);
    const tooltip=document.createElement('div');tooltip.id='visionlab-term-tooltip';tooltip.className='glossary-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;document.body.append(tooltip);
    const card=document.createElement('section');card.id='visionlab-term-card';card.className='glossary-card';card.setAttribute('role','dialog');card.setAttribute('aria-modal','false');card.setAttribute('aria-labelledby','glossary-card-title');card.hidden=true;
    document.body.append(card);
    let active=null,returnFocus=null,hideTimer=0;
    const position=(element,target)=>{const r=target.getBoundingClientRect(),w=Math.min(360,window.innerWidth-24),h=element.getBoundingClientRect().height||120,left=Math.min(window.innerWidth-w-12,Math.max(12,r.left)),below=r.bottom+8,top=below+h<=window.innerHeight-12?below:Math.max(12,r.top-h-8);element.style.left=left+'px';element.style.top=top+'px';};
    const showShort=(target)=>{const item=byId[target.dataset.termId||target.dataset.glossaryOpen||target.dataset.glossaryTooltip];if(!item)return;active=target;tooltip.textContent=item.title+'：'+item.plainExplanation;tooltip.hidden=false;position(tooltip,target);const described=(target.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);if(!described.includes('visionlab-term-tooltip'))described.push('visionlab-term-tooltip');target.setAttribute('aria-describedby',described.join(' '));};
    const hideShort=()=>{tooltip.hidden=true;if(active){const id=active.dataset.termId||active.dataset.glossaryOpen||active.dataset.glossaryTooltip;if(id){const described=(active.getAttribute('aria-describedby')||'').split(/\s+/).filter(value=>value&&value!=='visionlab-term-tooltip');const description='glossary-description-'+id;if(!described.includes(description))described.push(description);active.setAttribute('aria-describedby',described.join(' '));}}active=null;};
    const close=restore=>{card.hidden=true;document.querySelectorAll('[aria-expanded="true"][data-term-id],[aria-expanded="true"][data-glossary-open]').forEach(node=>node.setAttribute('aria-expanded','false'));if(restore&&returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;};
    const open=(target,id)=>{const item=byId[id];if(!item)return;clearTimeout(hideTimer);hideShort();returnFocus=target;target.setAttribute('aria-expanded','true');card.innerHTML='<button class="glossary-close" type="button" aria-label="关闭术语解释">×</button><span class="chapter-kicker">术语小卡</span><h2 id="glossary-card-title">'+escapeHtml(item.title)+'</h2><p class="glossary-plain">'+escapeHtml(item.plainExplanation)+'</p><div class="glossary-metaphor"><strong>生活比喻</strong><p>'+escapeHtml(item.metaphor)+'</p></div>'+(item.contextNote?'<p class="glossary-context">'+escapeHtml(item.contextNote)+'</p>':'')+(item.formalDefinition?'<details class="glossary-formal"><summary>再看一步</summary><p>'+escapeHtml(item.formalDefinition)+'</p></details>':'')+'<a class="glossary-learn-more" href="'+escapeHtml(item.learnMore)+'">去课程里继续学 ↗</a>';
      card.hidden=false;position(card,target);card.querySelector('.glossary-close').focus({preventScroll:true});};
    const onPointerOver=event=>{const target=event.target.closest?.('[data-term-id],[data-glossary-open],[data-glossary-tooltip]');if(target&&!card.contains(target))showShort(target);};
    const onPointerOut=event=>{const target=event.target.closest?.('[data-term-id],[data-glossary-open],[data-glossary-tooltip]');if(target&&!target.contains(event.relatedTarget)&&!card.hidden){return}if(target&&!target.contains(event.relatedTarget))hideTimer=setTimeout(hideShort,90);};
    const onFocusIn=event=>{const target=event.target.closest?.('[data-term-id],[data-glossary-open],[data-glossary-tooltip]');if(target)showShort(target);};
    document.addEventListener('pointerover',onPointerOver);
    document.addEventListener('pointerout',onPointerOut);
    document.addEventListener('focusin',onFocusIn);
    document.addEventListener('click',event=>{
      const closeButton=event.target.closest('.glossary-close');if(closeButton){event.preventDefault();close(true);return;}
      const tooltipOnly=event.target.closest?.('[data-glossary-tooltip]');if(tooltipOnly&&!tooltipOnly.matches('[data-term-id],[data-glossary-open]'))hideShort();
      const target=event.target.closest?.('[data-term-id],[data-glossary-open]');
      if(target){event.preventDefault();event.stopPropagation();open(target,target.dataset.termId||target.dataset.glossaryOpen);return;}
      if(event.target.closest('.glossary-learn-more')){close(false);return;}
      if(!card.hidden&&!card.contains(event.target))close(false);
    },true);
    document.addEventListener('keydown',event=>{
      const target=event.target.closest?.('[data-term-id],[data-glossary-open]');
      if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopPropagation();open(target,target.dataset.termId||target.dataset.glossaryOpen);return;}
      if(event.key==='Escape'&&!card.hidden){event.preventDefault();close(true);}
    });
    document.addEventListener('mouseover',event=>{if(event.target.closest('.glossary-card'))clearTimeout(hideTimer);});
    window.addEventListener('resize',()=>{if(active&&!tooltip.hidden)position(tooltip,active);if(!card.hidden&&returnFocus)position(card,returnFocus);});
    window.addEventListener('scroll',()=>{if(active&&!tooltip.hidden)position(tooltip,active);if(!card.hidden&&returnFocus)position(card,returnFocus);},{passive:true});
    const content=document.getElementById('content');if(content){decorate(content);new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE)decorate(node.parentElement);else if(node.nodeType===Node.ELEMENT_NODE)decorate(node);}))).observe(content,{childList:true,subtree:true,characterData:true});}
    window.visionlabGlossary.initialized=true;
  }
  window.visionlabGlossary={items,byId,lookup,chip,search:renderSearch,decorate,init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
