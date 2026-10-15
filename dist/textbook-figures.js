/* 每章的知识图解：用可缩放 SVG 将正文中的抽象概念转成可观察的关系。 */
(()=>{
  const colors={ink:'#263342',muted:'#687687',line:'#d9d7d0',paper:'#fffefa',purple:'#6656a5',purpleSoft:'#eeeaf7',blue:'#427a9b',blueSoft:'#e8f1f5',green:'#3d826a',greenSoft:'#e8f1eb',orange:'#c17a45',orangeSoft:'#f7eee5',red:'#b85f58',redSoft:'#f7e9e6',slate:'#9aa4ad',slateSoft:'#eef0f1'};
  const esc=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const rect=(x,y,w,h,fill='none',stroke=colors.line,rx=8,sw=1.4)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
  const line=(x1,y1,x2,y2,stroke=colors.line,sw=2,dash='')=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+stroke+'" stroke-width="'+sw+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
  const circle=(cx,cy,r,fill,stroke='none',sw=1)=>'<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
  const text=(x,y,value,size=16,fill=colors.ink,weight=500,anchor='middle')=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" font-size="'+size+'" font-weight="'+weight+'" fill="'+fill+'">'+esc(value)+'</text>';
  function arrow(x1,y1,x2,y2,color=colors.slate,sw=2){const a=Math.atan2(y2-y1,x2-x1),len=8,spread=.55,ax=x2-len*Math.cos(a-spread),ay=y2-len*Math.sin(a-spread),bx=x2-len*Math.cos(a+spread),by=y2-len*Math.sin(a+spread);return line(x1,y1,x2,y2,color,sw)+ '<path d="M'+ax.toFixed(1)+' '+ay.toFixed(1)+' L'+x2+' '+y2+' L'+bx.toFixed(1)+' '+by.toFixed(1)+'" fill="none" stroke="'+color+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>'}
  const tag=(x,y,w,label,fill,color)=>rect(x,y,w,28,fill,'none',14,0)+text(x+w/2,y+19,label,13,color,650);
  const cell=(x,y,w,h,label,fill,color=colors.ink)=>rect(x,y,w,h,fill,'#ffffff',3,1)+text(x+w/2,y+h/2+5,label,14,color,650);

  const figures={
    'neuron-intro':{concept:'从输入到节点输出',section:0,paragraph:0,title:'输入经过权重、求和与激活后得到输出',description:'三个数值输入沿带有权重的连接进入同一节点，节点加权求和并加上偏置，再经激活函数产生输出。',caption:'每条连接的权重会影响节点输出；层层重复这种计算，就组成了神经网络。',draw:()=>{
      let s='';
      s+=text(86,43,'输入数值',14,colors.muted,600)+text(304,43,'加权求和 + 偏置',14,colors.muted,600)+text(480,43,'激活函数',14,colors.muted,600)+text(654,43,'输出',14,colors.muted,600);
      [[91,90,'x₁'],[91,150,'x₂'],[91,210,'x₃']].forEach((n,i)=>s+=circle(n[0],n[1],20,colors.blueSoft,colors.blue,1.7)+text(n[0],n[1]+5,n[2],15,colors.blue,700));
      s+=arrow(112,90,242,132,colors.slate,1.8)+text(176,99,'w₁',13,colors.orange,700);
      s+=arrow(112,150,242,150,colors.slate,1.8)+text(177,140,'w₂',13,colors.orange,700);
      s+=arrow(112,210,242,168,colors.slate,1.8)+text(176,202,'w₃',13,colors.orange,700);
      s+=rect(244,105,120,90,colors.purpleSoft,'none',9,0)+text(304,140,'Σ wᵢxᵢ + b',17,colors.purple,700)+text(304,166,'加权组合',12,colors.muted,550);
      s+=arrow(366,150,413,150,colors.slate,2);
      s+=rect(420,108,120,84,colors.orangeSoft,'none',9,0)+text(480,143,'ReLU',18,colors.orange,700)+text(480,166,'非线性变换',12,colors.muted,550);
      s+=arrow(542,150,612,150,colors.slate,2);
      s+=circle(650,150,27,colors.greenSoft,colors.green,2)+text(650,156,'y',20,colors.green,700);
      s+=text(380,259,'y = ReLU(w₁x₁ + w₂x₂ + w₃x₃ + b)',16,colors.ink,650);
      return s;
    }},
    tensor:{concept:'张量的四条轴',section:0,paragraph:1,title:'图像批次张量的 N、C、H、W 轴',description:'从八张 RGB 图像开始：N 表示批次中的图像数，C 表示颜色通道，H 和 W 分别表示像素行与列。右侧的形状 [8,3,224,224] 与四条轴一一对应。',caption:'读形状时逐轴命名：[8, 3, 224, 224] 表示 8 张 RGB 图像，每张高和宽均为 224 像素。',draw:()=>{
      let s='';
      s+=text(115,42,'一批图像',16,colors.muted,600)+text(380,42,'每张图像',16,colors.muted,600)+text(647,42,'张量形状',16,colors.muted,600);
      for(let i=0;i<4;i++)s+=rect(46+i*13,77-i*5,86,86,i===0?colors.blueSoft:colors.paper,colors.blue,5,1.6);
      s+=text(88,188,'N = 8',19,colors.blue,700)+text(88,212,'批次大小',13,colors.muted,500);
      s+=arrow(151,122,205,122,colors.slate,2)+text(178,108,'取一张',12,colors.muted,500);
      for(let i=0;i<3;i++)s+=rect(218+i*22,81+i*7,82,76,[colors.redSoft,colors.greenSoft,colors.blueSoft][i],[colors.red,colors.green,colors.blue][i],5,1.6)+text(259+i*22,125,['R','G','B'][i],19,[colors.red,colors.green,colors.blue][i],700);
      s+=text(267,188,'C = 3',19,colors.purple,700)+text(267,212,'颜色通道',13,colors.muted,500);
      s+=arrow(334,122,396,122,colors.slate,2);
      for(let y=0;y<4;y++)for(let x=0;x<5;x++)s+=rect(414+x*18,80+y*18,17,17,(x+y)%2?colors.blueSoft:colors.purpleSoft,'#ffffff',1,0);
      s+=text(454,188,'H = 224 行',17,colors.ink,650)+text(454,211,'W = 224 列',17,colors.ink,650);
      s+=arrow(518,122,565,122,colors.slate,2)+rect(578,83,146,79,colors.purpleSoft,'none',7,0)+text(651,117,'[8, 3, 224, 224]',15,colors.purple,700)+text(651,143,'N × C × H × W',13,colors.muted,600);
      s+=line(47,246,721,246,colors.line,1)+text(383,275,'轴名说明“每个数字属于哪一组”，不只是记号。',15,colors.muted,500);
      return s;
    }},
    gradient:{concept:'损失、梯度与更新方向',section:1,paragraph:1,title:'梯度下降沿负梯度更新参数',description:'U 形损失曲线上，当前位置的梯度指向损失增大的方向。梯度下降沿相反方向更新参数，学习率决定每次移动的距离。',caption:'局部梯度只描述当前位置的斜率；学习率过大可能跨过谷底，过小则会让优化变慢。',draw:()=>{
      let s=rect(30,25,700,238,colors.paper,colors.line,8,1);s+=line(88,220,682,220,colors.slate,1.5)+line(88,220,88,54,colors.slate,1.5)+text(686,226,'参数 w',13,colors.muted,500,'end')+text(76,52,'损失 L',13,colors.muted,500,'end');
      s+='<path d="M116 75 C195 105 246 198 371 205 C501 210 562 107 651 74" fill="none" stroke="'+colors.purple+'" stroke-width="4" stroke-linecap="round"/>';
      [[194,124,'w₀'],[292,183,'w₁'],[376,204,'w₂']].forEach((p,i)=>{s+=circle(p[0],p[1],8,[colors.orange,colors.blue,colors.green][i],'#fff',2)+text(p[0],p[1]-17,p[2],15,[colors.orange,colors.blue,colors.green][i],700)});
      s+=arrow(210,136,271,170,colors.blue,2.5)+arrow(306,188,357,201,colors.green,2.5)+text(237,151,'−η∂L/∂w',13,colors.blue,650)+text(533,72,'损失曲线',14,colors.purple,650);
      s+=tag(109,235,184,'当前位置的梯度决定方向',colors.orangeSoft,colors.orange)+tag(466,235,207,'η 决定每一步的幅度',colors.blueSoft,colors.blue);return s;
    }},
    network:{concept:'神经网络如何组合特征',section:0,paragraph:1,title:'输入经过多层神经元得到任务输出',description:'输入特征先经线性层与激活函数组合成隐藏表示，再映射到输出。输出形式取决于任务，例如分类 logits 或连续数值。',caption:'每层做一次“加权组合与非线性变换”；层数增加并不自动保证模型更好。',draw:()=>{
      let s='';s+=text(77,42,'输入特征',14,colors.muted,600)+text(278,42,'隐藏表示',14,colors.muted,600)+text(625,42,'任务输出',14,colors.muted,600);
      const xs=[105,285,455,625],ys=[[83,126,169,212],[98,145,192],[108,158,208],[126,182]];
      for(let k=0;k<xs.length-1;k++)for(const y of ys[k])for(const z of ys[k+1])s+=line(xs[k]+14,y,xs[k+1]-14,z,k===1?colors.purple+'55':colors.slate+'65',1);
      ys.forEach((list,k)=>list.forEach((y,i)=>s+=circle(xs[k],y,13,[colors.blue,colors.purple,colors.purple,colors.green][k],colors.paper,2)+text(xs[k],y+5,k===0?'x'+(i+1):k===3?'ŷ'+(i+1):'',12,colors.paper,700)));
      s+=text(370,250,'线性变换  →  激活函数  →  组合成更有用的表示',15,colors.ink,600)+text(625,231,'类别分数 / 数值',12,colors.muted,500);return s;
    }},
    training:{concept:'训练、验证与测试的分工',section:0,paragraph:1,title:'数据分区在模型训练中的不同职责',description:'训练集用于计算梯度与更新参数，验证集用于比较设置和选择检查点，测试集保留到最后作独立评估。',caption:'验证集参与模型选择，因此不能反复把测试集当作调参反馈。',draw:()=>{
      let s='';const xs=[42,285,528],cs=[colors.blue,colors.purple,colors.green],soft=[colors.blueSoft,colors.purpleSoft,colors.greenSoft],names=['训练集','验证集','测试集'],notes=['更新参数','选设置与检查点','最终独立评估'],sizes=['约 70%','约 15%','约 15%'];
      for(let i=0;i<3;i++){s+=rect(xs[i],63,190,133,soft[i],'none',9,0)+text(xs[i]+95,93,names[i],20,cs[i],700)+text(xs[i]+95,122,notes[i],14,colors.ink,600);for(let j=0;j<4;j++)s+=rect(xs[i]+24+j*35,144,25,25,i===0?colors.blue:colors.paper,cs[i],4,1.2);s+=text(xs[i]+95,221,sizes[i]+' 示例，仅作参考',13,colors.muted,500)}
      s+=arrow(237,130,272,130,colors.slate)+arrow(480,130,515,130,colors.slate)+text(380,267,'最后只在固定测试集上报告一次，避免“看答案再调模型”。',15,colors.ink,600);return s;
    }},
    image:{concept:'像素、通道与数值范围',section:0,paragraph:1,title:'彩色图像从像素数组变为模型张量',description:'同一张 RGB 图像可按 HWC 或 CHW 组织；读取、转换通道、重排维度、归一化和增加批次维度构成常见输入流程。',caption:'OpenCV 常以 BGR 顺序读图；进入模型前要按训练配置核对通道、形状与数值范围。',draw:()=>{
      let s=text(110,40,'像素网格',15,colors.muted,600);for(let y=0;y<4;y++)for(let x=0;x<4;x++)s+=rect(48+x*29,64+y*29,27,27,['#e9bfa7','#96b99e','#91aec0','#ded49c'][(x+y)%4],'#fff',2,1);
      s+=text(109,206,'H × W × C',17,colors.blue,700)+arrow(185,132,244,132,colors.slate);
      s+=rect(254,78,124,105,colors.orangeSoft,'none',8,0)+text(316,111,'颜色顺序',16,colors.orange,700)+text(316,139,'BGR → RGB',15,colors.ink,600)+text(316,162,'uint8 → float',13,colors.muted,500)+arrow(390,132,449,132,colors.slate);
      s+=rect(458,69,151,119,colors.purpleSoft,'none',8,0)+text(533,101,'维度重排',16,colors.purple,700)+text(533,130,'HWC → CHW',15,colors.ink,600)+text(533,157,'像素 ÷ 255',14,colors.muted,500)+arrow(623,132,675,132,colors.slate);
      s+=rect(678,82,60,96,colors.greenSoft,'none',6,0)+text(708,122,'N',19,colors.green,700)+text(708,150,'增加批次轴',10,colors.muted,500)+text(386,250,'预处理必须与训练时保持一致，否则数值相同也可能代表不同颜色。',14,colors.ink,600);return s;
    }},
    conv:{concept:'卷积核如何生成特征图',section:1,paragraph:0,title:'卷积核在图像局部窗口上滑动',description:'卷积核在局部 3×3 像素窗口中做加权求和，得到特征图中的一个位置；向右或向下移动窗口，就能构造完整特征图。',caption:'小示例只画一个通道的局部运算。真实卷积还会跨输入通道累加，并由多个卷积核生成多张特征图。',draw:()=>{
      let s=text(102,43,'输入局部',15,colors.muted,600);const vals=[['1','0','2'],['2','1','0'],['0','1','3']];for(let y=0;y<3;y++)for(let x=0;x<3;x++)s+=cell(47+x*39,65+y*39,37,37,vals[y][x],colors.blueSoft);
      s+=text(105,205,'3 × 3 像素',14,colors.blue,650)+text(233,130,'×',24,colors.muted,600);
      s+=text(331,43,'共享卷积核',15,colors.muted,600);const ker=[['1','0','−1'],['1','0','−1'],['1','0','−1']];for(let y=0;y<3;y++)for(let x=0;x<3;x++)s+=cell(276+x*39,65+y*39,37,37,ker[y][x],colors.orangeSoft);
      s+=text(333,205,'逐项相乘再求和',13,colors.orange,650)+arrow(407,130,486,130,colors.slate);
      s+=rect(501,72,206,122,colors.paper,colors.line,7,1.2);s+=text(604,101,'一个输出值',15,colors.muted,600)+rect(575,115,58,42,colors.purpleSoft,colors.purple,4,1.2)+text(604,142,'Σ',19,colors.purple,700)+text(604,179,'特征图中的一个位置',12,colors.muted,500);
      s+=text(380,256,'核每移动一次，局部窗口就变一次；权重在所有位置共享。',15,colors.ink,600);return s;
    }},
    iou:{concept:'交集、并集与 IoU',section:1,paragraph:1,title:'两个边界框的交集、并集和 IoU',description:'蓝色框 A 与紫色框 B 各自面积为 100；重叠区域宽 5、高 10、面积 50。并集以面积 A 加面积 B 再减重叠计算为 150，因此 IoU 等于 50 除以 150，即三分之一。',caption:'阴影交叠区只在并集中计一次：IoU = 50 ÷ (100 + 100 − 50) = 0.333。',draw:()=>{
      let s=rect(42,42,382,204,colors.paper,colors.line,8,1);s+=line(82,218,397,218,colors.slate,1)+line(82,218,82,64,colors.slate,1)+text(399,236,'x',13,colors.muted,500)+text(65,62,'y',13,colors.muted,500);
      s+='<rect x="125" y="100" width="154" height="108" fill="'+colors.blue+'" fill-opacity=".18" stroke="'+colors.blue+'" stroke-width="3"/><rect x="202" y="100" width="154" height="108" fill="'+colors.purple+'" fill-opacity=".2" stroke="'+colors.purple+'" stroke-width="3"/>';
      s+=text(168,91,'A · 真實框',15,colors.blue,700)+text(320,91,'B · 預測框',15,colors.purple,700)+rect(202,101,77,106,'#d8ccef','none',0,0)+text(240,159,'交集 50',14,colors.purple,700);
      s+=rect(467,52,254,190,colors.purpleSoft,'none',9,0)+text(594,84,'計算這一組框',16,colors.muted,600);
      s+=text(594,119,'面積 A = 10 × 10 = 100',16,colors.blue,650)+text(594,148,'面積 B = 10 × 10 = 100',16,colors.purple,650)+text(594,177,'并集 = 100 + 100 − 50 = 150',15,colors.ink,650)+line(500,191,689,191,colors.purple,1.5)+text(594,222,'IoU = 50 / 150 = 1/3',19,colors.purple,750);return s;
    }},
    metrics:{concept:'NMS 去重与 P–R 评估',section:3,paragraph:0,title:'NMS 去重和 Precision–Recall 曲线',description:'左侧表示高分框被选中后，与它高度重合的重复框会被抑制；右侧 Precision–Recall 曲线展示不同置信度阈值下的精确率与召回率变化。',caption:'NMS 使用预测框之间的重叠去重；评估则将预测与真实框匹配后统计 P、R 和 AP。',draw:()=>{
      let s=text(201,41,'① NMS：选高分，抑制重叠框',15,colors.muted,650);s+=rect(48,62,315,153,colors.paper,colors.line,8,1);
      s+='<rect x="120" y="97" width="122" height="82" fill="'+colors.green+'" fill-opacity=".11" stroke="'+colors.green+'" stroke-width="3"/><rect x="140" y="105" width="122" height="82" fill="'+colors.orange+'" fill-opacity=".13" stroke="'+colors.orange+'" stroke-width="3" stroke-dasharray="6 4"/>';
      s+=tag(64,230,102,'0.92 保留',colors.greenSoft,colors.green)+tag(217,230,121,'0.81 抑制',colors.orangeSoft,colors.orange)+line(52,281,96,281,colors.green,3)+text(245,286,'高重叠且低分 → 删除',13,colors.muted,600,'start');
      s+=text(561,41,'② P–R：阈值改变，权衡随之变化',15,colors.muted,650)+rect(407,62,321,153,colors.paper,colors.line,8,1)+line(451,188,691,188,colors.slate,1.2)+line(451,188,451,79,colors.slate,1.2)+text(695,197,'Recall',12,colors.muted,500,'end')+text(443,79,'Precision',12,colors.muted,500,'end');
      s+='<path d="M452 93 C486 101 500 110 521 126 S561 149 586 160 S637 170 691 177" fill="none" stroke="'+colors.purple+'" stroke-width="4" stroke-linecap="round"/>';
      s+=circle(501,112,5,colors.orange)+circle(587,160,5,colors.blue)+text(498,99,'高阈值',12,colors.orange,650)+text(587,151,'低阈值',12,colors.blue,650);s+=text(566,242,'AP 概括一类目标的 P–R 曲线表现',14,colors.purple,650);return s;
    }},
    architecture:{concept:'Backbone、Neck 与多尺度 Head',section:0,paragraph:1,title:'YOLOv5 中特征提取、融合和多尺度预测',description:'Backbone 从图像中形成不同分辨率的特征，Neck 将深层语义与浅层空间细节融合，Detect Head 在多个尺度上预测边界框与类别。',caption:'高分辨率分支保留较多位置细节，小目标更容易被表示；深层分支感受野更大，适合较大目标。',draw:()=>{
      let s=rect(27,101,94,96,colors.blueSoft,'none',8,0)+text(74,138,'输入图像',17,colors.blue,700)+text(74,165,'640 × 640',12,colors.muted,500);
      const bx=[161,205,249,293];bx.forEach((x,i)=>s+=rect(x,89+i*4,33,116-i*8,[colors.blueSoft,colors.purpleSoft,colors.purpleSoft,colors.orangeSoft][i],[colors.blue,colors.purple,colors.purple,colors.orange][i],4,1.4));s+=text(245,236,'Backbone',16,colors.blue,700);
      s+=arrow(123,149,156,149,colors.slate);s+=rect(346,81,145,126,colors.purpleSoft,'none',9,0)+text(418,115,'Neck',18,colors.purple,700)+text(418,144,'自上而下传语义',12,colors.ink,550)+text(418,166,'自下而上补细节',12,colors.ink,550);s+=arrow(314,149,340,149,colors.slate);
      [[530,89,'P3','小目标',colors.green],[602,112,'P4','中目标',colors.blue],[674,135,'P5','大目标',colors.orange]].forEach(([x,y,n,label,color],i)=>{s+=arrow(491,144,x-22,y+18,color,1.8)+rect(x-20,y,54,54,i===0?colors.greenSoft:i===1?colors.blueSoft:colors.orangeSoft,color,5,1.5)+text(x+7,y+25,n,17,color,700)+text(x+7,y+75,label,12,colors.muted,550)});
      s+=text(575,252,'Detect Head：每个尺度都输出候选框与类别分数',13,colors.ink,600);return s;
    }},
    dataset:{concept:'图像、框标注与 YAML',section:0,paragraph:1,title:'YOLO 数据集图片、标签行与类别表',description:'一张图片与同名标签文件配对。每个标签行由类别编号和归一化中心坐标、宽、高组成；data YAML 指定数据路径和类别顺序。',caption:'标签示例“0 0.52 0.43 0.26 0.38”：数字均相对图像宽高归一化，类别 0 必须与 YAML 的 names[0] 对齐。',draw:()=>{
      let s=rect(35,48,197,168,colors.paper,colors.line,8,1)+text(133,76,'图片 + 标注',15,colors.muted,600);
      s+='<rect x="61" y="91" width="145" height="92" fill="#e9eee9" stroke="'+colors.line+'" stroke-width="1"/><path d="M70 170 L106 132 L128 153 L154 112 L197 170 Z" fill="#a8c4b0"/><rect x="111" y="105" width="58" height="65" fill="none" stroke="'+colors.orange+'" stroke-width="3"/>';
      s+=text(133,204,'images/0001.jpg',12,colors.blue,600)+arrow(239,132,288,132,colors.slate);
      s+=rect(294,60,218,150,colors.purpleSoft,'none',8,0)+text(403,88,'labels/0001.txt',14,colors.purple,700)+rect(310,108,186,63,colors.paper,'none',5,0)+text(403,134,'0  0.52  0.43  0.26  0.38',13,colors.ink,650)+text(403,156,'class   x     y     w     h',11,colors.muted,550)+text(403,195,'同名文件，一图一标注',12,colors.muted,550);
      s+=arrow(518,132,565,132,colors.slate)+rect(572,59,164,153,colors.greenSoft,'none',8,0)+text(654,89,'data.yaml',15,colors.green,700)+text(654,121,'train: images/train',11,colors.ink,550)+text(654,145,'val: images/val',11,colors.ink,550)+text(654,177,'names: [cat, dog]',12,colors.green,650)+text(386,260,'检查框是否贴合物体、类号是否从 0 开始，并逐项核对类别顺序。',14,colors.ink,600);return s;
    }},
    'train-yolo':{concept:'训练过程与检查点',section:1,paragraph:0,title:'YOLOv5 从数据配置到最佳权重',description:'训练以 data YAML、模型配置和起始权重为输入，逐轮更新网络，并在验证集上选择 best.pt。last.pt 表示最后一轮的状态，未必是验证效果最佳的轮次。',caption:'保存配置、训练命令和代码版本，才能复现 best.pt 对应的训练过程。',draw:()=>{
      let s='';const items=[[39,colors.blueSoft,colors.blue,'数据','图像 + 标签'],[197,colors.purpleSoft,colors.purple,'模型','配置 + 权重'],[355,colors.orangeSoft,colors.orange,'训练','epoch 迭代'],[513,colors.greenSoft,colors.green,'验证','mAP / loss']];
      items.forEach(([x,fill,color,title,sub])=>{s+=rect(x,69,133,96,fill,'none',8,0)+text(x+66,105,title,18,color,700)+text(x+66,135,sub,13,colors.ink,550)});s+=arrow(175,117,190,117,colors.slate)+arrow(333,117,348,117,colors.slate)+arrow(491,117,506,117,colors.slate);
      s+=arrow(579,171,407,205,colors.green,1.8)+text(490,198,'下一轮',12,colors.green,600);
      s+=rect(189,220,160,52,colors.greenSoft,colors.green,6,1.4)+text(269,242,'best.pt',16,colors.green,700)+text(269,260,'验证表现最好',11,colors.muted,550);
      s+=rect(413,220,160,52,colors.slateSoft,colors.slate,6,1.4)+text(493,242,'last.pt',16,colors.muted,700)+text(493,260,'训练结束时保存',11,colors.muted,550);return s;
    }},
    inference:{concept:'推理的前处理与后处理',section:1,paragraph:1,title:'YOLOv5 推理中的缩放、筛选和坐标还原',description:'输入图像先等比例缩放并填充到模型尺寸，网络输出候选框，置信度阈值和 NMS 做过滤，最后把坐标映射回原图。',caption:'如果忘记撤销 padding 或缩放比例，框可能整体偏移；置信度阈值和 NMS IoU 阈值控制不同步骤。',draw:()=>{
      let s='';const xs=[35,213,391,569],titles=['原始图像','Letterbox','模型候选','还原结果'],subs=['640 × 480','缩放 + 填充','打分 + NMS','原图坐标'];
      xs.forEach((x,i)=>{s+=rect(x,60,150,147,[colors.blueSoft,colors.slateSoft,colors.purpleSoft,colors.greenSoft][i],'none',8,0)+text(x+75,89,titles[i],16,[colors.blue,colors.slate,colors.purple,colors.green][i],700);s+=rect(x+31,104,88,70,i===1?'#e6e5e0':'#dfe9e2','none',4,0);if(i===1){s+=rect(x+42,104,67,70,'#cad9db','none',0,0);s+=rect(x+42,117,67,44,'#a9c3b2','none',0,0)}if(i===2||i===3)s+='<rect x="'+(x+49)+'" y="'+(i===2?'119':'114')+'" width="49" height="42" fill="none" stroke="'+(i===2?colors.orange:colors.green)+'" stroke-width="3"/>';s+=text(x+75,194,subs[i],12,colors.ink,550)});
      for(let i=0;i<3;i++)s+=arrow(xs[i]+154,133,xs[i+1]-8,133,colors.slate);
      s+=text(380,252,'conf-thres：筛低分候选　　 NMS IoU：移除重复预测　　 坐标：撤销缩放与填充',13,colors.ink,600);return s;
    }},
    loss:{concept:'MSE、MAE 与 Huber',section:1,paragraph:1,title:'三种回归损失对误差的惩罚曲线',description:'误差接近零时 MSE 与 Huber 呈平滑曲线；远离零时 MSE 增长更快，MAE 线性增长，Huber 在转折处之后也采用线性增长。',caption:'误差很大时，平方惩罚会更受离群点影响；Huber 通过转折参数在平滑和稳健间折中。',draw:()=>{
      let s=rect(53,34,654,212,colors.paper,colors.line,8,1)+line(112,205,663,205,colors.slate,1.4)+line(387,216,387,57,colors.slate,1.4)+text(672,211,'误差 e',12,colors.muted,500,'end')+text(376,58,'损失',12,colors.muted,500,'end');
      s+='<path d="M155 174 C246 166 306 139 387 62 C468 139 528 166 619 174" fill="none" stroke="'+colors.red+'" stroke-width="3.5"/>';
      s+='<path d="M155 168 L387 105 L619 168" fill="none" stroke="'+colors.blue+'" stroke-width="3.5"/>';
      s+='<path d="M155 172 L320 127 Q387 105 454 127 L619 172" fill="none" stroke="'+colors.green+'" stroke-width="3.5"/>';
      s+=line(506,56,531,56,colors.red,3)+text(541,61,'MSE：平方',13,colors.ink,550,'start')+line(506,78,531,78,colors.blue,3)+text(541,83,'MAE：绝对值',13,colors.ink,550,'start')+line(506,100,531,100,colors.green,3)+text(541,105,'Huber：小误差平滑',12,colors.ink,550,'start');
      s+=line(320,130,320,205,colors.slate,1,'4 4')+line(454,130,454,205,colors.slate,1,'4 4')+text(387,230,'0',12,colors.muted,500);return s;
    }},
    optimizer:{concept:'优化器更新轨迹',section:1,paragraph:0,title:'梯度下降沿损失等高线逐步移动',description:'闭合曲线表示相同损失水平。优化算法根据当前梯度选择下一步方向和距离；动量使用累积方向减少某些来回振荡。',caption:'学习率控制步幅，动量和自适应方法改变更新方向的统计方式；实际效果仍需通过验证集观察。',draw:()=>{
      let s=rect(32,27,696,225,colors.paper,colors.line,8,1);[[365,139,240,80],[365,139,194,62],[365,139,145,44],[365,139,96,27]].forEach(([cx,cy,rx,ry],i)=>s+='<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="none" stroke="'+[colors.blue,colors.purple,colors.orange,colors.green][i]+'" stroke-width="1.8" stroke-opacity=".74"/>');
      s+=text(79,64,'较高损失',13,colors.muted,550)+text(363,135,'低谷',13,colors.green,700);
      s+='<path d="M106 72 C177 93 190 175 251 168 S294 106 328 147 S350 154 365 139" fill="none" stroke="'+colors.orange+'" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="1 0"/>';
      [[106,72],[190,155],[251,168],[294,106],[328,147],[365,139]].forEach((p,i)=>s+=circle(p[0],p[1],i===5?7:5,i===5?colors.green:colors.orange,'#fff',1.5));
      s+=arrow(437,72,520,72,colors.purple,2)+text(570,77,'动量：利用累积方向',13,colors.purple,600,'start')+arrow(437,106,520,106,colors.orange,2)+text(570,111,'步幅：受学习率影响',13,colors.orange,600,'start')+text(575,176,'每一步都在新的梯度上重新评估',12,colors.muted,500);return s;
    }},
    regularization:{concept:'训练曲线与泛化差距',section:1,paragraph:1,title:'训练误差与验证误差显示过拟合',description:'训练误差持续下降时，验证误差先下降后上升。验证误差最低附近的检查点通常比最后一轮更值得比较，泛化差距是两种表现分离的信号。',caption:'曲线只是诊断线索；先检查验证集划分和样本分布，再决定是否使用早停、数据增强或权重衰减。',draw:()=>{
      let s=rect(40,31,680,221,colors.paper,colors.line,8,1)+line(96,211,676,211,colors.slate,1.4)+line(96,211,96,57,colors.slate,1.4)+text(679,218,'训练轮次',12,colors.muted,500,'end')+text(86,58,'误差',12,colors.muted,500,'end');
      s+='<path d="M111 78 C193 117 250 152 327 175 S494 196 668 199" fill="none" stroke="'+colors.blue+'" stroke-width="3.5"/>';
      s+='<path d="M111 82 C193 120 252 153 327 174 S427 179 481 160 S577 116 668 83" fill="none" stroke="'+colors.orange+'" stroke-width="3.5"/>';
      s+=line(430,65,430,211,colors.green,1.6,'5 5')+circle(430,177,7,colors.green,'#fff',2)+text(430,53,'验证误差低点',13,colors.green,650)+text(570,111,'验证',14,colors.orange,650)+text(593,201,'训练',14,colors.blue,650);
      s+=tag(112,232,146,'训练持续变好',colors.blueSoft,colors.blue)+tag(458,232,198,'验证开始变差：检查泛化',colors.orangeSoft,colors.orange);return s;
    }},
    transfer:{concept:'冻结骨干并微调检测头',section:0,paragraph:1,title:'迁移学习从预训练特征到目标任务',description:'预训练模型的骨干包含已有的视觉特征。迁移学习可先冻结骨干只训练新任务头，再按需解冻部分骨干，用较小学习率继续适配目标数据。',caption:'冻结层停止梯度更新；解冻范围和类别头必须与新数据集的类别数及标签顺序相匹配。',draw:()=>{
      let s=rect(39,53,140,148,colors.blueSoft,'none',8,0)+text(109,82,'预训练模型',17,colors.blue,700)+text(109,119,'边缘',13,colors.ink,550)+text(109,142,'纹理',13,colors.ink,550)+text(109,165,'形状',13,colors.ink,550)+arrow(184,127,224,127,colors.slate);
      s+=rect(232,42,274,169,colors.paper,colors.line,9,1);s+=text(369,67,'目标数据上的两步适配',15,colors.muted,600);
      s+=rect(256,83,122,54,colors.purpleSoft,colors.purple,5,1.3)+text(317,106,'骨干 · 冻结',14,colors.purple,700)+text(317,125,'保留已学特征',11,colors.muted,500);
      s+=rect(390,83,94,54,colors.greenSoft,colors.green,5,1.3)+text(437,106,'检测头',14,colors.green,700)+text(437,125,'适配类别',11,colors.muted,500);
      s+=line(255,162,482,162,colors.line,1)+text(369,184,'阶段 1：先训练新头',13,colors.ink,600);
      s+=arrow(510,127,550,127,colors.slate)+rect(558,62,158,127,colors.orangeSoft,'none',8,0)+text(637,91,'再逐步解冻',16,colors.orange,700)+text(637,121,'骨干小学习率',13,colors.ink,600)+text(637,146,'验证是否泛化',12,colors.muted,550)+text(637,169,'不只看训练损失',11,colors.muted,500);
      s+=text(379,246,'小数据任务通常从已学视觉表示起步，能减少从零学习的负担。',14,colors.ink,600);return s;
    }},
    pool:{concept:'2 × 2 最大池化',section:0,paragraph:1,title:'最大池化将每个 2×2 窗口汇总为一个值',description:'输入 4×4 特征图按不重叠的 2×2 窗口分成四块。每个窗口取最大值，得到 2×2 输出，因此宽、高都减半。',caption:'示例最大池化输出 [[6,2],[5,8]]。空间尺寸缩小，细粒度位置信息也随之减少。',draw:()=>{
      let s=text(169,39,'输入特征图',15,colors.muted,600);const vals=[['1','3','2','0'],['4','6','1','2'],['5','2','7','8'],['1','3','4','4']];
      for(let y=0;y<4;y++)for(let x=0;x<4;x++)s+=cell(91+x*38,57+y*38,36,36,vals[y][x],(x<2&&y<2)?colors.orangeSoft:colors.blueSoft,(x<2&&y<2)?colors.orange:colors.blue);
      s+=text(166,230,'每个窗口取最大值',13,colors.orange,650)+arrow(264,140,334,140,colors.slate);
      s+=text(426,39,'输出特征图',15,colors.muted,600);const out=[['6','2'],['5','8']];for(let y=0;y<2;y++)for(let x=0;x<2;x++)s+=cell(378+x*52,90+y*52,48,48,out[y][x],colors.purpleSoft,colors.purple);
      s+=rect(533,72,184,133,colors.greenSoft,'none',8,0)+text(625,106,'尺寸变化',16,colors.green,700)+text(625,139,'4 × 4  →  2 × 2',17,colors.ink,650)+text(625,171,'H、W 各减半',14,colors.muted,550)+text(381,245,'批次 N 与通道 C 不变；下采样会影响小目标的空间细节。',14,colors.ink,600);return s;
    }},
    augment:{concept:'几何增强时同步更新标签',section:0,paragraph:1,title:'水平翻转图像时边界框也必须翻转',description:'原图中目标框中心 x 为 0.20，做水平翻转后中心变为 1−0.20=0.80；y、宽和高不变。图像与标注框必须使用同一几何变换。',caption:'标签未同步会把正确目标变成错误监督。颜色扰动通常不改框，翻转、裁剪和缩放会改框。',draw:()=>{
      let s=rect(44,50,280,160,colors.paper,colors.line,8,1)+rect(76,80,216,102,'#e9eee9','none',4,0)+rect(107,99,65,64,'none',colors.orange,2,3)+text(139,122,'目标',13,colors.orange,700)+line(139,91,139,173,colors.orange,1,'3 3')+text(139,196,'x = 0.20',14,colors.blue,700);
      s+=text(185,39,'原图',15,colors.muted,600)+arrow(342,130,418,130,colors.purple,2.5)+text(380,113,'水平翻转',12,colors.purple,600);
      s+=rect(436,50,280,160,colors.paper,colors.line,8,1)+rect(452,80,216,102,'#e9eee9','none',4,0)+rect(566,99,65,64,'none',colors.orange,2,3)+text(598,122,'目标',13,colors.orange,700)+line(598,91,598,173,colors.orange,1,'3 3')+text(598,196,'x′ = 1 − 0.20 = 0.80',13,colors.green,700)+text(577,39,'变换后',15,colors.muted,600);
      s+=text(380,248,'中心与边界同步改变；只翻转图像、不改标签会教错模型。',15,colors.ink,600);return s;
    }},
    tasks:{concept:'分类、检测和分割的输出差异',section:1,paragraph:0,title:'三种视觉任务回答不同粒度的问题',description:'同一张包含车辆的图像，分类输出图像级类别，目标检测输出每个实例的边界框，分割则为目标覆盖的像素生成掩码。',caption:'先确定下游决策需要什么信息，再选择标签形式、模型输出和评估指标。',draw:()=>{
      let s='';const xs=[32,282,532],color=[colors.blue,colors.purple,colors.green],soft=[colors.blueSoft,colors.purpleSoft,colors.greenSoft],title=['图像分类','目标检测','语义分割'],sub=['图里有什么？','物体在哪里？','哪些像素属于目标？'];
      xs.forEach((x,i)=>{s+=rect(x,44,194,176,colors.paper,colors.line,8,1)+text(x+97,70,title[i],17,color[i],700)+rect(x+32,88,130,78,soft[i],'none',3,0)+circle(x+74,124,18,'#8eaa97')+rect(x+108,103,38,29,'#d4a77e','none',4,0);if(i===1)s+='<rect x="'+(x+104)+'" y="97" width="48" height="42" fill="none" stroke="'+color[i]+'" stroke-width="3"/>';if(i===2)s+='<path d="M'+(x+57)+' 130 Q'+(x+74)+' 94 '+(x+93)+' 127 Q'+(x+108)+' 102 '+(x+130)+' 124 L'+(x+126)+' 151 L'+(x+63)+' 151 Z" fill="'+color[i]+'" fill-opacity=".47"/>';s+=text(x+97,187,sub[i],13,colors.ink,600);});
      s+=text(379,258,'整张图 → 实例框 → 像素掩码：标注成本与空间精度逐级增加。',14,colors.muted,600);return s;
    }},
    'data-quality':{concept:'按来源分组避免数据泄漏',section:0,paragraph:1,title:'先按视频或场景分组，再拆训练与验证数据',description:'同一视频中的相邻帧高度相似。先把完整视频或拍摄场景作为组，再将组分配给训练集、验证集和测试集，减少重复背景跨集合造成的信息泄漏。',caption:'不要把相邻帧随机打散后当作独立样本；验证集应代表未见过的来源与目标场景。',draw:()=>{
      let s=rect(35,45,230,166,colors.paper,colors.line,8,1)+text(150,73,'来源分组',15,colors.muted,600);
      for(let group=0;group<3;group++){const y=91+group*34;s+=text(74,y+16,'视频 '+String.fromCharCode(65+group),12,colors.ink,600,'start');for(let f=0;f<4;f++)s+=rect(140+f*25,y,19,21,[colors.blueSoft,colors.purpleSoft,colors.greenSoft][group],[colors.blue,colors.purple,colors.green][group],2,1);}
      s+=arrow(275,131,332,131,colors.slate)+rect(341,52,367,155,colors.greenSoft,'none',8,0)+text(525,79,'整组分配，不拆相邻帧',15,colors.green,700);
      s+=tag(366,101,96,'训练集',colors.blueSoft,colors.blue)+tag(482,101,96,'验证集',colors.purpleSoft,colors.purple)+tag(598,101,92,'测试集',colors.orangeSoft,colors.orange);
      s+=text(525,152,'同一视频只进入一个分区',13,colors.ink,600)+text(525,178,'按类别、场景与目标大小检查覆盖',12,colors.muted,550);
      s+=text(380,251,'拆分之后再统计重复图、类别不均衡和漏标样本。',14,colors.ink,600);return s;
    }},
    anchors:{concept:'网格、Anchor 与检测尺度',section:0,paragraph:1,title:'Anchor 作为网格位置上的宽高先验',description:'每个特征网格位置关联多种 Anchor 宽高。训练时将目标分配给合适的网格、Anchor 和尺度，网络再预测相对偏移得到最终框。',caption:'Anchor 是参考宽高而非最终固定框；多尺度检测分支为不同目标尺寸提供表示能力。',draw:()=>{
      let s=text(165,40,'特征网格',15,colors.muted,600);for(let y=0;y<4;y++)for(let x=0;x<4;x++)s+=rect(57+x*54,59+y*40,52,38,(x===2&&y===1)?colors.blueSoft:colors.paper,(x===2&&y===1)?colors.blue:colors.line,1,1);
      s+='<rect x="167" y="95" width="32" height="26" fill="none" stroke="'+colors.orange+'" stroke-width="2.5"/><rect x="158" y="87" width="50" height="42" fill="none" stroke="'+colors.purple+'" stroke-width="2" stroke-dasharray="5 3"/>';
      s+=text(165,239,'同一网格：多种先验框',13,colors.ink,600)+arrow(278,136,349,136,colors.slate);
      s+=rect(359,55,170,152,colors.purpleSoft,'none',8,0)+text(444,82,'匹配目标',16,colors.purple,700)+rect(392,104,103,61,'none',colors.orange,2,3)+text(444,192,'Anchor + 网格位置',12,colors.muted,550);
      s+=arrow(538,136,585,136,colors.slate)+rect(594,60,134,139,colors.greenSoft,'none',8,0)+text(661,91,'预测偏移',15,colors.green,700)+text(661,120,'中心 Δx, Δy',12,colors.ink,550)+text(661,145,'宽高变化',12,colors.ink,550)+text(661,174,'→ 最终边界框',12,colors.green,650);
      s+=text(380,266,'不同步幅的检测分支让小、中、大目标在不同分辨率上被表示。',13,colors.ink,600);return s;
    }},
    'yolo-loss':{concept:'定位、目标性与类别监督',section:0,paragraph:1,title:'YOLO 检测损失由多个监督目标组成',description:'YOLO 检测训练对预测框的位置、网格是否包含目标、目标类别进行不同监督，并按权重合并形成总损失。',caption:'三个损失项关注的错误不同；需要结合标签分配、训练曲线和验证错误样例共同判断。',draw:()=>{
      let s=rect(35,57,159,137,colors.blueSoft,'none',8,0)+text(114,86,'匹配样本',16,colors.blue,700)+rect(71,103,87,57,'none',colors.blue,2,2)+text(114,180,'标签框 ↔ 预测框',12,colors.muted,550)+arrow(200,126,249,126,colors.slate);
      const rows=[[colors.greenSoft,colors.green,'Lbox','位置偏差'],[colors.orangeSoft,colors.orange,'Lobj','是否有目标'],[colors.purpleSoft,colors.purple,'Lcls','类别是否正确']];rows.forEach((r,i)=>{const y=54+i*56;s+=rect(257,y,145,45,r[0],'none',6,0)+text(294,y+28,r[2],17,r[1],700)+text(352,y+27,r[3],12,colors.ink,550)});
      s+=text(427,140,'加权求和',12,colors.muted,550)+arrow(407,126,470,126,colors.slate)+rect(479,77,238,98,colors.paper,colors.line,8,1)+text(598,110,'Ltotal = λbox Lbox',15,colors.ink,650)+text(598,139,'+ λobj Lobj + λcls Lcls',15,colors.ink,650);
      s+=text(380,242,'权重、正负样本匹配与标签质量都会影响各项梯度。',14,colors.muted,600);return s;
    }},
    'yolo-augment':{concept:'Mosaic 增强与标签同步',section:0,paragraph:1,title:'Mosaic 将四张图像拼接并同步变换目标框',description:'Mosaic 从四张训练图像抽样并拼接为一张输入；每个目标框需要同步平移、缩放、裁剪，超出边界的部分需正确截断或移除。',caption:'增强会改变小目标尺寸和场景分布；验证集保持固定，再逐项比较增强是否带来收益。',draw:()=>{
      let s=rect(41,48,231,166,colors.paper,colors.line,8,1);const fills=['#d9e8dd','#e9dbcd','#d6e2ed','#e7e1cf'];for(let y=0;y<2;y++)for(let x=0;x<2;x++)s+=rect(54+x*105,61+y*70,101,66,fills[y*2+x],'#fff',2,1)+rect(82+x*105,78+y*70,36,35,'none',x===0?colors.orange:colors.blue,1,2);s+=line(168,61,168,201,colors.paper,2)+line(54,131,261,131,colors.paper,2)+text(157,237,'四图拼接',13,colors.muted,600);
      s+=arrow(279,130,335,130,colors.slate)+rect(343,64,172,121,colors.purpleSoft,'none',8,0)+text(429,94,'逐框同步变换',16,colors.purple,700)+text(429,124,'缩放与平移',13,colors.ink,550)+text(429,151,'裁剪与越界处理',12,colors.ink,550)+arrow(523,130,578,130,colors.slate);
      s+=rect(586,69,134,111,colors.greenSoft,'none',8,0)+text(653,101,'检查样本',15,colors.green,700)+text(653,130,'框仍贴合目标',12,colors.ink,550)+text(653,154,'验证集固定',12,colors.ink,550)+text(380,252,'增强幅度过强也可能缩小目标或制造不合理场景。',14,colors.ink,600);return s;
    }},
    debugging:{concept:'从症状沿链路排查',section:1,paragraph:1,title:'将检测故障映射到数据、训练和推理环节',description:'将现象分成无框、框偏移、错类、重复框和验证退化，再依据症状检查数据标签、坐标预处理、类别映射、阈值或训练泛化。',caption:'一次只验证一个假设，并在固定样例上比较修改前后的结果，避免多处同时改动掩盖根因。',draw:()=>{
      let s=rect(33,89,137,72,colors.purpleSoft,'none',8,0)+text(101,119,'观察症状',16,colors.purple,700)+text(101,143,'图像 + 日志',12,colors.ink,550);
      s+=arrow(176,126,217,126,colors.slate)+rect(224,43,177,168,colors.paper,colors.line,8,1)+text(312,69,'分类型',15,colors.muted,600);
      [['无框',colors.red],['框偏移',colors.orange],['错类',colors.blue],['重复框',colors.purple]].forEach((r,i)=>s+=tag(239+(i%2)*79,83+Math.floor(i/2)*44,69,r[0],i===0?colors.redSoft:i===1?colors.orangeSoft:i===2?colors.blueSoft:colors.purpleSoft,r[1]));
      s+=arrow(407,126,448,126,colors.slate)+rect(456,43,266,168,colors.greenSoft,'none',8,0)+text(589,70,'针对性检查',15,colors.green,700);
      [['标签/类别映射',colors.blue],['缩放/坐标还原',colors.orange],['置信度/NMS',colors.purple],['数据分布/过拟合',colors.green]].forEach((r,i)=>s+=text(589,100+i*27,'• '+r[0],13,colors.ink,550));
      s+=text(380,254,'抽样复核 → 设定一个改动 → 用同一验证集复测',15,colors.ink,650);return s;
    }}
  };

  function render(lesson){
    const spec=figures[lesson.visual];
    if(!spec)return '';
    const id='chapter-figure-'+String(lesson.id).replace(/[^a-z0-9_-]/gi,'-');
    return '<figure class="chapter-concept-figure" data-visual="'+esc(lesson.visual)+'" tabindex="0"><div class="figure-heading"><span>本节图解 · '+esc(spec.concept)+'</span><span>对照正文观察</span></div><svg viewBox="0 0 760 310" role="img" aria-labelledby="'+id+'-title '+id+'-desc" focusable="false"><title id="'+id+'-title">'+esc(spec.title)+'</title><desc id="'+id+'-desc">'+esc(spec.description)+'</desc>'+spec.draw()+'</svg><figcaption><strong>'+esc(spec.concept)+'：</strong>'+esc(spec.caption)+'</figcaption></figure>';
  }
  window.lessonFigures={render:render,placement(lesson){const spec=figures[lesson.visual];return spec?{section:spec.section,paragraph:spec.paragraph}:null},keys(){return Object.keys(figures)}};
})();
