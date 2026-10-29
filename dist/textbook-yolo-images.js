/* 全YOLO课程配图：官方文档原图＋按v7.0约定绘制的教学图。 */
(()=>{
 const catalog=typeof lessons!=='undefined'?lessons:window.lessons;if(!catalog)return;
 const base='assets/yolo-illustrations/',official='https://docs.ultralytics.com/yolov5/tutorials/',v7='https://github.com/ultralytics/yolov5/blob/v7.0/';
 const entries=[];
 function add(lesson,asset,title,alt,guide,source,sourceLabel='Ultralytics 官方文档',section=0,kind='官方原图'){entries.push({lesson,asset,title,alt,guide,source,sourceLabel,section,kind});}
 function own(lesson,asset,title,alt,guide,source=v7+'models/yolo.py',section=0){add(lesson,asset+'.svg',title,alt,guide,source,'计算依据与延伸阅读',section,'本站教学图');}
 own('detection-history','history-map','沿四个问题回看技术史','搜索、特征、预测、去重四个问题与历史阶段的联系',['先按年代读下排，再回到上排辨认每个方法改进了哪项工作。','同一时期存在并行路线；图中的箭头表示本课阅读顺序。'],'https://arxiv.org/abs/1905.05055');
 add('detection-intro','labels-photo.avif','真实标注图：一张图片可以有多个对象','官方标注示例：两个行人与一条领带，各有独立边界框和归一化位置',['先数对象，再看每个框的类别和位置如何分别记录。','图中坐标使用相对图宽、高的比例；左上为原点，横向x、向下y。'],official+'train-custom-data');
 own('detection-two-stage','two-stage','把三代区域检测放到同一张图上','R-CNN、Fast R-CNN与Faster R-CNN的卷积共享和区域建议对照',['逐行跟随输入与区域处理，看哪一段计算开始共享。','定位RPN：它产生候选，后面仍有区域分类与框精修。'],'https://arxiv.org/abs/1506.01497');
 own('detection-one-stage','dense-grid','从特征位置数算候选数','4乘4与2乘2两个教学网格，每位置三个候选，共60条',['先算位置数，再乘每位置的候选组数。','图是教学设定；初代YOLO、SSD和YOLOv5各自的真实输出约定见正文。'],'https://arxiv.org/abs/1512.02325');
 add('yolo-evolution','models.avif','同一系列也有不同模型规模','官方文档中YOLOv5 n、s、m、l、x的规模对照图',['先比较模型规模，再回正文看宽度和深度缩放。','图内速度和精度来自官方当时的测量条件；它展示规模选择，不表示所有设备上的固定性能，也不是版本年代顺序。'],official+'train-custom-data');
 add('architecture','architecture.avif','官方整网结构图：顺着连线找到三路预测','YOLOv5结构图，包含Conv、C3、SPPF、融合路径和三个预测尺度',['左侧从640输入沿下采样走到20；中间上采样融合，右侧再下采样并接预测。','原图尺寸写作H×W×C；本站张量常写[B,C,H,W]，B表示批次。图中参数以这张结构图为准，逐层尺寸与本站l模型正文对照。'],official+'architecture-description');
 own('yolo-repository','repo-map','文件地图也要沿数据流阅读','train、val、detect三条路线以及共享模型代码',['沿左侧选择任务，再看中间的输入输出。','同一个模型被用于训练、验证、推理；标签是否参与及后续计算不同。']);
 add('yolo-data','labels-photo.avif','把标注比例与图片上的矩形对应起来','多人图片上的目标框与归一化中心、宽高',['选定一个框，分别指出中心x/y、宽和高。','按原图宽高还原像素框，检查标签是否真的覆盖目标。'],official+'train-custom-data');
 add('yolo-data','dataset-folders.avif','官方目录示例：图片与标签分开放在哪里','官方YOLOv5教程中的datasets、images与labels目录截图',['关注images与labels及train/val的对应关系。','这是官方示例目录截图；本机绝对路径由你的data YAML和运行环境决定。'],official+'train-custom-data','Ultralytics 官方文档',1);
 add('yolo-data','class-distribution.avif','看分布，发现数据集的长尾和覆盖差异','官方数据分析图，对照类别实例数、每图类别及实例数量等统计',['先读坐标轴：类别数、实例数、每图实例数是不同统计。','这是文档引用的数据集分析示例，不能当作你自己的数据分布；自己的数据也应做对应统计。'],official+'tips-for-best-training-results','Ultralytics 官方文档',2);
 own('yolo-config','yaml-line','把一行YAML拆成四个字段','from、number、module、args分别对应连线、重复、模块和参数',['先找到输入来源，再用l配置确认输出通道和C3内部重复次数。','切换到其他规模时，要追踪parse_model应用的深宽缩放。']);
 own('yolo-backbone','backbone-shapes','空间与通道，沿两条数值线同时跟踪','YOLOv5l的640、320、160、80、40、20空间尺寸和对应通道变化',['每个方块上行看H×W，下行看C，分别解释它们的含义。','图只突出下采样尺寸主线；C3等同尺寸处理层仍在网络中计算。']);
 own('yolo-c3','c3-branches','C3的两条路都从输入取数','输入256通道经过两组投影，主路Bottleneck处理，拼接后输出256通道',['先沿主路走到Bottleneck，再沿另一条投影走到Concat。','Concat把两组128通道并排组成256通道；它不等于逐元素相加。'],v7+'models/common.py');
 own('yolo-sppf','sppf-chain','在SPPF里数清四路和通道','连续三次5乘5池化及原特征汇总，512通道四路拼接为2048',['先看串行池化，再找每一份输出通往Concat的连线。','5/9/13是相对模块内池化前特征的范围；完整原图感受野还要考虑前面的网络。'],v7+'models/common.py');
 own('yolo-neck','neck-path','把FPN/PAN路径从左到右、再返回读','20到40到80上采样融合，再回到40和20预测尺度',['上排跟随上采样，说明高宽为什么增加；下排跟随步幅卷积回到粗尺度。','各次融合还读取同尺度保存特征；拼接前先核对高宽，再计算通道。']);
 own('yolo-head','head-shapes','张量换轴不会凭空增加候选','两类任务P3从21通道拆分为三个Anchor每条七字段，再交换轴',['用3×7=21解释输出卷积通道；再把每个轴的含义读出来。','这是640方形输入、两类任务的P3原始输出；推理还需解码和汇合其他尺度。']);
 own('anchors','anchor-geometry','参考框与标签，先比较宽高','参考33乘23和真实32乘16的宽高比匹配演示',['只比较几何宽高，逐项算正反比例并取最大。','通过比例筛选表示可分配监督，不表示网络已经正确检出目标。'],v7+'utils/loss.py');
 own('yolo-assignment','assignment-grid','把中心格与邻格画出来','目标中心2.4、2.6对应中心、左邻与下邻三个教学格子',['橙点始终是同一个目标中心；换参照格后，局部坐标可以超过1或小于0。','这是某一个通过宽高筛选的Anchor；其他Anchor和其他尺度分别计算。'],v7+'utils/loss.py');
 own('yolo-loss','loss-paths','三种损失，分别看监督对象','框、物体性和类别的单正样本数值路径',['框项读取正样本框；物体性还监督大量其他位置；类别读取正样本类别字段。','先算图中的单项，再回正文核对归约、gain与尺度balance。'],v7+'utils/loss.py');
 add('train-yolo','training-log.avif','训练运行后，文件怎样留下证据','官方训练日志目录，含权重、曲线与批次可视化',['找到批次图、曲线和weights，分别说明它们能检查什么。','这张图展示官方历史实验目录，文件名与界面样式可能随版本和记录工具变化。'],official+'train-custom-data');
 add('train-yolo','training-results.avif','读一张完整的训练曲线','官方results图，含训练验证损失、P、R和mAP曲线',['横轴看训练轮次；先分开读train与val损失，再看验证指标。','这是一份官方示例结果，不是本站新训练的实验；你的曲线应结合相同数据和设置判断。'],official+'train-custom-data','Ultralytics 官方文档',1);
 own('yolo-checkpoints','resume-paths','同一个.pt，初始化与续训分别需要什么','从权重文件分出微调初始化和恢复完整训练状态两条路线',['先确认你想开启新任务，还是接着原实验继续。','检查实际字段与形状、类别顺序、优化器和轮次；文件名不能代替内容检查。'],v7+'train.py');
 add('yolo-augment','mosaic.avif','Mosaic：四张图与框一起进入新画布','官方Mosaic示例，从四张独立图片组合成一个训练画布',['从左边选一张图，跟踪它在右边的位置、比例和框。','标签也要随缩放、平移、裁切一起变换；此图说明训练输入构造。'],official+'architecture-description');
 add('yolo-augment','affine.avif','几何增强：位置变了，框也必须改变','官方随机几何变换前后的图片和框',['比较同一个对象的中心、大小与边界变化。','超出画布或过小的框还需要按实现过滤，不能只变像素不更新标签。'],official+'architecture-description','Ultralytics 官方文档',1);
 add('yolo-augment','hsv.avif','HSV：颜色变化与几何变化分开看','官方HSV增强图，对比色调、饱和度与明度的变化',['观察外观颜色改变时，对象位置是否保持。','颜色增强通常不改变框坐标，和上面的几何增强职责不同。'],official+'architecture-description','Ultralytics 官方文档',1);
 add('yolo-augment','mixup.avif','MixUp：两份图片内容与标签如何共存','官方MixUp示例，组合两张训练图的视觉内容',['找出两份输入各自保留了哪些对象与框。','增强要符合任务语义；是否有效通过固定评价协议的对照实验判断。'],official+'architecture-description','Ultralytics 官方文档',1);
 own('yolo-evaluation','evaluation-counts','从四条预测数出P和R','三个真实目标，四条排序预测在不同保留数量下的精确率与召回率',['每增加一条预测，分别更新TP、FP及未检出的FN。','这是人工设定的计数例子；AP还需按既定协议处理整条PR曲线。'],v7+'utils/metrics.py');
 own('inference','nms-boxes','重叠框为何被NMS抑制','两个火焰候选的分数和0.818交并比计算',['先算交集与并集，再比较NMS门槛。','确定类别相同及高分框之后再决定抑制；不同应用还要评估拥挤目标的误删。'],v7+'utils/general.py');
 add('yolo-export','export-graph.avif','用模型查看器检查导出的计算图','官方导出教程中Netron对比不同导出模型的图与输入输出属性',['先读输入名称、形状和输出数量，再沿算子连线检查。','截图来自官方历史导出示例；你使用的导出格式、动态轴与输出必须看实际文件。'],official+'model-export');
 add('yolo-export','export-targets.avif','导出格式，是交给运行环境的不同文件','官方示例目录，含多种格式的导出模型',['关注同一模型被保存成不同文件格式。','文件生成只证明转换完成；还需比较同一输入的数值、后处理与最终指标。'],official+'model-export','Ultralytics 官方文档',1);
 own('yolo-trace','letterbox-frame','从原图到网络画布，跟踪同一个框','1000乘500图片缩放并补边到640画布，框同步变换',['先乘缩放比例，再给中心加补边偏移；宽高只乘缩放比例。','模型输出属于网络画布，还原到原图时要做逆变换。'],v7+'utils/augmentations.py');
 own('debugging','debug-evidence','把失败图片放回整条计算链','从原图标签、变换后输入、原始候选到后处理依次定位漏检',['先找错误第一次出现的环节，再决定改数据、结构、监督还是阈值。','每次保留失败样例与实验配置，使下一轮比较能说明改动效果。'],v7+'detect.py');
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 for(const item of entries){const l=catalog.find(x=>x.id===item.lesson);if(!l)throw Error('Image lesson missing: '+item.lesson);const s=l.sections[item.section];if(!s)throw Error('Image section missing: '+item.lesson+'/'+item.section);(s.yoloCourseImages??=[]).push(item);s.yoloCourseImagesAt=Math.min(2,s.paragraphs.length-1);}
 const old=window.visionlabYoloLearning.renderParagraph.bind(window.visionlabYoloLearning);
 window.visionlabYoloLearning.renderParagraph=(s,i)=>{let html=old(s,i);if(i!==s.yoloCourseImagesAt)return html;return html+s.yoloCourseImages.map(item=>`<figure class="yolo-course-image"><figcaption><span class="chapter-kicker">${esc(item.kind)}</span><strong>${esc(item.title)}</strong></figcaption><a class="yolo-course-image-open" href="${base+item.asset}" target="_blank" rel="noopener noreferrer" aria-label="打开大图：${esc(item.title)}"><img src="${base+item.asset}" loading="lazy" decoding="async" alt="${esc(item.alt)}"/></a><p class="yolo-course-image-hint">点击图片打开大图，按原尺寸查看细节。</p><ol>${item.guide.map(g=>'<li>'+esc(g)+'</li>').join('')}</ol><p class="source-note">${esc(item.kind==='官方原图'?'图片来源：Ultralytics；':'绘制：本站；')}<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${esc(item.sourceLabel)} ↗</a></p></figure>`).join('');};
 window.visionlabYoloImages={entries,coverage:[...new Set(entries.map(x=>x.lesson))]};
})();
