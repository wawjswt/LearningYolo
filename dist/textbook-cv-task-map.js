/* Computer-vision task map: compare outputs and keep the shared-architecture analogy in bounds. */
(()=>{
  const lesson=lessons.find(item=>item.id==='tasks');
  const content=textbook.tasks;
  if(!lesson||!content)return;

  const firstSection=lesson.sections.length;
  lesson.title='视觉任务地图：从分类到关键点与生成';
  lesson.desc='看懂计算机视觉常见任务各自需要什么答案，以及主干、解码器与任务输出之间的关系。';
  lesson.time=42;
  content.goals=[
    '从下游问题出发，选择合适的视觉输出、标签形式与评价方式。',
    '比较图像分类、目标检测、图像分割、关键点检测与生成/复原的输出。',
    '区分语义、实例与全景分割，并说明生成和复原的目标差异。',
    '用 Backbone、可选 Neck / Decoder、Task Head 理解常见模型，同时识别这套抽象的边界。'
  ];
  lesson.goals=content.goals;
  content.sections.push(
    {
      title:'5. 同一张图，五类任务给出五种答案',
      paragraphs:[
        '把输入固定成一张街景，改变任务定义，模型要回答的问题也跟着变。分类常回答“整张图里有什么”；检测为每个目标给类别和位置；分割把答案细化到像素或实例轮廓；关键点检测给出一组有语义的坐标；生成与复原则输出一张新图或一张尽量恢复细节的图。实际项目里还常见深度估计、光流、跟踪、OCR 等任务，这五类是便于入门的常见视角，并不是完整清单。',
        '下面的示意图复用同一幅输入场景。点选任务后，对照图像上的标记、模型输出、标注单位和常见评价方式。图里的类别与分数是教学示意，不代表任何模型的真实预测。'
      ]
    },
    {
      title:'6. 关键点任务：每个坐标都要有语义',
      paragraphs:[
        '关键点检测寻找预先定义的地标，例如人体肩、肘、腕、髋、膝，或人脸、手部、动物和工业零件上的特征点。一个点不仅是 (x,y)：还要知道它代表哪个部位，数据协议通常还会标注可见性或置信信息。多人姿态估计还要把各点正确归到对应的人。',
        '模型可以用热力图表示“这个点可能在图像的哪些位置”，也可以直接回归坐标；这两种是常见设计，不是唯一做法。标注时要统一遮挡点、出画点和左右侧的规则。评价也要使用与坐标和目标尺度相符的协议，例如 COCO 关键点任务使用 OKS 衡量预测点与标注点的匹配。关键点可以和检测框一起预测：框定位整个人，点描述身体几何。'
      ]
    },
    {
      title:'7. 图像生成与图像复原：创造和找回是不同目标',
      paragraphs:[
        '图像生成从随机噪声、文字或其他条件出发，合成一张符合条件的新图；图像复原则从一张受损输入出发，尽量恢复其中丢失或受干扰的信息。去噪、去模糊、超分辨率和补全都属于常见复原问题。图像到图像翻译则把一种表示映射到另一种表示，例如把边缘图变成照片。',
        '这些目标可能共享某些网络部件，但不能把模型名称直接当成任务类别。GAN 是包含生成器和判别器的一类训练框架；U-Net 是一种编码器—解码器结构，可用于分割、复原，也常作为扩散模型的去噪网络；扩散模型则通过逐步去噪生成或处理图像。评价生成图与复原图的办法也不同：PSNR、SSIM 常用于有参考真值的复原比较，但不完全代表人眼感受；生成任务更关心真实感、多样性和条件是否满足。'
      ]
    },
    {
      title:'8. Backbone + Neck / Decoder + Task Head：有用的抽象，不是硬性模板',
      paragraphs:[
        '许多判别式视觉模型可以拆成三段来理解：Backbone 从图像提取特征；可选的 Neck 或 Decoder 融合多层特征、恢复空间分辨率；Task Head 把特征变成当前任务需要的答案。YOLOv5 是一个具体例子：骨干提取特征，颈部融合多尺度信息，检测头预测框、目标性和类别。',
        '任务头的输出和训练目标不会因为共用特征就变成一样。分类学习类别分数；检测还要学习位置与目标性；分割要对像素或实例掩码负责；关键点要处理点的位置与可见性；图像生成/复原常由生成器或去噪网络直接产出图像。标签、损失、指标、后处理也要随任务改变。Transformer 模型、端到端解码器和生成式网络也不一定能整齐地套进传统 CNN 的“骨干加一个小头”。所以 Backbone + Head 是建立直觉的通用地图，不是所有计算机视觉模型共用的固定结构或统一训练配方。'
      ]
    }
  );
  content.keypoints=[
    '先问模型要交付什么答案，再决定任务、标签和指标。',
    '分类给图像级类别；检测给实例框；分割细化到像素或实例掩码；关键点给带语义的坐标。',
    '语义分割按像素分类；实例分割区分同类个体；全景分割同时覆盖背景区域与独立物体。',
    '图像生成创造新样本，图像复原从受损输入恢复信息；具体目标决定网络与评价办法。',
    'Backbone + 可选 Neck / Decoder + Task Head 有助于读懂常见判别模型，但不能当作所有模型的固定结构。',
    '共享特征不等于共享标签、损失、指标或后处理。'
  ];
  content.worked={
    title:'例题：这个需求应该交给哪类视觉任务？',
    prompt:'仓库希望逐个找到画面里的箱子并统计数量，不要求输出箱子轮廓或朝向。第一版应该标注什么？',
    solution:'先用目标检测：为每个箱子标类别和边界框，模型可据此定位并计数。只有决策需要精确轮廓时，才增加实例掩码；若箱子密集且旋转角度很重要，再评估旋转框。'
  };
  lesson.keypoints=content.keypoints;
  lesson.worked=content.worked;
  content.sources=[
    {url:'https://docs.ultralytics.com/tasks',label:'Ultralytics 官方任务定义：分类、检测、分割、姿态等'},
    {url:'https://docs.ultralytics.com/yolov5/tutorials/architecture-description',label:'YOLOv5 架构说明：Backbone、Neck 与 Head'},
    {url:'https://openaccess.thecvf.com/content_CVPR_2019/html/Kirillov_Panoptic_Segmentation_CVPR_2019_paper.html',label:'Panoptic Segmentation：语义与实例分割的关系'},
    {url:'https://cocodataset.github.io/dataset/keypoints-eval.htm',label:'COCO 关键点检测任务与 OKS 评估'},
    {url:'https://papers.neurips.cc/paper/2020/hash/4c5bcfec8584af0d967f1ab10179ca4b-Abstract.html',label:'Denoising Diffusion Probabilistic Models'},
    {url:'https://openaccess.thecvf.com/content_cvpr_2017/papers/Isola_Image-To-Image_Translation_With_CVPR_2017_paper.pdf',label:'Conditional GANs for Image-to-Image Translation'},
    {url:'https://arxiv.org/abs/1608.03981',label:'DnCNN：残差学习用于图像去噪'}
  ];
  lesson.sources=content.sources;
  lesson.code=[
    'output_to_task = {',
    '    "整图类别": "图像分类",',
    '    "类别 + 边界框": "目标检测",',
    '    "像素或实例掩码": "图像分割",',
    '    "带名称的坐标点": "关键点检测",',
    '    "新图或复原图": "图像生成 / 复原",',
    '}',
    '',
    'print(output_to_task["带名称的坐标点"])'
  ].join('\n');
  lesson.language='Python';
  lesson.quiz={
    q:'要给画面中每位行人输出手腕、肘部和膝盖坐标，最直接的任务输出是什么？',
    options:['整张图的类别分数','每个人的边界框','带名称的关键点坐标'],
    answer:2,
    why:'问题需要身体各部位的坐标，因此应使用关键点或姿态估计输出。'
  };

  const modes={
    classification:{label:'图像分类',question:'整张图或一个区域属于什么类别？',annotation:'每张图一个或多个类别标签',output:'类别分数，例如“街景 0.92”',metric:'准确率、Precision / Recall、F1',architecture:'Backbone → 分类 Head',hint:'不提供每个目标的位置；若要数清画面里的每辆车，单张图类别就不够。'},
    detection:{label:'目标检测',question:'每个目标是什么，分别在哪里？',annotation:'每个实例一个类别与边界框',output:'框坐标、类别与置信分数',metric:'按类别统计 AP / Recall',architecture:'Backbone → 多尺度 Neck → 检测 Head',hint:'边界框表达矩形位置，不会精确描出目标轮廓。'},
    segmentation:{label:'图像分割',question:'每个像素属于哪类，或属于哪个个体？',annotation:'像素类别图或实例掩码',output:'像素级标签、轮廓或实例 ID',metric:'mIoU、Dice，实例任务常看 mask AP',architecture:'Backbone → Neck / Decoder → Mask Head',hint:'像素级信息更细，标注协议和模型输出也需要更细。'},
    keypoints:{label:'关键点检测',question:'目标的关键部位或地标在哪里？',annotation:'具名坐标点，按规则标可见性',output:'点坐标、部位名称与置信 / 可见信息',metric:'OKS / AP 或任务自定义点误差',architecture:'Backbone → Neck → Keypoint Head',hint:'检测框定位整个目标；关键点描述目标内部的几何结构。'},
    image:{label:'生成 / 复原',question:'怎样生成符合条件的新图，或恢复受损图像？',annotation:'噪声、条件、成对真值或其他任务监督',output:'一张合成图、转换图或复原图',metric:'依任务看 PSNR / SSIM、分布指标或人工评价',architecture:'条件 / 噪声 → Generator 或 Denoiser → 图像',hint:'生成与复原的输入和目标不同，不应只看用了哪种网络就判断任务。'}
  };
  const segmentationModes={
    semantic:{label:'语义分割',summary:'每个像素分配类别；同类的两辆车可属于同一个类别区域，不要求分开编号。'},
    instance:{label:'实例分割',summary:'每个物体都有自己的掩码和类别；两辆车即使同属汽车，也会作为两个实例区分。'},
    panoptic:{label:'全景分割',summary:'把可数的独立物体与道路、天空等背景区域放进同一张场景图中。'}
  };
  const scenarios=[
    {question:'只判断一张照片里有没有安全帽，不需要知道它在哪里。',mode:'classification',reason:'只要图像级有无类别时，分类标注最省；若要检查每个人是否佩戴，就需要逐目标定位。'},
    {question:'找出照片里每辆车的位置并统计数量，不要求精确轮廓。',mode:'detection',reason:'逐辆车的框和类别足以定位与计数，掩码会增加不必要的标注成本。'},
    {question:'把拥挤画面里的每只动物轮廓单独描出来。',mode:'segmentation',segmentation:'instance',reason:'需要每个动物的独立像素轮廓，因此选实例分割。'},
    {question:'记录每位行人的肩、肘、腕、髋和膝位置。',mode:'keypoints',reason:'每个部位都要有具名坐标，属于关键点或姿态估计。'},
    {question:'把有噪点的夜间照片变清楚，尽量保留原有场景。',mode:'image',image:'restore',reason:'输入已经存在但质量受损，目标是复原信息；它不是从无到有地生成场景。'}
  ];
  const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function playgroundMarkup(){
    return '<section class="lesson-playground cv-task-map" data-cv-task-map data-cv-mode="classification" data-cv-segmentation="semantic" data-cv-image="generate" aria-labelledby="cv-task-map-title">'
      +'<div class="playground-heading"><div><span class="playground-kicker">互动图解 · 视觉任务选型</span><h3 id="cv-task-map-title">同一张图，模型会交出哪种答案？</h3><p>点选五类常见任务，观察输入标记、模型输出和常见评价方式如何变化。</p></div><button type="button" class="playground-reset" data-cv-task-reset>恢复分类</button></div>'
      +'<div class="cv-task-switch" role="group" aria-label="选择计算机视觉任务">'+Object.entries(modes).map(([id,spec])=>'<button type="button" data-cv-task-choice="'+id+'" aria-pressed="'+String(id==='classification')+'">'+spec.label+'</button>').join('')+'</div>'
      +'<div class="cv-task-subcontrols" data-cv-seg-controls role="group" aria-label="选择分割类型" hidden>'+Object.entries(segmentationModes).map(([id,spec])=>'<button type="button" data-cv-segmentation="'+id+'" aria-pressed="'+String(id==='semantic')+'">'+spec.label+'</button>').join('')+'</div>'
      +'<div class="cv-task-subcontrols" data-cv-image-controls role="group" aria-label="选择图像生成或复原" hidden><button type="button" data-cv-image="generate" aria-pressed="true">从噪声 / 条件生成</button><button type="button" data-cv-image="restore" aria-pressed="false">从受损输入复原</button></div>'
      +'<div class="cv-task-architecture" data-cv-task-architecture></div>'
      +'<div class="cv-task-figure" data-cv-task-figure></div>'
      +'<div class="cv-task-readouts" data-cv-task-readouts></div>'
      +'<p class="cv-task-hint" data-cv-task-hint role="status" aria-live="polite"></p>'
      +'<div class="cv-task-practice"><label for="cv-task-scenario"><span>试着选任务</span><select id="cv-task-scenario" data-cv-scenario>'+scenarios.map((item,index)=>'<option value="'+index+'">'+item.question+'</option>').join('')+'</select></label><button type="button" data-cv-scenario-check>查看建议</button><p data-cv-scenario-feedback role="status" aria-live="polite">先读情境，再判断系统需要交付哪种答案。</p></div>'
      +'<p class="playground-footnote">图中场景、标签与分数均为教学示意。实际模型、标签和指标需按项目目标与数据协议确定。</p></section>';
  }
  function scene(x,y,scale,variant){
    const transform='translate('+x+' '+y+') scale('+scale+')';
    let out='<g transform="'+transform+'"><rect x="0" y="0" width="320" height="220" rx="5" fill="'+(variant==='warm'?'#f1dfc6':'#e2edeb')+'"/>';
    out+='<path d="M0 116L45 83L86 112L131 70L178 112L223 79L270 112L320 87V148H0Z" fill="'+(variant==='warm'?'#dbc9b4':'#c8d8d3')+'"/>';
    out+='<rect x="16" y="99" width="55" height="65" fill="#b6b7aa"/><rect x="24" y="111" width="11" height="13" fill="#e7e1cd"/><rect x="47" y="111" width="11" height="13" fill="#e7e1cd"/>';
    out+='<rect x="231" y="91" width="67" height="73" fill="#c7b9a8"/><rect x="243" y="102" width="13" height="15" fill="#ede5d5"/><rect x="269" y="102" width="13" height="15" fill="#ede5d5"/>';
    out+='<rect x="0" y="142" width="320" height="78" fill="#84928e"/><path d="M0 169H320M151 173V185M206 173V185M260 173V185" stroke="#f5efd9" stroke-width="3" stroke-dasharray="12 11"/>';
    out+='<path d="M103 156L117 139H193L211 156V182H98V161Z" fill="#76699c"/><rect x="124" y="144" width="31" height="18" fill="#dfe5df"/><rect x="159" y="144" width="28" height="18" fill="#dfe5df"/><circle cx="121" cy="182" r="10" fill="#39474a"/><circle cx="190" cy="182" r="10" fill="#39474a"/>';
    out+='<circle cx="264" cy="132" r="8" fill="#b7795d"/><path d="M264 140V169M252 151L264 145L277 153M264 169L254 190M264 169L275 190" fill="none" stroke="#b7795d" stroke-width="6" stroke-linecap="round"/>';
    if(variant==='noisy')out+='<rect x="0" y="0" width="320" height="220" fill="url(#cv-task-noise)" opacity=".34"/>';
    out+='</g>';return out;
  }
  function svgMarkup(mode,segmentation,imageMode){
    const spec=modes[mode],seg=segmentationModes[segmentation];
    let svg='<svg viewBox="0 0 850 326" role="img" aria-label="'+esc(spec.label+'：'+spec.question)+'" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="cv-task-noise" width="13" height="13" patternUnits="userSpaceOnUse"><path d="M0 0L13 13M13 0L0 13" stroke="#ffffff" stroke-width="1.4"/></pattern><pattern id="cv-task-static" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#dcd9df"/><circle cx="5" cy="5" r="2" fill="#7b7393"/><circle cx="15" cy="12" r="2.5" fill="#afa1bd"/><path d="M2 17L10 9M14 5L19 0" stroke="#fff" stroke-width="2"/></pattern></defs>';
    if(mode==='image'&&imageMode==='generate'){
      svg+='<text x="30" y="30" fill="#58636d" font-size="12" font-weight="700">条件 / 随机噪声</text><rect x="30" y="47" width="320" height="230" rx="7" fill="#f7f5f0" stroke="#dedbd4"/><rect x="50" y="70" width="103" height="99" rx="5" fill="url(#cv-task-static)"/><text x="101" y="188" text-anchor="middle" fill="#65717a" font-size="11">随机噪声</text><rect x="50" y="209" width="278" height="44" rx="5" fill="#eee9f4"/><text x="64" y="227" fill="#655593" font-size="10" font-weight="700">提示词</text><text x="64" y="243" fill="#55616b" font-size="11">“黄昏的城市街景”</text><path d="M358 154H390" stroke="#7b6ca8" stroke-width="2"/><path d="M384 148L391 154L384 160" fill="none" stroke="#7b6ca8" stroke-width="2"/><rect x="399" y="47" width="420" height="230" rx="7" fill="#f8f7f3" stroke="#dedbd4"/><text x="419" y="73" fill="#384652" font-size="13" font-weight="700">生成器 / 去噪器逐步得到新图</text>'+scene(516,97,.62,'warm')+'<text x="648" y="259" text-anchor="middle" fill="#6e637f" font-size="10">合成结果 · 受条件约束</text>';
    }else if(mode==='image'){
      svg+='<text x="30" y="30" fill="#58636d" font-size="12" font-weight="700">输入：受噪声干扰的原图</text><rect x="30" y="47" width="320" height="230" rx="7" fill="#f7f5f0" stroke="#dedbd4"/>'+scene(30,52,1,'noisy')+'<path d="M358 154H390" stroke="#7b6ca8" stroke-width="2"/><path d="M384 148L391 154L384 160" fill="none" stroke="#7b6ca8" stroke-width="2"/><rect x="399" y="47" width="420" height="230" rx="7" fill="#f8f7f3" stroke="#dedbd4"/><text x="419" y="73" fill="#384652" font-size="13" font-weight="700">复原网络尽量找回可用细节</text>'+scene(516,97,.62,'day')+'<text x="648" y="259" text-anchor="middle" fill="#6e637f" font-size="10">复原结果 · 应保留原场景内容</text>';
    }else{
      svg+='<text x="30" y="30" fill="#58636d" font-size="12" font-weight="700">同一输入：街景图像</text>'+scene(30,47,1,'day')+'<path d="M358 154H390" stroke="#7b6ca8" stroke-width="2"/><path d="M384 148L391 154L384 160" fill="none" stroke="#7b6ca8" stroke-width="2"/><rect x="399" y="47" width="420" height="230" rx="7" fill="#f8f7f3" stroke="#dedbd4"/>';
      if(mode==='classification'){
        svg+='<text x="423" y="79" fill="#655593" font-size="11" font-weight="700">整图类别分数</text><rect x="423" y="98" width="367" height="54" rx="5" fill="#eeeaf5"/><text x="441" y="131" fill="#384652" font-size="19" font-weight="700">城市街景</text><text x="766" y="131" text-anchor="end" fill="#3e8471" font-size="18" font-weight="700">0.92</text><rect x="423" y="166" width="367" height="6" rx="3" fill="#e0ddd7"/><rect x="423" y="166" width="337" height="6" rx="3" fill="#79a691"/><text x="423" y="202" fill="#6b7580" font-size="11">回答“图里大致是什么”，不告诉你具体位置。</text>';
      }else if(mode==='detection'){
        svg+='<rect x="122" y="176" width="111" height="74" fill="none" stroke="#7764a6" stroke-width="3"/><rect x="122" y="158" width="103" height="19" rx="2" fill="#7764a6"/><text x="129" y="171" fill="#fff" font-size="10">汽车 · 0.92</text><rect x="273" y="156" width="42" height="123" fill="none" stroke="#468b75" stroke-width="3"/><rect x="273" y="138" width="94" height="19" rx="2" fill="#468b75"/><text x="280" y="151" fill="#fff" font-size="10">行人 · 0.87</text><text x="423" y="81" fill="#384652" font-size="14" font-weight="700">每个实例一条检测结果</text><rect x="423" y="100" width="367" height="49" rx="5" fill="#eeeaf5"/><text x="440" y="121" fill="#514477" font-size="12" font-weight="700">汽车 · 框坐标 + 类别 + 分数</text><text x="440" y="138" fill="#66727c" font-size="10">矩形定位；不等于像素轮廓</text><rect x="423" y="161" width="367" height="49" rx="5" fill="#eaf2ee"/><text x="440" y="182" fill="#3d7866" font-size="12" font-weight="700">行人 · 框坐标 + 类别 + 分数</text><text x="440" y="199" fill="#66727c" font-size="10">数量、位置和类别都可以从结果读取</text>';
      }else if(mode==='segmentation'){
        if(segmentation==='semantic'){
          svg+='<path d="M30 192H350V277H30Z" fill="#488d76" fill-opacity=".38"/><path d="M130 178L151 157H218L238 177V203H123V185Z" fill="#7665a5" fill-opacity=".52"/><path d="M265 184L273 174L287 177L299 192L315 279H270Z" fill="#7665a5" fill-opacity=".52"/><text x="421" y="79" fill="#384652" font-size="14" font-weight="700">语义分割：逐像素回答“是什么类”</text><rect x="424" y="103" width="16" height="16" rx="3" fill="#7665a5" fill-opacity=".68"/><text x="450" y="115" fill="#56636e" font-size="11">汽车 / 行人类别区域</text><rect x="424" y="134" width="16" height="16" rx="3" fill="#488d76" fill-opacity=".55"/><text x="450" y="146" fill="#56636e" font-size="11">道路像素</text><text x="424" y="188" fill="#66727c" font-size="11">同类物体可能连成同一类别区域。</text><text x="424" y="211" fill="#66727c" font-size="11">图像中的轮廓随掩码边界表达。</text>';
        }else if(segmentation==='instance'){
          svg+='<path d="M30 192H350V277H30Z" fill="#488d76" fill-opacity=".32"/><path d="M130 178L151 157H218L238 177V203H123V185Z" fill="#7665a5" fill-opacity=".65"/><path d="M265 184L273 174L287 177L299 192L315 279H270Z" fill="#c47d58" fill-opacity=".74"/><text x="421" y="79" fill="#384652" font-size="14" font-weight="700">实例分割：每个物体都有自己的掩码</text><rect x="424" y="103" width="16" height="16" rx="3" fill="#7665a5"/><text x="450" y="115" fill="#56636e" font-size="11">汽车实例 #1</text><rect x="424" y="134" width="16" height="16" rx="3" fill="#c47d58"/><text x="450" y="146" fill="#56636e" font-size="11">行人实例 #1</text><text x="424" y="188" fill="#66727c" font-size="11">同一类别的不同个体可以分开计数。</text><text x="424" y="211" fill="#66727c" font-size="11">适合轮廓、面积或重叠关系很重要时。</text>';
        }else{
          svg+='<path d="M30 192H350V277H30Z" fill="#488d76" fill-opacity=".38"/><path d="M130 178L151 157H218L238 177V203H123V185Z" fill="#7665a5" fill-opacity=".7"/><path d="M265 184L273 174L287 177L299 192L315 279H270Z" fill="#c47d58" fill-opacity=".76"/><text x="421" y="79" fill="#384652" font-size="14" font-weight="700">全景分割：物体实例 + 背景区域</text><rect x="424" y="103" width="16" height="16" rx="3" fill="#7665a5"/><text x="450" y="115" fill="#56636e" font-size="11">独立物体：汽车 #1、行人 #1</text><rect x="424" y="134" width="16" height="16" rx="3" fill="#488d76"/><text x="450" y="146" fill="#56636e" font-size="11">背景区域：道路、天空等类别</text><text x="424" y="188" fill="#66727c" font-size="11">用同一场景表示可数物体和不可数区域。</text><text x="424" y="211" fill="#66727c" font-size="11">“全景”表示覆盖整幅场景，不是全景照片。</text>';
        }
      }else{
        svg+='<path d="M276 132L276 147M276 147L264 157M276 147L288 157M276 147L276 168M276 168L265 187M276 168L288 187M264 157L255 168M288 157L298 168" fill="none" stroke="#c85f4c" stroke-width="2.4" stroke-linecap="round"/>';
        [[276,132],[276,147],[264,157],[288,157],[255,168],[298,168],[276,168],[265,187],[288,187]].forEach((point,index)=>{svg+='<circle cx="'+point[0]+'" cy="'+point[1]+'" r="'+(index===0?4:3.5)+'" fill="#f8d77a" stroke="#8c684d" stroke-width="1"/>'});
        svg+='<text x="421" y="79" fill="#384652" font-size="14" font-weight="700">具名坐标点 + 置信 / 可见信息</text><rect x="423" y="101" width="366" height="45" rx="5" fill="#eeeaf5"/><text x="440" y="120" fill="#514477" font-size="11" font-weight="700">左腕 · (x, y) · 可见</text><text x="440" y="136" fill="#66727c" font-size="10">不同点的名称和连接关系有意义</text><rect x="423" y="157" width="366" height="45" rx="5" fill="#eaf2ee"/><text x="440" y="176" fill="#3d7866" font-size="11" font-weight="700">右膝 · (x, y) · 部分遮挡</text><text x="440" y="192" fill="#66727c" font-size="10">点可形成姿态骨架，也可用于其他对象</text>';
      }
    }
    svg+='<text x="30" y="306" fill="#7b858d" font-size="10">标记图解释监督单位 · 不是实测结果</text><text x="819" y="306" text-anchor="end" fill="#7b858d" font-size="10">'+esc(spec.label)+'</text></svg>';
    return svg;
  }
  function architectureMarkup(mode,imageMode){
    const stages=mode==='image'
      ?imageMode==='restore'
        ?['受损输入图像','复原 / 去噪网络','恢复后的图像']
        :['随机噪声 / 条件图','生成器或去噪网络','符合条件的新图']
      :['图像输入','Backbone 特征','Neck / Decoder（按需）','任务专属 Head','任务输出'];
    const architectureLabel=mode==='image'?stages.join(' → '):modes[mode].architecture;
    const caption=mode==='image'
      ?imageMode==='restore'?'复原以受损图像为输入，目标是尽量找回原场景信息。':'生成以噪声或条件为输入，目标是合成符合要求的新图。'
      :'Backbone 提特征；是否需要 Neck / Decoder 由结构决定；Head 对准当前任务输出。';
    return '<div class="cv-task-flow" role="img" aria-label="'+esc(architectureLabel)+'">'+stages.map((stage,index)=>'<span class="cv-task-flow-node'+(index===stages.length-1?' is-output':'')+'">'+stage+'</span>'+(index<stages.length-1?'<span class="cv-task-flow-arrow" aria-hidden="true">→</span>':'')).join('')+'</div><p class="cv-task-flow-caption">'+esc(caption)+'</p>';
  }
  function updateMap(root){
    const mode=root.dataset.cvMode||'classification';
    const segmentation=root.dataset.cvSegmentation||'semantic';
    const imageMode=root.dataset.cvImage||'generate';
    const spec=modes[mode];
    root.querySelectorAll('[data-cv-task-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cvTaskChoice===mode)));
    root.querySelector('[data-cv-seg-controls]').hidden=mode!=='segmentation';
    root.querySelector('[data-cv-image-controls]').hidden=mode!=='image';
    root.querySelectorAll('[data-cv-segmentation]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cvSegmentation===segmentation)));
    root.querySelectorAll('[data-cv-image]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cvImage===imageMode)));
    root.querySelector('[data-cv-task-architecture]').innerHTML=architectureMarkup(mode,imageMode);
    root.querySelector('[data-cv-task-figure]').innerHTML=svgMarkup(mode,segmentation,imageMode);
    root.querySelector('[data-cv-task-readouts]').innerHTML='<div><span>它要回答</span><strong>'+esc(spec.question)+'</strong></div><div><span>标注单位</span><strong>'+esc(spec.annotation)+'</strong></div><div><span>模型主要输出</span><strong>'+esc(spec.output)+'</strong></div><div><span>常见评价</span><strong>'+esc(spec.metric)+'</strong></div>';
    root.querySelector('[data-cv-task-hint]').textContent=mode==='segmentation'?segmentationModes[segmentation].summary+' '+spec.hint:spec.hint;
  }
  function updateScenario(root){
    const index=Number(root.querySelector('[data-cv-scenario]').value)||0;
    const scenario=scenarios[index];
    root.querySelector('[data-cv-scenario-feedback]').textContent=scenario.question;
  }
  const previous=window.lessonPlaygrounds||{};
  window.lessonPlaygrounds={
    render(id,index){
      if(id==='tasks'&&index===firstSection)return playgroundMarkup();
      return previous.render?.(id,index)||'';
    },
    initialize(){
      previous.initialize?.();
      document.querySelectorAll('[data-cv-task-map]').forEach(updateMap);
    }
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button)return;
    const root=button.closest('[data-cv-task-map]');
    if(!root)return;
    if(button.dataset.cvTaskChoice){root.dataset.cvMode=button.dataset.cvTaskChoice;updateMap(root)}
    else if(button.dataset.cvSegmentation){root.dataset.cvSegmentation=button.dataset.cvSegmentation;updateMap(root)}
    else if(button.dataset.cvImage){root.dataset.cvImage=button.dataset.cvImage;updateMap(root)}
    else if(button.hasAttribute('data-cv-task-reset')){
      root.dataset.cvMode='classification';root.dataset.cvSegmentation='semantic';root.dataset.cvImage='generate';updateMap(root);
      root.querySelector('[data-cv-scenario-feedback]').textContent='先读情境，再判断系统需要交付哪种答案。';
    }else if(button.hasAttribute('data-cv-scenario-check')){
      const scenario=scenarios[Number(root.querySelector('[data-cv-scenario]').value)||0];
      root.dataset.cvMode=scenario.mode;
      if(scenario.segmentation)root.dataset.cvSegmentation=scenario.segmentation;
      if(scenario.image)root.dataset.cvImage=scenario.image;
      updateMap(root);
      root.querySelector('[data-cv-scenario-feedback]').textContent='建议：'+modes[scenario.mode].label+'。'+scenario.reason;
    }
  });
  document.addEventListener('change',event=>{
    const select=event.target.closest('[data-cv-scenario]');
    if(select){const root=select.closest('[data-cv-task-map]');if(root)updateScenario(root)}
  });
})();
