/* 新手主线、课前导读、课程依赖与稳定小节身份。加载于所有课件模块之后。 */
(()=>{
  const starts={
    'ai-foundations':{title:'从一张图片和一个问题开始',question:'模型到底怎样把输入变成答案？',why:'模型不是像人一样直接“看懂”图片，而是对数字执行一连串计算。理解输入、计算和输出，后面的训练才有落脚点。',example:'把 2 个输入数字按规则相乘再相加：3×2 + (−1)×1 + 1 = 6。这里的 6 是计算分数，还不是概率。',terms:['model','input','output','parameter','training']},
    tensor:{title:'先把数字放进有名字的格子里',question:'图片和一批图片在程序里是什么样子？',why:'深度学习程序处理的是数字数组。看懂每条轴代表什么，才能知道图像、批次和特征有没有摆对位置。',example:'形状 (2, 3) 表示 2 行、每行 3 个数，总共 6 个数。换成图像时，还要说明轴代表批次、通道、高度还是宽度。',terms:['tensor','axis','shape','dimension','index']},
    gradient:{title:'先想“怎样改一点会更好”',question:'模型算错后，参数该往哪个方向改？',why:'梯度把损失随参数变化的方向和幅度告诉训练过程；反向传播负责把这个信号算到各个参数。',example:'若损失 L=(w−3)²，当前 w=1，斜率是 −4。向斜率相反的方向移动一小步，会让 w 靠近 3，损失下降。',terms:['loss','derivative','gradient','backpropagation','gradient-descent']},
    network:{title:'先看一个会打分的小计算器',question:'神经元怎样把线索组合成一个分数？',why:'网络由许多带参数的小计算单元组成。先会算一个单元，才能理解一层和整张网络。',example:'输入 x=2，权重 w=1.5，偏置 b=−1：z=wx+b=2。z 是原始分数，可以是任意实数；需要概率时还要经过 Sigmoid 或 Softmax。',terms:['neuron','weight','bias','affine','logit','activation']},
    losses:{title:'先看答案如何一步步变成惩罚',question:'模型输出的数字，怎样判断“错得有多严重”？',why:'二分类和多分类的输出格式不同，损失也要匹配任务。先把分数变成概率、再和标签比较，就能看懂 BCE 与交叉熵。',example:'有猫/没猫的真实标签 y=1。原始分数 z=2 经 Sigmoid 得 p≈0.881，BCE=−ln(0.881)≈0.127。若同一个 p=0.8 却真实为 y=0，惩罚变为 −ln(0.2)≈1.609。',terms:['label','probability','logit','sigmoid','bce','softmax','cross-entropy','cross-entropy-loss']},
    optimizer:{title:'先看一次参数更新',question:'梯度怎样变成参数的下一次取值？',why:'梯度指出损失上升最快的方向，优化器按规则朝相反方向更新参数。学习率决定每次走多远。',example:'参数 w=1，梯度为 2，学习率 η=0.1：新值 w=1−0.1×2=0.8。这里仅演示最简单的梯度下降一步。',terms:['gradient','optimizer','learning-rate','sgd','momentum','adam']},
    training:{title:'把训练想成循环做小批练习',question:'一轮训练里，图片、标签、损失和参数怎么接起来？',why:'训练是一个重复流程：取一批样本、预测、计算差异、求更新信号、改参数，然后继续下一批。验证集用来检查表现，不用于这次参数更新。',example:'8 张训练图片，每批 2 张：一个 epoch 有 4 个批次。每个批次算一次损失并更新，验证图片单独用于观察模型有没有学到可推广的规律。',terms:['training-set','validation-set','batch','epoch','iteration','loss']},
    regularization:{title:'先比较练习成绩和新题成绩',question:'训练成绩很好，为什么新图片仍可能认错？',why:'模型可能记住训练图片里的偶然细节。把训练集与未参与更新的数据分开观察，才能发现这种记忆与真正学会规律的区别。',example:'训练集错误率从 10% 降到 1%，验证集错误率却从 12% 升到 25%，这是过拟合的信号之一；先检查数据划分，再考虑正则化方法。',terms:['training-set','validation-set','overfitting','regularization','dropout']},
    image:{title:'先把一张照片读成数字',question:'一个颜色像素在模型输入里长什么样？',why:'模型接收数值，不接收“红色”这个抽象词。颜色通道、图像大小和数值范围都要按训练约定整理。',example:'一个纯红 RGB 像素可写成 [255, 0, 0]。把 2×2 彩色图排成数组时，HWC 与 CHW 只是把高度、宽度、通道换了排列顺序。',terms:['pixel','rgb','channel','hwc','chw','normalization']},
    tasks:{title:'先问照片需要回答什么问题',question:'同一张图，为什么会有不同模型输出？',why:'任务决定模型应该输出什么：整张图一个类别、每个物体一个框，或每个像素一个类别。输出形式先于模型结构。',example:'一张街景图：分类回答“有车”；检测回答每辆车的位置和类别；分割则指出哪些像素属于每辆车。',terms:['classification','object-detection','segmentation','bounding-box','label']},
    cnn:{title:'先拿一个小滤波器看图像',question:'卷积为什么能找到边缘和局部图案？',why:'卷积核在图像不同位置重复做相同计算；同一组权重能在左上、右下都寻找相似局部模式。',example:'把 3×3 小窗口里的像素与同样大小的权重逐项相乘再相加，得到特征图的一个位置。窗口向右或向下移动，就得到更多位置的响应。',terms:['convolution','kernel','feature-map','conv-stride','padding']},
    pooling:{title:'先把一小块区域压成一个数',question:'池化怎样缩小特征图？',why:'较小的特征图需要更少后续计算，但会丢掉一部分精细位置。看一扇 2×2 窗口最容易理解这个取舍。',example:'窗口 [1, 4; 3, 2] 做最大池化得到 4；做平均池化得到 (1+4+3+2)/4=2.5。',terms:['pooling','feature-map','downsampling','axis']},
    augmentation:{title:'先看图片变了，标签要不要跟着变',question:'训练时把图片翻转后，原来的框还对吗？',why:'增强是制造有用的训练变化。几何变换会移动或改变目标位置，因此框和掩码必须同步变换。',example:'宽度归一化后的框中心 x=0.20，水平翻转后变成 1−0.20=0.80；框的宽、高和 y 不变。',terms:['sample','label','bounding-box','dataset','normalization']},
    iou:{title:'先量两个矩形重叠多少',question:'怎样判断预测框和真实框有多接近？',why:'框的中心和大小都可能不同。IoU 用交集占并集的比例把这种重叠变成 0 到 1 之间的数。',example:'两个框面积各 100，重叠面积 50，并集面积=100+100−50=150，所以 IoU=50/150≈0.333。',terms:['bounding-box','iou','intersection','union']},
    metrics:{title:'先数清正确、误报和漏报',question:'只看准确率够不够评价检测器？',why:'目标数量不平衡时，整体正确比例会掩盖漏掉少数类别的问题。Precision 和 Recall 分别从报出的结果、真实目标出发。',example:'共有 10 个真实目标，模型报出 8 个，其中 6 个正确：Precision=6/8=75%，Recall=6/10=60%。',terms:['true-positive','false-positive','false-negative','precision','recall','f1']},
    'data-quality':{title:'先确认图片真的代表新场景',question:'数据很多，是否就说明数据足够好？',why:'大量相似照片并不等于丰富经验。若相邻视频帧同时进入训练和验证，模型可能记住背景，让验证成绩虚高。',example:'100 张图若来自同一段连拍，彼此很相似；按拍摄视频分组后再划分，能更真实地检查模型遇到新场景时的表现。',terms:['dataset','training-set','validation-set','sample','overfitting']},
    dataset:{title:'先看一张照片对应哪些文件',question:'YOLO 数据集里图片、标签和 YAML 各负责什么？',why:'图片提供模型输入，标签说明类别和位置，YAML 告诉训练程序去哪里找数据、类别名称如何排序。',example:'一张 1000×500 图片配一行 `0 0.50 0.40 0.20 0.16`：类别 0，框中心 (500,200)，宽 200、高 80。',terms:['dataset','label','bounding-box','normalization','yaml','path']},
    anchors:{title:'先给目标一个网格位置和尺寸模板',question:'检测器怎样决定从哪里开始猜框？',why:'网格提供位置参考，anchor 提供宽高模板；网络再预测相对模板的调整。它们是候选生成与训练匹配的一种设计。',example:'32×24 的模板可以先对照 40×30 的目标；中心是否落在某格、宽高是否相近，会影响训练时如何分配候选。',terms:['grid','anchor','candidate-box','positive-sample','negative-sample']},
    'yolo-loss':{title:'把一个候选框拆成三个问题',question:'YOLO 为什么有 box、objectness 和 class 多项损失？',why:'一个预测可能位置偏、漏判物体存在，也可能把类别认错。分开监督能让训练分别处理“在哪、有没有、是什么”。',example:'候选框位置正确但类别错：定位项可能较好，类别项仍会惩罚；背景位置报出高 objectness，则会增加背景误报相关惩罚。',terms:['bounding-box','objectness','class-score','iou','cross-entropy','bce']},
    'train-yolo':{title:'先认识终端里的命令和文件',question:'训练命令里的每个参数到底告诉程序什么？',why:'命令行不是神秘代码；它只是把数据路径、起始权重、图片尺寸和训练轮次写成明确选项。先跑短程检查，再开始长训练。',example:'`--data data/myset.yaml` 指向数据说明文件，`--img 640` 选择输入边长，`--batch 8` 表示一次处理 8 张图。路径需从项目根目录核对。',terms:['command-line','working-directory','yaml','pretrained-weights','batch']},
    'yolo-augment':{title:'先看一张训练图怎样被改变',question:'Mosaic、颜色变化和图片尺寸分别改变什么？',why:'增强改变模型看到的训练样子；尺寸影响小目标细节和计算量。增强后的标注也必须与图像变化一致。',example:'四张图片 Mosaic 成一张新图时，每个目标框都要平移、缩放并裁切到新画布；imgsz 长宽各加倍，像素数会变为原来的 4 倍。',terms:['training','sample','bounding-box','normalization','hyperparameter']},
    inference:{title:'让同一张图片走完预测流程',question:'模型输出为什么还不是最终检测框？',why:'输入需按训练约定缩放和整理；模型产生原始分数后，还要解码坐标、筛选低分结果、去掉重复框并还原原图坐标。',example:'一张 640×480 图片先缩放和补边到 640×640，检测后再撤销补边和比例，才能把框画回 640×480 原图。',terms:['inference','pretrained-weights','decode','confidence-threshold','nms','bounding-box']},
    debugging:{title:'先按现象找到断在哪一步',question:'训练跑完了，为什么预测仍然为空？',why:'空结果可能出在路径、类别、预处理、分数门槛或后处理；按流程逐步检查，比一次乱改很多参数更容易定位。',example:'先确认加载了预期权重和图片；再看是否有低分候选；最后检查置信度门槛与 NMS。`None` 表示没有值，`0` 是数值，`NaN` 表示无效数值，三者不同。',terms:['inference','candidate-box','confidence-threshold','nms','none','nan']},
    transfer:{title:'先看旧模型和新任务哪里相同',question:'已有模型怎样帮助一个数据较少的新任务？',why:'预训练模型已经学到一些通用视觉线索。迁移学习从这些参数起步，再把输出部分换成新任务需要的答案。',example:'先冻结特征提取部分、只训练新的分类头；若验证集仍欠拟合，再逐步解冻部分层并用较小学习率微调。',terms:['pretrained-weights','backbone','parameter','training-set','validation-set']},
    quaternion:{title:'先把三维朝向当作一支箭头',question:'物体转了以后，向量的方向怎样改变？',why:'三维旋转可以用欧拉角、四元数或矩阵表示。它们描述同一个几何动作，但有不同的组合、插值和奇异点特性。',example:'绕 z 轴逆时针旋转 90°，向量 (1,0,0) 会转到约 (0,1,0)。先约定坐标系、角度单位和旋转顺序。',terms:['vector','euler-angles','quaternion','rotation-matrix','radian']},
    architecture:{title:'先用三个动作读懂整张网络',question:'YOLOv5l 从图片到检测框经过什么？',why:'先看“提取线索→融合线索→给出答案”的数据流，再读层号和 YAML，能知道每个模块为什么在这里。',example:'Backbone 把 640×640 图像逐步缩小并提取特征；Neck 融合浅层位置细节与深层语义；Detect Head 在 P3/P4/P5 预测候选框和类别。',terms:['backbone','neck','head','feature-map','fpn','pan','c3','sppf']},
  };

  const beginnerSteps={
    'ai-foundations':[['输入先变成数字','图片或文字先整理成数字，模型才能按规则处理。'],['模型按参数计算','权重和偏置决定每一步怎样把输入组合成分数。'],['结果还要对照答案','训练时把预测与标签比较，再调整参数；使用学到的参数处理新例子叫推理。']],
    tensor:[['先数清有几组数字','一个数、一串数、表格和多层分组，都可以用形状描述。'],['给每条轴起名字','批次、颜色通道、高度和宽度各代表一种分组方向。'],['再做运算和取值','矩阵相乘、索引或改形状前，先检查每条轴的长度与含义。']],
    network:[['一个节点先做乘加','每个输入乘上自己的权重，再把结果相加并加偏置。'],['得到的是原始分数','这个分数叫 logit，可以小于零，也不一定在 0 到 1 之间。'],['需要概率时再转换','二分类常用 Sigmoid，多类互斥选择常用 Softmax；接着才计算损失。']],
    losses:[['先确认任务和标准答案','一个“有/没有”的问题用一个 0 或 1 标签；多类互斥选择用一个类别编号。'],['模型先给原始分数','logit 还不是概率；二分类可经 Sigmoid，多类可经 Softmax 得到概率。'],['损失按正确答案评分','BCE 处理二分类概率，交叉熵处理互斥多分类；从 logits 训练时使用匹配的稳定接口。']],
    gradient:[['看参数变一点会怎样','把一个参数略微调大或调小，观察损失随之升高还是降低。'],['梯度总结变化方向','梯度像坡面方向提示；沿相反方向走小步，通常能让当前损失下降。'],['反向传播算出每个方向','它从损失开始沿计算步骤把梯度传回参数，再交给优化器更新。']],
    optimizer:[['先拿到参数的梯度','梯度告诉我们参数往哪边改会让损失上升。'],['选择更新规则和步长','SGD、动量和 Adam 使用不同的历史信息来稳定或调整更新。'],['做一次可计算的更新','学习率控制步子大小；更新后再用新参数处理下一批数据。']],
    training:[['一次拿一小批样本','数据加载器把图片与标签整理成一个 batch。'],['预测、比较、求更新信号','模型产生预测，损失与标签比较，反向传播算出梯度。'],['重复训练并检查新题','更新参数后继续下一批；每轮结束在验证集检查泛化表现。']],
    regularization:[['训练分数不是最终成绩','模型在训练图片上表现好，不代表遇到新图片也能做好。'],['对照训练和验证表现','训练误差下降而验证误差上升，可能说明模型记住了训练细节。'],['限制记忆并保留最佳状态','数据增强、权重约束、Dropout 或早停可帮助控制拟合；用验证结果选模型。']],
    image:[['一个像素就是几个数','RGB 图片的一个像素由红、绿、蓝三个数描述。'],['整张图是按轴排好的数字','图像宽高、颜色通道和批次的顺序要与模型约定一致。'],['预处理后再交给模型','缩放、补边、换通道或归一化都要按训练时相同的规则进行。']],
    tasks:[['先问模型需要回答什么','整张图属于哪类、每个物体在哪里、哪些像素属于目标，是不同问题。'],['答案形式跟着任务变','分类输出类别；检测输出框与类别；分割输出逐像素区域。'],['再选结构与评估方式','任务不同，标签、模型输出和衡量成绩的方法也不同。']],
    cnn:[['小滤镜只看局部','卷积核在一个小窗口内逐项相乘再相加，形成一个输出数。'],['同一组权重滑过整张图','窗口在不同位置重复相同计算，寻找相似的边缘或纹理。'],['许多输出组成特征图','多组滤镜生成多个通道，供后续网络组合成更复杂的线索。']],
    pooling:[['圈定一个小窗口','例如 2×2 区域里有四个数，先看清当前窗口覆盖哪里。'],['用一个数概括窗口','最大池化保留最大值，平均池化计算四个数的平均值。'],['尺寸变小也会丢细节','池化减少后续计算，但目标的精细位置也可能变得不清楚。']],
    iou:[['用坐标写出两个框','先确认坐标原点、x/y 方向，以及框的数字代表中心还是角点。'],['找共同覆盖和总覆盖','交集是两个框重叠部分；并集是它们合起来覆盖的区域。'],['用交并比衡量重叠','交集面积除以并集面积得到 IoU，越接近 1 表示重叠越多。']],
    dataset:[['每张图片对应答案文件','标签写明目标类别和位置，类别编号要对应名称表。'],['把像素坐标换成比例','YOLO 标签的中心位置与宽高除以图像尺寸，变成 0 到 1 附近的比例。'],['训练前检查整套目录','核对图片、标签、类别顺序和 YAML 路径，再可视化抽查框是否贴合。']],
    augmentation:[['先只改变图片的一件事','例如左右翻转或调亮度，观察目标外观怎样变化。'],['几何变化要同步改标签','图片翻转或裁切后，框的位置和大小也要一起变换。'],['确认变化仍符合现实','增强要增加有用变化，不能把类别含义或标注关系弄错。']],
    metrics:[['逐个对照预测与目标','正确匹配记为 TP，错误报出记为 FP，漏掉真实目标记为 FN。'],['分别看报出质量和找回比例','Precision 看报出的有多少正确；Recall 看真实目标找到多少。'],['改变门槛看取舍','门槛改变会同时影响误报和漏报；检测评估通常还汇总不同门槛下的表现。']],
    'data-quality':[['数据要代表将来使用场景','同一段视频的许多相似帧不等于许多不同经验。'],['按来源分组后再切分','同一拍摄序列放进同一个划分，避免近重复图片同时出现在训练和验证。'],['从错误案例找缺口','按类别、大小、遮挡和场景整理失败样本，再决定补数据或改流程。']],
    transfer:[['从已有参数开始','预训练模型已学到通用线索，可作为新任务的起点。'],['更换任务需要的输出','类别数或答案形式不同，通常要调整最后的预测部分。'],['先少改，再逐步放开','可以先冻结大部分参数训练新输出层，再按验证结果逐步微调。']],
    quaternion:[['先约定三维坐标和方向','明确原点、坐标轴、角度单位，以及正旋转的方向。'],['欧拉角按顺序转多个轴','轴的旋转顺序会影响结果，某些姿态还会让角度表示失去一个自由度。'],['四元数用四个数表示旋转','单位四元数可组合与插值姿态；它避开欧拉角的万向节锁表示问题，但仍需理解乘法约定。']],
    architecture:[['Backbone 从图片提线索','卷积和下采样逐层生成不同分辨率的特征。'],['Neck 融合深浅信息','路径把细位置信息和较大范围语义组合起来，形成多尺度特征。'],['Detect Head 给出候选预测','不同尺度分支分别预测位置、物体性和类别，再由后处理筛选结果。']],
    anchors:[['网格给位置一个参照','把图片切成格子，先找到目标中心大致落在哪个位置。'],['anchor 给出宽高起点','预设尺寸帮助网络从合适大小的框开始调整。'],['训练时决定哪些候选负责学习','根据位置和尺寸匹配正样本；背景或不匹配位置按规则作为其他训练样本。']],
    'yolo-loss':[['一个候选要回答三个问题','框的位置对不对、这里有没有物体、物体属于什么类别。'],['标签与预测形成不同损失','定位项比较框，物体性项判断目标存在，类别项比较目标类别。'],['损失合起来更新网络','各项按配置加权后反向传播；物体性目标和正样本分配以代码版本为准。']],
    'train-yolo':[['先把环境和路径准备好','进入正确仓库目录，安装相容依赖，并确认图片和标签能读到。'],['明确写出训练设置','数据配置、起始权重、图片尺寸和 batch 都影响实际运行。'],['先小规模试跑再加量','短训练检查损失、显存、标签和验证结果，再安排正式训练。']],
    'yolo-augment':[['区分不同增强做了什么','Mosaic 拼合多张图，HSV 改变颜色，尺寸设置改变输入分辨率。'],['图片变换时让框同行','裁切、缩放和翻转都必须同步更新目标框。'],['一次比较一种设置','固定数据与其他参数，只改变一个选项，再看验证指标和错误图片。']],
    inference:[['先按训练规则处理输入','调整尺寸、颜色通道和值域，确保模型收到兼容的数字。'],['网络输出的是候选分数','还要把位置换算回图片坐标，并根据门槛去除低分结果。'],['合并重复框并核对原图','NMS 等后处理减少重复框，最后撤销缩放/补边并检查画框位置。']],
    debugging:[['先明确看到的异常','例如没有预测框、类别错或训练损失变成 NaN。'],['沿数据流逐步检查','核对文件路径和标签，再看预处理、模型输出、分数门槛与后处理。'],['一次只改一个原因','保存改动前的日志和图片，用最小复现确认哪一步改变了结果。']]
  };

  const prerequisites={
    'ai-foundations':[],tensor:['ai-foundations'],network:['tensor'],losses:['network'],gradient:['network','losses'],optimizer:['gradient','losses'],training:['optimizer'],regularization:['training'],
    image:['tensor'],tasks:['image'],cnn:['image','tasks'],pooling:['cnn'],iou:['tasks'],dataset:['image','iou'],augmentation:['dataset'],metrics:['iou'],
    'data-quality':['dataset','metrics'],transfer:['cnn','training'],quaternion:[],architecture:['cnn','pooling'],anchors:['architecture','dataset'],'yolo-loss':['losses','anchors'],'train-yolo':['dataset','architecture','yolo-loss'],'yolo-augment':['train-yolo','dataset'],inference:['train-yolo','architecture'],debugging:['inference','metrics']
  };
  const prerequisiteSections={
    tensor:{'ai-foundations':'先看输入'},network:{tensor:'数据先有形状'},losses:{network:'神经元是带参数的函数'},
    gradient:{network:'神经元是带参数的函数',losses:'损失函数是可计算的学习目标'},
    optimizer:{gradient:'一次更新的完整时间顺序',losses:'损失函数是可计算的学习目标'},training:{optimizer:'梯度是信号'},
    regularization:{training:'用曲线判断训练发生了什么'},image:{tensor:'数据先有形状'},tasks:{image:'图像不是一个固定格式'},
    cnn:{image:'图像不是一个固定格式',tasks:'视觉任务决定答案的粒度'},pooling:{cnn:'用一个小滤波器'},iou:{tasks:'视觉任务决定答案的粒度'},
    dataset:{image:'图像不是一个固定格式',iou:'先把边界框表示清楚'},augmentation:{dataset:'标注协议先于训练参数'},
    metrics:{iou:'算一个具体例子'},'data-quality':{dataset:'数据划分要阻断泄漏',metrics:'Precision 与 Recall'},
    transfer:{cnn:'用一个小滤波器',training:'训练模式与评估模式'},architecture:{cnn:'用一个小滤波器',pooling:'池化把邻域压缩'},
    anchors:{architecture:'一次检测经过三个功能阶段',dataset:'标注协议先于训练参数'},
    'yolo-loss':{losses:'损失函数是可计算的学习目标',anchors:'网格位置提供候选参考点'},
    'train-yolo':{dataset:'开训前的五项体检',architecture:'本地 YAML 中的 C3 与 SPPF','yolo-loss':'检测要同时学位置'},
    'yolo-augment':{'train-yolo':'先把训练命令理解成实验记录',dataset:'图片与标签一一对应'},
    inference:{'train-yolo':'日志、损失与 checkpoint',architecture:'从配置走到一次前向预测'},
    debugging:{inference:'推理把图像送回训练过的模型',metrics:'Precision 与 Recall'}
  };
  const codeGuides={
    tensor:{where:'装有 PyTorch 的 Python 环境。',input:'代码里创建的小型数值张量。',output:'每一步打印的形状、数值或索引结果。'},
    gradient:{where:'装有 PyTorch 的 Python 环境。',input:'一组输入、目标值和可训练参数。',output:'损失、梯度，以及更新后的参数。'},
    network:{where:'装有 PyTorch 的 Python 环境。',input:'形状符合示例说明的一批数值。',output:'网络各层的输出形状、原始分数或预测值。'},
    losses:{where:'装有 PyTorch 的 Python 环境；公式互动可直接在网页操作。',input:'模型原始分数 logits 与类别编号或 0/1 标签。',output:'单样本或一批样本的损失数值。'},
    optimizer:{where:'装有 PyTorch 的 Python 环境。',input:'参数、梯度和学习率。',output:'应用更新规则后的参数数值。'},
    training:{where:'装有 PyTorch 的 Python 环境；本章简化示例使用内存中的小数据。',input:'样本、标签、模型、损失与优化器。',output:'每轮损失和验证结果。'},
    regularization:{where:'装有 PyTorch 的 Python 环境；曲线示例在网页中绘制。',input:'训练与验证误差序列。',output:'拟合、过拟合或欠拟合的对照信号。'},
    image:{where:'Python 环境；涉及 OpenCV 的部分需安装 opencv-python。',input:'小数组或本地图片。',output:'通道顺序、形状和像素范围。'},
    cnn:{where:'装有 PyTorch 的 Python 环境；部分例题为手算小数组。',input:'小图像张量和卷积核。',output:'卷积后的特征图形状和值。'},
    quaternion:{where:'Python 环境；若运行 SciPy 示例，需安装 scipy。',input:'旋转轴、角度与一个三维向量。',output:'四元数分量及旋转后的向量。'},
    dataset:{where:'无需运行训练；互动标注图可在网页操作。',input:'图片尺寸、框坐标和类别表。',output:'一行可读的 YOLO 标签及对应 YAML 配置。'},
    anchors:{where:'无需预装模型；网页互动使用教学用网格和尺寸。',input:'真实框宽高、网格步幅和 anchor 尺寸。',output:'候选匹配关系与尺度比较。'},
    architecture:{where:'阅读网页中的本地 YOLOv5l YAML；若运行网络摘要，需配置 YOLOv5 Python 环境。',input:'`models/yolov5l.yaml` 和 640×640 输入示例。',output:'各层输入输出形状与 P3/P4/P5 特征。'},
    'train-yolo':{where:'在 YOLOv5 仓库根目录打开终端，并激活已配置好的 Python 环境。',input:'数据集 YAML、模型配置或预训练权重、图片尺寸与 batch 设置。',output:'训练日志、验证指标和 `runs/train/` 下的权重文件。'},
    'yolo-augment':{where:'网页互动可直接操作；真实训练需在 YOLOv5 环境中。',input:'原图、框标注和一次增强设置。',output:'变换后的图片与同步更新的标签。'},
    'yolo-loss':{where:'源码片段需对照 YOLOv5 仓库的 `utils/loss.py`；概念图可直接在网页操作。',input:'模型候选、真实框和类别标签。',output:'box、objectness、classification 分项。'},
    inference:{where:'YOLOv5 仓库根目录的 Python 环境；网页流程图仅演示步骤。',input:'权重文件和待检测图片。',output:'筛选后的类别、分数与原图坐标框。'},
    debugging:{where:'在出现问题的项目环境里运行；先保存命令、路径和报错文本。',input:'一次失败的训练日志或空预测图片。',output:'按数据、前向预测、阈值和后处理逐段缩小范围。'},
    transfer:{where:'装有 PyTorch 或对应检测仓库的 Python 环境。',input:'预训练权重、新任务类别数和训练/验证数据。',output:'冻结或微调后的参数以及验证结果。'},
  };

  const playgroundIndices={
    dataset:{0:'dataset-labels',4:'dataset-readiness'},'train-yolo':{2:'yolo-training-log'},architecture:{1:'architecture-scales'},network:{1:'activation-curves'},
    tensor:{1:'tensor-operations',4:'tensor-transpose',8:'tensor-explorer'},
    losses:{},
    optimizer:{0:'optimizer-update'},pooling:{0:'pooling-window'},training:{3:'training-loop'},tasks:{1:'task-output-map'},augmentation:{0:'augmentation-transform'},anchors:{1:'anchor-matching'},'yolo-loss':{3:'yolo-loss-breakdown'},
    quaternion:{1:'quaternion-rotation',4:'euler-rotation',5:'gimbal-lock',6:'rotation-comparison'}
  };
  const allLessons=typeof lessons!=='undefined'?lessons:(window.lessons||[]);
  const allGroups=typeof groups!=='undefined'?groups:(window.groups||{});
  if(!window.lessons)window.lessons=allLessons;
  if(!window.groups)window.groups=allGroups;
  function stableSectionId(lessonId,title,used){
    const normalized=String(title||'').replace(/^\s*\d+\s*[.、．]\s*/,'').normalize('NFKC').trim().toLocaleLowerCase();
    let hash=2166136261;for(let i=0;i<normalized.length;i++){hash^=normalized.charCodeAt(i);hash=Math.imul(hash,16777619);}
    const base=lessonId+'-s-h'+(hash>>>0).toString(36);let id=base,suffix=2;while(used.has(id))id=base+'-'+suffix++;
    used.add(id);return id;
  }
  function buildPrerequisiteLinks(lesson){
    return (prerequisites[lesson.id]||[]).map(id=>{
      const item=allLessons.find(candidate=>candidate.id===id);if(!item)return null;
      const prefix=prerequisiteSections[lesson.id]?.[id];
      const section=prefix?item.sections.find(candidate=>String(candidate.title||'').replace(/^\s*\d+\s*[.、．]\s*/,'').startsWith(prefix)):null;
      return {id,title:item.title,href:'#lesson/'+id+(section&&section.id?'/section-'+section.id:'')};
    }).filter(Boolean);
  }
  allLessons.forEach(lesson=>{
    const usedSectionIds=new Set();
    lesson.sections.forEach((section,index)=>{
      section.legacyIndex=index;
      section.id=stableSectionId(lesson.id,section.title,usedSectionIds);
      section.playgroundId=playgroundIndices[lesson.id]?.[index]||'';
      section.depth='';
    });
    lesson.foundation=starts[lesson.id];
    lesson.prereqLinks=[];
    if(codeGuides[lesson.id])lesson.codeGuide=codeGuides[lesson.id];
    else if(lesson.code)lesson.codeGuide={where:lesson.language==='源码流程示意'?'阅读本章对应的源码文件；这里的摘要帮助你定位方法和数据流。':lesson.group==='yolo'?'在 YOLOv5 仓库根目录的终端运行，并先激活配置好的 Python 环境。':'在本地 Python 环境运行；先确认代码中 import 的库已经安装。',input:'逐行确认示例实际使用的变量、图片或文件路径；路径从当前工作目录开始核对。',output:'先看最后的 print、返回值或生成文件，再对照本章图解检查数值与形状。'};
  });
  // Build links only after every lesson has received its stable section IDs.
  allLessons.forEach(lesson=>{lesson.prereqLinks=buildPrerequisiteLinks(lesson);});

  // The beginner reading chain presents binary output and BCE before the Softmax / CE chain.
  const lossLesson=allLessons.find(lesson=>lesson.id==='losses');
  if(lossLesson){
    const original=lossLesson.sections;
    const order=[0,1,7,3,6,8,9,2,4,5,...Array.from({length:Math.max(0,original.length-10)},(_,i)=>i+10)];
    lossLesson.sections.splice(0,lossLesson.sections.length,...order.map(index=>original[index]));
    lossLesson.sections.forEach((section,index)=>{section.title=section.title.replace(/^\s*\d+\s*[.、．]\s*/,String(index+1)+'. ');});
  }
  for(const [lessonId,indices] of Object.entries({gradient:[0,4,1,2,3,5,6,7],tensor:[0,2,8,6,7,1,4,5,3],cnn:[0,4,1,2,3,...Array.from({length:18},(_,i)=>i+5)]})){
    const lesson=allLessons.find(item=>item.id===lessonId);if(!lesson||indices.length!==lesson.sections.length)continue;
    const original=lesson.sections.slice();lesson.sections.splice(0,lesson.sections.length,...indices.map(index=>original[index]));
  }

  // Bind optional material and loss-course interactives by section title after
  // every reorder. Numeric positions silently hid core material or moved demos.
  const titleOf=section=>String(section?.title||'').replace(/^\s*\d+\s*[.、．]\s*/,'').trim();
  const optimizerLesson=allLessons.find(lesson=>lesson.id==='optimizer');
  const batchSection=optimizerLesson?.sections.find(section=>titleOf(section).startsWith('Batch 与权重衰减'));
  if(batchSection?.paragraphs?.length>=2){
    const weightDecayParagraph=batchSection.paragraphs[1];
    batchSection.paragraphs=[batchSection.paragraphs[0],'把训练集固定为 N 个样本，batch 从 B 增到 2B 后，每轮更新次数通常约减半。即便 epoch 相同，优化器走过的次数和学习率计划进度也可能不同，所以比较时要同时记录样本数、更新数和实际学习率曲线。'];
    batchSection.advancedBlocks=[...(batchSection.advancedBlocks||[]),{title:'权重衰减与 AdamW 的进阶细节',paragraphs:[weightDecayParagraph]}];
  }
  if(optimizerLesson){
    optimizerLesson.starterCode='# 先用一个数字看清普通 SGD 的更新\nweight = 1.0\ngradient = 2.0\nlearning_rate = 0.1\n\n# 新参数 = 旧参数 - 学习率 × 梯度\nweight = weight - learning_rate * gradient\nprint(weight)  # 0.8';
    optimizerLesson.codeGuide={where:'无需安装 PyTorch；可在普通 Python 解释器中运行，也可以逐行手算。',input:'旧参数 1.0、梯度 +2.0、学习率 0.1。',output:'参数更新到 0.8；这个最小例子只演示一次 SGD 更新，不代表完整训练循环。'};
  }
  const optionalSections={
    tensor:['连续性：什么时候需要复制数据','内存、shape、张量内存步幅与 offset 如何协作'],
    network:['SiLU 与 GELU：','SwiGLU：','比较 SwiGLU'],
    optimizer:['权重衰减、L2 惩罚和 AdamW','按优化器实际更新次数安排调度与裁剪'],
    training:['推理文件与续训检查点','点选一个后缀','PyTorch 常见保存后缀','量化不是文件后缀','文件后缀、文件格式与量化','切换本地模型和托管 API','本地推理与云端 API','尾批与平均损失','梯度累积的最后一组'],
    tasks:['关键点任务：','图像生成与图像复原：','Backbone + Neck / Decoder'],
    cnn:['LeNet-5：','AlexNet：','VGG：','残差连接：','把残差块接对：','用计算跟踪感受野：','理论感受野与有效感受野：','小目标与大目标：','交互延伸：'],
    losses:['一个结果越少见，带来的信息越多','信息量：越不可能','熵与交叉熵：','把“数据本身的不确定','手算分类误差信号：','从 logits 到参数更新','mean、sum 和形状广播：','极端 logits：']
  };
  for(const lesson of allLessons){
    for(const section of lesson.sections){
      const title=titleOf(section);
      if((optionalSections[lesson.id]||[]).some(prefix=>title.startsWith(prefix)))section.depth='advanced';
    }
  }
  const lossLessonAfterReorder=allLessons.find(lesson=>lesson.id==='losses');
  if(lossLessonAfterReorder){
    const stableLossDemos=[
      ['回归损失对大误差','loss-regression'],
      ['Softmax 把互斥类别分数','loss-softmax'],
      ['信息量：越不可能','loss-information'],
      ['熵与交叉熵：','loss-entropy'],
      ['独热标签与多分类交叉熵','loss-cross-entropy'],
      ['二分类、多分类与多标签','loss-bce'],
      ['类别不平衡与损失数值','loss-imbalance'],
      ['从 logits 到参数更新','loss-update']
    ];
    for(const section of lossLessonAfterReorder.sections)section.playgroundId='';
    for(const [prefix,playgroundId] of stableLossDemos){
      const section=lossLessonAfterReorder.sections.find(candidate=>titleOf(candidate).startsWith(prefix));
      if(section)section.playgroundId=playgroundId;
    }
  }

  // Keep learning progress and section-exercise answers from both legacy numeric and generated-index anchors.
  for(const lesson of allLessons){
    const savedSection=state.lastSection?.[lesson.id];
    const escapedLessonId=lesson.id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const legacyMatch=new RegExp('^section-(?:'+escapedLessonId+'-s(\\d+)|(\\d+))$').exec(String(savedSection||''));
    if(legacyMatch){const sectionNumber=Number(legacyMatch[1]||legacyMatch[2]);const section=lesson.sections.find(item=>item.legacyIndex===sectionNumber-1);if(section)state.lastSection[lesson.id]='section-'+section.id;}
    for(const [key,value] of Object.entries(state.exerciseAnswers||{})){
      const match=new RegExp('^'+escapedLessonId+':section:(?:'+escapedLessonId+'-s(\\d+)|(\\d+))$').exec(key);
      if(!match)continue;
      const oldIndex=match[1]?Number(match[1])-1:Number(match[2]);
      const section=lesson.sections.find(item=>item.legacyIndex===oldIndex);
      if(section){const stableKey=lesson.id+':section:'+section.id;if(!(stableKey in state.exerciseAnswers))state.exerciseAnswers[stableKey]=value;delete state.exerciseAnswers[key];}
    }
  }

  // Put dependent lessons after the concepts they use.
  const order=['ai-foundations','tensor','network','losses','gradient','optimizer','training','regularization','image','tasks','cnn','pooling','iou','dataset','augmentation','metrics','data-quality','transfer','architecture','anchors','yolo-loss','train-yolo','yolo-augment','inference','debugging','quaternion'];
  const byId=new Map(allLessons.map(lesson=>[lesson.id,lesson]));
  if(order.length===allLessons.length)allLessons.splice(0,allLessons.length,...order.map(id=>byId.get(id)).filter(Boolean));
  const transfer=allLessons.find(lesson=>lesson.id==='transfer');if(transfer)transfer.group='cv';
  const dataset=allLessons.find(lesson=>lesson.id==='dataset');if(dataset)dataset.group='cv';
  const quaternion=allLessons.find(lesson=>lesson.id==='quaternion');if(quaternion){quaternion.level='选修专题';quaternion.optional=true;}
  if(allGroups.dl)allGroups.dl.desc='先认识网络怎样计算，再学习损失、梯度、更新和训练。';
  if(allGroups.cv)allGroups.cv.desc='从像素和视觉任务开始，学习卷积、标注、评估，再进入迁移与选修旋转专题。';
  if(allGroups.yolo)allGroups.yolo.desc='先看懂 YOLOv5 的模块和候选框，再学习损失、训练、推理与排错。';

  function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
  function termChip(id){return window.visionlabGlossary?.chip(id)||'';}
  function renderStart(lesson){
    const item=lesson?.foundation;if(!item)return '';
    const steps=beginnerSteps[lesson.id]||[],stepMarkup=steps.length?'<ol class="zero-start-steps" aria-label="本课零基础学习步骤">'+steps.map((step,index)=>'<li><span aria-hidden="true">'+(index+1)+'</span><div><strong>'+escapeHtml(step[0])+'</strong><p>'+escapeHtml(step[1])+'</p></div></li>').join('')+'</ol>':'';
    return '<section class="zero-start-card" aria-labelledby="zero-start-'+escapeHtml(lesson.id)+'"><div class="zero-start-heading"><span class="chapter-kicker">ZERO-FOUNDATION · 零基础起点</span><h2 id="zero-start-'+escapeHtml(lesson.id)+'">'+escapeHtml(item.title)+'</h2><p class="zero-start-question">'+escapeHtml(item.question)+'</p></div><div class="zero-start-grid"><div class="zero-start-purpose"><strong>这节要解决什么</strong><p>'+escapeHtml(item.why)+'</p></div><div class="zero-start-example"><strong>先算一个小例子</strong><p>'+escapeHtml(item.example)+'</p></div></div><div class="zero-start-steps-wrap"><strong>按这个顺序理解</strong>'+stepMarkup+'</div><div class="zero-start-terms"><strong>遇到新词可以点开看解释</strong><div>'+item.terms.map(termChip).join('')+'</div></div></section>';
  }
  function renderLossChain(){
    const lesson=allLessons.find(item=>item.id==='losses');
    const steps=[
      {prefix:'二分类、多分类与多标签',title:'先看标签和题型',text:'标签是标准答案；先判断是“是/否”、单选，还是可多选。'},
      {prefix:'二分类、多分类与多标签',title:'从原始分数到概率',text:'二分类用 Sigmoid；互斥多分类把整组 logits 交给 Softmax。'},
      {prefix:'Softmax 把互斥类别分数',title:'按正确答案计算惩罚',text:'二分类看 BCE；单标签多分类看真实类别的交叉熵。'},
      {prefix:'独热标签与多分类交叉熵',title:'最后选择训练接口',text:'根据输入是概率还是 logits 选择 PyTorch 接口；代码细节在对应小节。'}
    ];
    const links=steps.map((step,index)=>{
      const section=lesson?.sections.find(item=>String(item.title||'').replace(/^\s*\d+\s*[.、．]\s*/,'').startsWith(step.prefix));
      const href=section?.id?'#lesson/losses/section-'+section.id:'#lesson/losses';
      return '<li><b aria-hidden="true">'+(index+1)+'</b><a href="'+escapeHtml(href)+'"><strong>'+escapeHtml(step.title)+'</strong><p>'+escapeHtml(step.text)+'</p></a></li>';
    }).join('');
    return '<section class="loss-foundation-chain" aria-labelledby="loss-foundation-title"><div class="loss-chain-heading"><span class="chapter-kicker">本章阅读地图</span><h2 id="loss-foundation-title">从标签，按顺序走到训练接口</h2><p>上面的零基础讲解已经逐步算过这些概念；点击一格可直接跳到正文对应小节。</p></div><ol class="loss-chain-steps">'+links+'</ol><div class="loss-chain-note"><strong>推荐顺序</strong><span>标签与题型 → 原始分数与概率 → BCE / 交叉熵 → PyTorch 接口。信息量、熵、KL、梯度和极端数值列为选学内容。</span></div></section>';
  }  function sigmoid(value){return value>=0?1/(1+Math.exp(-value)):Math.exp(value)/(1+Math.exp(value));}
  function updateBce(root){
    const slider=root.querySelector('[data-bce-logit]');if(!slider)return;
    const z=Number(slider.value),p=sigmoid(z),y=Number(root.dataset.target||1),safe=Math.min(1-1e-12,Math.max(1e-12,p)),loss=-(y*Math.log(safe)+(1-y)*Math.log1p(-safe));
    root.querySelector('[data-bce-logit-value]').textContent=z.toFixed(1);
    root.querySelector('[data-bce-probability]').textContent=p.toFixed(3)+'（'+(p*100).toFixed(1)+'%）';
    root.querySelector('[data-bce-loss-value]').textContent=loss.toFixed(3);
    root.querySelectorAll('[data-bce-target]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.bceTarget)===y)));
    root.querySelector('[data-bce-target-label]').textContent=y===1?'真实答案：有猫（y=1），只看 −ln(p)':'真实答案：没猫（y=0），只看 −ln(1−p)';
  }
  function renderBce(){
    return '<section class="loss-bce-playground" data-bce-playground data-target="1" aria-labelledby="bce-play-title"><div><span class="chapter-kicker">动手试：分数和真实答案一起决定惩罚</span><h3 id="bce-play-title">拖动 logit，切换正确答案</h3><p>同一个概率，对应的惩罚会因为真实标签不同而变化。下方只演示一个样本；真实训练还会按批次汇总。</p></div><label class="bce-slider-label" for="bce-logit-range">原始分数 z <output data-bce-logit-value>2.0</output><input id="bce-logit-range" data-bce-logit type="range" min="-4" max="4" step="0.1" value="2" aria-label="调整模型原始分数"></label><div class="bce-label-switch" role="group" aria-label="选择真实标签"><button type="button" data-bce-target="1" aria-pressed="true">真实答案：有猫</button><button type="button" data-bce-target="0" aria-pressed="false">真实答案：没猫</button></div><div class="bce-live-values" aria-live="polite"><span>模型给“有猫”的概率 <strong data-bce-probability>0.881（88.1%）</strong></span><span data-bce-target-label>真实答案：有猫（y=1），只看 −ln(p)</span><span>单样本 BCE <strong data-bce-loss-value>0.127</strong></span></div><div class="bce-comparison"><p><strong>固定 p=0.8 时：</strong>标签 y=1 → −ln(0.8)=0.223；标签 y=0 → −ln(0.2)=1.609。</p><p>数学式：L=−[y ln(p)+(1−y)ln(1−p)]。y 只能是 0 或 1；p 是模型给正类的概率。</p></div><div class="bce-api-note"><span>'+termChip('bce-loss')+'</span><p>输入已经算好的概率时用 BCELoss；训练时从 logit 开始，通常用 BCEWithLogitsLoss，避免手动先算概率再取对数。</p></div></section>';
  }
  function updateSoftmax(root){
    const sliders=[...root.querySelectorAll('[data-softmax-logit]')];if(sliders.length!==3)return;
    const logits=sliders.map(input=>Number(input.value)),maximum=Math.max(...logits),exps=logits.map(value=>Math.exp(value-maximum)),sum=exps.reduce((total,value)=>total+value,0),probabilities=exps.map(value=>value/sum),target=Number(root.dataset.target||0),safe=Math.max(1e-12,probabilities[target]);
    sliders.forEach((input,index)=>{root.querySelector('[data-softmax-value="'+index+'"]').textContent=logits[index].toFixed(1);root.querySelector('[data-softmax-probability="'+index+'"]').textContent=(probabilities[index]*100).toFixed(1)+'%';root.querySelector('[data-softmax-bar="'+index+'"]').style.width=(probabilities[index]*100)+'%';});
    root.querySelector('[data-softmax-loss]').textContent=(-Math.log(safe)).toFixed(3);
    root.querySelectorAll('[data-softmax-target]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.softmaxTarget)===target)));
    root.querySelector('[data-softmax-target-name]').textContent=['猫','狗','兔'][target];
  }
  function renderSoftmax(){
    return '<section class="softmax-playground" data-softmax-playground data-target="0" aria-labelledby="softmax-play-title"><div class="softmax-intro"><span class="chapter-kicker">动手试：三类共用一组概率预算</span><h3 id="softmax-play-title">拖动原始分数，看三个概率一起变化</h3><p>把分数调高，会让对应类别的概率增加；因为三类概率总和固定为 100%，其他类的概率也会相应变化。</p></div><div class="softmax-controls">'+['猫','狗','兔'].map((name,index)=>'<label>'+name+' 的原始分数 <output data-softmax-value="'+index+'">'+['2.0','1.0','0.1'][index]+'</output><input type="range" min="-2" max="4" step="0.1" value="'+['2','1','0.1'][index]+'" data-softmax-logit aria-label="调整'+name+'的原始分数"></label>').join('')+'</div><div class="softmax-bars" role="img" aria-label="Softmax 概率柱状图">'+['猫','狗','兔'].map((name,index)=>'<div class="softmax-row"><span>'+name+'</span><div class="softmax-track"><i data-softmax-bar="'+index+'" style="width:'+['65.9','24.3','9.9'][index]+'%"></i></div><strong data-softmax-probability="'+index+'">'+['65.9','24.3','9.9'][index]+'%</strong></div>').join('')+'</div><div class="softmax-target-switch" role="group" aria-label="选择真实类别">'+['猫','狗','兔'].map((name,index)=>'<button type="button" data-softmax-target="'+index+'" aria-pressed="'+(index===0)+'">真实类别：'+name+'</button>').join('')+'</div><p class="softmax-loss-readout" aria-live="polite">真实答案是<strong data-softmax-target-name>猫</strong>时，单样本交叉熵 = −ln(真实类概率) = <b data-softmax-loss>0.417</b>。</p><p class="softmax-formula">Softmax：pᵢ = exp(zᵢ) / Σⱼ exp(zⱼ)。实际计算可以先减去最大分数再取指数，概率不变且数值更稳定。</p></section>';
  }
  function renderImbalance(){
    return '<section class="imbalance-playground" data-imbalance-playground data-mode="common" aria-labelledby="imbalance-title"><div><span class="chapter-kicker">互动算一笔少数类的账</span><h3 id="imbalance-title">常见类别多，不代表少数类也学会了</h3><p>构造一个 100 张图的例子：90 张猫、10 张狗。选择策略，看看整体正确率和狗的召回率怎样变化。</p></div><div class="imbalance-actions" role="group" aria-label="选择教学示例"><button type="button" data-imbalance-mode="common" aria-pressed="true">只猜常见类</button><button type="button" data-imbalance-mode="rare">尝试找更多狗</button></div><div class="imbalance-ledger" aria-live="polite"><span>猫 90 张 · 狗 10 张</span><strong data-imbalance-summary>正确 90 / 100 · 总正确率 90%</strong><span data-imbalance-detail>狗：找到 0 / 10 · Recall 0%；没有报狗，Precision 暂无可计算值。</span></div><p class="imbalance-caveat">第二个按钮采用一组明确构造的预测结果：找到 8 张狗，同时把 9 张猫误报成狗。它展示少数类召回提高与误报增加的取舍，不代表类别权重一定产生这组结果。</p></section>';
  }
  function renderLabPrimer(){
    return '<section class="lab-beginner-guide" aria-labelledby="lab-primer-title"><div><span class="chapter-kicker">第一次做视觉实验</span><h2 id="lab-primer-title">先知道画面里的对象，再操作数值</h2><p>每个实验使用的是明确说明的教学数据。先读图例，再改变一个控件，观察数值和画面怎样一起变化。</p></div><ol><li><strong>看输入和答案</strong><p>先分清图像、'+termChip('ground-truth')+' 与 '+termChip('bounding-box')+'。</p></li><li><strong>预测模型会怎样答</strong><p>候选框和分数只是尚待检查的预测；移动框或调整滑杆前，先猜指标会升还是降。</p></li><li><strong>操作并解释结果</strong><p>读交集、'+termChip('iou')+'、'+termChip('confidence-threshold')+' 等读数，再说出它们为什么变化。</p></li></ol><div class="lab-beginner-links"><strong>推荐入门顺序</strong><a href="#lesson/ai-foundations">AI 基础 →</a><a href="#lesson/tasks">视觉任务 →</a><a href="#lesson/iou/section-iou-s01">边界框与 IoU →</a><a href="#lesson/dataset">数据集与标注 →</a><a href="#lesson/architecture">YOLOv5 结构 →</a><a href="#lesson/train-yolo">开始训练 →</a></div><p class="lab-primer-note">“完整检测流程”面板会用一组固定教学样例串起步骤；它不在浏览器里运行实际模型，也不代表真实训练日志。</p></section>';
  }
  function renderResources(){
    const links=[
      {title:'PyTorch 官方基础教程',description:'从张量、数据加载、模型构建到训练循环，按官方入门章节实践。',url:'https://docs.pytorch.org/tutorials/beginner/basics/intro.html',source:'PyTorch',level:'入门 · 配合站内课程',prerequisite:'不必先读英文；先学张量、样本和标签。',purpose:'核对张量、模型层、损失与优化器接口。',internal:'#lesson/tensor',internalLabel:'先补：张量基础'},
      {title:'动手学深度学习',description:'中文开放教材，补充线性代数、微积分和常见深度学习方法。',url:'https://zh.d2l.ai/',source:'D2L 中文版',level:'入门补充 · 数学与算法',prerequisite:'会基本加减乘即可开始。',purpose:'在本站算例之外继续学习矩阵、梯度和模型原理。',internal:'#lesson/ai-foundations',internalLabel:'先从 AI 入门开始'},
      {title:'YOLOv5 自定义数据训练',description:'官方教程说明数据集组织、YAML 配置和训练脚本。',url:'https://docs.ultralytics.com/zh/yolov5/tutorials/train-custom-data/',source:'Ultralytics',level:'实战 · 需要本地环境',prerequisite:'先学图像、检测任务、边界框、数据集与模型结构。',purpose:'准备自己的检测数据并启动一轮可复核的训练。',internal:'#lesson/dataset',internalLabel:'先补：数据集与标注'},
      {title:'YOLOv5 官方源代码',description:'从模型配置、损失实现和训练 / 推理入口对照阅读代码。',url:'https://github.com/ultralytics/yolov5',source:'GitHub · Ultralytics',level:'进阶 · 源码阅读',prerequisite:'会读 Python 函数和路径，已理解 Backbone、Neck、Head。',purpose:'追踪 models、utils、train.py 与 detect.py 中的数据流。',internal:'#lesson/architecture',internalLabel:'先补：网络结构'},
      {title:'YOLOv5 模型导出',description:'说明把训练模型转换成其他表示或推理引擎时的选项。',url:'https://docs.ultralytics.com/yolov5/tutorials/model-export/',source:'Ultralytics',level:'部署进阶 · 需要推理基础',prerequisite:'先学预处理、输出解码、阈值筛选与 NMS。',purpose:'区分模型文件表示、转换工具和实际运行环境。',internal:'#lesson/inference',internalLabel:'先补：推理流程'}
    ];
    return '<section class="page-intro"><p class="eyebrow">RESOURCE LIBRARY</p><h1>好的资料，让探索更深入。</h1><p>本站先把核心概念讲完；外部资料按用途分层，遇到需要时再打开。</p></section><section class="resource-guide-list" aria-label="分层学习资料">'+links.map(item=>'<article class="resource-guide-card"><header><div><span class="resource-level">'+escapeHtml(item.level)+'</span><h2>'+escapeHtml(item.title)+'</h2></div><span class="resource-source">'+escapeHtml(item.source)+'</span></header><p>'+escapeHtml(item.description)+'</p><dl><div><dt>需要先会</dt><dd>'+escapeHtml(item.prerequisite)+'</dd></div><div><dt>打开后做什么</dt><dd>'+escapeHtml(item.purpose)+'</dd></div></dl><div class="resource-guide-actions"><a href="'+escapeHtml(item.internal)+'">'+escapeHtml(item.internalLabel)+' →</a><a href="'+escapeHtml(item.url)+'" target="_blank" rel="noopener noreferrer">打开外部资料 ↗</a></div></article>').join('')+'</section><p class="resource-note">外部页面的版本和菜单会变化；接口与仓库行为以所链接的官方资料为准。本站基础章节可独立阅读，不要求先打开这些链接。</p><div class="callout">YOLOv5 实战结合本项目的模型配置编写；运行命令和依赖请按本地克隆的仓库版本核对。</div>';
  }
  function updateImbalance(root){
    const rare=root.dataset.mode==='rare';
    root.querySelector('[data-imbalance-summary]').textContent=rare?'正确 89 / 100 · 总正确率 89%':'正确 90 / 100 · 总正确率 90%';
    root.querySelector('[data-imbalance-detail]').textContent=rare?'狗：找到 8 / 10 · Recall 80%；17 次狗预测中 8 次正确 · Precision 47.1%。':'狗：找到 0 / 10 · Recall 0%；没有报狗，Precision 暂无可计算值。';
    root.querySelectorAll('[data-imbalance-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.imbalanceMode===root.dataset.mode)));
  }
  const api={starts,beginnerSteps,codeGuides,renderStart,renderLossChain,renderBce,renderSoftmax,renderImbalance,renderLabPrimer,renderResources,initialize(){document.querySelectorAll('[data-bce-playground]').forEach(updateBce);document.querySelectorAll('[data-softmax-playground]').forEach(updateSoftmax);document.querySelectorAll('[data-imbalance-playground]').forEach(updateImbalance);}};
  window.visionlabFoundation=api;
  window.initializeFoundationExamples=api.initialize;
  window.renderFoundationStart=renderStart;
  window.renderLossFoundationChain=renderLossChain;
  window.renderFoundationLabPrimer=renderLabPrimer;
  window.renderFoundationResources=renderResources;
  window.lessonPlaygrounds=window.lessonPlaygrounds||{};
  if(window.lessonPlaygrounds.render){
    const existingRender=window.lessonPlaygrounds.render;
    window.lessonPlaygrounds.render=(lessonId,sectionId,legacyIndex)=>{
      if(lessonId==='losses'){
        const map={'loss-regression':1,'loss-information':3,'loss-entropy':4,'loss-cross-entropy':5,'loss-update':8};
        if(sectionId==='loss-bce')return renderBce();
        if(sectionId==='loss-softmax')return renderSoftmax();
        if(sectionId==='loss-imbalance')return renderImbalance();
        if(Object.prototype.hasOwnProperty.call(map,sectionId))return existingRender(lessonId,map[sectionId]);
        return '';
      }
      return existingRender(lessonId,legacyIndex);
    };
  }
  document.addEventListener('input',event=>{if(event.target.matches('[data-bce-logit]'))updateBce(event.target.closest('[data-bce-playground]'));});
  document.addEventListener('input',event=>{if(event.target.matches('[data-softmax-logit]'))updateSoftmax(event.target.closest('[data-softmax-playground]'));});
  document.addEventListener('click',event=>{
    const answer=event.target.closest('button[data-exercise-type="section"][data-section-id]');
    if(!answer)return;
    const lessonId=answer.dataset.lesson,sectionId=answer.dataset.sectionId,index=answer.dataset.sectionIndex;
    const oldKey=lessonId+':section:'+index,newKey=lessonId+':section:'+sectionId;
    if(oldKey!==newKey)delete state.exerciseAnswers[oldKey];
    state.exerciseAnswers[newKey]=Number(answer.dataset.exerciseAnswer);
    save();
  });
  document.addEventListener('click',event=>{
    const bce=event.target.closest('[data-bce-target]');if(bce){const root=bce.closest('[data-bce-playground]');root.dataset.target=bce.dataset.bceTarget;updateBce(root);return;}
    const softmax=event.target.closest('[data-softmax-target]');if(softmax){const root=softmax.closest('[data-softmax-playground]');root.dataset.target=softmax.dataset.softmaxTarget;updateSoftmax(root);return;}
    const imbalance=event.target.closest('[data-imbalance-mode]');if(imbalance){const root=imbalance.closest('[data-imbalance-playground]');root.dataset.mode=imbalance.dataset.imbalanceMode;updateImbalance(root);}
  });
})();
