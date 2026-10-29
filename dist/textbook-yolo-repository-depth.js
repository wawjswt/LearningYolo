/* YOLOv5 v7.0 仓库职责与改进位置指南。 */
(()=>{
  const catalog=typeof lessons!=='undefined'?lessons:window.lessons;
  const lesson=catalog?.find(l=>l.id==='yolo-repository');if(!lesson)return;
  const quiz=(q,options,answer,why)=>({q,options,answer,why});
  const add=(id,title,paragraphs,exercise,extra={})=>lesson.sections.push({id,title:`${lesson.sections.length+1}. ${title}`,paragraphs,exercise,subheadings:{},...extra});
  const files=[
    ['train.py','训练入口','train、parse_opt、main：读取配置，建模、加载权重、创建优化器，循环前向、求损失、反传、更新和验证。修改训练调度或增加训练步骤从这里追踪。'],
    ['val.py','评价入口','run、process_batch：整理预测与标签的匹配，汇总评价统计。修改评价协议、每类统计或错误分析从这里开始，再追到 metrics。'],
    ['detect.py','应用入口','run：加载模型、读取图片或流、前向预测、NMS、映回原图并保存。增加摄像头应用或结果输出格式从这里开始。'],
    ['export.py / benchmarks.py','导出与运行比较','export.py 的 run 及各 export_* 函数负责转换格式；benchmarks.py 比较支持的格式。新算子能否导出、数值是否对齐，需要沿导出目标检查。'],
    ['models/yolo.py','组装模型与检测头','parse_model 读取每行 YAML；BaseModel._forward_once 根据 from 取输入；DetectionModel 建模并初始化步长等状态；Detect.forward 写出原始预测并在推理时解码。'],
    ['models/common.py','网络模块实现','Conv、Bottleneck、C3、SPPF、Concat 等定义具体计算；DetectMultiBackend 封装多种后端模型的加载和调用。新增计算模块通常写在这里。'],
    ['models/experimental.py','实验模块及权重加载','包括 MixConv2d、Ensemble、attempt_load 等。它不是所有自定义模块的统一注册文件；按实际导入关系确认符号能否被模型解析器找到。'],
    ['models/*.yaml / models/hub/','网络配置','规定 depth_multiple、width_multiple、anchors 和 backbone/head 的层连接；hub 中还有其他结构配置。YAML 的 head 区域包括特征融合层，不能把整个区域都当作最后的 Detect。'],
    ['data/*.yaml / data/hyps/*.yaml','数据与超参数','前者提供训练/验证路径与类别名称；后者保存学习率、损失权重和增强概率等设置。新增数据集可新建 data YAML，不必改网络模块。'],
    ['utils/dataloaders.py','数据读取与组批','create_dataloader、LoadImagesAndLabels、__getitem__、load_mosaic、collate_fn 等将图片和标签变成批次；LoadImages 等服务推理读取。修改样本采样、标签读取或拼图时在这里跟读。'],
    ['utils/augmentations.py','图像与框的变换','letterbox、random_perspective、augment_hsv、mixup 等实现变换。几何变换要同步更新框；调用位置和增强开关还需回到 dataloaders 与 hyp 配置。'],
    ['utils/loss.py','训练目标与损失','ComputeLoss.__init__ 准备 BCE、权重和尺度 balance；__call__ 计算各项损失；build_targets 按标签、Anchor 和邻格分配监督。'],
    ['utils/metrics.py','重叠与评价数学','bbox_iou 提供框重叠及 CIoU 等计算；ap_per_class、compute_ap 汇总曲线和 AP；fitness 提供选模型的综合分数。修改损失中的重叠项也可能调用这里。'],
    ['utils/general.py','共享工具','non_max_suppression、scale_boxes、check_dataset、坐标格式转换等被多个入口调用。改变这里的共享函数时，要检查训练、验证和推理中的所有调用者。'],
    ['utils/autoanchor.py','参考框适配','check_anchors、kmean_anchors 检查标签宽高与 Anchor 的匹配情况并可寻找新的参考尺寸；它评估的是几何适配。'],
    ['utils/torch_utils.py','训练与设备工具','smart_optimizer、ModelEMA、smart_resume、select_device、fuse_conv_and_bn 等处理优化器、滑动平均、恢复和设备。训练入口负责决定何时调用。'],
    ['utils/plots.py / utils/loggers/ / utils/callbacks.py','展示、记录与事件','绘制批次、标签和结果；记录实验数据；通过 callbacks 在训练事件中触发操作。想新增日志或可视化，先查现有事件和记录接口。'],
    ['classify/ / segment/','其他任务入口','分类和实例分割有各自 train、val、predict 等入口及相关工具。普通框检测的修改不能直接假定适用于分割掩码或分类输出。'],
    ['requirements.txt / hubconf.py / README.md / LICENSE','环境、接口与文档','依赖版本、PyTorch Hub 加载入口、用法和许可。Dockerfile、.github 等属于环境及自动化支持，文件存在与否以当前检出版本为准。'],
    ['runs/、*.pt、*.cache','运行产物','runs 通常按操作生成实验目录；.pt 保存参数和可能的训练状态；数据缓存加速扫描。修改产物不能替代修改生成它的源码或配置。']
  ];
  add('repository-file-index','主要文件逐项查：收到什么，负责什么',[
    '本节以官方 YOLOv5 v7.0 的普通目标检测为基准。仓库是同一套代码与配置的集合；文件夹负责组织代码，函数和类负责执行具体计算。查找位置优先用文件名加函数名，函数名比随编辑变化的行号更稳定。',
    '阅读下面的索引时先选任务。例如“框映回原图后偏了”，沿 detect.py → scale_boxes 查坐标；“某个新模块接错通道”，沿模型 YAML → parse_model → 模块构造函数查形状。每次记录输入、输出、单位和调用者，才能知道这一处修改会影响哪里。'
  ],quiz('框在网络输入画布上正确，映回原图后偏移，优先查哪里？',['ComputeLoss 的分类权重','预处理比例、补边与 scale_boxes 的还原过程','训练 epoch 数'],1,'先找到错误出现的坐标转换环节，检查缩放、补边和坐标所属图片。'),{repositoryFiles:true});
  add('repository-config-vs-code','先判断改配置，还是改计算',[
    '如果只是换数据集，先准备图片、标签和 data YAML。训练入口从类别名称确定类别数并据此建立检测模型；原来80类换成2类时，输出层形状会改变，预训练权重只加载名称与形状匹配的部分。新类别顺序必须与标签编号相同。',
    '如果只是调整学习率、Mosaic 概率、box/obj/cls 权重，先复制一份 data/hyps 下的配置并通过 --hyp 选择。超参数是已有计算的控制值；只有要加入当前程序没有的运算或策略时，才需要增加代码和读取逻辑。',
    '如果只是重连已有 Conv、C3、Concat，通常先复制模型 YAML，通过 --cfg 选择新结构。每行的 from 决定读取哪层输出，number 给基础重复数，module 指定模块，args 给参数。深宽缩放由 parse_model 应用，YAML 中写的通道数不一定等于缩放后的实际通道。',
    '如果要引入新计算，例如自定义注意力或卷积，才需要定义模块并让解析器理解它。结构配置、模块实现、参数解析是三个连续环节：图纸写得出，解析器能建立，前向形状也必须接得上。'
  ],quiz('只调整已有 Mosaic 的启用概率，首先改哪里？',['复制并修改 hyp YAML，再由训练参数选择','改 Detect.no','重写 AP 计算'],0,'已有增强的概率由训练超参数控制，读取和调用已有实现即可。'));
  add('repository-new-module','新增模块：从定义到接入的完整路径',[
    '第一步，先写下模块约定。例如输入 [B,C,H,W]，输出仍为 [B,C,H,W]；或者输出通道变为 C2。B 是批次，C 是通道，H/W 是空间尺寸。这个约定决定模块构造函数需要哪些参数，也决定后面的层是否需要调整。',
    '第二步，在 models/common.py 定义继承 nn.Module 的类：__init__ 创建卷积等子层，forward 接收张量并返回计算结果。__init__ 中声明的层和参数会被 PyTorch 管理；不要在每次 forward 时临时重新创建需要训练的卷积。',
    '第三步，查看 models/yolo.py 的导入和 parse_model。v7.0 会从 common 等文件导入模块，再解析 YAML 的 module 名称。符号能找到只解决“是什么类”；解析器还必须知道怎样传通道参数、记录输出通道，以及是否应用 width_multiple。',
    '以需要 c1、c2 两个通道参数的新卷积模块为例，若希望像 Conv 一样由 YAML 只填写输出通道，就需要在 parse_model 相应的模块分支中处理它：从 ch[f] 取得输入通道，按规则缩放输出通道，再把 c1、c2 放到构造参数前。若模块内部接收重复次数，还要核对 n 放在哪里；不能把 C3 内部重复的处理机械套给所有模块。',
    '第四步，复制一份模型 YAML，在希望的位置引用新模块，明确 from 和 args。插入一行后，后面引用绝对层号的连线可能整体变化，Concat 的来源和最后 Detect 的输入索引都要重查。形状保持不变的模块也会改变层号。',
    '第五步，先创建模型并跑一个小批次前向，记录新层前后的形状；再用真实标签跑通损失和反向。最后检查预训练参数加载记录、计算量、显存、速度及导出。结构能建立只证明解析成功，训练效果仍需通过同协议对照实验判断。'
  ],quiz('新模块名称能被解析，但构造时报缺少 c1/c2，重点查哪里？',['parse_model 如何组装构造参数和记录通道','图片文件名','NMS 的类别颜色'],0,'模块的参数约定要与解析器实际传入的参数一致。'));
  add('repository-head-change','改检测尺度或检测头：哪些地方必须一起看',[
    '增加 P2 小目标预测分支，先在模型 YAML 设计从哪层获取较高分辨率特征，怎样上采样、拼接和融合，再把新特征层索引交给最后的 Detect。普通640方形输入下，P2 常对应160×160位置。它增加计算和候选数，是否改善小目标需要数据验证。',
    '随后核对各尺度 Anchor 配置、Detect 构建得到的 nl/na/stride，以及训练损失的尺度 balance。build_targets 会按检测尺度遍历，但你的分配规则、参考尺寸和损失权重仍须适配新结构。新增一条 YAML 连线后，要实际打印三尺度变四尺度的原始输出。',
    '若只是把标准检测任务从80类改为2类，每候选字段仍遵守 nc+5。三个 Anchor 时，输出卷积通道从3×85=255变为3×7=21；应由任务类别数建模，而不是把 Detect 中的 nc+5 手动改成常数。',
    '若要改成解耦头，可以分别用分类和定位分支提特征，再按当前约定合并字段。只要最终输出和语义保持一致，可减少对后续代码的影响；若改变物体性、类别或框字段的数量与含义，就必须同步改 Detect.forward 的 reshape/解码、ComputeLoss 的字段读取，以及 NMS 和导出输出解释。',
    '改成 Anchor-free 涉及框表示、正样本分配、损失和推理解码的共同设计。仅删除 anchors 配置无法完成转换。动手前先为一个位置写出输出字段与训练目标，再逐段检查模型、损失、后处理和部署接口是否使用同一约定。'
  ],quiz('在 YAML 中增加 P2 分支后，下一步要核对什么？',['只看文件能否保存','Detect 输入索引、尺度/Anchor/stride、损失 balance 和实际输出形状','把所有类别编号加1'],1,'尺度变化要同时核对结构、训练监督与推理输出。'));
  add('repository-loss-data','改损失与数据：找到真正参与计算的位置',[
    '更换框损失，先进入 utils/loss.py 的 ComputeLoss.__call__，找到负责位置的预测参数如何还原成框，再看 bbox_iou 的返回值怎样形成 lbox。IoU/CIoU 等数学实现在 utils/metrics.py；替换时核对输入是中心宽高还是角点，返回是相似度还是损失，以及归约为均值还是求和。',
    '例如将相似度0.6转为损失1−0.6=0.4，与直接把0.6当作待最小化损失的方向不同。增加自定义项时，也要保留梯度、核对设备和 dtype，并明确怎样加入反向传播的总标量及日志分项。只增加日志里显示的数字，不会自动使模型优化该项。',
    '修改正样本分配要看 ComputeLoss.build_targets：这里把归一化标签转到各尺度网格，比较目标与 Anchor 宽高，选择中心及邻格索引。修改匹配条件会改变正样本数量，从而影响框、类别和物体性监督；应先用一个已知标签逐项打印匹配，确认边界与空目标批次。',
    '修改增强时，先在 utils/dataloaders.py 的 LoadImagesAndLabels.__getitem__ 找到调用位置，再到 utils/augmentations.py 修改运算；Mosaic 的组装还要看 load_mosaic。颜色变换通常不移动框，翻转、裁剪、透视和拼图则必须同步移动、裁切或过滤标签。',
    '例如图宽640、框横坐标为[100,200]，水平翻转后应为[440,540]。先把变换后的框画在图上检查，再比较训练结果。改变标签格式时，还要同时处理标签读取、缓存、collate_fn、损失输入和验证读取，确保各环节对同一行数字的解释一致。'
  ],quiz('自定义损失打印了数值，但没有加入用于 backward 的标量，会发生什么？',['模型自动优化新损失','只记录了它，它不会按预期贡献参数梯度','类别数会自动改变'],1,'梯度来自实际参与反向传播的计算图和总标量。'));
  add('repository-experiment','一次改进怎样留下可解释的证据',[
    '从一个问题开始，例如远处车辆漏检。先保存漏检图，检查目标在网络画布上的像素大小、标注是否完整、候选是否已被分数或 NMS 筛掉。只有确定问题出现在哪段流程后，才选择加尺度、调数据或改后处理等方案。',
    '保存一份能复现的基线：代码提交号、模型 YAML、data YAML、hyp YAML、数据划分、权重来源、随机种子与训练命令。创建自己的配置文件并清晰命名，训练记录才能说明当次究竟使用了哪套结构和参数。',
    '先做单项对照，例如只加 P2，其余数据划分和评价协议保持一致；再看每类和小目标切片上的漏检、误报，同时记录速度、显存和计算开销。若一次更换网络、增强和损失，就难以从结果确定是哪项改动起了作用。',
    '按顺序留下检查证据：模型打印与形状说明结构接通；一批真实标签的损失和反向说明监督接通；完整训练及独立评价说明效果；导出模型同输入对比说明部署接口接通。四种证据回答不同问题，实验报告应分别记录。'
  ],quiz('想判断新模块是否有效，怎样组织首次对照？',['同时换数据、损失与训练轮次','使用固定划分和评价协议，先比较基线与单项改动','只看训练损失最低的一轮'],1,'单项对照和一致的评价协议有助于解释改动的影响。'));
  lesson.time=55;
  lesson.goals=['按文件和关键函数追踪模型、数据、损失及后处理。','为新增模块、预测尺度或损失列出联动修改位置。','记录一项改进的结构、训练、评价和部署检查证据。'];
  lesson.sources.push(...['models/yolo.py','models/common.py','utils/loss.py','utils/dataloaders.py','utils/augmentations.py','utils/general.py','utils/metrics.py','train.py','export.py'].map(p=>({label:`v7.0 源码 · ${p}`,url:`https://github.com/ultralytics/yolov5/blob/v7.0/${p}`})));
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const old=window.visionlabYoloLearning.renderParagraph.bind(window.visionlabYoloLearning);
  window.visionlabYoloLearning.renderParagraph=(s,i)=>{
    const html=old(s,i);if(!s.repositoryFiles||i!==0)return html;
    return html+'<figure class="yd-workshop yl-figure"><figcaption><strong>仓库文件索引：点击展开职责和修改入口</strong></figcaption>'+files.map(([p,role,desc])=>`<details><summary><code>${esc(p)}</code> · ${esc(role)}</summary><p>${esc(desc)}</p></details>`).join('')+'</figure>';
  };
})();
