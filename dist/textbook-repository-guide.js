/* 将经过源码核对的仓库导览融入课程；计算为教学示例，不运行训练。 */
(()=>{
  const catalog=typeof lessons!=='undefined'?lessons:window.lessons;
  if(!catalog)return;
  const get=id=>catalog.find(l=>l.id===id);
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const add=(lessonId,id,title,paragraphs,exercise,code)=>{
    const l=get(lessonId);if(!l||l.sections.some(s=>s.id===id))return;
    const i=l.sections.length;
    l.sections.push({id,title:(i+1)+'. '+title,paragraphs,legacyIndex:i,playgroundId:id,depth:'',exercise,code});
    if(Number.isFinite(l.time))l.time+=5;
  };
  const quiz=(q,options,answer,why)=>({q,options,answer,why});
  const chips=ids=>'<p class="rg-terms">读图前可点开：'+ids.map(id=>window.visionlabGlossary?.chip(id)||'').join(' ')+'</p>';
  const panel=(id,title,html)=>'<div class="rg-panel" data-rg="'+id+'"><h3>'+title+'</h3>'+html+'</div>';
  const table=(head,rows)=>'<div class="rg-table-wrap"><table><thead><tr>'+head.map(v=>'<th scope="col">'+v+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
  const link=(id,text)=>'<a href="#lesson/'+id+'">'+text+' ↗</a>';
  const fileEntries=[
    ['train.py','训练入口','读取数据配置、建立模型、循环计算损失和更新参数；每轮按选项验证并保存。','train() → pred=model(imgs) → ComputeLoss → backward → optimizer step','train-yolo'],
    ['val.py','验证入口','用带标注的数据评估已有模型；比较预测与真实框，统计精确率、召回率和 mAP，不更新参数。','run() → 模型预测 → NMS → 标签匹配 → 指标统计','metrics'],
    ['detect.py','推理入口','读取图片、视频或摄像头；加载模型、预处理、预测、筛选，再画出最终框。','run() → DetectMultiBackend → 加载输入 → 前向 → NMS → scale_boxes','inference'],
    ['export.py','格式导出','把模型转为 ONNX、OpenVINO、TensorRT 等格式；仍需准备部署端预处理、后处理和依赖。','run() → 对应 export_* 方法','inference'],
    ['models/*.yaml','网络设计图','规定来源层、模块与基础参数；深度、宽度系数决定实际的内部重复数和通道数。','backbone + head → [from, number, module, args]','architecture'],
    ['models/yolo.py','把设计图建成网络','parse_model() 组装各层；Detect 产生三尺度原始预测，并在推理模式解码。','DetectionModel → parse_model() → Detect.forward()','architecture'],
    ['models/common.py','网络积木库','Conv、C3、Bottleneck、SPPF、Concat 等模块在这里；还有多后端加载与输入适配工具。','模块 __init__() 定义参数，forward() 定义数据怎样流动','architecture'],
    ['data/*.yaml','数据在哪里、识别哪些类','path 指定数据根目录，train/val 指向图片或列表，names 的顺序给出类号含义。','check_dataset() 读取并解析路径','dataset'],
    ['data/hyps/*.yaml','训练控制旋钮','学习率、损失权重、颜色与几何增强等超参数；实际训练还可能缩放部分权重。','train.py 读取并处理 hyp，传给加载器和损失','yolo-augment'],
    ['utils/dataloaders.py','读取和组成批次','建立图像与标签的对应关系，读取、缩放、组织 Mosaic 等增强，并返回图像和标签张量。','img2label_paths() → LoadImagesAndLabels → collate_fn()','dataset'],
    ['utils/augmentations.py','具体增强变换','Letterbox、HSV、随机透视、MixUp、Copy-Paste 和可选 Albumentations；Mosaic 拼图主体在 dataloaders.py。','letterbox()、random_perspective()、mixup()','augmentation'],
    ['utils/loss.py','训练错多少','build_targets() 生成正样本索引；ComputeLoss 计算框、目标性与类别损失。','ComputeLoss.__call__() → build_targets()','yolo-loss'],
    ['utils/metrics.py','模型表现怎样','计算 IoU/CIoU、AP、mAP、混淆矩阵；fitness() 定义最佳权重的选择评分。','bbox_iou()、ap_per_class()、fitness()','metrics'],
    ['utils/autoanchor.py','检查参考框是否适合数据','先检查真实框与 Anchor 的尺寸匹配；覆盖不足时搜索新宽高。','check_anchors() → kmean_anchors()','anchors'],
    ['utils/general.py','共用检查与坐标处理','数据集路径解析、坐标转换、NMS 和最终检查点清理等。','check_dataset()、non_max_suppression()、strip_optimizer()','debugging'],
    ['utils/torch_utils.py','训练工具','设备选择、优化器、EMA、早停以及恢复训练状态等辅助功能。','smart_optimizer()、smart_resume()、ModelEMA','train-yolo'],
    ['utils/plots.py / utils/loggers/','画图与记录实验','绘制标签、批次和结果曲线，记录 CSV 或接入日志平台。结果目录与保存选项有关。','plot_images()、plot_results()、Loggers','debugging'],
    ['classify/ / segment/','其他任务入口','classify 用整图类别训练、预测和验证；segment 增加实例掩码的训练、预测与验证。标签和输出不同于普通检测。','各自的 train.py、val.py、predict.py 与 utils/segment/','tasks'],
    ['hubconf.py / benchmarks.py','快速加载与后端比较','前者提供 PyTorch Hub 加载入口；后者比较支持的导出后端速度和精度。','API 加载 / 后端验证；需按运行时准备环境','inference'],
    ['requirements.txt / LICENSE','依赖与使用条件','依赖列表帮助配置环境；源码许可证说明使用和分发条件。自定义模块及权重来源也要一并记录。','先核对版本与来源，再运行对应脚本','train-yolo']
  ];
  add('train-yolo','repo-map','先认路：仓库文件怎样分工',[
    '仓库是装有程序、配置和说明文件的项目文件夹。先用扩展名分清用途：.py 是执行步骤，.yaml 是程序读取的配置，.pt 通常保存模型或训练检查点，.csv 是表格日志。模型由结构和参数共同决定，单独一份 YAML 不含训练学到的权重。',
    '把一次检测项目想成做题：数据和标签提供题目与答案，模型负责作答，损失比较差异，优化器改参数，验证统计效果，推理用于新的输入。下面按你当前要完成的事情点选文件，先看职责，再跟到课程。',
    '按默认配置，训练结果保存在 runs/train/实验名/，推理结果保存在 runs/detect/实验名/；--project 可以改变输出根目录。根目录的 weights/ 往往是人为整理的权重库，训练脚本不会自动把每次结果搬到那里。输入目录可以自行命名；仓库没有 runs/ 或 testdata/ 并不自动代表源码缺失。'
  ],quiz('想知道“一张图片的标签怎样找到对应图像并组成批次”，优先看哪里？',['models/common.py 的卷积','utils/dataloaders.py 的加载与配对','LICENSE'],1,'模型模块处理张量；加载器负责图片、标签配对与批次组织。'));
  add('architecture','repo-scales','同一张设计图：n/s/m/l/x 怎样缩放',[
    '标准 YOLOv5n/s/m/l/x 检测模型的主要连接关系相同，通过深度系数和宽度系数改变计算规模。深度系数调整 C3 内部 Bottleneck 的数量，宽度系数调整特征通道，通道还要按解析器规则对齐。',
    '以 Backbone 第 4 层为例，YAML 基础参数为 [-1,6,C3,[256]]。s 模型的深度系数为 0.33：max(round(6×0.33),1)=2；宽度系数为 0.5：256×0.5=128。所以外部是一个输出 128 通道、内部包含 2 个 Bottleneck 的 C3。l 模型相应为一个输出 256 通道、内部含 6 个 Bottleneck 的 C3。',
    '解析器把内部数量传给 C3 的构造参数，再将外部重复数设为 1。不能用不存在的 layer.n 属性读重复次数；对标准 C3 应查看 len(layer.m)。P2、P6、分割头、Ghost 或自定义注意力配置还可能改变拓扑，不能只看文件名中的 s 或 l 判断结构。'
  ],quiz('s 模型的 [-1,6,C3,[256]]，正确理解是什么？',['外部串联6个完整C3','一个C3，内部2个Bottleneck，输出128通道','一个C3，内部6个Bottleneck，输出256通道'],1,'6×0.33经四舍五入为2，256×0.5为128；C3的外部构建次数为1。'),
  'from models.common import C3\nfrom models.yolo import Model\n\nmodel = Model("models/yolov5s.yaml", ch=3, nc=2)\nfor i, layer in enumerate(model.model):\n    count = len(layer.m) if isinstance(layer, C3) else "不适用"\n    print(i, layer.__class__.__name__, "C3内部Bottleneck数:", count)\n# Backbone 第2、4、6、8层的数量为 1、2、3、1。');
  add('anchors','repo-autoanchor','AutoAnchor：参考框合不合适，先用标签检查',[
    'Anchor 是每个网格位置准备的参考宽高。AutoAnchor 在正式训练前读取训练集真实框的宽高，检查这些参考形状是否足够接近；它不读取模型的类别分数，也不表示模型已经能检出目标。框尺寸先换算到本次训练的近似像素尺度。',
    '匹配分数取宽、高两项比例及其倒数中的最小值。默认 anchor_t=4 时，分数必须严格大于 1/4；刚好相差四倍不通过。BPR 是至少有一个可用 Anchor 的真实框比例，AAT 是每个真实框平均有几个可用 Anchor。BPR 不是验证召回率。',
    '当前实现 BPR>0.98 时保留原参考框；否则用 K-means 聚类初始化，再用遗传算法扰动宽高并改进匹配评分，默认搜索 1000 代。新 BPR 严格高于旧值时才替换模型内存中的 Anchor，并校正尺度顺序；原 YAML 不自动改写。',
    'K-means 先按宽、高各自的标准差白化；宽高都小于 2 像素的框不用于聚类，初始化失败时回退随机初始化。AutoAnchor 通常在非 --resume、未关闭 --noautoanchor 的训练开始阶段执行，由单进程或多卡主进程检查；每个 batch 的 build_targets 仍要独立匹配。'
  ],quiz('AutoAnchor 日志 BPR=0.996，能推出什么？',['模型召回率必定是99.6%','99.6%的标注框在当前尺寸比规则下有可用参考框','模型训练已经完成'],1,'BPR只按标签宽高与参考框做几何匹配，不使用预测结果。'));
  add('anchors','repo-neighbors','目标落在格子旁边：局部坐标为什么会超出0～1',[
    '网格索引表示“由哪个格子负责”，局部中心表示“目标中心距离这个格子的起点有多远”，单位为一格。以目标中心 (42.4,37.6) 为例，中心格 (42,37) 对应局部中心 (0.4,0.6)。',
    'build_targets 会按半格邻近规则增加水平或垂直邻格。左邻格 (41,37) 看同一目标时，局部中心变为 (1.4,0.6)；下邻格 (42,38) 则为 (0.4,−0.4)。这些值合理，因为坐标参考点换了。',
    '源码用 0.5 个网格单位的偏移选择索引，再计算目标中心减去负责格索引；不是给每个目标固定分配五个不同格子。目标靠近边界时还要检查有效邻格。预测端用 2×sigmoid−0.5，把可表达的局部中心扩展到约 −0.5～1.5，与这个设计配合。'
  ],quiz('中心为(42.4,37.6)，由格子(41,37)负责时，局部中心是多少？',['(0.4,0.6)','(1.4,0.6)','(42.4,37.6)'],1,'局部坐标=连续网格中心−负责格索引，横坐标42.4−41=1.4。'));
  add('yolo-loss','repo-ciou','两个框不重叠，损失也能继续指方向',[
    '普通 IoU 是交集面积除以并集面积，范围为 0～1。两个框一旦不重叠，普通 IoU 都是 0，难以仅凭这个数区分框还差多远。CIoU 在 IoU 上减去中心距离与长宽比惩罚；它可以小于 0，因此框损失 1−CIoU 可以大于 1。',
    '下面固定两个框的宽、高都是 2，只沿横向移动预测框。两框比例相同，长宽比惩罚为 0。横向中心相差 4 时，IoU=0；中心距离平方为16，最小外接矩形对角线平方为40，CIoU=−16/40=−0.4，框损失为1.4。',
    '本地 ComputeLoss 的变量虽然命名为 iou，但上一步传入 CIoU=True，所以该值实际是 CIoU。默认正样本的 objectness 目标为 max(CIoU,0)，并通过 detach 停止这条目标的梯度；框坐标主要由框损失训练。BCE允许0～1的连续目标，未匹配位置目标为0。',
    'Objectness 的 BCE 默认在每个尺度内求平均，然后使用 P3/P4/P5 的额外权重 4.0/1.0/0.4。高分辨率网格更多，不会自动让平均值按数量增大。三项损失再按超参数加权；日志分项与最终反传值还涉及 batch 等缩放。'
  ],quiz('CIoU=−0.4时，当前默认框损失与正样本objectness目标分别是多少？',['0.4 和 −0.4','1.4 和 0','1 和 1'],1,'框损失1−(−0.4)=1.4；objectness监督目标截去负值后为0。'));
  add('train-yolo','repo-training-loop','从一个batch到一次保存：按源码走完训练',[
    'DataLoader 读取图片、标签并组织批次，检测训练循环再把图像送到设备、转成浮点、除以255。模型训练模式输出原始预测，ComputeLoss 做标签匹配并计算损失。反向传播计算梯度；优化器才负责改变参数。',
    '梯度累积是先收集几个 batch 的梯度，再更新一次参数。例如每2批更新一次，第1批反向后先等候，第2批反向后再更新并清空梯度。实际累积步数会受 batch size 和预热阶段影响；下面固定为2，只演示顺序。',
    '每个 epoch 结束后，默认运行验证并计算 fitness，再保存 last.pt；评分达到当前最佳时保存 best.pt。标准检测默认 fitness=0.1×mAP@0.5+0.9×mAP@0.5:0.95。验证、保存行为受运行选项控制。',
    '正常结束或正常早停后，脚本清理最终权重中的优化器等附加状态，将epoch置为−1，并可能用EMA副本替换模型。EMA是参数的滑动平均副本，有助于平滑训练波动。下方“批次—验证—保存—清理”演示采用默认保存行为。'
  ],quiz('一次backward之后，参数一定立刻改变吗？',['一定','不一定，可能还在累积梯度，等到更新条件满足才执行step','只有验证才改参数'],1,'backward计算梯度；真正的参数更新发生在优化器step，梯度累积可使两者频率不同。'));
  add('train-yolo','repo-checkpoints','微调与断点续训：两个命令解决两件事',[
    '微调是加载已有参数，开展一次训练；断点续训是恢复被中断的实验，尽可能接上原来的epoch、优化器和EMA等状态。两者都可能读取.pt文件，但“参数还在”不等于“训练进度还在”。',
    '使用 --weights 指定初始化权重，不等于 --resume。迁移学习允许来源权重类别数与新数据集不同：程序按新任务类别数建模，迁移名称、形状兼容的参数，不匹配的检测头参数保留新初始化值。直接推理与验证则需要确保模型类别含义与标签一致。',
    '恢复中断实验应选择仍保留训练状态的检查点，并使用 --resume 实际路径。恢复通常从最近保存的epoch之后开始，不能恢复尚未保存的batch。正常完成后经 strip_optimizer 清理的last.pt可用于微调初始化，但不再是完整中断检查点。',
    '以下命令中的 myset.yaml、权重和实验名都是示例，需要按自己的文件替换。终端工作目录应是仓库根目录；先准备好数据与匹配的Python环境，再执行。'
  ],quiz('训练正常结束后得到的last.pt，文件名能保证可以完整断点续训吗？',['能','不能，还要核对epoch与优化器等状态','只要改名就能恢复'],1,'当前脚本正常结束时会清理最终检查点的训练状态；文件名不决定内部内容。'));
  add('dataset','repo-dataset-path','图片、标签与YAML：把路径拼出来再启动',[
    '数据YAML像一张地址簿，规定到哪里找图片，以及类别编号对应哪个名称。本地检测实现中，相对的 path 由 utils/general.py::check_dataset() 按仓库根目录解析，train/val/test 再相对于这个数据根目录拼接；不能笼统理解成总是相对于YAML所在目录。',
    '例如仓库位于 D:/projects/yolov5，path: ./datasets/dfire，val: val/images，解析后是 D:/projects/yolov5/datasets/dfire/val/images。若数据实际放在仓库旁边，应明确写 ../datasets/dfire，或使用适合当前机器的绝对路径。',
    '检测加载器通常把路径中的 images 换成 labels，再换成同名.txt。例如 train/images/fire001.jpg 对应 train/labels/fire001.txt，images/train/fire001.jpg 则对应 labels/train/fire001.txt；两种布局都可用，关键是路径规则与文件配对一致。',
    '没有目标的背景图可以有空标签；但“确实无目标”与“有目标却漏标”含义不同。当前加载器会把缺失标签按空标签处理，因此文件没有报错并不能证明数据标注完整。分类任务通常用类别文件夹，实例分割需要多边形等标注，不能直接套用检测的五列框标签。'
  ],quiz('仓库根目录D:/projects/yolov5，path为./datasets/dfire，val为val/images，读取哪里？',['D:/projects/yolov5/data/val/images','D:/projects/yolov5/datasets/dfire/val/images','一定在YAML同级目录'],1,'本地check_dataset将相对path按仓库根目录解析，再拼接val。'));
  add('yolo-augment','repo-augmentation-files','增强开关在哪里：配置与源码要一起查',[
    '超参数YAML设置HSV、旋转、缩放、Mosaic与MixUp等概率或幅度；加载器组织何时调用这些变换。Mosaic拼图主体在utils/dataloaders.py，Letterbox、随机透视和MixUp等函数在utils/augmentations.py。',
    '本地副本还在Albumentations流程中增加了运动模糊、高斯模糊等变换。这些变换在可选依赖可用并启用该流程时执行，不能仅凭hyp中的颜色和几何参数为0，就断言全部增强都关闭。',
    '比较实验时保存数据划分、完整命令、YAML、源码改动和依赖版本。某个配置文件名写着fire或no-augmentation，并不能证明它适合所有场景；尤其要查看增强后的标签是否同步、目标是否仍可辨认。'
  ],quiz('只把hyp里的HSV和Mosaic设为0，能保证所有本地增强都关闭吗？',['能，文件名决定行为','不能，还要核对加载流程和Albumentations等可选变换','增强与源码无关'],1,'不同增强入口可能在不同文件或可选库中，必须核对实际调用链。'));
  add('inference','repo-inference-coordinates','框的坐标属于哪张图：从解码回到原图',[
    'sigmoid把任意实数变成0～1之间的数，sigmoid(0)=0.5。检测头原始输出还没有变换；推理时中心坐标=(2×sigmoid(raw)−0.5+整数网格索引)×stride。raw是原始中心预测，stride是特征点在网络输入图上的采样间隔。',
    '源码_make_grid已在grid里减去0.5，所以Detect.forward写成(2×sigmoid(raw)+grid)×stride。以raw=0、列号10、stride=8为例，结果是84像素。不能漏掉或重复减去0.5。宽高另按(2×sigmoid(raw_wh))²×像素Anchor解码。',
    '解码得到网络输入图上的中心和宽高，NMS内转成角点坐标并筛选候选；detect.py的scale_boxes再去除Letterbox填充、除以缩放比例，映射回原图并限制到图像边界。训练只返回原始尺度张量，普通推理模式还会同时返回解码候选与原始张量。',
    '当前后处理先用objectness做预筛，再计算objectness×类别分数，例如0.8×0.75=0.6；再按分数和NMS规则留下框。分数不等于经过校准的“必然正确概率”，仍要在真实场景评估。'
  ],quiz('raw_x=0，整数网格列号10，stride=8，解码的横坐标是多少？',['80','84','88'],1,'sigmoid(0)=0.5，所以(1−0.5+10)×8=84；坐标属于网络输入图。'));
  add('debugging','repo-reproduce','实验文件在哪里：保存能解释结果的证据',[
    '训练记录通常包括启动参数opt.yaml、超参数hyp.yaml、逐epoch表格results.csv、曲线、批次标注图和weights目录。具体文件取决于保存与绘图选项。推理的labels与crops也分别受--save-txt和--save-crop控制，不能假定每次运行都生成。',
    '先用程序打印的实际保存路径定位结果。没有runs/可能是还没运行、输出到了其他位置或文件已整理；不要据此判断网络模块坏了。历史实验名、权重文件名不能替代当时的模型YAML、数据版本和验证结果。',
    '自定义模型还需核对类是否已导入、解析器是否传入正确通道和内部重复数。例如本地CBAM配置引用了尚未提供的模块，单独有YAML不能保证能构建；P2/C3GC变体也应以实际Detect输入与输出尺度核对，不能套用标准层号。',
    '建议保留：数据划分和类别顺序、代码版本或修改记录、完整命令、配置、未清理的中断检查点（需要恢复时）、最终候选权重、验证指标及失败样例。原仓库没有Git历史时，可用明确命名的源码和配置快照辅助记录。'
  ],quiz('看到历史实验文件名，能否据此复现其成绩？',['能，名字包含模型大小就足够','不能，还需数据、代码、配置、权重与评估协议','只需复制results.png'],1,'实验名称与曲线无法还原模型、数据和运行条件。'));

  // 同步修正旧正文，避免新增说明与原章节相互矛盾。
  const dataSection=get('dataset')?.sections[1];
  if(dataSection){dataSection.paragraphs=dataSection.paragraphs.map(p=>p.replace('运行前确认这些路径相对于实际工作目录如何解析。','本地检测实现中，相对path按仓库根目录解析，train/val再相对于path；不同实现应查check_dataset的实际规则。'));}
  const trainSection=get('train-yolo')?.sections[2];
  if(trainSection){trainSection.paragraphs=trainSection.paragraphs.map(p=>p.replace('`last.pt` 是最近保存的训练状态；`best.pt` 是训练期间依据验证表现选出的最佳权重。二者服务于恢复训练与选取模型的不同需求。','`last.pt` 是最近一次已保存epoch的检查点；`best.pt` 按验证fitness评分选择。正常结束时两者的优化器等训练状态会被清理，所以last.pt的文件名不能保证仍可完整续训。'));}
  const goals={architecture:'对照源码解释不同规模的C3内部重复数与通道数。',anchors:'计算BPR/AAT，并区分目标中心在不同负责网格中的局部坐标。','yolo-loss':'解释CIoU为负、框损失大于1和objectness目标截断的边界。','train-yolo':'按任务找到源码文件，并区分参数初始化、梯度更新、检查点保存与断点续训。',dataset:'按本地路径解析规则找到图像及其同名标签。','yolo-augment':'沿配置、加载器与具体变换核对实际增强流程。',inference:'手算解码坐标并区分网络输入图与原图坐标。',debugging:'根据输出文件、源码版本和配置记录判断实验能否复现。'};
  for(const [id,goal] of Object.entries(goals)){const l=get(id);l.goals=[...(l.goals||[]),goal];l.keypoints=[...(l.keypoints||[]),goal];}
  const sources=[{label:'随课阅读：YOLOv5 仓库结构与源码导览（已核对修订）',url:'assets/yolov5l/PROJECT_STRUCTURE.md'},
    {label:'官方源码：YOLOv5 模型解析与 Detect',url:'https://github.com/ultralytics/yolov5/blob/master/models/yolo.py'},
    {label:'官方源码：AutoAnchor',url:'https://github.com/ultralytics/yolov5/blob/master/utils/autoanchor.py'},
    {label:'官方源码：训练与检查点保存',url:'https://github.com/ultralytics/yolov5/blob/master/train.py'}];
  for(const id of ['architecture','anchors','yolo-loss','train-yolo','dataset','yolo-augment','inference','debugging']){
    const l=get(id);if(!l)continue;l.sources=l.sources||[];
    for(const source of sources)if(!l.sources.some(s=>s.url===source.url))l.sources.push(source);
  }

  const models={n:[.33,.25],s:[.33,.5],m:[.67,.75],l:[1,1],x:[1.33,1.25]};
  const anchors=[[10,13],[16,30],[33,23],[30,61],[62,45],[59,119],[116,90],[156,198],[373,326]];
  function scaleValues(model){const [depth,width]=models[model];return {depth,width,counts:[3,6,9,3].map(n=>Math.max(Math.round(n*depth),1)),channels:[64,128,256,512,1024].map(c=>Math.ceil(c*width/8)*8)};}
  function scaleView(model){const v=scaleValues(model);return '<div class="rg-flow"><span>同一连接拓扑</span><b>→</b><span>深度 × '+v.depth+'</span><b>＋</b><span>宽度 × '+v.width+'</span></div>'+table(['Backbone层号','外部C3数','内部Bottleneck数','输出通道'],[2,4,6,8].map((n,i)=>[n,1,v.counts[i],v.channels[i+1]]))+'<p class="rg-note">标准 '+esc(model)+' 模型；640输入时三个检测网格仍为80×80、40×40、20×20。更大模型通常增加参数与计算，实际精度和速度需测量。</p>';}
  function fileView(index){const f=fileEntries[index];return '<h4>'+esc(f[1])+'</h4><p>'+esc(f[2])+'</p><p class="rg-code-line">'+esc(f[3])+'</p><p>'+link(f[4],'到对应课程继续学习')+'</p>';}
  function anchorMetrics(boxes,refs=anchors){const scores=boxes.map(([w,h])=>refs.map(([aw,ah])=>Math.min(w/aw,aw/w,h/ah,ah/h)));return {scores,bpr:scores.filter(row=>row.some(x=>x>.25)).length/boxes.length,aat:scores.reduce((s,row)=>s+row.filter(x=>x>.25).length,0)/boxes.length};}
  function autoView(w,h){const boxes=[[18,26],[42,35],[180,110],[w,h]],m=anchorMetrics(boxes);return '<div class="rg-readouts"><div><small>4个标签框的BPR</small><strong>'+Math.round(m.bpr*100)+'%</strong></div><div><small>平均可用Anchor数 AAT</small><strong>'+m.aat.toFixed(2)+'</strong></div></div>'+table(['参考框宽×高（像素）','当前框的比例匹配分数','严格 > 0.25？'],anchors.map((a,i)=>[a.join('×'),m.scores[3][i].toFixed(3),m.scores[3][i]>.25?'通过':'不通过']))+'<p class="rg-note">前三个演示标签固定为18×26、42×35、180×110，第四个为'+w+'×'+h+'。'+(m.bpr>.98?'BPR>0.98：按默认规则保留参考框。':'BPR≤0.98：默认会尝试搜索新参考框；新BPR更高才替换。')+' 此处不模拟训练集随机缩放，也不运行聚类或训练。</p>';}
  function neighborValues(x,y){const rows=[[42,37,'中心所在格']];const f=x-Math.floor(x),g=y-Math.floor(y);if(f<.5)rows.push([41,37,'左邻格']);if(f>.5)rows.push([43,37,'右邻格']);if(g<.5)rows.push([42,36,'上邻格']);if(g>.5)rows.push([42,38,'下邻格']);return rows.map(([a,b,name])=>[name,'('+a+','+b+')','('+(x-a).toFixed(2)+','+(y-b).toFixed(2)+')']);}
  function neighborView(x,y){const localX=x-42,localY=y-37;return '<svg viewBox="0 0 390 200" role="img" aria-label="目标中心与相邻网格示意"><defs><pattern id="rg-grid-pattern" x="40" y="20" width="100" height="60" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 60" fill="none" stroke="currentColor" opacity=".2"/></pattern></defs><rect x="40" y="20" width="300" height="180" fill="url(#rg-grid-pattern)"/><rect x="140" y="80" width="100" height="60" fill="#6957b522" stroke="#6957b5"/><circle cx="'+(140+localX*100)+'" cy="'+(80+localY*60)+'" r="7" fill="#d37835"/><text x="150" y="106" fill="currentColor">格子 (42,37)</text><text x="40" y="16" fill="currentColor">橙点是目标中心；向右为x增大，向下为y增大</text></svg>'+table(['负责格','列、行索引','同一目标的局部中心'],neighborValues(x,y))+'<p class="rg-note">只演示图像内部、已匹配一个Anchor的情况。中心的小数部分恰好0.5时，对应方向不增加邻格；整数格边界的特殊记录与边缘裁剪请对照源码。本滑杆避开整数边界。</p>';}
  function ciouValues(dx){const inter=Math.max(0,2-dx)*2,iou=inter/(8-inter),distance=dx*dx/((dx+2)**2+4),ciou=iou-distance;return {iou,ciou,loss:1-ciou,obj:Math.max(ciou,0)};}
  function ciouView(dx){const v=ciouValues(dx);return '<svg viewBox="0 0 520 165" role="img" aria-label="固定真实框与水平移动的预测框"><rect x="30" y="40" width="100" height="100" fill="#2b8a7222" stroke="#2b8a72" stroke-width="3"/><rect x="'+(30+dx*50)+'" y="40" width="100" height="100" fill="#6957b522" stroke="#6957b5" stroke-width="3"/><text x="30" y="22" fill="currentColor">绿色：真实框；紫色：预测框；宽高均为2</text></svg>'+'<div class="rg-readouts">'+[['普通IoU',v.iou],['CIoU',v.ciou],['框损失 1−CIoU',v.loss],['objectness目标 max(CIoU,0)',v.obj]].map(([label,value])=>'<div><small>'+label+'</small><strong>'+value.toFixed(3)+'</strong></div>').join('')+'</div>'+'<p class="rg-note">中心横向距离为'+dx.toFixed(1)+'。只演示单个正样本，长宽比惩罚为0；未加入尺度权重、损失系数和batch缩放，不能当作训练日志的总损失。</p>';}
  const phases=[{title:'准备一次epoch',text:'演示共4批，每批2张图片；固定累积2批更新一次，参数更新次数为0。',updates:0}];
  for(let b=1;b<=4;b++){
    phases.push({title:'第'+b+'批：读取与预处理',text:'DataLoader给出图片与标签；train.py转浮点、送到设备、像素除以255。',updates:Math.floor((b-1)/2)});
    phases.push({title:'第'+b+'批：前向与损失',text:'模型给出原始预测；ComputeLoss匹配标签并计算框、目标性和类别损失。',updates:Math.floor((b-1)/2)});
    phases.push({title:'第'+b+'批：反向与累积',text:b%2?'计算梯度并累积；还没达到2批，参数暂不更新。':'累积达到2批：执行优化器更新、清空梯度并更新EMA副本。',updates:Math.floor(b/2)});
  }
  phases.push({title:'epoch结束：验证',text:'使用验证数据计算指标，不做反向传播或优化器更新。',updates:2},
    {title:'保存检查点',text:'按保存选项写入last.pt；当前fitness达到最佳时写入best.pt。中断时可恢复最近已保存的epoch。',updates:2},
    {title:'正常结束：清理最终权重',text:'本示例只训练1个epoch。正常退出会清理优化器等状态并将epoch置为−1；这样的last.pt可用于微调，但不能当完整中断检查点。',updates:2});
  function phaseView(i){const p=phases[i];return '<div class="rg-flow"><span>4批 / 每2批更新</span><b>→</b><span>当前更新次数 '+p.updates+'</span></div><h4>'+esc(p.title)+'</h4><p>'+esc(p.text)+'</p><progress max="'+(phases.length-1)+'" value="'+i+'" aria-label="训练步骤进度"></progress><p class="rg-note">固定累积步数、单epoch的流程示意；正式训练的预热、验证和保存选项可能改变行为。</p>';}
  function checkpointView(mode){const copy={
    interrupted:['中断时保存的检查点','模型参数、epoch和优化器等状态仍在；用--resume恢复原实验。','python train.py --resume "runs/train/你的实验名/weights/last.pt"','恢复到最近保存的epoch之后，不保证找回未保存的batch。'],
    finished:['正常完成后已清理的权重','参数仍可用，但优化器等状态已清理、epoch置为−1；可加载参数开展微调。','python train.py --weights "weights/你的权重.pt" --cfg models/yolov5s.yaml --data data/myset.yaml --epochs 100','新训练使用新任务配置；先核对参数迁移日志与类别顺序。'],
    transfer:['来源类别数不同的预训练权重','例如80类预训练模型用于2类任务：构建2类模型，迁移兼容参数，重新训练不匹配部分。','python train.py --weights yolov5s.pt --cfg models/yolov5s.yaml --data data/myset.yaml --epochs 100','这是迁移学习，不是恢复来源模型的中断进度。来源权重可能需要下载。']
  }[mode];return '<h4>'+copy[0]+'</h4><p>'+copy[1]+'</p><pre><code>'+esc(copy[2])+'</code></pre><p class="rg-note">终端示例，请替换路径并先准备数据和环境。'+copy[3]+'</p>';}
  function pathView(layout){return '<div class="rg-flow"><span>仓库根目录<br>D:/projects/yolov5</span><b>＋</b><span>path<br>./datasets/dfire</span><b>＋</b><span>val<br>'+layout+'</span></div><p>解析后的图片目录：<strong>D:/projects/yolov5/datasets/dfire/'+layout+'</strong></p>'+table(['图片','按images→labels规则寻找的标签'],[['datasets/dfire/'+layout+'/fire001.jpg','datasets/dfire/'+layout.replace('images','labels')+'/fire001.txt']])+'<p class="rg-note">示例盘符与目录是教学用地址。真实运行请查看check_dataset输出；YAML也可使用图片列表或绝对路径。</p>';}
  function coordView(raw){const sig=1/(1+Math.exp(-raw)),local=sig*2-.5,pixel=(local+10)*8;return table(['步骤','计算','结果'],[['原始输出 raw',raw.toFixed(1),'尚未成为坐标'],['sigmoid(raw)','1/(1+exp(−raw))',sig.toFixed(3)],['局部中心','2×sigmoid−0.5',local.toFixed(3)],['输入图横坐标','(局部中心+10)×8',pixel.toFixed(3)+'像素']])+'<div class="rg-flow"><span>输入图中心宽高</span><b>→</b><span>角点转换、筛选、NMS</span><b>→</b><span>去填充、除缩放比例</span><b>→</b><span>原图框</span></div><p class="rg-note">固定网格列号10、stride=8。右侧原图还原需要实际Letterbox比例与填充数据，不能直接把本表像素当成原图坐标。</p>';}
  function directoryView(){return table(['位置或文件','何时出现 / 如何理解'],[
    ['runs/train/实验名/weights/','训练按选项生成best.pt、last.pt；可由--project更改根目录。'],
    ['opt.yaml / hyp.yaml','参数与超参数快照；解释实验还需源码与依赖版本。'],
    ['results.csv / results.png','逐epoch数值及曲线；损失与验证指标结合看。'],
    ['train_batch*.jpg / val_batch*_pred.jpg','样本和预测可视化；训练批次图不一定都是Mosaic。'],
    ['runs/detect/实验名/','推理输出；labels需--save-txt，crops需--save-crop。'],
    ['weights/ / testdata/','可自行整理的权重库与输入目录；名称本身不决定代码行为。'],
    ['models/自定义.yaml + 配套模块','YAML引用的类、导入和解析规则都齐全后，才能尝试构建；存在配置不等于实现已完成。']
  ])+'<p class="rg-note">'+link('train-yolo','回到训练与检查点')+' · <a href="assets/yolov5l/PROJECT_STRUCTURE.md" download>下载完整仓库导览 Markdown</a>。下载文档中的目录库存为2026-10-21本地快照，实际文件请以自己的副本为准。</p>';}
  const views={
    'repo-map':()=>panel('files','按任务点选源码文件',chips(['source-repository','yaml','checkpoint'])+'<div class="rg-file-grid">'+fileEntries.map((f,i)=>'<button type="button" data-rg-file="'+i+'" aria-pressed="'+(i===0)+'">'+esc(f[0])+'</button>').join('')+'</div><div data-rg-result aria-live="polite">'+fileView(0)+'</div>'),
    'repo-scales':()=>panel('scales','切换模型规模，看内部数量与通道怎样变',chips(['c3','bottleneck','channel'])+'<div class="rg-controls" role="group" aria-label="模型规模">'+Object.keys(models).map(k=>'<button type="button" data-rg-model="'+k+'" aria-pressed="'+(k==='s')+'">YOLOv5'+k+'</button>').join('')+'</div><div data-rg-result aria-live="polite">'+scaleView('s')+'</div>'),
    'repo-autoanchor':()=>panel('auto','改变一个真实框，检查几何匹配',chips(['autoanchor','anchor-bpr','anchor-aat'])+'<div class="rg-controls"><label>第四个框宽度（像素）<input type="number" min="2" max="2000" value="40" data-rg-width></label><label>高度（像素）<input type="number" min="2" max="2000" value="20" data-rg-height></label><button type="button" data-rg-anchor-extreme>查看极细长框 2×1000</button></div><div data-rg-result aria-live="polite">'+autoView(40,20)+'</div>'),
    'repo-neighbors':()=>panel('neighbors','同一个目标，换一个负责格子',chips(['grid','positive-sample','coordinate'])+'<div class="rg-controls"><label>中心x（42.01～42.99）<input type="range" min="42.01" max="42.99" step="0.01" value="42.4" data-rg-x></label><label>中心y（37.01～37.99）<input type="range" min="37.01" max="37.99" step="0.01" value="37.6" data-rg-y></label></div><output data-rg-position>x=42.40，y=37.60</output><div data-rg-result aria-live="polite">'+neighborView(42.4,37.6)+'</div>'),
    'repo-ciou':()=>panel('ciou','拖远预测框，看IoU、CIoU和两种训练目标',chips(['iou','ciou','objectness','bce-with-logits'])+'<label>中心横向距离<input type="range" min="0" max="6" step="0.1" value="4" data-rg-distance></label><div data-rg-result aria-live="polite">'+ciouView(4)+'</div>'),
    'repo-training-loop':()=>panel('loop','逐步走完4个batch、验证与保存',chips(['batch','epoch','gradient-accumulation','exponential-moving-average','fitness-score'])+'<div class="rg-controls"><button type="button" data-rg-loop="prev" disabled>上一步</button><button type="button" data-rg-loop="next">下一步</button><button type="button" data-rg-loop="reset">重新开始</button></div><div data-rg-result aria-live="polite">'+phaseView(0)+'</div>'),
    'repo-checkpoints':()=>panel('checkpoint','先判断状态，再选择命令',chips(['checkpoint','resume-training','fine-tuning','transfer-learning'])+'<div class="rg-controls" role="group" aria-label="权重来源与训练状态"><button type="button" data-rg-checkpoint="interrupted" aria-pressed="true">训练中断</button><button type="button" data-rg-checkpoint="finished" aria-pressed="false">已经正常完成</button><button type="button" data-rg-checkpoint="transfer" aria-pressed="false">换类别做迁移</button></div><div data-rg-result aria-live="polite">'+checkpointView('interrupted')+'</div>'),
    'repo-dataset-path':()=>panel('paths','两种目录布局，按规则找到标签',chips(['working-directory','path','yaml','dataloader'])+'<div class="rg-controls" role="group" aria-label="数据目录布局"><button type="button" data-rg-layout="val/images" aria-pressed="true">val/images</button><button type="button" data-rg-layout="images/val" aria-pressed="false">images/val</button></div><div data-rg-result aria-live="polite">'+pathView('val/images')+'</div>'),
    'repo-augmentation-files':()=>panel('augmentation','沿着实际调用链找开关','<div class="rg-flow"><span>hyp YAML<br>参数与概率</span><b>→</b><span>dataloaders.py<br>组织拼图与调用</span><b>→</b><span>augmentations.py<br>具体变换与可选库</span><b>→</b><span>图像和标签同步检查</span></div><p>'+link('dataset','核对标签配对')+' · '+link('augmentation','理解增强怎样改变图像')+'</p>'),
    'repo-inference-coordinates':()=>panel('decode','让一个原始数字变成输入图上的位置',chips(['logit','sigmoid','stride','decode','nms'])+'<label>原始中心输出 raw<input type="range" min="-4" max="4" step="0.1" value="0" data-rg-raw></label><div data-rg-result aria-live="polite">'+coordView(0)+'</div>'),
    'repo-reproduce':()=>panel('outputs','文件名说明角色，运行记录说明事实',directoryView())
  };
  const previous=window.lessonPlaygrounds||{};
  window.lessonPlaygrounds={...previous,render(id,index,legacyIndex){return views[index]?views[index]():(previous.render?.(id,index,legacyIndex)||'');},initialize(){previous.initialize?.();}};
  function pressed(root,selector,button){root.querySelectorAll(selector).forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}
  function redraw(root,html){root.querySelector('[data-rg-result]').innerHTML=html;window.visionlabGlossary?.decorate(root);}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');const r=b?.closest('[data-rg]');if(!r)return;
    if(b.dataset.rgFile!==undefined){pressed(r,'[data-rg-file]',b);redraw(r,fileView(Number(b.dataset.rgFile)));}
    if(b.dataset.rgModel){pressed(r,'[data-rg-model]',b);redraw(r,scaleView(b.dataset.rgModel));}
    if(b.dataset.rgCheckpoint){pressed(r,'[data-rg-checkpoint]',b);redraw(r,checkpointView(b.dataset.rgCheckpoint));}
    if(b.dataset.rgLayout){pressed(r,'[data-rg-layout]',b);redraw(r,pathView(b.dataset.rgLayout));}
    if(b.hasAttribute('data-rg-anchor-extreme')){r.querySelector('[data-rg-width]').value='2';r.querySelector('[data-rg-height]').value='1000';redraw(r,autoView(2,1000));}
    if(b.dataset.rgLoop){const now=Number(r.dataset.step||0),mode=b.dataset.rgLoop,i=mode==='reset'?0:Math.max(0,Math.min(phases.length-1,now+(mode==='next'?1:-1)));r.dataset.step=String(i);redraw(r,phaseView(i));r.querySelector('[data-rg-loop="prev"]').disabled=i===0;r.querySelector('[data-rg-loop="next"]').disabled=i===phases.length-1;}
  });
  document.addEventListener('input',e=>{
    const r=e.target.closest('[data-rg]');if(!r)return;
    if(r.dataset.rg==='auto'){const w=Number(r.querySelector('[data-rg-width]').value),h=Number(r.querySelector('[data-rg-height]').value);if(!Number.isFinite(w)||!Number.isFinite(h)||w<2||h<2||w>2000||h>2000){redraw(r,'<p role="status">请输入2～2000之间的有限宽高，单位为像素。</p>');return;}redraw(r,autoView(w,h));}
    if(r.dataset.rg==='neighbors'){const x=Number(r.querySelector('[data-rg-x]').value),y=Number(r.querySelector('[data-rg-y]').value);r.querySelector('[data-rg-position]').textContent='x='+x.toFixed(2)+'，y='+y.toFixed(2);redraw(r,neighborView(x,y));}
    if(r.dataset.rg==='ciou')redraw(r,ciouView(Number(e.target.value)));
    if(r.dataset.rg==='decode')redraw(r,coordView(Number(e.target.value)));
  });
  window.visionlabRepositoryGuide={scaleValues,anchorMetrics,ciouValues,neighborValues,phases,sectionIds:Object.keys(views)};
})();
