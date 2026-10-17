/* Interactive guide to underfitting, overfitting, and honest model evaluation. */
(() => {
  const previous = window.lessonPlaygrounds;
  const fmt = value => Number(value).toFixed(2);

  function markup() {
    return '<section class="lesson-playground generalization-playground" data-generalization-playground aria-labelledby="generalization-playground-title">'
      + '<div class="playground-heading"><div><span class="playground-kicker">交互图解 · 模型泛化</span><h3 id="generalization-playground-title">模型太简单、刚刚好，还是记得太细？</h3><p>拖动模型容量和训练样本量，观察训练误差与验证误差怎样变化。曲线是帮助理解趋势的示意，不代表某个真实数据集的测量结果。</p></div><button type="button" class="playground-reset" data-gen-reset>恢复示例</button></div>'
      + '<div class="generalization-controls">'
      + '<label class="playground-range"><span>模型容量 <output data-gen-value="capacity">5</output><small>从简单到复杂</small></span><input type="range" min="1" max="10" step="1" value="5" data-gen-control="capacity" aria-label="调整模型容量"></label>'
      + '<label class="playground-range"><span>训练样本 <output data-gen-value="samples">120</output><small>条带标签的训练数据</small></span><input type="range" min="20" max="1200" step="20" value="120" data-gen-control="samples" aria-label="调整训练样本数量"></label>'
      + '</div>'
      + '<div class="generalization-chart-wrap"><svg class="generalization-chart" viewBox="0 0 680 300" role="img" aria-label="训练误差随模型容量增加而下降，验证误差先下降后上升；增加训练样本会减小高容量模型的泛化误差">'
      + '<title>训练误差与验证误差随模型容量变化</title><desc>训练误差通常持续下降，验证误差常呈先降后升的趋势。当前模型容量以竖线标出。</desc>'
      + '<g data-gen-chart></g></svg>'
      + '<div class="generalization-legend"><span><i class="gen-legend-train"></i>训练误差</span><span><i class="gen-legend-valid"></i>验证误差</span><span><i class="gen-legend-current"></i>当前容量</span></div></div>'
      + '<div class="generalization-reading" aria-live="polite"><div class="gen-reading-heading"><span class="gen-reading-badge" data-gen-status>正在计算</span><strong data-gen-title></strong></div><p data-gen-explanation></p><div class="gen-metrics"><div><span>训练误差</span><strong data-gen-train></strong></div><div><span>验证误差</span><strong data-gen-valid></strong></div><div><span>验证误差最低的容量</span><strong data-gen-optimum></strong></div></div></div>'
      + '<div class="gen-concept-grid">'
      + '<article><span class="gen-concept-mark gen-mark-under">欠</span><div><h4>欠拟合：还没学会主要规律</h4><p>训练集和验证集表现都不好。先检查标签与特征、训练是否充分、优化是否正常；确认这些无误后，再考虑提高模型表达能力。</p></div></article>'
      + '<article><span class="gen-concept-mark gen-mark-over">过</span><div><h4>过拟合：把训练样本记得太细</h4><p>训练误差很低，验证表现却较差或开始变差。可以补充更有代表性的数据、使用合适的数据增强或正则化，并按验证表现早停。</p></div></article>'
      + '<article><span class="gen-concept-mark gen-mark-fit">泛</span><div><h4>泛化：遇到新样本也能用</h4><p>真正关心的是目标场景里的新数据。验证集要尽量代表实际使用环境；分布改变、标签噪声和数据泄漏也会让评估失真。</p></div></article>'
      + '</div>'
      + '<aside class="gen-split-panel"><div><span class="playground-kicker">三份数据 · 三种职责</span><h4>别让最终测试集参与“选答案”</h4><p>训练集用来更新参数；验证集用来选择模型、超参数或停止轮次；测试集留到决定完成后，估计一次最终表现。比例按数据和任务调整，关键是职责分开。</p></div><div class="gen-split-flow" aria-label="训练集训练参数，验证集选择模型，测试集最后评估"><div><strong>训练集</strong><span>学习参数</span></div><b aria-hidden="true">→</b><div><strong>验证集</strong><span>比较与选择</span></div><b aria-hidden="true">→</b><div><strong>测试集</strong><span>最后评估</span></div></div></aside>'
      + '<p class="gen-correction"><strong>记住：</strong>“样本数与参数数一样多”不是判断欠拟合或过拟合的通用规则。参数数量只是容量的一种粗略线索；数据质量、噪声、任务难度、模型结构和训练方法都会影响结果。若每个 epoch 都记录名为 <code>test_loss</code> 的指标并据此挑选轮次，请确认它实际是验证集；最终测试集不应承担调参职责。</p>'
      + '<div class="gen-check" data-gen-check><span class="playground-kicker">读曲线 · 做判断</span><h4>训练误差还在下降，验证误差却连续上升。下一步怎么做？</h4><div class="gen-check-options" role="group" aria-label="选择应对验证误差上升的做法">'
      + '<button type="button" data-gen-choice="a">继续加大模型，直到训练误差接近零</button><button type="button" data-gen-choice="b">以验证表现选候选模型，检查过拟合，并把测试集留到最后</button><button type="button" data-gen-choice="c">每轮都用最终测试集挑最低误差的模型</button></div><p class="gen-check-feedback" data-gen-feedback role="status" aria-live="polite"></p></div>'
      + '<div class="gen-sources"><span>继续阅读</span><a href="https://scikit-learn.org/stable/modules/learning_curve.html" target="_blank" rel="noopener noreferrer">验证曲线与学习曲线 · scikit-learn ↗</a><a href="https://scikit-learn.org/stable/common_pitfalls.html" target="_blank" rel="noopener noreferrer">数据泄漏与测试集使用 · scikit-learn ↗</a></div>'
      + '</section>';
  }

  function trainLoss(capacity) {
    return 0.12 + 0.68 * Math.exp(-0.65 * (capacity - 1));
  }

  function validationLoss(capacity, samples) {
    const bias = 0.62 * Math.exp(-0.55 * (capacity - 1));
    const variance = 0.18 * Math.pow(capacity / 10, 2) * Math.sqrt(120 / samples);
    return 0.12 + bias + variance;
  }

  function update(root) {
    if (!root) return;
    const capacity = Number(root.querySelector('[data-gen-control="capacity"]').value);
    const samples = Number(root.querySelector('[data-gen-control="samples"]').value);
    const train = trainLoss(capacity);
    const valid = validationLoss(capacity, samples);
    let optimum = 1;
    for (let candidate = 2; candidate <= 10; candidate += 1) {
      if (validationLoss(candidate, samples) < validationLoss(optimum, samples)) optimum = candidate;
    }

    let status, title, explanation;
    if (capacity <= optimum - 2) {
      status = '欠拟合倾向';
      title = '模型容量可能偏小';
      explanation = '当前训练误差和验证误差都偏高。先排除标签、输入、优化和训练轮次问题；确认训练确实有效后，再试更合适的模型容量。';
    } else if (capacity >= optimum + 2 && valid - train > 0.08) {
      status = '过拟合倾向';
      title = '模型开始记住样本细节';
      explanation = '训练误差较低，但验证误差高于较简单的候选。试试增加代表性样本、合适的增强或正则化，并根据验证集早停。';
    } else {
      status = '较平衡';
      title = '当前容量接近这组示意数据的低验证误差区';
      explanation = '训练误差较低且验证误差没有明显反弹。仍要检查验证数据是否代表目标场景，并以独立测试集完成最终评估。';
    }

    const left = 58, right = 556, top = 34, bottom = 226, maxLoss = 1.05;
    const xAt = value => left + (value - 1) * (right - left) / 9;
    const yAt = value => bottom - Math.min(maxLoss, Math.max(0, value)) * (bottom - top) / maxLoss;
    const makePath = fn => {
      let path = '';
      for (let value = 1; value <= 10; value += 1) {
        path += (value === 1 ? 'M' : ' L') + xAt(value).toFixed(1) + ' ' + yAt(fn(value)).toFixed(1);
      }
      return path;
    };

    let grid = '';
    for (let tick = 0; tick <= 1.0001; tick += 0.25) {
      const y = yAt(tick);
      grid += '<line class="gen-grid-line" x1="' + left + '" y1="' + y.toFixed(1) + '" x2="' + right + '" y2="' + y.toFixed(1) + '"></line>'
        + '<text class="gen-axis-label" x="' + (left - 12) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + tick.toFixed(2) + '</text>';
    }
    for (let tick = 1; tick <= 10; tick += 1) {
      grid += '<text class="gen-axis-label" x="' + xAt(tick).toFixed(1) + '" y="247" text-anchor="middle">' + tick + '</text>';
    }

    const selectedX = xAt(capacity);
    const chart = root.querySelector('[data-gen-chart]');
    chart.innerHTML = grid
      + '<line class="gen-axis-line" x1="' + left + '" y1="' + bottom + '" x2="' + right + '" y2="' + bottom + '"></line>'
      + '<line class="gen-current-line" x1="' + selectedX.toFixed(1) + '" y1="' + top + '" x2="' + selectedX.toFixed(1) + '" y2="' + bottom + '"></line>'
      + '<path class="gen-train-curve" d="' + makePath(trainLoss) + '"></path>'
      + '<path class="gen-valid-curve" d="' + makePath(value => validationLoss(value, samples)) + '"></path>'
      + '<circle class="gen-current-train" cx="' + selectedX.toFixed(1) + '" cy="' + yAt(train).toFixed(1) + '" r="5"></circle>'
      + '<circle class="gen-current-valid" cx="' + selectedX.toFixed(1) + '" cy="' + yAt(valid).toFixed(1) + '" r="5"></circle>'
      + '<text class="gen-axis-title" x="' + ((left + right) / 2) + '" y="282" text-anchor="middle">模型容量：简单 → 复杂</text>'
      + '<text class="gen-axis-title" transform="translate(18 140) rotate(-90)" text-anchor="middle">相对误差（示意）</text>';

    root.querySelector('[data-gen-value="capacity"]').textContent = String(capacity);
    root.querySelector('[data-gen-value="samples"]').textContent = samples.toLocaleString('zh-CN');
    root.querySelector('[data-gen-status]').textContent = status;
    root.querySelector('[data-gen-title]').textContent = title;
    root.querySelector('[data-gen-explanation]').textContent = explanation;
    root.querySelector('[data-gen-train]').textContent = fmt(train);
    root.querySelector('[data-gen-valid]').textContent = fmt(valid);
    root.querySelector('[data-gen-optimum]').textContent = String(optimum);
  }

  window.lessonPlaygrounds = {
    render(id, index) {
      if (id === 'regularization' && index === 0) return markup();
      return previous.render(id, index);
    },
    initialize() {
      previous.initialize();
      document.querySelectorAll('[data-generalization-playground]').forEach(update);
    },
  };

  document.addEventListener('input', event => {
    const input = event.target.closest('[data-gen-control]');
    if (input) update(input.closest('[data-generalization-playground]'));
  });

  document.addEventListener('click', event => {
    const root = event.target.closest('[data-generalization-playground]');
    if (!root) return;

    if (event.target.closest('[data-gen-reset]')) {
      root.querySelector('[data-gen-control="capacity"]').value = '5';
      root.querySelector('[data-gen-control="samples"]').value = '120';
      update(root);
      root.querySelector('[data-gen-feedback]').textContent = '';
      root.querySelectorAll('[data-gen-choice]').forEach(button => button.removeAttribute('aria-pressed'));
      return;
    }

    const answer = event.target.closest('[data-gen-choice]');
    if (!answer) return;
    root.querySelectorAll('[data-gen-choice]').forEach(button => {
      button.setAttribute('aria-pressed', String(button === answer));
      button.classList.toggle('is-correct', button === answer && answer.dataset.genChoice === 'b');
      button.classList.toggle('is-wrong', button === answer && answer.dataset.genChoice !== 'b');
    });
    root.querySelector('[data-gen-feedback]').textContent = answer.dataset.genChoice === 'b'
      ? '答对了。用验证集选候选模型或停止轮次；最终测试集应保持独立，避免把它也“调熟”。'
      : '再想一想：训练误差下降不能保证新样本更好。验证集帮助选择，测试集留作最后评估。';
  });
})();
