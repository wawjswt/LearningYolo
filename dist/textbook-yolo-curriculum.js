/* YOLOv5 教材主线：背景→配置→网络→训练→应用。拆分课程保留原小节及互动。 */
(()=>{
  const catalog=typeof lessons!=='undefined'?lessons:window.lessons;
  if(!catalog)return;
  const originals=new Map(catalog.map(l=>[l.id,l]));
  const sections=new Map(catalog.map(l=>[l.id,l.sections.slice()]));
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const exercise=(q,options,answer,why)=>({q,options,answer,why});
  const paper=(label,url)=>({label,url});
  const refs={rcnn:paper('R-CNN 原论文（2013预印本／CVPR 2014）','https://arxiv.org/abs/1311.2524'),fast:paper('Fast R-CNN 原论文（2015）','https://arxiv.org/abs/1504.08083'),faster:paper('Faster R-CNN 原论文（2015）','https://arxiv.org/abs/1506.01497'),yolo:paper('YOLO 原论文（2015预印本／CVPR 2016）','https://arxiv.org/abs/1506.02640'),ssd:paper('SSD 原论文（2015预印本／ECCV 2016）','https://arxiv.org/abs/1512.02325'),v2:paper('YOLO9000 / YOLOv2 原论文','https://arxiv.org/abs/1612.08242'),v3:paper('YOLOv3 技术报告','https://arxiv.org/abs/1804.02767'),v4:paper('YOLOv4 原论文','https://arxiv.org/abs/2004.10934'),v5:paper('Ultralytics YOLOv5 官方仓库','https://github.com/ultralytics/yolov5'),v6:paper('YOLOv5 v6.0 发布说明','https://github.com/ultralytics/yolov5/releases/tag/v6.0')};
  const moves=new Map(),redirects=new Map(),newLessons=[];
  const section=(id,title,paragraphs,test,playground='')=>({id,title,paragraphs,exercise:test,playgroundId:playground||id,legacyIndex:100+newLessons.length,depth:''});
  function take(origin,indices,destination){return indices.map(i=>{
    const old=sections.get(origin)[i];if(!old)throw new Error('Missing source section '+origin+':'+i);
    const key='curriculum-'+old.id;
    moves.set(key,{origin,index:old.legacyIndex??i,playground:old.playgroundId||i});
    redirects.set(origin+'/section-'+old.id,{lesson:destination,section:old.id});
    redirects.set(origin+'/section-'+String((old.legacyIndex??i)+1),{lesson:destination,section:old.id});
    return {...old,paragraphs:old.paragraphs.slice(),playgroundId:key,sourceLesson:origin,sourceIndex:i};
  });}
  function make(id,title,desc,parts,goals,test,options={}){
    title=title.replace(/^\d+ · /,'');
    const terms=options.terms||['object-detection','feature-map','bounding-box'];
    const l={id,group:'yolo',title,desc,sections:parts.map((s,i)=>({...s,title:(i+1)+'. '+s.title.replace(/^\d+[.、]\s*/, '')})),time:options.time||Math.max(15,parts.length*7),level:options.level||'基础',goals,prereq:options.prereq||'按本专题顺序接着上一课学习；需要时可点开术语卡补充基础。',prereqLinks:[],keypoints:goals.slice(),quiz:test,chapterExercises:[test],worked:{title:'学完先检验自己的理解',prompt:test.q,solution:test.options[test.answer]+'。'+test.why},code:options.code||'',language:options.language||'源码流程示意',sources:options.sources||[refs.v5],visual:'',figureKeys:[],foundation:{title:options.start||title,question:options.question||desc,why:goals[0],example:options.example||test.why,terms}};
    l.curriculumIntro=options.intro||desc;
    if(parts.some(s=>s.sourceLesson))l.sources.push(paper('完整随课仓库导览（Markdown）','assets/yolov5l/PROJECT_STRUCTURE.md'));
    newLessons.push(l);return l;
  }
  const qIntro=exercise('一张图里有三辆车，要给每辆车的位置，模型需要输出什么？',['一个“有车”标签','三组类别、位置和分数','整张图的平均颜色'],1,'检测的答案是一组目标记录；目标数可以随图片变化，每条记录有类别与框。');
  make('detection-intro','01 · 目标检测从哪里来：为什么“有车”还不够','先区分分类、定位与检测，再看逐窗口搜索为什么产生重复计算。',[
    section('detection-problem','先提出一个真实问题',[
      '假设道路相机拍到三辆车。回答“这张图有车”只能说明存在性，无法告诉系统车在哪里、哪一辆正在接近路口。目标检测要给每个目标一条记录：类别是什么、边界框在哪里，以及模型给出的分数。',
      '边界框是包住目标的矩形，通常用左上角和右下角，或中心、宽高表示。分类通常回答整张图属于哪类；单目标定位常假设只找一个目标；检测允许一张图有零个、一个或多个目标，输出条数不固定。先确定这个区别，再讨论模型结构。'
    ],qIntro),
    section('detection-window','最直接的办法：拿小窗逐块找',[
      '如果手里只有一个能判断“小图里有没有车”的分类器，可以拿一个窗口在大图上移动，把每块区域都送进去判断。这叫滑动窗口。车可能大小不同，所以还需要不同窗口大小，或对图像做不同缩放。',
      '下面只数正方形640×640图上的窗口，步幅固定32像素。64×64窗口横向有(640−64)/32+1=19个位置，纵向也19个，共361次检查。再加128和256两种窗口，共361+289+169=819个位置。这里把“窗口检查次数”作为教学预算，不等于任何具体模型的实测耗时。',
      '邻近窗口通常大量重叠，若每块都独立提取图像特征，会反复处理同一区域。后续方法围绕两个问题改进：怎样减少无效位置，怎样共享整张图的特征计算。这个问题把我们带到候选区域方法与密集预测方法。'
    ],exercise('为什么滑动窗口常需要多个尺度？',['目标在图中大小不同','每个尺度对应一个类别编号','只为增加颜色'],0,'同一类车可能近大远小，固定大小窗口不一定覆盖不同目标。'),'curriculum-sliding'),
    section('detection-answer','从输出到评价：不是画出框就完成任务',[
      '模型可能把同一辆车报出多个框，也可能把背景误认为车。实际使用要筛选分数、处理重复框，再与标注比较位置和类别；误报、漏检、速度和稳定性都会影响是否有用。',
      '下一课先看“两阶段”怎样先找可能有目标的区域，再对这些区域精细作答。此处只建立问题，不要求先掌握网络公式。'
    ],exercise('模型为同一辆车报出五个框，能直接算成发现五辆车吗？',['能','不能，要处理重复预测并按评估规则匹配','只看颜色'],1,'候选预测数量与真实目标数量不是一回事。'))
  ],['区分整图分类、单目标定位与多目标检测。','用窗口数量解释“位置与尺度搜索”的计算问题。'],qIntro,{time:25,terms:['classification','object-detection','bounding-box','sliding-window'],example:'同一张三辆车的照片：分类给“有车”；检测给三辆车各自的类别、框和分数。',sources:[refs.rcnn,refs.yolo]});
  const qTwo=exercise('“两阶段”的两个阶段主要指什么？',['网络恰好只有两个卷积层','先产生候选区域，再对候选做分类和框精修','先训练一次，再验证一次'],1,'阶段按检测职责划分，不能按卷积层数或是否调用两次程序判断。');
  make('detection-two-stage','02 · 两阶段检测：从R-CNN到Faster R-CNN','沿着“先找哪里可能有目标，再判断是什么”理解三次改进。',[
    section('two-stage-idea','先圈出值得细看的地方',[
      '在一张拥挤街景中，可以先粗略圈出可能含目标的区域，再逐个判断类别并把框调准。前一部分产生候选区域，后一部分对候选区域作分类和框回归；这就是两阶段检测的核心分工。',
      '候选区域不是真实标注，也不是最终检测结果，它可能含目标，也可能只是背景。框回归表示预测框位置与大小的修正量，不是回去重新拍摄图片。'
    ],qTwo,'curriculum-two-stage'),
    section('rcnn-share','R-CNN：把区域交给卷积网络',[
      'R-CNN是基于候选区域使用卷积网络特征的检测方法；ROI（Region of Interest，感兴趣区域）指当前准备检查的那块范围。其出发点是先找可能有物体的区域，再借助图像识别网络判断类别并修正框。它不要求候选在产生时就已经属于某个正确类别。 R-CNN先用Selective Search等方法产生一批候选区域。Selective Search可先理解为根据颜色、纹理等线索合并图像区域的候选搜索方法；它不等于后来神经网络中的RPN。',
      '早期R-CNN对每个候选裁剪并变换尺寸，分别用卷积网络提取特征，再分类和修正框。它展示了深度特征对检测的价值，但大量重叠候选各自提特征，会产生重复计算。论文预印本发表于2013年，会议版本为CVPR 2014；两种年份应区分。'
    ],exercise('R-CNN候选窗口大量重叠时，主要重复在哪里？',['每个候选分别提取卷积特征','类别名称的拼写','图片文件名'],0,'许多候选包含相同像素，却分别通过特征网络。')),
    section('fast-faster','Fast与Faster分别把哪一步加快',[
      'Fast R-CNN先对整张图提取共享特征，再把外部方法产生的候选映射到特征图，用RoI Pooling等操作组织成固定尺寸特征，送入分类与框回归分支。RoI是Region of Interest，意为感兴趣区域。共享特征减少了每个候选都重复跑整套卷积的开销。',
      'Faster R-CNN进一步用Region Proposal Network（RPN，区域建议网络）从共享特征产生候选，再交给区域检测头分类和精修。它仍有候选生成与候选处理的两阶段分工，即使两者能共享特征并构成一套模型。'
    ],exercise('Faster R-CNN中的RPN负责什么？',['产生值得后续检查的候选区域','直接把所有类别和最终框都确定下来','存储图片路径'],0,'候选还要经过区域检测头的分类与框精修。')),
    section('two-stage-boundary','这里的“阶段”不等于forward次数',[
      '不能用“一个模型文件”“一次函数调用”来判断是不是一阶段。Faster R-CNN可以在一次程序调用中完成候选与区域检测；网络内部仍有两种不同职责。',
      '两阶段常把计算集中到挑选后的区域，但速度与精度取决于具体骨干、候选数、输入尺寸、硬件和实现。不能写成“两阶段必定更准、一阶段必定更快”。下一课看省去独立候选区域处理环节后，检测器怎样直接产生预测。'
    ],exercise('把Faster R-CNN封装成一个predict函数，会变成一阶段吗？',['会','不会，内部职责没有因此改变','取决于函数名'],1,'阶段描述算法的预测流程，而非API调用次数。'))
  ],['说清候选区域、分类与框精修的不同职责。','解释R-CNN、Fast R-CNN、Faster R-CNN改进了哪些重复计算。'],qTwo,{time:35,terms:['two-stage-detection','region-proposal','rpn','roi-pooling'],sources:[refs.rcnn,refs.fast,refs.faster]});
  const qOne=exercise('YOLOv5是一阶段检测器，但仍做NMS，这矛盾吗？',['矛盾，一阶段不能做后处理','不矛盾，一阶段指直接生成密集检测预测的方式','NMS就是第二阶段区域检测头'],1,'筛选和去重不等于针对候选区域另做分类精修的第二阶段检测头。');
  make('detection-one-stage','03 · 一阶段检测：YOLO与SSD怎样直接预测','对照两条流水线，区分候选区域、密集预测、参考框和后处理。',[
    section('one-stage-direct','在共享特征上直接写答案',[
      '一阶段检测器通常在特征图的许多位置直接预测框与类别相关分数，不先产生一批区域，再逐个抽取区域特征交给独立区域检测头。这种在许多位置同时作答的方式叫密集预测。',
      '可以把两阶段比作“先列重点区域，再逐个细查”，把一阶段比作“在整张地图的多个位置直接写出候选答案”。两者都会产生需要处理的预测；一阶段并不表示没有卷积模块、没有多尺度，也不表示不能筛选或去重。'
    ],qOne,'curriculum-one-stage'),
    section('yolo-ssd','YOLO与SSD提供了哪些思路',[
      '初代YOLO把整图检测组织为统一网络的预测问题；它的网格、输出约定和损失属于当时版本，不能直接套到YOLOv5。YOLO全称You Only Look Once，常译“你只看一次”，强调统一的整图检测思路。',
      'SSD全称Single Shot MultiBox Detector。它在不同分辨率的特征图上使用多种默认框形状，预测类别分数和框调整，照顾不同大小目标。学习它的价值是理解“多个尺度直接预测”；不能因为YOLOv5也有多尺度，就认为两者每个模块、匹配与损失完全相同。'
    ],exercise('“一阶段”能否同时在三张特征图上作预测？',['不能，多张图就是多阶段','可以，尺度数量与阶段数量是不同划分','只能有一个候选框'],1,'P3/P4/P5是不同空间尺度；它们可共同构成一阶段检测器。')),
    section('stages-anchors','是否使用Anchor是另一条分类轴',[
      'Anchor是参考宽高，用来组织预测和训练匹配。它与“两阶段还是一阶段”描述的是不同问题：Faster R-CNN的RPN可以使用Anchor，一阶段的YOLOv5也使用Anchor；另一些一阶段检测器采用Anchor-free设计。',
      '因此比较方法时至少分别问：是否先产生候选区域再做区域检测？怎样表示框？怎样分配训练目标？怎样筛选输出？先分清这几条轴，后面就不会把P3/P4/P5、三种损失、Anchor和两个阶段混为一谈。'
    ],exercise('YOLOv5有三个检测尺度和三类损失，所以是三阶段吗？',['是','不是，这些是尺度和监督分工','取决于类别数'],1,'阶段、尺度、损失项数量描述不同层面的事情。'))
  ],['对比一阶段与两阶段的预测流水线。','区分检测阶段、特征尺度、Anchor与NMS。'],qOne,{time:30,terms:['one-stage-detection','dense-prediction','ssd','anchor','nms'],sources:[refs.yolo,refs.ssd,refs.faster]});
  const qHistory=exercise('学习YOLOv5时，为什么不能直接照抄初代YOLO的输出公式？',['同名系列就完全相同','不同版本的结构、输出、匹配和损失发生了变化','初代模型没有图片输入'],1,'应按本课随附YAML与对应代码核对，版本名称不能替代实现证据。');
  make('yolo-evolution','04 · 走到YOLOv5：问题、改进与版本边界','按方法想解决的问题理解演进，明确本课程讲哪份实现。',[
    section('yolo-timeline','先看问题怎样变化，再记版本名',[
      '本课用一条经过取舍的历史线索帮助建立背景：初代YOLO强调统一的整图预测；YOLOv2引入基于参考框等改进；YOLOv3用更强特征提取与多尺度预测；YOLOv4强调多种结构和训练方法的组合。这里只概括与后续课程相关的思想，不把每个版本当成只改一个零件。',
      '年份要区分预印本与会议：初代YOLO预印本为2015、CVPR为2016；YOLOv2的YOLO9000预印本为2016、CVPR为2017；YOLOv3技术报告为2018；YOLOv4论文为2020。时间接近不代表前者一定是后者的直接代码父版本。'
    ],qHistory,'curriculum-timeline'),
    section('v5-project','YOLOv5在这条线索中的位置',[
      '这里的YOLOv5指Ultralytics维护的项目与模型实现。YOLO系列有不同团队的分支和实现来源，版本数字不表示始终由同一作者、在同一代码线上连续升级。研究与复现应写明具体仓库、版本和配置。',
      '本课程选用本地随课提供的、使用C3、SPPF和基于Anchor的Detect配置，以YOLOv5l逐层演示。官方v6.0发布说明包含入口Focus替换为6×6卷积、SPP替换为SPPF等变化；有Focus的旧教程与当前6×6入口可能对应不同配置。',
      'n/s/m/l/x主要是标准结构的宽深缩放；P2、P6、分割头或自定义模块还可能改变拓扑。后续讨论都要能落回YAML和实际模块，而不是默认所有名为YOLO的模型输出与损失相同。'
    ],exercise('看到旧教程的Focus、当前配置的6×6卷积，首先做什么？',['立即判定其中一个错误','核对仓库版本与实际YAML','把所有卷积都换掉'],1,'版本和配置可能不同；先对照实现，再讨论改进。')),
    section('course-contract','接下来怎样从背景走向实现',[
      '接下来先看整机图和仓库地图，准备数据与YAML，再拆Backbone、C3、SPPF、FPN/PAN、Detect。读懂预测怎样产生之后，再学Anchor、目标分配、损失与参数更新。',
      '最后完成验证、推理、导出与实验复盘。每课有前置知识和下一课入口；概念可以先通过图解学习，实际运行代码时再按环境准备步骤操作。'
    ],exercise('进入C3源码前，本路线先安排什么？',['检测任务背景、方法分工、整网图与配置阅读','先背所有模型参数量','只下载一个权重'],0,'先知道问题和整体结构，模块细节才有明确作用。'))
  ],['用问题驱动的方式概括YOLO系列演进。','明确本课YOLOv5配置的版本边界与学习顺序。'],qHistory,{time:25,terms:['yolov5','c3','sppf','anchor'],sources:[refs.yolo,refs.v2,refs.v3,refs.v4,refs.v5,refs.v6]});

  const arch=make('architecture','05 · YOLOv5整机图：从输入到检测答案','先认清整机的三个职责，再进入图纸、模块与训练。',take('architecture',[0,11],'architecture'),['用自己的话解释Backbone、Neck和Detect的职责。','区分YAML的head字段与按功能划分的检测头。'],exercise('Neck主要解决什么问题？',['为不同尺度整理和融合特征','保存标签路径','计算最终mAP'],0,'Backbone提取特征，Neck融合，Detect产生预测；评价由另一条流程完成。'),{time:20,terms:['backbone','neck','head']});
  arch.sections[0].paragraphs=arch.sections[0].paragraphs.map(p=>p.replace('用下一节的逐层浏览器查看每一步。','完整逐层浏览器安排在后面的“模型YAML”课。').replace('请接着阅读第13～16节实图案例','请接着阅读后面的“实图串讲”课'));
  make('yolo-repository','06 · 仓库地图：一项任务对应哪些文件','先定位训练、验证、推理、配置和工具，再跟着函数入口阅读。',take('train-yolo',[4],'yolo-repository').concat([
    section('repository-reading','按问题跟读，而不是从第一行背到最后',[
      '第一次进入仓库，先在detect.py找输入、模型加载、预测和保存四个位置；再到models/yolo.py看网络怎样组装，遇到C3等模块再查common.py。每次只追一个问题，记录输入和输出。',
      '训练时再从train.py跟到ComputeLoss、build_targets和优化器更新。分类、实例分割、模型导出有各自入口；它们使用的标签与输出不同。项目压缩包、权重、图片结果和缓存不等同于核心源码。'
    ],exercise('想知道“模型错误怎样变成参数更新”，优先沿哪条链？',['train.py→ComputeLoss→backward→优化器step','LICENSE→图片文件名','只看results.png'],0,'这条调用链把预测、损失、梯度与参数修改连起来。'))
  ]),['按任务定位关键入口与工具文件。','知道遇到模块或函数时怎样继续跟读。'],exercise('models/yolo.py主要负责什么？',['读取所有摄像头视频','解析模型配置并定义检测模型/检测头','替代数据集标注'],1,'它把YAML描述组装成实际模型；具体积木定义多在common.py。'),{terms:['source-repository','yaml','checkpoint']});
  make('yolo-data','07 · 第一个检测项目：图片、标签与数据配置','把任务、类别、标注、路径和验证划分准备成可检查的输入。',[
    section('yolo-data-contract','先写清模型要找什么',[
      '以烟雾和火焰为例，先规定类别0对应smoke、类别1对应fire，再明确何种边缘算框、遮挡目标如何标、容易混淆的蒸汽如何处理。类别和标注协议是训练的答案约定，不能等训练后再临时决定。',
      '检测标签每行是class、x_center、y_center、width、height，后四项相对于图像宽高归一化。1000×500图像中，左上角(400,160)、宽200高80的框，中心(500,200)，标签坐标为(0.5,0.4,0.2,0.16)。'
    ],exercise('1000像素宽图像上的200像素框宽，归一化后是多少？',['200','0.2','5'],1,'相对宽度=框宽÷图像宽=200/1000。')),
    {...sections.get('dataset').find(s=>s.id==='repo-dataset-path'),id:'yolo-data-paths',playgroundId:'repo-dataset-path',legacyIndex:101},
    section('yolo-data-split','划分数据并检查能否复现',[
      '同一视频的相邻帧若进入训练和验证，背景与目标可能高度相似，成绩会偏乐观。按视频、现场或采集批次分组划分，再检查类别和场景覆盖。测试集保留给最终评估，避免反复看测试结果调参。',
      '开训前画出图片上的框，核对样本数、类别编号、空标签与漏标。先运行少量批次证明路径和监督走通，再扩大预算。完整的数据格式与质量检查可返回前面的计算机视觉基础课学习。'
    ],exercise('同一视频的邻近帧怎样划分更能避免泄漏？',['随机打散到两边','优先按完整视频或来源分组','全部删除标签'],1,'分组可减少近似样本跨集合，使验证更接近新场景。'))
  ],['准备可解释的类别、框标签和数据YAML。','沿实际解析规则核对路径并阻断数据泄漏。'],qIntro,{time:30,terms:['label','yaml','training-set','validation-set']});
  make('yolo-config','08 · 读懂模型YAML：连线、通道与规模缩放','把[from,number,module,args]和实际生成的层对应起来。',take('architecture',[1,16],'yolo-config'),['从配置读出来源层、模块参数与形状变化。','区分C3内部重复和外部模块数，比较n/s/m/l/x。'],exercise('l模型的[-1,6,C3,[256]]表示什么？',['6个独立C3','一个内部6个Bottleneck、输出256通道的C3','6个类别'],1,'l的宽深系数为1；解析器将number传给C3内部，外层只构建一个模块。'),{time:35,terms:['yaml','channel','c3','bottleneck']});
  make('yolo-backbone','09 · Backbone：像素怎样逐层成为特征','先拆Conv，再追踪640→320→160→80→40→20的空间变化。',take('architecture',[2,3],'yolo-backbone'),['解释卷积、BN和SiLU在Conv中的分工。','沿下采样追踪特征尺寸，区分步幅和感受野。'],exercise('特征图从80×80变40×40，等于类别数减半吗？',['是','不是，空间尺寸与类别数不同','只能用于两阶段模型'],1,'空间尺寸是位置网格数量；类别数由检测任务决定。'),{terms:['convolution','batch-normalization','silu','spatial-stride'],time:30});
  make('yolo-c3','10 · 进入C3与Bottleneck：分支、重复与残差','把一个模块拆开，辨认哪些地方拼接、哪些地方相加。',take('architecture',[4,5],'yolo-c3'),['画出C3的两路分支及内部Bottleneck序列。','判断shortcut=False与残差成立条件。'],exercise('C3外部分支融合执行什么？',['沿通道Concat','把输入原样与输出相加','直接取两者最大值'],0,'Bottleneck内部可能有残差相加；C3外部是拼接，再用卷积融合。'),{terms:['c3','bottleneck','residual-connection','concatenation'],time:35});
  make('yolo-sppf','11 · SPPF：同一张特征图怎样看得更广','拆解串行最大池化、四路拼接及两侧卷积。',take('architecture',[6],'yolo-sppf').concat([
    section('sppf-meaning','为什么既保留原特征，又收集更大范围',[
      '同一个局部亮点可能是火，也可能是反光。模型需要把附近纹理和更大背景一起考虑。SPPF把池化前的特征与连续池化结果合并，提供不同邻域范围的响应，后续卷积再学习组合。',
      '连续三次5×5、步长1的池化，覆盖范围相对模块内池化前特征为5、9、13；这些不是完整网络在原图上的感受野。适当填充保持空间边长不变，拼接增加通道，再由卷积融合。池化本身不学习参数。'
    ],exercise('SPPF里的5、9、13指什么？',['原图上固定像素范围，所有层都一样','相对模块内池化前特征的有效窗口范围','类别编号'],1,'原图完整感受野还受前面各层影响，不能只看这个池化窗口。'))
  ]),['逐步计算SPPF的空间与通道变化。','解释多范围聚合及其感受野边界。'],exercise('SPPF空间尺寸不变，是否代表没有利用更大邻域？',['是','不是，步长1池化可在保持尺寸时扩大覆盖范围','只有减半才能看邻域'],1,'输出分辨率与一个输出位置覆盖的输入范围是两个概念。'),{terms:['sppf','pooling','receptive-field','concatenation'],time:25});
  make('yolo-neck','12 · FPN与PAN：不同尺度怎样交换信息','按层号核对上采样、下采样与横向拼接，避免把前向路径当反传。',take('architecture',[7,8],'yolo-neck'),['沿FPN和PAN方向画出实际特征流。','核对Concat的来源与通道，不把拼接当残差。'],exercise('PAN里的“自底向上”是反向传播吗？',['是','不是，它仍是前向特征聚合','是NMS的排序'],1,'方向描述特征层级，梯度反向传播是另一条计算过程。'),{terms:['fpn','pan','upsample','concatenation'],time:35});
  make('yolo-head','13 · Detect检测头：特征怎样变成候选数字','拆开三尺度1×1卷积与维度重排，分清原始预测与最终答案。',take('architecture',[9],'yolo-head').concat([
    section('head-boundary','产生候选后，训练和推理分开走',[
      '固定2个类别时，每个Anchor需要4个框原始参数、1个目标性原始分数和2个类别原始分数，共7个数。每个尺度每个位置有3个Anchor，对应输出通道数21；这不意味着21个类别。',
      '训练时返回各尺度原始张量，让损失函数挑选匹配位置并监督；推理时解码坐标和分数，再筛选候选。没有经过筛选的候选数不等于真实目标数。下一阶段分别解释参考框、负责位置和监督值从哪里来。'
    ],exercise('2类检测任务，每个Anchor的输出长度是多少？',['2','7','21'],1,'4个框数+1个目标性数+2个类别数=7；21是3个Anchor卷积通道总数。'))
  ]),['解释三尺度预测的各维度和数字含义。','区分训练原始输出、推理解码与最终框。'],exercise('训练模式的Detect输出能直接当作原图上的矩形吗？',['能','不能，还需按对应流程解释与解码','只需改后缀'],1,'原始框参数不是原图像素坐标，原图还原还涉及预处理变换。'),{terms:['detect-module','logit','objectness','tensor'],time:40});
  make('anchors','14 · Anchor与AutoAnchor：先选合适的宽高参考','从网格和参考形状进入尺寸匹配，再判断是否需要搜索新Anchor。',take('anchors',[0,1,2,3,4],'anchors'),['解释参考框与最终预测框的关系。','计算BPR/AAT，区分几何适配与真实召回率。'],exercise('BPR很高是否保证模型Recall很高？',['保证','不保证，BPR只检查标签宽高与参考框匹配','BPR就是分类准确率'],1,'实际Recall需要使用模型预测与真实标注进行评估。'),{terms:['anchor','autoanchor','anchor-bpr','anchor-aat'],time:40});
  make('yolo-assignment','15 · 样本分配：哪个位置负责哪个真实目标','从标签坐标到Anchor筛选、邻格偏移和正样本索引。',take('yolo-loss',[1],'yolo-assignment').concat(take('anchors',[5],'yolo-assignment')),[
    '用标签、参考框与网格规则解释正样本怎样生成。','手算邻格的局部坐标，理解一个目标为何可有多个负责人。'
  ],exercise('局部中心为1.4一定是错误标签吗？',['一定','不一定，相对于左邻负责格时可以为1.4','说明类别数为1.4'],1,'要先看坐标参考点。目标中心42.4减去负责列41，得到局部中心1.4。'),{terms:['positive-sample','negative-sample','grid','coordinate'],time:35});
  make('yolo-loss','16 · 检测损失：框、目标性和类别各学什么','在目标分配之后，对照真实监督计算CIoU与BCE。',take('yolo-loss',[0,2,3,4],'yolo-loss'),['解释三类监督覆盖的预测位置。','区分IoU与CIoU，并解释objectness的连续目标。'],exercise('未匹配背景位置参与哪一项损失？',['只参与框损失','参与objectness监督，通常不参与框和类别损失','完全不参与'],1,'背景的objectness目标为0；框和类别主要针对匹配正样本。'),{terms:['ciou','bce-with-logits','objectness','compute-loss'],time:40});
  make('train-yolo','17 · 训练循环：从第一个batch到验证和保存','把数据读取、前向、反向、累积、更新、验证和保存串起来。',take('train-yolo',[0,2,3,5],'train-yolo'),['区分计算梯度与真正更新参数。','跟读每轮验证、fitness与检查点保存时序。'],exercise('每个batch反传之后，一定马上更新参数吗？',['一定','不一定，可能还在梯度累积','只有推理时更新'],1,'优化器step才改变参数；累积策略可能先收集多个batch梯度。'),{terms:['batch','epoch','gradient-accumulation','optimizer'],time:35});
  make('yolo-checkpoints','18 · 预训练、微调与断点续训：别只看文件名','分清参数来源、任务改变和恢复训练状态这三件事。',take('train-yolo',[1,6],'yolo-checkpoints'),['按任务选择--weights或--resume。','检查类别迁移与最终权重清理带来的恢复边界。'],exercise('正常完成后被清理的last.pt还能保证完整恢复优化器进度吗？',['能，名字就是last','不能，需要核对其内部状态','改成best.pt就能'],1,'正常退出可能清除优化器等状态并将epoch置为−1；可以加载参数微调，但不是完整中断状态。'),{terms:['checkpoint','pretrained-weights','fine-tuning','resume-training'],time:30});
  make('yolo-augment','19 · 训练策略：增强、输入尺寸与控制变量','固定验证协议，再根据问题改变训练过程。',take('yolo-augment',[0,1,2,3,4],'yolo-augment'),['沿实际调用链核对增强开关。','解释输入尺寸、batch、预算与实验对照关系。'],exercise('同时改输入尺寸、优化器和增强，分数提高后能知道是哪项起作用吗？',['能','通常不能，需要控制变量对照','只看最终分数即可'],1,'多个因素一起变化，很难分离每项的影响与副作用。'),{terms:['mosaic-augmentation','hyperparameter','vram','albumentations'],time:40});
  const qEval=exercise('验证只看mAP@0.5，而不看各类漏检和失败图，足够吗？',['足够','不够，还要结合严格IoU指标、分组和真实错误','只要训练loss低就行'],1,'汇总分数可能掩盖小目标、稀有类别或特定场景的失败。');
  make('yolo-evaluation','20 · 验证与选模型：让成绩能回答实际问题','把val.py输出、框匹配、mAP和模型选择连在一起。',[
    section('yolo-val-protocol','先固定验证要回答什么',[
      '验证用没有参与当前参数更新的数据，检查模型对任务的表现。val.py通常还要做候选筛选、NMS，然后按类别与框的重叠规则将预测和真实标注匹配；它不执行优化器更新。',
      '一个预测与真实框匹配成功要满足评价规则；重复报同一目标不能反复计成多个真阳性。TP表示按规则匹配成功的检测，FP表示误报或未匹配预测，FN表示未检出的真实目标。精确率TP/(TP+FP)问“报出的有多少对”，召回率TP/(TP+FN)问“真实目标找回多少”。'
    ],exercise('检出8个正确目标，另外误报2个，Precision是多少？',['8/10=0.8','8/8=1','2/10=0.2'],0,'Precision的分母是所有报出的预测，这里为8+2。')),
    section('yolo-map-fitness','AP、mAP与best.pt的关系',[
      '改变分数门槛，得到一条精确率—召回率曲线；AP概括一类目标在给定匹配规则下的曲线表现，mAP再对类别等指定维度求平均。@0.5表示用0.5的IoU匹配阈值；@0.5:0.95还在0.50、0.55到0.95这组阈值上求平均。',
      '本地标准检测的fitness评分为0.1×mAP@0.5+0.9×mAP@0.5:0.95。best.pt由这条评分规则选择，不是由最低训练loss或最高单次Precision决定。部署阈值还应结合可接受的误报、漏检和现场样本另行选择。'
    ],exercise('本地best.pt主要按什么选择？',['最低训练loss','验证fitness组合评分','文件体积最大'],1,'代码用指定验证指标组合选择，不是所有指标各自同时最优。')),
    section('yolo-eval-report','把一个总分拆回场景',[
      '同时检查按类指标、小目标表现、夜间或运动模糊场景、混淆矩阵与预测图。若总体mAP不错但稀有类别一直漏检，不能用总体平均值替代该类别的实际可用性。',
      '比较模型时固定数据划分、输入尺寸、分数与NMS设置、评价代码和权重。速度还需说明设备、batch、精度模式以及是否计入预处理与后处理；不同条件下的FPS不能直接排成优劣榜。基础AP推导可回前面的“检测评估指标”课深入学习。'
    ],qEval)
  ],['从TP/FP/FN解释验证指标与错误类型。','根据固定协议比较模型，理解best.pt评分规则。'],qEval,{time:30,terms:['precision','recall','map','fitness-score'],code:'python val.py --data data/myset.yaml --weights runs/train/你的实验名/weights/best.pt --imgsz 640\n# 先准备真实数据路径与权重，记录每类指标和失败图。',language:'Terminal'});
  const inferenceParts=take('inference',[0,1,3,4],'inference').concat(take('architecture',[10],'inference'));
  make('inference','21 · 推理与后处理：原始分数怎样成为原图上的框','解码、分数乘积、NMS与坐标还原按真实顺序讲。',inferenceParts,['手算中心解码并说明坐标参照图。','区分分数阈值、NMS阈值与评价匹配阈值。'],exercise('Detect解码得到84像素，能直接当原图横坐标吗？',['一定能','不能先这样假定，还需核对缩放与填充','84表示类别编号'],1,'解码坐标属于网络输入图；Letterbox预处理后通常还要还原到原图。'),{terms:['decode','sigmoid','nms','coordinate'],time:40,code:'python detect.py --weights runs/train/你的实验名/weights/best.pt --source "D:/你的图片目录" --imgsz 640 --conf-thres 0.25 --iou-thres 0.45',language:'Terminal'});
  make('yolo-export','22 · 导出与部署：把模型交给另一套运行环境','区分导出成功、输出一致、速度达标与业务可用。',take('inference',[2],'yolo-export').concat([
    section('export-check','部署前用同一输入逐步对齐',[
      '先保存一批固定输入与原PyTorch输出，再用导出模型处理同样输入。分别核对颜色顺序、归一化、输入尺寸、输出维度和解码约定，再核对NMS是否在模型内部或部署程序里执行。不能重复做，也不能漏做。',
      '最后比较任务指标、端到端延迟、显存或内存和异常输入处理。量化或不同运行后端可能引入数值差异，需要在目标设备验证。导出文件只是部署的一部分，类别名、预处理和后处理也属于可复现的交付物。'
    ],exercise('导出ONNX成功后，第一步应该怎样检查？',['立刻宣称精度不变','用相同输入逐段对比原模型和导出模型','删掉原权重'],1,'格式转换成功不保证预处理、输出解释和数值都一致。'))
  ]),['解释导出格式与运行环境的不同职责。','制定同输入、同协议的部署一致性检查。'],exercise('部署程序与模型内部都执行了NMS，需要核对吗？',['不需要，越多越好','需要，可能重复后处理并改变输出','只影响文件名'],1,'后处理的位置和参数必须明确，避免重复或遗漏。'),{terms:['onnx','runtime','latency','quantization'],time:25,code:'python export.py --weights runs/train/你的实验名/weights/best.pt --include onnx --imgsz 640\n# 先准备对应依赖，再在相同输入上验证输出与指标。',language:'Terminal'});
  make('yolo-trace','23 · 实图串讲：一张照片走完模型、训练与推理','回到同一张照片，串联输入张量、各层输出、监督和原图坐标。',take('architecture',[12,13,14,15],'yolo-trace'),['把已学模块连回一张真实输入照片。','区分训练监督链和实际推理链，逐段检查形状与坐标。'],exercise('真实标签会作为图像通道一起输入Backbone吗？',['会','不会，标签用于目标匹配、损失或评价','只在验证时作为第四通道'],1,'图像前向与标签监督是不同数据流，不能把框标签当额外像素通道。'),{terms:['tensor','compute-loss','backpropagation','inference'],time:45});
  make('debugging','24 · 复盘与改进：按证据定位问题','用数据、匹配、训练、后处理与场景切片组织下一轮实验。',take('debugging',[0,1,2,3,4],'debugging'),['把错误定位到可核对的具体环节。','保留足以复现实验的配置、代码、权重与评估记录。'],exercise('背景误报变多，最合理的下一步是什么？',['同时换所有训练参数','先归类误报、核对标签和后处理，再提出单因素实验','只增加epoch'],1,'先找主要错误来源，再控制变量验证修正效果。'),{terms:['false-positive','false-negative','source-repository','hyperparameter'],time:40});

  const phases=[
    {id:'background',title:'阶段一 · 先理解检测问题与方法背景',why:'先回答为什么要检测、一阶段与两阶段各自怎样作答，避免一上来就背模块名。',check:'能用自己的话画出两类检测流水线，并区分阶段、尺度和Anchor。',ids:['detection-intro','detection-two-stage','detection-one-stage','yolo-evolution']},
    {id:'project',title:'阶段二 · 认清整机、仓库、数据与图纸',why:'先知道输入、输出、配置和代码在哪里，再进入模块实现。',check:'能准备一份可检查的数据配置，并读懂一行模型YAML。',ids:['architecture','yolo-repository','yolo-data','yolo-config']},
    {id:'network',title:'阶段三 · 逐层拆开网络怎样计算',why:'沿图像特征流动顺序，拆模块内部并追踪空间与通道变化。',check:'能画出C3残差、SPPF四路特征和FPN/PAN连线，解释Detect每个输出数字。',ids:['yolo-backbone','yolo-c3','yolo-sppf','yolo-neck','yolo-head']},
    {id:'learning',title:'阶段四 · 理解模型怎样学、怎样选',why:'先分配负责人，再计算监督与梯度，随后训练、恢复、调参和验证。',check:'能追踪一个标签到正样本、损失、更新与保存，并按验证协议比较模型。',ids:['anchors','yolo-assignment','yolo-loss','train-yolo','yolo-checkpoints','yolo-augment','yolo-evaluation']},
    {id:'application',title:'阶段五 · 用起来、串起来、复盘改进',why:'把预测还原到原图，验证部署一致性，再用实图和失败样例完成闭环。',check:'完成一次可复现的小项目，能解释输出与失败原因，并提出下一轮实验。',ids:['inference','yolo-export','yolo-trace','debugging']}
  ];
  const firstYolo=catalog.findIndex(l=>l.group==='yolo'),before=catalog.slice(0,firstYolo),after=catalog.slice(firstYolo).filter(l=>l.group!=='yolo');
  catalog.splice(0,catalog.length,...before,...newLessons,...after);
  groups.yolo.name='YOLOv5 系统课程';groups.yolo.desc='按检测背景、仓库与配置、网络模块、训练机制、部署复盘五个阶段，按第0课背景导读与24课主线循序学习。';
  for(let i=0;i<newLessons.length;i++){
    const l=newLessons[i],previous=newLessons[i-1];
    l.yoloNumber=i+1;l.curriculumPhase=phases.find(p=>p.ids.includes(l.id)).id;
    l.prereqLinks=previous?[{id:previous.id,title:previous.title,href:'#lesson/'+previous.id}]:[{id:'tasks',title:'先分清分类、检测与分割',href:'#lesson/tasks'},{id:'cnn',title:'需要时补充卷积基础',href:'#lesson/cnn'}];
    l.prereq=previous?'先完成“'+previous.title.replace(/^\d+ · /,'')+'”；遇到术语可点开解释，运行代码前再准备环境。':'从识别图片中有什么开始；没有检测算法背景也可以阅读。';
    l.sections.forEach((s,index)=>{if(!s.sourceLesson)s.legacyIndex=100+index;});
  }
  // 为独立专题使用者列出真正的技术先修，避免相邻课代替必要基础。
  const baseLinks={
    'yolo-backbone':['cnn','pooling'],'yolo-c3':['network','gradient'],'yolo-loss':['losses','iou'],'train-yolo':['training','optimizer'],'yolo-evaluation':['metrics'],'yolo-data':['dataset']
  };
  for(const [id,ids] of Object.entries(baseLinks)){const l=newLessons.find(l=>l.id===id);for(const base of ids){const b=originals.get(base);if(b)l.prereqLinks.push({id:base,title:b.title,href:'#lesson/'+base});}}
  // 原笔记、完成标记保留在原课程ID；已答小节按稳定小节ID迁移到新归属。
  if(typeof state!=='undefined'){
    for(const [oldKey,target] of redirects){if(!oldKey.includes('/section-')||oldKey.match(/\/section-\d+$/))continue;const origin=oldKey.split('/')[0];
      const key=origin+':section:'+target.section,newKey=target.lesson+':section:'+target.section;
      if(state.exerciseAnswers&&state.exerciseAnswers[key]!==undefined&&state.exerciseAnswers[newKey]===undefined)state.exerciseAnswers[newKey]=state.exerciseAnswers[key];
      if(state.last===origin&&state.lastSection?.[origin]==='section-'+target.section){state.last=target.lesson;state.lastSection[target.lesson]='section-'+target.section;}
    }
  }
  const destinations={c3:'yolo-c3',bottleneck:'yolo-c3',sppf:'yolo-sppf',fpn:'yolo-neck',pan:'yolo-neck','detect-module':'yolo-head',yaml:'yolo-config','source-repository':'yolo-repository','resume-training':'yolo-checkpoints','fine-tuning':'yolo-checkpoints','gradient-accumulation':'train-yolo'};
  for(const [term,id] of Object.entries(destinations)){const item=window.visionlabGlossary?.byId[term];if(item)item.learnMore='#lesson/'+id;}
  const previousPlaygrounds=window.lessonPlaygrounds||{};
  let pendingLayer=null;
  window.lessonPlaygrounds={...previousPlaygrounds,initialize(){
    if(pendingLayer!==null){const root=document.querySelector('[data-yl-explorer]');if(root){root.dataset.layer=String(pendingLayer);pendingLayer=null;}}
    previousPlaygrounds.initialize?.();
  },render(id,key,legacy){
    const moved=moves.get(key);
    if(moved)return previousPlaygrounds.render?.(moved.origin,moved.playground,moved.index)||'';
    if(key==='curriculum-sliding')return slidingView(64);
    if(key==='curriculum-two-stage')return detectorView('two',0);
    if(key==='curriculum-one-stage')return detectorView('one',0);
    if(key==='curriculum-timeline')return timelineView(0);
    if(String(key).startsWith('repo-'))return previousPlaygrounds.render?.(id,key,legacy)||'';
    // 新小节不套用原architecture的数字索引互动。
    if(newLessons.some(l=>l.id===id))return '';
    return previousPlaygrounds.render?.(id,key,legacy)||'';
  }};
  const oldFigures=window.lessonFigures;
  if(oldFigures)window.lessonFigures={...oldFigures,placement(l){
    if(!newLessons.includes(l))return oldFigures.placement(l);
    const origins=[...new Set(l.sections.map(s=>s.sourceLesson).filter(Boolean))];
    return origins.flatMap(origin=>oldFigures.placement(originals.get(origin)).filter(p=>l.sections.some(s=>s.sourceLesson===origin&&s.legacyIndex===p.section)).map(p=>({...p,key:'moved-figure|'+origin+'|'+p.key})));
  },render(l,key){if(String(key).startsWith('moved-figure|')){const [,origin,real]=key.split('|');return oldFigures.render(originals.get(origin),real);}return oldFigures.render(l,key);}};
  // 保存原基础讲解；新课程通过各自foundation提供简明起点。
  function resolveRoute(hash){const parts=hash.replace(/^#/,'').split('/');if(parts[0]!=='lesson'||!parts[2])return null;const t=redirects.get(parts[1]+'/'+parts[2]);return t&&t.lesson!==parts[1]?'#lesson/'+t.lesson+'/section-'+t.section:null;}
  function renderCatalog(items,renderList){
    const allowed=new Set(items.map(l=>l.id));
    return '<section class="yc-syllabus"><div class="yc-syllabus-intro"><span class="chapter-kicker">YOLOv5 · 第0课背景＋24课主线</span><h2>先理解为什么，再学网络怎样算、模型怎样学</h2><p>每课围绕一个问题展开。按下面顺序学习；已有基础可按阶段进入。先用图解和生活例子建立直觉，再通过算例、源码和练习逐步深入。</p><a class="primary" href="#lesson/detection-history">从第00课开始 →</a><nav aria-label="YOLOv5阶段导航">'+phases.map((p,i)=>'<a href="#yc-phase-'+p.id+'">'+(i+1)+' · '+p.title.split('·')[1].trim()+'</a>').join('')+'</nav></div>'+phases.map(p=>{
      const list=p.ids.map(id=>newLessons.find(l=>l.id===id)).filter(l=>allowed.has(l.id));if(!list.length)return '';
      return '<section class="yc-phase" id="yc-phase-'+p.id+'"><h2>'+p.title+'</h2><p>'+p.why+'</p>'+renderList(list)+'<p class="yc-check"><strong>阶段验收：</strong>'+p.check+'</p></section>';
    }).join('')+'</section>';
  }
  function renderContext(l){if(l.yoloNumber===undefined)return '';const phase=phases.find(p=>p.id===l.curriculumPhase);return '<aside class="yc-course-context"><strong>YOLOv5系统课程 · 第'+String(l.yoloNumber).padStart(2,'0')+' / 共'+newLessons.length+'课</strong><span>'+phase.title+'</span><p>'+esc(l.curriculumIntro)+'</p><a href="#courses/yolo">查看五阶段完整顺序 ↗</a></aside>';}
  function slidingCount(size){return Math.floor((640-size)/32+1)**2;}
  function slidingView(size){const count=slidingCount(size);return '<div class="yc-demo" data-yc="sliding"><h3>换一个窗口大小，先估计要查多少位置</h3><div class="yc-controls">'+[64,128,256].map(n=>'<button type="button" data-yc-size="'+n+'" aria-pressed="'+(n===size)+'">'+n+'×'+n+'</button>').join('')+'</div><svg viewBox="0 0 640 320" role="img" aria-label="缩略整图与一个滑动窗口"><rect x="5" y="5" width="305" height="305" fill="#f4f1e9"/><path d="M5 210H310M5 245H310" stroke="#b8c1c5" stroke-width="22"/><rect x="70" y="180" width="55" height="30" rx="6" fill="#73998b"/><rect x="205" y="220" width="65" height="32" rx="6" fill="#8198ad"/><rect x="'+(30)+'" y="'+(35)+'" width="'+(size*305/640)+'" height="'+(size*305/640)+'" fill="#6957b522" stroke="#6957b5" stroke-width="3"/><text x="335" y="90" fill="currentColor">整图：640×640</text><text x="335" y="125" fill="currentColor">步幅：32</text><text x="335" y="160" fill="currentColor">一个窗口：'+size+'×'+size+'</text><text x="335" y="205" fill="currentColor">总检查位置：'+count+'</text></svg><p>每个方向 floor((640−'+size+')/32)+1='+Math.sqrt(count)+' 个位置，共'+count+'个。三种大小合计819个位置。</p><p class="yc-note">窗口只示意尺寸，不执行分类；次数不等于耗时。共享特征后也不能简单把819当作实测加速倍数。</p></div>';}
  const pipelines={two:[['整图提共享特征','卷积网络先把整张图片变成可复用的特征。'],['RPN产生候选区域','在共享特征上提议值得细看的框；这些框还不是真实标注或最终答案。'],['区域特征与检测头','按候选取区域特征，进一步判断类别并精修框。'],['筛选与去重','按规则保留输出，后处理不改变前面两阶段的职责划分。']],one:[['整图提共享特征','Backbone与多尺度融合先产生供预测使用的特征。'],['密集预测框与分数','在许多位置直接产生框、目标性和类别相关数字；没有独立的区域候选检测头。'],['解码、筛选与去重','将原始数字变成候选框并按规则保留；YOLOv5有NMS仍属于一阶段。']]};
  function detectorView(mode,step){const steps=pipelines[mode];return '<div class="yc-demo" data-yc="pipeline" data-mode="'+mode+'"><h3>'+ (mode==='two'?'以Faster R-CNN说明两阶段分工':'以YOLOv5说明一阶段预测')+'</h3><div class="yc-pipeline">'+steps.map(([name],i)=>'<button type="button" data-yc-pipeline="'+i+'" aria-pressed="'+(i===step)+'"><small>步骤'+(i+1)+'</small>'+name+'</button>').join('<span aria-hidden="true">→</span>')+'</div><div class="yc-detail" aria-live="polite"><h4>'+steps[step][0]+'</h4><p>'+steps[step][1]+'</p></div><p class="yc-note">按钮按处理步骤拆开说明。检测“一阶段／两阶段”的定义不等于图上按钮数量、卷积层数或API调用次数。</p></div>';}
  const milestones=[['R-CNN / Fast / Faster','2013/2014 → 2015','从逐候选提特征，到整图共享特征，再用RPN提出候选。','detection-two-stage'],['YOLO初代 / SSD','2015预印本；2016会议','直接预测与多尺度预测是理解后续一阶段方法的重要背景。','detection-one-stage'],['YOLOv2','2016预印本；2017会议','YOLO9000论文介绍YOLOv2的一组改进，包括参考框等设计。','anchors'],['YOLOv3','2018技术报告','多尺度预测与增强的特征提取，帮助理解后续网络分工。','yolo-neck'],['YOLOv4','2020论文','展示结构与训练方法的组合，不能把所有组合归为单个新层。','yolo-augment'],['本课YOLOv5','Ultralytics仓库与随课配置','使用C3、SPPF和Anchor-based Detect；逐层以提供的YAML和源码为准。','architecture']];
  function timelineView(index){const m=milestones[index];return '<div class="yc-demo" data-yc="timeline"><h3>点一个节点，问它解决了什么问题</h3><div class="yc-controls">'+milestones.map((m,i)=>'<button type="button" data-yc-milestone="'+i+'" aria-pressed="'+(i===index)+'">'+m[0]+'</button>').join('')+'</div><div class="yc-detail" aria-live="polite"><small>'+m[1]+'</small><h4>'+m[0]+'</h4><p>'+m[2]+'</p><a href="#lesson/'+m[3]+'">到对应课程继续学习 ↗</a></div><p class="yc-note">这是一条为学习选取的线索，包含不同团队分支；先后顺序不表示这些仓库之间有直接继承关系。</p></div>';}
  document.addEventListener('click',e=>{const b=e.target.closest('button'),r=b?.closest('[data-yc]');if(!r)return;let html='';if(b.dataset.ycSize)html=slidingView(Number(b.dataset.ycSize));if(b.dataset.ycPipeline!==undefined)html=detectorView(r.dataset.mode,Number(b.dataset.ycPipeline));if(b.dataset.ycMilestone!==undefined)html=timelineView(Number(b.dataset.ycMilestone));if(html){const holder=document.createElement('div');holder.innerHTML=html;const replacement=holder.firstElementChild;r.replaceWith(replacement);replacement.querySelector('button[aria-pressed="true"]')?.focus({preventScroll:true});window.visionlabGlossary?.decorate(document.getElementById('content'));}});
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-yl-jump]');if(!button||document.querySelector('[data-yl-explorer]'))return;
    pendingLayer=Number(button.dataset.ylJump);e.preventDefault();e.stopImmediatePropagation();
    history.pushState({},'',location.pathname+location.search+'#lesson/yolo-config/section-'+sections.get('architecture')[1].id);window.render();
  },true);
  window.visionlabYoloCurriculum={phases,lessons:newLessons,resolveRoute,renderCatalog,renderContext,slidingCount};
})();
