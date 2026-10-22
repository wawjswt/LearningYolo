/* 全站术语词典与可访问解释卡。每个词条必须有 title、plainExplanation、metaphor。 */
(()=>{
  const items=[];
  const add=(id,title,plainExplanation,metaphor,aliases,lesson='ai-foundations',extra={})=>{
    items.push({id,title,plainExplanation,metaphor,aliases:[...new Set([title,...(aliases||[])])],learnMore:'#lesson/'+lesson,...extra});
  };

  // 零基础起点
  add('ai','人工智能（Artificial Intelligence，AI）','人工智能是研究和构建智能行为系统的领域，任务包括识别、预测、推理与生成。机器学习是其中一类方法；写出人工规则的系统也可以属于人工智能。','像给计算机一套处理信息、完成任务的方法。',['人工智能','Artificial Intelligence','AI']);
  add('machine-learning','机器学习（Machine Learning，ML）','机器学习利用数据调整模型，使它在某类任务上改善表现。例如从带有猫、狗标签的图片学习分类规则，再判断未见过的图片；训练成绩好还要用独立数据检验。','像看过许多练习题后学会解题方法。',['机器学习','Machine Learning','ML']);
  add('deep-learning','深度学习（Deep Learning）','深度学习是机器学习的一类方法，主要使用由多层计算组成的神经网络，让简单表示逐层组合成更复杂的表示。“深”通常指计算层次多，不表示模型必然理解得更深。','像把简单线索一层层组合成完整判断。',['深度学习','Deep Learning']);
  add('model','模型（model）','模型是从输入得到输出的一套数学计算规则。在本课程的神经网络中，结构规定怎样计算，参数决定具体数值；同一结构换一组参数，就可能给出不同预测。','像一台可以调旋钮的机器：放入数据，得到答案。',['模型','model']);
  add('function','函数（function）','函数是一种对应规则：每个允许的输入都对应一个确定的输出。例如 f(x)=2x+1，输入 3 就输出 7。网络在给定参数和运行条件下也按规则计算，输入、输出都可以是多组数。','像一台果汁机：放入材料，按固定步骤得到饮品。',['函数','function']);
  add('variable','变量（variable）','数学中的变量是表示可变化数值的符号，例如 y=2x 中的 x；程序中的变量名用来引用一个值或对象。模型参数、输入和中间结果都可能由变量表示，但各自职责不同。','像贴了标签的盒子，盒中数字可以换。',['变量','variable']);
  add('covariate','协变量（covariate）','统计和机器学习中的一个完整术语，指模型用来解释、预测或控制结果的输入因素；在监督学习里常与输入特征相对应。它不是“协同变化”的拆词，也不等同于程序里泛指的变量，具体含义要看建模语境。','分析房价时，面积、楼层等信息可以作为协变量，帮助解释房价为什么不同。',['协变量','covariate','covariates'],'ai-foundations',{contextNote:'“协变量”是一个完整概念。它和“变量”有词形上的包含关系，但术语含义不同。'});
  add('input','输入（input）','交给模型处理的数据，例如一张图片或一串测量值。','像题目给出的已知条件。',['输入','input']);
  add('output','输出（output）','模型根据输入算出的结果，可能是分数、类别、坐标或数值。','像做完题后写下的答案。',['输出','output']);
  add('sample','样本（sample）','样本是一次观测或一个数据实例，例如一张图片。监督学习通常给样本配标签；检测图片可配多个框，无标签图片也可以是样本，不能把“样本”限定成“单个物体”。','像练习册里的一道题。',['样本','sample']);
  add('label','标签（label）','标签是任务为样本记录的监督答案。分类可标类别编号，检测还要标每个目标的框，回归可标温度等数值。标签可能有遗漏或错误，不能把它自动当成绝对事实。','像题目旁边由老师给出的标准答案。',['标签','label']);
  add('feature','特征（feature）','特征是描述一个输入或其中某个位置的数值表示。例如房屋面积可作为输入特征；神经网络也会从像素计算出中间特征。单个特征通道不一定对应人能命名的一种物体属性。','像判断水果时参考的颜色、形状和大小。',['特征','feature']);
  add('parameter','参数（parameter）','模型参数是计算规则中的数值，例如权重和偏置，通常由训练调整。把某层冻结后，它仍然含有参数，只是本轮训练不更新；这与设置学习率等训练选项不同。','像机器内部能被训练过程转动的旋钮。',['参数','parameter','parameters']);
  add('hyperparameter','超参数（hyperparameter）','超参数是控制模型配置或训练过程的设置，例如学习率、批次大小和权重衰减强度，通常由人或搜索程序选择。它也可以按调度规则在训练中变化，并非必须全程固定。','像调机器前先选好的档位，不是机器从样本中直接学出的旋钮。',['超参数','hyperparameter']);
  add('training','训练（training）','本课程的监督训练反复执行预测、按标签计算损失、计算梯度和更新参数。它从许多样本中调整规则；不要求每一步损失都下降，也不保证最终能正确处理所有新输入。','像做题、批改、改正，再做下一题。',['训练','training','train']);
  add('inference','推理（inference）','推理是用当前模型参数对输入进行计算并产生预测的过程，通常不更新参数。例如将新照片变成候选框和类别。工程中还常包含预处理与后处理；评估模式和关闭求导要分别设置。','像考试时用已经学会的方法解一道新题。',['推理','inference']);
  add('prediction','预测（prediction）','模型对输入给出的估计答案；它可能正确，也可能错误。','像学生先写下的答案，之后还要对照标准答案。',['预测','prediction']);
  add('ground-truth','真实标注（ground truth）','真实标注是数据提供者记录、用于训练或评估对照的参考答案，例如人工框出的车辆位置。名称虽然含“真实”，标注仍可能错误；模型预测与标注不一致时也需要检查标注本身。','像老师核对时使用的标准答案。',['真实标注','真值','ground truth','ground-truth','GT']);
  add('dataset','数据集（dataset）','按任务整理的一组样本，常包含输入与相应标签。','像一本按规则收集并整理好的练习册。',['数据集','dataset']);
  add('training-set','训练集（training set）','用于计算学习信号并更新模型参数的数据部分。','像平时用来练习的题目。',['训练集','training set']);
  add('validation-set','验证集（validation set）','训练期间用来比较方案和检查效果、但不直接更新参数的数据部分。','像阶段测验，帮助判断目前学得怎样。',['验证集','validation set','val']);
  add('test-set','测试集（test set）','最后用于独立检查模型效果、尽量不参与调参的数据部分。','像留到最后才打开的期末考卷。',['测试集','test set']);
  add('hard-negative','困难负例（hard negative）','真实标签是背景或不含目标，但外观容易被模型误判为目标的训练样本。','像树影乍看像一辆车，却需要认真辨认后才知道只是背景。',['困难负例','hard negative','hard negatives'],'data-quality');
  add('class-imbalance','类别不平衡（class imbalance）','不同类别的样本或标注数量差别较大；少数类别的数据较少，模型可能更难学会识别它们。','像练习册里某一类题很少，学生就较少有机会练习那一类。',['类别不平衡','class imbalance','类别数量失衡'],'data-quality');
  add('batch','批次（batch）','批次是一次共同参与模型计算的一组样本；batch size 是这组样本的数量。例如 10 张图每次取 4 张，保留尾批时会得到 4、4、2 三批。一个批次可能含有许多个目标框。','像一次端到老师面前批改的一摞作业。',['批次','批量','batch']);
  add('epoch','训练轮次（epoch）','epoch 是一个训练轮次：通常表示按当前采样规则遍历一遍训练集。例如 10 个样本、每批 4 个且保留尾批，一轮有 3 个批次；重采样或无限数据流需要另外说明一轮怎样定义。','像把整本练习册从头到尾做完一遍。',['epoch','训练轮次','轮次']);
  add('iteration','迭代步（iteration / step）','iteration 通常指训练循环处理一次批次的迭代；optimizer step 指优化器执行一次参数更新。不做梯度累积时二者常一一对应，累积 4 个小批次后才更新时，4 次迭代只对应 1 次更新。','像每批练习批改后改一次学习方法。',['iteration','迭代','step','训练步']);
  add('dataloader','数据加载器（DataLoader）','DataLoader（数据加载器）负责按采样规则取得样本、组成批次，必要时并行读取。它输出的是模型要处理的数据，通常不负责训练更新；数据集、采样器和加载器是不同职责。','像把练习册按每页几题分好，再一页页送来。',['DataLoader','数据加载器','数据加载器']);

  // 网络输出与损失
  add('probability','概率（probability）','用 0 到 1 之间的数表示某件事发生的可能程度；1 表示确定发生，0 表示不发生。','像天气预报的降雨百分比；它表示可能性，不是原始打分。',['概率','probability']);
  add('probability-distribution','概率分布（probability distribution）','概率分布描述一个随机结果在各种取值上的可能性。本课离散分类中，各类别概率非负且总和为 1；例如猫、狗概率为 0.7、0.3。连续变量需要用概率密度等方式描述，不能逐点照搬相加。','像把 100 枚筹码分给几种互斥结果，分完刚好用尽。',['概率分布','probability distribution']);
  add('logit','logit / logits（模型原始分数）','分类网络把转成概率之前的原始分数称为 logits，数值可以为负、也不要求总和为 1。二分类中 logit(p)=ln[p/(1−p)] 是对数几率；多分类更关注各类分数的相对差异。','像评委先给候选人打原始分，还没有换算成百分比。',['logit','logits','原始分数'],'losses',{formalDefinition:'多类分类中，每个类别通常有一个 logit；同一组 logits 的相对差异决定 Softmax 概率。单个 logit 本身不是概率。'});
  add('sigmoid','Sigmoid（S 形函数）','Sigmoid 按 σ(x)=1/(1+exp(−x)) 将实数映到 0 与 1 之间。x=0 时为 0.5，x=2 时约为 0.881；用于二分类时可解释成正类概率，但概率是否可靠仍需评估。','像把没有上下限的温度读数换成 0% 到 100% 的刻度。',['Sigmoid','sigmoid','逻辑函数'],'losses');
  add('softmax','Softmax（多类归一化函数）','Softmax 对一组分数先取指数，再各自除以指数总和，输出互斥类别的概率分配。例如 [0,0] 变为 [0.5,0.5]；它保留分数排序，不会自动保证概率经过校准。','像先比较几位候选人的原始分，再把总票数按比例分给他们。',['Softmax','softmax'],'losses');
  add('loss','损失（loss）','损失是按明确规则把预测与目标转成的数值，损失函数规定怎样计算这个数。例如预测温度 22、真实 20，平方误差为 4。优化器尝试减小训练目标；损失不等于准确率。','像一次作业的扣分；越不符合目标，通常损失越大。',['损失','损失函数','loss','loss function'],'losses');
  add('cross-entropy','交叉熵（Cross Entropy，CE）','交叉熵用真实分布对模型给出的负对数概率取平均。在单个、独热标签的多分类样本中，它简化为 −ln(正确类别概率)；给正确类 0.8 时损失约 0.223，给 0.1 时约 2.303。','像猜盒中物品：把正确答案的可能性估得越低，扣分越多。',['交叉熵','Cross Entropy','cross entropy','CE','交叉熵损失'],'losses');
  add('bce','二元交叉熵（Binary Cross Entropy，BCE）','二元交叉熵衡量是/否预测的代价，单项为 −[y ln p+(1−y)ln(1−p)]。y 是 0 或 1 标签，p 是正类概率；当 y=0 时应看 1−p，不能始终只算 −ln p。','像判断“下雨/不下雨”：猜错且很肯定时扣分更多。',['二元交叉熵','Binary Cross Entropy','BCE'],'losses');
  add('bce-with-logits','带 logits 的二元交叉熵（BCEWithLogitsLoss）','PyTorch 的损失接口，直接接收原始分数，并以稳定方式组合 Sigmoid 与二元交叉熵。','像把原始打分直接交给评分器，由评分器内部完成换算和扣分。',['BCEWithLogitsLoss','BCEWithLogits','带 logits 的 BCE'],'losses');
  add('bce-loss','二元交叉熵概率接口（BCELoss）','PyTorch 的二元交叉熵接口，输入应是已经算好的 0 到 1 概率。','像已经把分数换成百分比后，再交给扣分表。',['BCELoss'],'losses');
  add('cross-entropy-loss','多类交叉熵接口（CrossEntropyLoss）','PyTorch 常用多分类损失，常见用法是输入原始 logits 与类别编号标签。','像把每位候选人的原始得分和正确人选交给评分器。',['CrossEntropyLoss','nn.CrossEntropyLoss'],'losses');
  add('binary-classification','二分类（binary classification）','在两个互斥答案中作选择，例如“有/没有目标”。','像只有“是”和“否”两个按钮的问题。',['二分类','binary classification'],'losses');
  add('multiclass-classification','多分类（multiclass classification）','在三个或更多互斥类别中选一个答案。','像一道单选题，只能选一个选项。',['多分类','多类别分类','multiclass classification'],'losses');
  add('multilabel-classification','多标签分类（multi-label classification）','一个样本可以同时拥有多个成立标签，每个标签分别判断。','像一道可多选题，猫和户外可以同时为真。',['多标签分类','多标签','multi-label classification'],'losses');
  add('one-hot','独热编码（one-hot encoding）','独热编码用长度等于类别数的向量表示一个互斥类别，只有正确位置为 1。例如猫、狗、兔中选狗为 [0,1,0]。这是答案的表示方法，不表示类别 1 比类别 0 数值更大。','像只把单选题的正确选项灯点亮，其余灯关闭。',['独热','独热编码','one-hot','one hot'],'losses');
  add('multi-hot','多热编码（multi-hot encoding）','多热编码用一组 0/1 分别表示各标签是否成立，可以同时有多个 1。例如“有猫、有狗、室外”可为 [1,0,1]；这些标签不互斥，不能直接套用单标签 Softmax 的解释。','像把多选题所有正确选项的灯同时点亮。',['多热','多热编码','multi-hot'],'losses');
  add('argmax','argmax（最大值位置）','返回一组数字里最大数所在的位置，常用于选出分数最高类别。','像在记分牌上指出分数最高的人，而不是保留所有分数。',['argmax','最大值位置'],'losses');
  add('cross-entropy-example','真实类概率（target-class probability）','模型分配给正确类别的概率；交叉熵主要根据这个数计算单样本惩罚。','像多选一时，模型给标准答案分到的那一份可能性。',['真实类概率','正确类别概率'],'losses');
  add('regression','回归（regression）','预测可连续变化的数量，例如温度、价格或坐标。','像预测下一小时的气温，答案不局限于几个选项。',['回归','regression'],'losses');
  add('mse','均方误差（Mean Squared Error，MSE）','均方误差是各项预测误差的平方再取平均。例如误差为 1 和 3，MSE=(1²+3²)/2=5。平方会加强大误差的影响；PyTorch 默认对全部误差元素求平均，不一定只除以图片张数。','像对偏差按平方收费，错得越远，增长越快。',['MSE','MSELoss','Mean Squared Error','均方误差'],'losses');
  add('mae','平均绝对误差（Mean Absolute Error，MAE）','平均绝对误差是各项预测误差的绝对值再取平均。例如误差 −1 和 3，MAE=(1+3)/2=2。它按偏差大小线性计分，在误差为 0 的位置不可导，框架会采用约定的次梯度。','像按偏离目标的距离收取固定单价。',['MAE','Mean Absolute Error','平均绝对误差'],'losses');
  add('huber','Huber 损失（Huber loss）','Huber 损失用阈值 δ 连接两段：误差绝对值不超过 δ 时为 0.5e²，超过时为 δ(|e|−0.5δ)。e 是预测减真实值；阈值处函数与一阶导数连续，大误差段斜率大小为 δ。','像小偏差按距离平方计费，偏差太大后改成固定单价。',['Huber','HuberLoss','Huber loss'],'losses');
  add('natural-exponential','自然指数函数（exp / e 的幂）','把数值变成 e 的相应次方；Softmax 用它把分数变为正数并放大差距。','像一种会快速增长的刻度尺。',['exp','指数','指数函数','自然指数','exponential','e^']);
  add('floor-function','向下取整函数（floor）','把一个数向更小的整数方向取整；例如 floor(2.7)=2、floor(−2.7)=−3。','像读楼层时只记当前位置已经完整经过的整数层。',['floor','floor function','向下取整','向下取整函数','下取整']);
  add('e-constant','自然常数 e','约等于 2.718 的固定数学常数，自然指数与自然对数都以它为基础。','像一把固定单位尺上的常数刻度。',['自然常数','数学常数 e']);
  add('logarithm','对数（logarithm）','以 b 为底的对数 log_b(x) 回答“b 的多少次方等于 x”。例如 2³=8，所以 log₂8=3；2⁻¹=0.5，所以 log₂0.5=−1。实数对数要求 x>0，底数 b>0 且 b≠1。','像反过来问：底数要重复相乘几次，才到目标数字？',['对数','logarithm','log']);
  add('natural-log','自然对数（natural logarithm，ln）','自然对数 ln(x) 是以 e≈2.718 为底的对数。例如 ln(1)=0，ln(e)=1；当概率 p 很小时，−ln(p) 很大。p=0 时实数对数没有有限值，损失的稳定实现需要避免先把概率舍入为 0。','像把概率的稀少程度换成一把递增的惊讶刻度。',['自然对数','ln','natural logarithm'],'losses');
  add('summation','求和符号（Σ）','表示把指定范围内的数逐个加起来。','像把清单上的每项金额逐一相加。',['求和','求和符号','Σ','sum']);
  add('mean','平均值（mean）','把若干数相加后除以参与计算的数量。','像把一盒糖平均分给所有人。',['均值','平均值','mean']);
  add('variance','方差（variance）','方差用“偏离平均值的量的平方”的平均来衡量分散程度。例如 [1,3] 均值为 2，按数量 2 作分母时方差为 (1+1)/2=1；样本无偏估计会用不同分母，要看公式约定。','像看同学成绩离班级平均分散得多不多。',['方差','variance']);
  add('standard-deviation','标准差（standard deviation）','标准差是方差的平方根，用原数据的单位描述波动。例如方差为 4 平方米，标准差为 2 米；它不是最大值与最小值的差，也不是每个数都偏离均值这么多。','像把“偏离得有多散”换回原数据熟悉的单位。',['标准差','standard deviation','std']);
  add('derivative','导数（derivative）','导数是函数在某一点的局部变化率。若 f(x)=x²，在 x=3 附近导数为 6，输入增加很小的量 Δx 时，输出约增加 6Δx；它是局部近似，不能当成任意大变化都精确成立的公式。','像当前位置的坡度计，告诉你向前走一点会升多高。',['导数','derivative']);
  add('partial-derivative','偏导数（partial derivative）','偏导数用于有多个输入的函数：暂时固定其他输入，只改变一个输入，计算局部变化率。例如 L(w,b) 的 ∂L/∂w 表示 b 不变时，w 的微小变化怎样影响 L。','像只转动一个旋钮，观察仪表读数改变多少。',['偏导','偏导数','partial derivative','∂','∂L/∂w','∂L/∂θ']);
  add('gradient','梯度（gradient）','梯度是把各个参数的偏导数按顺序组成的向量。在通常欧氏坐标下，它指向函数局部上升最快的方向；梯度 [2,−1] 表示两个参数分别微增时，损失的局部变化率为 2、−1。','像站在山坡上指向最陡上坡方向的箭头。',['梯度','gradient','∇','∇L']);
  add('norm','范数（norm）','范数是衡量向量整体大小的数，满足非负、缩放和三角不等式等规则。例如 [3,4] 的 L2 范数是 √(3²+4²)=5，L1 范数为 |3|+|4|=7；使用哪种范数必须写清楚。','像把多根箭头的分量合成一个总长度。',['范数','norm','L2 范数','‖∇L‖']);
  add('matrix-multiplication','矩阵乘法（matrix multiplication）','用左边每一行和右边每一列对应相乘后求和，得到新表格。','像每位学生的成绩乘上各科权重，再分别汇总成总分。',['矩阵乘法','matrix multiplication','矩阵相乘','matmul'],'tensor');
  add('broadcasting','广播（broadcasting）','运算时把长度为 1 或缺失的轴按规则重复扩展，以便形状兼容。','像把一条统一规则复制到每一行，但要先确认行列能对齐。',['广播','broadcasting','广播机制','broadcast'],'tensor');
  add('gradient-descent','梯度下降（gradient descent）','沿梯度相反方向小步调整参数，尝试降低损失。','像沿着坡度最陡的下坡方向，一步步走向低处。',['梯度下降','gradient descent','GD']);
  add('backpropagation','反向传播（backpropagation）','反向传播是沿计算图反向应用链式法则、求出损失对中间值及参数梯度的算法。有分支时要把各路径贡献相加；backward() 通常只算并累加梯度，参数更新由优化器另行执行。','像从总账倒查每个环节各自贡献了多少误差。',['反向传播','backpropagation','backprop']);
  add('chain-rule','链式法则（chain rule）','当一个结果由多步计算得到时，把每一步的变化影响相乘，就能求出最终结果对最初输入的影响。','像沿着接力路线追踪变化：每一段传递多少影响，最后把各段影响乘起来。',['链式法则','chain rule'],'gradient');
  add('intermediate-variable','中间变量（intermediate variable）','在多步计算中暂时保存某一步结果的变量，便于继续计算或追踪影响。','像做长算式时先把一段答案写在草稿纸上，再带入下一步。',['中间变量','中间结果','intermediate variable'],'gradient');
  add('computation-graph','计算图（computation graph）','用节点表示数值或运算、用箭头表示数据流向的计算步骤图。','像把食谱画成流程图：原料经过几道步骤，最后变成成品。',['计算图','computation graph'],'gradient');
  add('optimizer','优化器（optimizer）','优化器读取梯度和自身保存的状态，按更新规则修改可训练参数。例如普通 SGD 用“参数减去学习率乘梯度”。它通常不自己计算损失，也不代替反向传播求梯度。','像参考方向箭头和每次改动大小，决定下一步怎么走。',['优化器','optimizer']);
  add('sgd','随机梯度下降（Stochastic Gradient Descent，SGD）','使用一个样本或一批样本估计梯度并更新参数的基本方法。','像每次根据一小批练习的表现调整学习方向。',['SGD','Stochastic Gradient Descent','随机梯度下降'],'optimizer');
  add('momentum','动量（momentum）','优化器中的动量会保留并递推近期梯度的历史信息，让本次更新同时参考当前梯度和过去方向。连续同向的梯度可积累，来回变化可部分抵消；它不是对参数无条件加速。','像推购物车时保留一点惯性，减少左右来回晃动。',['动量','momentum'],'optimizer');
  add('adam','Adam 优化器（Adaptive Moment Estimation）','结合梯度的平滑平均和平方大小的平滑平均来调整每个参数的更新。','像既参考最近的行进方向，也看每条路近期起伏有多大。',['Adam','Adaptive Moment Estimation'],'optimizer');
  add('adam-first-moment','Adam 的一阶矩估计 m','把当前梯度和过去记录平滑合并，近似表示近期的平均方向；它不是单个梯度。','像每次记录风向时都留一半旧记录、加入一半新观察，方向变化不会立刻被一次阵风带跑。',['一阶矩','一阶矩估计','一阶矩 m','m_t','mₜ'],'optimizer');
  add('adam-second-moment','Adam 的二阶原始矩估计 v','把梯度逐项平方后再平滑平均，用来表示近期梯度大小；它没有减去平均值，因此不等于统计方差。','像记录每一步起伏的强弱但不记方向，之后可知道最近的变化幅度。',['二阶矩','二阶原始矩','二阶矩估计','v_t','vₜ'],'optimizer');
  add('adam-bias-correction','Adam 的偏差修正（bias correction）','Adam 的移动记录从 0 开始，早期数值会被压低；偏差修正按当前步数把这种初始影响校正回来。','像空白记录本刚开始只有少量观测，先按已经记下的次数校准平均值。',['偏差修正','偏差校正','bias correction'],'optimizer');
  add('ema-decay-coefficient','指数平均的衰减系数 β','β 决定保留多少旧记录，1−β 决定加入多少当前数值；β 越大，历史影响通常保留得越久。','像调节记忆旋钮：数值越大越相信旧记录，越小越快跟随新变化。',['衰减系数 β','指数衰减系数','β₁','β₂'],'optimizer',{contextNote:'Adam 通常用 β₁ 控制梯度平均 m，用 β₂ 控制平方梯度平均 v；本课为方便手算暂令两者相等。'});
  add('adam-initial-state','Adam 移动记录的初始值（m₀ / v₀）','m₀ 与 v₀ 表示训练开始前的一阶和二阶移动记录，常从 0 开始；后续每一步会逐渐把新梯度信息写入记录。','像一本刚翻开的空记录本，第一页先填 0，再按规则加入每次新观察。',['m₀','v₀','m0','v0','Adam 初始状态'],'optimizer');
  add('learning-rate','学习率（learning rate）','学习率是参数更新规则中的步长系数。普通 SGD 中参数 2、梯度 3、学习率 0.1，会更新为 2−0.1×3=1.7；实际位移还取决于梯度和优化器，不等于学习率本身。','像每一步跨多远：过大容易越过目标，过小会走得很慢。',['学习率','learning rate','lr'],'optimizer');
  add('weight-decay','权重衰减（weight decay）','权重衰减在更新中让参数向 0 适度收缩，例如乘上 1−学习率×衰减系数。它可限制参数大小，但不保证一定提高泛化；在 AdamW 中与梯度统计分开处理，与给 Adam 加 L2 惩罚有区别。','像给旋钮的极端偏移加上温和的回拉力。',['权重衰减','weight decay','weight_decay'],'optimizer');
  add('regularization','正则化（regularization）','正则化是为了改善对新数据的表现，约束或调整模型学习过程的一类方法，例如参数惩罚、Dropout 和早停。它会改变训练目标或过程，需要用独立验证结果判断是否有效。','像在背答案之外，也要求学生学会通用方法。',['正则化','regularization'],'regularization');
  add('overfitting','过拟合（overfitting）','过拟合指模型过度适应训练数据的细节或噪声，以致新数据上的表现不佳。典型线索是训练损失继续下降而验证损失上升；单凭两条曲线不能排除数据分布变化等其他原因。','像把练习题答案背下来，换一道题就不会做。',['过拟合','overfitting'],'regularization');
  add('underfitting','欠拟合（underfitting）','欠拟合指当前模型和训练过程尚未学到任务中的主要规律，常表现为训练、验证结果都较差。原因可能是模型表达能力不足、训练不充分或输入有问题，不能一律归咎于层数少。','像还没掌握基础方法，熟题也做不对。',['欠拟合','underfitting'],'regularization');
  add('dropout','随机失活（Dropout）','Dropout 在训练时随机将一部分激活输出置零。PyTorch 常用实现把保留项除以 1−p，以保持期望大小；评估模式下通常直接使用全部输出。它没有永久删除神经元或模型参数。','像练习时轮流遮住一部分提示，避免只记住某个提示。',['Dropout','dropout','随机失活'],'regularization');
  add('early-stopping','早停（early stopping）','如果验证集上的目标指标连续多次没有改善，就结束训练；通常保留验证表现最佳时的模型状态。','像每次练习后都做小测，连续几次没有进步就先停下，并保存成绩最好那次的解题稿。',['早停','提前停止','early stopping'],'regularization',{contextNote:'早停观察验证集，不应反复用最终测试集来决定停止轮次。'});
  add('patience','耐心值（patience）','早停允许验证指标连续多少次未改善；通常按验证检查次数计数，而不是固定等同于 epoch 数。','像规定最多允许连续几次小测没有新纪录，再决定暂停练习。',['patience','早停耐心值'],'regularization');
  add('batch-normalization','批量归一化（Batch Normalization，BatchNorm / BN）','批量归一化是一种调整中间特征数值的层。以 BatchNorm2d 为例，每个通道在 N、H、W 位置上统计均值和方差，先标准化，再用可学习的缩放与平移调整；默认评估时改用运行统计量。','像先把每组测量值换成相近尺度，再允许模型重新调整。',['BatchNorm','BatchNorm1d','BatchNorm2d','Batch Normalization','BN','批量归一化'],'network');
  add('internal-covariate-shift','内部协变量偏移（internal covariate shift）','BatchNorm 原始论文用这个术语描述训练过程中，前面层参数不断更新，导致某一层收到的输入分布也随之变化。它是论文提出的动机解释之一，不应简化成 BatchNorm 唯一且已定论的作用机制。','流水线前一站调整了处理方式，下一站收到的材料规格也跟着变，后续步骤需要继续适应。',['内部协变量偏移','协变量偏移','internal covariate shift'],'network',{contextNote:'经典统计里的“协变量偏移”通常指输入分布 P(X) 改变而 P(Y|X) 保持不变；BatchNorm 论文中的 internal covariate shift 是关于神经网络层输入分布随训练变化的说法，两者名称相关，但不能不加区分地当成同一个定义。'});

  // 数字、张量与图像
  add('scalar','标量（scalar）','只有一个数值、没有轴的数据。','像一个温度读数。',['标量','scalar'],'tensor');
  add('vector','向量（vector）','按顺序排列的一串数值，常用来表示多个特征或坐标。','像一排有编号的小格子，每格放一个数。',['向量','vector'],'tensor');
  add('matrix','矩阵（matrix）','按行和列排成的数值表。','像一张有行列编号的成绩表。',['矩阵','matrix'],'tensor');
  add('tensor','张量（tensor）','在本课程与 PyTorch 中，张量是带形状、数据类型和设备信息的多维数组。一个数也可做零维张量；形状 (2,3,4) 表示 3 条轴、24 个元素，不要求把它想成现实中的立体物体。','像一叠表格，表格里再按规则装着数字。',['张量','tensor'],'tensor');
  add('axis','轴（axis）','轴是张量的一层索引方向。形状 (2,3,4) 有 3 条轴，编号为 0、1、2；轴 1 长度是 3。“轴的编号”“轴的长度”“轴的总数”是不同的量。','像表格的行方向或列方向。',['轴','axis'],'tensor');
  add('shape','形状（shape）','shape 按轴顺序列出每条轴的长度。例如 (2,3,4) 表示外层 2 组、每组 3 行、每行 4 个数，共 24 个元素；形状本身不说明这些轴分别代表批次、通道还是时间。','像说明一个盒子里有几层、每层几行、每行几格。',['shape','形状'],'tensor');
  add('dimension','维度（dimension）','维度需要结合语境读：张量 ndim 是轴的数量，shape 中某一项是该轴长度，函数参数 dim 常指定轴编号。例如 shape=(2,3,4) 时 ndim=3，dim=1 指长度为 3 的第二条轴。','像货架有几种排列方向；具体每格数量另看尺寸。',['维度','dimension','dim'],'tensor');
  add('index','索引（index）','用位置编号找到数组或张量中的元素；Python 通常从 0 开始编号。','像图书馆书架上的位置号。',['索引','index'],'tensor');
  add('stride','张量内存步幅（tensor stride）','张量内存步幅记录沿某条轴把索引增加 1 时，存储位置跨过多少个元素。连续 2×3 矩阵常有 stride=(3,1)：下移一行跨 3 个元素，右移一列跨 1 个；它与卷积窗口移动步幅不同。','像在仓库货架上从一个逻辑位置走到下一个位置，需要跨过几格。',['tensor stride','memory stride','storage stride','张量内存步幅','张量存储步幅','内存步幅'],'tensor',{contextNote:'这里说的是内存地址怎样跳格，不是卷积或池化窗口在图像上移动的距离。'});
  add('storage','底层存储（storage）','实际保存张量元素的一段内存区域。','像仓库里实际摆放货物的货架。',['storage','底层存储'],'tensor');
  add('offset','存储偏移（storage offset）','张量的逻辑第一个元素从底层存储的哪个位置开始读取。','像从货架第几个格子开始清点。',['offset','storage_offset','存储偏移'],'tensor');
  add('contiguous','连续布局（contiguous）','连续性描述张量的形状、步幅与指定内存格式是否相符。默认连续 2×3 矩阵步幅常为 (3,1)；转置后可共享同一存储但不再默认连续。PyTorch 还支持 channels-last 等其他内存格式。','像书页按阅读顺序连续摆放，翻页时不必跳来跳去。',['contiguous','连续张量','连续布局'],'tensor');
  add('dot-product','点积（dot product）','把两个等长向量相同位置的数字相乘，再把结果相加。','像两串同位置配对的数量相乘后总计。',['点积','内积','dot product','torch.dot'],'tensor');
  add('cross-product','叉积（cross product）','叉积是三维向量运算，结果方向按右手规则，长度等于两向量长度之积再乘夹角正弦。例如 x、y 方向单位向量叉乘得到 z 方向单位向量；平行向量叉积为零向量，此时没有唯一方向。','像用两根方向箭头确定一根垂直于它们的箭头。',['叉积','cross product'],'tensor');
  add('pixel','像素（pixel）','像素是数字图像网格中的一个位置及其记录的数值。灰度图每个位置常存一个亮度值，RGB 图常存红、绿、蓝三个值；像素不是神经网络中的一个神经元。','像马赛克中的一个小色块。',['像素','pixel'],'image');
  add('channel','通道（channel）','通道是同一空间网格上的一组数值。RGB 图有红、绿、蓝 3 个颜色通道；卷积后可得到 64 个特征通道，它们是学习出的表示，不是 64 种原始颜色。','像三张透明彩色胶片叠起来组成一幅图。',['通道','channel'],'image');
  add('rgb','RGB（Red, Green, Blue；红、绿、蓝）','按红、绿、蓝三个颜色强度表示彩色像素的常见顺序。','像用红、绿、蓝三盏灯调出一个颜色。',['RGB','Red, Green, Blue'],'image');
  add('bgr','BGR（Blue, Green, Red；蓝、绿、红）','把蓝、绿、红按此顺序存放的颜色通道约定，OpenCV 读图常见此顺序。','像相同三盏灯换了排列顺序；顺序错会让颜色看起来不对。',['BGR','Blue, Green, Red'],'image');
  add('hwc','HWC 图像布局（Height, Width, Channels）','先按图像高度、再按宽度、最后按通道排列数值的布局。','像先按行列摆好画布，再在每个像素位置叠颜色。',['HWC'],'image');
  add('chw','CHW 图像布局（Channels, Height, Width）','先放通道，再放高度和宽度的布局，常见于 PyTorch 图像张量。','像先按颜色分三张图，再分别记录每张图的位置。',['CHW'],'image');
  add('nchw','NCHW 图像批次布局（Batch, Channels, Height, Width）','依次用批次、通道、高度、宽度表示一组图片的常见张量布局。','像一叠照片；每张照片又按颜色、行、列排数字。',['NCHW'],'image');
  add('normalization','归一化（normalization）','归一化是按指定规则调整数值尺度的统称，必须说明具体规则。例如像素除以 255、向量除以自身长度、Softmax 使类别总和为 1，处理对象和目的各不相同；不能默认都得到 0～1。','像把不同单位的刻度换成同一把量尺。',['归一化','normalization'],'image');
  add('standardization','标准化（standardization）','标准化常指减均值再除标准差，例如 (x−μ)/σ。对 [1,3] 用均值 2、标准差 1 处理后得 [−1,1]；它会改变中心与尺度，但不会自动把任意分布变成正态分布。','像先减去班级平均分，再用常见分差作为单位。',['标准化','standardization'],'image');
  add('uint8','无符号 8 位整数（uint8）','只能保存 0 到 255 的整数，常用于保存图像像素。','像只有 256 格刻度的计数器。',['uint8'],'tensor');
  add('float32','单精度浮点（FP32 / float32）','float32（FP32）用 32 位浮点格式近似表示数值，常有约 7 位十进制有效数字。它能表示的大小有限，运算可能舍入、溢出或下溢；“用小数存储”不表示任何小数都精确。','像较细的刻度尺，但需要较多格子保存读数。',['float32','FP32','float32 dtype','single precision'],'tensor');
  add('dtype','数据类型（dtype）','dtype 是数值的存储类型，决定整数或浮点表示、精度和范围。例如 uint8 只能存 0～255 的整数，float32 可存近似小数；转类型不会自动把像素除以 255。','像标明盒子里放的是整数积木还是小数液体。',['dtype','数据类型'],'tensor');
  add('device','计算设备（device）','张量所在或运算发生的位置，例如 CPU 或 GPU。','像选择在哪张工作台上处理材料。',['device','计算设备'],'tensor');
  add('cpu','中央处理器（Central Processing Unit，CPU）','通用计算部件，擅长执行多种程序任务。','像多技能的总控工作台。',['CPU','Central Processing Unit']);
  add('virtual-environment','Python 虚拟环境（virtual environment）','为一个项目隔离 Python 和软件包版本的独立运行目录。','像给每门实验课准备各自的工具箱，避免不同项目互相换错工具。',['虚拟环境','Python 虚拟环境','virtual environment','venv'],'train-yolo');
  add('gpu','图形处理器（Graphics Processing Unit，GPU）','可并行处理大量相似数字运算的计算设备，常用于深度学习。','像许多工人同时做同一种计算。',['GPU','Graphics Processing Unit']);
  add('vram','显存（video memory / VRAM）','GPU 上用于暂存模型、图像和中间结果的内存。','像放在 GPU 工作台旁、可快速取用的桌面空间。',['显存','VRAM','video memory'],'training');
  add('fp16','半精度浮点（FP16）','一种 16 位浮点数格式，通常能降低内存和计算开销，但可表示范围较小。','像刻度更少的轻量尺，省空间但极端数值更容易超范围。',['FP16','F16','float16'],'training');
  add('amp','自动混合精度（Automatic Mixed Precision，AMP）','在合适的运算中混用不同浮点精度，以节省资源并维持训练稳定性。','像大多数测量用轻便尺，关键测量再换更精细的尺。',['AMP','Automatic Mixed Precision','自动混合精度'],'training');

  // 网络与视觉模型
  add('fully-connected','全连接层 / Linear（fully connected layer）','全连接层让每个输出都对所有输入做一组加权求和。输入 3 个数、输出 2 个数时，通常有 2×3 个权重，若含偏置再加 2 个；它可以处理图像展平后的数值，也可处理其他特征。','像每个输入线索都能给每个答案候选贡献分数。',['全连接','全连接层','Linear','nn.Linear','fully connected'],'network');
  add('weight','权重（weight）','乘在输入数前面的可训练数字，决定这条输入对输出的影响。','像混合配方里每种材料所占的比例。',['权重','weight'],'network');
  add('bias','偏置（bias）','加在加权求和结果上的可训练常数，可以整体移动输出。','像给整条刻度线加一个统一的起始偏移。',['偏置','bias'],'network');
  add('affine','仿射变换（affine transformation）','仿射变换是线性变换后加平移，例如 z=wx+b。严格线性变换要求把零输入映到零；b≠0 时不满足这个条件。深度学习常把含偏置的仿射层也称为线性层，需要区分数学与框架名称。','像先按比例缩放，再整体平移。',['仿射','仿射变换','affine'],'network');
  add('activation','激活函数（activation function）','激活函数作用于神经元的数值输出。隐藏层通常使用 ReLU、SiLU 等非线性函数，使多层组合能表达更复杂的关系；例如 ReLU 把 −2 变 0、把 3 保留为 3，激活结果不一定是概率。','像每个路口的一道可调门，决定哪些信号通过、怎样变化。',['激活','激活函数','activation function','激活值'],'network');
  add('relu','ReLU（Rectified Linear Unit，修正线性单元）','负数变成 0，正数保持不变的激活函数。','像只让正向信号通过的单向门。',['ReLU','Rectified Linear Unit'],'network');
  add('silu','SiLU（Sigmoid Linear Unit）','把输入乘以它的 Sigmoid 值，让较大正数通过、负数被平滑压小。','像一扇开合平滑、不会突然啪地关上的门。',['SiLU','Swish'],'network');
  add('gelu','GELU（Gaussian Error Linear Unit）','按输入大小平滑调整信号通过程度的激活函数。','像根据输入大小柔和调节水流的阀门。',['GELU','Gaussian Error Linear Unit'],'network');
  add('neuron','神经元（neuron）','网络中的一个计算单元，常把输入加权求和、加偏置并经过激活。','像一个小评委，把几条线索加权后给出自己的分数。',['神经元','neuron'],'network');
  add('linear-layer','线性层（linear layer）','PyTorch 的 Linear 层执行 y=xWᵀ+b，将最后一条轴的输入特征组合成输出特征。默认含偏置，因此严格说是仿射变换；bias=False 时才只保留线性部分。','像一组并排的小评委，每人按自己的权重打分。',['线性层','linear layer'],'network');
  add('convolution','卷积（convolution）','神经网络中的卷积在每个局部窗口做对应位置相乘、求和并加偏置，多个位置共享权重。PyTorch Conv2d 实际采用不翻转核的互相关约定；卷积核通常由训练学习，不必固定成手工边缘滤镜。','像拿同一块模板在整张图片上逐处比对。',['卷积','convolution'],'cnn');
  add('kernel','卷积核 / 滤波器（kernel / filter）','卷积核是一组可学习的权重。普通卷积中，一个输出通道的核还跨越所有输入通道，例如 3 输入通道的 3×3 核有 27 个权重；不是每个输出仅看一张二维权重表。','像一块可学习的小印章，扫过图像寻找相似图案。',['卷积核','滤波器','kernel','filter'],'cnn');
  add('feature-map','特征图（feature map）','特征图是网络某层输出的空间数值表示，保留各位置的特征响应。一组特征图可写为 [C,H,W]；某通道的高值表示该层对输入有较强响应，不保证它只代表一类物体或一种人工命名特征。','像一张热度图，亮处代表某种线索更明显。',['特征图','feature map'],'cnn');
  add('conv-stride','卷积步幅（convolution stride）','卷积步幅是相邻卷积窗口起点移动的输入格数。步幅 1 表示逐格移动，步幅 2 表示每次跨 2 格；它参与决定输出高宽，与张量元素在内存里的存储步幅是两回事。','像用模板找图案时，每次向前跨一格还是跨好几格。',['stride=','卷积步幅','convolution stride'],'cnn');
  add('spatial-stride','空间步幅（spatial stride）','相邻卷积/池化窗口或输出特征网格位置之间相隔的格数；跨多层时，总采样间隔由各层步幅共同决定。','像沿图像网格每隔几格观察一次；层层缩小后，最终网格的每一格会对应原图上更大的间隔。',['stride','window stride','步幅','窗口步幅','空间步幅','卷积窗口步幅','池化步幅','网格步幅','采样步长','特征步幅','feature stride','total stride','sampling stride'],'cnn');
  add('padding','填充（padding）','在输入边缘补上数值，控制卷积窗口能访问哪些边界位置及输出尺寸。','像在画纸外侧补空白边，方便模板扫到边缘。',['padding','填充'],'cnn');
  add('dilation','空洞率（dilation）','膨胀率规定卷积核相邻采样点在输入上的间隔：d=1 连续采样，d=2 每两格取一个点，中间空 1 格。3×3 核在 d=2 时有效覆盖 5×5，但权重仍只有原来的 9 个（单通道）。','像用带间隔的梳子，一次触到更宽的范围。',['dilation','空洞率'],'cnn');
  add('pooling','池化（pooling）','池化把每个局部窗口汇总成一个数，例如最大池化对 [1,4,2,3] 输出 4，平均池化输出 2.5。它通常不含可学习权重；输出尺寸取决于窗口、步幅和填充，不能只看窗口大小。','像把一小块区域用最高分或平均分代表。',['池化','pooling','MaxPool','MaxPool2d','AvgPool','AvgPool2d'],'pooling');
  add('global-average-pooling','全局平均池化（Global Average Pooling）','全局平均池化分别对每个通道的所有空间位置取平均。例如输入 [N,16,4,4] 可得到 [N,16,1,1]，每个通道汇总成一个数；它没有把不同通道互相求平均。','像把每张不同大小的线索地图各算一个平均强度，留下每张图的一份总览。',['全局平均池化','Global Average Pooling','GAP'],'pooling');
  add('receptive-field','感受野（receptive field）','某个输出位置的理论感受野，是沿计算连接向前追溯时可能影响它的输入区域。它描述依赖范围，不是该输出的空间尺寸；区域内各输入的实际影响强弱还可能不同。','像观察员从所在位置能看见的那片区域。',['感受野','receptive field'],'cnn');
  add('downsampling','下采样（downsampling）','减少特征图的空间位置数量，降低后续计算量。','像把大图缩小成较少格子的预览图。',['下采样','downsampling'],'cnn');
  add('depthwise-convolution','逐通道卷积（depthwise convolution）','逐通道卷积让各输入通道分组独立卷积。PyTorch 中通常 groups=Cin、Cout 为 Cin 的整数倍；它自身不跨输入通道混合信息，常接 1×1 卷积完成通道融合。','像每张颜色胶片各自先做一次局部检查。',['depthwise convolution','逐通道卷积'],'cnn');

  // 三维旋转
  add('euler-angles','欧拉角（Euler angles）','用依次绕三个指定轴转动的角度表示三维朝向；必须说明旋转顺序和坐标约定。','像先转方向盘、再抬头、再侧倾；顺序一变，最终朝向通常也变。',['欧拉角','Euler angles','Euler angle'],'quaternion');
  add('quaternion','四元数（quaternion）','四元数是包含一个标量分量和三个向量分量的数系。表示三维旋转时使用单位四元数，例如绕 z 轴转 90°可写成 (cos45°,0,0,sin45°)；任意四个数并不自动表示纯旋转。','像用一组可组合的四个旋钮记录三维朝向。',['四元数','quaternion'],'quaternion');
  add('hamilton-product','Hamilton 四元数乘积（Hamilton product）','按规定的标量与向量运算规则组合两个四元数；旋转的组合顺序会影响结果。','像按固定规则把两张转动指令合成一张新指令，先后次序会改变最终方向。',['Hamilton product','Hamilton 乘积','四元数乘法'],'quaternion');
  add('quaternion-conjugate','四元数共轭（quaternion conjugate）','保留四元数的第一个分量，并把后三个方向分量改成相反数；单位四元数的共轭可用于撤销旋转。','像保留转动幅度信息、把方向指令反过来。',['四元数共轭','共轭四元数','quaternion conjugate','q*'],'quaternion');
  add('axis-angle','轴角表示（axis-angle）','用一条旋转轴和绕该轴转过的角度描述一次三维旋转。','像指明绕哪根箭头旋转、转几度。',['轴角','轴角表示','axis-angle'],'quaternion');
  add('rotation-matrix','旋转矩阵（rotation matrix）','三维旋转矩阵是满足 RᵀR=I、det(R)=1 的 3×3 矩阵，用矩阵乘法旋转向量并保持长度和夹角。一般 3×3 矩阵也可能缩放或剪切，不能都称为旋转矩阵。','像一张方向换算表，把旧坐标换成旋转后的坐标。',['旋转矩阵','rotation matrix'],'quaternion');
  add('radian','弧度（radian）','以圆弧长度相对半径表示角度的单位；一整圈是 2π 弧度。','像用圆的半径当作量角的尺。',['弧度','radian','radians'],'quaternion');
  add('degree','角度（degree）','把一整圈分成 360 份的角度单位。','像把圆盘均分成 360 格来量转动。',['角度','角度单位','degrees'],'quaternion');
  add('gimbal-lock','万向节锁（gimbal lock）','万向节锁是某些欧拉角姿态下的坐标奇异性：两个旋转轴方向重合，三个角对姿态的独立控制退化。物体在三维空间仍有 3 个旋转自由度，受限的是这套角度表示。','像三个套在一起的转环中，两个环转到同一方向后失去一个独立转动方向。',['万向节锁','gimbal lock'],'quaternion');
  add('slerp','球面线性插值（Spherical Linear Interpolation，SLERP）','SLERP 是 Spherical Linear Interpolation（球面线性插值），用于在单位四元数间沿球面弧插值。选择 q 与 −q 的等价表示可取较短旋转路径；它不等同于把三个欧拉角分别平均。','像沿球面最短路线从一个方向滑到另一个方向。',['SLERP','Spherical Linear Interpolation'],'quaternion');

  // 目标检测与 YOLOv5
  add('object-detection','目标检测（object detection）','找出图像里有哪些物体、每个物体在哪里，以及可能属于什么类别。','像在照片上圈出每辆车，再给每个框贴上类别名。',['目标检测','object detection'],'tasks');
  add('classification','分类（classification）','从规定的类别中判断一个样本属于哪一类。','像给整张照片选一个最合适的标签。',['分类','classification'],'tasks');
  add('segmentation','分割（segmentation）','为图像中的像素逐处标出类别或对象归属。','像沿着物体轮廓把照片涂成不同区域。',['分割','segmentation'],'tasks');
  add('backbone','骨干网络（backbone）','Backbone（骨干网络）从输入逐层计算特征，供后续任务使用。例如图像经过卷积块变成多组不同分辨率特征图；骨干的输出通常仍是特征，尚未直接成为最终目标框。','像先从照片里找边缘、纹理，再组合成物体线索的观察员。',['Backbone','backbone','骨干网络'],'architecture');
  add('neck','特征融合层（neck）','Neck（特征融合部分）把不同层、不同分辨率的特征整理并组合，连接骨干与检测头。它可通过上采样、拼接和卷积传递语义及位置线索；是否存在独立 Neck 取决于网络设计。','像把局部细节和整体场景线索放到同一张讨论桌上。',['Neck','neck','特征融合层'],'architecture');
  add('head','检测头（head / detection head）','Head（任务头）把特征映成任务所需的数值。分类头产生类别分数，YOLOv5 检测头产生框、物体性和类别相关预测；这些原始输出还可能需要解码、筛选和坐标还原。','像根据前面整理的线索，写出“是什么、在哪里”的答题员。',['Head','检测头','detection head'],'architecture');
  add('fpn','特征金字塔网络（Feature Pyramid Network，FPN）','FPN 是 Feature Pyramid Network（特征金字塔网络）。它用自顶向下路径和横向连接，把深层信息送到分辨率较高的特征层；高低分辨率指空间网格大小，不是图像文件质量。','像把全景地图与局部放大图逐层对照。',['FPN','Feature Pyramid Network'],'architecture');
  add('pan','路径聚合网络（Path Aggregation Network，PAN）','本课 PAN 指检测网络中的路径聚合思路，在自顶向下融合之后增加自底向上的传递，使较高分辨率的位置线索也能传到较深层。应结合具体网络连线读，不能只按模块名称推断结构。','像在楼层之间增加双向楼梯，让细节与整体线索更容易互通。',['PAN','Path Aggregation Network'],'architecture');
  add('csp','跨阶段局部连接（Cross Stage Partial，CSP）','把部分特征走过一段计算、另一部分走较短路径，再合并的结构思路。','像一组人分成两队，一队深入讨论，另一队保留原始线索，最后合并意见。',['CSP','Cross Stage Partial'],'architecture');
  add('c3','YOLOv5 C3 模块','C3 是 YOLOv5 中含 3 个主要卷积组件的 CSP 风格模块。输入经两路变换，一路经过若干 Bottleneck，再沿通道拼接并融合；3 不是重复单元数量，内部 Bottleneck 的重复次数另有配置。','像把线索分成两队，一队做更细加工，最后汇总。',['C3','C3 模块'],'architecture');
  add('bottleneck','瓶颈模块（bottleneck block）','Bottleneck（瓶颈块）用中间通道宽度组织一段卷积计算，名称来自压缩通道的常见设计。YOLOv5 中是否真的变窄由扩展系数 e 决定；e=1 的内部块不一定压缩通道，残差也须满足条件才启用。','像先把宽材料收进窄管处理，再展开成原来的宽度。',['Bottleneck','瓶颈模块'],'architecture');
  add('sppf','快速空间金字塔池化（Spatial Pyramid Pooling–Fast，SPPF）','SPPF 是 Spatial Pyramid Pooling - Fast（快速空间金字塔池化）。YOLOv5 常以步幅 1 的 5×5 最大池化连续计算三次，再拼接多种覆盖范围的特征；池化阶段保留高宽，不是连续把图片缩小三次。','像先看一个小邻域，再看逐渐扩大的区域，最后把线索拼起来。',['SPPF','Spatial Pyramid Pooling','空间金字塔池化'],'architecture');
  add('residual-connection','残差连接 / 捷径连接（residual / shortcut connection）','残差连接把输入经捷径送到后面，与主分支输出逐元素相加，典型形式是 y=x+F(x)。相加前形状需要对齐；它提供直接的信息与梯度路径，不保证所有深层网络问题都自动消失。','像在复杂路线旁保留一条直路，最终把两条路的结果相加。',['残差连接','捷径连接','shortcut','skip connection','residual connection'],'cnn');
  add('concatenation','拼接（concatenation / Concat）','拼接沿指定轴把张量接起来。例如两个 [N,16,H,W] 张量沿通道轴拼接得到 [N,32,H,W]；逐元素相加仍为 [N,16,H,W]。非拼接轴的形状须相容，二者不能互换。','像把两列不同信息并排贴到一张表里。',['拼接','Concat','concatenation'],'architecture');
  add('feature-p3','P3 特征层','YOLOv5 检测头中空间分辨率较高的一层，保留较多位置细节，常用于小目标。','像较大比例尺的地图，格子多、位置看得细。',['P3','P3/8'],'architecture');
  add('feature-p4','P4 特征层','YOLOv5 检测头中空间分辨率居中的一层，平衡位置细节与范围。','像中等比例尺地图，细节和覆盖范围折中。',['P4','P4/16'],'architecture');
  add('feature-p5','P5 特征层','YOLOv5 检测头中空间分辨率较低、单格覆盖范围较大的一层。','像较小比例尺的地图，格子少但每格看得更广。',['P5','P5/32'],'architecture');
  add('grid','网格（grid cell）','检测网格是特征图空间位置组成的索引系统。一个网格位置可以配多个 Anchor 产生多个候选；它不是把原图硬切成互不相关的区域，预测框可以跨过网格边界。','像把地图分成许多方格，逐格检查附近是否有目标。',['网格','grid cell','grid'],'anchors');
  add('anchor','锚框（anchor）','Anchor（锚框）是预设宽高参考，用来参数化框预测和安排训练匹配。它不是已找到的真实物体，也不是最终框；模型可在参考宽高上调整位置和尺寸。','像先放在图上的空白模板，网络再调整它的位置和大小。',['anchor','anchors','锚框'],'anchors');
  add('candidate-box','候选框（candidate box）','模型产生、还未经过最终筛选的一种目标位置猜测。','像草稿上先圈出的一个可能位置。',['候选','候选框','candidate box','候选预测框'],'anchors');
  add('positive-sample','正样本（positive sample）','在检测训练中，正样本通常指按分配规则负责某个真实目标的预测位置或候选。一个真实框可能分配多个正样本；“正”表示训练职责，不保证该候选当前已经预测正确。','像老师指定负责回答某道题的那一位学生。',['正样本','positive sample'],'anchors');
  add('negative-sample','负样本（negative sample）','负样本要结合任务定义。二分类中可指负类样本；在本课检测训练中常指未被分配到真实目标的预测位置，用于学习背景。负样本不等于错误预测，正负也不是数值的正负号。','像检查后确认并不负责该目标的候选位置。',['负样本','negative sample'],'anchors');
  add('objectness','目标存在性分数（objectness）','物体性是 YOLOv5 对候选位置的目标相关评分，经 Sigmoid 后落在 0～1。标准实现中正样本目标还可包含框的 IoU 质量信息，因此不能无条件把它等同于真实世界“有物体”的校准概率。','像先问“这里有没有东西”的门卫。',['objectness','目标性','目标存在性'],'yolo-loss');
  add('class-score','类别分数（class score）','模型对候选目标属于某个类别的预测分数。','像目标通过门卫后，分类员再判断它是什么。',['class score','类别分数','分类分数'],'yolo-loss');
  add('confidence-threshold','置信度阈值（confidence threshold）','保留预测前设置的最低分数门槛。','像考试先设最低及格线，低于门槛的答案暂不保留。',['置信度阈值','confidence threshold'],'inference');
  add('confidence','置信度（confidence score）','置信度是按模型与后处理约定得到的预测分数。标准 YOLOv5 常用物体性乘类别条件分数来排序和筛选；0.9 分不自动表示这条预测有 90% 的实际正确率。','像答题人给自己答案标的把握分，仍要用真实结果检验是否可靠。',['置信度','confidence score'],'inference');
  add('decode','解码（decode）','把网络输出的偏移或分数组合成可读坐标、类别和分数的过程。','像把机器内部的简写草稿翻译成框和标签。',['解码','decode'],'inference');
  add('bounding-box','边界框（bounding box）','用矩形框近似表示物体在图像中的位置和大小。','像在照片上套一个刚好圈住物体的透明矩形。',['边界框','bounding box','bbox','检测框'],'iou');
  add('iou','交并比（Intersection over Union，IoU）','IoU 是 Intersection over Union（交并比），等于两区域交集面积除以并集面积。两个面积各为 100、交集为 50 的框，IoU=50/(100+100−50)=1/3；它也可比较两个预测框，不限于预测与标注。','像比较两个圈有多少共同覆盖，再除以它们总共覆盖的区域。',['IoU','Intersection over Union','交并比'],'iou');
  add('intersection','交集（intersection）','两个形状或集合中共同覆盖、重合的部分。','像两张透明纸叠在一起时，彼此重合的那一块。',['交集','intersection'],'iou');
  add('union','并集（union）','把两个形状或集合覆盖到的所有部分合在一起，重合处只算一次。','像把两张透明纸覆盖的范围都涂上颜色，交叠处不重复计算。',['并集','union'],'iou');
  add('ciou','完全交并比（Complete IoU，CIoU）','在 IoU 基础上还考虑框中心距离和宽高比例的定位损失指标。','像不仅看两个框重叠多少，还看中心偏多远、形状差多少。',['CIoU','Complete IoU'],'yolo-loss');
  add('nms','非极大值抑制（Non-Maximum Suppression，NMS）','NMS 是 Non-Maximum Suppression（非极大值抑制），通常按分数保留一个候选，再抑制与它过度重叠的其他候选，逐步减少重复框。它不使用真实标注判断对错，也可能压掉靠得近的不同目标。','像重复报同一物体时，只保留最可信的一张报告。',['NMS','Non-Maximum Suppression','非极大值抑制'],'metrics');
  add('true-positive','真阳性（true positive，TP）','按评估规则与真实目标正确匹配的一项预测。','像正确找到目标并且类别、位置都符合要求。',['TP','true positive','真阳性'],'metrics');
  add('false-positive','假阳性（false positive，FP）','模型报出了目标，但评估规则判定这项预测不正确。','像把背景误认成目标，或同一个目标重复报了两次。',['FP','false positive','假阳性','误报'],'metrics');
  add('false-negative','假阴性（false negative，FN）','真实目标存在，但模型没有留下对应的正确预测。','像照片里有目标，模型却漏掉了它。',['FN','false negative','假阴性','漏检'],'metrics');
  add('precision','精确率（Precision）','Precision（精确率）=TP/(TP+FP)，回答“报出的预测有多大比例正确”。例如报出 10 个框、其中 8 个按匹配规则正确，精确率为 0.8；分母不是所有真实目标。','像问“我报出来的目标里，有多少真的找对了？”',['Precision','精确率'],'metrics');
  add('recall','召回率（Recall）','Recall（召回率）=TP/(TP+FN)，回答“实际存在的目标找到了多少”。例如标注 10 个目标、找对 6 个，召回率为 0.6；它需要与精确率一起看，不能只靠大量报框追求高召回。','像问“照片里的真实目标，我找回了多少？”',['Recall','召回率'],'metrics');
  add('f1','F1 分数（F1 score）','F1 是精确率 P 和召回率 R 的调和平均：2PR/(P+R)。例如 P=1、R=0.5 时 F1≈0.667；它不等于二者算术平均，且仍依赖选定的分数阈值和匹配规则。','像同时考察误报控制和漏检控制的综合成绩。',['F1','F1 score','F1 分数'],'metrics');
  add('ap','平均精度（Average Precision，AP）','AP 是 Average Precision（平均精确率），概括一个类别的精确率—召回率曲线。在检测中须先规定 IoU 匹配阈值，再按评测实现进行插值或积分；它不是简单平均几个阈值下的精确率。','像把一道题从严格判分到宽松判分时的表现连成一条线，再看整条线下的面积。',['AP','Average Precision','平均精度'],'metrics');
  add('map','平均精度均值（mean Average Precision，mAP）','mAP 是 mean Average Precision（平均 AP）：按指定协议对类别 AP 求平均。两类 AP 为 0.8、0.6 时均值为 0.7；mAP@0.5 和跨多个 IoU 阈值平均的 mAP@0.5:0.95 是不同成绩。','像先给每门课单独评分，再把各门课的成绩取平均。',['mAP','mean Average Precision','平均平均精度','平均精度均值'],'metrics');
  add('precision-envelope','Precision 包络线（Precision envelope）','计算曲线面积时，从当前点向后找能达到的最高正确比例，并用它作为这一段阶梯的高度。','像画阶梯路时，每一段都参考前方还能达到的最高台阶，避免一处低谷把后面的成绩也拉低。',['Precision envelope','precision envelope','Precision 包络线','精确率包络线','查准率包络线'],'metrics',{contextNote:'这是部分 AP 评估方法使用的曲线补齐办法；不同评估方法的采样与计算规则可能不同。'});

  // 数据、训练工程与部署
  add('yaml','YAML 配置文件（YAML Ain’t Markup Language）','用缩进组织的文本配置文件，常保存数据路径、类别名称等设置。','像一张按层级填写的实验设置表。',['YAML','yaml'],'dataset');
  add('path','路径（path）','指出文件或文件夹在电脑中的位置；在计算图里也可指数据经过的一串步骤，具体含义看上下文。','像地图上的路线；在电脑里也可以是一份文件的地址。',['路径','文件路径','相对路径','绝对路径','file path','path'],'dataset');
  add('computation-path','计算路径（computational path）','数据沿着一串运算步骤向前流动的路线；不同路线可以并行后再合并。','像一道生产线里的不同传送带，物品按步骤加工后在指定位置汇合。',['计算路径','前向路径','主路径','捷径路径','数据流路径','computation path'],'network');
  add('command-line','命令行界面（Command-Line Interface，CLI）','通过输入文字命令运行程序并传递参数的界面。','像用文字给机器逐条下达指令。',['命令行','CLI','Command-Line Interface','终端命令'],'train-yolo');
  add('working-directory','工作目录（working directory）','程序运行时默认查找相对路径文件的起点文件夹。','像打开文件柜时当前站的位置，之后的相对方向都从这里算。',['工作目录','working directory','当前目录'],'train-yolo');
  add('pretrained-weights','预训练权重（pretrained weights）','模型先前在其他数据上训练得到、可用于新任务起步的一组参数。','像从已经练过基本功的选手开始，再训练新项目。',['预训练权重','pretrained weights'],'transfer');
  add('checkpoint','检查点（checkpoint）','训练过程中保存的一份模型或训练状态，便于评估、部署或继续训练。','像学习进度的存档点。',['checkpoint','检查点'],'training');
  add('state-dict','参数字典（state_dict）','state_dict 是 PyTorch 模块按名称组织的参数与持久缓冲区字典，例如某层的 weight、bias 和 BN 运行统计量。它通常不包含模型类代码；加载还需要对应结构，完整续训另需优化器等状态。','像按零件名称登记的模型部件清单。',['state_dict','状态字典'],'training');
  add('buffer','缓冲状态（buffer）','buffer 是注册在模块中的状态张量，通常不由优化器根据梯度更新，例如 BatchNorm 的运行均值。它仍可能在训练前向过程中改变；“不是参数”不表示“永远不变”。','像仪器保存的参考读数，不是每次都靠梯度拧的旋钮。',['buffer','缓冲区'],'network');
  add('quantization','量化（quantization）','量化用有限的离散刻度近似表示权重或激活，例如把浮点数映成整数并记录缩放系数。它可能降低存储和运算成本，也会引入误差；实际提速取决于量化方案、算子和硬件支持。','像用较少刻度的尺记录数值，省空间但会有近似误差。',['量化','quantization'],'inference');
  add('onnx','开放神经网络交换格式（Open Neural Network Exchange，ONNX）','ONNX 是 Open Neural Network Exchange（开放神经网络交换格式），用于描述计算图、算子和相关权重。它是模型表示，不是执行引擎；运行时还需支持相应算子与版本。','像让不同软件都能读取的一种模型交换文件。',['ONNX','Open Neural Network Exchange'],'inference');
  add('runtime','运行时（runtime）','负责加载模型并实际执行模型运算的软件环境。','像真正把机器接电并执行工作的操作台。',['运行时','runtime'],'inference');
  add('openvino','OpenVINO 工具套件','面向 Intel 硬件部署和优化模型的一组工具与运行组件。','像针对一类工作台准备的模型转换和执行工具箱。',['OpenVINO'],'inference');
  add('tensorrt','TensorRT 推理 SDK','NVIDIA 提供的模型优化与推理软件开发工具包。','像针对 NVIDIA GPU 准备的模型加速工具箱。',['TensorRT'],'inference');
  add('api','应用程序接口（Application Programming Interface，API）','让一个程序按约定请求另一个程序提供功能的接口。','像按菜单格式下单，再接收厨房返回的结果。',['API','Application Programming Interface','接口'],'inference');
  add('latency','延迟（latency）','延迟是一次请求从规定起点到终点的耗时，必须说明是否包含读图、预处理、模型和后处理。20 毫秒的纯模型耗时不等于整个应用 20 毫秒；还要说明批次与硬件条件。','像按下按钮后等待机器给出答案的时长。',['延迟','latency'],'inference');
  add('throughput','吞吐量（throughput）','吞吐量是单位时间处理的数据量，例如每秒处理 100 张图片。批处理和流水线可增加吞吐量，但单个请求的等待时间未必更短；它与延迟衡量不同方面。','像厨房每分钟能完成多少份订单。',['吞吐','吞吐量','throughput'],'inference');
  add('coordinate','坐标（coordinate）','用一组有顺序的数字指出点在图像或空间中的位置；坐标含义取决于原点、轴方向和单位。','像按照“先横向、再纵向”的地址找到地图上的一个位置。',['坐标','coordinates','coordinate'],'iou');
  add('mask','掩码（mask）','用一组逐像素的标记指出哪些位置属于目标或区域。','像给图片盖上一张只露出目标形状的镂空纸。',['掩码','mask','分割掩码'],'tasks');
  add('model-weights-file','模型权重文件（model weights file）','保存模型参数的一种文件；它提供一组数值，不等同于网络结构或训练数据。','像把机器内部旋钮当前的位置记在一张存档卡上。',['权重文件','模型权重文件','weights file'],'inference');
  add('kl-divergence','KL 散度（Kullback–Leibler divergence）','用真实分布 P 作参考时，衡量模型分布 Q 带来的额外平均对数代价；它非负但不对称，不是普通距离。','像用不合身的地图代替参考地图时，平均多付出的路线说明成本。',['KL','KL 散度','KL divergence','Kullback–Leibler divergence','相对熵','relative entropy'],'losses');
  add('swiglu','SwiGLU（SiLU 门控线性单元）','一种门控计算：两路线性结果相乘，其中一路先经过 SiLU；常见于 Transformer 前馈部分。','像两路水管汇合，一路决定流量阀门开多大，另一路提供要传递的水。',['SwiGLU','SwiGLUFFN','swiglu'],'network',{contextNote:'这是可选进阶结构。先理解线性层、激活函数和普通前馈网络，再看它会更容易。'});
  add('adamw','AdamW 优化器','一种把权重衰减与 Adam 梯度统计更新分开处理的优化器。','像先按梯度决定怎么走，再单独轻轻把过大的参数往回拉。',['AdamW','AdamW optimizer'],'optimizer');
  add('grad-scaler','梯度缩放器（GradScaler）','混合精度训练中暂时放大损失及梯度、再还原梯度的工具，帮助较小梯度避免在低精度表示中变成 0。','像先把很轻的信号放大到仪表能读清，再按比例换回原单位。',['GradScaler','torch.amp.GradScaler'],'training');
  add('gguf','GGUF 模型文件格式','一种保存张量信息与元数据的二进制模型文件格式，常见于基于 GGML 的推理工具；它是文件格式，不是模型结构或训练方法。','像装着模型数字和说明标签的专用箱子。',['GGUF','.gguf'],'inference');
  add('semantic-segmentation','语义分割（semantic segmentation）','为图像中的每个像素预测类别，但不区分同类目标各自是哪一个实例。','像给整张地图逐格涂上“道路、草地、天空”等区域颜色。',['语义分割','semantic segmentation'],'tasks');
  add('instance-segmentation','实例分割（instance segmentation）','给每个目标分别找出像素轮廓，并区分同一类别中的不同个体。','像在合照里给每个人各画一圈轮廓，而不把同类人合成一片。',['实例分割','instance segmentation'],'tasks');
  add('keypoint','关键点（keypoint）','用坐标标记物体上的一个有意义位置，例如人体关节或物体角点。','像在人体骨架图上标出肩、肘、膝等位置。',['关键点','keypoint','landmark'],'tasks');
  add('tracking','目标跟踪（object tracking）','在连续视频帧中关联同一个目标，判断它在不同时间出现的位置。','像在人群连续照片里持续认出同一个人。',['目标跟踪','object tracking','tracking'],'tasks');
  add('pose-estimation','姿态估计（pose estimation）','根据关键点或骨架结构估计人体或物体的姿势。','像根据肩、肘、膝的位置推断一个人正在做什么动作。',['姿态估计','pose estimation'],'tasks');
  add('depth-estimation','深度估计（depth estimation）','预测图像各位置到相机或观察者的远近。','像给平面照片添上一张“每个位置离镜头多远”的地图。',['深度估计','depth estimation'],'tasks');
  add('gan','生成对抗网络（Generative Adversarial Network，GAN）','由生成器产生样本、判别器判断真伪并相互训练的一类生成模型。','像一个出题者不断仿造样品，另一个检查员努力识别真伪。',['GAN','Generative Adversarial Network','生成对抗网络'],'tasks');
  add('u-net','U-Net','一种常见的编码器—解码器式网络，用较深层信息与高分辨率特征融合，常用于像素级预测。','像先把图像概括成摘要，再逐层放大还原，并把早期细节带回来。',['U-Net','U Net'],'tasks');
  add('diffusion-model','扩散模型（diffusion model）','训练模型逐步去除噪声；生成时从噪声开始，多步得到样本的一类方法。','像从一张被雪花遮住的图开始，分多步把雪花擦掉。',['扩散模型','diffusion model'],'tasks');
  add('psnr','峰值信噪比（Peak Signal-to-Noise Ratio，PSNR）','根据图像像素误差计算的一种重建质量指标；数值高通常表示像素误差较小，但不完全等同于人眼观感。','像逐像素比较两张图片，估算重建误差相对信号有多小。',['PSNR','Peak Signal-to-Noise Ratio'],'tasks');
  add('ssim','结构相似性指数（Structural Similarity Index，SSIM）','比较图像局部亮度、对比度与结构相似程度的一种指标；它仍只是人眼感受的近似。','像不只逐点比颜色，也看局部明暗和形状纹理是否相像。',['SSIM','Structural Similarity Index'],'tasks');
  add('oks','关键点相似度（Object Keypoint Similarity，OKS）','姿态评估中比较预测关键点与真实关键点距离的一种相似度，通常会按人体尺度和关键点容差调整。','像评估一张骨架图的关节点离标准位置有多近，同时考虑人物大小。',['OKS','Object Keypoint Similarity'],'metrics');
  add('normal-cdf','标准正态累积分布函数（常记作 Φ）','本课 Φ(x) 表示标准正态随机变量不超过 x 的概率，均值为 0、方差为 1。例如 Φ(0)=0.5；GELU 精确形式使用 xΦ(x)。其他正态分布要先说明均值、标准差与输入标准化约定。','像沿着钟形曲线从最左边累加面积，读出到某个位置为止的比例。',['Φ','标准正态累积分布函数','normal CDF'],'ai-foundations');
  add('fps','帧率（frames per second，FPS）','每秒处理或显示的图像帧数。','像每秒翻过多少张连续画面。',['FPS','frames per second','帧率'],'inference');
  add('nan','非数值（Not a Number，NaN）','浮点运算产生的无效数值标记，例如非法运算结果。','像仪表显示“这个读数算不出来”。',['NaN','Not a Number'],'debugging');
  add('infinity','无穷大（infinity / Inf）','浮点数中的正或负无穷标记，常见于数值溢出或除零。','像计数器已经超出可显示范围。',['Inf','infinity','无穷大'],'debugging');
  add('none','空值（None）','Python 中表示“这里没有对象或结果”的特殊值，不等同于数字 0。','像表格里空着没填，不是填了零分。',['None','空值'],'debugging');
  add('random-seed','随机种子（random seed）','控制伪随机数序列起点的数值，用于帮助复现实验。','像随机抽牌前选定洗牌序列的起始编号。',['随机种子','random seed','seed'],'training');

  // 课程正文中常见的模型、库名称和代码术语
  add('alexnet','AlexNet 卷积神经网络','2012 年具有代表性的深层卷积网络，使用卷积、ReLU、池化和全连接层完成图像分类。','像一条逐层提取图像线索、最后给整张图片分类的流水线。',['AlexNet'],'cnn',{contextNote:'AlexNet 的历史影响很大；今天的视觉任务通常会使用后续设计的网络。'});
  add('bert','BERT 语言模型','一种双向 Transformer 编码器模型，通过结合左右上下文学习文字表示。','像读一句话时同时参考目标词左边和右边的内容。',['BERT','Bidirectional Encoder Representations from Transformers'],'ai-foundations');
  add('cnn','卷积神经网络（Convolutional Neural Network，CNN）','常用于图像的神经网络，会用局部滤镜扫描图像并逐层组合边缘、纹理和形状线索。','像拿一扇小窗在图片上移动，先看局部，再把局部线索拼成整体。',['CNN','CNNs','Convolutional Neural Network'],'cnn');
  add('ffn','前馈网络（Feed-Forward Network，FFN）','FFN 是 Feed-Forward Network（前馈网络），泛指信息沿层向前计算的网络。Transformer 中通常特指对每个位置独立应用、共享参数的前馈子模块；它处理特征，注意力模块负责位置间的信息交互。','像按固定顺序通过几台加工机器，中途没有把后面的结果送回前面。',['FFN','Feed-Forward Network','前馈网络'],'network');
  add('ggml','GGML 张量计算库','用于机器学习张量与模型推理相关工作的开源项目；名称也常出现在配套文件格式和工具中。','像一套处理模型数字、让程序能执行张量运算的工具箱。',['GGML','ggml'],'inference',{contextNote:'GGML、GGUF 和量化是相关但不同的概念：库/项目、文件格式、数值压缩方法不能混为一谈。'});
  add('glu','门控线性单元（Gated Linear Unit，GLU）','把一条线性变换结果与另一条经门函数控制的结果逐项相乘，以调节信息通过多少。','像一条水管提供信息，另一条水管控制阀门开度，两者相乘后决定流量。',['GLU','Gated Linear Unit'],'network');
  add('gpt2','GPT-2 语言模型','以 Transformer 解码器为基础、通过预测下一个词元生成文本的语言模型。','像根据已经写出的文字，一步步猜接下来最合适的词。',['GPT-2','GPT 2'],'ai-foundations');
  add('hsv','HSV 颜色表示','用色相、饱和度和明度三个量描述颜色的一种方式。','像先选色环上的颜色，再调颜色浓淡和明暗。',['HSV','Hue Saturation Value'],'image');
  add('hue','色相（hue）','颜色环上表示颜色类别的位置，例如偏红、偏绿或偏蓝。','像绕着色轮转动指针，选择颜色家族。',['色相','hue','Hue'],'augmentation');
  add('saturation','饱和度（saturation）','描述颜色鲜艳程度的量；降低时颜色会趋向灰，升高时颜色更浓。','像调颜料里彩色颜料的浓淡。',['饱和度','saturation','Saturation'],'augmentation');
  add('hsv-value','HSV 明度（value，V）','HSV 颜色表示里的明暗量；调低会让颜色变暗，调高会让画面变亮。','像调灯光亮度旋钮，不改变物体的位置。',['明度','明度 V','Value V','HSV V'],'augmentation');
  add('jpeg','JPEG 图像格式','常见的有损图像压缩格式，通过近似部分图像细节来减小文件体积。','像缩小照片文件时略微简化不太显眼的细节。',['JPEG','JPG'],'image');
  add('pytorch','PyTorch 深度学习框架','用于构建神经网络、执行张量运算和训练模型的 Python 软件库。','像搭建并训练数值模型的一套积木和实验台。',['PyTorch','torch'],'ai-foundations');
  add('scipy','SciPy 科学计算库','提供优化、统计、信号处理等常用科学计算功能的 Python 软件库。','像科学计算工具箱里放着的一组现成仪器。',['SciPy'],'ai-foundations');
  add('torchscript','TorchScript 模型表示','把部分 PyTorch 程序表示成可序列化计算图的一种旧式部署方式，常见于既有项目。','像把模型的计算步骤整理成一份可保存、可交给运行环境执行的流程图。',['TorchScript'],'inference',{contextNote:'阅读已有代码时认识这个名称即可；新项目应根据当前 PyTorch 官方导出与部署文档选择接口。'});
  add('yolo-family','YOLO 目标检测模型家族','一系列以单次网络推理直接预测目标位置与类别为特色的目标检测模型。','像一次查看整张图片，同时回答“有哪些物体、各自在哪里”。',['YOLO','You Only Look Once'],'architecture');
  add('dfl','分布焦点损失（Distribution Focal Loss，DFL）','一些较新的检测器用来监督边界框距离分布的损失项；并非所有检测模型都使用。','像不只报一个距离答案，而是学习目标距离可能落在哪些邻近刻度。',['DFL','Distribution Focal Loss'],'yolo-loss',{contextNote:'具体实现随模型和版本变化；标准 YOLOv5 的常见 box、objectness、class 三项中没有 DFL。'});
  add('compute-loss','ComputeLoss（损失计算代码）','YOLOv5 代码中的损失计算组件，负责把预测与标注匹配后计算框、物体性和类别相关损失。','像把模型的答题结果与标准答案逐项对照，再汇总扣分。',['ComputeLoss','compute_loss'],'yolo-loss',{contextNote:'这是代码里的名称，实际细节应以正在阅读的仓库版本为准。'});
  add('rotation-order','三维旋转顺序（XYZ / ZYX）','描述绕多个轴依次旋转的顺序；结果会受内禀/外禀定义、坐标系和矩阵约定影响。','像先转身体再转相机，或先转相机再转身体，顺序不同可能得到不同朝向。',['XYZ','ZYX','三维旋转顺序'],'quaternion',{contextNote:'XYZ 与 ZYX 不是可随意交换的字母标签；读公式或软件参数时要确认轴顺序和旋转约定。'});
  add('multi-scale-detect-features','YOLO 多尺度特征层（P3 / P4 / P5）','YOLO 检测头读取的三种空间尺度特征层，通常分别保留较多、中等和较少的位置细节。','像同时使用局部放大图、中比例地图和大范围地图寻找不同大小的物体。',['P3/P4/P5','P3 / P4 / P5'],'architecture');
  add('q4-quantization','Q4 四位量化标记','模型文件或工具中的一种常见量化命名，通常表示四位量化系列；实际编码细节取决于具体格式和后缀。','像把数字压到较少的刻度档位保存，能省空间，但细节会有损失。',['Q4','Q4_K','Q4_K_M'],'inference',{contextNote:'“4”是量化家族标签，不保证文件中每个参数连同元数据都恰好占 4 位。'});
  add('yolov5','YOLOv5 目标检测模型','Ultralytics YOLO 项目中的一个目标检测版本；本课程按对应配置讲解它的层、特征尺度和训练流程。','像一套有具体图纸和零件版本的目标检测机器。',['YOLOv5','YOLOv5s','YOLOv5l','YOLOV5'],'architecture',{contextNote:'YOLO 系列版本和仓库实现会变化；本课提到的层号、损失与默认设置以所展示的 YOLOv5 配置/代码为准。'});
  add('yolo-conv-module','YOLOv5 Conv 模块','YOLOv5 源码里的常用卷积模块，典型实现把卷积、批量归一化和激活函数组合在一起。','像一台连续完成“局部计算、整理数值、通过非线性门”的小机器。',['Conv','Conv module'],'architecture',{contextNote:'配置中的 Conv 常指该项目封装模块；普通数学语境的卷积或 PyTorch 的 nn.Conv2d 本身不一定包含 BN 和激活。'});
  add('conv2d-layer','二维卷积层（Conv2d）','对高度和宽度两个空间方向应用卷积核的神经网络层；输入和输出通常还有批次轴与通道轴。','像拿一块小滤镜沿图片的行和列滑动，逐格算出新图。',['Conv2d','nn.Conv2d'],'cnn');
  add('detect-module','Detect 检测头模块','YOLOv5 模型末端按多个尺度生成目标框、物体性和类别预测的代码模块。','像在几种比例的地图上同时寻找物体并写出候选结果。',['Detect','Detect module'],'architecture',{contextNote:'训练和推理模式的返回值不同；后处理筛选与 NMS 也不等同于检测头内部的卷积计算。'});
  add('lenet5','LeNet-5','早期用于手写数字识别的卷积神经网络，由卷积/下采样阶段和后续分类层组成。','像一条小型图像流水线，逐层看笔画并判断数字。',['LeNet-5','LeNet'],'cnn');
  add('vgg-family','VGG 网络家族','以重复堆叠小卷积核和池化层为特点的一组图像分类网络，数字后缀表示具体配置版本。','像用许多相同尺寸的小观察窗一层层组合视觉线索。',['VGG','VGG-16','VGG-19','VGG-16/19'],'cnn');
  add('resnet-family','ResNet 残差网络家族','使用残差捷径连接的深层网络家族，常见不同深度版本以层数标记。','像在很多加工步骤旁保留直达通路，让原始信息可以继续向前。',['ResNet','ResNet-18/34','ResNet-50/101/152'],'cnn');
  add('basicblock','BasicBlock（基础残差块）','一些 ResNet 结构中的基本模块，通常把卷积变换结果与捷径分支合并。','像把加工后的线索和抄送来的原线索相加，再交给下一层。',['BasicBlock'],'cnn');
  add('imagenet','ImageNet 图像数据集','一个用于视觉研究的大型图像数据资源；不同基准任务会使用其中不同类别划分与评测设置。','像一座带类别标签的大型图片资料库。',['ImageNet'],'cnn',{contextNote:'预训练模型所说的 ImageNet 权重，不意味着模型只会识别 ImageNet 类别；迁移后还要针对新任务调整。'});
  add('mnist','MNIST 手写数字数据集','一组常用于入门演示的手写数字灰度图像及其数字标签。','像一本每页都是数字小图并附标准答案的练习册。',['MNIST'],'cnn');
  add('coco','COCO 视觉数据集','常用于目标检测、分割和图像描述研究的数据集及评测基准之一。','像一套含多类日常场景图片和目标标注的练习与评测资料。',['COCO'],'dataset',{contextNote:'COCO 的类别、标注和评测协议有具体版本；使用时要核对所用数据配置。'});
  add('opencv','OpenCV 计算机视觉库','用于读取、处理和显示图像/视频的计算机视觉软件库。','像一组读取照片、改尺寸、换颜色和画标注框的工具。',['OpenCV','cv2'],'image');
  add('numpy','NumPy 数值数组库','Python 中用于多维数组和数值计算的常用库。','像一张能快速进行批量数字运算的表格。',['NumPy','numpy'],'tensor');
  add('torchvision','TorchVision 视觉工具库','PyTorch 生态中提供图像数据集、变换和视觉模型等工具的库。','像给 PyTorch 配套的图像数据与模型工具箱。',['TorchVision','Torchvision','torchvision'],'image');
  add('pillow','Pillow 图像处理库','Python 中用于打开、保存和进行基础图像操作的图像库。','像一本处理图片文件的基础工具册。',['Pillow','PIL'],'image');
  add('mosaic-augmentation','Mosaic 拼图增强','把多张训练图像裁切、缩放并拼到同一画布上的数据增强方式，目标框也要同步变换。','像把四张照片拼成一张新练习图，并把每个目标的位置一并搬过去。',['Mosaic','Mosaic augmentation'],'augmentation');
  add('accuracy','准确率（accuracy）','分类准确率是预测类别正确的样本数除以被评估样本总数。例如 10 张图片分对 8 张，准确率为 0.8。目标检测含多框、漏检和匹配，不能直接把某个框分数称作检测准确率。','像把答对的题数除以参加统计的总题数。',['Accuracy','accuracy','准确率'],'metrics',{contextNote:'目标检测中的 Precision、Recall 和 mAP 衡量角度不同，不能用一个分类准确率替代。'});
  add('true-negative','真阴性（true negative，TN）','按评估规则判定为负类的对象被正确识别为负类。','像确认一张没有猫的图片确实没有猫。',['TN','true negative','真阴性'],'metrics');
  add('focal-loss','焦点损失（Focal Loss）','一种降低易分类样本影响、让训练更关注难分类样本的损失改造。','像复习时少花时间做已经会的题，把精力多放在总做错的题上。',['Focal Loss','FocalLoss','Focal'],'yolo-loss',{contextNote:'它常用于类别不平衡等场景，但并非处理不平衡的唯一办法，也不是所有检测器默认使用的损失。'});
  add('flops','浮点运算量（FLOPs）','对模型一次前向计算中浮点运算数量的估算指标。','像数一遍完成一次预测大约需要多少次数字运算。',['FLOPs','FLOP count'],'cnn',{contextNote:'不同工具对乘加是否计作一次或两次运算的约定可能不同，比较时应使用相同口径。'});
  add('local-response-normalization','局部响应归一化（Local Response Normalization，LRN）','一种早期卷积网络使用的局部数值归一化操作，会参考相邻通道的响应。','像把附近几个频道的信号放在一起比较，再调整当前频道的强弱。',['LRN','Local Response Normalization'],'cnn',{contextNote:'它是理解 AlexNet 等历史结构时会遇到的名称，不是现代视觉网络普遍必需的模块。'});
  add('radial-basis-function','径向基函数（Radial Basis Function，RBF）','函数值主要随输入到某个中心点的距离变化的一类函数，常用于 RBF 网络或核方法。','像离一个地标越近，收到的影响越强；越远影响越弱。',['RBF','Radial Basis Function'],'cnn');
  add('neocognitron','Neocognitron（早期视觉网络）','受视觉皮层层级处理启发的早期神经网络模型，包含逐层提取局部模式的思路。','像先识别简单笔画，再把笔画组合成数字形状的早期设计。',['Neocognitron'],'cnn',{contextNote:'这是历史模型名称；现代 CNN 的训练方法和结构已发展很多，不能把两者当作同一个实现。'});
  add('autoanchor','AutoAnchor（锚框检查工具）','YOLOv5 训练代码中用于检查或重新适配锚框尺寸的辅助逻辑。','像开练前先检查鞋码模板是否适合训练集中的物体尺寸。',['AutoAnchor'],'anchors',{contextNote:'不同仓库版本是否启用、何时运行以及参数如何处理，应查看对应代码。'});
  add('exponential-moving-average','指数移动平均（Exponential Moving Average，EMA）','给近期数值更大权重、给较早数值较小权重的一种平滑平均；训练中也可用于平滑模型参数。','像每次记新成绩时更看重最近表现，同时保留一部分过去记录。',['EMA','Exponential Moving Average'],'training',{contextNote:'“参数 EMA”是参数平滑副本，不等同于优化器中梯度的一阶或二阶移动统计。'});
  add('lrn-scheduler','学习率调度器（learning-rate scheduler）','按预设规则随训练进程调整学习率的工具。','像根据训练轮次自动换挡，让步子大小随阶段改变。',['CosineAnnealingLR','ReduceLROnPlateau','学习率调度器','scheduler'],'optimizer');
  add('warmup','学习率预热（warmup）','训练开始时先使用较小学习率，再逐渐升到设定值的策略。','像刚开始骑车先慢慢加速，避免一上来就冲得太快。',['Warmup','warmup'],'optimizer');
  add('panet','PANet（路径聚合网络）','一种通过增加自下而上路径来促进多尺度特征融合的网络结构设计。','像在已有楼层之间再增加一条向上通道，让低层细节更直接传到高层。',['PANet'],'architecture',{contextNote:'YOLOv5 中的 PAN 风格特征路径与原论文 PANet 不能直接视为完全相同的整套网络。'});
  add('upsample','上采样（upsampling）','把特征图的空间尺寸放大的操作，具体插值规则由实现决定。','像把小地图放大到更多格子，得到更细的展示网格。',['Upsample','upsampling','上采样'],'architecture');
  add('decoder','解码器（decoder）','把较紧凑或较抽象的表示逐步变换成目标输出的网络部分或计算步骤。','像把压缩的提示逐层展开，恢复成可阅读的答案。',['Decoder','decoder','解码器'],'tasks');
  add('yolo-loss-symbols','YOLO 损失分项符号（Lbox / Lobj / Lcls）','分别表示边界框定位、物体性判断和类别判断相关的损失分量；具体加权和记号以当前公式为准。','像把总扣分单分成位置、有没有目标、类别三本账。',['Lbox','Lobj','Lcls','L_total','Ltotal'],'yolo-loss');
  add('conv-shape-symbols','卷积尺寸符号（Cin / Cout / Hin / Win）','常用来表示卷积输入通道数、输出通道数以及输入空间的高和宽。','像给进入和离开机器的通道数、网格高度和宽度分别贴上标签。',['Cin','Cout','Hin','Win','Hout','Wout'],'cnn');
  add('tanh','双曲正切函数（Tanh）','一种把输入平滑压到 −1 到 1 之间的激活函数。','像把各种大小的数值压进正负一之间的固定刻度。',['Tanh','tanh'],'network');
  add('transformer','Transformer 网络结构','一种以注意力运算为核心、可组合编码器或解码器模块的神经网络结构。','像让每个位置根据其他位置的信息决定该重点参考谁。',['Transformer','Transformers','Transformer network'],'network',{contextNote:'不同 Transformer 模型可使用编码器、解码器或两者；BERT 与 GPT-2 就不是同一种结构用法。'});
  add('precision-recall-curve','精确率—召回率曲线（Precision–Recall curve）','改变预测分数门槛后，把对应的精确率与召回率画成的一组点或曲线。','像逐步调高“算不算报出”的门槛，再记录误报与漏报之间的变化。',['Precision-Recall curve','Precision–Recall curve','PR curve','PR 曲线'],'metrics');
  add('top5-accuracy','Top-5 准确率（Top-5 accuracy）','分类任务中，只要真实类别出现在模型分数最高的五个类别里，就算该样本命中。','像考试允许写出最可能的五个答案，只要标准答案在其中就记为答对。',['Top-5','Top-5 accuracy','top 5 accuracy'],'metrics',{contextNote:'它通常用于类别很多的图像分类评测，不能直接替代检测任务中的 mAP。'});
  add('cifar10','CIFAR-10 图像数据集','一个包含十个类别的小尺寸彩色图像分类数据集，常用于入门实验。','像一本由十类小彩图组成的分类练习册。',['CIFAR-10','CIFAR10'],'cnn');
  add('python-language','Python 编程语言','一种常用于数据处理、科学计算和深度学习的通用编程语言。','像写给计算机的一套较易阅读的操作说明。',['Python'],'ai-foundations');
  add('csv','CSV 表格文本格式','把表格每一行写成文本记录、用分隔符区分列的一种简单文件格式。','像把电子表格保存成一行一行的纯文字。',['CSV','.csv'],'dataset');
  add('json','JSON 数据格式','用键和值、列表等结构保存数据的一种文本格式，常用于配置和程序交换数据。','像用统一标签写好的数据清单，其他程序可以按标签读取。',['JSON','.json'],'dataset');

  add('source-repository','源码仓库（source repository）','集中保存程序代码、配置和说明的项目目录；是否带有版本历史要看是否使用了Git等工具。','像一本同时装有机器图纸、操作步骤和说明书的工程档案。',['源码仓库','仓库','source repository'],'train-yolo');
  add('gradient-accumulation','梯度累积（gradient accumulation）','梯度累积是在几个小批次上反向计算并累加梯度，再执行一次优化器更新。例如累积 4 批，每批 8 张，常见更新组含 32 张；损失缩放、尾组样本数及 BN 行为需要另外处理。','像先收集几次作业的修改意见，再一起调整解题方法。',['梯度累积','gradient accumulation'],'train-yolo');
  add('fitness-score','模型选择评分（fitness）','按指定指标组合得到的分数；本地标准检测用它比较验证表现并选择best.pt。','像按事先公布的权重合成总成绩，再决定哪次考试最好。',['fitness','fitness评分'],'train-yolo');
  add('resume-training','断点续训（resume training）','从仍保留训练进度和优化器等状态的检查点恢复被中断实验。','像读取包含关卡进度的存档，接着上次玩到的位置继续。',['断点续训','resume training','--resume'],'train-yolo');
  add('fine-tuning','微调（fine-tuning）','用已有模型参数作为起点，再用目标任务的数据调整参数。','像已会基本驾驶的人，继续练习适应一种新车型。',['微调','fine-tuning','finetuning'],'train-yolo');
  add('transfer-learning','迁移学习（transfer learning）','把来源任务学到的部分表示或参数用于帮助学习新任务。','像学会骑自行车后，把平衡经验用于学习其他两轮车。',['迁移学习','transfer learning'],'transfer');
  add('anchor-bpr','Anchor几何覆盖率（Best Possible Recall，BPR）','按宽高比例阈值，至少有一个可用Anchor的标注框比例；不是模型实际召回率。','像只检查货物尺寸能否找到合适箱子，还没有测打包工人的实际表现。',['BPR','Best Possible Recall'],'anchors');
  add('anchor-aat','平均可用参考框数（Anchors Above Threshold，AAT）','每个标注框平均有多少个Anchor通过宽高比例阈值。','像平均每件货物有几种箱子可以选。',['AAT','Anchors Above Threshold'],'anchors');
  add('k-means','K-means聚类（K-means clustering）','把数据按相似程度分成指定数量的组，并用各组中心概括数据。','像按衣服尺码分堆，给每堆找一个代表尺寸。',['K-means','K-means聚类'],'anchors');
  add('genetic-algorithm','遗传算法（genetic algorithm）','对候选方案做随机变化，比较评分并保留更优方案的搜索方法。','像反复小幅调整配方，每次留下更符合目标的一版。',['遗传算法','genetic algorithm'],'anchors');
  add('whitening','白化（whitening）','完整的统计白化会去中心并变换数据，使协方差矩阵成为单位矩阵。在本地 AutoAnchor 中名为 whitening 的步骤只是按宽、高各自标准差缩放，没有完整去相关，不能把二者当成同一操作。','像比较不同单位的测量值前，先换到可比较的刻度。',['白化','whitening'],'anchors');
  add('albumentations','Albumentations图像增强库','提供图像及其标注同步变换的Python工具库，可作为可选增强流程接入。','像一套会同时修改照片和框位置的图片编辑工具箱。',['Albumentations'],'augmentation');

  add('sliding-window','滑动窗口（sliding window）','让固定大小的观察区域逐步移动，在多个位置检查图像内容的方法。','像拿一张开着小窗的纸在大照片上移动，逐块看有没有目标。',['滑动窗口','sliding window'],'detection-intro');
  add('two-stage-detection','两阶段检测（two-stage detection）','先生成候选区域，再对候选区域分类和精修框的一类检测流程。','像先圈出值得细看的区域，再逐个仔细检查。',['两阶段','two-stage detection'],'detection-two-stage');
  add('one-stage-detection','一阶段检测（one-stage detection）','直接从图像特征在多个位置生成检测预测，不另设候选区域分类精修阶段的一类流程。','像在整张地图的许多位置直接写出候选答案。',['一阶段','one-stage detection'],'detection-one-stage');
  add('region-proposal','候选区域（region proposal）','检测流程先提出的、可能包含目标的区域，尚未确定最终类别和准确边界。','像巡查前圈出的重点地点，还要继续核实。',['候选区域','region proposal'],'detection-two-stage');
  add('selective-search','选择性搜索（Selective Search）','根据颜色、纹理等图像线索合并区域并产生候选框的方法，曾用于早期区域检测器。','像先把相似的小拼图片合成可能属于同一物体的大块。',['Selective Search','选择性搜索'],'detection-two-stage');
  add('rpn','区域建议网络（Region Proposal Network，RPN）','在共享特征上学习提出候选区域的网络组件，典型用于Faster R-CNN。','像一位先指出哪里值得仔细检查的助手。',['RPN','Region Proposal Network','区域建议网络'],'detection-two-stage');
  add('roi','感兴趣区域（Region of Interest，RoI）','图像或特征图中需要进一步处理的一块区域。','像阅读地图时圈出准备放大查看的一片位置。',['RoI','Region of Interest','感兴趣区域'],'detection-two-stage');
  add('roi-pooling','RoI池化（RoI Pooling）','把不同大小候选区域的特征划成固定数量的格子，并在格内池化，得到固定尺寸输出。','像把大小不同的地图区域都整理成相同格数的摘要。',['RoI Pooling','RoI池化'],'detection-two-stage');
  add('r-cnn','R-CNN（Regions with CNN features）','对候选区域提取卷积特征并进行类别判断和框修正的早期区域检测方法。','像先裁出许多重点小照片，再逐张分析。',['R-CNN'],'detection-two-stage');
  add('fast-r-cnn','Fast R-CNN','先计算整图共享特征，再按候选区域提取特征进行分类和框回归的检测方法。','像先准备一张详细地图，再从地图上取各区域摘要。',['Fast R-CNN'],'detection-two-stage');
  add('faster-r-cnn','Faster R-CNN','用RPN产生候选区域，再用区域检测头分类和精修框的两阶段检测方法。','像同一套巡检系统先建议重点地点，再对地点逐个核实。',['Faster R-CNN'],'detection-two-stage');
  add('dense-prediction','密集预测（dense prediction）','在特征图许多位置同时输出框、类别或其他任务数字的预测组织方式。','像在地图的许多格子里同时填入候选答案。',['密集预测','dense prediction'],'detection-one-stage');
  add('ssd','SSD（Single Shot MultiBox Detector）','在多种尺度特征图上利用默认框直接预测类别与框调整的一阶段检测方法。','像在几种缩放比例的地图上同时使用多种尺寸模板找目标。',['SSD','Single Shot MultiBox Detector'],'detection-one-stage');
  add('anchor-free','无锚框设计（anchor-free）','不依赖预设Anchor宽高模板组织框预测的一类设计，仍需要定位表示和训练目标分配。','像直接指出中心或边界，而不是先拿几种固定尺寸模板套上去。',['Anchor-free','anchor-free'],'detection-one-stage');
  add('preprint','预印本（preprint）','在正式会议或期刊发表之前公开的论文版本，其公开年份可能与会议年份不同。','像正式出版前先公开给同行阅读的稿本。',['预印本','preprint'],'yolo-evolution');

  // 基本名称定义：供课程起点、正文提示和解释卡共同使用。
  add('smooth-l1','Smooth L1 损失（SmoothL1Loss）','PyTorch 的 Smooth L1 以 β 控制转折：小误差项为 0.5e²/β，大误差项为 |e|−0.5β。β=δ>0 时等于 HuberLoss/β；仅在 β=δ=1 时两者数值相同，β=0 时为 L1 损失。','像在零点附近把绝对值尖角磨圆；调节转折宽度还要注意纵向刻度。',['Smooth L1','SmoothL1Loss','SmoothL1','平滑 L1'],'loss-regression');
  add('generalization','泛化（generalization）','泛化是模型把从训练数据学到的规律用于未参与训练的新样本的能力。例如练习过白天车辆后还要在独立道路照片上评估；训练集高分本身不能证明泛化好。','像学会一种解题方法后能做新题，而不是只背会练习册。',['泛化','泛化能力','generalization'],'regularization');
  add('data-leakage','数据泄漏（data leakage）','评估时不该提前获得的信息进入了训练或方案选择，使成绩过于乐观。例如同一段视频的几乎相同帧同时落入训练和测试集；使用全部数据拟合预处理统计量也可能泄漏。','像正式考试的题目提前混入练习，考分无法说明真正水平。',['数据泄漏','data leakage'],'data-quality');
  add('data-augmentation','数据增强（data augmentation）','数据增强按合理变换产生训练样本的变化形式，例如翻转、裁剪与颜色调整。变换须保持任务语义，并同步修改框或掩码；它增加变化，不等于获得同样数量的独立新采集样本。','像让同一道练习题换合理的背景、朝向和光照，再练习识别。',['数据增强','图像增强','data augmentation'],'augmentation');
  add('label-noise','标签噪声（label noise）','标签噪声是监督答案中的错误或不一致，例如猫被标成狗、车辆框漏标。它会让模型收到错误学习信号；类别少是数据不平衡，标签错是噪声，处理方式不同。','像作业答案本身印错，学生越认真照着学越容易学偏。',['标签噪声','标注噪声','label noise'],'data-diagnosis');
  add('information-content','信息量（self-information）','单个离散事件发生后的信息量常写为 −ln p，p 是该事件概率。p=1 时为 0，p=0.5 时约为 0.693 nat；越罕见的事件信息量越大。对数底为 2 时单位是 bit。','像每天正常开门不意外，罕见的临时关闭带来更多新消息。',['信息量','自信息','self-information'],'loss-theory');
  add('entropy','熵（entropy）','熵是按真实概率对各结果的信息量取平均，描述分布的不确定性。公平硬币的熵为 ln2，必定正面的硬币熵为 0；它描述结果分布，不是模型预测误差。','像抽签前对结果有多拿不准，把所有可能结果的意外程度平均。',['熵','entropy','信息熵'],'loss-theory-cross-entropy');
  add('reduction','损失归约（reduction）','归约规定怎样把多个损失项汇总：none 保留各项，sum 求和，mean 按接口规则求平均。例如 [1,3] 可保留原数组、得到 4 或得到 2；加权、忽略标签时平均分母须看接口。','像一张扣分明细，可以保留每项、合计总分或求平均分。',['reduction','归约','损失归约'],'loss-stability');
  add('gradient-clipping','梯度裁剪（gradient clipping）','梯度裁剪在优化器更新前限制梯度大小。按整体 L2 范数裁剪时，超过阈值才等比例缩小梯度向量；例如 [3,4] 范数 5，阈值 1 时变 [0.6,0.8]，方向保持不变。','像给异常大的修改建议加限幅，防止一次更新跨得过远。',['梯度裁剪','gradient clipping'],'optimizer-tuning');
  add('l2-regularization','L2 正则项（L2 penalty）','L2 正则项按参数平方和惩罚大参数，例如在损失中加 λ‖θ‖²/2，梯度增加 λθ。它是目标函数的一部分，与某些优化器的直接权重收缩是否等价，要按更新公式判断。','像除了错题扣分，再对过大的旋钮刻度收取平方费用。',['L2 正则','L2正则','L2 惩罚','L2 penalty','L2 正则化','L2正则化','L2 正则项'],'optimizer-tuning');
  add('freeze-parameters','冻结参数（parameter freezing）','冻结指训练时不更新指定参数，通常通过 requires_grad=False 并管理优化器实现；解冻是恢复允许更新。冻结不自动切到 eval，BN 缓冲区等状态仍需另行管理。','像暂时锁住部分旋钮，只调其他旋钮，机器中的其他状态仍可能变化。',['冻结参数','冻结层','解冻','parameter freezing'],'fine-tuning');
  add('forward-pass','前向计算（forward pass）','前向计算按模型的连接顺序，从输入逐步算出中间结果和输出。例如先算 z=wx+b，再算激活 a=f(z)。训练和推理都要前向计算，前向本身不等于更新参数。','像把原料依次送过流水线，得到结果。',['前向计算','前向传播','forward pass'],'training-loop');
  add('autograd','自动求导（automatic differentiation，Autograd）','自动求导工具根据实际执行的可微运算，记录依赖并按链式法则计算导数。PyTorch 通常在前向构建图、backward 时反向累加梯度；它不通过随意试改参数来猜导数。','像计算时留下每步路线，回查时按规则算出各步骤影响。',['自动求导','Autograd','autograd','automatic differentiation'],'gradient-chain-rule');
  add('groups','分组卷积（grouped convolution）','分组卷积把输入和输出通道分组，各组只在组内卷积。Cin、Cout 都须能被 groups 整除；例如 4→8 通道、groups=2，每组用 2 个输入通道产生 4 个输出通道。','像把两组材料交给两条独立加工线，先各自在组内加工。',['分组卷积','grouped convolution','groups'],'cnn-shapes');
  add('local-connectivity','局部连接（local connectivity）','局部连接让一个输出位置只读取输入的一小片邻域。例如一个 3×3 卷积窗口读取附近 9 个空间位置，而不是整张图；跨多层组合后依赖范围会逐渐扩大。','像先观察一小块拼图，再逐层组合成更大图案。',['局部连接','local connectivity'],'cnn-priors');
  add('weight-sharing','权重共享（weight sharing）','权重共享是在多个计算位置重复使用同一组参数。卷积核从图左移到图右仍用相同权重，因此图片变大增加计算位置，却不会直接增加这组卷积核的参数数量。','像用同一枚印章在纸上不同位置盖印。',['权重共享','共享权重','weight sharing'],'cnn-priors');
  add('translation-equivariance','平移等变性（translation equivariance）','平移等变指输入移动后，输出也按对应方式移动。例如同一卷积核在不同位置检测到相似边缘。严格对应会受边界、填充和下采样影响；这与输出完全不变的平移不变性不同。','像地图上的目标向右移，标记也向右移，二者一起变化。',['平移等变性','平移等变','translation equivariance'],'cnn-priors');
  add('inductive-bias','归纳偏置（inductive bias）','归纳偏置是模型结构或学习方法预先倾向接受的一类规律。例如卷积假设局部模式有用、同类模式可在不同位置复用。它帮助从有限数据学习，也可能不适合某些任务；不是输出上的可训练 bias。','像解题前先选一种观察问题的方式，会帮助一些题，也会限制另一些题。',['归纳偏置','inductive bias'],'cnn-priors-limits');
  add('flatten','展平（flatten）','展平把选定的多条轴合并成一条轴，例如 [2,3] 变为 [6]，元素总数不变。若知道原形状和顺序，可还原分组；展平本身不删除像素，但后接全连接层通常不显式使用局部空间结构。','像把表格按行抄成清单，知道每行多长还可以重新排回表格。',['展平','flatten','Flatten'],'cnn-priors');
  add('identity-mapping','恒等映射（identity mapping）','恒等映射让输入原样成为输出，写作 y=x。在残差块中，恒等捷径把 x 直接送到相加处，不含可学习参数；尺寸或通道改变时，可能需要另用带参数的投影捷径。','像把一份原件直接传到下一站，再与加工结果合并。',['恒等映射','恒等捷径','identity mapping'],'cnn-residual');
  add('residual','残差（residual）','残差通常表示目标与某个基准之间的差。在残差块 y=x+F(x) 中，F(x) 学习相对输入 x 的修正；它是中间特征变换，不自动等于预测值与真实标签之差。','像在原稿上加一份修订量，原稿加修订得到新稿。',['残差','residual'],'cnn-residual');
  add('feature-pyramid','特征金字塔（feature pyramid）','特征金字塔是一组空间分辨率不同的特征表示。例如 640 输入可有 80×80、40×40、20×20 的特征层，让检测器在不同网格密度上预测；具体层数和通道由结构决定。','像同时使用详细街区图、城区图和全市图观察目标。',['特征金字塔','多尺度特征','feature pyramid'],'feature-pyramid');
  add('letterbox','等比例缩放与补边（letterbox）','letterbox 先等比例缩放图像，再按目标画布补边，避免直接拉伸物体比例。例如 640×480 图补成 640×640 时可上下各补 80 像素；映回原图的框须减补边、除缩放比例。','像把长方形照片等比例放进方形相框，空出的地方补背景。',['letterbox','LetterBox','等比例缩放与补边'],'image-preprocessing');
  add('numerical-stability','数值稳定性（numerical stability）','数值稳定性关注有限精度计算中，舍入、溢出或下溢是否让结果失真。同一数学表达式可有不同稳定实现，例如交叉熵直接从 logits 算 LogSumExp，避免先把极小概率舍入为零。','像用适合刻度范围的算法记账，避免中间数太大或太小而丢失。',['数值稳定性','数值稳定','numerical stability'],'loss-stability');
  add('target-assignment','样本分配（target assignment）','检测训练的样本分配决定哪些预测位置负责哪些真实目标，并据此构造学习目标。例如一个标注框可分给多个位置；这是训练阶段的监督规则，不是推理时用 NMS 删除重复框。','像先给多名练习者分配要负责的题目，再按各自职责批改。',['样本分配','目标分配','target assignment'],'yolo-assignment');
  add('normal-distribution','正态分布（normal distribution）','正态分布是一类由均值和方差确定的钟形概率分布，离均值近的区间通常更常见。把任意数据减均值、除标准差，只改变中心和尺度，不会让原本非正态的数据自动变成这种分布。','像中间高、两边逐渐降低的钟形轮廓，但不是每组数据都长这样。',['正态分布','normal distribution'],'network-extensions');
  add('standard-normal-distribution','标准正态分布（standard normal distribution）','标准正态分布是均值 0、方差 1 的特定正态分布。它关于 0 对称，所以累计概率 Φ(0)=0.5；GELU 精确公式里的 Φ 指这种分布的累计概率，不是任意均值、方差的正态分布。','像用统一中心和刻度的一种钟形概率曲线。',['标准正态分布','standard normal distribution'],'network-activations');

  window.visionlabDictionaryContent?.extend(items,add);
  const byId=Object.fromEntries(items.map(item=>[item.id,item]));
  const aliases=items.flatMap(item=>item.aliases.map(alias=>({alias,item}))).sort((a,b)=>b.alias.length-a.alias.length);
  // Only these audited whole terms suppress their embedded child terms. A
  // child term remains available everywhere else, including next to a whole
  // term in the same sentence.
  const atomicCompoundRelations=[
    ['二分类','binary-classification',['classification']],
    ['多分类','multiclass-classification',['classification']],
    ['多类别分类','multiclass-classification',['classification']],
    ['多标签分类','multilabel-classification',['classification','label']],
    ['内部协变量偏移','internal-covariate-shift',['covariate','variable']],
    ['二元交叉熵','bce',['cross-entropy']],
    ['偏导数','partial-derivative',['derivative']],
    ['激活函数','activation',['function']],
    ['损失函数','loss',['function']],
    ['随机梯度下降','sgd',['gradient','gradient-descent']],
    ['多标签','multilabel-classification',['label']],
    ['自然对数','natural-log',['logarithm']],
    ['交叉熵损失','cross-entropy',['loss']],
    ['旋转矩阵','rotation-matrix',['matrix']],
    ['扩散模型','diffusion-model',['model']],
    ['批量归一化','batch-normalization',['normalization']],
    ['超参数','hyperparameter',['parameter']],
    ['主路径','computation-path',['path']],
    ['前向路径','computation-path',['path']],
    ['计算路径','computation-path',['path']],
    ['全局平均池化','global-average-pooling',['pooling']],
    ['正确类别概率','cross-entropy-example',['probability']],
    ['真实类概率','cross-entropy-example',['probability']],
    ['负样本','negative-sample',['sample']],
    ['正样本','positive-sample',['sample']],
    ['实例分割','instance-segmentation',['segmentation']],
    ['语义分割','semantic-segmentation',['segmentation']],
    ['卷积步幅','conv-stride',['spatial-stride']],
    ['内存步幅','stride',['spatial-stride']],
    ['张量内存步幅','stride',['spatial-stride']],
    ['连续张量','contiguous',['tensor']],
    ['预训练权重','pretrained-weights',['training','weight']],
    ['协变量','covariate',['variable']],
    ['中间变量','intermediate-variable',['variable']],
    ['协变量偏移','internal-covariate-shift',['covariate','variable']],
    ['模型权重文件','model-weights-file',['weight']],
  ];
  const escapeRegExp=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const alternation=aliases.map(entry=>escapeRegExp(entry.alias)).join('|');
  // Check ASCII word boundaries without consuming adjacent characters: Chinese
  // glossary terms commonly touch one another (输入输出), or meet English
  // technical tokens without a space (输出logits).
  const matcher=alternation?new RegExp('('+alternation+')','giu'):null;
  const aliasLookup=new Map(aliases.map(entry=>[entry.alias.toLocaleLowerCase(),entry.item]));
  const compoundSurfacesByChild=new Map();
  for(const [surface,termId,childIds] of atomicCompoundRelations){
    if(!byId[termId]?.aliases.includes(surface))continue;
    for(const childId of childIds){
      if(!byId[childId])continue;
      if(!compoundSurfacesByChild.has(childId))compoundSurfacesByChild.set(childId,[]);
      compoundSurfacesByChild.get(childId).push(surface);
    }
  }
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function lookup(alias){return aliasLookup.get(String(alias).toLocaleLowerCase())||null}
  function blockedByCompound(itemId,text,start,end){
    const surfaces=compoundSurfacesByChild.get(itemId);if(!surfaces)return false;
    for(const surface of surfaces){
      let at=text.indexOf(surface,Math.max(0,start-surface.length+1));
      while(at!==-1&&at<=start){if(at+surface.length>=end)return true;at=text.indexOf(surface,at+1);}
    }
    return false;
  }
  function allowedAlias(alias,text,start,end,item=lookup(alias)){
    if(item&&blockedByCompound(item.id,text,start,end))return false;
    return !(alias==='激活'&&/^(?:环境|账号|账户|设备|用户)/.test(text.slice(end)));
  }
  function matchesIn(text){
    const source=String(text||''),matches=[];if(!matcher)return matches;
    matcher.lastIndex=0;let match;
    while((match=matcher.exec(source))){
      const start=match.index,end=start+match[1].length,alias=match[1];
      const startsAsciiWord=/[A-Za-z0-9_]/.test(alias[0]);
      const endsAsciiWord=/[A-Za-z0-9_]/.test(alias[alias.length-1]);
      if(startsAsciiWord&&start>0&&/[A-Za-z0-9_]/.test(source[start-1]))continue;
      if(endsAsciiWord&&end<source.length&&/[A-Za-z0-9_]/.test(source[end]))continue;
      const item=lookup(alias);if(!item||!allowedAlias(alias,source,start,end,item))continue;
      matches.push({start,end,alias,item});
      if(match[0].length===0)matcher.lastIndex++;
    }
    matcher.lastIndex=0;return matches;
  }
  function termsIn(text){const found=new Map();for(const match of matchesIn(text))if(!found.has(match.item.id))found.set(match.item.id,match.item);return [...found.values()]}
  function firstTerm(text){return matchesIn(text)[0]?.item||null}
  function chip(id,label){const item=byId[id];if(!item)return '';return '<button class="glossary-chip" type="button" data-glossary-open="'+escapeHtml(id)+'" aria-haspopup="dialog">'+escapeHtml(label||item.title)+'<span aria-hidden="true">ⓘ</span></button>'}
  function renderSearch(query,limit=8){
    const normalize=value=>String(value||'').normalize('NFKC').toLocaleLowerCase().replace(/[\s_-]+/g,'');
    const q=normalize(query);if(!q)return [];
    return items.map(item=>{
      const names=[item.title,...item.aliases].map(normalize),detail=item.dictionary||{};
      const rank=names.includes(q)?0:names.some(name=>name.startsWith(q))?1:names.some(name=>name.includes(q))?2:
        normalize(item.plainExplanation).includes(q)?3:normalize([detail.why,detail.example,detail.pitfall,detail.code].join(' ')).includes(q)?4:99;
      return {item,rank};
    }).filter(hit=>hit.rank<99).sort((a,b)=>a.rank-b.rank||a.item.title.localeCompare(b.item.title,'zh-Hans-CN')).slice(0,limit).map(hit=>hit.item);
  }
  function eligible(node,allowGlossaryCard=false){
    const parent=node.parentElement;
    const blocked='script,style,textarea,pre,code,option,svg,math,a,button,label,select,input,.katex,.MathJax,mjx-container,.glossary-term,.glossary-chip,[contenteditable="true"]'+(allowGlossaryCard?'':',.glossary-card');
    return parent&&!parent.closest(blocked);
  }
  function addTooltipHint(element,item){
    if(!element||!item||element.dataset.termId||element.dataset.glossaryOpen||element.classList?.contains('glossary-chip'))return;
    if(element.matches?.('code')){element.dataset.glossaryOpen=item.id;element.setAttribute('aria-haspopup','dialog');element.setAttribute('aria-expanded','false');element.setAttribute('aria-label',item.title+'。按回车或点击查看详细解释。');element.tabIndex=0;}
    else element.dataset.glossaryTooltip=item.id;
    const descriptionId='glossary-description-'+item.id,described=(element.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);
    if(!described.includes(descriptionId))described.push(descriptionId);
    element.setAttribute('aria-describedby',described.join(' '));
    if(element.namespaceURI==='http://www.w3.org/2000/svg')element.setAttribute('tabindex','0');
  }
  function decorateHintTargets(root){
    const candidates=[];
    if(root.matches?.('a,button,label,select,input,code,svg text'))candidates.push(root);
    candidates.push(...(root.querySelectorAll?.('a,button,label,select,input,code,svg text')||[]));
    candidates.forEach(element=>{
      if(element.closest?.('.glossary-card,.glossary-chip'))return;
      const source=element.matches('input,select')?(element.getAttribute('aria-label')||element.labels?.[0]?.textContent||''):element.textContent;
      if(element.matches('code')){if(element.closest('pre,a,button'))return;const found=termsIn(source);if(found.length===1)addTooltipHint(element,found[0]);return;}
      const item=firstTerm(source);if(item)addTooltipHint(element,item);
    });
  }
  const blockTags=new Set(['P','LI','DD','DT','H1','H2','H3','H4','H5','H6','TH','TD','FIGCAPTION','SUMMARY','BLOCKQUOTE','DIV','SECTION','ARTICLE','MAIN','HEADER','FOOTER','ASIDE','UL','OL','TABLE','TR','THEAD','TBODY','TFOOT','FORM','FIELDSET']);
  const protectedTags='script,style,textarea,pre,code,option,svg,math,a,button,label,select,input,.katex,.MathJax,mjx-container,.glossary-term,.glossary-chip,[contenteditable="true"]';
  function collectTextRuns(root,allowGlossaryCard){
    const runs=[];let current=[];
    const flush=()=>{if(current.length){runs.push(current);current=[];}};
    const visit=node=>{
      if(node.nodeType===Node.TEXT_NODE){if(eligible(node,allowGlossaryCard))current.push(node);else flush();return;}
      if(node.nodeType===Node.ELEMENT_NODE){
        const isRoot=node===root;
        if(!isRoot&&node.matches(protectedTags+(allowGlossaryCard?'':',.glossary-card'))){flush();return;}
        if(!isRoot&&node.tagName==='BR'){flush();return;}
        const boundary=!isRoot&&blockTags.has(node.tagName);if(boundary)flush();
        Array.from(node.childNodes).forEach(visit);
        if(boundary)flush();return;
      }
      Array.from(node.childNodes||[]).forEach(visit);
    };
    visit(root);flush();return runs;
  }
  function textPoint(nodes,index,isEnd){
    let offset=0;
    for(let i=0;i<nodes.length;i++){
      const length=nodes[i].nodeValue.length,end=offset+length;
      if(index<end||(!isEnd&&index===offset)||(isEnd&&index===end))return {node:nodes[i],offset:index-offset};
      offset=end;
    }
    return null;
  }
  function decorateTextRun(nodes){
    const source=nodes.map(node=>node.nodeValue).join(''),matches=matchesIn(source);
    for(let i=matches.length-1;i>=0;i--){
      const match=matches[i],start=textPoint(nodes,match.start,false),end=textPoint(nodes,match.end,true);
      if(!start||!end||!start.node.isConnected||!end.node.isConnected)continue;
      const range=document.createRange();range.setStart(start.node,start.offset);range.setEnd(end.node,end.offset);
      const mark=document.createElement('dfn');mark.className='glossary-term';mark.dataset.termId=match.item.id;mark.tabIndex=0;mark.setAttribute('aria-label',match.item.title+'。按回车或点击查看解释。');mark.setAttribute('aria-haspopup','dialog');mark.setAttribute('aria-describedby','glossary-description-'+match.item.id);
      mark.append(range.extractContents());range.insertNode(mark);
    }
  }
  function mutationRoot(node,fallback){
    let element=node.nodeType===Node.ELEMENT_NODE?node:node.parentElement;
    while(element&&element!==fallback){if(blockTags.has(element.tagName)||element.matches(protectedTags))return element;element=element.parentElement;}
    return fallback||element;
  }
  function decorate(root,options={}){
    if(!root||!matcher)return;
    const allowGlossaryCard=options.allowGlossaryCard===true;
    collectTextRuns(root,allowGlossaryCard).forEach(decorateTextRun);
    if(!allowGlossaryCard)decorateHintTargets(root);
  }
  function init(){
    if(window.visionlabGlossary?.initialized)return;
    const descriptions=document.createElement('div');descriptions.className='glossary-screenreader-only';descriptions.setAttribute('aria-hidden','false');
    descriptions.innerHTML=items.map(item=>'<span id="glossary-description-'+escapeHtml(item.id)+'">'+escapeHtml(item.title+'。'+item.plainExplanation+'。比喻：'+item.metaphor)+'</span>').join('');
    document.body.append(descriptions);
    const tooltip=document.createElement('div');tooltip.id='visionlab-term-tooltip';tooltip.className='glossary-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;document.body.append(tooltip);
    const card=document.createElement('section');card.id='visionlab-term-card';card.className='glossary-card';card.setAttribute('role','dialog');card.setAttribute('aria-modal','false');card.setAttribute('aria-labelledby','glossary-card-title');card.hidden=true;
    document.body.append(card);
    let active=null,returnFocus=null,hideTimer=0,nestedFocusSequence=0;const cardStack=[];
    const position=(element,target)=>{const r=target.getBoundingClientRect(),w=Math.min(360,window.innerWidth-24),h=element.getBoundingClientRect().height||120,left=Math.min(window.innerWidth-w-12,Math.max(12,r.left)),below=r.bottom+8,top=below+h<=window.innerHeight-12?below:Math.max(12,r.top-h-8);element.style.left=left+'px';element.style.top=top+'px';};
    const showShort=(target)=>{const item=byId[target.dataset.termId||target.dataset.glossaryOpen||target.dataset.glossaryTooltip];if(!item)return;clearTimeout(hideTimer);hideTimer=0;active=target;tooltip.textContent=item.title+'：'+item.plainExplanation;tooltip.hidden=false;position(tooltip,target);const described=(target.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean);if(!described.includes('visionlab-term-tooltip'))described.push('visionlab-term-tooltip');target.setAttribute('aria-describedby',described.join(' '));};
    const hideShort=()=>{tooltip.hidden=true;if(active){const id=active.dataset.termId||active.dataset.glossaryOpen||active.dataset.glossaryTooltip;if(id){const described=(active.getAttribute('aria-describedby')||'').split(/\s+/).filter(value=>value&&value!=='visionlab-term-tooltip');const description='glossary-description-'+id;if(!described.includes(description))described.push(description);active.setAttribute('aria-describedby',described.join(' '));}}active=null;};
    const close=(restore,all=false)=>{
      if(!all&&cardStack.length){
        const previous=cardStack.pop();card.innerHTML=previous.html;returnFocus=previous.origin;
        const nestedTarget=card.querySelector('[data-glossary-focus-key="'+previous.focusKey+'"]');
        if(nestedTarget){nestedTarget.removeAttribute('data-glossary-focus-key');nestedTarget.setAttribute('aria-expanded','false');}
        if(restore&&nestedTarget?.isConnected)nestedTarget.focus({preventScroll:true});
        return;
      }
      const origin=returnFocus;card.hidden=true;cardStack.length=0;
      document.querySelectorAll('[aria-expanded="true"][data-term-id],[aria-expanded="true"][data-glossary-open]').forEach(node=>node.setAttribute('aria-expanded','false'));
      if(restore&&origin?.isConnected)origin.focus({preventScroll:true});returnFocus=null;
    };
    const open=(target,id)=>{
      const item=byId[id];if(!item)return;clearTimeout(hideTimer);hideShort();
      if(card.hidden||!card.contains(target)){cardStack.length=0;returnFocus=target;}
      else{const focusKey='glossary-focus-'+(++nestedFocusSequence);target.setAttribute('data-glossary-focus-key',focusKey);cardStack.push({html:card.innerHTML,origin:returnFocus,focusKey});}
      target.setAttribute('aria-expanded','true');
      card.innerHTML='<button class="glossary-close" type="button" aria-label="关闭术语解释">×</button><span class="chapter-kicker">术语小卡</span><h2 id="glossary-card-title">'+escapeHtml(item.title)+'</h2><p class="glossary-plain">'+escapeHtml(item.plainExplanation)+'</p><div class="glossary-metaphor"><strong>例子与直觉</strong><p>'+escapeHtml(item.metaphor)+'</p></div>'+(item.contextNote?'<p class="glossary-context">'+escapeHtml(item.contextNote)+'</p>':'')+(item.formalDefinition?'<details class="glossary-formal"><summary>再看一步</summary><p>'+escapeHtml(item.formalDefinition)+'</p></details>':'')+'<a class="glossary-learn-more" href="#dictionary/'+escapeHtml(item.id)+'">打开完整词条 ↗</a><a class="glossary-learn-more" href="'+escapeHtml(item.learnMore)+'">去课程里继续学 ↗</a>';
      card.querySelectorAll('.glossary-plain,.glossary-metaphor,.glossary-context,.glossary-formal').forEach(region=>decorate(region,{allowGlossaryCard:true}));
      card.querySelectorAll('[data-term-id="'+id+'"],[data-glossary-open="'+id+'"]').forEach(node=>node.replaceWith(document.createTextNode(node.textContent||'')));
      card.hidden=false;position(card,returnFocus||target);card.querySelector('.glossary-close').focus({preventScroll:true});
    };
    const onPointerOver=event=>{const target=event.target.closest?.('[data-term-id],[data-glossary-open],[data-glossary-tooltip]');if(target)showShort(target);};
    const onPointerOut=event=>{const target=event.target.closest?.('[data-term-id],[data-glossary-open],[data-glossary-tooltip]');if(target&&!target.contains(event.relatedTarget)&&!tooltip.contains(event.relatedTarget))hideTimer=setTimeout(hideShort,90);};
    const onFocusIn=event=>{const target=event.target.closest?.('[data-term-id],[data-glossary-open],[data-glossary-tooltip]');if(target)showShort(target);};
    document.addEventListener('pointerover',onPointerOver);
    document.addEventListener('pointerout',onPointerOut);
    document.addEventListener('focusin',onFocusIn);
    document.addEventListener('click',event=>{
      const closeButton=event.target.closest('.glossary-close');if(closeButton){event.preventDefault();close(true);return;}
      const tooltipOnly=event.target.closest?.('[data-glossary-tooltip]');if(tooltipOnly&&!tooltipOnly.matches('[data-term-id],[data-glossary-open]'))hideShort();
      const target=event.target.closest?.('[data-term-id],[data-glossary-open]');
      if(target){event.preventDefault();event.stopPropagation();open(target,target.dataset.termId||target.dataset.glossaryOpen);return;}
      if(event.target.closest('.glossary-learn-more')){close(false,true);return;}
      if(!card.hidden&&!card.contains(event.target))close(false,true);
    },true);
    document.addEventListener('keydown',event=>{
      const target=event.target.closest?.('[data-term-id],[data-glossary-open]');
      if(target&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.stopPropagation();open(target,target.dataset.termId||target.dataset.glossaryOpen);return;}
      if(event.key==='Escape'&&!card.hidden){event.preventDefault();close(true);}
    });
    document.addEventListener('mouseover',event=>{if(event.target.closest('#visionlab-term-tooltip'))clearTimeout(hideTimer);});
    window.addEventListener('resize',()=>{if(active&&!tooltip.hidden)position(tooltip,active);if(!card.hidden&&returnFocus)position(card,returnFocus);});
    window.addEventListener('scroll',()=>{if(active&&!tooltip.hidden)position(tooltip,active);if(!card.hidden&&returnFocus)position(card,returnFocus);},{passive:true});
    const content=document.getElementById('content');if(content){decorate(content);new MutationObserver(records=>records.forEach(record=>{
      if(record.type==='characterData'){decorate(mutationRoot(record.target,content));return;}
      record.addedNodes.forEach(node=>{if(node.nodeType===Node.TEXT_NODE||node.nodeType===Node.ELEMENT_NODE)decorate(mutationRoot(node,content));});
    })).observe(content,{childList:true,subtree:true,characterData:true});}
    window.visionlabGlossary.initialized=true;
  }
  window.visionlabGlossary={items,byId,lookup,chip,search:renderSearch,matchesIn,termsIn,firstTerm,decorate,init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
