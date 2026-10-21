/* 深度学习与计算机视觉课程主线：基础先行，长章节拆到可完成的主题课。 */
(()=>{
  const catalog=typeof lessons!=='undefined'?lessons:window.lessons;
  if(!catalog)return;
  const originals=new Map(catalog.map(l=>[l.id,l]));
  const sources=new Map(catalog.map(l=>[l.id,l.sections.slice()]));
  const moved=new Map(),routes=new Map();
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const exercise=(q,options,answer,why)=>({q,options,answer,why});
  const take=(origin,legacyIndices,destination)=>legacyIndices.map(legacy=>{
    const old=sources.get(origin)?.find(s=>s.legacyIndex===legacy);
    if(!old)throw new Error('Missing curriculum section '+origin+':'+legacy);
    const sourceLegacy=Number.isInteger(old.legacyIndex)?old.legacyIndex:legacy;
    const originalPlayground=old.playgroundId||sourceLegacy;
    const section={...old,paragraphs:(old.paragraphs||[]).slice(),sourceLesson:origin,sourceLegacyIndex:sourceLegacy};
    routes.set(origin+'/section-'+old.id,{lesson:destination,section:old.id});
    routes.set(origin+'/section-'+(sourceLegacy+1),{lesson:destination,section:old.id});
    routes.set(origin+'/section-'+origin+'-s'+(sourceLegacy+1),{lesson:destination,section:old.id});
    if(destination!==origin){
      const key='foundation-'+old.id;
      moved.set(key,{origin,playground:originalPlayground,index:sourceLegacy});
      section.playgroundId=key;
    }
    return section;
  });
  const stripNumber=value=>String(value||'').replace(/^\d+[.、]\s*/,'');
  function make({id,group,title,desc,parts,goals,quiz,prereq,links=[],phase,optional=false,time=30,primary,example,terms=[],keepCode=false}){
    const base=originals.get(primary||parts[0]?.sourceLesson||id);
    if(!base)throw new Error('Missing curriculum source lesson '+id);
    const used=new Set();
    const sections=parts.map((s,i)=>{
      let legacy=Number.isInteger(s.legacyIndex)?s.legacyIndex:i;
      while(used.has(legacy))legacy=Math.max(legacy+1,i);
      used.add(legacy);
      return {...s,legacyIndex:legacy,title:(i+1)+'. '+stripNumber(s.title)};
    });
    const origins=[...new Set(parts.map(s=>s.sourceLesson).filter(Boolean))];
    const papers=[...new Map(origins.flatMap(origin=>originals.get(origin)?.sources||[]).filter(item=>item?.url).map(item=>[item.url,item])).values()];
    const l={...base,id,group,title,desc,sections,time,level:optional?'选学':(base.level==='入门'?'入门':'基础'),goals,prereq,prereqLinks:links.map(([id,title])=>({id,title})),keypoints:goals.slice(),quiz,chapterExercises:[quiz],worked:{title:'学完先检查自己的理解',prompt:quiz.q,solution:quiz.options[quiz.answer]+'。'+quiz.why},sources:papers,visual:'',figureKeys:[],code:keepCode&&id===primary?base.code||'':'',language:keepCode&&id===primary?base.language||'':'课堂图解',foundation:{title,question:desc,why:goals[0]||desc,example:example||quiz.why,terms}};
    l.curriculumKey=group;l.curriculumPhase=phase;l.curriculumOptional=optional;l.curriculumIntro=desc;
    return l;
  }
  const qStart=exercise('学习一个神经网络的第一步，最需要知道什么？',['网络输入、产生答案的方式和可调整的参数','先记住所有优化器名称','先会阅读完整模型源码'],0,'先认清输入、计算和参数，后面的张量、损失与更新才有位置可放。');
  const d1=make({id:'ai-foundations',group:'dl',title:'AI 从哪里开始：一张图看懂神经网络',desc:'从输入、神经元、层与可调整参数出发，建立整套深度学习知识的第一张地图。',parts:take('ai-foundations',[0,1,2,3],'ai-foundations'),goals:['说清输入、计算层与输出之间的关系。','用一个乘加例子解释权重和偏置。','概括训练为何会调整参数。'],quiz:qStart,prereq:'无须预先学习线性代数或编写 Python；会做简单的加减乘即可。',phase:'dl-foundations',time:20,primary:'ai-foundations',example:'把一张图片变成一组可读的分数，再用例子调整计算中的数字。',terms:['neuron','parameter','weight','bias'],keepCode:true});
  const d2=make({id:'tensor',group:'dl',title:'张量：深度学习的数据形状',desc:'先认识数字、列表和表格，再看轴、索引、形状变化与常用乘法。',parts:take('tensor',sources.get('tensor').map(s=>s.legacyIndex),'tensor'),goals:['读懂标量、向量、矩阵与高维张量的形状。','用索引和切片取出数据，区分重排与换轴。','用小算例分清逐元素乘法、点积和矩阵乘法。'],quiz:exercise('形状为 [2,3] 的矩阵乘以 [3,4]，结果形状是什么？',['[2,4]','[3,3]','[2,3,4]'],0,'中间两个 3 相乘并求和，留下外侧的 2 和 4。'),prereq:'先看第 1 课中“输入怎样表示成一组数字”；不要求会写 Python。',links:[['ai-foundations','第 1 课：AI 与神经网络起点']],phase:'dl-foundations',time:45,primary:'tensor',example:'一批 8 张 RGB 图片可记成 [8,3,224,224]：8 张、3 个颜色通道、每张高宽 224。',terms:['tensor','shape','axis','matrix-multiplication'],keepCode:true});
  const d3=make({id:'network',group:'dl',title:'神经网络的基本积木：神经元、激活与输出',desc:'从一行乘加走到非线性与任务输出，理解一个小网络怎样把数字变成答案。',parts:take('network',[0,1,2,7],'network'),goals:['根据输入、权重和偏置算出一个神经元的结果。','解释激活函数为什么让多层网络不再只是单一线性变换。','识别分类输出分数与连续数值输出的区别。'],quiz:exercise('两个线性层之间没有任何非线性时，叠起来仍能表示什么？',['仍等价于一个线性变换','一定能画出任意弯曲关系','自动变成概率'],0,'线性变换的组合仍是线性变换；激活函数带来非线性表达能力。'),prereq:'张量的数字和形状；不要求先会求导。',links:[['tensor','第 2 课：张量与形状']],phase:'dl-foundations',time:35,primary:'network',example:'神经元先算 z=w₁x₁+w₂x₂+b，再把 z 交给激活函数。',terms:['neuron','weight','bias','activation-function','logit'],keepCode:true});
  const d4=make({id:'losses',group:'dl',title:'分类损失：先从标签和 logits 开始',desc:'先分清要回答的问题、模型输出的原始分数和标签，再一步步看 Sigmoid、Softmax、BCE 与交叉熵。',parts:take('losses',[0,1,7,3,6],'losses'),goals:['从“只能选一个”或“可以多选”识别分类形式。','用通俗例子解释 logit 是 Softmax/Sigmoid 前的原始分数。','按顺序看原始分数、概率和损失怎样相连。','分清 BCELoss、BCEWithLogitsLoss 与 CrossEntropyLoss 常见输入。'],quiz:exercise('互斥三分类的 CrossEntropyLoss 通常应该接收什么？',['已经取最大值的类别编号作为预测','原始 logits 与整数类别标签','先算出的概率再额外做 Softmax'],1,'交叉熵内部会用稳定的 log-softmax 计算；离散 argmax 会丢失梯度所需的信息。'),prereq:'理解神经元会输出一组分数；本课会先解释这些分数是什么，再讨论概率和损失。',links:[['network','第 3 课：神经网络怎样产生一组原始分数']],phase:'dl-foundations',time:45,primary:'losses',example:'三类原始分数 [2,1,0.1] 经 Softmax 约变成 [0.659,0.243,0.099]；若真实类是第三类，交叉熵为 −ln(0.099)。',terms:['logit','softmax','sigmoid','cross-entropy','binary-cross-entropy'],keepCode:true});
  const d5=make({id:'gradient',group:'dl',title:'梯度与反向传播：模型怎样收到改正信号',desc:'从一个数字的导数开始，手算预测、损失、梯度与一次参数更新。',parts:take('gradient',sources.get('gradient').map(s=>s.legacyIndex),'gradient'),goals:['用变化率解释导数与梯度。','沿计算图说清链式法则怎样把损失信号传回参数。','分清清理梯度、反向求导与参数更新的顺序。','判断梯度为零、为 None 或步子过大的常见原因。'],quiz:exercise('一次普通 PyTorch 更新中，optimizer.step() 的职责是什么？',['根据已有梯度更新参数','重新读取图片标签','自动计算验证集准确率'],0,'反向求导生成梯度；优化器使用它和自身状态更新参数。'),prereq:'先知道网络输出和损失是什么；求导从一元函数与小数字开始说明。',links:[['losses','第 4 课：输出分数如何变成损失']],phase:'dl-learning',time:45,primary:'gradient',example:'L(w)=(wx−y)²：先算预测和损失，再求 dL/dw，沿负梯度方向微调 w。',terms:['gradient','derivative','backpropagation','chain-rule'],keepCode:true});
  const d6=make({id:'optimizer',group:'dl',title:'优化器与学习率：拿着梯度怎样走',desc:'理解 SGD、动量和 Adam 的更新方式，观察学习率、批次和权重衰减。',parts:take('optimizer',sources.get('optimizer').map(s=>s.legacyIndex),'optimizer'),goals:['解释梯度给方向、优化器决定更新走法。','手算一次 SGD、动量和 Adam 更新中的主要量。','根据验证表现理解学习率、权重衰减与调度器。'],quiz:exercise('把学习率调得特别大，最可能看到什么？',['损失一定一步降到全局最优','更新跨过合适区域，损失振荡或变大','梯度自动变成零'],1,'学习率控制每一步的幅度；梯度方向正确也可能因步子太大而越过低点。'),prereq:'已学会读梯度并理解一次参数更新。',links:[['gradient','第 5 课：梯度与一次更新']],phase:'dl-learning',time:45,primary:'optimizer',example:'同一坡面上，普通 SGD 每一步看当前坡度；动量还参考之前的行进方向。',terms:['optimizer','learning-rate','sgd','adam','weight-decay'],keepCode:true});
  const d7=make({id:'training',group:'dl',title:'训练循环：把预测、求导、更新与验证串起来',desc:'读懂数据、batch、epoch、训练模式和一次完整训练循环。',parts:take('training',[0,1,2,4],'training'),goals:['从数据集数量与批大小估算一个 epoch 有多少批次。','区分训练集、验证集与测试集的职责。','按清零梯度、前向、损失、反向和更新的顺序解释训练代码。','区分 train/eval 与是否记录梯度这两个独立开关。'],quiz:exercise('model.eval() 会自动关闭梯度记录吗？',['会','不会，还要单独使用 no_grad 或 inference_mode','只在 CPU 会'],1,'eval 切换 Dropout、BatchNorm 等层的行为；它不控制自动求导。'),prereq:'神经网络、损失、梯度和优化器。',links:[['losses','第 4 课：计算损失'],['gradient','第 5 课：反向传播'],['optimizer','第 6 课：优化器']],phase:'dl-learning',time:40,primary:'training',example:'1000 张图、batch size 128，保留尾批时每轮 8 批；每批更新一次就是 8 次参数更新。',terms:['batch','epoch','iteration','training-set','validation-set','test-set'],keepCode:true});
  const d8=make({id:'checkpoints',group:'dl',title:'模型、权重与检查点：保存后究竟能做什么',desc:'区分模型结构、参数、推理文件与可续训的训练检查点。',parts:take('training',[5,6,7,8],'checkpoints'),goals:['分清模型结构与训练后学到的参数。','说明仅用于推理和中断后继续训练通常需要保存哪些状态。','根据格式说明和实际保存代码判断文件内容。'],quiz:exercise('只有模型权重，通常足以从中断的 Adam 训练精确接着走吗？',['足够，Adam 的历史状态会从权重推回','通常不够，还需要优化器及流程相关状态','只有改扩展名就足够'],1,'Adam 还有动量和二阶矩等状态；恢复训练还可能需要调度器、步数和随机状态。'),prereq:'理解一轮训练与优化器更新。',links:[['training','第 7 课：训练循环']],phase:'dl-learning',time:35,primary:'training',example:'推理关注能否从输入得到输出；续训还要恢复优化器的历史状态和学习率进度。',terms:['checkpoint','state-dict','inference'],keepCode:false});
  const d9=make({id:'regularization',group:'dl',title:'泛化与正则化：从记住样本到学会规律',desc:'先看小样本能否学会，再用训练与验证现象辨认过拟合，选择合理的改进方向。',parts:[...take('regularization',[0,1,2,3],'regularization'),...take('training',[3],'regularization'),...take('network',[8],'regularization')],goals:['区分训练集表现和对新数据的泛化表现。','用小样本拟合和验证曲线定位训练问题。','比较权重衰减、Dropout、增强和早停的作用及限制。','按数据来源划分样本，避免泄漏和错误归因。'],quiz:exercise('训练损失持续下降、独立验证表现连续变差，下一步最合理的做法是什么？',['盲目增加模型和 epoch','先核对数据与划分，再结合验证信号检查过拟合','改用测试集反复调参'],1,'验证退化有多种原因；先查数据和评估条件，再决定正则化或模型修改。'),prereq:'训练循环、验证集和损失。',links:[['training','第 7 课：训练循环']],phase:'dl-learning',time:40,primary:'regularization',example:'模型把练习册答案背下来，不代表它掌握了新题都适用的解法。',terms:['overfitting','generalization','regularization','data-leakage']});
  const d10=make({id:'network-extensions',group:'dl',title:'选学：BatchNorm、SiLU、GELU 与 SwiGLU',desc:'基础网络走通后，再看归一化、平滑激活和门控前馈层各自改变什么。',parts:take('network',[3,4,5,6],'network-extensions'),goals:['用四个数解释 BatchNorm 的统计、缩放和平移。','比较 SiLU、GELU 等激活曲线的共同点与差别。','说明 SwiGLU 怎样让一条特征分支控制另一条分支。'],quiz:exercise('BatchNorm 的 model.eval() 会自动关闭梯度记录吗？',['会','不会；它切换统计行为，不负责关闭求导','取决于 batch 大小'],1,'模块模式、梯度记录和参数是否可训练是不同设置。'),prereq:'建议完成神经元、激活函数、张量形状和训练模式。',links:[['network','第 3 课：网络基本积木'],['tensor','第 2 课：张量形状']],phase:'dl-electives',optional:true,time:40,primary:'network',example:'BatchNorm 用每个通道的统计量重新整理响应；可学习的缩放与平移再调回任务需要的范围。',terms:['batch-normalization','silu','gelu','swiglu']});
  const d11=make({id:'loss-theory',group:'dl',title:'选学：信息量、熵与交叉熵',desc:'从概率的意外程度出发，区分真实分布的不确定性和模型给出的预测代价。',parts:take('losses',[4,5],'loss-theory'),goals:['用概率解释信息量为什么随罕见程度增大。','区分熵、交叉熵与 KL 散度。','说明硬标签交叉熵为何化成真实类别的负对数概率。'],quiz:exercise('熵主要描述什么？',['模型参数有多少','给定真实分布的不确定程度','预测框和标注框的位置差'],1,'熵由真实分布的概率组成；交叉熵才用模型分布给真实结果打分。'),prereq:'分类损失、logits、Softmax 与对数。',links:[['losses','第 4 课：分类损失与概率']],phase:'dl-electives',optional:true,time:30,primary:'losses',example:'罕见事件的概率越小，−ln(p) 越大；同一规则构成真实标签的交叉熵惩罚。',terms:['entropy','cross-entropy','kl-divergence']});
  const d12=make({id:'loss-gradients',group:'dl',title:'选学：交叉熵的梯度怎样改动每个类别分数',desc:'在主线学完反向传播后，手算 Softmax 交叉熵对每个 logit 的误差信号。',parts:take('losses',[9,10],'loss-gradients'),goals:['算出 p−y 的分类 logit 梯度。','解释真实类与其他类别为什么都会收到更新信号。','区分单样本梯度与 batch mean 后的梯度。'],quiz:exercise('Softmax + 未加权硬标签交叉熵中，logit 梯度的常见简式是什么？',['p−y','y−p 对所有样本恒成立','只在真实类位置为 1'],0,'真实类的一位标签和所有类别的预测概率共同组成 p−y。'),prereq:'已学 Softmax、交叉熵、梯度与链式法则。',links:[['losses','第 4 课：交叉熵'],['gradient','第 5 课：梯度与反向传播']],phase:'dl-electives',optional:true,time:25,primary:'losses',example:'预测 [0.7,0.2,0.1]，正确类为第二类，梯度为 [0.7,−0.8,0.1]。',terms:['gradient','softmax','cross-entropy']});
  const d13=make({id:'loss-implementation',group:'dl',title:'选学：类别不平衡、损失平均与数值检查',desc:'检查类别权重、mean 分母、张量形状与极端分数，避免代码运行却在优化错误目标。',parts:take('losses',[8,11,12],'loss-implementation'),goals:['按类别与场景查看不平衡的影响。','说明不同损失的 mean 可能采用不同分母。','识别预测和标签形状触发的静默广播错误。','解释极端 logits 为什么要使用稳定的损失接口。'],quiz:exercise('预测形状 [B,1]、目标形状 [B] 时，先做什么？',['核对两边语义和形状，避免广播成 [B,B]','直接忽略维度','把 B 改为 1'],0,'广播可能构造预测与整批标签的两两差值，而非逐样本比较。'),prereq:'分类损失和张量形状。',links:[['losses','第 4 课：分类损失接口'],['tensor','第 2 课：张量形状与广播']],phase:'dl-electives',optional:true,time:35,primary:'losses',example:'逐样本一一比较 [预测,目标]；先确认形状一致，再信任数值结果。',terms:['class-imbalance','broadcasting','reduction','logit']});
  const d14=make({id:'training-engineering',group:'dl',title:'选学：尾批、梯度累积与训练故障排查',desc:'沿着样本数、反向求导和参数更新三条线，诊断训练实现中的边界问题。',parts:take('training',[9,10,11],'training-engineering'),goals:['用样本数而非批次数正确统计尾批平均损失。','按累积组的实际样本数缩放梯度。','从数据、梯度、参数更新和独立验证逐层定位故障。'],quiz:exercise('梯度累积最后一组只有 5 个样本，但前几组各有 32 个；按样本等权时用什么分母？',['固定 32','该组实际样本数 5','类别数'],1,'不完整尾组要按真实参与的样本数缩放。'),prereq:'训练循环、平均损失和优化器。',links:[['training','第 7 课：训练循环'],['optimizer','第 6 课：优化器更新']],phase:'dl-electives',optional:true,time:35,primary:'training',example:'把小批次合起来更新时，末尾不足一整组的部分不能仍按满组样本数计算。',terms:['gradient-accumulation','batch','iteration']});
  const d15=make({id:'loss-regression',group:'dl',title:'选学：回归任务的损失怎样惩罚误差',desc:'通过温度和坐标预测的例子，对比 MSE、MAE 与 Huber 在大误差上的取舍。',parts:take('losses',[2],'loss-regression'),goals:['从目标是否连续变化识别回归任务。','解释平方误差为何更放大大偏差。','比较 MAE 与 Huber 在异常误差下的取舍。'],quiz:exercise('少数样本的预测误差特别大时，哪种损失通常会让它们影响更显著？',['MSE，因为平方会更快放大大误差','MAE，因为它把误差平方','所有损失影响都完全一样'],0,'平方增长会让特别大的误差对 MSE 的贡献快速上升。'),prereq:'已理解预测、标签与损失代表的偏差代价。',links:[['losses','第 4 课：分类任务与损失入门']],phase:'dl-electives',optional:true,time:25,primary:'losses',example:'将摄氏温度误差从 2℃ 增至 4℃，MSE 从 4 增至 16；MAE 则从 2 增至 4。',terms:['regression','mse','mae','huber-loss']});

  const c1=make({id:'tasks',group:'cv',title:'计算机视觉在回答什么问题？',desc:'从同一张图的不同答案出发，认识分类、检测、分割、关键点与生成任务。',parts:take('tasks',sources.get('tasks').map(s=>s.legacyIndex),'tasks'),goals:['根据实际用途选择分类、检测或分割等输出。','比较语义、实例、全景分割与关键点的标注差异。','说明 Backbone、Neck / Decoder 与任务输出头是有用的结构抽象。'],quiz:exercise('只需知道图里有没有车时，第一版通常必须画逐像素分割掩码吗？',['必须','不必，先采用能回答问题的最简单任务','所有视觉模型都要同时做五种任务'],1,'输出粒度应满足实际决策；标注越复杂也会增加成本。'),prereq:'无须先学 CNN 或边界框公式；先认识模型输出代表什么。',phase:'cv-basics',time:35,primary:'tasks',example:'同一张路口图：分类说“有车”，检测给车辆位置，分割标出每辆车的像素区域。',terms:['classification','object-detection','segmentation','keypoint']});
  const c2=make({id:'image',group:'cv',title:'图像怎样变成模型输入？',desc:'认识像素、颜色通道、HWC / CHW、数值范围和尺寸变换。',parts:take('image',sources.get('image').map(s=>s.legacyIndex),'image'),goals:['把像素理解为有数值、有排列方式的数组。','区分颜色通道顺序与张量轴顺序。','按训练约定处理尺寸、颜色、归一化与坐标还原。'],quiz:exercise('OpenCV 默认读入的颜色通道顺序是什么？',['RGB','BGR','NCHW'],1,'BGR 是颜色顺序；NCHW 是包含批次和空间轴的张量布局。'),prereq:'了解课程输入可以是图像；不要求预先会图像处理代码。',links:[['tasks','第 1 课：视觉任务输出']],phase:'cv-basics',time:25,primary:'image',example:'一张 224×224 RGB 图片放进 PyTorch 模型前，常变成 [1,3,224,224] 的浮点张量。',terms:['pixel','channel','rgb','normalization']});
  const c3=make({id:'cnn',group:'cv',title:'CNN 基础：卷积窗口怎样算出特征图',desc:'从一个输出数开始手算卷积，再追踪输入、卷积核、通道和输出尺寸。',parts:take('cnn',[0,1,4,5,6,3],'cnn'),goals:['追踪卷积输入、权重和输出的形状。','逐通道计算局部乘加，解释一格特征值从哪里来。','计算普通与分组卷积的参数量和输出尺寸。'],quiz:exercise('3×3、padding=1、stride=1 的卷积对空间尺寸通常有什么影响？',['保持不变','减半','扩大三倍'],0,'一圈填充抵消了 3×3 窗口在边界减少的位置。'),prereq:'图像输入与张量形状。',links:[['image','第 2 课：图像与通道'],['tensor','第 2 课：张量的形状']],phase:'cv-cnn',time:50,primary:'cnn',example:'对 3×3 窗口逐格乘卷积核权重，再跨输入通道累加，得到输出特征图的一格。',terms:['convolution','feature-map','kernel','stride','padding','groups']});
  const c4=make({id:'cnn-priors',group:'cv',title:'CNN 为什么适合图像？局部、共享与位置',desc:'对照全连接与卷积的结构，理解像素展平、参数量和空间位置。',parts:take('cnn',[7,8,9,10,11,12],'cnn-priors'),goals:['说明 flatten 保留像素顺序，但全连接没有显式使用局部邻接和共享权重。','区分局部连接与卷积核权重共享。','分清平移等变与平移不变，并连接像素到类别的完整链路。'],quiz:exercise('普通步幅 1 卷积更直接带来哪种性质？',['特征响应通常随输入平移而移动','所有分类分数都必定完全不变','任意图像自动识别正确'],0,'卷积主要呈现等变；分类不变性还依赖后续汇聚、结构和训练。'),prereq:'已理解卷积窗口、特征图和输出尺寸。',links:[['cnn','第 3 课：卷积怎样计算']],phase:'cv-cnn',time:45,primary:'cnn',example:'同一个小滤波器在不同位置重复使用，所以相同局部纹理可以在不同位置产生相似响应。',terms:['local-connectivity','weight-sharing','translation-equivariance','flatten']});
  const c5=make({id:'pooling',group:'cv',title:'池化与下采样：缩小图像表征的代价',desc:'用小网格计算最大池化，观察分辨率、位置与感受野怎样变化。',parts:[...take('cnn',[2],'pooling'),...take('pooling',sources.get('pooling').map(s=>s.legacyIndex),'pooling')],goals:['算出池化输出尺寸和窗口中的最大值。','说明下采样减少空间位置，也可能损失小目标细节。','比较池化与步幅卷积并辨认适用边界。'],quiz:exercise('下采样对小目标最直接的风险是什么？',['空间细节被压缩，特征图上可用位置减少','数据集类别数量自动增加','训练标签路径改变'],0,'目标经过多次缩小后可能只剩很少网格信息。'),prereq:'卷积输出形状和图像空间尺寸。',links:[['cnn','第 3 课：CNN 卷积基础']],phase:'cv-cnn',time:30,primary:'pooling',example:'2×2 最大池化取四个数中的最大值，空间边长通常缩成一半。',terms:['pooling','downsampling','receptive-field']});
  const c6=make({id:'cnn-architectures',group:'cv',title:'经典 CNN：LeNet、AlexNet 与 VGG',desc:'按图像穿过的卷积、池化与全连接层，比较三代经典图像分类网络。',parts:take('cnn',[13,14,15,22],'cnn-architectures'),goals:['追踪 LeNet、AlexNet 与 VGG 的主要层次和张量尺寸。','解释卷积、池化、激活、Dropout 与训练规模各自的作用。','区分历史原始结构、论文报告和现代教学变体。'],quiz:exercise('VGG 反复堆叠 3×3 卷积的教学重点是什么？',['小卷积逐步扩大感受野，同时组成更深的网络','每个卷积都自动完成分类','网络不再需要训练数据'],0,'连续小卷积可扩大有效覆盖，但深层网络仍有计算与优化成本。'),prereq:'卷积与池化的基本计算。',links:[['cnn','第 3 课：CNN 基础'],['pooling','第 4 课：池化与下采样']],phase:'cv-cnn',time:55,primary:'cnn',example:'从 28×28 手写数字开始，逐层追踪卷积和池化，直到输出类别分数。',terms:['lenet','alexnet','vgg','dropout']});
  const c7=make({id:'cnn-residual',group:'cv',title:'残差网络：在深层网络里多留一条直路',desc:'先辨认深层普通网络的训练困难，再观察残差分支怎样对齐并相加。',parts:take('cnn',[16,17,18],'cnn-residual'),goals:['区分过拟合、梯度变弱与深层网络优化退化。','画出输入捷径、主分支、相加与激活。','检查输入输出形状不同的时候捷径怎样调整。'],quiz:exercise('残差相加前，主分支与捷径分支的张量通常需要满足什么？',['形状兼容，空间与通道能逐元素对齐','数值必须相同','必须来自同一层'],0,'相加按位置逐元素进行；不匹配时常用投影等方式对齐。'),prereq:'卷积、激活、张量形状和链式法则的直觉。',links:[['cnn-architectures','第 6 课：经典卷积网络']],phase:'cv-cnn',time:35,primary:'cnn',example:'残差块输出 x+F(x)：主分支学修正，捷径保留一个直接的信息通道。',terms:['residual-network','shortcut-connection','gradient']});
  const c8=make({id:'receptive-field',group:'cv',title:'感受野与多尺度特征：一个位置能看多大范围',desc:'逐层计算理论感受野，再区分有效影响并观察多尺度特征融合。',parts:take('cnn',[19,20,21],'receptive-field'),goals:['根据卷积核、步幅与膨胀率逐层估算理论感受野。','区分最大可达范围和输入各位置的实际影响强弱。','解释高分辨率细节与深层语义为什么常要融合。'],quiz:exercise('理论感受野覆盖到的每个输入像素，对输出的影响都一样大吗？',['一样大','不一定，理论范围只描述可达路径','只有边缘像素有影响'],1,'实际有效影响常集中在部分区域，并随样本和参数变化。'),prereq:'卷积尺寸、下采样、池化和张量形状。',links:[['cnn','第 3 课：卷积'],['pooling','第 5 课：池化']],phase:'cv-cnn',time:40,primary:'cnn',example:'两层 3×3、stride=1 卷积的理论感受野从 1×1 扩展到 5×5。',terms:['receptive-field','feature-pyramid','fpn','pan']});
  const c9=make({id:'transfer',group:'cv',title:'迁移学习：用预训练模型起步',desc:'理解权重携带的信息，决定冻结哪些参数，并设计公平的微调比较。',parts:take('transfer',sources.get('transfer').map(s=>s.legacyIndex),'transfer'),goals:['解释预训练参数为什么能帮助小数据任务。','区分冻结骨干与逐步解冻的作用。','核对类别数、标签映射、权重来源与对照实验。'],quiz:exercise('微调预训练模型时，首先要核对什么？',['类别映射、模型结构和权重是否匹配','把所有参数立即冻结并删除标签','只看文件后缀'],0,'标签与输出类别不对应时，模型学到的分数也无法按预期解释。'),prereq:'CNN 特征、梯度更新与训练/验证流程。',links:[['cnn-residual','第 7 课：深层 CNN'],['training','深度学习第 7 课：训练循环']],phase:'cv-cnn',time:35,primary:'transfer',example:'先用通用图像数据学到的视觉特征作起点，再用自己的标注调整模型。',terms:['transfer-learning','pretraining','fine-tuning']});
  const c10=make({id:'iou',group:'cv',title:'目标检测的框与 IoU：怎样比较位置',desc:'先学清边界框坐标，再手算交集、并集和 IoU。',parts:take('iou',sources.get('iou').map(s=>s.legacyIndex),'iou'),goals:['读懂 xyxy 与中心宽高两种边界框表示。','手算两个矩形框的交集、并集与 IoU。','区分空间重合度、类别是否正确和预测概率。'],quiz:exercise('两个有效边界框完全不相交时，IoU 是多少？',['1','0.5','0'],2,'交集面积为零，因此交并比为零。'),prereq:'矩形坐标、宽高与面积。',links:[['tasks','计算机视觉任务与检测框']],phase:'cv-detection',time:25,primary:'iou',example:'预测框与真实框完全重合时，交集等于并集，IoU=1。',terms:['bounding-box','iou','intersection-over-union']});
  const c11=make({id:'metrics',group:'cv',title:'检测结果怎样评估：匹配、Precision、Recall 与 mAP',desc:'先按类别和 IoU 匹配预测框，再理解误报、漏报、AP、mAP 与 NMS。',parts:take('metrics',sources.get('metrics').map(s=>s.legacyIndex),'metrics'),goals:['按一对一匹配理解 TP、FP 与 FN。','说明 Precision 和 Recall 分别关注哪类错误。','比较 AP、mAP 与不同 IoU 评估条件。','解释 NMS 处理重复框的步骤和权衡。'],quiz:exercise('一个真实框被多个预测框命中时，评估通常怎样处理？',['每个都算一个正确目标','按匹配规则只把有限预测配给真实目标，其余可能是重复误报','忽略 IoU'],1,'一个真实目标不能因多个重复框而被多次计为正确检测。'),prereq:'边界框坐标、IoU 与类别预测。',links:[['iou','第 10 课：边界框与 IoU']],phase:'cv-detection',time:35,primary:'metrics',example:'Precision 看“报出的目标有多少是真的”；Recall 看“真实目标有多少被找到”。',terms:['precision','recall','average-precision','mean-average-precision','nms']});
  const c12=make({id:'data-quality',group:'cv',title:'数据质量与评估：泄漏、类别偏差和错误样本',desc:'验证数据要代表实际使用情形，再按来源、类别与场景定位失败。',parts:take('data-quality',sources.get('data-quality').map(s=>s.legacyIndex),'data-quality'),goals:['按视频、对象或场景分组切分，降低相似样本泄漏。','分别检查类别不平衡、标注噪声和分布差异。','用分层指标与错误样本支持下一轮数据或模型调整。'],quiz:exercise('同一段视频的相邻帧应如何分到训练集与验证集？',['随机打散到两边','尽量按完整视频来源分组','全部放验证集但不记录来源'],1,'相邻帧非常相似，跨集合会让验证成绩看起来过于乐观。'),prereq:'了解验证集和 Precision、Recall、mAP 等指标。',links:[['metrics','第 11 课：检测指标']],phase:'cv-detection',time:35,primary:'data-quality',example:'先按拍摄视频分组，再拆训练与验证，避免几乎同一帧同时出现在两边。',terms:['data-leakage','class-imbalance','hard-negative']});
  const c13=make({id:'augmentation',group:'cv',title:'图像增强：只制造合理的新观察',desc:'比较翻转、裁剪和颜色变化，并确认图片变换后标注仍然正确。',parts:take('augmentation',sources.get('augmentation').map(s=>s.legacyIndex),'augmentation'),goals:['区分几何增强和颜色增强。','判断裁剪、翻转后边界框需要怎样同步变化。','用验证集检查增强是否改善目标场景，而非照抄强度。'],quiz:exercise('图像水平翻转后，目标检测标签最需要同步修改什么？',['边界框横向位置','类别编号随机换序','不需要改变框'],0,'图像位置变了，边界框也要应用同一个几何变换。'),prereq:'图像预处理、目标框和数据评估。',links:[['image','第 2 课：图像预处理'],['iou','第 10 课：边界框'],['data-quality','第 12 课：数据质量']],phase:'cv-detection',time:30,primary:'augmentation',example:'水平镜像把归一化中心横坐标 x 换成 1−x；框的类别和宽高不因此改变。',terms:['data-augmentation','bounding-box','validation-set']});
  const c14=make({id:'dataset',group:'cv',title:'目标检测数据准备：从标注到可开训',desc:'从标注规则、目录和 YAML，到数据切分、防泄漏与开训前检查。',parts:take('dataset',sources.get('dataset').map(s=>s.legacyIndex),'dataset'),goals:['先定类别与框标注规则，再批量标注图片。','沿目录与 YAML 路径找到图片、标签和类别名称。','通过划分、可视化和体检发现泄漏、错框及空标签问题。'],quiz:exercise('同一段视频抽出的相邻帧，怎样放进训练集和验证集更可靠？',['逐帧随机分到两边','尽量按视频来源整体分组再切分','把相邻帧都复制进两边'],1,'近邻帧很像；跨集合会让验证表现看起来过于乐观。'),prereq:'知道检测框是什么，并理解训练集与验证集的区别。',links:[['iou','目标检测的框与 IoU'],['data-quality','数据质量与评估']],phase:'cv-detection',time:35,primary:'dataset',example:'先用查看器把图片和框叠起来，抽查路径、类别与坐标，再启动长时间训练。',terms:['bounding-box','dataset','training-set','validation-set'],keepCode:true});
  const c15=make({id:'quaternion',group:'cv',title:'选学：三维旋转、欧拉角与四元数',desc:'学习三维姿态的旋转表示、乘法顺序和万向节锁现象。',parts:take('quaternion',sources.get('quaternion').map(s=>s.legacyIndex),'quaternion'),goals:['读懂单位四元数如何表示三维旋转。','说明欧拉角必须带旋转顺序。','比较欧拉角、四元数和旋转矩阵的使用场景。'],quiz:exercise('同样三个欧拉角数值，如果旋转顺序不同，结果会怎样？',['总是一样','可能得到不同姿态','必然变成四元数'],1,'三维旋转通常不可交换，需同时说明坐标系与乘法约定。'),prereq:'会读三维向量分量、角度、正弦和余弦；属于视觉/图形的选学专题。',phase:'cv-electives',optional:true,time:45,primary:'quaternion',example:'先明确绕哪些轴、按什么次序旋转，再谈如何把姿态写成数字。',terms:['quaternion','euler-angle','rotation-matrix','gimbal-lock']});

  const dlCore=[d1,d2,d3,d4,d5,d6,d7,d8,d9],dlElectives=[d10,d11,d12,d13,d15,d14];
  const cvCore=[c1,c2,c3,c5,c4,c6,c7,c8,c9,c10,c11,c14,c12,c13],cvElectives=[c15];
  const phases={
    dl:[
    {id:'dl-foundations',title:'阶段一 · 先认清数据、网络与损失',why:'先理解模型输入什么、怎样算出分数、训练目标如何衡量答案。',ids:['ai-foundations','tensor','network','losses'],check:'能用自己的话解释一个输入怎样经过神经元成为 logits，并说明损失在比较什么。'},
      {id:'dl-learning',title:'阶段二 · 再看模型怎样学和泛化',why:'从梯度到优化器，再到训练、检查点与新数据上的表现。',ids:['gradient','optimizer','training','checkpoints','regularization'],check:'能按顺序讲出一次参数更新，并说清验证集和测试集的不同职责。'},
      {id:'dl-electives',title:'选学延伸 · 把概念讲得更细',why:'主线学完后，再进入特殊模块、信息论推导与工程边界。',ids:dlElectives.map(l=>l.id),check:'能说明选学内容解决了哪一类更具体的问题。',optional:true}
    ],
    cv:[
      {id:'cv-basics',title:'阶段一 · 先决定视觉任务与输入',why:'明确模型要交付的答案，再检查图像如何变成张量。',ids:['tasks','image'],check:'能说明图像输入的颜色、数值范围和轴顺序。'},
      {id:'cv-cnn',title:'阶段二 · 从卷积走向图像网络',why:'先算卷积与池化，再读经典模型、残差与感受野，最后了解预训练模型如何迁移。',ids:['cnn','pooling','cnn-priors','cnn-architectures','cnn-residual','receptive-field','transfer'],check:'能画一个卷积块，并说清下采样如何改变空间细节。'},
      {id:'cv-detection',title:'阶段三 · 理解检测、数据与指标',why:'把模型输出和真实目标对齐，再准备数据、检查划分并评估结果。',ids:['iou','metrics','dataset','data-quality','augmentation'],check:'能解释一个框如何经过 IoU 匹配成为评估中的正确或错误预测，并说出开训前应检查什么。'},
      {id:'cv-electives',title:'选学延伸 · 三维姿态',why:'视觉主线之外，补充三维空间旋转的表示方式。',ids:['quaternion'],check:'能指出欧拉角的旋转顺序，并说清四元数与矩阵的用途差异。',optional:true}
    ]
  };
  const curriculum=[...dlCore,...dlElectives,...cvCore,...cvElectives];
  const replacedIds=new Set(curriculum.map(l=>l.id));
  const rest=catalog.filter(l=>l.group!=='dl'&&l.group!=='cv'&&!replacedIds.has(l.id));
  for(const key of ['dl','cv']){
    const ordered=phases[key].flatMap(p=>p.ids.map(id=>curriculum.find(l=>l.id===id))).filter(Boolean);
    ordered.forEach((l,i)=>{l.curriculumNumber=i+1;l.curriculumTotal=ordered.length;});
  }
  catalog.splice(0,catalog.length,...dlCore,...dlElectives,...cvCore,...cvElectives,...rest);
  if(typeof groups!=='undefined'){
    groups.dl={...groups.dl,desc:'从输入和张量开始，逐步学网络、损失、梯度、训练与泛化。'};
    groups.cv={...groups.cv,desc:'从视觉任务和图像开始，走过卷积网络、目标框、指标与数据实践。'};
  }
  // 迁移已有阅读锚点、章节练习答案和完成记录；原笔记保留在原课程标识中。
  for(const [key,lesson] of moved){
    const section=curriculum.flatMap(l=>l.sections.map(s=>({lesson:l,section:s}))).find(x=>x.section.playgroundId===key);
    if(!section)continue;
    const from=lesson.origin,to=section.lesson.id,source=section.section;
    const answerKeys=[from+':section:'+lesson.index,from+':section:'+source.id];
    for(const oldKey of answerKeys)if(state.exerciseAnswers?.[oldKey]!==undefined){state.exerciseAnswers[to+':section:'+source.id]=state.exerciseAnswers[oldKey];state.exerciseAnswers[to+':section:'+source.legacyIndex]=state.exerciseAnswers[oldKey];}
    if(state.done?.includes(from))state.done.push(to);
    const previous=state.lastSection?.[from];
    if(previous){
      const target=routes.get(from+'/'+previous.replace(/^section-/,'') )||routes.get(from+'/'+previous);
      if(target&&target.lesson===to)state.lastSection[to]='section-'+target.section;
    }
  }
  if(Array.isArray(state.done))state.done=[...new Set(state.done)];
  const destinations={
    'deep-learning':'ai-foundations','neuron':'ai-foundations','weight':'network','bias':'network','activation-function':'network',
    'tensor':'tensor','shape':'tensor','logit':'losses','softmax':'losses','sigmoid':'network','binary-cross-entropy':'losses','cross-entropy':'losses',
    'gradient':'gradient','backpropagation':'gradient','chain-rule':'gradient','optimizer':'optimizer','learning-rate':'optimizer','batch':'training','epoch':'training','iteration':'training',
    'checkpoint':'checkpoints','state-dict':'checkpoints','overfitting':'regularization','generalization':'regularization','regularization':'regularization',
    'pixel':'image','channel':'image','convolution':'cnn','feature-map':'cnn','kernel':'cnn','stride':'cnn','padding':'cnn','pooling':'pooling',
    'lenet':'cnn-architectures','alexnet':'cnn-architectures','vgg':'cnn-architectures','residual-network':'cnn-residual','receptive-field':'receptive-field',
    'bounding-box':'iou','iou':'iou','precision':'metrics','recall':'metrics','mean-average-precision':'metrics','nms':'metrics','data-leakage':'data-quality','data-augmentation':'augmentation',
    'transfer-learning':'transfer','pretraining':'transfer','quaternion':'quaternion','euler-angle':'quaternion','rotation-matrix':'quaternion','gimbal-lock':'quaternion'
  };
  for(const [term,id] of Object.entries(destinations)){const item=window.visionlabGlossary?.byId?.[term];if(item)item.learnMore='#lesson/'+id;}
  const prevPlaygrounds=window.lessonPlaygrounds||{};
  window.lessonPlaygrounds={...prevPlaygrounds,render(id,key,legacy){const source=moved.get(key);return source?prevPlaygrounds.render?.(source.origin,source.playground,source.index)||'':prevPlaygrounds.render?.(id,key,legacy)||'';}};
  const prevBias=window.lessonBiasPlaygrounds;
  if(prevBias){
    const sourceFor=(id,index)=>{
      const course=catalog.find(l=>l.id===id),section=course?.sections.find(s=>s.legacyIndex===index);
      return section?{id:section.sourceLesson||id,index:Number.isInteger(section.sourceLegacyIndex)?section.sourceLegacyIndex:index}:null;
    };
    window.lessonBiasPlaygrounds={...prevBias,
      render(id,index){const s=sourceFor(id,index);return s?prevBias.render(s.id,s.index):'';},
      renderParagraph(id,index,p){const s=sourceFor(id,index);return s?prevBias.renderParagraph(s.id,s.index,p):'';}
    };
  }
  const prevFigures=window.lessonFigures;
  if(prevFigures)window.lessonFigures={...prevFigures,
    placement(l){
      if(l.curriculumKey!=='dl'&&l.curriculumKey!=='cv')return prevFigures.placement(l);
      return l.sections.flatMap(s=>{
        const origin=originals.get(s.sourceLesson);if(!origin)return [];
        return prevFigures.placement(origin).filter(f=>f.section===s.sourceLegacyIndex).map(f=>({...f,section:s.legacyIndex,key:'foundation-figure|'+s.sourceLesson+'|'+f.key}));
      });
    },
    render(l,key,kind){
      if(String(key).startsWith('foundation-figure|')){const rest=String(key).slice('foundation-figure|'.length),i=rest.indexOf('|'),origin=rest.slice(0,i),actual=rest.slice(i+1);return prevFigures.render(originals.get(origin),actual,kind);}
      return prevFigures.render(l,key,kind);
    }
  };
  function resolveRoute(hash){
    const parts=String(hash).replace(/^#/,'').split('/');if(parts[0]!=='lesson'||!parts[2])return null;
    const source=parts[1],candidate=parts[2],target=routes.get(source+'/'+candidate);
    if(target&&(target.lesson!==source||candidate!=='section-'+target.section))return '#lesson/'+target.lesson+'/section-'+target.section;
    const match=new RegExp('^section-'+source+'-s(\\d+)$').exec(candidate);
    if(match){const old=sources.get(source)?.find(s=>s.legacyIndex===Number(match[1])-1),mapped=old&&routes.get(source+'/section-'+old.id);if(mapped&&mapped.lesson!==source)return '#lesson/'+mapped.lesson+'/section-'+mapped.section;}
    return null;
  }
  function renderCatalog(key,items,renderList){
    const allowed=new Set(items.map(l=>l.id)),list=key==='dl'?dlCore.concat(dlElectives):cvCore.concat(cvElectives),stages=phases[key];
    const labels=key==='dl'?['深度学习课程路线','深度学习','先建立模型、损失与更新的直觉，再串起训练和泛化。','从第 1 课开始 →','#lesson/ai-foundations']:['视觉课程路线','计算机视觉','先确定任务与图像表示，再进入 CNN、检测指标和数据实践。','从视觉任务开始 →','#lesson/tasks'];
    const coreCount=list.filter(l=>!l.curriculumOptional).length,electiveCount=list.length-coreCount;
    return '<section class="fc-syllabus"><div class="fc-intro"><span class="chapter-kicker">'+labels[0]+' · '+coreCount+' 节主线 · '+electiveCount+' 节选学</span><h2>'+labels[1]+'：从基础概念到能读懂模型</h2><p>'+labels[2]+'每课围绕一个问题展开；熟悉的内容可以跳读，选学部分可在第一遍先略过。</p><a class="primary" href="'+labels[4]+'">'+labels[3]+'</a><nav aria-label="课程阶段导航">'+stages.map((p,i)=>'<a href="#fc-phase-'+p.id+'">'+(i+1)+' · '+p.title.split('·')[1].trim()+'</a>').join('')+'</nav></div>'+stages.map(p=>{
      const group=p.ids.map(id=>list.find(l=>l.id===id)).filter(l=>allowed.has(l.id));if(!group.length)return '';
      return '<section class="fc-phase'+(p.optional?' is-elective':'')+'" id="fc-phase-'+p.id+'"><div class="fc-phase-title"><h2>'+p.title+'</h2>'+(p.optional?'<span>选学，可先略过</span>':'')+'</div><p>'+p.why+'</p>'+renderList(group)+'<p class="fc-check"><strong>阶段验收：</strong>'+p.check+'</p></section>';
    }).join('')+'</section>';
  }
  function renderContext(l){
    if(!l.curriculumKey)return '';
    const stage=phases[l.curriculumKey].find(p=>p.id===l.curriculumPhase),groupTitle=l.curriculumKey==='dl'?'深度学习':'计算机视觉';
    const count=l.curriculumTotal||0;
    return '<aside class="fc-course-context"><strong>'+groupTitle+' · 第 '+String(l.curriculumNumber).padStart(2,'0')+' / '+count+' 课</strong><span>'+(stage?.title||'')+(l.curriculumOptional?' · 选学':' · 主线')+'</span><p>'+esc(l.curriculumIntro)+'</p><a href="#courses/'+l.curriculumKey+'">查看本组课程顺序 ↗</a></aside>';
  }
  window.visionlabFoundationCurriculum={phases,lessons:[...dlCore,...dlElectives,...cvCore,...cvElectives],resolveRoute,renderCatalog,renderContext,phaseCount:()=>phases.dl.length+phases.cv.length};
})();
