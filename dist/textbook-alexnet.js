/* AlexNet: architecture, landmark techniques, and the limits of the 2012 story. */
(()=>{
  const lesson=lessons.find(item=>item.id==='cnn');
  if(!lesson)return;

  lesson.goals.push(
    '沿着 AlexNet 的五个卷积层与三个全连接层，说明图像怎样变成 1000 类预测。',
    '用 ReLU、重叠最大池化、Dropout、双 GPU 和数据增强解释它如何扩大 CNN 的训练规模。',
    '正确阅读 ImageNet Top-5 错误率，并分清历史里程碑、已有方法与现代实现变体。'
  );
  lesson.sections.push({title:'15. AlexNet：让深度 CNN 走向规模化',paragraphs:[
    '2012 年，AlexNet 在 ImageNet 大规模视觉识别挑战赛中取得显著领先，成为深度学习发展史上的重要转折点。它不是深度学习或卷积网络的起点，而是把更深的 CNN、GPU 训练、较大数据集与一组成熟技巧组合起来，证明这条路线能在大规模图像分类中取得强劲效果。',
    '经典 AlexNet 有 5 个卷积层和 3 个全连接层，最后输出 1000 个类别分数。沿着结构看：卷积层逐层抽取视觉特征；池化压缩空间网格；两个 4096 单元的全连接隐藏层整合特征；最后一层给出 1000 类 logits，再经 Softmax 可解释成概率。点选下方结构节点，查看每一步。',
    'AlexNet 的代表性组合包括 ReLU 激活、3×3 且步幅为 2 的重叠最大池化、全连接隐藏层上的 Dropout、数据增强，以及把计算拆到两张 GTX 580 GPU 上。ReLU 和 Dropout 等想法早已出现；AlexNet 的历史贡献在于把它们与更深的网络和 ImageNet 规模训练有效结合。原论文还使用了局部响应归一化（LRN），虽然今天常见总结有时会略过它。',
    '比赛成绩要看指标口径：Top-5 错误率表示正确类别没有出现在模型分数最高的五个类别里。论文报告，未使用额外数据的五模型集成错误率为 16.4%；加入额外 ImageNet 2011 预训练数据的最佳集成为 15.3%，第二名约为 26.2%。因此 15.3% 和 26.2% 是不同参赛系统的 Top-5 成绩，不是 AlexNet 使用增强前后的对比。',
    '原始论文约有 6000 万个参数，其中大量参数集中在全连接层。常见 PyTorch 教学实现仍保留 AlexNet 的大体骨架，但通道数、填充、分类器细节与 2012 原版并不完全相同；复现时要注明采用哪一种实现。下方可以比较全连接参数规模、查看技巧如何工作，并用小测验检查理解。'
  ]});
  lesson.keypoints.push(
    '经典 AlexNet 由 5 个卷积层、3 个全连接层组成，最后对 ImageNet 的 1000 个类别输出分数；论文模型约 6000 万参数。',
    'ReLU 缓解 sigmoid/tanh 在饱和区梯度变小的问题，但负半轴梯度为零，不能说它彻底解决了梯度问题。',
    '重叠最大池化使用 3×3 窗口、步幅 2；窗口会重叠，但这并不意味着最大池化在所有网络中取代平均池化。',
    'Dropout 在训练时随机屏蔽全连接隐藏单元，推理时关闭随机屏蔽并使用相应缩放；原论文在前两个全连接隐藏层使用它。',
    '双 GPU 是当时受显存限制采用的工程方案；随机裁剪、翻转与颜色扰动扩充训练视角，但前提是变换仍保留正确标签。',
    'Top-5 错误率 15.3% 是使用额外预训练数据的五模型集成结果；仅用比赛提供训练数据的五模型集成结果为 16.4%。'
  );
  const sources=[
    {url:'https://courses.csail.mit.edu/6.803/pdf/2012%20hinton.pdf',label:'Krizhevsky、Sutskever、Hinton：ImageNet Classification with Deep Convolutional Neural Networks（NeurIPS 2012 原论文）'},
    {url:'https://www.image-net.org/challenges/LSVRC/2012/results.html',label:'ImageNet：ILSVRC 2012 官方结果'},
    {url:'https://icml.cc/2010/papers/432.pdf',label:'Nair 与 Hinton：Rectified Linear Units Improve Restricted Boltzmann Machines（ICML 2010）'},
    {url:'https://jmlr.org/papers/v15/srivastava14a.html',label:'Srivastava 等：Dropout: A Simple Way to Prevent Neural Networks from Overfitting（JMLR 2014）'},
    {url:'https://github.com/pytorch/vision/blob/main/torchvision/models/alexnet.py',label:'Torchvision：AlexNet 参考实现（常见现代实现示例）'}
  ];
  lesson.sources=[...(lesson.sources||[]),...sources.filter(source=>!(lesson.sources||[]).some(existing=>existing.url===source.url))];

  const ideas=[
    {id:'relu',label:'ReLU',title:'让正向信号更直接地通过',copy:'ReLU(x)=max(0,x)。正半轴保留输入，负半轴置零；相比饱和的 sigmoid/tanh，它在正区间不容易出现越来越小的梯度。它仍可能有“死 ReLU”等问题。'},
    {id:'pool',label:'重叠池化',title:'窗口每次移动两格，覆盖范围更密',copy:'3×3 最大池化窗口以步幅 2 移动，相邻窗口会共享一行或一列。每个窗口只留下最大激活，空间尺寸会缩小；池化类型要按任务选择。'},
    {id:'dropout',label:'Dropout',title:'训练时随机让一部分神经元暂时休息',copy:'训练时随机屏蔽全连接隐藏单元，减少网络对某些单元组合的依赖。推理时不再随机丢弃，并使用训练时约定的缩放方式。它是正则化方法，不是永久删除节点。'},
    {id:'gpu',label:'双 GPU',title:'把特征通道切开并行计算',copy:'当时单张 GPU 显存有限，原论文将通道与计算分布在两张 GTX 580 GPU 上。部分卷积层跨设备通信，布局是工程取舍；今天硬件与软件不同，不代表两张 GPU 永远更快。'},
    {id:'augment',label:'数据增强',title:'从已有图片生成标签仍成立的训练视角',copy:'随机裁剪、水平翻转与颜色扰动增加训练输入的变化。增强能缓解过拟合，但变换必须对当前任务保持标签语义；例如方向具有类别含义时，翻转未必合理。'}
  ];
  const quiz=[
    {q:'2012 年的 AlexNet 是深度学习和 CNN 的起点。',a:'false',why:'不正确。更早已有深度学习与卷积网络研究；2012 年是大规模视觉识别中的重要里程碑。'},
    {q:'训练阶段，AlexNet 在前两个全连接隐藏层使用 Dropout。',a:'true',why:'正确。原论文把 Dropout 用在前两个全连接隐藏层；推理阶段会关闭随机屏蔽。'},
    {q:'ReLU 让所有输入区间的梯度都保持非零。',a:'false',why:'不正确。ReLU 的负半轴输出与梯度都为 0；它缓解部分饱和问题，但不能消除所有优化困难。'},
    {q:'15.3% 与 26.2% 是 AlexNet 增强前后的错误率。',a:'false',why:'不正确。它们对应不同参赛系统的 Top-5 错误率；论文另报告未使用额外数据的 AlexNet 五模型集成为 16.4%。'},
    {q:'只要做数据增强，所有图像任务都可以水平翻转。',a:'false',why:'不正确。只有标签在该变换下仍然成立时，增强才可靠；文字识别、左右方向类别等任务需谨慎。'}
  ];
  const previous=window.lessonPlaygrounds||{};
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  // Each entry is one actual forward operation. Shapes and parameter counts share this source.
  const flowLayers=[
    {name:'输入',path:'input',type:'input'},
    {name:'Conv1',path:'features.0',type:'conv',cin:3,cout:64,k:11,s:4,p:2},
    {name:'ReLU1',path:'features.1',type:'relu'},
    {name:'MaxPool1',path:'features.2',type:'pool',k:3,s:2,p:0},
    {name:'Conv2',path:'features.3',type:'conv',cin:64,cout:192,k:5,s:1,p:2},
    {name:'ReLU2',path:'features.4',type:'relu'},
    {name:'MaxPool2',path:'features.5',type:'pool',k:3,s:2,p:0},
    {name:'Conv3',path:'features.6',type:'conv',cin:192,cout:384,k:3,s:1,p:1},
    {name:'ReLU3',path:'features.7',type:'relu'},
    {name:'Conv4',path:'features.8',type:'conv',cin:384,cout:256,k:3,s:1,p:1},
    {name:'ReLU4',path:'features.9',type:'relu'},
    {name:'Conv5',path:'features.10',type:'conv',cin:256,cout:256,k:3,s:1,p:1},
    {name:'ReLU5',path:'features.11',type:'relu'},
    {name:'MaxPool3',path:'features.12',type:'pool',k:3,s:2,p:0},
    {name:'自适应平均池化',path:'avgpool',type:'adaptive'},
    {name:'展平',path:'flatten',type:'flatten'},
    {name:'Dropout1',path:'classifier.0',type:'dropout'},
    {name:'FC1',path:'classifier.1',type:'linear',cin:9216,cout:4096},
    {name:'ReLU6',path:'classifier.2',type:'relu'},
    {name:'Dropout2',path:'classifier.3',type:'dropout'},
    {name:'FC2',path:'classifier.4',type:'linear',cin:4096,cout:4096},
    {name:'ReLU7',path:'classifier.5',type:'relu'},
    {name:'FC3 · logits',path:'classifier.6',type:'linear',cin:4096,cout:1000},
    {name:'可选 Softmax',path:'softmax (optional)',type:'softmax'}
  ];
  const shapeText=shape=>'['+shape.join(', ')+']';
  const count=shape=>shape.slice(1).reduce((a,b)=>a*b,1);
  function layerTrace(batch=1,size=224){
    if(![1,2,4].includes(batch)||![224,256].includes(size))throw new RangeError('请选择演示提供的批次和输入尺寸');
    let shape=[batch,3,size,size];
    return flowLayers.map(layer=>{
      const input=[...shape];let weight=[],params=0;
      if(layer.type==='conv'||layer.type==='pool'){
        shape=[batch,layer.cout||shape[1],...shape.slice(2).map(d=>Math.floor((d+2*layer.p-layer.k)/layer.s)+1)];
        if(layer.type==='conv'){weight=[layer.cout,layer.cin,layer.k,layer.k];params=weight.reduce((a,b)=>a*b,1)+layer.cout;}
      }else if(layer.type==='adaptive')shape=[batch,shape[1],6,6];
      else if(layer.type==='flatten')shape=[batch,count(shape)];
      else if(layer.type==='linear'){shape=[batch,layer.cout];weight=[layer.cout,layer.cin];params=layer.cin*layer.cout+layer.cout;}
      return {...layer,input,output:[...shape],weight,params};
    });
  }
  function layerConfig(r){
    if(r.type==='conv'||r.type==='pool')return 'K='+r.k+'，S='+r.s+'，P='+r.p+(r.type==='conv'?'；'+r.cin+'→'+r.cout+'通道':'；逐通道取最大值');
    return {input:'NCHW 浮点张量',relu:'逐元素 max(0,x)',adaptive:'指定输出为6×6',flatten:'torch.flatten(x,1)',dropout:'p=0.5；训练随机、评估恒等',linear:r.cin+'→'+r.cout+'个数',softmax:'dim=1；模型外按需使用'}[r.type];
  }
  function layerExplanation(r){
    const h=r.input[2],out=r.output[2];
    if(r.type==='input')return {calculation:'每张图 '+r.input[1]+'×'+h+'×'+h+'='+count(r.input).toLocaleString('en-US')+' 个数。',meaning:'第0轴是批次N，第1轴是通道C，后两轴是高H和宽W。一张RGB图有红、绿、蓝三张数值表。这里假设预处理已完成；改变N只是一次并排处理更多图片，不把图片叠成更多颜色通道。'};
    if(r.type==='conv')return {calculation:'高、宽各算一次：floor(('+h+' + 2×'+r.p+' − '+r.k+') / '+r.s+') + 1 = '+out+'。',meaning:'一个输出位置会读取全部'+r.cin+'个输入通道上的'+r.k+'×'+r.k+'窗口，完成'+(r.cin*r.k*r.k).toLocaleString('en-US')+'项乘加，再加一个偏置，得到一个数。用同一组权重遍历位置，得到一张输出特征图；'+r.cout+'组不同权重得到'+r.cout+'个输出通道。高宽由窗口移动决定；输出通道数由这层的配置决定，两者分别计算。'+(r.name==='Conv4'?'这一层把384通道组合成256通道，虽然高宽没变，数值和通道数都变了。':r.name==='Conv5'?'256→256只表示输入输出通道数相同；仍会用新权重重新计算所有响应，不是原样传递。':r.name==='Conv2'?'这里每个输出通道读取全部64个输入通道；主线没有原论文的分组连接。':'')};
    if(r.type==='pool')return {calculation:'高、宽：floor(('+h+' − 3) / 2) + 1 = '+out+'；通道仍为'+r.input[1]+'。',meaning:'最大池化在每张特征图上单独移动3×3窗口，每次移动2格，取窗口内最大的一个数。相邻窗口重叠1格；它不把不同通道混在一起，也没有可训练权重。这里使用默认向下取整，最后放不下完整窗口的位置不再生成输出。'};
    if(r.type==='relu')return {calculation:'例如 [-2, 0, 3] → [0, 0, 3]；'+shapeText(r.input)+' → '+shapeText(r.output)+'。',meaning:'修正线性单元（Rectified Linear Unit，ReLU）逐个数处理：负数变0，非负数保留。每个位置还在，因此形状不变；但数值变了。把它放在可训练层之间，才能使多层组合表达非线性关系。这里不新增参数；inplace=True只影响存储复用，不改变本页的尺寸计算。'};
    if(r.type==='adaptive')return {calculation:h+'×'+h+' → 6×6；每张图仍有256个通道。',meaning:h===6?'当前输入已经是6×6；输出的每个区域只有一个位置，因此数值也保持不变。这个步骤仍需列出，因为分类器固定接收256×6×6。把上方输入改为256后，最后最大池化会得到7×7，此处才会把它平均汇总成6×6。':'自适应平均池化（Adaptive Average Pooling）根据目标6×6划分求平均的区域。例如7→6时，第一行区域取原图行索引0、1；第一列区域取列索引0、1，第一个输出就是这2×2四个数的平均。相邻区域可以重叠。这不是裁掉最后一行或把图像像素插值缩放。'};
    if(r.type==='flatten')return {calculation:'每张图 256×6×6 = 9216；'+shapeText(r.input)+' → '+shapeText(r.output)+'。',meaning:'展平将每张图的256张6×6特征表按顺序排成一行，不做加法、不丢掉数值。以0开始编号：原位置[c,行r,列w]对应这一行的c×36+r×6+w；例如[1,0,0]对应第36号位置。flatten(x,1)从第1轴开始合并，第0轴批次N保留；两张图得到两行9216个数，不能合并成一行18432。'};
    if(r.type==='dropout')return {calculation:'训练示例 [2, 4, 6, 8] → [4, 0, 12, 0]；评估时 → [2, 4, 6, 8]。',meaning:'随机失活（Dropout）在训练时以0.5的概率分别把输入位置置零；保留的数除以1−0.5，即乘2。上面只举一个可能的掩码。无论多少数变成0，位置都还在，形状不变。model.eval()时此层原样传递，不再随机、不再乘2。它没有参数，不会把9216缩成4608；此处按照Torchvision源码先Dropout再进入对应的线性层。'};
    if(r.type==='linear')return {calculation:'每张图 '+r.cin+' → '+r.cout+'；权重 '+shapeText(r.weight)+'，偏置 ['+r.cout+']。',meaning:'全连接层（Fully Connected，FC；PyTorch中是Linear）把这一行的全部'+r.cin+'个输入分别乘权重后相加，再加偏置，得到一个输出；'+r.cout+'组权重得到'+r.cout+'个输出。批次中的每张图使用同一组参数。数学上对应 X @ Wᵀ + b；W按[输出长度,输入长度]存储。'+(r.cout===1000?'这1000个输出是对应1000个类别的原始分数logits，可以为负，总和不要求为1。后面没有ReLU；训练时直接交给交叉熵。':'每个输出组合来自不同通道与位置的特征。随后仍需ReLU；线性层本身不包含这个激活操作。')};
    return {calculation:'对每张图分别计算 pₖ = exp(zₖ−m) / Σⱼ exp(zⱼ−m)，m为该图的最大logit。',meaning:'Softmax将一行1000个分数变成非负、总和为1的数，长度不变。它放在模型外按需计算；Torchvision AlexNet的forward停在上一行logits。训练用CrossEntropyLoss接收原始logits，不先手工Softmax。随机初始化模型的输出只用于核对形状，没有可靠的识别含义。'};
  }
  function shapeDiagram(r){
    const glyph=(x,shape,color)=>{const spatial=shape.length===4;return '<g stroke="'+color+'" fill="'+color+'" fill-opacity=".10">'+(spatial?'<rect x="'+(x+18)+'" y="24" width="86" height="66" rx="4"/><rect x="'+(x+10)+'" y="32" width="86" height="66" rx="4"/><rect x="'+(x+2)+'" y="40" width="86" height="66" rx="4"/>':'<rect x="'+x+'" y="41" width="112" height="48" rx="4"/>')+'</g><text x="'+(x+55)+'" y="125" text-anchor="middle">'+shapeText(shape)+'</text>';};
    return '<svg class="ax-flow-svg" viewBox="0 0 580 165" role="img" aria-label="'+esc(r.name)+'：输入'+shapeText(r.input)+'，输出'+shapeText(r.output)+'">'+glyph(26,r.input,'#597fa8')+'<path d="M158 68H215M365 68H422" stroke="#9586b4" stroke-width="2"/><path d="m209 63 7 5-7 5m207-10 7 5-7 5" fill="none" stroke="#9586b4" stroke-width="2"/><rect x="220" y="35" width="140" height="66" rx="5" fill="#f0eaf8" stroke="#9684b5"/><text x="290" y="64" text-anchor="middle">'+esc(r.name)+'</text><text x="290" y="84" text-anchor="middle" class="ax-flow-svg-small">'+(r.params?'有可训练参数':'无可训练参数')+'</text>'+glyph(440,r.output,'#538a73')+'<text x="80" y="151" text-anchor="middle">输入</text><text x="495" y="151" text-anchor="middle">输出</text></svg>';
  }
  function channelSumExample(){
    return '<figure class="ax-channel-example"><figcaption>算一个输出值：3个输入通道先合成1个数</figcaption><div class="ax-channel-parts"><div><b>R窗口</b><span>11×11个数，全为1</span><strong>121×1 = 121</strong></div><div><b>G窗口</b><span>11×11个数，全为2</span><strong>121×2 = 242</strong></div><div><b>B窗口</b><span>11×11个数，全为3</span><strong>121×3 = 363</strong></div></div><p>三个通道一起汇总：121 + 242 + 363 + 偏置1 = <strong>727</strong> → ReLU后仍为727。</p><small>为看清乘加，这里特意选一个不含补边的内部窗口，全部363个权重设为1、偏置设为1。这是手算数据，不是训练好的AlexNet特征。换另一组权重会得到另一个输出通道的响应；64组权重分别计算出64张表。</small></figure>';
  }
  function flowDetail(r,index){
    const e=layerExplanation(r),n=count(r.output),formula=r.type==='conv'||r.type==='pool'?'\\[H_{\\mathrm{out}}=\\left\\lfloor\\frac{H+2P-K}{S}\\right\\rfloor+1\\]':'';
    return '<span class="ax-flow-kicker">'+(index===23?'模型外的可选步骤':index===0?'网络入口':'网络操作 '+index+' / 22')+' · '+esc(r.path)+'</span><h4>'+esc(r.name)+'：'+esc(layerConfig(r))+'</h4>'+shapeDiagram(r)+'<p class="ax-flow-calc">'+esc(e.calculation)+'</p>'+formula+'<p>'+esc(e.meaning)+'</p>'+(r.name==='Conv1'?channelSumExample():'')+'<dl class="ax-flow-facts"><div><dt>每张图输出多少个数</dt><dd>'+n.toLocaleString('en-US')+'</dd></div><div><dt>整个批次的输出元素数</dt><dd>'+((r.output[0]||1)*n).toLocaleString('en-US')+'</dd></div><div><dt>这一层的参数数</dt><dd>'+r.params.toLocaleString('en-US')+'</dd></div></dl>'+(r.params?'<p class="ax-flow-note">权重形状 '+shapeText(r.weight)+'；含偏置参数数 = '+(r.type==='conv'?r.cout+'×'+r.cin+'×'+r.k+'×'+r.k+' + '+r.cout:r.cin+'×'+r.cout+' + '+r.cout)+' = '+r.params.toLocaleString('en-US')+'。参数在所有图片和空间位置复用，不随批次大小增加。</p>':'')+'<p class="ax-flow-note">框图只区分空间特征表与一行向量，叠片数量与图框大小不按比例；以标注的完整shape为准。</p>';
  }
  function traceCode(batch,size){return `import torch
import torchvision
from torchvision.models import alexnet

print("versions:", torch.__version__, torchvision.__version__)
torch.manual_seed(0)
model = alexnet(weights=None).eval()  # 不下载权重；这里只核对数据流
image_batch = torch.zeros(${batch}, 3, ${size}, ${size})

def report(name, before, after, parameters=0):
    print(f"{name:14s} {str(before):20s} -> {str(tuple(after.shape)):20s} params={parameters}")

with torch.no_grad():  # 关闭梯度记录；eval()另负责关闭Dropout的随机行为
    x = image_batch
    report("input", tuple(x.shape), x)
    for i, layer in enumerate(model.features):
        before = tuple(x.shape)
        x = layer(x)
        report(f"features.{i}", before, x,
               sum(p.numel() for p in layer.parameters()))
    before = tuple(x.shape)
    x = model.avgpool(x)
    report("avgpool", before, x)
    before = tuple(x.shape)
    x = torch.flatten(x, 1)  # 保留第0轴N，把C、H、W排成每张图的一行
    report("flatten", before, x)
    for i, layer in enumerate(model.classifier):
        before = tuple(x.shape)
        x = layer(x)
        report(f"classifier.{i}", before, x,
               sum(p.numel() for p in layer.parameters()))
    logits = x
    assert torch.allclose(logits, model(image_batch))
    probabilities = logits.softmax(dim=1)  # 可选：不属于model.forward
    report("softmax (optional)", tuple(logits.shape), probabilities)
    print("probability sums:", probabilities.sum(dim=1))

print("total parameters:", sum(p.numel() for p in model.parameters()))
# 61100840；训练时：loss = torch.nn.functional.cross_entropy(logits, labels)
# 上面的no_grad示例只演示前向；真正训练需model.train()并允许记录梯度。
`;}
  function flowTable(trace){return '<div class="ax-flow-table-wrap" tabindex="0" aria-label="可横向滚动的AlexNet完整数据流表"><table class="ax-flow-table"><caption>每一步的输出，原样成为下一步的输入</caption><thead><tr><th scope="col">操作 / 代码位置</th><th scope="col">输入 → 输出</th><th scope="col">设置 / 含偏置参数数</th></tr></thead><tbody>'+trace.map(r=>'<tr><th scope="row">'+esc(r.name)+'<small>'+esc(r.path)+'</small></th><td><code>'+shapeText(r.input)+'</code><span class="ax-flow-arrow">↓</span><code>'+shapeText(r.output)+'</code></td><td>'+esc(layerConfig(r))+'<small>'+r.params.toLocaleString('en-US')+' 个参数</small></td></tr>').join('')+'</tbody></table></div>';}
  function architectureMarkup(){
    const trace=layerTrace();
    return '<div class="ax-architecture" data-ax-flow><p><strong>主线版本：Torchvision AlexNet。</strong>输入采用NCHW顺序，卷积groups=1、dilation=1；固定分类为1000类。批次N表示同时处理多少张图，不参与单张图的通道乘加。</p><div class="ax-flow-controls"><label>批次大小N<select data-ax-batch aria-label="AlexNet批次大小"><option value="1">1张图</option><option value="2">2张图</option><option value="4">4张图</option></select></label><label>每张图的高与宽<select data-ax-size aria-label="AlexNet输入高宽"><option value="224">224×224 · 主线</option><option value="256">256×256 · 观察自适应池化</option></select></label><button type="button" data-ax-flow-reset>恢复224主线</button></div><p class="ax-flow-note">256是形状对照实验，不表示可以随意更换预训练模型要求的预处理。本演示计算形状与参数数，不执行浏览器内的图像识别。</p><div class="ax-flow-nav"><button type="button" data-ax-prev aria-label="上一个AlexNet操作">← 上一步</button><label>逐层走读<select data-ax-layer aria-label="选择AlexNet操作">'+trace.map((r,i)=>'<option value="'+i+'"'+(i===1?' selected':'')+'>'+String(i).padStart(2,'0')+' · '+esc(r.name)+' · '+esc(r.path)+'</option>').join('')+'</select></label><button type="button" data-ax-next aria-label="下一个AlexNet操作">下一步 →</button></div><div class="ax-flow-detail" data-ax-flow-detail aria-live="polite">'+flowDetail(trace[1],1)+'</div><details class="ax-flow-reference"><summary>展开完整数据流表：包含所有ReLU、池化、展平与Dropout</summary><div data-ax-flow-table>'+flowTable(trace)+'</div></details><details class="ax-flow-reference"><summary>运行PyTorch代码：逐层打印输入、输出与参数数</summary><div class="code-block"><div class="code-head"><span>CPU即可运行 · 需要torch与torchvision</span><button type="button" class="copy" data-copy-fragment="ax-trace-code">复制代码</button></div><pre><code id="ax-trace-code">'+esc(traceCode(1,224))+'</code></pre></div><p class="ax-flow-note">代码随N和高宽选项更新。权重随机初始化，输出没有识别意义；最后的概率求和应接近每张图1，实际随机分数与版本和环境有关。</p></details><p class="ax-flow-note">回到尺寸计算可看<a href="#lesson/cnn-shapes">卷积输出尺寸</a>；不理解展平可看<a href="#lesson/tensor-layout">张量重排</a>；logits与概率的区别见<a href="#lesson/loss-probabilities">分类分数与概率</a>。</p></div>';
  }
  window.visionlabAlexnetFlow={trace:layerTrace,code:traceCode};
  function ideasMarkup(){
    const tabs=ideas.map((idea,index)=>'<button type="button" data-ax-idea="'+idea.id+'" aria-pressed="'+String(index===0)+'">'+esc(idea.label)+'</button>').join('');
    const panels=ideas.map(idea=>'<section class="ax-idea-panel" data-ax-idea-panel="'+idea.id+'" '+(idea.id==='relu'?'':'hidden')+'><div class="ax-idea-copy"><span>关键技巧 · '+esc(idea.label)+'</span><h4>'+esc(idea.title)+'</h4><p>'+esc(idea.copy)+'</p></div>'+ideaDemo(idea.id)+'</section>').join('');
    return '<div class="ax-ideas"><div class="ax-idea-tabs" role="group" aria-label="选择一种 AlexNet 训练技巧">'+tabs+'</div>'+panels+'</div>';
  }
  function ideaDemo(id){
    if(id==='relu')return '<div class="ax-demo ax-relu-demo"><label for="ax-relu-input">输入 x <output data-ax-relu-value>1</output></label><input id="ax-relu-input" type="range" min="-4" max="4" step="0.5" value="1" data-ax-relu-input><svg viewBox="0 0 300 132" role="img" aria-label="ReLU 与 sigmoid 激活曲线"><path class="ax-axis" d="M20 110H284M20 110V12"/><path class="ax-sigmoid" d="M20 104C57 102 77 95 105 78S143 48 170 32 218 16 284 14"/><path class="ax-relu" d="M20 110H150L278 18"/><path class="ax-probe" data-ax-probe d="M183 12V110"/><circle class="ax-probe-dot" data-ax-probe-dot cx="183" cy="44" r="4"/><text x="282" y="126">x</text><text x="5" y="16">输出</text><text x="219" y="45">ReLU</text><text x="222" y="25">sigmoid</text></svg><p class="ax-demo-readout" data-ax-relu-readout aria-live="polite">ReLU(1) = 1；正区间梯度为 1。</p></div>';
    if(id==='pool')return '<div class="ax-demo ax-pool-demo"><div class="ax-control-line"><label for="ax-pool-position">移动 3×3 窗口</label><select id="ax-pool-position" data-ax-pool-position><option value="0">左上</option><option value="1">右上</option><option value="2">左下</option><option value="3">右下</option></select></div><div class="ax-pool-grid" data-ax-pool-grid aria-label="5乘5特征图和当前池化窗口"></div><p class="ax-demo-readout" data-ax-pool-readout aria-live="polite"></p></div>';
    if(id==='dropout')return '<div class="ax-demo ax-dropout-demo"><label for="ax-drop-rate">训练时丢弃比例 <output data-ax-drop-rate-out>50%</output></label><input id="ax-drop-rate" type="range" min="0" max="75" step="25" value="50" data-ax-drop-rate><div class="ax-node-map" data-ax-node-map aria-label="训练时随机屏蔽的示意神经元"></div><p class="ax-demo-readout" data-ax-drop-readout aria-live="polite"></p><small>固定示意掩码用于说明原理；真实 Dropout 会在训练步骤中随机采样。</small></div>';
    if(id==='gpu')return '<div class="ax-demo ax-gpu-demo"><div class="ax-gpu-switch" role="group" aria-label="切换特征通道的 GPU 分配"><button type="button" data-ax-gpu="2" aria-pressed="true">论文中的双 GPU</button><button type="button" data-ax-gpu="1" aria-pressed="false">单 GPU 示意</button></div><div class="ax-gpu-board" data-ax-gpu-board></div><p class="ax-demo-readout" data-ax-gpu-readout aria-live="polite"></p></div>';
    return '<div class="ax-demo ax-augment-demo" data-ax-augment-view="crop"><div class="ax-augment-controls" role="group" aria-label="选择图像增强方式"><button type="button" data-ax-augment="crop" aria-pressed="true">随机裁剪</button><button type="button" data-ax-augment="flip" aria-pressed="false">水平翻转</button><button type="button" data-ax-augment="color" aria-pressed="false">颜色扰动</button></div><div class="ax-scene-frame"><svg viewBox="0 0 180 100" role="img" aria-label="天空、道路和汽车组成的简化街景"><rect width="180" height="100" fill="#eaf1ed"/><circle cx="145" cy="19" r="10" fill="#e8cb88"/><path d="M0 61 50 35l41 26 31-21 58 24v36H0Z" fill="#c9d8d0"/><path d="M0 74h180v26H0Z" fill="#64747a"/><path d="M15 86h32m22 0h32m22 0h32" stroke="#f4e5b0" stroke-width="3" stroke-dasharray="15 9"/><g class="ax-car"><path d="M48 69h63l9 13H41Z" fill="#8b78b4"/><path d="m59 69 10-11h28l10 11Z" fill="#9c8cbc"/><circle cx="58" cy="83" r="6" fill="#354353"/><circle cx="103" cy="83" r="6" fill="#354353"/><rect x="72" y="61" width="17" height="7" rx="2" fill="#e8f0ee"/></g></svg></div><p class="ax-demo-readout" data-ax-augment-readout aria-live="polite">随机裁出不同区域，让同一辆车出现在画面不同位置；类别标签仍是“汽车”。</p></div>';
  }
  function playgroundMarkup(){
    const quizCards=quiz.map((item,index)=>'<article class="ax-quiz-card" data-ax-quiz-card="'+index+'"><h4>'+esc(item.q)+'</h4><div role="group" aria-label="判断第 '+(index+1)+' 题"><button type="button" data-ax-answer="true">正确</button><button type="button" data-ax-answer="false">不正确</button></div><p data-ax-feedback aria-live="polite"></p></article>').join('');
    return '<section class="lesson-playground alexnet-playground" data-alexnet data-ax-active-stage="1" data-ax-idea-active="relu" data-ax-gpu-layout="2" data-ax-aug-active="crop" aria-labelledby="ax-title">'+
      '<header class="ax-heading"><span>逐层走读 · 输入、计算、输出</span><h3 id="ax-title">把 AlexNet 的每一步摊开看</h3><p>先选一个操作，看它接收什么、怎样计算、输出什么；再用下一步跟着张量走。即使形状不变的操作，也完整列出。</p></header>'+
      '<section class="ax-panel"><div class="ax-subhead"><div><span>01 · TENSOR FLOW</span><h4>5个卷积层 + 3个全连接层，实际前向共22个操作</h4></div><p>8层只数有可训练参数的层；不包含每个ReLU、池化等操作。</p></div>'+architectureMarkup()+'</section><details class="ax-flow-reference"><summary>选读：原论文的训练技巧、比赛口径与参数比较</summary>'+
      '<section class="ax-panel"><div class="ax-subhead"><div><span>02 · TRAINING IDEAS</span><h4>五种关键设计，五个小实验</h4></div><p>点选一种方法，直接观察它改变了什么。</p></div>'+ideasMarkup()+'</section>'+
      '<section class="ax-panel ax-results"><div class="ax-subhead"><div><span>03 · IMAGE NET 2012</span><h4>读懂比赛数字：Top-5 错误率</h4></div><p>数值越低，表示正确类别越常出现在前五名。</p></div><div class="ax-result-switch" role="group" aria-label="选择 AlexNet 的数据口径"><button type="button" data-ax-result="external" aria-pressed="true">使用额外预训练数据</button><button type="button" data-ax-result="provided" aria-pressed="false">仅用比赛训练数据</button></div><div class="ax-bars" data-ax-bars></div><p class="ax-result-note" data-ax-result-note aria-live="polite"></p></section>'+
      '<section class="ax-panel ax-parameters"><div class="ax-subhead"><div><span>04 · PARAMETER SCALE</span><h4>为什么全连接层这么“重”？</h4></div><p>点选全连接层，比较权重数量。</p></div><div class="ax-parameter-tabs" role="group" aria-label="选择一个全连接层"><button type="button" data-ax-param="fc1" aria-pressed="true">FC1</button><button type="button" data-ax-param="fc2" aria-pressed="false">FC2</button><button type="button" data-ax-param="fc3" aria-pressed="false">FC3</button></div><div class="ax-param-visual"><div class="ax-param-stack" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div><div><span data-ax-param-label>FC1 · 9,216 → 4,096</span><strong data-ax-param-value></strong><div class="ax-param-bar"><i data-ax-param-bar></i></div><p data-ax-param-copy></p></div></div><p class="ax-caption">数量按经典论文结构的权重与偏置计算；由于分组连接、实现细节与统计口径差异，总参数常概括为约 6000 万。</p></section>'+
      '<section class="ax-panel ax-quiz"><div class="ax-subhead"><div><span>05 · CHECK YOUR MODEL</span><h4>判断五句话</h4></div><p>选择后查看解释。</p></div><div class="ax-quiz-grid">'+quizCards+'</div></section></details></section>';
  }
  function updateStage(root){
    const index=Math.max(0,Math.min(23,Number(root.dataset.axActiveStage)||0));
    root.dataset.axActiveStage=String(index);
    const trace=layerTrace(Number(root.querySelector('[data-ax-batch]').value),Number(root.querySelector('[data-ax-size]').value));
    root.querySelector('[data-ax-layer]').value=String(index);
    const detail=root.querySelector('[data-ax-flow-detail]');detail.innerHTML=flowDetail(trace[index],index);
    root.querySelector('[data-ax-prev]').disabled=index===0;root.querySelector('[data-ax-next]').disabled=index===23;
    window.renderLessonMath?.(detail);
  }
  function updateFlow(root){
    const batch=Number(root.querySelector('[data-ax-batch]').value),size=Number(root.querySelector('[data-ax-size]').value);
    root.querySelector('[data-ax-flow-table]').innerHTML=flowTable(layerTrace(batch,size));
    root.querySelector('#ax-trace-code').textContent=traceCode(batch,size);updateStage(root);
  }
  const poolValues=[[1,3,2,0,4],[4,6,5,1,2],[2,8,7,3,5],[0,4,2,9,1],[3,1,6,2,0]];
  function updatePool(root){
    const position=Number(root.querySelector('[data-ax-pool-position]').value),x=(position%2)*2,y=Math.floor(position/2)*2,values=[];
    let maximum=-Infinity;
    for(let row=y;row<y+3;row++)for(let col=x;col<x+3;col++){values.push(poolValues[row][col]);maximum=Math.max(maximum,poolValues[row][col])}
    root.querySelector('[data-ax-pool-grid]').innerHTML=poolValues.flatMap((line,row)=>line.map((value,col)=>'<span class="'+(row>=y&&row<y+3&&col>=x&&col<x+3?'is-window ':'')+(value===maximum&&row>=y&&row<y+3&&col>=x&&col<x+3?'is-max':'')+'">'+value+'</span>')).join('');
    root.querySelector('[data-ax-pool-readout]').textContent='当前 3×3 窗口的最大值是 '+maximum+'。这里用5×5输入、步幅2，四个窗口起点为(0,0)、(0,2)、(2,0)、(2,2)，相邻窗口共享1行或1列，输出为2×2。';
  }
  function updateDropout(root){
    const rate=Number(root.querySelector('[data-ax-drop-rate]').value),count=24,dropped=Math.round(count*rate/100),mask=[2,5,7,11,14,18,21,23,0,9,16,20,4,13,19,6,22,10];
    root.querySelector('[data-ax-drop-rate-out]').textContent=rate+'%';
    root.querySelector('[data-ax-node-map]').innerHTML=Array.from({length:count},(_,i)=>'<i class="'+(mask.slice(0,dropped).includes(i)?'is-dropped':'')+'" aria-hidden="true"></i>').join('');
    root.querySelector('[data-ax-drop-readout]').textContent='本轮示意屏蔽 '+dropped+' / '+count+' 个单元；它们只在训练的这次前向计算中暂时置零。';
  }
  function updateGpu(root){
    const dual=root.dataset.axGpuLayout==='2',count=16;
    root.querySelectorAll('[data-ax-gpu]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axGpu===root.dataset.axGpuLayout)));
    root.querySelector('[data-ax-gpu-board]').innerHTML=(dual?'<div><b>GPU 1</b><small>部分特征通道</small></div><div><b>GPU 2</b><small>部分特征通道</small></div>':'<div><b>GPU 1</b><small>全部示意通道</small></div>')+'<div class="ax-channel-map">'+Array.from({length:count},(_,i)=>'<i class="'+(dual?(i<8?'gpu-a':'gpu-b'):'gpu-one')+'" aria-hidden="true"></i>').join('')+'</div>';
    root.querySelector('[data-ax-gpu-readout]').textContent=dual?'示意图把通道分成两组；原论文的不同卷积层连接方式并不完全相同，且存在跨 GPU 通信。':'单卡示意把通道放在同一设备上。现代显存、并行库与模型规模不同，工程选择也会变化。';
  }
  const resultData={external:{alex:15.3,label:'五模型集成 · 额外预训练',detail:'原论文最佳集成使用额外的 ImageNet 2011 数据预训练；这不是仅凭比赛训练集得到的成绩。'},provided:{alex:16.4,label:'五模型集成 · 比赛训练数据',detail:'原论文报告未使用额外数据的五模型集成结果为 16.4%。论文还讨论单模型成绩，口径不要混在一起。'}};
  function updateResults(root){
    const mode=root.querySelector('[data-ax-result][aria-pressed="true"]').dataset.axResult,data=resultData[mode],values=[{label:data.label,value:data.alex,focus:true},{label:'第二名参赛系统',value:26.2,focus:false}];
    root.querySelector('[data-ax-bars]').innerHTML=values.map(item=>'<div class="ax-bar-row"><div><span>'+esc(item.label)+'</span><strong>'+item.value.toFixed(1)+'%</strong></div><div class="ax-bar-track"><i class="'+(item.focus?'is-alex':'')+'" style="width:'+(item.value/30*100)+'%"></i></div></div>').join('');
    root.querySelector('[data-ax-result-note]').textContent=data.detail+' 对比口径：ImageNet 2012 Top-5 测试错误率；两条柱比较的是不同参赛系统。';
  }
  const parameterData={
    fc1:{label:'FC1 · 9,216 → 4,096',value:37752832,copy:'9,216×4,096 个连接权重，加 4,096 个偏置。仅这一层约 3775 万个参数。'},
    fc2:{label:'FC2 · 4,096 → 4,096',value:16781312,copy:'4,096×4,096 个连接权重，加 4,096 个偏置。两个宽大的隐藏层是模型参数多的重要原因。'},
    fc3:{label:'FC3 · 4,096 → 1,000',value:4097000,copy:'4,096×1,000 个连接权重，加 1,000 个偏置。输出对应 1000 个 ImageNet 类别。'}
  };
  function updateParameters(root){
    const key=root.querySelector('[data-ax-param][aria-pressed="true"]').dataset.axParam,data=parameterData[key];
    root.querySelectorAll('[data-ax-param]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axParam===key)));
    root.querySelector('[data-ax-param-label]').textContent=data.label;
    root.querySelector('[data-ax-param-value]').textContent=data.value.toLocaleString('en-US')+' 个参数';
    root.querySelector('[data-ax-param-bar]').style.width=(data.value/parameterData.fc1.value*100)+'%';
    root.querySelector('[data-ax-param-copy]').textContent=data.copy;
  }
  function updateReLU(root){
    const input=Number(root.querySelector('[data-ax-relu-input]').value),x=20+(input+4)*32.5,y=110-Math.max(0,input)*23;
    root.querySelector('[data-ax-relu-value]').textContent=input.toFixed(1);
    root.querySelector('[data-ax-probe]').setAttribute('d','M'+x+' 12V110');
    root.querySelector('[data-ax-probe-dot]').setAttribute('cx',x);root.querySelector('[data-ax-probe-dot]').setAttribute('cy',y);
    root.querySelector('[data-ax-relu-readout]').textContent=input===0?'ReLU(0)=0；此处数学上不可导，PyTorch采用的反向值为0。':input<0?'ReLU('+input.toFixed(1)+') = 0；负半轴局部梯度为 0。':'ReLU('+input.toFixed(1)+') = '+input.toFixed(1)+'；正半轴局部梯度为 1。';
  }
  function updateAugment(root){
    const mode=root.dataset.axAugActive,scene=root.querySelector('[data-ax-augment-view]');
    scene.dataset.axAugmentView=mode;
    scene.querySelectorAll('[data-ax-augment]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axAugment===mode)));
    const copies={crop:'随机裁出不同区域，让同一辆车出现在画面不同位置；类别标签仍是“汽车”。',flip:'水平翻转会改变道路朝向，但这个示意中的“汽车”类别仍成立；方向敏感任务未必适合这样做。',color:'轻微改变颜色可以增加外观变化；若颜色本身决定类别，扰动幅度就需要谨慎设定。'};
    root.querySelector('[data-ax-augment-readout]').textContent=copies[mode];
  }
  function update(root){
    updateStage(root);updatePool(root);updateDropout(root);updateGpu(root);updateResults(root);updateParameters(root);updateReLU(root);updateAugment(root);
    root.querySelectorAll('[data-ax-idea]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.axIdea===root.dataset.axIdeaActive)));
    root.querySelectorAll('[data-ax-idea-panel]').forEach(panel=>{panel.hidden=panel.dataset.axIdeaPanel!==root.dataset.axIdeaActive});
  }
  window.lessonPlaygrounds={
    render(lessonId,sectionIndex){return lessonId==='cnn'&&sectionIndex===14?playgroundMarkup():(previous.render?.(lessonId,sectionIndex)||'')},
    initialize(){previous.initialize?.();document.querySelectorAll('[data-alexnet]').forEach(update)}
  };
  document.addEventListener('click',event=>{
    const root=event.target.closest('[data-alexnet]');if(!root)return;
    if(event.target.closest('[data-ax-prev]')){root.dataset.axActiveStage=String(Number(root.dataset.axActiveStage)-1);updateStage(root);return}
    if(event.target.closest('[data-ax-next]')){root.dataset.axActiveStage=String(Number(root.dataset.axActiveStage)+1);updateStage(root);return}
    if(event.target.closest('[data-ax-flow-reset]')){root.querySelector('[data-ax-batch]').value='1';root.querySelector('[data-ax-size]').value='224';root.dataset.axActiveStage='1';updateFlow(root);return}
    const idea=event.target.closest('[data-ax-idea]');if(idea){root.dataset.axIdeaActive=idea.dataset.axIdea;update(root);return}
    const gpu=event.target.closest('[data-ax-gpu]');if(gpu){root.dataset.axGpuLayout=gpu.dataset.axGpu;updateGpu(root);return}
    const result=event.target.closest('[data-ax-result]');if(result){root.querySelectorAll('[data-ax-result]').forEach(button=>button.setAttribute('aria-pressed',String(button===result)));updateResults(root);return}
    const parameter=event.target.closest('[data-ax-param]');if(parameter){root.querySelectorAll('[data-ax-param]').forEach(button=>button.setAttribute('aria-pressed',String(button===parameter)));updateParameters(root);return}
    const augment=event.target.closest('[data-ax-augment]');if(augment){root.dataset.axAugActive=augment.dataset.axAugment;updateAugment(root);return}
    const answer=event.target.closest('[data-ax-answer]');if(answer){const card=answer.closest('[data-ax-quiz-card]'),item=quiz[Number(card.dataset.axQuizCard)],correct=answer.dataset.axAnswer===item.a;card.querySelectorAll('[data-ax-answer]').forEach(button=>{const selected=button===answer;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-correct',selected&&correct);button.classList.toggle('is-wrong',selected&&!correct)});card.querySelector('[data-ax-feedback]').textContent=(correct?'判断正确。':'再想一下。')+item.why;return}
  });
  document.addEventListener('input',event=>{const root=event.target.closest('[data-alexnet]');if(!root)return;if(event.target.matches('[data-ax-relu-input]'))updateReLU(root);if(event.target.matches('[data-ax-drop-rate]'))updateDropout(root)});
  document.addEventListener('change',event=>{
    const root=event.target.closest('[data-alexnet]');if(!root)return;
    if(event.target.matches('[data-ax-layer]')){root.dataset.axActiveStage=event.target.value;updateStage(root)}
    if(event.target.matches('[data-ax-batch],[data-ax-size]'))updateFlow(root);
    if(event.target.matches('[data-ax-pool-position]'))updatePool(root);
  });
})();
