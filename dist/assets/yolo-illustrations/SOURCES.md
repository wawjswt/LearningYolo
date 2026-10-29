# YOLO 全课程配图来源

整理日期：2026-10-29。本站采用 YOLOv5 v7.0 普通目标检测作为实现讲解基准。

## 官方示例图

下列 AVIF 文件直接来自 Ultralytics 官方文档页面引用的 CDN 原图，未裁切、改字或改动图表数据。图片版权归原作者；此表记录来源与页面语境，不为原作者的图片重新授予许可。课程图注保留来源链接、历史示例条件和阅读提示。

| 本地文件 | 官方文档 | 原图地址 |
|---|---|---|
| architecture.avif | architecture-description | https://cdn.ul.run/i/8b17cf84c11c69c30cf24a89a910c141.avif |
| mosaic.avif | architecture-description | https://cdn.ul.run/i/8c209c17d47c92f9c3c1abbccf5fb743.avif |
| affine.avif | architecture-description | https://cdn.ul.run/i/6e231815f391a61f8a82618095075812.avif |
| mixup.avif | architecture-description | https://cdn.ul.run/i/afdbd5ce80e044c88f3cad1aa03178d1.avif |
| hsv.avif | architecture-description | https://cdn.ul.run/i/964efba8eae7436317d4b09d62cf1764.avif |
| labels-photo.avif | train-custom-data | https://cdn.ul.run/i/19e1e6d0c5d85a19d97d5f3f731cdf83.avif |
| dataset-folders.avif | train-custom-data | https://cdn.ul.run/i/08e7ac4ccad33b342dfe6c658e811009.avif |
| models.avif | train-custom-data | https://cdn.ul.run/i/d41839d4750825bc166761e37782ab31.avif |
| training-log.avif | train-custom-data | https://cdn.ul.run/i/6af7893c9ca7250dc16c904d36c62ab7.avif |
| training-results.avif | train-custom-data | https://cdn.ul.run/i/0768dc2a9718b2fe69f2945bec326602.avif |
| class-distribution.avif | tips-for-best-training-results | https://cdn.ul.run/i/2dc6b0ae398a01c4eaf32cfc067eff9d.avif |
| export-targets.avif | model-export | https://cdn.ul.run/i/c6887df5000c6206cd8cee3edcdffb3c.avif |
| export-graph.avif | model-export | https://cdn.ul.run/i/8caec6d7fe3f09c6c3fdfc4e60c025ab.avif |

文档地址均为 `https://docs.ultralytics.com/yolov5/tutorials/` 加上表中路径。官方文档会更新；课程保留本次引用文件，原页面用于追溯。

## 本站 SVG 教学图

20 张 SVG 由 `scripts/build-yolo-course-illustrations.mjs` 生成，属于本站绘制的教学图，未从外部位图描摹或裁切。结构图根据 YOLOv5 v7.0 的 `models/yolo.py`、`models/common.py`、模型 YAML，以及数据、损失、指标和后处理实现整理。历史路线另参考对应原论文；图注提供各自的计算依据链接。

网格、框坐标、损失项及计数图中采用正文写明的教学条件。`evaluation-counts.svg`、`evaluation-pr-ap.svg` 和 `evaluation-confusion-matrix.svg` 都是人工设定的教学计数，不是训练测量结果。PR/AP 图沿用3个真实目标与A、B、C、D四条预测的示例；混淆矩阵图采用YOLOv5 v7.0 的预测行、真实列及末行/列 Background 约定，并标出原始计数与官方绘图的列归一化区别。官方训练结果、模型性能和数据分布图是其原文示例，不代表本项目新训练的结果。

## 阅读和维护

所有图片使用本地资源路径，避免阅读时依赖第三方图片防盗链；图注仍链接至原页面。点击图片可在新标签中查看完整原图。AVIF 保留原尺寸与文件格式；SVG 使用 viewBox 自适应缩放。新增配图后，应核对课程、图片、题注、符号、输入设定和版本边界。
