/* 训练基础精读：沿用已有章节索引，将手算、边界条件和代码放回对应概念。 */
(()=>{
  const question=(q,options,answer,why)=>({q,options,answer,why});
  const additions={
    gradient:{
      time:65,desc:'从变化率、链式法则和一次手算更新，到梯度累加、学习率边界与 autograd 排错，逐步理解模型怎样学习。',
      goals:['独立手算一次预测、损失、梯度与参数更新，并用 PyTorch 核对。','区分导数、梯度、反向传播与优化器，判断梯度为零或为 None 的原因。'],
      paragraphs:{
        0:[
          '先把符号的职责分清：x 是已观测的输入，y 是监督标签，ŷ 是模型算出的预测，θ 表示所有可学习参数。一次前向计算中参数暂时固定；求偏导时，把训练数据与其他参数视为固定，只考察某个参数的微小变化。输入和标签通常不由优化器更新，变化的是用于产生预测的参数。',
          '例如同一张图片重复送进网络，若参数、模式和随机状态都相同，计算规则并不会凭空变化。模型之所以在下一轮可能答得更好，是因为上一次反向传播提供了梯度，随后 optimizer.step() 修改了参数。前向、求导和更新是三个不同动作，单独调用 backward() 并不会让权重自动变好。'
        ],
        1:[
          '导数的大小还与单位有关。若把距离从米改成厘米，输入数字扩大 100 倍，参数含义与梯度数值也会改变。因此“梯度是 100，一定太大”没有脱离上下文的判断标准；需要同时看输入尺度、参数尺度、学习率及更新后的损失。标准化输入常能让不同方向的优化更容易协调。',
          '在多参数情形，把所有偏导放在一起得到 ∇L=(∂L/∂θ₁,…,∂L/∂θₘ)。在通常的欧氏距离约定下，它指向当前点最陡的上升方向。更新 Δθ=−η∇L 时，一阶近似给出 ΔL≈∇LᵀΔθ=−η‖∇L‖²；这个式子解释了为什么要减去梯度，也说明结论依赖“步子足够小，局部近似仍有效”。'
        ],
        2:[
          '用中间变量拆开一条路径：z=wx+b，a=f(z)，L=ℓ(a,y)，则 ∂L/∂w=(∂L/∂a)·f′(z)·x。这里 x 来自 z 对 w 的局部导数，f′(z) 来自激活函数，∂L/∂a 来自后面的损失。网络很深时，反向传播仍是在复用这些局部规则，而不是重新为整张网络展开一个庞大公式。',
          '一个值若沿多条支路影响最终损失，需要把所有路径的贡献相加。例如 L=L₁+λL₂，那么 ∂L/∂w=∂L₁/∂w+λ∂L₂/∂w；同一参数在多个位置共享时也遵循这条规则。链式法则中的“沿路径相乘、汇合处相加”能解释残差连接、多任务损失和卷积权重共享中的梯度。'
        ],
        3:[
          '清梯度可以放在本批次前向之前，也可以放在前向之后、backward 之前；关键是每次独立更新开始计算梯度前，不混入上一轮残留。若本轮涉及多个优化器或多个损失，则还要明确哪些参数在什么时候清零、什么时候更新，不能机械地把某个单行顺序套在所有流程上。',
          '每次更新后通常重新执行前向，建立基于新参数的计算图。常规 backward 会释放不再需要的反向中间数据，所以对同一份 loss 连续反向两次可能报错。普通训练不需要每轮 retain_graph=True；盲目保留旧图会增加内存占用，而且旧图对应的也不是一次重新计算的新预测。'
        ]
      },
      sections:[
        {title:'从一个样本手算到参数真的改变',paragraphs:[
          '设输入 x=2、标签 y=5，当前 w=1、b=0。先前向：ŷ=wx+b=2；再计算误差 e=ŷ−y=−3。本例使用标准单样本平方误差 L=(ŷ−y)²，所以 L=9；这里不额外乘 ½，与 PyTorch 的 MSELoss 默认约定一致。',
          '先求 ∂L/∂ŷ=2(ŷ−y)=−6，再沿线性层传回：∂ŷ/∂w=x=2，∂ŷ/∂b=1。因此 ∂L/∂w=−12，∂L/∂b=−6。负号意味着在当前位置稍微增加 w 或 b，会让预测向标签 5 靠近。梯度是对参数变化的敏感度，并不是参数下一步应该被设置成的数值。',
          '学习率取 η=0.05，同时使用旧参数处算出的梯度：w_new=1−0.05×(−12)=1.6，b_new=0−0.05×(−6)=0.3。用新参数重新前向，得到 ŷ_new=1.6×2+0.3=3.5、L_new=(3.5−5)²=2.25。损失从 9 降到 2.25，这才构成一次可以核查的完整更新。',
          '“同时更新”指两个梯度都来自同一组旧参数；不要先改 w，再用改后的 w 重新算 b 的梯度，否则已经换了更新规则。多样本时，一个参数还要兼顾不同样本：某张图的误差减小，不代表整个数据集平均误差都一定减小。'
        ],code:`import torch

w = torch.nn.Parameter(torch.tensor(1.0))
b = torch.nn.Parameter(torch.tensor(0.0))
optimizer = torch.optim.SGD([w, b], lr=0.05)
x, y = torch.tensor(2.0), torch.tensor(5.0)

optimizer.zero_grad(set_to_none=True)
prediction = w * x + b
loss = (prediction - y).square()
loss.backward()
print('before:', prediction.item(), loss.item())  # 2.0, 9.0
print('grad:', w.grad.item(), b.grad.item())       # -12.0, -6.0
optimizer.step()
with torch.no_grad():
    prediction_after = w * x + b
    loss_after = (prediction_after - y).square()
print('after:', w.item(), b.item())  # approximately 1.6, 0.3
print(prediction_after.item(), loss_after.item())  # 3.5, 2.25`,
          codeNote:'可直接运行。浮点表示可能让 1.6 显示为 1.60000002 左右，比较时用适当容差。',
          exercise:question('x=2、y=5、w=1、b=0，L=(ŷ−y)²，η=0.05。一次 SGD 更新后的 w、b 是什么？',['1.6、0.3','−12、−6','0.4、−0.3'],0,'梯度是 −12、−6；参数要减去学习率乘梯度，得到 1.6、0.3。梯度数值与新参数数值不同。')},
        {title:'平均损失、共享参数与梯度相加',paragraphs:[
          '对两个样本使用同一个 w，令 x₁=1、y₁=2，x₂=2、y₂=2，当前 w=0、不使用偏置。各样本损失为 Lᵢ=½(wxᵢ−yᵢ)²，其梯度分别是 −2 与 −4。若总损失取平均 L=(L₁+L₂)/2，总梯度就是 (−2−4)/2=−3；若取和，则是 −6。',
          '这说明 mean 与 sum 不只改变日志显示的数字，也改变传给优化器的梯度尺度。对普通 SGD，在其他条件相同时，把整个损失乘以常数 c 会把梯度与本次梯度更新也乘以 c。对带有自适应缩放、裁剪或额外正则项的流程，不能简单宣布它总与学习率乘 c 完全等价。',
          '还要区分两种“累加”：同一张计算图内，多条路径的梯度相加，是复合函数求导本来就需要的；跨多次 backward() 累加到 .grad，是框架提供的存储行为。前者通常不可省，后者则需要由训练循环决定何时清零与归一化。'
        ],exercise:question('两个样本对共享参数的梯度分别为 −2 和 −4。平均损失对该参数的梯度是多少？',['−3','−6','2'],0,'求平均与求导可交换，因此梯度是 (−2−4)/2=−3；求和损失才得到 −6。')},
        {title:'为什么方向正确，步子仍可能走过头',paragraphs:[
          '用能精确求解的目标 L(w)=½(w−3)² 观察学习率。梯度是 w−3，更新后 w_new=w−η(w−3)。令与最优点的偏差 d=w−3，就有 d_new=(1−η)d。这个式子把“是否靠近最优点”变成了偏差绝对值是否缩小。',
          '在这一个二次函数上，0<η<2 时偏差逐步缩小；0<η<1 时从同一侧接近，1<η<2 时越过最优点来回接近。η=1 可一步到达最优点；η=2 会保持同样偏差幅度来回振荡；η>2 时偏差放大。这个数值范围只属于当前曲率为 1 的函数，不能当作所有神经网络学习率的通用区间。',
          '若目标变成 L(w)=½a(w−3)² 且 a>0，稳定范围会变成 0<η<2/a。曲率越陡，允许的步幅越小；高维损失又可能有的方向很陡、有的方向很平，因而同一个学习率需要兼顾不同方向。动量、输入缩放和自适应优化器都与这个困难有关。',
          '梯度等于 0 只说明当前位置的一阶变化为 0，可能是最低点、最高点或鞍点。某一个参数梯度为 0 也不表示整个模型已经学会任务。判断训练是否有效，需要连同损失变化、验证结果和其他参数的状态一起看。'
        ],exercise:question('仅对 L(w)=½(w−3)²，η=2 且初始 w≠3 时会怎样？',['在最优点两侧等幅振荡','必然一步到最优点','偏差每次缩小一半'],0,'d_new=(1−2)d=−d，所以偏差翻转符号但幅度不变。')},
        {title:'grad 是 None、是零，还是计算图被断开',paragraphs:[
          'nn.Parameter 通常是 requires_grad=True 的叶子张量；完成反向传播后，可在其 .grad 中查看梯度。线性层输出等中间张量通常不是叶子，默认不把自己的梯度长期存到 .grad；如确实要观察，可在反向前调用 retain_grad()。中间张量没有 .grad，不等于梯度没有经过它。',
          'optimizer.zero_grad(set_to_none=True) 后，未收到梯度的参数 .grad 可以仍为 None；收到但数值恰为 0 的梯度则是零张量。None 与 0 对优化器也可能有区别：None 通常使该参数跳过更新，零梯度仍可能让动量或权重衰减产生变化。因此排错时应分别统计缺失梯度、零梯度和非有限梯度。',
          'detach() 会返回与原历史分离的张量；item() 取出普通 Python 数字。用 item() 记录日志很合适，但把这个数字再包装成一个新 torch.tensor，并不能接回原模型的计算图。类似地，在 no_grad() 内算训练损失，会丢掉这部分反向依赖。应先用仍连接模型的 loss.backward() 训练，再把 loss.item() 用于记录。',
          '参数没变化时，可以沿着“参数是否在 optimizer 的参数列表中 → 是否需要梯度 → loss 是否仍连接它 → backward 后 .grad 是否有限 → 是否执行了 step”排查。梯度爆炸时，还要查除零、非法对数和异常输入；只把学习率调小，无法修复计算式里本来就出现的 NaN。'
        ],exercise:question('先用 loss.item() 得到数字，再用 torch.tensor(这个数字, requires_grad=True) 构造新 loss，会怎样？',['新张量不会自动接回原模型的计算图','原模型的梯度会变得更准确','自动恢复所有中间层'],0,'item() 已经取出 Python 数字；新张量是一条新历史，无法据此对原模型参数求导。')}
      ],
      sources:[
        {label:'PyTorch：反向传播与梯度累加',url:'https://docs.pytorch.org/docs/stable/generated/torch.autograd.backward.html'},
        {label:'PyTorch：自动求导机制与梯度模式',url:'https://docs.pytorch.org/docs/stable/notes/autograd.html'},
        {label:'PyTorch：zero_grad 中 None 与零梯度的区别',url:'https://docs.pytorch.org/docs/stable/generated/torch.optim.Optimizer.zero_grad.html'}
      ]
    },
    losses:{
      time:65,desc:'先从标签与原始分数开始，手算 BCE 和交叉熵，再读 PyTorch 输入规则；信息论与梯度细节列为选学。',
      goals:['分清真实标签、模型原始分数、概率和损失之间的关系。','用小数字手算二分类 BCE 与多分类交叉熵。'],
      paragraphs:{
        0:[
          '一次训练通常先为每个样本或每个有效位置计算损失，再按 mean、sum 等规则汇总。所谓“损失是一个数”，多半指汇总后的训练目标；reduction="none" 可以保留每项损失，用于查找难样本、施加掩码或自己定义权重。开始比较两个实验前，先写清楚它们平均的是图片、像素、目标框，还是其他有效位置。',
          '损失也不是预测准确率的另一种单位。两个分类模型都可能全部答对，但一个给正确类 0.51、另一个给 0.99，交叉熵会不同。相反，少数非常自信的错误能显著拉高平均交叉熵，却只改变少量准确率。选择损失是选择训练信号，最终仍要查看符合任务代价的指标。'
        ],
        1:[
          "怎样按任务选择？MSE 对大偏差的惩罚增长更快，因此少数特别大的误差会对总损失和更新信号贡献更多；这种与大多数样本差得很远的点常称为离群点。MAE 的惩罚随误差线性增加，通常较少被离群点牵动，但绝对值在零点有尖点。Huber 在小误差处保留平滑的平方形式，在大误差处改为线性形式，是两种特性的折中。损失值表示偏差代价，斜率则反映误差稍有变化时训练信号怎样变化。",
          "Huber 阈值 δ 要结合目标的数值尺度来设定。例如目标从“米”改成“毫米”，误差数值会放大一千倍，δ 也要重新评估。不同软件接口对 Huber 的缩放可能不同：PyTorch 的 HuberLoss 与 SmoothL1Loss 在阈值不为 1 时不保证数值相等，应根据各自公式理解。",
          "使用代码时还要看 reduction（损失归约方式）。PyTorch 的 MSELoss 默认 mean 会平均输入张量的所有元素；若预测和标签形状为 [B,D]，通常是对 B×D 个误差项取平均，不是只除以图片数 B。像素任务、权重和掩码也会改变有效项及分母；比较实验前先核实输入形状和归约口径。"
        ],
        2:[
          'Softmax 保持 logits 的大小顺序，因此只想得到最大分数类别时，直接对 logits 做 argmax 即可；先做 Softmax 通常不会改变这个类别。需要展示概率、计算熵或采用概率阈值时，才需要相应概率。Softmax 数字位于 0 到 1 之间，并不自动保证“预测 90% 的样本真的有 90% 正确率”，后者属于概率校准问题。'
        ],
        4:[
          '独热标签的熵为 0，描述的是当前训练目标把全部质量放在一个类别上，不代表现实任务本身没有噪声或不确定性。标签可能错，图像可能模糊；标签平滑与软目标则显式允许多个类别拥有非零目标概率。讨论熵时，应先说明 P 指单个样本的监督目标，还是整个数据来源的真实分布。'
        ],
        5:[
          '如果只做一个样本、使用未加权硬标签且没有标签平滑，\\(\\frac{\\partial\\mathcal{L}}{\\partial z_k}=p_k-y_k\\)。对包含 N 个样本的 mean 损失，每个样本的这部分梯度还要除以 N；sum 归约则不除。公式里的“每样本梯度”与框架打印的“整个 batch 梯度”必须使用同一归约条件才会一致。'
        ],
        6:[
          '单标签分类的类别维必须明确。例如 logits 为 [N,C] 时，硬标签通常为 [N] 的 long；像素分类的 logits 为 [N,C,H,W] 时，硬标签为 [N,H,W]。多标签 BCE 则要求目标与 logits 形状一致，通常使用浮点型 0/1 值。类别 ID 只表示类别编号，不能直接当作一个回归数值去要求“类别 2 比类别 1 大一倍”。'
        ],
        7:[
          '在未加权的 K 类互斥分类中，均匀预测的单样本交叉熵是 \\(\\ln K\\)：\\(K=2\\) 时约 \\(0.693\\)，\\(K=10\\) 时约 \\(2.303\\)。它可以作为理解数值尺度的参考，并不是任意随机初始化网络的必然起点，更不是模型合格线。使用类别权重、标签平滑或不同的归约后，还要重新解释基线。'
        ]
      },
      sections:[
        {title:'手算分类误差信号：为什么所有类别都有梯度',paragraphs:[
          '假设三个互斥类别的预测概率是 [0.7,0.2,0.1]，正确类别为索引 1，独热标签为 [0,1,0]。单样本交叉熵是 \\(-\\ln(0.2)\\approx1.609\\)，logits 的梯度向量为 \\([0.7,-0.8,0.1]\\)。正确类得到负梯度，其他类别得到正梯度；若直接对 logits 做一小步梯度下降，就会提高正确类分数并降低错误类分数。',
          '真实网络中，logits 通常是中间结果，优化器实际更新产生它们的权重和偏置。这个三维误差信号还要经过线性层和更前面的计算图；共享参数也会同时影响其他样本。因此不能从 \\(p-y\\) 推出“更新一步后，每个样本正确类概率都必然增加”。',
          '为什么公式里只显式写正确类的 \\(-\\ln p\\)，其他类还会收到信号？因为正确类的 Softmax 分母包含所有类别的 \\exp(z)。把错误类分数抬得更高，会挤占正确类概率。类别之间通过归一化相互联系，反向传播就把这种联系带进了每个 logit 的梯度。'
        ],code:`import torch
import torch.nn.functional as F

# Softmax(log(p)) = p，因为这里 p 已归一化且每项为正。
logits = torch.tensor([[0.7, 0.2, 0.1]]).log().requires_grad_()
target = torch.tensor([1], dtype=torch.long)
loss = F.cross_entropy(logits, target)
loss.backward()
print(loss.item())  # approximately 1.609438
print(logits.grad)  # tensor([[ 0.7000, -0.8000, 0.1000]])`,
          codeNote:'本例只有一个样本、没有类别权重或标签平滑，用于核对 \\(p-y\\)；其他配置应按实际目标函数求导。',
          exercise:question('\\(p=[0.7,0.2,0.1]\\)，正确类索引为 1。未加权单样本交叉熵对 logits 的梯度是什么？',['[0.7,−0.8,0.1]','[0,−0.2,0]','[0.7,0.2,0.1]'],0,'梯度 \\(p-y=[0.7,0.2,0.1]-[0,1,0]\\)；错误类别也会通过 Softmax 归一化影响损失。')},
        {title:'mean、sum 和形状广播：代码能运行也可能算错',paragraphs:[
          '对普通 MSELoss，默认 mean 会平均输出张量的全部元素。例如预测形状为 [4,3]，共有 12 个误差项；默认分母是 12，不只是 batch size=4。对每样本一个类别的、未加权且无忽略标签的交叉熵，mean 通常平均样本；像素分类则涉及有效像素。不能把所有损失的 mean 都解释成“除以图片张数”。',
          '带类别权重的硬标签 CrossEntropyLoss，mean 的分母通常是非忽略位置对应类别权重的总和。若两个样本的未加权交叉熵都为 1、类别权重分别为 1 和 3，加权 mean 为 (1×1+3×1)/(1+3)=1，而不是 2。软概率目标的归约约定又不同，使用前要按文档核对。',
          '一个容易静默出错的例子：预测为 [B,1]，标签误写成 [B]。广播从右对齐后可能形成 [B,B] 的差值，让每个预测与整批标签两两比较。B=2，预测 [[1],[2]]、标签 [1,2] 时，逐样本应完全正确，错误广播却得到平方误差 [[0,1],[1,0]]，平均损失为 0.5。',
          '修复方法是让预测与目标在语义和 shape 上都一致：把标签明确变为 [B,1]，或在确定最后一轴长度为 1 时使用 prediction.squeeze(-1)。直接 squeeze() 可能把 B=1 的批次轴也删掉；排查形状时，既要考虑正常 batch，也要考虑最后一个只剩一个样本的 batch。'
        ],code:`import torch
import torch.nn.functional as F

prediction = torch.tensor([[1.0], [2.0]])  # [B, 1]
target = torch.tensor([1.0, 2.0])          # [B]
wrong_errors = prediction - target        # [B, B]，语义错误
correct_target = target.unsqueeze(-1)     # [B, 1]
print(wrong_errors.square().mean().item())  # 0.5
print(F.mse_loss(prediction, correct_target).item())  # 0.0
print(prediction.squeeze(-1).shape)  # torch.Size([2])`,
          exercise:question('MSE 的 prediction 为 [4,1]、target 为 [4]，广播后的逐项差值可能是什么形状？',['[4,4]','一定是 [4,1]','标量'],0,'从右对齐时 [4,1] 与 [1,4] 扩展成 [4,4]，形成两两比较，通常不符合逐样本回归的意图。')},
        {title:'极端 logits：为什么稳定计算不能靠先算概率',paragraphs:[
          '取 logits=\\(\\mathbf{z}=[1000,999,-1000]\\)，真实类为第三类。直接计算 \\exp(1000) 容易上溢；先做 Softmax 虽能通过减最大值避免上溢，但第三类概率在有限精度中仍可能下溢为 0，接着取 \\(-\\ln 0\\) 会得到无穷大。',
          '稳定的交叉熵直接计算 \\(\\mathcal{L}=\\operatorname{logsumexp}(\\mathbf{z})-z_y\\)。令 \\(m=\\max_j z_j=1000\\)，有 \\[\\operatorname{logsumexp}(\\mathbf{z})=m+\\ln\\left(\\sum_j\\exp(z_j-m)\\right)\\approx1000+\\ln(1+e^{-1})\\approx1000.3133\\]因此，该样本的损失约为 \\(2000.3133\\)。这个结果很大但有限，不需要先把极小概率存成浮点数。',
          '这也是训练时把原始 logits 交给 CrossEntropyLoss 的原因之一。人为先做 Softmax 再传入该函数，会让它把概率当作另一组 logits 再做归一化，改变训练目标。随意给概率加 epsilon 虽可改变无穷大的表现，也会改变梯度和数值意义，不能替代稳定的损失接口。',
          '若稳定接口仍产生 NaN，继续查看原始 logits 与输入是否已含 NaN/Inf，标签是否合法，以及混合精度前后哪些运算出现异常。稳定算法能处理有限输入的较大相对差异，不能自动修复上游已经无效的数据。'
        ],code:`import torch
import torch.nn.functional as F

logits = torch.tensor([[1000.0, 999.0, -1000.0]])
target = torch.tensor([2])
stable_loss = F.cross_entropy(logits, target)
formula = torch.logsumexp(logits, dim=1) - logits[:, 2]
probability = logits.softmax(dim=1)[0, 2]
print(stable_loss.item())     # approximately 2000.3133
print(formula.item())         # approximately 2000.3133
print(probability.item())     # float32 中通常下溢为 0.0`,
          exercise:question('真实类概率在 float32 中下溢为 0，但输入 logits 仍有限，应怎样计算训练用的交叉熵？',['把原始 logits 交给稳定的 CrossEntropyLoss','先把概率四舍五入再取对数','把正确类标签改成预测类'],0,'内部使用 log-softmax / log-sum-exp，避免必须先显式表示极小概率；仍要排查上游是否有非有限值。')}
      ],
      sources:[
        {label:'PyTorch：CrossEntropyLoss 的形状、权重与归约',url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html'},
        {label:'PyTorch：MSELoss 的元素平均规则',url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.MSELoss.html'},
        {label:'PyTorch：HuberLoss 的阈值与分段定义',url:'https://docs.pytorch.org/docs/stable/generated/torch.nn.HuberLoss.html'},
        {label:'PyTorch：稳定的 logsumexp',url:'https://docs.pytorch.org/docs/stable/generated/torch.logsumexp.html'}
      ]
    },
    optimizer:{
      time:55,desc:'手算 SGD、动量与 Adam，理解 AdamW、权重衰减、实际更新步数和学习率调度的联系。',
      goals:['手算 SGD、动量与 Adam 的一次更新，解释状态变量。','根据更新步数、参数尺度和验证结果安排学习率与权重衰减。'],
      paragraphs:{
        0:[
          '优化器持有的是一组具体参数对象。创建 optimizer 后，如果重新创建了模型却继续用旧 optimizer，更新的可能仍是旧模型参数。训练某些子模块时，也要确认 optimizer 中确实包含这些子模块的参数。打印 loss 正常、backward 正常，却看不到当前模型变化时，这个对象关系值得优先检查。',
          '超参数与训练参数的角色也不同：权重和偏置由梯度更新；学习率、动量系数等通常由人或调度策略设置。Adam 的“自适应”主要指根据历史梯度为不同参数分量调整更新尺度，并不意味着学习率这个超参数已经不需要选择。'
        ],
        1:[
          '对普通 SGD，单个参数的梯度更新幅度是 |Δθ|=η|g|。若 θ=0.01、g=2、η=0.1，则本次变化幅度 0.2，达到原参数幅度的 20 倍。单看 η=0.1 不能判断是否合适；观察实际更新幅度相对参数幅度的比例，常比孤立看学习率或梯度范数更有解释力。',
          'Warmup 的意图是让训练初期逐渐进入目标步幅，后期衰减则让更新更精细。它们不能保证避免发散，也不能修复错误标签。调度器的 step 调用频率必须与配置的总步数一致；以 optimizer update 为单位的 warmup，不应被误用成 DataLoader 每取一次小批次都推进一步。'
        ],
        2:[
          '把训练集固定为 N 个样本，batch 从 B 增到 2B 后，每轮的更新次数通常约减半。即便 epoch 数一样，优化器走过的次数、调度器的进度和累计衰减也可能不同。因此公平比较需要同时记录样本暴露量、更新数和学习率曲线，不能只记录“都训练了 100 轮”。'
        ],
        3:[
          '可以先固定一个小子集和随机种子，排除数据读取与标签问题，再运行一段短训练比较学习率数量级。确认能稳定降低训练目标后，再检查验证曲线与具体错误样本。短实验用来筛掉明显失败的设置，最终结论仍应在约定的数据划分与训练预算下确认。'
        ]
      },
      sections:[
        {title:'动量不是新的梯度，而是更新方向的历史状态',paragraphs:[
          '用一种常见的、无 dampening 的动量约定：v_t=βv_(t−1)+g_t，θ_t=θ_(t−1)−ηv_t，初始 v₀=0。g_t 是本轮从数据算出的梯度，v_t 是优化器保存的历史状态，β 决定过去方向保留多少。不同教材可能在梯度前再乘 (1−β)，比较公式时要连学习率约定一起核对。',
          '假设只是演示一个给定的梯度序列，θ₀=1、η=0.1、β=0.9。第一步 g₁=2，v₁=2，θ₁=0.8；第二步 g₂=−1，v₂=0.9×2−1=0.8，θ₂=0.72。虽然最新梯度翻成负数，历史动量仍为正，参数会继续向减小方向走。',
          '若普通 SGD 接收相同的给定序列，第二步会从 0.8 增到 0.9。这个对照用于解释更新规则；在真实目标上，两种优化器的参数轨迹不同，后续梯度通常也会不同，不能强行认为它们始终看到完全一样的 g_t。',
          '动量可能减少狭长谷底中的摆动，也可能在方向变化后继续冲过头。中断恢复训练时，丢掉动量缓冲就改变了接下来如何更新，这解释了为什么恢复训练通常还要加载 optimizer.state_dict()。'
        ],exercise:question('按 v_t=0.9v_(t−1)+g_t，v₁=2、g₂=−1 时，v₂ 是多少？',['0.8','−1','2.9'],0,'v₂=0.9×2−1=0.8。历史状态能让当前更新方向与最新梯度的符号不同。')},
        {title:'Adam 的两个统计量与偏差修正',paragraphs:[
          'Adam 保存一阶矩估计 m_t=β₁m_(t−1)+(1−β₁)g_t，以及二阶原始矩估计 v_t=β₂v_(t−1)+(1−β₂)g_t²；平方按参数分量分别计算。m 可以看作平滑后的方向，v 记录梯度平方的近期尺度；v 不是减去均值后的统计方差，不能直接把它叫成严格意义的方差。',
          '由于 m₀=v₀=0，刚开始的移动统计量偏向 0。Adam 通过 m_hat=m_t/(1−β₁ᵗ)、v_hat=v_t/(1−β₂ᵗ) 做偏差修正，再按 θ←θ−ηm_hat/(√v_hat+ε) 更新。ε 是稳定项；具体数值精度、融合实现和选项会影响细节，阅读框架接口时要说明采用哪种配置。',
          '取第一步 g=2、β₁=0.9、β₂=0.999，得到 m=0.2、v=0.004；修正后 m_hat=2、v_hat=4。若 η=0.1，且暂忽略极小的 ε，梯度更新幅度约为 0.1×2/2=0.1。普通 SGD 在同样 g 和 η 下更新幅度为 0.2，这说明相同的学习率数字并不表示两种优化器迈出相同的步子。',
          '一阶矩、二阶矩和步数都是优化器状态。只加载模型权重、重新初始化 Adam，下一步的修正因子与缩放都会与原训练不同。是否值得恢复这些状态取决于目标：接着续训与重新做一次微调，并不是同一件事。'
        ],code:`import torch

parameter = torch.nn.Parameter(torch.tensor(1.0))
optimizer = torch.optim.Adam(
    [parameter], lr=0.1, betas=(0.9, 0.999), eps=1e-8,
    weight_decay=0.0
)
# 人工提供一个梯度，只为隔离观察更新规则；真实训练用 loss.backward()。
parameter.grad = torch.tensor(2.0)
optimizer.step()
state = optimizer.state[parameter]
print(parameter.item())            # approximately 0.9
print(state['exp_avg'].item())     # approximately 0.2
print(state['exp_avg_sq'].item())  # approximately 0.004`,
          exercise:question('Adam 的 v_t 主要累计什么？',['逐分量梯度平方的指数移动平均','验证集准确率的平方','参数名称的长度'],0,'v_t 使用 g_t²，是二阶原始矩估计；没有减去均值，不能直接等同于严格统计方差。')},
        {title:'权重衰减、L2 惩罚和 AdamW 的边界',paragraphs:[
          '给目标加上 (λ/2)‖θ‖²，会在梯度中增加 λθ。对没有动量、没有自适应缩放的普通 SGD，更新变为 θ_new=θ−η(g+λθ)=(1−ηλ)θ−ηg，因此这种 L2 惩罚与一次直接的乘法收缩可对应起来。写了 λ‖θ‖² 而没有 ½ 时，导数则是 2λθ，系数约定必须一致。',
          '如果把 λθ 先混进 Adam 的梯度，再一起更新一阶与二阶统计量，惩罚会经过自适应缩放；它一般不等同于直接按 (1−ηλ) 收缩参数。AdamW 把这份衰减从梯度统计中解耦，常用形式可理解为先进行相应参数收缩，再执行 Adam 的梯度更新。',
          '相同 weight_decay 数字跨优化器、学习率计划和更新次数时未必有相同效果。若先忽略梯度，固定 η、λ 连续 T 步后的收缩因子为 (1−ηλ)^T；这解释了为什么改变每轮更新次数也可能改变累计衰减。真实训练还同时受到数据梯度与调度器影响。',
          '有些训练方案对 bias、归一化层参数不施加衰减，使用不同参数组实现；这是一种具体实验策略，不是框架自动保证的普遍规则。阅读优化器配置时，要确认哪些参数在哪个组、各组的学习率与衰减是多少，尤其避免对同一参数无意重复加入惩罚。'
        ],exercise:question('为什么 Adam 中把 L2 项混入梯度，一般不能直接等同于 AdamW 的权重衰减？',['L2 项会进入一阶与二阶统计量并被自适应缩放','AdamW 不使用任何梯度','二者只在文件名上不同'],0,'AdamW 将衰减与梯度统计分开；把 λθ 加入 Adam 梯度则会改变统计量和缩放。')},
        {title:'按优化器实际更新次数安排调度与裁剪',paragraphs:[
          '假设每轮读取 100 个小批次，每累计 4 批才更新一次，则通常只有 25 次 optimizer.step()。若调度器设计成 1,000 次优化器更新完成一个周期，却每读取一批就 step 一次，它会快进四倍。先明确 scheduler 的时间单位，再确定调用位置；按 epoch 更新与按 optimizer update 更新是两种不同约定。',
          '梯度裁剪通常在 backward 之后、optimizer.step() 之前进行。范数裁剪限制整个梯度向量的范数，可能等比例缩小梯度；它不等于把每个分量都截到同一个区间。使用 AMP 的 GradScaler 时，通常先 unscale_ 再裁剪，以免把“缩放后的梯度”当成真实梯度。',
          '裁剪能约束某次有限但过大的梯度，不能自动修复 NaN 的计算图。若梯度中已有非有限数值，应追查异常来源；AMP 还可能因溢出跳过本次优化器更新，因此严格按更新数推进调度时，也需要考虑是否真的发生了更新。',
          '诊断时可把当前学习率、梯度范数、是否发生更新、训练损失和验证指标放到同一条时间线上。仅凭“换 Adam 后 loss 降得更快”，无法判断训练预算是否一致，也无法判断最终任务表现是否更好。'
        ],exercise:question('每轮有 100 个小批次，每 4 批更新一次；一个按更新步数设计的调度器通常应推进多少步？',['25 步','100 步','400 步'],0,'在没有跳过更新、每组四批的前提下，一轮实际进行 100/4=25 次 optimizer.step()。')}
      ],
      sources:[
        {label:'PyTorch：SGD 与动量约定',url:'https://docs.pytorch.org/docs/stable/generated/torch.optim.SGD.html'},
        {label:'PyTorch：Adam 的状态与偏差修正',url:'https://docs.pytorch.org/docs/stable/generated/torch.optim.Adam.html'},
        {label:'PyTorch：AdamW 的解耦权重衰减',url:'https://docs.pytorch.org/docs/stable/generated/torch.optim.AdamW.html'},
        {label:'PyTorch：AMP 中的累积与梯度裁剪',url:'https://docs.pytorch.org/docs/stable/notes/amp_examples.html'}
      ]
    },
    training:{
      time:80,desc:'连通数据划分、训练验证与检查点，再深入尾批损失统计、梯度累积缩放和训练故障定位。',
      goals:['正确统计含尾批的平均损失，区分读取批次与实际更新。','解释训练与验证曲线的可比条件，按实际样本数缩放梯度累积。'],
      paragraphs:{
        0:[
          '分组划分的依据是“哪些样本可能共享容易被记住的信息”。同一段视频的相邻帧、同一对象的连拍、同一拍摄批次中的背景，往往高度相关。先按组隔离，再在组层面考虑类别比例，通常比随机打散所有图片更接近模型遇到新场景时的评估。',
          '数据驱动的预处理也可能泄漏。例如用全部数据估计归一化均值、选择特征或清洗阈值，再划分验证集，已经让验证信息参与了训练流程设计。应在训练部分拟合这些统计量，并将得到的变换应用到验证与测试部分。预先约定、与当前评估数据无关的固定归一化配置则是另一种情形。'
        ],
        2:[
          '训练模式、梯度记录、参数是否可训练，是三个独立开关。model.eval() 改变 Dropout、BatchNorm 等层的行为；no_grad() 控制是否记录运算历史；requires_grad=False 控制指定参数是否参与求导。冻结参数后，模型若仍处在 train 模式，BatchNorm 的运行统计量仍可能变化，不能把“权重被冻结”直接当成“所有状态都固定”。',
          '做完验证后，下一轮训练开始前应重新调用 model.train()。否则后续虽然仍能 backward 和更新参数，Dropout、BatchNorm 却继续按评估行为工作。验证函数最好明确自己的进入与退出约定，让训练循环在每轮开始时设置训练模式，而不是依赖上一段代码碰巧留下的状态。'
        ],
        3:[
          '训练日志和验证日志经常并非完全同一口径：训练损失是在参数持续变化、训练增强开启的过程中逐批统计；验证损失通常用本轮结束时的固定参数、eval 模式与确定性预处理统计。Dropout、随机裁剪等会让训练任务更难，所以验证损失低于训练损失也可能正常，不能仅凭两条曲线的位置判断泄漏或实现错误。',
          '若要更可比，可选一个固定训练子集，在同一个 checkpoint、同样的 eval 模式和确定性变换下额外评估，再与验证集比较。先统一损失定义、归约和样本权重；观察连续若干轮的趋势，并对代表性错误样本做复查，才更容易区分优化失败、过拟合与统计口径差异。'
        ],
        4:[
          '把循环拆成三个时钟来读：DataLoader 决定读了多少批，optimizer.step() 决定参数更新多少次，epoch 决定完成多少轮数据遍历。梯度累积会使前两个时钟不再一一对应；调度器、日志和 checkpoint 中的 global_step 应明确记录哪一种时钟。'
        ]
      },
      sections:[
        {title:'尾批与平均损失：每个样本应占多大权重',paragraphs:[
          '设两批数据分别有 4 个样本和 1 个样本，批次平均损失分别为 1 和 5。把批次均值再平均，得到 (1+5)/2=3，相当于让最后一个样本与前四个样本拥有相同总权重。若想统计五个样本的等权平均，应计算 (4×1+1×5)/5=1.8。',
          '对于“每样本一个、未加权且无忽略项的分类损失”，可以累加 batch_mean×batch_size，最后除以总样本数。更直接的方式是用 reduction="none" 得到每个样本损失，累加损失总和并统计真实样本数。准确率也应累加正确个数与样本个数，而不是随意平均各批准确率。',
          '这个配方有适用条件。像素掩码、ignore_index、不同类别权重、每张图不同数量目标框等场景，损失的分母未必是图像数，应累计对应的有效位置数或权重和。检测损失还可能包含各尺度和分项缩放，不能直接把任意 loss.item() 乘 batch size 后宣称就是严格的数据集平均损失。',
          '日志统计不需要保留计算图。累加 loss.item() 或 loss.detach() 后的数值适合记录；长期保存每一步仍连接计算图的输出张量可能占用额外内存。用于 backward 的 loss 保持可求导，用于图表的历史记录保存普通数值，两者职责不同。'
        ],code:`# 纯 Python 示例：两批的大小不同，不能直接平均批次均值。
batch_sizes = [4, 1]
batch_mean_losses = [1.0, 5.0]
sample_mean = sum(n * loss for n, loss in zip(
    batch_sizes, batch_mean_losses
)) / sum(batch_sizes)
print(sample_mean)  # 1.8
print(sum(batch_mean_losses) / len(batch_mean_losses))  # 3.0，口径不同`,
          exercise:question('两批样本数为 4 和 1，平均损失为 1 和 5。五个样本的等权平均损失是多少？',['1.8','3','6'],0,'必须按样本数加权：(4×1+1×5)/5=1.8，而不是对两个批次均值直接平均。')},
        {title:'梯度累积的最后一组，不能忘记实际样本数',paragraphs:[
          '假设有 101 个样本，micro-batch size=8，保留尾批，则一轮有 13 个小批次。每 4 个小批次更新一次，并在最后刷新未满的一组，得到 4 次更新；各更新组分别包含 32、32、32、5 个样本。最后一组既不是 4 个小批次，也不是 32 个样本。',
          '对按样本可加、每样本等权的目标，设一个累积组总共有 S 个样本，组内第 j 个小批次有 n_j 个样本、平均损失为 L_j。应反向传播 Σ(n_j/S)L_j。只有各小批次等大且本组恰有 K 个小批次时，才可简化为每次 loss/K。尾组只有一个小批次却仍除以固定 K，会把它的梯度人为缩小。',
          '累积组内部先统一清梯度，各小批次分别前向与 backward，在整组结束后只 step 一次。每个小批次都能释放自己的反向图，不需要为了累积而 retain_graph=True。下面例子刻意使用可按样本分解的线性回归，并按每组真实样本数归一化。',
          '即使梯度归约正确，梯度累积也不总等同于一次真正的大 batch：BatchNorm 可能按各小批次分别统计，Dropout 等随机操作的实现细节也可能不同。对比时应说明这些条件；多设备训练还要核对跨设备的平均规则。本节代码展示单进程、无 AMP 的基本机制。'
        ],code:`import torch

x = torch.arange(1.0, 102.0).unsqueeze(1) / 100  # [101, 1]
y = 2 * x + 1
model = torch.nn.Linear(1, 1)
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
micro_size, micro_per_update = 8, 4
group_size = micro_size * micro_per_update
updates = 0

for start in range(0, len(x), group_size):
    end = min(start + group_size, len(x))
    samples_in_group = end - start
    optimizer.zero_grad(set_to_none=True)
    for offset in range(start, end, micro_size):
        stop = min(offset + micro_size, end)
        prediction = model(x[offset:stop])
        # 每样本只有一个输出，因此这些误差项恰好按样本相加。
        loss_sum = (prediction - y[offset:stop]).square().sum()
        (loss_sum / samples_in_group).backward()
    optimizer.step()
    updates += 1
print(updates)  # 4；最后一组的分母是 5，而不是固定的 32`,
          exercise:question('101 个样本，micro-batch=8，每 4 批更新并刷新尾组。一轮更新多少次，最后一组多少个样本？',['4 次，最后 5 个样本','13 次，最后 8 个样本','3 次，最后 32 个样本'],0,'13 个小批次组成 4、4、4、1 批的四组，样本量分别为 32、32、32、5。')},
        {title:'训练失败时，按信号逐层定位',paragraphs:[
          '第一层先检查“学的是什么”：抽几张原图和标签一起显示，核对类别顺序、坐标单位、输入通道与增强后的对应关系。不要只看张量 shape；一张红蓝通道对调或框标签错位的图片，也完全可能拥有正确尺寸。',
          '第二层检查“是否真的发生更新”：用固定的小子集暂时减少随机增强，观察 loss、参数梯度和更新前后的参数差异。若 loss 没有连接参数、梯度为 None、学习率为 0、optimizer 引用了旧模型，增加 epoch 通常不会解决问题。小样本拟合失败也可能受模型容量或任务矛盾影响，需要结合数据判断。',
          '第三层检查“学到的能否迁移”：若训练子集可以拟合，独立验证仍差，继续按场景、目标大小与类别拆分错误。低光环境失败提示需要检查该条件的数据覆盖；置信度过高但错误多，要看校准与阈值；漏检小目标，要核查目标像素、缩放和定位，而不只是更换优化器。',
          '最后把判断写成能复查的实验记录：代码与数据版本、划分清单、随机种子、输出和标签约定、有效 batch、实际更新数、学习率计划、选 checkpoint 的指标，以及若干成功和失败样例。每次改动围绕一个明确假设，并保留原基线，下一次看到曲线变化时才能解释原因。'
        ],exercise:question('训练集小子集都学不会，且某些参数 .grad 始终为 None，优先检查什么？',['参数与损失的连接、requires_grad 和优化器参数列表','立刻把 epoch 增加十倍','先发布最高的验证分数'],0,'先确认梯度路径和更新对象存在，再分析容量、数据和优化设置；扩大训练时长不能接回断开的计算图。')}
      ],
      sources:[
        {label:'PyTorch：训练、验证与优化循环',url:'https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html'},
        {label:'PyTorch：梯度模式与评估模式的区别',url:'https://docs.pytorch.org/docs/stable/notes/autograd.html'},
        {label:'PyTorch：梯度累积及混合精度条件',url:'https://docs.pytorch.org/docs/stable/notes/amp_examples.html'}
      ]
    }
  };

  for(const [id,content] of Object.entries(additions)){
    const lesson=lessons.find(item=>item.id===id);
    if(!lesson)throw new Error('Missing lesson for detailed notes: '+id);
    for(const [index,paragraphs] of Object.entries(content.paragraphs)){
      lesson.sections[Number(index)].paragraphs.push(...paragraphs);
    }
    for(const section of content.sections){
      lesson.sections.push({...section,title:(lesson.sections.length+1)+'. '+section.title});
    }
    if(id==='training')lesson.sections[3].paragraphs[0]='训练损失与验证损失同时下降，与训练目标改善并且验证集也受益的情形相符，但还需要查看任务指标和具体预测。训练损失继续下降而验证损失上升，是常见过拟合迹象；两条曲线都高且变化小，则可能是学习率不合适、模型容量有限、标签错误或输入处理不当。任何一种曲线形状都只是排查线索，不能单凭它确定唯一原因。';
    lesson.time=content.time;
    lesson.desc=content.desc;
    lesson.goals.push(...content.goals);
    const sources=[...(lesson.sources||[]),...(lesson.source?[{label:'本章原有参考文档',url:lesson.source}]:[]),...content.sources];
    lesson.sources=Array.from(new Map(sources.map(source=>[source.url,source])).values());
  }
})();
