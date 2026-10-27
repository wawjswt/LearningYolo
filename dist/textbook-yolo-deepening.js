/* Supplemental teaching follows the supplied C3/SPPF anchor-based YOLOv5 model. */
(() => {
  const find=id=>lessons.find(l=>l.id===id);
  const quiz=(q,options,answer,why)=>({q,options,answer,why});
  let serial=300;
  const part=(id,title,paragraphs,exercise,extra={})=>({id,title,paragraphs,exercise,legacyIndex:serial++,playgroundId:'yd-'+id,...extra});
  const add=(id,...parts)=>find(id).sections.push(...parts);
  const source=(id,label,file)=>find(id).sources.push({label,url:'https://github.com/ultralytics/yolov5/blob/v7.0/'+file});
  for(const l of lessons.filter(l=>l.group==='yolo'))for(const s of l.sections)s.paragraphs=s.paragraphs.map(p=>p
    .replace('anchor 是一组宽高参考值，不是对真实框的硬性限制。','anchor 是一组宽高参考值，预测框可以调整；单个候选的宽高仍受解码公式限制，后文会分别说明参考值、表达范围与训练匹配。')
    .replace('用可视化区分“完全没有候选框”“有低分框”“有框但分类错误”，能迅速确定排查方向。','标准密集头即使面对空背景，也按配置产生原始候选。排错时区分原始张量形状异常、NaN/Inf、候选分数低、阈值筛选后为空、NMS结果与类别错误，逐段记录数量和分数。')
    .replace('解码前没有有效分数，检查模型、权重和输入；','原始输出含NaN/Inf或形状不符，检查模型、权重和输入；候选存在但分数普遍低，检查训练与预处理；'));
  const backbone=find('yolo-backbone');
  backbone.sections[0].paragraphs=[
    '先看一张高640、宽480的图片，张量为[1,3,640,480]：B=1是批次大小，C=3是RGB通道，H=640、W=480是高宽。第0层用64组滤波器，每组跨越全部3个输入通道，因此得到64张特征图。64是特征通道数，与检测类别数无关。',
    '第0层用6×6核、步长2、两侧各补2个位置。高度补边后为644；窗口占6个位置，起点可移动的跨度为638。每次跨2个位置，共floor(638/2)+1=320个起点。宽度独立计算floor((480+4−6)/2)+1=240，输出为[1,64,320,240]。floor是向下取整，+1计入第一个窗口。',
    '高、宽分别应用公式：\\[D_{out}=\\left\\lfloor\\frac{D_{in}+2p-d(k-1)-1}{s}\\right\\rfloor+1\\] D表示某一条空间轴，D_in、D_out为该轴输入和输出长度；k为卷积核边长，s为步长，p为两侧各自的填充量，d为膨胀率。有效窗口范围为d(k−1)+1，本例d=1。高宽参数不同时也应分别代入。',
    '普通Conv块是Conv2d(bias=False)→BatchNorm2d→SiLU。卷积学习空间与通道组合；Batch Normalization（批量归一化，BN）按通道调整数值；SiLU提供非线性响应：\\[\\operatorname{SiLU}(x)=x\\sigma(x),\\quad\\sigma(x)=\\frac{1}{1+e^{-x}}\\] x是一个特征数，σ是Sigmoid。这里BN和SiLU保持张量形状，可点术语继续补基础。',
    '“边长除以步长”需要符合具体几何条件。第0层输入641时，输出floor((641+4−6)/2)+1=320，不能写320.5。下方奇数选项只演示局部卷积；整网还涉及多分支尺寸对齐，不能据此认为任意高宽都能直接送入模型。'
  ];
  backbone.sections[0].playgroundId='yd-conv-shapes';
  backbone.sections[0].exercise=quiz('输入[1,3,640,480]，第0层k=6、s=2、p=2、输出64通道，结果是什么？',['[1,64,320,240]','[1,3,320,240]','[1,64,320,320]'],0,'高宽分别代入卷积公式，滤波器数量决定输出通道。');
  backbone.sections[1].paragraphs.push('把改变的轴写在形状旁：步长2卷积改变H/W，也可改C；本配置C3、SPPF保持H/W；1×1、s1、p0卷积保持H/W但可改C；最近邻上采样只扩展H/W；通道Concat累加C。卷积不要求输入输出元素数相等，view等纯重排才保持元素总数。');
  backbone.sections[1].playgroundId='yd-backbone-ledger';backbone.time=45;
  const neck=find('yolo-neck');
  neck.sections.forEach((s,i)=>{s.playgroundId=i?'yd-pan-flow':'yd-fpn-flow';});
  neck.sections[0].paragraphs.unshift('Neck是融合不同尺度特征的部分。Feature Pyramid Network（特征金字塔网络，FPN）把深层、较粗特征的信息送向较细尺度。本课用横向连接保留高分辨率特征，与上采样结果拼接，再学习融合；下面逐步核算每条连线。');
  neck.sections[1].paragraphs.unshift('Path Aggregation Network（路径聚合网络，PAN）强调增加向较粗尺度聚合的路径。本实现把已融合的80×80特征再送到40×40、20×20，同时读取前面保留的特征；这仍是前向计算。学习参数时的反向传播是另一过程。');
  add('yolo-neck',part('concat-debug','接错一条线，为什么不能拼接',[
    '沿通道轴dim=1拼接普通特征时，B、H、W必须一致，C可以不同。[1,512,40,40]与[1,512,40,40]拼成[1,1024,40,40]；两路信息仍占据各自通道，后面的C3再学习组合。',
    '若把横向来源层6误选为层4，另一份特征会是[1,256,80,80]，高宽不一致，torch.cat会报错。先查from引用、上采样倍率和输入尺寸，不能用view代替空间重采样。残差Add还要求对应形状一致，通道数保持不变。'
  ],quiz('沿C拼接[1,256,80,80]与[1,512,40,40]，首先检查什么？',['直接得768通道','来源层与高宽对齐','用view强改尺寸'],1,'通道Concat要求其余轴一致，view不能修复空间对应。')));
  const head=find('yolo-head'),original=head.sections[0],p=original.paragraphs.slice();
  original.title='先认清输入：三个尺度各用一块输出卷积';
  original.paragraphs=[p[0],p[1],'先沿下方互动走过输入、卷积、分组、换轴和路径分流，再按后面各节计算。互动固定80类作为参照；改成2类的同步变化在本课后半部分演示。'];
  delete original.code;
  head.sections=[original,
    part('head-pointwise','一个位置怎样输出预测：先手算三个通道',[
      '用缩小的教学例子理解1×1卷积：某位置F=[2,−1,3]，某输出通道的W=[0.5,2,−1]，偏置b=0.25，则输出0.5×2+2×(−1)+(−1)×3+0.25=−3.75。这是人工乘加算例，不是训练后的分数。',
      '实际P3每个位置有256个输入特征，255个输出通道各自学习一组权重和偏置：\\[z_{j,y,x}=\\sum_{c=0}^{C_{in}-1}W_{j,c,0,0}F_{c,y,x}+b_j\\] F是输入特征，W是卷积权重，b是偏置；c枚举输入通道，j枚举输出通道，y、x是行列，C_in是输入通道数；公式省略批次轴。',
      '1×1表示空间窗口，它仍同时组合全部输入通道。空间保持80×80，通道256→255。特征已汇集前面网络的信息，因此这里一个位置不等于原图一个像素。'
    ],quiz('上述F、W和b算出的值是多少？',['−3.75','3.75','−4'],0,'乘加为1−2−3=−4，再加偏置0.25。')),
    part('head-fields','255个通道：每个候选都要完整回答',[
      p[3],p[4],
      '\\[D=4+1+n_c,\\qquad C_{out}=AD\\] D是单候选字段数，n_c为类别数，A为每格Anchor数，C_out为输出通道数。本例A=3、n_c=80，所以D=85、C_out=255。三个检测尺度与每尺度三个Anchor是不同概念。'
    ],quiz('80类时，输出通道170是什么？',['Anchor 2的tx','第170类','Anchor 1的物体性'],0,'170=2×85+0；组内字段0为tx。')),
    part('head-permute','换轴要保留对应：直接view为什么错',[
      p[5],
      '令B=1、A=1、D=2、H=1、W=2，卷积输出平铺为[10,11,20,21]。第0字段在两个位置为10、11，第1字段为20、21。正确换轴后，位置0向量为[10,20]、位置1为[11,21]；直接view最终形状会错误得到[10,11]与[20,21]。',
      'view按布局重新分组，permute才交换轴。元素总数相等只证明新形状装得下这些数，不证明语义对应正确。下面代码仅需PyTorch，可独立运行。'
    ],quiz('上例位置0正确的字段向量是什么？',['[10,11]','[10,20]','[20,21]'],1,'10和20来自同一位置的不同字段。'),{code:['import torch','p = torch.tensor([10, 11, 20, 21]).view(1, 2, 1, 2)','grouped = p.view(1, 1, 2, 1, 2)  # B,A,D,H,W','correct = grouped.permute(0, 1, 3, 4, 2).contiguous()','wrong = p.view(1, 1, 1, 2, 2)','print(correct[0, 0, 0].tolist())  # [[10,20], [11,21]]','print(wrong[0, 0, 0].tolist())    # [[10,11], [20,21]]'].join('\n'),codeLabel:'Python · 可独立运行的换轴算例'}),
    part('head-boundary','训练与推理：同一套权重的两条路径',[
      p[6],p[7],
      '训练返回三尺度原始列表，每项[B,A,H,W,D]，真实标签另外交给ComputeLoss。普通推理返回(decoded,raw)，解码张量为[B,N,D]，N为候选总数。外部后处理得到每张图可变长度[Mi,6]，行内为角点坐标、分数和类别；Mi可以为0，原始候选仍然存在。',
      '例如物体性0.9、某类分数0.8，后处理类别置信度为0.72，还要过阈值和NMS。解码坐标在网络输入画布上，回原图需撤销缩放与填充。独立Sigmoid的类别分数不要求和为1，也不自动是已校准概率。'
    ],quiz('空背景图片在标准640输入下，原始候选一定为0吗？',['是','否，按结构输出候选，筛选后可为空','只剩一个背景候选'],1,'原始数量由网格与配置决定，最终数量由分数与后处理决定。')),
    part('head-parameters','深入：参数、buffer和源码片段',[
      p[8],'下面位于Detect类的__init__及forward循环内；self、features和i由类和循环提供，不能单独粘贴运行。后面提供完整模型构建例子。'
    ],quiz('nc和通道配置不变，输入640→320会改变输出卷积参数量吗？',['减为四分之一','不会，位置共享权重','减半'],1,'权重由通道与核尺寸决定，空间位置数改变计算和激活量。'),{depth:'advanced',code:['# Detect类内部片段：no=nc+5，na为Anchor数，ch为输入通道列表','self.m = nn.ModuleList(nn.Conv2d(c, self.na * self.no, 1) for c in ch)','# forward第i个尺度','p = self.m[i](features[i])','B, _, H, W = p.shape','p = p.view(B, self.na, self.no, H, W)','p = p.permute(0, 1, 3, 4, 2).contiguous()'].join('\n'),codeLabel:'Python · Detect类内部源码片段'})
  ];
  add('yolo-head',part('head-change-classes','改法一：80类改成烟雾、火焰2类',[
    '先确定类别0是smoke（烟雾）、类别1是fire（火焰）。数据YAML用names固定顺序，标签首项只能取0或1。本地check_dataset从names得到或核对nc。模型YAML描述结构；train.py从数据配置取得nc，再调用Model(...,nc=nc)构建网络，覆盖模型配置里的类别数。',
    '每个Anchor改为4个框参数、1个物体性、2个类别分数，共7个数。3个Anchor对应21通道，三个输出卷积分别变为256→21、512→21、1024→21。P3卷积输出[1,21,80,80]，分组换轴后为[1,3,80,80,7]；P4/P5同理。',
    '候选数量是A×各尺度H×W之和。输入640、标准三尺度、每格3个Anchor不变，仍有25,200个候选；推理张量从[1,25200,85]变为[1,25200,7]。前面提特征的通道无需因为80类变2类就同比缩小。',
    '不要只写model.model[-1].nc=2：已创建的输出卷积仍可能是255通道，no、view和权重都不会自动配套重建。应在构建Model时传nc，或沿当前仓库支持的训练入口重新建模。下方对照器按静态规则计算，不执行模型。',
    '真正动手按这条顺序核对：①数据YAML的names先列清楚编号和类别，例如[smoke, fire]；②标签第一列只用0或1，并抽图确认0真是烟雾、1真是火焰；③构建模型时让nc=2，训练入口会用数据中的类别数创建Detect；④确认三路输出卷积是256→21、512→21、1024→21；⑤再加载预训练参数；⑥跑一批前向检查形状；⑦训练后用独立验证集逐类看结果。',
    '改类别数改变的是Detect每条候选的类别字段数和输出卷积参数形状；在模型宽深、输入尺寸、尺度和Anchor配置不变时，骨干/Neck通道、每格Anchor数量与网格位置数不因类别数本身改变。若新数据中的物体宽高分布不同，Anchor仍需另行检查。',
    '80类输出卷积的P3权重为[255,256,1,1]，两类新头要[21,256,1,1]，尺寸不同，不能直接复制。train.py用intersect_dicts按参数名和形状筛出能复用的权重，剩余新头保持随机初始化；strict=False只允许缺少或多出的键，不会替同名但形状冲突的张量自动变形。还要人工核对类别顺序：如果类别数相同但names次序对调，张量形状仍完全一样，程序不能知道语义已经错位。',
    '前向通过只说明输入能走通且输出形状符合预期；它不能说明模型已经学会烟雾或火焰。之后仍要训练、查看每类验证指标和漏检/误报图片，并保留数据划分、类别表、配置与代码版本。下方交互器用于核对数字，不会执行训练。'
  ],quiz('80类改2类，候选数与字段数怎样变？',['候选630个、字段7个','候选25200个、字段7个','候选25200个、字段85个'],1,'D=nc+5改变；固定网格、尺度和Anchor数时，候选数量不变。')),
    part('head-class-config','写好数据配置，再用代码检查新头',[
      '在仓库新建data/smoke-fire.yaml。path可写机器上的绝对数据根目录，train与val相对于它解析。图片目录中的images按加载器规则对应labels，同名文本应记录完整目标框。',
      'YAML示例：\npath: D:/datasets/smoke-fire\ntrain: images/train\nval: images/val\nnc: 2\nnames: [smoke, fire]\n\n例如labels/train/001.txt的一行为“1 0.5 0.5 0.2 0.3”，表示火焰框，后四项是相对图片宽高归一化的中心与尺寸。修改名称顺序时同步检查标签编号。',
      '下面在已安装依赖的YOLOv5仓库根目录运行，不加载预训练权重。实际执行一次前向；标注的是预期形状，数值来自随机初始化。若仍输出85维，检查实际构建参数、配置路径及载入的代码版本。这个前向检查能发现类别数、层数和张量排布错误，但不能测出检测准确率。',
      '随课还提供可下载的形状核对脚本`assets/yolov5l/verify_detect_shapes.py`。它要求本机已安装该仓库所需的PyTorch和依赖，不会安装软件或下载权重。先将下载文件放到本机可访问的位置，在命令中把`verify_detect_shapes.py`替换成该文件路径；例如：`python E:/tools/verify_detect_shapes.py --repo E:/YOLOv5 --cfg models/yolov5l.yaml --nc 2 --height 640 --width 640`。`--repo`指向YOLOv5仓库根目录，`--cfg`是相对该目录的配置路径。',
      '脚本分别用训练模式读取原始多尺度列表、用评估模式读取解码输出，并打印每层形状和候选总数。两类标准640方图应得到[1,3,80,80,7]、[1,3,40,40,7]、[1,3,20,20,7]和[1,25200,7]。如要检查P2，先下载本页P2 YAML并复制到本地仓库`models/hub/yolov5-p2.yaml`，再将命令中的配置改为`--cfg models/hub/yolov5-p2.yaml`；640方图应有四个原始尺度、总计102,000条候选。上述结果只核对结构，不代表模型准确率、速度或训练效果。'
    ],quiz('names对调但标签编号不变，会怎样？',['只变显示顺序','监督的类别含义被对调','模型会自动猜语义'],1,'编号和类别名称构成任务契约，相同类别数不保证语义一致。'),{code:[
      'import torch','from models.yolo import Model','',
      'model = Model("models/yolov5l.yaml", ch=3, nc=2).eval()',
      'with torch.inference_mode():','    decoded, raw = model(torch.zeros(1, 3, 640, 640))',
      'print(model.model[-1].nc)  # 2','print([list(p.shape) for p in raw])',
      '# [[1,3,80,80,7], [1,3,40,40,7], [1,3,20,20,7]]',
      'print(list(decoded.shape))  # [1,25200,7]',
      'print([list(m.weight.shape) for m in model.model[-1].m])',
      '# [[21,256,1,1], [21,512,1,1], [21,1024,1,1]]',
      '# 仅检查结构，随机数值没有检测质量意义。'
    ].join('\n'),codeLabel:'Python · 完整模型构建与输出检查'}),
    part('head-transfer','迁移预训练权重：名称、形状和语义都要看',[
      '80类P3输出权重为[255,256,1,1]，2类新头需要[21,256,1,1]，不能整块复制。本地train.py先建新模型，再用intersect_dicts按名称和形状筛选，最后strict=False加载筛选结果；strict=False本身不会自动忽略同名尺寸错误。',
      '不相容的输出卷积权重和偏置保留新初始化值，兼容的主干与融合层参数可作为起点。查看Transferred日志、网络摘要和实际输出。若改拓扑导致层号重排，即使键名、形状碰巧匹配，也可能对应不同职责，需要人工核对映射。',
      '在仓库根目录执行训练命令示例：\npython train.py --data data/smoke-fire.yaml --cfg models/yolov5l.yaml --weights yolov5l.pt --imgsz 640 --batch-size 4 --epochs 100\n\n权重需来自可信来源并适配依赖环境；路径、batch和预算按设备调整。这是新任务微调，不用--resume恢复旧80类实验。验证时核对类别顺序、各类指标和失败图。'
    ],quiz('strict=False会自动忽略同名但尺寸不匹配的参数吗？',['会','不会，通常需先筛选兼容项','只忽略偏置'],1,'本实现先做名称与形状交集，再用strict=False处理缺失项。')),
    part('head-p2','改法二：增加P2，让更密网格参与预测',[
      'P2/4表示相对输入采样步长为4，640×640输入得到160×160网格；可把它想成在输入画布上每隔约4个像素设一个预测位置。较小物体在P3/8、P4/16等粗网格上可能只覆盖很少位置，P2提供更密的预测机会。早期特征空间细节较多但类别语义较弱，因此要与较深层特征融合；增加P2是一种可实验的结构选择，不保证精度一定提高。不能只在Detect的from列表追加一个层号。',
      '对照官方v7.0 models/hub/yolov5-p2.yaml：保留到层17的P3融合特征；层18用1×1卷积256→128，层19上采样80→160；层20与Backbone层2的128×160×160拼成256通道；层21 C3输出128×160×160供P2预测。这里C3重复配置为1。',
      '回程重建P3/P4/P5：层22下采样为128×80×80，与层18拼接，由层24输出256通道；层25下采样为256×40×40，与层14拼接，由层27输出512；层28下采样为512×20×20，与层10拼接，由层30输出1024。Detect改读[21,24,27,30]，输入通道为[128,256,512,1024]。',
      '标准模型的层24是Detect，P2模型的层24却是P3的C3，因为前面多插入了P2路径。层号不是固定意义，新增或移动模块会让后续绝对from引用和参数键名一起变化。改完必须核对每个from来源、Detect最终读取的四层及通道，不能只把Detect列表加一个21。P2示例配置可下载对照，配置内容和当前训练代码版本也要相符。'
    ],quiz('P2结构能沿用标准Detect的[17,20,23]吗？',['能，会自动补尺度','不能，要核对四路来源与通道','把17改成2即可'],1,'官方示例读取[21,24,27,30]，新增路径改变了后续层号。')),
    part('head-p2-contract','四尺度要同步检查：Anchor、损失与部署',[
      '固定每格3个Anchor，标准候选数为3×(80²+40²+20²)=25,200；加入P2后为3×(160²+80²+40²+20²)=102,000，新增76,800个，是原候选数的约4.05倍。P2单尺度本身有3×160²=76,800条候选，占四尺度候选约75.3%。两类任务每条候选7个数，因此每张图这些原始预测共176,400→714,000个数。候选数和原始输出量会增多，但卷积计算、显存峰值、后处理和整机延迟还受其他因素影响，不能把候选比例直接当成整网耗时比例。',
      '官方P2配置anchors: 3使解析器先构建占位宽高，不能当成已适配数据的Anchor。用真实标签检查AutoAnchor执行结果和尺度顺序；显式列表应有四组、每组数目一致。构建时前向推导stride，预期[4,8,16,32]；还要核对输入尺寸与融合几何。',
      'build_targets按尺度循环，但仍需检查每尺度正样本和宽高匹配。当前ComputeLoss三尺度obj权重为[4.0,1.0,0.4]；非三尺度走另一默认列表，四尺度使用其前四项[4.0,1.0,0.25,0.06]。源码注释写P3–P7，不能宣称它为P2最优设计；需记录基线并比较验证结果。',
      'train.py还按检测尺度数nl缩放增益：box乘3/nl，cls乘nc/80×3/nl，obj乘(imgsz/640)²×3/nl。nl是尺度数量，nc是类别数，imgsz是训练尺寸参数。这些变化与按尺度obj权重不同，改结构时应一起记录。',
      '部署时核对候选数、raw列表长度、Anchor/grid缓存与NMS输入。通用后处理通常可读可变候选数，但自写代码或导出端可能写死25200、三尺度或Detect层号24。要比较P2值不值得，固定数据、输入、设备和阈值，分别记录小目标召回、误报、延迟与内存；“网格更多”只说明输出位置更多，不是性能保证。'
    ],quiz('候选数增加约4倍，能推断整网延迟也约4倍吗？',['能','不能，要固定设备与协议测量','只有2类能'],1,'特征计算、搬运与后处理也影响延迟，不能只按候选数估计。'),{code:[
      '# 在已安装依赖的YOLOv5仓库根目录运行','import torch','from models.yolo import Model',
      'model = Model("models/hub/yolov5-p2.yaml", ch=3, nc=2).eval()',
      'with torch.inference_mode():','    decoded, raw = model(torch.zeros(1, 3, 640, 640))',
      'print(model.model[-1].stride.tolist())  # [4,8,16,32]',
      'print([list(p.shape) for p in raw])',
      '# [[1,3,160,160,7], [1,3,80,80,7], [1,3,40,40,7], [1,3,20,20,7]]',
      'print(list(decoded.shape))  # [1,102000,7]',
      '# anchors:3的占位宽高尚未由真实数据适配，不用于质量判断。'
    ].join('\n'),codeLabel:'Python · 完整P2结构检查，不含训练'})
  );
  add('yolo-head',part('head-decoupled','改法三：按任务分支，保持每个候选的字段约定',[
    '标准YOLOv5检测头可称为耦合头：同一个尺度特征经过一个输出卷积，同时给出框、物体性和类别数值。框回归要回答“边界落在哪儿、宽高多大”；分类要回答“这是什么类别”。二者共享前面的特征，但最后关注的线索不完全相同。解耦头让共享特征之后再分出任务专用的卷积路径，目的是让定位和分类各自处理更合适的特征，减少最后几层互相牵制的可能；它不会消除共享主干中的所有任务影响，也不保证所有数据上都会更准。',
    '解耦头不是“每个尺度多出一个检测尺度”：例如P3仍只有一个80×80网格，网格位置和Anchor数量没有因此翻倍，只是该尺度内部多了预测分支。新增分支会增加参数、乘加计算和实现复杂度；是否值得，要在同一训练数据、预算、阈值和设备上与原头做对照。',
    '这里保留Anchor、objectness和[tx,ty,tw,th,to,classes...]字段，只演示先按任务预测、再按每个Anchor重组。其他检测器可能移除objectness或改变回归与匹配，不能直接套nc+5。解耦不自动等于Anchor-free，也不自动变成另一版本的YOLO。',
    '以P3、B=1、A=3、H=W=80、nc=2为例：框分支12个通道，重排为[B,A,4,H,W]；物体性3通道重排为[B,A,1,H,W]；分类6通道重排为[B,A,2,H,W]。逐个Anchor取出这三组数后，沿字段轴dim=2拼成[B,A,7,H,W]，再换轴为[B,A,H,W,7]。每个位置和Anchor都仍按[4个框数、1个物体性数、2个类别数]排列。若先把全部框、全部物体性、全部类别通道直接拼成一长串再view，元素总数虽相同，Anchor边界却错开，损失会把框字段当成物体性或类别。',
    '真正接入还需定义与导入模块、调整parse_model通道参数、尺度与Anchor/stride初始化、分支偏置初始化，并让训练、损失、解码和导出识别新接口。构建过程可能通过isinstance(Detect)识别头；不能只替换最后一层就认为兼容。',
    '下面是独立的单尺度教学模块，仅说明字段组织。它未接入YOLOv5解析器、训练器或导出器，也没有训练质量实验。实际改造还要确认分类分支使用的类别损失、框/物体性目标、Anchor解码顺序和偏置初始化与输出字段一致；并分别验证前向形状、有限数值、损失、反传、优化器是否收到新参数及部署结果。只有形状对上，仍不能证明模型行为正确。'
  ],quiz('框12、物体性3、分类6通道，为什么不能直接cat再view？',['元素总数不同','按任务排列不能自动变成按Anchor分组','cat不能拼通道'],1,'元素数虽相同，字段会错位；先分出Anchor轴，再沿每个Anchor的字段轴拼接。'),{code:[
    'import torch','from torch import nn','',
    'class TeachingDecoupledScale(nn.Module):',
    '    def __init__(self, c=256, nc=2, anchors=3):',
    '        super().__init__()',
    '        self.nc, self.na = nc, anchors',
    '        self.cls_features = nn.Sequential(nn.Conv2d(c, c, 3, padding=1), nn.SiLU())',
    '        self.box_features = nn.Sequential(nn.Conv2d(c, c, 3, padding=1), nn.SiLU())',
    '        self.box = nn.Conv2d(c, anchors * 4, 1)',
    '        self.obj = nn.Conv2d(c, anchors, 1)',
    '        self.cls = nn.Conv2d(c, anchors * nc, 1)','',
    '    def forward(self, x):',
    '        B, _, H, W = x.shape',
    '        reg = self.box_features(x)',
    '        box = self.box(reg).view(B, self.na, 4, H, W)',
    '        obj = self.obj(reg).view(B, self.na, 1, H, W)',
    '        cls = self.cls(self.cls_features(x)).view(B, self.na, self.nc, H, W)',
    '        grouped = torch.cat((box, obj, cls), dim=2)',
    '        return grouped.permute(0, 1, 3, 4, 2).contiguous()','',
    'head = TeachingDecoupledScale().eval()',
    'with torch.inference_mode():',
    '    out = head(torch.zeros(1, 256, 80, 80))',
    'print(list(out.shape))  # [1,3,80,80,7]',
    '# 只有原始预测；没有Anchor解码、损失或NMS。'
  ].join('\n'),codeLabel:'Python · 独立教学模块，未接入YOLOv5训练器'}));
  add('anchors',part('anchor-range','参考宽高、解码范围与匹配门槛分别是什么',[
    '例如像素参考宽度a_w=10，原始t_w=0，Sigmoid为0.5，解码宽度为(2×0.5)²×10=10。Sigmoid约0.75时宽度为22.5。预测可以调整参考宽度，但单个候选仍受本解码公式限制。',
    '\\[b_w=(2\\sigma(t_w))^2a_w,\\quad 0<b_w<4a_w\\] a_w为像素参考宽度，t_w为原始宽度参数，b_w为解码宽度，σ为Sigmoid；高度用a_h、t_h、b_h同理。对有限实数这是开区间，有限精度可能使Sigmoid饱和到边界。多组参考框各有范围，不能把一组上限当作整网统一上限。',
    '训练匹配另按宽高比例及倒数筛选，默认anchor_t=4要求最大比例严格小于4，还结合网格和邻格分配。可表达某个宽高不等于一定分配给该候选训练；参考宽高、解码范围与匹配门槛应分别检查。'
  ],quiz('a_w=10、Sigmoid(t_w)=0.75，宽度是多少？',['7.5','15','22.5'],2,'(2×0.75)²×10=22.5，不能省略平方。')));
  const checkpoints=find('yolo-checkpoints');
  checkpoints.sections[0].paragraphs.push('改类别或结构前，可到Detect课的“改法一”核对输出。仅用strict=False不会自动跳过同名尺寸不匹配的参数；本地train.py先用intersect_dicts筛选，再加载。拓扑改变后层号和职责可能变化，同样形状也不是语义兼容的证明。');
  const headNav=find('yolo-head');headNav.time=95;
  headNav.desc='从单位置乘加、字段和换轴读懂Detect，再学习改类别、加P2与按任务分支。';
  headNav.goals.push('修改类别数并核对预训练参数迁移。','对照P2和任务分支改造，检查连接、监督与部署约定。');
  headNav.keypoints.push('类别数改变单候选字段；检测尺度改变候选数量、连接和训练缩放。');
  // Mark inherited code fragments as fragments instead of executable complete programs.
  for(const l of lessons.filter(l=>l.group==='yolo'))for(const s of l.sections){
    if(s.code&&!s.codeLabel&&/\bself\./.test(s.code)){
      s.codeLabel='Python · 模块内部源码片段';
      s.codeNote='本段位于对应模块类内部，self和输入变量由该类与forward提供；请结合上方结构图阅读。';
    }
  }
  for(const id of ['yolo-backbone','yolo-neck','yolo-head','anchors']){
    find(id).sections.forEach((s,i)=>{s.title=(i+1)+'. '+s.title.replace(/^\d+[.、]\s*/, '');});
    source(id,'YOLOv5 v7.0：Detect与配置解析','models/yolo.py');
  }
  source('yolo-head','YOLOv5 v7.0：P2配置','models/hub/yolov5-p2.yaml');
  source('yolo-head','YOLOv5 v7.0：训练与参数迁移','train.py');
  source('yolo-head','YOLOv5 v7.0：目标分配与损失','utils/loss.py');
})();
