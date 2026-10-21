const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { performance } = require('node:perf_hooks');

const source = fs.readFileSync('dist/textbook-glossary.js', 'utf8');
const windowStub = {};
const documentStub = { readyState: 'loading', addEventListener() {} };
vm.runInNewContext(source, { window: windowStub, document: documentStub });
const glossary = windowStub.visionlabGlossary;

assert.equal(typeof glossary.termsIn, 'function', 'the glossary should expose its shared text matcher for verification');
assert.equal(typeof glossary.firstTerm, 'function', 'hint targets should use the same shared text matcher');

const compoundPairs = [
  ['分类', 'classification', '二分类', 'binary-classification'],
  ['分类', 'classification', '多分类', 'multiclass-classification'],
  ['分类', 'classification', '多类别分类', 'multiclass-classification'],
  ['分类', 'classification', '多标签分类', 'multilabel-classification'],
  ['协变量', 'covariate', '内部协变量偏移', 'internal-covariate-shift'],
  ['交叉熵', 'cross-entropy', '二元交叉熵', 'bce'],
  ['导数', 'derivative', '偏导数', 'partial-derivative'],
  ['函数', 'function', '激活函数', 'activation'],
  ['函数', 'function', '损失函数', 'loss'],
  ['梯度', 'gradient', '随机梯度下降', 'sgd'],
  ['梯度下降', 'gradient-descent', '随机梯度下降', 'sgd'],
  ['标签', 'label', '多标签', 'multilabel-classification'],
  ['标签', 'label', '多标签分类', 'multilabel-classification'],
  ['对数', 'logarithm', '自然对数', 'natural-log'],
  ['损失', 'loss', '交叉熵损失', 'cross-entropy'],
  ['矩阵', 'matrix', '旋转矩阵', 'rotation-matrix'],
  ['模型', 'model', '扩散模型', 'diffusion-model'],
  ['归一化', 'normalization', '批量归一化', 'batch-normalization'],
  ['参数', 'parameter', '超参数', 'hyperparameter'],
  ['路径', 'path', '主路径', 'computation-path'],
  ['路径', 'path', '前向路径', 'computation-path'],
  ['路径', 'path', '计算路径', 'computation-path'],
  ['池化', 'pooling', '全局平均池化', 'global-average-pooling'],
  ['概率', 'probability', '正确类别概率', 'cross-entropy-example'],
  ['概率', 'probability', '真实类概率', 'cross-entropy-example'],
  ['样本', 'sample', '负样本', 'negative-sample'],
  ['样本', 'sample', '正样本', 'positive-sample'],
  ['分割', 'segmentation', '实例分割', 'instance-segmentation'],
  ['分割', 'segmentation', '语义分割', 'semantic-segmentation'],
  ['步幅', 'spatial-stride', '卷积步幅', 'conv-stride'],
  ['步幅', 'spatial-stride', '内存步幅', 'stride'],
  ['步幅', 'spatial-stride', '张量内存步幅', 'stride'],
  ['张量', 'tensor', '连续张量', 'contiguous'],
  ['训练', 'training', '预训练权重', 'pretrained-weights'],
  ['变量', 'variable', '协变量', 'covariate'],
  ['变量', 'variable', '中间变量', 'intermediate-variable'],
  ['变量', 'variable', '内部协变量偏移', 'internal-covariate-shift'],
  ['变量', 'variable', '协变量偏移', 'internal-covariate-shift'],
  ['权重', 'weight', '模型权重文件', 'model-weights-file'],
  ['权重', 'weight', '预训练权重', 'pretrained-weights'],
];

const items = new Map(glossary.items.map(item => [item.id, item]));
const owners = new Map();
for (const item of glossary.items) {
  for (const alias of item.aliases) {
    const prior = owners.get(alias);
    assert.ok(!prior || prior === item.id, `alias ${JSON.stringify(alias)} has multiple glossary owners`);
    owners.set(alias, item.id);
  }
}

assert.equal(compoundPairs.length, 40, 'the regression corpus should cover every reviewed candidate pair');
for (const [childAlias, childId, surface, compoundId] of compoundPairs) {
  assert.ok(items.get(childId)?.aliases.includes(childAlias), `missing child alias ${childAlias} (${childId})`);
  assert.ok(items.get(compoundId)?.aliases.includes(surface), `missing complete surface ${surface} (${compoundId})`);

  const matches = glossary.termsIn(`『${surface}』`);
  assert.ok(matches.some(item => item.id === compoundId), `${surface} should resolve to ${compoundId}`);
  assert.ok(!matches.some(item => item.id === childId), `${childAlias} should not resolve separately inside ${surface}`);
}

for (const [alias, id] of [
  ['变量', 'variable'], ['函数', 'function'], ['分类', 'classification'], ['参数', 'parameter'],
  ['对数', 'logarithm'], ['矩阵', 'matrix'], ['概率', 'probability'], ['样本', 'sample'],
  ['步幅', 'spatial-stride'], ['权重', 'weight'],
]) {
  assert.ok(glossary.termsIn(alias).some(item => item.id === id), `${alias} should remain discoverable by itself`);
}

assert.equal(glossary.firstTerm('先看多标签分类的定义')?.id, 'multilabel-classification');
assert.equal(glossary.firstTerm('先看超参数的设置')?.id, 'hyperparameter');
assert.equal(glossary.termsIn('协变量与变量') .map(item => item.id).join(','), 'covariate,variable');
assert.equal(glossary.termsIn('内部协变量偏移') .map(item => item.id).join(','), 'internal-covariate-shift');
assert.equal(glossary.termsIn('激活设备，再看激活函数') .map(item => item.id).join(','), 'activation');
assert.equal(glossary.termsIn('正样本与样本') .map(item => item.id).join(','), 'positive-sample,sample');
assert.equal(glossary.matchesIn('输入输出').map(match => match.item.id).join(','), 'input,output', 'adjacent Chinese terms should not lose the second match to a consumed boundary character');
assert.equal(glossary.matchesIn('向量点积').map(match => match.item.id).join(','), 'vector,dot-product', 'adjacent distinct glossary concepts should both be discoverable');
assert.equal(glossary.matchesIn('神经网络输出logits').map(match => match.item.id).join(','), 'output,logit', 'a Chinese term should remain matchable when followed immediately by an English technical word');
assert.equal(glossary.matchesIn('logistics').length, 0, 'ASCII aliases must still respect ASCII word boundaries');

const repeatedLearningText = '协变量与变量；多标签分类与分类；超参数和参数；真实类概率与概率；正样本与样本。'.repeat(500);
const performanceStart = performance.now();
const repeatedMatches = glossary.matchesIn(repeatedLearningText);
const matcherElapsedMs = performance.now() - performanceStart;
assert.equal(repeatedMatches.length, 5000, 'long course text should retain the complete expected match set');
assert.ok(matcherElapsedMs < 1500, `matching 19,500 course characters took ${matcherElapsedMs.toFixed(1)} ms`);

console.log(`Glossary compound matching checks passed (${compoundPairs.length} candidate pairs, ${owners.size} unique aliases).`);
