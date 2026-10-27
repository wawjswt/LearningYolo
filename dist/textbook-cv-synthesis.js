/* 一张街景把深度学习、计算机视觉与目标检测串成可回看的主线。 */
(()=>{
  const catalog=typeof lessons!=='undefined'?lessons:window.lessons;
  const curriculum=window.visionlabFoundationCurriculum;
  if(!catalog||!curriculum||catalog.some(l=>l.id==='cv-synthesis'))return;
  const q=(q,options,answer,why)=>({q,options,answer,why});
  const makeSection=(id,title,paragraphs,exercise,extra={})=>({id:'cv-synthesis-'+id,title,paragraphs,exercise,...extra});
  const sections=[
    makeSection('story','1. 从一张街景出发：任务决定答案与标签',[
      '想象一张路口照片：两辆汽车和一名行人出现在画面里。计算机视觉是让计算机从图像或视频中提取有用信息的任务集合。我们先决定要交什么答案：分类可回答整张图属于什么类别；目标检测要分别给出物体的类别和矩形位置；分割还可给每个像素分配类别或实例。',
      '下面选择检测任务。设这张示意图宽 600、高 300 像素，左上角为坐标原点，x 向右、y 向下。图里有两辆车和一名行人；我们给每个目标一个类别和一个边界框。以左侧汽车为例，框的左上角是 (60,120)，右下角是 (200,180)。这些标签是训练和评估时的参考答案，不是额外的图像颜色通道。',
      '如果约定汽车编号为 0、行人编号为 1，左车框的中心是 (130,150)，宽 140、高 60。把中心和宽高分别除以原图的宽 600、高 300，可得到一行 YOLO 格式标签：0 0.2167 0.5 0.2333 0.2。第一项是类别编号，后四项依次是归一化的中心 x、中心 y、宽和高；小数在这里做了四舍五入。',
      '整条路线先把图片变成数字，经过网络得到预测；训练时用标签计算损失并更新参数，验证时用独立数据检查表现。部署时则用学到的参数处理新图，并把候选结果整理成可读答案。下面按这条路线逐步走。'
    ],q('想分别知道每辆车在哪里以及它是什么类别，应优先定义哪种任务？',['整图分类','目标检测','只计算图片平均颜色'],1,'检测同时给出每个目标的位置和类别；整图分类通常不逐个给框。'),{summaryVisual:'journey'}),
    makeSection('data','2. 数据与张量：图片如何成为网络输入',[
      '图片可以看作像素组成的网格；彩色 RGB 图片的每个位置通常有红、绿、蓝三个数。张量是有形状的多维数表。本课先处理一张 640×640 的 RGB 街景，按 PyTorch 常用 NCHW 排列是 [1,3,640,640]：依次是图片数量、颜色通道、高和宽。如果一次放入两张同尺寸图片，第一项变为 2，形状就是 [2,3,640,640]。',
      '例如原始像素值 128 若转换为浮点数再除以 255，约为 0.502；只转换数据类型不会自动除以 255。实际归一化、颜色顺序和数值范围必须与模型的训练约定一致。几何处理若把图片缩放、补边或翻转，训练标签中的框也要随之变换。',
      '现在只处理这张 600×300 的街景：等比缩放到宽 640 时，比例是 640/600=16/15，高变成 320；上下各补 160 像素得到 640×640。左车框的 x 坐标乘 16/15，y 坐标先乘 16/15 再加 160，因此输入图中的框约为 (64,288,213.3,352)。',
      '要把结果画回原图，就先从 y 坐标减去顶部的 160，再把 x、y 都除以 16/15。这里选的尺寸能整齐算出补边；其他图片或实现可能涉及插值和取整，须保存实际比例与补边。'
    ],q('两张 640×640 RGB 图片按 NCHW 排列，形状是什么？',['[2,3,640,640]','[3,2,640,640]','[2,640,640]'],0,'N 是批次图片数 2，C 是 RGB 的 3 个通道。'),{summaryVisual:'data'}),
    makeSection('features','3. 从神经元的乘加，到卷积特征与多尺度',[
      '深度学习里的权重是训练能调整的数，偏置是加权求和后再加的数。卷积把同样的乘加用于图像局部：例如窗口 [1,2;3,4] 对应乘以权重 [1,0;0,−1]，再相加得到 1−4=−3；偏置取 0 时输出就是 −3。窗口在其他位置移动时复用同一组权重，得到一张特征图。',
      '多个输入通道要分别与对应权重相乘，再把各通道贡献相加；多个滤波器可以生成多个输出通道。激活函数为网络加入非线性，例如 ReLU 把负数变为 0。池化或步长大于 1 的卷积可降低空间分辨率，减少后续位置数，同时也可能损失细节。BatchNorm（批量归一化）按通道调整中间数值，训练与默认评估使用的统计量不同；残差连接把形状对齐的分支相加，帮助训练较深的网络。',
      '一张 640×640 的输入在常见步幅 8、16、32 的位置可产生 80×80、40×40、20×20 特征图；这只是模型结构示例，具体尺寸由实际网络决定。较浅、高分辨率特征通常保留更多位置细节；较深、低分辨率特征通常具有更强语义。特征金字塔网络 FPN（Feature Pyramid Network）和路径聚合网络 PAN（Path Aggregation Network）等结构融合不同尺度的信息，帮助检测不同大小的目标；输出格子并不与目标大小一一限定。',
      '把这个局部计算放回街景：窗口滑过车轮边缘、车身和背景时，得到不同响应。一个响应只是某个位置的数，还不是“这是一辆车”；后续层会组合许多通道和位置的信息，检测头再把这些特征用于位置与类别预测。'
    ],q('窗口 [1,2;3,4] 与权重 [1,0;0,−1] 对应相乘求和、偏置为 0，结果是多少？',['−3','3','10'],0,'计算 1×1+2×0+3×0+4×(−1)=−3。'),{summaryVisual:'features'}),
    makeSection('prediction','4. 同样是网络输出，分类与检测要交不同答案',[
      '分类模型可以对猫、狗、兔输出三个原始分数，称为 logits（未经概率化的模型分数）。例如 [2,1,0] 经 Softmax 可转成总和为 1 的一组概率；互斥分类通常选择概率最大的类别。实际使用时概率不一定经过校准。',
      '检测还要判断多个位置的目标类别和边界框。模型前向计算会生成候选框相关的数值和分数，之后再解码、筛选和去除重复；输出格式及分数含义依检测器而异。YOLOv5 系列的网络后续课程会具体拆解它的目标性、类别和框，不要把本节的分类例子当作完整检测头。',
      '训练和推理都执行前向计算；只有训练还会用已标注的参考答案构造损失。标签不通过图像张量送进卷积主干，而是在目标分配、损失或评价环节参与比较。',
      '沿着这张街景往下看：输入图进入特征提取网络，得到不同尺度的特征；检测头根据这些特征生成许多候选。假设整理后的左车预测框为 (64,288,213.3,352)、汽车分数 0.95；这是便于手算的人为假设，不是对示意图运行模型的实测。'
    ],q('检测模型相对整图分类，通常还需回答什么？',['每个目标的位置','图片文件名','一张图必须只有一个目标'],0,'目标检测需要定位各个目标并给出类别；输出形式依模型而异。'),{summaryVisual:'prediction'}),
    makeSection('learning','5. 损失、梯度和优化器：模型如何学会修正',[
      '损失函数把预测和参考答案的差异变成一个可计算的数。分类常用交叉熵；检测训练通常还会为位置和其他任务分量设计损失。梯度描述损失对参数的局部变化率；反向传播用链式法则把损失的影响沿计算过程传回参数，优化器再用梯度更新这些参数。',
      '先看与检测器无关的一元手算：输入 x=2，参数 w=0.5，预测值 wx=1，目标值 3。用单样本平方损失 L=(wx−3)²，得到 L=4；对 w 的梯度为 2(wx−3)x=−8。学习率取 0.1，SGD 更新 w←w−0.1×(−8)=1.3。更新后预测 2.6，损失降为 0.16。',
      '这个简单算例只说明一次局部更新，不代表真实检测损失只有一个参数，也不能保证每一次更新都让所有样本的损失下降。真实网络通常对一个 batch（批次）计算损失；常见顺序是清零旧梯度、前向、算损失、反向、优化器 step。使用梯度累积时，多个小批次反向后才可能更新一次。'
    ],q('上面的例子中，w=0.5、梯度 −8、学习率 0.1，一次 SGD 更新后 w 是多少？',['1.3','−0.3','0.8'],0,'w−学习率×梯度 = 0.5−0.1×(−8)=1.3。'),{summaryVisual:'learning',code:'x, target = 2.0, 3.0\nw, lr = 0.5, 0.1\nprediction = w * x\nloss = (prediction - target) ** 2\ngradient = 2 * (prediction - target) * x\nw = w - lr * gradient\nprint("损失:", loss, "梯度:", gradient, "更新后的权重:", w)\n# 损失: 4.0 梯度: -8.0 更新后的权重: 1.3',codeNote:'这是可直接运行的纯 Python 数值算例，用手写梯度演示一次 SGD；真实训练通常由自动求导和优化器完成。'}),
    makeSection('validation','6. 一轮训练之后：怎样判断模型有没有学到',[
      '训练集用于计算梯度并更新参数；验证集用于比较设置和选择模型；测试集用于在方案确定后作独立评估。按拍摄视频、地点或主体分组，再划分数据，有助于避免极其相似的帧同时进入训练和验证。',
      '一个 epoch 指按当前数据加载规则走完一轮训练数据，不等于一次参数更新。batch 是一次送入模型的一组样本；是否每个 batch 更新一次，还取决于梯度累积等设置。训练损失下降表示训练目标在改善，但不能单凭它保证新场景表现好。',
      '验证时通常切换 model.eval()，使 Dropout、BatchNorm 等使用评估行为；再用 no_grad() 或 inference_mode() 关闭不必要的梯度记录。eval() 不会自动关闭梯度，也不会自己保证数据预处理正确。检查验证指标、按场景查看错误图，比只盯训练损失更有帮助。'
    ],q('验证集的主要用途是什么？',['用它直接更新模型参数','比较设置并观察未参与更新的数据表现','把它与训练集合并以便提高分数'],1,'验证集用于选择模型与检查泛化；训练参数通常由训练集上的损失更新。'),{summaryVisual:'validation'}),
    makeSection('inference','7. 从预测数值到原图上的框：推理与后处理',[
      '推理是用已经学好的参数对新图做前向计算，不需要新图的真实标签。检测器的原始输出通常还要根据实现解码成候选框及分数；先用置信度阈值筛选较低分数，再按需要做非极大值抑制（Non-Maximum Suppression，NMS）去除重复候选，最后把框还原到原图。',
      '以左侧汽车的两个候选框为例：它们的分数分别为 0.9 和 0.8，若彼此重叠很大，NMS 通常先保留高分框，并可能抑制另一个。NMS 比较的是候选框与候选框；如果真实有两辆靠得很近的车，设置不当也可能误删一个。是否按类别处理以及具体规则取决于实现。',
      '评价时再用真实标签比较预测框：交并比 IoU 是交集面积除以并集面积，用来衡量两个框的位置重合程度。置信度阈值决定保留哪些候选；NMS 的 IoU 阈值用于去重；评价匹配的 IoU 阈值用于判定预测与真实框是否足够重合。这三个阈值不能混为一谈。',
      '把左车的假设预测框从输入图还原：x 坐标除以 16/15，y 坐标先减 160 再除以 16/15，得到原图框约 (60,120,200,180)。若它恰好与标注框相同，交集和并集面积都是 140×60=8400，IoU=1。',
      '如果另一个预测框向右偏移 20 像素，变成 (80,120,220,180)，它与真实框的交集宽 120、高 60，面积为 7200。两个框各为 8400，并集为 8400+8400−7200=9600，因此 \\(\\mathrm{IoU}=\\frac{7200}{9600}=0.75\\)。评价门槛是 0.5 时，若类别和一对一匹配条件也满足，这个预测可以匹配左车。'
    ],q('NMS 去重时主要比较哪两类框？',['候选预测框与候选预测框','预测框与真实标签框','原图边界与训练集目录'],0,'NMS 是推理后处理，不需要真实标签；评估匹配才比较预测与真实框。'),{summaryVisual:'inference'}),
    makeSection('metrics','8. 一组数字把阈值、P、R 和 AP 连起来',[
      '只评价这张示意图中的汽车：真实汽车共有 2 个，行人属于另一类，暂不计入。假设候选已经去重，并按分数从高到低与同类真实框进行一对一匹配，匹配 IoU 阈值为 0.5。TP 是成功匹配的预测框，FP 是未成功匹配的预测框；FN 是没有被匹配到的真实汽车。Precision（精确率）=TP/(TP+FP)，Recall（召回率）=TP/(TP+FN)。',
      '假设三个汽车候选依次为：左车 0.95→TP、背景误报 0.75→FP、右车 0.35→TP。阈值 0.70 保留前两个，所以 TP=1、FP=1、FN=1，P=50%、R=50%；阈值降到 0.30 后三个都保留，TP=2、FP=1、FN=0，P≈66.7%、R=100%。这些分数和匹配是人为设定，用于手算，不是模型实测。',
      '改变置信度阈值会得到不同的 P、R；固定评价条件后，沿不同分数阈值可形成 P-R 曲线。平均精度 AP（Average Precision）是根据曲线计算的单类别综合指标，平均精度均值 mAP（mean Average Precision）是按规定类别及 IoU 条件汇总的 AP；不同协议的插值、平均方式和 IoU 范围可能不同，不能把单个阈值下的 P 当成 AP。'
    ],{...q('固定本例匹配规则，阈值 0.70 时的 P 与 R 是多少？',['P=50%，R=50%','P=100%，R=50%','P≈66.7%，R=100%'],0,'保留 1 个 TP、1 个 FP；2 辆真实车中有 1 辆被匹配。'),revision:'street-v2'},{summaryVisual:'threshold'}),
    makeSection('bridge','9. 错误分析与进入 YOLO：把抽象步骤对上具体模块',[
      '如果漏掉远处车辆，先查看原图和标注是否遗漏、缩放后目标是否过小，再检查分数筛选与匹配；如果背景误报多，抽查相似背景、类别标签和高分误报。每次尽量固定验证数据和评估规则，只改变一个主要因素，再比较指标和具体错误样本。',
      '现在可以用同一条主线读目标检测器：Backbone（骨干网络）从图像提取多层特征，Neck（特征融合部分）整理不同尺度，检测头把特征变为候选预测。训练还需要标签、目标分配、损失、反向传播和参数更新；推理则侧重解码、筛选、去重和坐标还原。',
      '接下来的 YOLOv5 课程会把这些职责落到具体模块和代码：从目标检测问题出发，再走到网络、数据、训练和推理。本课的图与数字用于理解流程，不替代对特定版本实现的核对。'
    ],q('远处小车漏检，最有依据的第一步是什么？',['只增加训练轮数','回看漏检图、标注及筛选设置，再控制变量排查','把真实标签改成预测结果'],1,'先看错误样本、标签与阈值等证据，才能提出可验证的改进。'),{summaryVisual:'links'})
  ];
  sections.forEach((s,i)=>{s.legacyIndex=i;});
  const lesson={
    id:'cv-synthesis',group:'cv',curriculumKey:'cv',curriculumPhase:'cv-synthesis',curriculumOptional:false,
    title:'视觉总复习：一张街景串起深度学习与检测',
    desc:'跟随同一组街景数据，从任务、图像与卷积走到训练、推理和评价，为 YOLOv5 学习搭好整条知识主线。',
    curriculumIntro:'把深度学习基础与视觉课程合成一条训练和推理路线；三维旋转属于选学，无需先学完。',
    time:45,level:'总结',cvEdited:true,sections,
    goals:['沿一张街景说明图像、张量、卷积特征和检测输出之间的关系。','区分训练更新、验证评估与新图推理，并手算一次参数更新。','用置信度、IoU 匹配与 TP、FP、FN 算出一组 P、R，再走向 YOLOv5。'],
    prereq:'可先通读全程，再按需要回看张量、卷积、训练和检测指标；三维姿态专题不构成本课先修。',
    prereqLinks:[['tensor','张量：形状与轴'],['cnn','卷积：局部乘加'],['training-loop','训练循环：一次更新'],['metrics','检测指标：TP、FP 与 FN']].map(([id,title])=>({id,title})),
    keypoints:['任务决定标签与输出；图像和标签的处理必须保持几何对应。','网络前向产生预测；训练通过损失、梯度与优化器调整参数，推理不使用真实标签。','置信度筛选、NMS 去重和预测与标签的评估匹配是不同步骤。','P、R 对应具体评估设置和阈值；AP 汇总不同阈值下的曲线表现。'],
    chapterExercises:[
      q('哪条路线描述的是训练中的参数更新？',['前向预测 → 损失 → 反向求梯度 → 优化器更新','原图 → NMS → 保存图片','预测框 → 与其他预测框做 NMS → 计算标签'],0,'训练用标签构造损失，并通过梯度和优化器更新参数。'),
      q('检测结果被 NMS 删除时，主要使用了什么？',['候选之间的分数和重叠关系','真实标签和验证集答案','目标类别文件名'],0,'NMS 基于候选预测之间的关系，不依赖真实标签。'),
      {...q('本课例子阈值降到 0.30 后，3 个候选中有 2 个 TP、1 个 FP，2 辆真实车的 P、R 各是多少？',['P≈66.7%，R=100%','P=100%，R≈66.7%','P=50%，R=50%'],0,'精确率 2/3，召回率 2/2。'),revision:'street-v2'}
    ],
    worked:{title:'从像素、预测到一轮更新',prompt:'两张 640×640 RGB 路口图组成批次；针对其中一个简化标量预测，x=2、w=0.5、目标为 3。请依次说出输入形状、损失和一次更新结果。',steps:['输入整理成 [2,3,640,640]；标签另行提供，不作为第四个颜色通道。','简化预测为 wx=1；平方损失为 (1−3)²=4。','梯度为 2(wx−3)x=−8；学习率 0.1 时 w 更新到 1.3。','验证与推理还需按各自目标运行；一次标量演算不代表完整检测模型。'],solution:'输入 [2,3,640,640]；例子损失为 4，更新后 w=1.3。'},
    sources:[{label:'PyTorch 自动求导文档',url:'https://docs.pytorch.org/docs/stable/autograd.html'},{label:'TorchVision 目标检测教程',url:'https://docs.pytorch.org/tutorials/intermediate/torchvision_tutorial.html'},{label:'YOLOv5 模型配置',url:'https://github.com/ultralytics/yolov5/blob/master/models/yolov5s.yaml'}],
    figureKeys:[],visual:'',code:'',starterCode:''
  };
  const lastCv=catalog.reduce((n,l,i)=>l.group==='cv'?i:n,-1);
  catalog.splice(lastCv+1,0,lesson);
  curriculum.lessons.push(lesson);
  curriculum.phases.cv.push({id:'cv-synthesis',title:'总结 · 从视觉基础走向 YOLO',why:'用同一个街景案例连接基础计算、视觉特征、训练与评估，再进入检测器实现。',ids:[lesson.id],check:'能沿数据、前向、损失、更新、推理和评价说出每一步的输入与输出。'});
  const cv=catalog.filter(l=>l.group==='cv');
  cv.forEach((l,i)=>{l.curriculumNumber=i+1;l.curriculumTotal=cv.length;});
  const original=window.visionlabCvEditorial;
  const scene=()=>'<figure class="cv-synthesis-scene"><svg viewBox="0 0 600 300" role="img" aria-labelledby="cv-scene-title cv-scene-desc"><title id="cv-scene-title">路口目标检测标注示意</title><desc id="cv-scene-desc">图中有两辆汽车和一个行人，三个矩形分别框住目标并标出类别。</desc><rect width="600" height="300" rx="12" fill="#eef3f6"/><path d="M0 110H600V300H0z" fill="#d9e1e6"/><path d="M0 176H600" stroke="#fff" stroke-width="4" stroke-dasharray="30 18"/><path d="M0 104H600" stroke="#a9bac4" stroke-width="4"/><g fill="#a8baca"><path d="M25 35h55v68H25zM92 20h76v83H92zM465 40h95v63h-95z"/></g><g fill="#577ca4"><path d="M80 133h92l17 17v18H66v-18z"/><path d="M364 122h94l18 21v25H349v-21z"/></g><g fill="#31465d"><circle cx="90" cy="169" r="8"/><circle cx="166" cy="169" r="8"/><circle cx="374" cy="169" r="8"/><circle cx="452" cy="169" r="8"/></g><g stroke="#45586c" stroke-width="7" stroke-linecap="round"><path d="M273 123v27m-15-14 15-10 15 10m-15 14-11 21m11-21 11 21"/></g><circle cx="273" cy="111" r="9" fill="#45586c"/><g fill="none" stroke="#6952b2" stroke-width="3"><rect x="60" y="120" width="140" height="60" rx="5"/><rect x="340" y="110" width="140" height="70" rx="5"/></g><rect x="247" y="94" width="52" height="88" rx="5" fill="none" stroke="#208a79" stroke-width="3"/><g font-family="sans-serif" font-size="14" font-weight="bold"><text x="64" y="115" fill="#6952b2">车</text><text x="347" y="106" fill="#6952b2">车</text><text x="249" y="89" fill="#208a79">行人</text></g></svg><figcaption>示意图：这张路口图有两辆车和一名行人。检测标签分别记录每个目标的类别和矩形位置。</figcaption></figure>';
  const timeline=()=>scene()+'<figure class="cv-synthesis-flow" aria-label="街景目标检测学习主线"><figcaption><span>一张图 · 两条路线</span><strong>先共享前向计算，再分成训练与推理</strong></figcaption><div class="cv-synthesis-steps"><a href="#lesson/cv-synthesis/section-cv-synthesis-story"><b>01</b><span>任务与标签</span><small>车、人和边界框</small></a><a href="#lesson/cv-synthesis/section-cv-synthesis-data"><b>02</b><span>图像 → 张量</span><small>[N,C,H,W]</small></a><a href="#lesson/cv-synthesis/section-cv-synthesis-features"><b>03</b><span>网络提特征</span><small>卷积 · 多尺度</small></a><a href="#lesson/cv-synthesis/section-cv-synthesis-prediction"><b>04</b><span>产生预测</span><small>分数 · 候选框</small></a></div><div class="cv-synthesis-branches"><p><strong>训练路线</strong> 标签 → 损失 → 梯度 → 参数更新</p><p><strong>推理路线</strong> 解码 → 筛选 → NMS → 原图结果</p></div><p>验证再将预测与标签匹配，计算指标；点击步骤可跳到对应小节。</p></figure>';
  const threshold=()=>`<section class="cv-synthesis-threshold" data-summary-threshold><span class="chapter-kicker">动手试试 · 街景中的两辆车</span><h3>调整分数门槛，看看会留下什么</h3><p>示意图里有 2 辆真实汽车；下面是已经去重的三个假设预测。匹配 IoU 门槛固定为 0.5，并按分数从高到低一对一匹配。行人不计入汽车类的结果。</p><svg class="cv-recap-match" viewBox="0 0 600 300" role="img" aria-label="同一张街景的汽车候选：左车0.95匹配，背景0.75误报，右车0.35匹配"><rect width="600" height="300" rx="10" fill="#edf2f5"/><path d="M0 110H600V300H0z" fill="#d9e1e6"/><path d="M80 133h92l17 17v18H66v-18zM364 122h94l18 21v25H349v-21z" fill="#577ca4"/><circle cx="273" cy="111" r="9" fill="#45586c"/><path d="M273 123v27m-15-14 15-10 15 10m-15 14-11 21m11-21 11 21" stroke="#45586c" stroke-width="7" fill="none"/><rect x="60" y="120" width="140" height="60" fill="none" stroke="#308b72" stroke-width="4"/><rect x="340" y="110" width="140" height="70" fill="none" stroke="#308b72" stroke-width="4"/><rect x="220" y="30" width="90" height="55" fill="none" stroke="#c16c61" stroke-width="4"/><text x="60" y="113" font-size="17" fill="#276c59">左车 0.95 · TP</text><text x="337" y="103" font-size="17" fill="#276c59">右车 0.35 · TP</text><text x="220" y="24" font-size="17" fill="#a04d45">背景 0.75 · FP</text></svg><p>图中先展示全部三个假设候选；下方拖动阈值查看哪些候选被保留。</p><label for="summary-confidence">置信度阈值 <output data-summary-value for="summary-confidence">0.70</output></label><input id="summary-confidence" data-summary-input type="range" min="0" max="1" step="0.05" value="0.70"><div class="cv-synthesis-candidates" aria-label="汽车候选分数和匹配结果"><span data-summary-candidate="0.95" aria-label="左车 0.95，TP，保留">左车 0.95 · TP</span><span data-summary-candidate="0.75" aria-label="背景误报 0.75，FP，保留">背景 0.75 · FP</span><span class="is-filtered" data-summary-candidate="0.35" aria-label="右车 0.35，TP，筛除">右车 0.35 · TP</span></div><div class="cv-synthesis-stats" data-summary-stats role="status" aria-live="polite">阈值 0.70：TP 1，FP 1，FN 1；P 50.0%，R 50.0%。</div><p class="cv-synthesis-hint">试试 0.30 和 1.00。保留数为 0 时 P 的分母为 0，本例显示“未定义”；R 仍可计算。</p></section>`;
  const diagram=(title,body,note)=>`<figure class="cv-recap-diagram"><figcaption><span>街景案例 · 图解</span><strong>${title}</strong></figcaption>${body}<p class="cv-recap-note">${note}</p></figure>`;
  const dataVisual=()=>diagram('图片和标签一起走进模型',`<div class="cv-recap-track"><div><b>原图</b><strong>600 × 300</strong><small>左车框 (60, 120, 200, 180)</small></div><span aria-hidden="true">→</span><div><b>等比缩放</b><strong>640 × 320</strong><small>宽、高与框都乘 16/15</small></div><span aria-hidden="true">→</span><div><b>上下补边</b><strong>640 × 640</strong><small>顶部与底部各 160 像素</small></div></div><svg class="cv-recap-coordinate" viewBox="0 0 640 640" role="img" aria-label="640乘640输入图，上下各160像素补边，中间是缩放后的街景，左侧汽车框从64、288到约213、352"><rect width="640" height="640" fill="#dfe3eb"/><rect y="160" width="640" height="320" fill="#eef3f6"/><path d="M0 277H640V480H0z" fill="#d9e1e6"/><path d="M70 303h100l20 19v19H70z" fill="#577ca4"/><path d="M390 290h100l20 20v30H390z" fill="#577ca4"/><circle cx="291" cy="279" r="10" fill="#45586c"/><path d="M291 290v30m-14-14 14-12 14 12m-14 14-12 22m12-22 12 22" stroke="#45586c" stroke-width="7" fill="none"/><rect x="64" y="288" width="149.3" height="64" fill="none" stroke="#694eb2" stroke-width="4"/><text x="20" y="95" fill="#56677a" font-size="24">上补边 160</text><text x="20" y="565" fill="#56677a" font-size="24">下补边 160</text><text x="68" y="281" fill="#5e459b" font-size="20">左车框</text></svg><div class="cv-recap-answer"><b>左车框在输入图中</b> (64, 288, 213.3, 352)　→　图片整理为 [1, 3, 640, 640]</div>`,'坐标顺序为左、上、右、下；框和图片必须一起变换。方框中的坐标为便于阅读的近似值。');
  const featuresVisual=()=>diagram('把局部乘加看成一个小窗口',`<div class="cv-recap-matrices"><div><b>图像局部数值</b><div class="cv-recap-matrix"><span>1</span><span>2</span><span>3</span><span>4</span></div></div><strong aria-hidden="true">×</strong><div><b>卷积核权重</b><div class="cv-recap-matrix"><span>1</span><span>0</span><span>0</span><span data-recap-weight-display>−1</span></div></div><strong aria-hidden="true">→</strong><div class="cv-recap-result" role="status" aria-live="polite"><b>乘加结果</b><strong data-recap-conv-result>−3</strong><small data-recap-relu-result>ReLU 后为 0</small></div></div><label class="cv-recap-slider" for="cv-recap-weight">改变右下角权重 <output data-recap-weight-output for="cv-recap-weight">−1</output></label><input id="cv-recap-weight" data-recap-weight type="range" min="-2" max="2" step="1" value="-1">`,'计算：1×1 + 2×0 + 3×0 + 4×所选权重，偏置为 0。小窗口是人为构造的数值例子；一个响应本身还不是汽车类别。');
  const predictionVisual=()=>diagram('一张图经过网络，得到多个候选',`<div class="cv-recap-track"><div><b>输入</b><strong>[1, 3, 640, 640]</strong><small>一张 RGB 街景</small></div><span aria-hidden="true">→</span><div><b>特征网络</b><strong>多尺度特征</strong><small>综合边缘、形状与上下文</small></div><span aria-hidden="true">→</span><div><b>检测头</b><strong>框与分数</strong><small>多个位置产生候选</small></div></div><div class="cv-recap-answer">假设左车候选：输入图框约 <b>(64, 288, 213.3, 352)</b>，汽车分数 <b>0.95</b>。</div>`,'框和分数是为本课构造的示例；具体输出格式由检测器决定。');
  const learningVisual=()=>diagram('训练时，预测和答案怎样改变参数？',`<div class="cv-recap-track cv-recap-four"><div><b>① 前向</b><strong>0.5 × 2 = 1</strong><small>预测为 1，目标为 3</small></div><span aria-hidden="true">→</span><div><b>② 比较</b><strong>(1 − 3)² = 4</strong><small>例子的平方损失</small></div><span aria-hidden="true">→</span><div><b>③ 反向</b><strong>梯度 −8</strong><small>损失对 w 的变化率</small></div><span aria-hidden="true">→</span><div><b>④ 更新</b><strong>w: 0.5 → 1.3</strong><small>学习率 0.1 的 SGD</small></div></div>`,'此处用单个数演示更新机制；真实检测器有大量参数及多个损失分量。');
  const validationVisual=()=>diagram('同一套模型，在不同阶段回答不同问题',`<div class="cv-recap-track"><div><b>训练</b><strong>用标签算损失</strong><small>反向传播并更新参数</small></div><span aria-hidden="true">→</span><div><b>验证</b><strong>预测与标签比较</strong><small>比较设置，不更新参数</small></div><span aria-hidden="true">→</span><div><b>新图推理</b><strong>输出框和类别</strong><small>无须事先提供答案</small></div></div>`,'测试集通常在方案确定后用于独立评估；不要把同一视频的相邻帧随意分到不同集合。');
  const inferenceVisual=()=>diagram('从输入图框回到原图，再与答案比较',`<div class="cv-recap-track"><div><b>输入图坐标</b><strong>(64, 288, 213.3, 352)</strong><small>640 × 640 的模型输入</small></div><span aria-hidden="true">→</span><div><b>去补边、还原缩放</b><strong>先减 160，再除以 16/15</strong><small>x 仅除以 16/15</small></div><span aria-hidden="true">→</span><div><b>原图坐标</b><strong>(60, 120, 200, 180)</strong><small>与左车标注一致</small></div></div><div class="cv-recap-answer">完全重合时：交集 8400、并集 8400，所以 <b>IoU = 1</b>。</div>`,'推理时先筛选和去重；评价时才拿保留的预测框与标注进行匹配。');
  const links=()=>'<aside class="cv-synthesis-links"><strong>继续学习或补一处基础</strong><div><a href="#lesson/detection-intro">进入 YOLOv5：目标检测从哪里来 →</a><a href="#lesson/feature-pyramid">回看多尺度特征 →</a><a href="#lesson/metrics-map">回看 AP 与 mAP →</a><a href="#lesson/training-loop">回看训练循环 →</a></div></aside>';
  if(original){
    const old=original.renderParagraph.bind(original);
    const visuals={journey:timeline,data:dataVisual,features:featuresVisual,prediction:predictionVisual,learning:learningVisual,validation:validationVisual,inference:inferenceVisual,threshold,links};
    original.renderParagraph=(s,i)=>old(s,i)+(i===0&&visuals[s.summaryVisual]?visuals[s.summaryVisual]():'');
  }
  document.addEventListener('input',event=>{
    const weight=event.target.closest?.('[data-recap-weight]');
    if(weight){
      const root=weight.closest('.cv-recap-diagram'),value=Number(weight.value),result=1+4*value;
      root.querySelector('[data-recap-weight-display]').textContent=value;
      root.querySelector('[data-recap-weight-output]').textContent=value;
      root.querySelector('[data-recap-conv-result]').textContent=result;
      root.querySelector('[data-recap-relu-result]').textContent='ReLU 后为 '+Math.max(0,result);
      return;
    }
    const input=event.target.closest?.('[data-summary-input]');if(!input)return;
    const root=input.closest('[data-summary-threshold]'),cut=Number(input.value);
    const candidates=[{score:.95,tp:true},{score:.75,tp:false},{score:.35,tp:true}];
    const kept=candidates.filter(c=>c.score+1e-9>=cut),tp=kept.filter(c=>c.tp).length,fp=kept.length-tp,fn=2-tp;
    root.querySelector('[data-summary-value]').textContent=cut.toFixed(2);
    root.querySelectorAll('[data-summary-candidate]').forEach(el=>{const on=Number(el.dataset.summaryCandidate)+1e-9>=cut;el.classList.toggle('is-filtered',!on);el.setAttribute('aria-label',el.textContent+'，'+(on?'保留':'筛除'));});
    root.querySelector('[data-summary-stats]').textContent='阈值 '+cut.toFixed(2)+'：TP '+tp+'，FP '+fp+'，FN '+fn+'；P '+(kept.length?(100*tp/kept.length).toFixed(1)+'%':'未定义')+'，R '+(100*tp/2).toFixed(1)+'%。';
  });
})();
