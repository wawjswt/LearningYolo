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
  const workedStep=(step,markup)=>'<g data-worked-figure-step="'+step+'">'+markup+'</g>';
  const figureStep=(step,markup)=>'<g data-figure-guide-step="'+step+'">'+markup+'</g>';

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
    tensor:{concept:'同一存储的两种读法',section:4,paragraph:0,title:'转置交换形状与步幅，底层存储保持不变',description:'上方是依次存储的 0 到 11；左侧三行四列矩阵 stride 为 4,1，右侧转置为四行三列后 stride 为 1,4。',caption:'移动一行或一列时跳过的元素数量由 stride 决定。转置视图共享这段存储；按默认格式，右侧视图不连续。',draw:()=>{
      let s=text(380,27,'底层存储：0 → 11，两种视图共享',15,colors.muted,600);
      for(let i=0;i<12;i++)s+=cell(86+i*49,40,47,30,i,colors.blueSoft,colors.blue);
      s+=text(202,104,'a = x.reshape(3,4)',16,colors.purple,700)+text(565,104,'t = a.transpose(0,1)',16,colors.green,700);
      for(let r=0;r<3;r++)for(let c=0;c<4;c++)s+=cell(108+c*43,118+r*37,42,36,r*4+c,colors.purpleSoft,colors.purple);
      for(let r=0;r<4;r++)for(let c=0;c<3;c++)s+=cell(501+c*43,113+r*30,42,29,r+c*4,colors.greenSoft,colors.green);
      s+=arrow(318,170,445,170,colors.slate,2)+text(382,153,'交换轴 0、1',13,colors.muted,600);
      s+=text(197,256,'shape (3,4) · stride (4,1)',15,colors.purple,650)+text(566,256,'shape (4,3) · stride (1,4)',15,colors.green,650);
      s+=text(380,285,'a[1,2] → offset 6；t[1,2] → offset 9',14,colors.muted,500);
      return s;
    }},
    'tensor-shapes':{concept:'高阶张量的分组与索引',section:8,paragraph:0,title:'把高维 shape 逐层展开，再沿轴索引定位元素',description:'shape (2,3,4,5) 表示两组，每组有三张四行五列的表。选中索引 [1,2,3,4] 后，对连续布局 stride (60,20,5,1) 的元素偏移为 119。',caption:'每张小表可以暂时作为一组整体；索引从 0 开始逐轴选择。stride=(60,20,5,1) 和偏移 119 是默认连续布局的示例。',draw:()=>{
      let s=text(380,27,'x.shape = (2, 3, 4, 5)',19,colors.purple,700);
      s+=text(202,52,'外层两组；每组 3 张表',13,colors.muted,600)+text(565,52,'放大索引 [1,2] 选中的表',13,colors.muted,600);
      for(let g=0;g<2;g++){
        const gy=68+g*82,groupColor=g===1?colors.orange:colors.blue;
        s+=rect(27,gy,354,72,g===1?colors.orangeSoft:colors.blueSoft,groupColor,8,g===1?2:1.2);
        s+=text(55,gy+18,'组 '+g,12,groupColor,700,'start');
        for(let m=0;m<3;m++){
          const x=91+m*91,y=gy+13,selected=g===1&&m===2;
          s+=rect(x,y,79,51,selected?colors.orangeSoft:colors.paper,selected?colors.orange:colors.line,5,selected?2.4:1);
          s+=text(x+39.5,y+14,'表 '+m,10,selected?colors.orange:colors.muted,650);
          for(let r=0;r<4;r++)for(let c=0;c<5;c++)s+=rect(x+19+c*8,y+20+r*6,8,6,selected&&r===3&&c===4?colors.orange:colors.blueSoft,'#ffffff',1,.7);
        }
      }
      s+=arrow(368,190,423,158,colors.orange,2);
      s+=rect(426,67,307,158,colors.paper,colors.line,8,1.2)+text(579,88,'组索引 1 · 表索引 2',13,colors.green,700);
      for(let c=0;c<5;c++)s+=text(494+c*42,108,String(c),10,colors.muted,600);
      for(let r=0;r<4;r++){
        s+=text(466,129+r*24,String(r),10,colors.muted,600);
        for(let c=0;c<5;c++){
          const x=477+c*42,y=115+r*24,selected=r===3&&c===4;
          s+=rect(x,y,40,22,selected?colors.orange:colors.blueSoft,selected?colors.orange:colors.paper,2,1);
          s+=text(x+20,y+15,r+','+c,9,selected?colors.paper:colors.blue,650);
        }
      }
      s+=text(380,254,'x[1,2,3,4] → 第 2 组 / 第 3 张表 / 第 4 行 / 第 5 列',14,colors.purple,650);
      s+=text(380,285,'连续布局 stride = (60,20,5,1)　·　元素偏移 = 119',14,colors.ink,650);
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
    architecture:{concept:'Backbone、Neck 与多尺度 Head',section:0,paragraph:1,title:'YOLOv5 中特征提取、融合和多尺度预测',description:'Backbone 从图像中形成不同分辨率的特征，Neck 将深层语义与浅层空间细节融合，Detect Head 在多个尺度上预测边界框与类别。',caption:'高分辨率分支保留较多位置细节，小目标更容易被表示；深层分支感受野更大，适合较大目标。',guide:[
      {title:'从图像开始',text:'输入图像先整理成模型使用的尺寸，例如图中 640×640。此时它还是像素，不是检测框。'},
      {title:'Backbone 提取特征',text:'一层层卷积与下采样把像素变成特征图。越往深处，图面位置更少，但每个位置综合了更大范围的信息。'},
      {title:'Neck 融合信息',text:'Neck 把深层的类别线索传回高分辨率特征，也把浅层位置细节向上融合，让预测同时得到“是什么”和“在哪里”的线索。'},
      {title:'三个尺度分别预测',text:'P3 网格较密，通常更有利于小目标；P4、P5 的网格更粗，感受范围更大。每个检测头都预测候选框和类别分数。'}
    ],draw:()=>{
      let s=figureStep(1,rect(27,101,94,96,colors.blueSoft,'none',8,0)+text(74,138,'输入图像',17,colors.blue,700)+text(74,165,'640 × 640',12,colors.muted,500));
      let backbone='';const bx=[161,205,249,293];bx.forEach((x,i)=>backbone+=rect(x,89+i*4,33,116-i*8,[colors.blueSoft,colors.purpleSoft,colors.purpleSoft,colors.orangeSoft][i],[colors.blue,colors.purple,colors.purple,colors.orange][i],4,1.4));backbone+=text(245,236,'Backbone',16,colors.blue,700);s+=figureStep(2,backbone);
      s+=arrow(123,149,156,149,colors.slate)+figureStep(3,rect(346,81,145,126,colors.purpleSoft,'none',9,0)+text(418,115,'Neck',18,colors.purple,700)+text(418,144,'自上而下传语义',12,colors.ink,550)+text(418,166,'自下而上补细节',12,colors.ink,550))+arrow(314,149,340,149,colors.slate);
      let heads='';[[530,89,'P3','小目标',colors.green],[602,112,'P4','中目标',colors.blue],[674,135,'P5','大目标',colors.orange]].forEach(([x,y,n,label,color],i)=>{heads+=arrow(491,144,x-22,y+18,color,1.8)+rect(x-20,y,54,54,i===0?colors.greenSoft:i===1?colors.blueSoft:colors.orangeSoft,color,5,1.5)+text(x+7,y+25,n,17,color,700)+text(x+7,y+75,label,12,colors.muted,550)});heads+=text(575,252,'Detect Head：每个尺度都输出候选框与类别分数',13,colors.ink,600);s+=figureStep(4,heads);return s;
    }},
    dataset:{concept:'图像、框标注与 YAML',section:0,paragraph:1,title:'YOLO 数据集图片、标签行与类别表',description:'一张图片与同名标签文件配对。每个标签行由类别编号和归一化中心坐标、宽、高组成；data YAML 指定数据路径和类别顺序。',caption:'标签示例“0 0.50 0.40 0.20 0.16”：对应 1000×500 图像中的中心 (500,200) 与 200×80 框；类别 0 必须与 YAML 的 names[0] 对齐。',guide:[
      {title:'图片和标签配对',text:'每张训练图片要有同名的 .txt 标签文件。先在图上确认框确实贴着目标，避免把漏标或错框送进训练。'},
      {title:'一行写一个目标',text:'每行依次是类别编号、框中心 x、中心 y、宽和高。这里的 x/y 是中心，不是左上角；宽高描述框的尺寸。'},
      {title:'坐标按图像尺寸归一化',text:'x 和宽除以图像宽，y 和高除以图像高，所以四个数通常在 0 到 1 之间。这样换分辨率仍能表示同一个相对位置。'},
      {title:'YAML 对齐类别顺序',text:'data.yaml 指明 train、val 路径和 names 列表。标签里的 0 对应 names[0]，类别顺序错了会让框位置正确、类别却错。'}
    ],draw:()=>{
      let s=figureStep(1,rect(35,48,197,168,colors.paper,colors.line,8,1)+text(133,76,'图片 + 标注',15,colors.muted,600)+'<rect x="61" y="91" width="145" height="92" fill="#e9eee9" stroke="'+colors.line+'" stroke-width="1"/><path d="M61 158 H206 V183 H61Z" fill="#e1e6e0"/><g transform="translate(119 120.4) scale(.29 .294)"><path d="M7 31 L14 29 L23 18 Q26 15 33 15 H65 Q72 16 78 27 L91 30 Q95 31 96 36 V42 H5 V35 Q5 32 7 31Z" fill="#75649f"/><path d="M28 19 L35 19 H63 Q67 20 71 27 H23Z" fill="#fffefa"/><circle cx="27" cy="41" r="7" fill="#344252"/><circle cx="75" cy="41" r="7" fill="#344252"/></g><rect x="119" y="120.4" width="29" height="14.72" fill="none" stroke="'+colors.orange+'" stroke-width="2"/>'+text(133,204,'images/0001.jpg',12,colors.blue,600));
      s+=arrow(239,132,288,132,colors.slate);
      s+=figureStep(2,rect(294,60,218,150,colors.purpleSoft,'none',8,0)+text(403,88,'labels/0001.txt',14,colors.purple,700)+rect(310,108,186,63,colors.paper,'none',5,0)+text(403,156,'class   x     y     w     h',11,colors.muted,550)+text(403,195,'同名文件，一图一标注',12,colors.muted,550));
      s+=figureStep(3,text(403,134,'0  0.50  0.40  0.20  0.16',13,colors.ink,650)+text(386,260,'1000×500 → 中心 (500,200)，框 200×80 px',12,colors.ink,600));
      s+=figureStep(4,rect(572,59,164,153,colors.greenSoft,'none',8,0)+text(654,89,'data.yaml',15,colors.green,700)+text(654,121,'train: images/train',11,colors.ink,550)+text(654,145,'val: images/val',11,colors.ink,550)+text(654,177,'names: [car, person]',11,colors.green,650));return s;
    }},
    'train-yolo':{concept:'训练过程与检查点',section:1,paragraph:0,title:'YOLOv5 从数据配置到最佳权重',description:'训练以 data YAML、模型配置和起始权重为输入，逐轮更新网络，并在验证集上选择 best.pt。last.pt 表示最后一轮的状态，未必是验证效果最佳的轮次。',caption:'保存配置、训练命令和代码版本，才能复现 best.pt 对应的训练过程。',guide:[
      {title:'准备数据和模型',text:'训练脚本先读数据 YAML、模型结构、初始权重和超参数。类别数、标签顺序与模型输出需要对应。'},
      {title:'训练批次更新参数',text:'一批图片经过模型得到预测，损失衡量预测和标签的差距；反向传播给出梯度，优化器据此更新权重。'},
      {title:'验证集检查泛化',text:'每轮结束后在固定验证集上看损失和检测指标，观察模型对未参与更新的数据表现如何。'},
      {title:'保留最佳与最后权重',text:'best.pt 是验证表现最佳时保存的权重；last.pt 是最后一轮的状态。训练结束不代表最后一轮最好。'}
    ],draw:()=>{
      let s='';const items=[[39,colors.blueSoft,colors.blue,'数据','图像 + 标签'],[197,colors.purpleSoft,colors.purple,'模型','配置 + 权重'],[355,colors.orangeSoft,colors.orange,'训练','epoch 迭代'],[513,colors.greenSoft,colors.green,'验证','mAP / loss']];
      items.forEach(([x,fill,color,title,sub],i)=>{s+=figureStep(i<2?1:i,rect(x,69,133,96,fill,'none',8,0)+text(x+66,105,title,18,color,700)+text(x+66,135,sub,13,colors.ink,550))});s+=arrow(175,117,190,117,colors.slate)+arrow(333,117,348,117,colors.slate)+arrow(491,117,506,117,colors.slate);
      s+=arrow(579,171,407,205,colors.green,1.8)+text(490,198,'下一轮',12,colors.green,600);
      s+=figureStep(4,rect(189,220,160,52,colors.greenSoft,colors.green,6,1.4)+text(269,242,'best.pt',16,colors.green,700)+text(269,260,'验证表现最好',11,colors.muted,550)+rect(413,220,160,52,colors.slateSoft,colors.slate,6,1.4)+text(493,242,'last.pt',16,colors.muted,700)+text(493,260,'训练结束时保存',11,colors.muted,550));return s;
    }},
    inference:{concept:'推理的前处理与后处理',section:1,paragraph:1,title:'YOLOv5 推理中的缩放、筛选和坐标还原',description:'输入图像先等比例缩放并填充到模型尺寸，网络输出候选框，置信度阈值和 NMS 做过滤，最后把坐标映射回原图。',caption:'如果忘记撤销 padding 或缩放比例，框可能整体偏移；置信度阈值和 NMS IoU 阈值控制不同步骤。',guide:[
      {title:'保留原图比例',text:'先记录原图宽高。Letterbox 等比例缩小或放大，再用 padding 补成模型输入尺寸，避免把目标拉伸变形。'},
      {title:'图像和框一起缩放',text:'模型在补边后的画布上预测。映射回原图时，要先扣掉上下左右的 padding，再除以缩放比例。'},
      {title:'筛选低分框并去重',text:'置信度阈值先去掉低分候选；NMS 再按框重叠抑制重复预测。这两个阈值作用不同，调参时分开观察。'},
      {title:'把坐标还原到原图',text:'确认坐标已撤销缩放和 padding，并裁到原图边界。框偏移时，优先核对预处理与还原是否使用同一组尺寸和比例。'}
    ],draw:()=>{
      let s='';const xs=[35,213,391,569],titles=['原始图像','Letterbox','模型候选','还原结果'],subs=['640 × 480','缩放 + 填充','打分 + NMS','原图坐标'];
      xs.forEach((x,i)=>{let stage=rect(x,60,150,147,[colors.blueSoft,colors.slateSoft,colors.purpleSoft,colors.greenSoft][i],'none',8,0)+text(x+75,89,titles[i],16,[colors.blue,colors.slate,colors.purple,colors.green][i],700);stage+=rect(x+31,104,88,70,i===1?'#e6e5e0':'#dfe9e2','none',4,0);if(i===1){stage+=rect(x+42,104,67,70,'#cad9db','none',0,0);stage+=rect(x+42,117,67,44,'#a9c3b2','none',0,0)}if(i===2||i===3)stage+='<rect x="'+(x+49)+'" y="'+(i===2?'119':'114')+'" width="49" height="42" fill="none" stroke="'+(i===2?colors.orange:colors.green)+'" stroke-width="3"/>';stage+=text(x+75,194,subs[i],12,colors.ink,550);s+=figureStep(i+1,stage)});
      for(let i=0;i<3;i++)s+=arrow(xs[i]+154,133,xs[i+1]-8,133,colors.slate);
      s+=text(380,252,'conf-thres：筛低分候选　　 NMS IoU：移除重复预测　　 坐标：撤销缩放与填充',13,colors.ink,600);return s;
    }},
    loss:{concept:'MSE、MAE 与 Huber',section:1,paragraph:1,title:'三种回归损失对误差的惩罚曲线',description:'误差接近零时 MSE 与 Huber 呈平滑曲线；远离零时 MSE 增长更快，MAE 线性增长，Huber 在转折处之后也采用线性增长。',caption:'曲线只示意三种惩罚形状，不表示共用纵轴上的精确数值比例；公式、符号与手算对比见图下方。',formulaMarkup:"<div class=\"loss-formula-panel\" aria-label=\"MSE、MAE 和 Huber 的公式、手算示例与斜率解释\">\n<div class=\"loss-formula-intro\"><strong>先定义误差</strong><span>\\(e_i=\\hat y_i-y_i\\)</span><p>\\(\\hat y_i\\) 是第 \\(i\\) 个样本的预测值，\\(y_i\\) 是真实目标值。\\(e_i>0\\) 表示预测偏大，\\(e_i<0\\) 表示预测偏小，\\(e_i=0\\) 表示预测正好命中。损失把有正负的误差转成非负代价。</p></div>\n<div class=\"loss-formula-cards\">\n<article class=\"loss-formula-card\"><h4>MSE · 均方误差</h4><div class=\"loss-equation\">\\[\\ell_{\\mathrm{MSE}}(e)=e^2\\]</div><div class=\"loss-equation\">\\[\\mathcal{L}_{\\mathrm{MSE}}=\\frac{1}{N}\\sum_{i=1}^{N}e_i^2\\]</div><p>每个误差先平方，再把 \\(N\\) 个样本的结果取平均。平方会放大大误差：误差从 2 变成 10，单项损失从 4 变成 100。</p></article>\n<article class=\"loss-formula-card\"><h4>MAE · 平均绝对误差</h4><div class=\"loss-equation\">\\[\\ell_{\\mathrm{MAE}}(e)=|e|\\]</div><div class=\"loss-equation\">\\[\\mathcal{L}_{\\mathrm{MAE}}=\\frac{1}{N}\\sum_{i=1}^{N}|e_i|\\]</div><p>每个误差先取绝对值，再求平均。绝对值去掉正负号，惩罚随误差幅度线性增加；与平方惩罚相比，通常较少被极端误差牵动。</p></article>\n<article class=\"loss-formula-card loss-formula-card-wide\"><h4>Huber · 小误差平滑，大误差转为线性惩罚</h4><div class=\"loss-equation\">\\[\\ell_{\\delta}(e)=\\begin{cases}\\frac{1}{2}e^2,&|e|\\leq\\delta\\\\\\delta\\left(|e|-\\frac{1}{2}\\delta\\right),&|e|>\\delta\\end{cases}\\]</div><div class=\"loss-equation\">\\[\\mathcal{L}_{\\delta}=\\frac{1}{N}\\sum_{i=1}^{N}\\ell_{\\delta}(e_i),\\qquad\\delta>0\\]</div><p>先用误差幅度 \\(|e|\\) 和阈值 \\(\\delta\\) 比较：阈值内用平方项，阈值外用直线项。\\(\\delta\\) 与误差使用相同单位；调大或缩小目标数值后，需要重新考虑阈值。</p></article>\n</div>\n<div class=\"loss-formula-symbols\"><strong>读公式时看这几个符号</strong><span>\\(N\\)：参与平均的样本数</span><span>\\(e_i\\)：第 \\(i\\) 个样本的预测值减真实值</span><span>\\(\\ell(e_i)\\)：单个样本的损失</span><span>\\(\\mathcal{L}\\)：汇总后的 batch 损失</span><span>\\(\\delta\\)：Huber 的正阈值</span></div>\n<section class=\"loss-worked-example\"><h4>手算一遍：误差 \\(e=3\\)，Huber 阈值 \\(\\delta=1\\)</h4><ol><li>MSE：\\(3^2=9\\)。</li><li>MAE：\\(|3|=3\\)。</li><li>Huber：\\(|3|>1\\)，走第二段，\\(1\\times(|3|-\\frac12\\times1)=2.5\\)。</li></ol><p>如果 \\(e=0.5\\)，因为 \\(|0.5|\\leq1\\)，Huber 走第一段：\\(\\frac12\\times0.5^2=0.125\\)。</p></section>\n<section class=\"loss-gradient-note\"><h4>损失值之外，还要看曲线斜率</h4><p>斜率描述误差稍微变化时，损失会怎样变化。训练通过反向传播把这个变化信号传回模型参数；它和损失值本身不是同一个量。对单个预测，因 \\(e=\\hat y-y\\)，下面是对误差的导数，也等于对预测值的导数：</p><div class=\"loss-equation\">\\[\\frac{\\partial\\ell_{\\mathrm{MSE}}}{\\partial e}=2e,\\qquad\\frac{\\partial\\ell_{\\mathrm{MAE}}}{\\partial e}=\\operatorname{sign}(e)\\ (e\\neq0)\\]</div><div class=\"loss-equation\">\\[\\frac{\\partial\\ell_{\\delta}}{\\partial e}=\\begin{cases}e,&|e|\\leq\\delta\\\\\\delta\\operatorname{sign}(e),&|e|>\\delta\\end{cases}\\]</div><p>MAE 在 \\(e=0\\) 处有尖点、没有唯一导数，框架会采用可用的次梯度约定。取 \\(e=3,\\delta=1\\)，MSE 的斜率为 6，MAE 与 Huber 的斜率为 1：Huber 的大误差斜率不再随误差继续变大。对 batch 的 mean 损失，每个样本对应的梯度还会按平均口径缩放。</p></section>\n<div class=\"loss-example-wrap\"><table class=\"loss-example-table\"><caption>核对单个样本的损失：Huber 取 \\(\\delta=1\\)</caption><thead><tr><th scope=\"col\">误差幅度 \\(|e|\\)</th><th scope=\"col\">MSE \\(e^2\\)</th><th scope=\"col\">MAE \\(|e|\\)</th><th scope=\"col\">Huber（\\(\\delta=1\\)）</th></tr></thead><tbody><tr><th scope=\"row\">0.5</th><td>0.25</td><td>0.5</td><td>0.125</td></tr><tr><th scope=\"row\">3</th><td>9</td><td>3</td><td>2.5</td></tr></tbody></table></div>\n<p class=\"loss-formula-footnote\">图中的曲线只用于比较变化趋势，三条线不代表共用纵轴上的精确比例；表格里的数值按上方定义计算。多维输出、权重、掩码及 reduction 设置会改变实际平均口径。PyTorch 的 HuberLoss 与 SmoothL1Loss 在阈值不为 1 时缩放约定不同，使用时要核对各自定义。</p></div>",draw:()=>{
      let s=rect(53,34,654,212,colors.paper,colors.line,8,1)+line(112,205,663,205,colors.slate,1.4)+line(387,216,387,57,colors.slate,1.4)+text(672,211,'误差 e',12,colors.muted,500,'end')+text(376,58,'损失',12,colors.muted,500,'end');
      s+='<path d="M155 174 C246 166 306 139 387 62 C468 139 528 166 619 174" fill="none" stroke="'+colors.red+'" stroke-width="3.5"/>';
      s+='<path d="M155 168 L387 105 L619 168" fill="none" stroke="'+colors.blue+'" stroke-width="3.5"/>';
      s+='<path d="M155 172 L320 127 Q387 105 454 127 L619 172" fill="none" stroke="'+colors.green+'" stroke-width="3.5"/>';
      s+=line(506,56,531,56,colors.red,3)+text(541,61,'MSE：平方',13,colors.ink,550,'start')+line(506,78,531,78,colors.blue,3)+text(541,83,'MAE：绝对值',13,colors.ink,550,'start')+line(506,100,531,100,colors.green,3)+text(541,105,'Huber：小误差平滑',12,colors.ink,550,'start');
      s+=line(320,130,320,205,colors.slate,1,'4 4')+line(454,130,454,205,colors.slate,1,'4 4')+text(320,222,'−δ',11,colors.muted,500)+text(454,222,'δ',11,colors.muted,500)+text(387,230,'0',12,colors.muted,500);return s;
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
    anchors:{concept:'网格、Anchor 与检测尺度',section:0,paragraph:1,title:'Anchor 作为网格位置上的宽高先验',description:'每个特征网格位置关联多种 Anchor 宽高。训练时将目标分配给合适的网格、Anchor 和尺度，网络再预测相对偏移得到最终框。',caption:'Anchor 是参考宽高而非最终固定框；多尺度检测分支为不同目标尺寸提供表示能力。',guide:[
      {title:'网格给出位置',text:'特征图上的每个格子对应原图的一片区域。目标中心落在哪些相邻位置，会影响训练时哪些位置收到正样本监督。'},
      {title:'Anchor 提供宽高参考',text:'同一位置可比较几种 Anchor 的宽高形状。YOLOv5 会按目标与 Anchor 的宽高比例筛选匹配项；Anchor 是起点，不是固定输出框。'},
      {title:'预测偏移得到边界框',text:'匹配之后，网络预测相对中心位置和宽高的变化，再结合网格、stride 与 Anchor 解码成图像上的框。'},
      {title:'不同尺度覆盖不同目标',text:'P3、P4、P5 的网格分辨率不同，可表达不同尺寸的目标。具体正样本分配细节会随仓库版本和配置变化。'}
    ],draw:()=>{
      let grid=text(165,40,'特征网格',15,colors.muted,600);for(let y=0;y<4;y++)for(let x=0;x<4;x++)grid+=rect(57+x*54,59+y*40,52,38,(x===2&&y===1)?colors.blueSoft:colors.paper,(x===2&&y===1)?colors.blue:colors.line,1,1);
      grid+='<rect x="167" y="95" width="32" height="26" fill="none" stroke="'+colors.orange+'" stroke-width="2.5"/><rect x="158" y="87" width="50" height="42" fill="none" stroke="'+colors.purple+'" stroke-width="2" stroke-dasharray="5 3"/>'+text(165,239,'同一网格：多种先验框',13,colors.ink,600);let s=figureStep(1,grid)+arrow(278,136,349,136,colors.slate);
      s+=figureStep(2,rect(359,55,170,152,colors.purpleSoft,'none',8,0)+text(444,82,'匹配目标',16,colors.purple,700)+rect(392,104,103,61,'none',colors.orange,2,3)+text(444,192,'Anchor + 网格位置',12,colors.muted,550));
      s+=arrow(538,136,585,136,colors.slate)+figureStep(3,rect(594,60,134,139,colors.greenSoft,'none',8,0)+text(661,91,'预测偏移',15,colors.green,700)+text(661,120,'中心 Δx, Δy',12,colors.ink,550)+text(661,145,'宽高变化',12,colors.ink,550)+text(661,174,'→ 最终边界框',12,colors.green,650));
      s+=figureStep(4,text(380,266,'不同步幅的检测分支让小、中、大目标在不同分辨率上被表示。',13,colors.ink,600));return s;
    }},
    'yolo-loss':{concept:'定位、目标性与类别监督',section:0,paragraph:1,title:'YOLO 检测损失由多个监督目标组成',description:'YOLO 检测训练对预测框的位置、网格是否包含目标、目标类别进行不同监督，并按权重合并形成总损失。',caption:'三个损失项关注的错误不同；需要结合标签分配、训练曲线和验证错误样例共同判断。',guide:[
      {title:'先找到匹配样本',text:'损失是在目标分配后计算的。先确定哪个网格和 Anchor 负责预测这个真实框，才知道哪些预测需要被监督。'},
      {title:'Lbox 看位置',text:'位置损失比较预测框和真实框的几何差异。它大时，先看框坐标、匹配结果和定位误差。'},
      {title:'Lobj 看有没有目标',text:'目标性损失训练每个候选位置回答“这里有没有目标”。漏标可能把真实目标附近当作背景，造成相互矛盾的监督。'},
      {title:'Lcls 看类别并合并',text:'类别损失检查正样本的类别预测；各项再按增益系数加权求和。日志里的单项大小需结合权重与训练版本一起读。'}
    ],draw:()=>{
      let s=figureStep(1,rect(35,57,159,137,colors.blueSoft,'none',8,0)+text(114,86,'匹配样本',16,colors.blue,700)+rect(71,103,87,57,'none',colors.blue,2,2)+text(114,180,'标签框 ↔ 预测框',12,colors.muted,550))+arrow(200,126,249,126,colors.slate);
      const rows=[[colors.greenSoft,colors.green,'Lbox','位置偏差'],[colors.orangeSoft,colors.orange,'Lobj','是否有目标'],[colors.purpleSoft,colors.purple,'Lcls','类别是否正确']];rows.forEach((r,i)=>{const y=54+i*56;s+=figureStep(i+2,rect(257,y,145,45,r[0],'none',6,0)+text(294,y+28,r[2],17,r[1],700)+text(352,y+27,r[3],12,colors.ink,550))});
      s+=text(427,140,'加权求和',12,colors.muted,550)+arrow(407,126,470,126,colors.slate)+figureStep(4,rect(479,77,238,98,colors.paper,colors.line,8,1)+text(598,110,'Ltotal = λbox Lbox',15,colors.ink,650)+text(598,139,'+ λobj Lobj + λcls Lcls',15,colors.ink,650));
      s+=text(380,242,'权重、正负样本匹配与标签质量都会影响各项梯度。',14,colors.muted,600);return s;
    }},
    'yolo-augment':{concept:'Mosaic 增强与标签同步',section:0,paragraph:1,title:'Mosaic 将四张图像拼接并同步变换目标框',description:'Mosaic 从四张训练图像抽样并拼接为一张输入；每个目标框需要同步平移、缩放、裁剪，超出边界的部分需正确截断或移除。',caption:'增强会改变小目标尺寸和场景分布；验证集保持固定，再逐项比较增强是否带来收益。',guide:[
      {title:'抽取四张训练图',text:'Mosaic 从训练样本中抽取四张图，增加一个训练输入里出现多种背景和目标组合的机会。'},
      {title:'拼接成新的场景',text:'四张图像按随机中心拼到同一画布。拼接边界会形成新的上下文，也可能让目标变小或被切到边缘。'},
      {title:'边界框必须同步',text:'每个框都要用图像相同的缩放、平移和裁剪变换；越出画布的部分要截断或移除。只改图、不改框会直接制造错标签。'},
      {title:'看增强结果再评估',text:'抽查增强后的图和框是否仍对应。增强强度用固定验证集比较，确认收益后再保留。'}
    ],draw:()=>{
      let s=rect(41,48,231,166,colors.paper,colors.line,8,1);const fills=['#d9e8dd','#e9dbcd','#d6e2ed','#e7e1cf'];let tiles='';for(let y=0;y<2;y++)for(let x=0;x<2;x++)tiles+=rect(54+x*105,61+y*70,101,66,fills[y*2+x],'#fff',2,1)+rect(82+x*105,78+y*70,36,35,'none',x===0?colors.orange:colors.blue,1,2);s+=figureStep(1,tiles)+figureStep(2,line(168,61,168,201,colors.paper,2)+line(54,131,261,131,colors.paper,2)+text(157,237,'四图拼接',13,colors.muted,600));
      s+=arrow(279,130,335,130,colors.slate)+figureStep(3,rect(343,64,172,121,colors.purpleSoft,'none',8,0)+text(429,94,'逐框同步变换',16,colors.purple,700)+text(429,124,'缩放与平移',13,colors.ink,550)+text(429,151,'裁剪与越界处理',12,colors.ink,550))+arrow(523,130,578,130,colors.slate);
      s+=figureStep(4,rect(586,69,134,111,colors.greenSoft,'none',8,0)+text(653,101,'检查样本',15,colors.green,700)+text(653,130,'框仍贴合目标',12,colors.ink,550)+text(653,154,'验证集固定',12,colors.ink,550)+text(380,252,'增强幅度过强也可能缩小目标或制造不合理场景。',14,colors.ink,600));return s;
    }},
    debugging:{concept:'从症状沿链路排查',section:1,paragraph:1,title:'将检测故障映射到数据、训练和推理环节',description:'将现象分成无框、框偏移、错类、重复框和验证退化，再依据症状检查数据标签、坐标预处理、类别映射、阈值或训练泛化。',caption:'一次只验证一个假设，并在固定样例上比较修改前后的结果，避免多处同时改动掩盖根因。',guide:[
      {title:'先固定问题样例',text:'保存出现问题的图片、预测结果和日志。固定同一张图，后面才能判断某个改动是否真的解决问题。'},
      {title:'把症状分开',text:'无框、框偏移、类别错误、重复框和验证下降属于不同现象。先描述“哪里不对”，避免笼统地说模型效果差。'},
      {title:'沿链路找对应环节',text:'错类先查类别映射；偏框查标签与坐标还原；重复框查 NMS；无框查权重、预处理和置信度阈值；验证下降再看数据分布与过拟合。'},
      {title:'一次改一个假设',text:'选最可能的一项检查，修改后用同一图片和固定验证集复测。记录结果，再决定下一步，避免多处同时改动掩盖根因。'}
    ],draw:()=>{
      let s=figureStep(1,rect(33,89,137,72,colors.purpleSoft,'none',8,0)+text(101,119,'观察症状',16,colors.purple,700)+text(101,143,'图像 + 日志',12,colors.ink,550));
      s+=arrow(176,126,217,126,colors.slate)+figureStep(2,rect(224,43,177,168,colors.paper,colors.line,8,1)+text(312,69,'分类型',15,colors.muted,600)+[['无框',colors.red],['框偏移',colors.orange],['错类',colors.blue],['重复框',colors.purple]].map((r,i)=>tag(239+(i%2)*79,83+Math.floor(i/2)*44,69,r[0],i===0?colors.redSoft:i===1?colors.orangeSoft:i===2?colors.blueSoft:colors.purpleSoft,r[1])).join(''));
      s+=arrow(407,126,448,126,colors.slate)+figureStep(3,rect(456,43,266,168,colors.greenSoft,'none',8,0)+text(589,70,'针对性检查',15,colors.green,700)+[['标签/类别映射',colors.blue],['缩放/坐标还原',colors.orange],['置信度/NMS',colors.purple],['数据分布/过拟合',colors.green]].map((r,i)=>text(589,100+i*27,'• '+r[0],13,colors.ink,550)).join(''));
      s+=figureStep(4,text(380,254,'抽样复核 → 设定一个改动 → 用同一验证集复测',15,colors.ink,650));return s;
    }}
  };

  const workedFigures={
    'worked-architecture':{concept:'网格、stride 与 anchor 解码',title:'一个 P3 网格预测如何变成最终边界框',description:'P3 网格位置和 anchor 接收零 logits；sigmoid、stride 与 anchor 尺寸将其解码为画布坐标中的边界框，并计算类别分数。',caption:'例题中的中心为 (84,164)，框大小为 10×13 像素；置信度分数是 objectness 概率乘类别概率。',draw:()=>{
      let cells='';
      for(let y=0;y<3;y++)for(let x=0;x<4;x++)cells+=rect(48+x*39,91+y*35,37,33,x===2&&y===1?colors.greenSoft:colors.paper,x===2&&y===1?colors.green:colors.line,1,1);
      let s=rect(25,54,205,174,colors.blueSoft,'none',8,0)+workedStep(1,text(127,78,'P3 · stride 8',15,colors.blue,700)+cells+text(126,216,'网格 (10,20) · anchor 10×13',11,colors.ink,600));
      s+=arrow(237,140,276,140,colors.slate)+rect(283,54,190,174,colors.purpleSoft,'none',8,0)+text(378,82,'预测 logits',15,colors.purple,700);
      s+=workedStep(1,text(378,116,'tx, ty, tw, th = 0',13,colors.ink,600));
      s+=workedStep(2,text(378,143,'σ(0) = 0.5',16,colors.purple,700)+text(378,177,'网格带 −0.5 偏移',11,colors.muted,550)+text(378,204,'中心乘 stride 8',11,colors.muted,550));
      s+=arrow(480,140,519,140,colors.slate)+rect(526,54,208,174,colors.greenSoft,'none',8,0)+text(630,82,'解码结果',15,colors.green,700);
      s+=workedStep(3,rect(591,104,80,62,'none',colors.green,2,3)+text(631,136,'10×13',12,colors.green,700));
      s+=workedStep(4,text(630,187,'中心 (84,164)',13,colors.ink,650)+text(630,209,'分数 0.5×0.5=0.25',11,colors.muted,550)+text(380,269,'xyxy = (79, 157.5, 89, 170.5)',15,colors.ink,650));return s;
    }},
    'worked-dataset':{concept:'像素框到归一化标签',title:'从 1000×500 像素图像计算 YOLO 标签',description:'左侧框出像素坐标为左上角 400,160、宽 200、高 80 的目标；右侧逐项除以图像宽高，得到第 0 类的归一化标签。',caption:'x 与宽度除以图像宽度 1000；y 与高度除以图像高度 500。',draw:()=>{
      let s=rect(25,52,320,184,colors.paper,colors.line,8,1)+text(185,77,'原图 1000×500',14,colors.blue,700)+rect(47,91,276,138,'#eef2eb','none',3,0);
      s+=workedStep(1,'<rect x="157" y="135" width="55" height="22" fill="'+colors.orangeSoft+'" stroke="'+colors.orange+'" stroke-width="2.5"/>'+line(157,126,157,163,colors.orange,1,'3 3')+line(212,126,212,163,colors.orange,1,'3 3')+text(185,181,'框：400,160 → 600,240',11,colors.ink,600)+text(185,205,'中心 (500,200) · 大小 200×80',11,colors.muted,550));
      s+=arrow(354,143,391,143,colors.slate)+rect(399,52,335,184,colors.purpleSoft,'none',8,0)+text(566,78,'逐项归一化',14,colors.purple,700);
      s+=workedStep(2,text(426,111,'cx  500 ÷ 1000 = 0.50',12,colors.ink,600,'start')+text(426,161,'w   200 ÷ 1000 = 0.20',12,colors.ink,600,'start'));
      s+=workedStep(3,text(426,136,'cy  200 ÷ 500 = 0.40',12,colors.ink,600,'start')+text(426,186,'h    80 ÷ 500 = 0.16',12,colors.ink,600,'start'));
      s+=workedStep(4,tag(440,198,253,'0  0.50  0.40  0.20  0.16',colors.greenSoft,colors.green)+text(380,272,'标签顺序：class · x_center · y_center · width · height',12,colors.ink,600));return s;
    }},
    'worked-anchors':{concept:'Anchor 比例筛选与邻格分配',title:'一个目标框怎样命中 anchor 并分给邻近网格',description:'32×48 目标通过 10×13 anchor 的比例筛选；网格中心的小数部分靠近左边和上边，因此中心格、左邻格和上邻格都成为候选正样本。',caption:'本例 3 个网格位置都匹配同一个目标；完整结果还需检查其他尺度、anchors 和图像边界。',draw:()=>{
      let s=rect(25,50,300,184,colors.paper,colors.line,8,1)+text(175,75,'网格位置 · 中心 (12.2, 9.3)',13,colors.blue,700);
      const gx=73,gy=98,cw=70,ch=42;
      for(let y=0;y<3;y++)for(let x=0;x<3;x++){
        const active=(x===1&&y===1)||(x===0&&y===1)||(x===1&&y===0),center=x===1&&y===1;
        const cellMarkup=rect(gx+x*cw,gy+y*ch,cw-2,ch-2,center?colors.greenSoft:active?colors.orangeSoft:colors.paper,center?colors.green:active?colors.orange:colors.line,2,1)+text(gx+x*cw+(cw-2)/2,gy+y*ch+24,['(11,8)','(12,8)','(13,8)','(11,9)','(12,9)','(13,9)','(11,10)','(12,10)','(13,10)'][y*3+x],10,active?(center?colors.green:colors.orange):colors.muted,600);
        s+=active?workedStep(center?2:3,cellMarkup):cellMarkup;
      }
      s+=arrow(330,141,366,141,colors.slate)+rect(375,50,359,184,colors.purpleSoft,'none',8,0)+text(554,76,'Anchor 宽高筛选',14,colors.purple,700);
      s+=workedStep(1,text(402,111,'目标 32×48 ÷ anchor 10×13',11,colors.ink,600,'start')+text(402,137,'最大对称比例 = 48/13 ≈ 3.69',12,colors.ink,600,'start')+text(402,164,'3.69 < anchor_t 4 → 通过',13,colors.green,700,'start'));
      s+=workedStep(4,tag(444,187,220,'中心 + 左邻 + 上邻',colors.orangeSoft,colors.orange)+text(380,268,'邻近网格重复使用同一真实框，各自计算局部偏移。',13,colors.ink,600));return s;
    }},
    'worked-yolo-loss':{concept:'一个正样本的三路监督',title:'同一个匹配框如何产生 box、objectness 和分类损失',description:'CIoU 转换为框误差；objectness logit 对齐 CIoU 软目标；类别 logits 对齐 one-hot 类别目标，最后再按权重合并。',caption:'显示的是一个正样本上的局部损失；真实日志还累计大量背景位置、多个检测尺度、超参数 gain 和 batch。',draw:()=>{
      let s='';
      const rows=[
        {y:60,fill:colors.greenSoft,color:colors.green,name:'位置',input:'CIoU = 0.72',target:'1 − 0.72',result:'Lbox = 0.28'},
        {y:116,fill:colors.orangeSoft,color:colors.orange,name:'目标性',input:'logit 0.8 → 目标 0.72',target:'BCEWithLogits',result:'Lobj ≈ 0.595'},
        {y:172,fill:colors.purpleSoft,color:colors.purple,name:'类别',input:'logits [0.1, 1.2]',target:'真实类 [0, 1]',result:'Lcls ≈ 0.504'}
      ];
      rows.forEach((r,index)=>{s+=workedStep(index+1,rect(26,r.y,707,47,r.fill,'none',6,0)+tag(35,r.y+9,81,r.name,colors.paper,r.color)+text(260,r.y+29,r.input,12,colors.ink,600)+arrow(392,r.y+23,429,r.y+23,colors.slate,1.5)+text(506,r.y+29,r.target,11,colors.ink,600)+text(665,r.y+29,r.result,13,r.color,700))});
      s+=workedStep(4,text(380,258,'总损失 = batch × (gain_box·Lbox + gain_obj·Lobj + gain_cls·Lcls)',12,colors.ink,650));return s;
    }},
    'worked-train-yolo':{concept:'前向、反向与权重更新',title:'训练一次 batch：从模型输出到参数更新',description:'图像和标签经过前向预测与损失计算；反向传播产生梯度，optimizer.step 才更新参数。验证结果用于比较最佳 checkpoint。',caption:'这里用一个参数演示梯度更新；YOLO 训练时会更新网络中的大量参数。',draw:()=>{
      let s='';
      const nodes=[
        {x:17,fill:colors.blueSoft,color:colors.blue,title:'样本',sub:'imgs + targets'},
        {x:163,fill:colors.purpleSoft,color:colors.purple,title:'前向',sub:'pred = model(imgs)'},
        {x:309,fill:colors.orangeSoft,color:colors.orange,title:'损失',sub:'ComputeLoss'},
        {x:455,fill:colors.greenSoft,color:colors.green,title:'梯度',sub:'loss.backward()'},
        {x:601,fill:colors.paper,color:colors.ink,title:'更新',sub:'optimizer.step()'}
      ];
      nodes.forEach((n,index)=>s+=workedStep(index<2?1:index+0,rect(n.x,63,128,75,n.fill,'none',7,0)+text(n.x+64,92,n.title,15,n.color,700)+text(n.x+64,118,n.sub,10,colors.ink,550)));
      for(let i=0;i<nodes.length-1;i++)s+=arrow(nodes[i].x+130,101,nodes[i+1].x-4,101,colors.slate,1.6);
      s+=workedStep(5,rect(70,172,286,66,colors.greenSoft,'none',7,0)+text(213,196,'验证挑选 checkpoint',13,colors.green,700)+text(213,219,'best.pt = 验证最好 · last.pt = 训练末尾',10,colors.ink,550));
      s+=rect(385,172,350,66,colors.slateSoft,'none',7,0)+text(560,196,'单参数计算示例',13,colors.muted,700)+text(560,219,'w: 1 − 0.1×0.6 → 0.94',12,colors.ink,600);
      s+=text(380,270,'实际训练含梯度累积与 AMP；验证过程不调用 optimizer.step()。',12,colors.ink,600);return s;
    }},
    'worked-yolo-augment':{concept:'输入尺寸、目标像素与特征图',title:'输入边长增加时，小目标和 P3 网格怎样变化',description:'把输入边长从 640 提高到 960，同一小目标从约 8 像素增至 12 像素；stride 8 的 P3 特征图从 80×80 增至 120×120。',caption:'P3 空间位置增加 2.25 倍；实际显存和速度比例还受 batch、网络结构及设备影响。',draw:()=>{
      let s='';
      let original=rect(28,52,330,179,colors.blueSoft,'none',8,0)+text(193,78,'输入 imgsz = 640',14,colors.blue,700)+rect(62,96,108,108,colors.paper,colors.line,4,1);
      for(let i=1;i<4;i++)original+=line(62+i*27,96,62+i*27,204,colors.line,1)+line(62,96+i*27,170,96+i*27,colors.line,1);
      original+=rect(113,139,14,14,colors.orangeSoft,colors.orange,2,1)+text(235,128,'目标约 8×8 px',13,colors.ink,600);
      let larger=rect(401,52,331,179,colors.greenSoft,'none',8,0)+text(566,78,'输入 imgsz = 960',14,colors.green,700)+rect(435,96,108,108,colors.paper,colors.line,4,1);
      for(let i=1;i<4;i++)larger+=line(435+i*27,96,435+i*27,204,colors.line,1)+line(435,96+i*27,543,96+i*27,colors.line,1);
      larger+=rect(498,135,21,21,colors.orangeSoft,colors.orange,2,1)+text(608,128,'目标约 12×12 px',13,colors.ink,600);
      s+=workedStep(1,original+larger)+arrow(362,141,394,141,colors.slate);
      s+=workedStep(2,text(235,163,'P3：80×80',13,colors.blue,650)+text(608,163,'P3：120×120',13,colors.green,650));
      s+=workedStep(3,text(235,190,'空间位置：6,400',11,colors.muted,550)+text(608,190,'空间位置：14,400',11,colors.muted,550)+text(380,266,'边长 ×1.5　→　目标边长 ×1.5　→　P3 位置数 ×2.25',13,colors.ink,650));
      s+=workedStep(4,text(380,292,'固定验证集上比较小目标 Recall、显存与速度。',12,colors.ink,600));return s;
    }},
    'worked-inference':{concept:'Confidence、NMS 与 letterbox 还原',title:'从自动填充到 NMS，再把预测框映射回原图',description:'640×500 原图缩放后上下各自动补 6 像素。两个候选都通过置信度阈值，同类高重叠框经 NMS 留下高分框，再撤销上方 padding。',caption:'本例 stride 为 32、输入图宽度不变；画布高度变为 512。坐标还原时须撤销 padding 与缩放。',draw:()=>{
      let s='';
      const xs=[20,203,386,569],fills=[colors.blueSoft,colors.slateSoft,colors.purpleSoft,colors.greenSoft],cols=[colors.blue,colors.slate,colors.purple,colors.green],heads=['原始图像','自动填充','NMS 去重','映射回原图'];
      xs.forEach((x,i)=>{s+=rect(x,55,167,171,fills[i],'none',7,0)+text(x+83,81,heads[i],13,cols[i],700)+rect(x+25,97,117,91,'#fffefa','none',4,0);
        if(i===0)s+=workedStep(1,text(x+83,205,'640×500',10,colors.ink,550));
        else if(i===1)s+=workedStep(1,text(x+83,205,'上下各补 6 px · 640×512',9,colors.ink,550));
        else if(i===2)s+=workedStep(2,text(x+83,201,'0.72 / 0.66 > 0.25',9,colors.ink,600)+text(x+83,216,'两个候选通过',9,colors.ink,550))+workedStep(3,text(x+83,230,'IoU 0.70 > 0.45',9,colors.ink,600));
        else s+=workedStep(4,text(x+83,205,'[120,100,320,300]',9,colors.ink,550));
      });
      s+=workedStep(1,'<rect x="67" y="115" width="37" height="37" fill="none" stroke="'+colors.green+'" stroke-width="2.5"/>');
      s+=workedStep(2,'<rect x="228" y="97" width="117" height="1.1" fill="'+colors.slate+'"/><rect x="228" y="189.6" width="117" height="1.1" fill="'+colors.slate+'"/><rect x="250" y="116.4" width="37" height="37" fill="none" stroke="'+colors.green+'" stroke-width="2.5"/>');
      s+=workedStep(2,'<rect x="432" y="116" width="37" height="37" fill="none" stroke="'+colors.green+'" stroke-width="2.5" stroke-dasharray="3 2"/><rect x="436" y="119" width="37" height="37" fill="none" stroke="'+colors.green+'" stroke-width="2.5"/>');
      s+=workedStep(3,'<rect x="432" y="116" width="37" height="37" fill="none" stroke="'+colors.orange+'" stroke-width="2.5"/><rect x="436" y="119" width="37" height="37" fill="none" stroke="'+colors.green+'" stroke-width="2.5"/>');
      s+=workedStep(4,'<rect x="615" y="115" width="37" height="37" fill="none" stroke="'+colors.green+'" stroke-width="2.5"/>');
      s+=arrow(190,135,198,135,colors.slate,1.5)+arrow(373,135,381,135,colors.slate,1.5)+arrow(556,135,564,135,colors.slate,1.5);
      s+=text(380,270,'先按置信度筛选，再用 IoU 去重，最后撤销补边。',13,colors.ink,600);return s;
    }},
    'worked-debugging':{concept:'置信度阈值如何隐藏候选框',title:'objectness 与类别分数相乘后才和阈值比较',description:'objectness 0.35 与类别概率 0.60 相乘得到 0.21；在 confidence 阈值 0.25 下候选框被过滤，阈值 0.15 时才显示。',caption:'临时降低阈值可以判断候选是否存在；阈值变低也可能带来更多误报。',draw:()=>{
      let s='';
      s+=workedStep(1,rect(27,60,215,155,colors.blueSoft,'none',8,0)+text(134,87,'模型输出概率',14,colors.blue,700)+text(134,121,'objectness 0.35',13,colors.ink,600)+text(134,148,'类别概率 0.60',13,colors.ink,600)+text(134,184,'0.35 × 0.60 = 0.21',15,colors.purple,700));
      s+=arrow(246,137,284,137,colors.slate)+workedStep(2,rect(291,60,202,155,colors.orangeSoft,'none',8,0)+text(392,87,'confidence 筛选',14,colors.orange,700)+line(319,139,466,139,colors.slate,2)+circle(389,139,7,colors.orange,colors.paper,2)+text(392,117,'分数 0.21',11,colors.ink,600)+text(346,169,'阈值 0.15',10,colors.green,650)+text(443,169,'阈值 0.25',10,colors.red,650)+text(392,195,'0.21 低于 0.25',11,colors.red,700));
      s+=arrow(497,137,535,137,colors.slate)+rect(542,60,192,155,colors.greenSoft,'none',8,0)+workedStep(3,text(638,87,'诊断判断',14,colors.green,700)+text(638,122,'阈值 0.15：候选可见',11,colors.ink,600)+text(638,150,'阈值 0.25：候选隐藏',11,colors.ink,600))+workedStep(4,text(638,184,'再查权重与输入',11,colors.muted,550));
      s+=text(380,266,'调低阈值只用于定位原因；最终阈值要在验证集上选择。',12,colors.ink,600);return s;
    }}
  };

  function render(lesson,key=lesson.visual,kind='lesson'){
    const spec=figures[key]||workedFigures[key];
    if(!spec)return '';
    const id='chapter-figure-'+String(lesson.id+'-'+key).replace(/[^a-z0-9_-]/gi,'-');
    const label=kind==='worked'?'例题图解':'本节图解',guided=kind!=='worked'&&Array.isArray(spec.guide)&&spec.guide.length>0;
    const hint=kind==='worked'?'对应分步推演':guided?'互动图解 · '+spec.guide.length+' 步':'对照正文观察';
    const guideMarkup=guided?'<div class="figure-guide"><div class="figure-guide-heading"><h3>跟着图走</h3><span>先看重点，再读解释</span></div><ol class="figure-guide-steps" id="'+id+'-guide">'+spec.guide.map((step,index)=>'<li data-concept-guide-step-item="'+(index+1)+'"><button type="button" class="figure-guide-step-index" data-concept-guide-jump="'+(index+1)+'" aria-label="跳到图解步骤 '+(index+1)+'" aria-current="'+(index===0?'step':'false')+'">'+String(index+1).padStart(2,'0')+'</button><div class="figure-guide-step-copy"><strong>'+esc(step.title)+'</strong><p>'+esc(step.text)+'</p></div></li>').join('')+'</ol><div class="figure-guide-controls" role="group" aria-label="图解步骤控制"><button type="button" class="worked-control-button" data-concept-guide-prev disabled>上一步</button><output data-concept-guide-progress>第 1 / '+spec.guide.length+' 步</output><button type="button" class="worked-control-button" data-concept-guide-next>下一步</button><button type="button" class="worked-control-button is-quiet" data-concept-guide-toggle aria-expanded="false" aria-controls="'+id+'-guide">显示全部步骤</button><button type="button" class="worked-control-button is-quiet" data-concept-guide-reset>从头看</button></div><p class="figure-guide-status" data-concept-guide-status role="status" aria-live="polite">图中已突出第 1 步：'+esc(spec.guide[0].title)+'。</p>'+(lesson.worked?'<button type="button" class="figure-guide-example-link" data-guide-example-id="worked-example-'+esc(lesson.id)+'" aria-label="接着学习例题：'+esc(lesson.worked.title)+'">接着做本章例题 ↓</button>':'')+'</div>':'';
    const guidedAttrs=guided?' data-concept-guide-root="true" data-guide-current-step="1" data-guide-expanded="false"':'';
    return '<figure class="chapter-concept-figure" data-visual="'+esc(key)+'"'+guidedAttrs+' tabindex="0"><div class="figure-heading"><span>'+label+' · '+esc(spec.concept)+'</span><span>'+hint+'</span></div><svg viewBox="0 0 760 310" role="img" aria-labelledby="'+id+'-title '+id+'-desc" focusable="false"><title id="'+id+'-title">'+esc(spec.title)+'</title><desc id="'+id+'-desc">'+esc(spec.description)+'</desc>'+spec.draw()+'</svg>'+guideMarkup+(spec.formulaMarkup||'')+'<figcaption><strong>'+esc(spec.concept)+'：</strong>'+esc(spec.caption)+'</figcaption></figure>';
  }
  window.lessonFigures={render:render,placement(lesson){const keys=lesson.figureKeys||[lesson.visual];return keys.map(key=>{const spec=figures[key];return spec?{key,section:spec.section,paragraph:spec.paragraph}:null}).filter(Boolean)},keys(){return [...Object.keys(figures),...Object.keys(workedFigures)]}};
})();
