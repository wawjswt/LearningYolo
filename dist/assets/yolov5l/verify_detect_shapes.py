#!/usr/bin/env python3
"""Check YOLOv5 Detect tensor shapes without loading weights or training."""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def fail(parser: argparse.ArgumentParser, message: str) -> None:
    parser.error(message)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Build a YOLOv5 detection model with random initialization and check "
            "its raw train-mode and decoded eval-mode output shapes. No weights "
            "are downloaded and no optimizer update is performed."
        )
    )
    parser.add_argument("--repo", required=True, type=Path, help="local YOLOv5 repository root")
    parser.add_argument("--cfg", required=True, help="model YAML path relative to --repo")
    parser.add_argument("--nc", required=True, type=int, help="number of classes")
    parser.add_argument("--height", required=True, type=int, help="input image height")
    parser.add_argument("--width", required=True, type=int, help="input image width")
    args = parser.parse_args()

    repo = args.repo.expanduser().resolve()
    cfg_arg = Path(args.cfg)
    if cfg_arg.is_absolute():
        fail(parser, "--cfg must be relative to the YOLOv5 repository root")
    cfg = (repo / cfg_arg).resolve()
    try:
        cfg.relative_to(repo)
    except ValueError:
        fail(parser, "--cfg must stay inside the YOLOv5 repository")
    if not (repo / "models" / "yolo.py").is_file():
        fail(parser, f"could not find models/yolo.py under --repo: {repo}")
    if not cfg.is_file():
        fail(parser, f"model YAML does not exist: {cfg}")
    if args.nc < 1:
        fail(parser, "--nc must be at least 1")
    if args.height < 1 or args.width < 1:
        fail(parser, "--height and --width must be positive")

    # Import the checkout the learner selected, not another installed package.
    os.chdir(repo)
    sys.path.insert(0, str(repo))
    try:
        import torch
        from models.yolo import DetectionModel
    except Exception as exc:  # surface missing/incompatible local dependencies clearly
        fail(parser, f"could not import PyTorch and this repository's DetectionModel: {exc}")

    try:
        torch.manual_seed(0)
        model = DetectionModel(str(cfg), ch=3, nc=args.nc).cpu()
    except Exception as exc:
        fail(parser, f"could not build the model from {cfg.relative_to(repo)}: {exc}")

    head = model.model[-1]
    if not all(hasattr(head, name) for name in ("nl", "na", "no", "m")):
        fail(parser, "the last model layer is not a compatible YOLOv5 Detect head")
    stride = int(model.stride.max().item())
    if args.height % stride or args.width % stride:
        fail(parser, f"input height and width must be divisible by the model's maximum stride {stride}")

    images = torch.rand(1, 3, args.height, args.width)

    # Keep Detect in training mode so it returns one raw tensor per scale,
    # while freezing BatchNorm statistics because this is not a training step.
    model.train()
    for layer in model.modules():
        if isinstance(layer, torch.nn.modules.batchnorm._BatchNorm):
            layer.eval()
    with torch.inference_mode():
        train_raw = model(images)
    if not isinstance(train_raw, (list, tuple)) or not all(torch.is_tensor(item) for item in train_raw):
        fail(parser, "expected train mode to return a list of raw scale tensors")
    train_raw = list(train_raw)

    model.eval()
    with torch.inference_mode():
        eval_result = model(images)
    if not isinstance(eval_result, tuple) or len(eval_result) != 2:
        fail(parser, "expected ordinary eval mode to return (decoded predictions, raw scales)")
    decoded, eval_raw = eval_result
    if not torch.is_tensor(decoded) or not isinstance(eval_raw, (list, tuple)):
        fail(parser, "eval result must contain a decoded tensor and a raw scale list")
    eval_raw = list(eval_raw)

    def check_raw(stage: str, predictions: list[torch.Tensor]) -> int:
        if len(predictions) != head.nl:
            fail(parser, f"{stage} returned {len(predictions)} scales, but Detect declares {head.nl}")
        count = 0
        for index, prediction in enumerate(predictions):
            if prediction.ndim != 5:
                fail(parser, f"{stage} scale {index} must have shape [B,A,H,W,D], got {tuple(prediction.shape)}")
            batch, anchors, height, width, fields = prediction.shape
            if batch != 1 or anchors != head.na or fields != head.no:
                fail(
                    parser,
                    f"{stage} scale {index} expected [1,{head.na},H,W,{head.no}], got {tuple(prediction.shape)}",
                )
            count += anchors * height * width
        return count

    train_count = check_raw("train", train_raw)
    eval_count = check_raw("eval", eval_raw)
    train_shapes = [tuple(item.shape) for item in train_raw]
    eval_shapes = [tuple(item.shape) for item in eval_raw]
    if train_shapes != eval_shapes:
        fail(parser, "train-mode and eval-mode raw scale shapes do not match")
    if tuple(decoded.shape) != (1, eval_count, head.no):
        fail(parser, f"decoded output expected [1,{eval_count},{head.no}], got {tuple(decoded.shape)}")

    conv_channels = [module.out_channels for module in head.m]
    expected_channels = [head.na * head.no] * head.nl
    if conv_channels != expected_channels:
        fail(parser, f"Detect output convolution channels {conv_channels} do not match {expected_channels}")

    print(f"Repository: {repo}")
    print(f"Config: {cfg.relative_to(repo)} | nc={head.nc} | fields per candidate={head.no} | anchors per cell={head.na}")
    print(f"Input: [1, 3, {args.height}, {args.width}] | max stride={stride}")
    print("Train mode raw scales (BatchNorm statistics frozen; no optimizer step):")
    for index, shape in enumerate(train_shapes):
        print(f"  scale {index} (stride {int(head.stride[index].item())}): {shape}")
    print(f"  candidates before filtering: {train_count:,}")
    print("Eval mode:")
    for index, shape in enumerate(eval_shapes):
        print(f"  raw scale {index}: {shape}")
    print(f"  decoded predictions: {tuple(decoded.shape)}")
    print(f"  output convolution channels: {conv_channels}")
    print("PASS: tensor shapes and candidate count are internally consistent.")
    print("Scope: random initialization and shape checks only; this does not test accuracy, speed, training, or export.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
