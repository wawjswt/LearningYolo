#!/usr/bin/env python3
"""Export raw YOLOv5 validation matches for the VisionLab learning site.

Copy this file into the root of a YOLOv5 checkout and run it with the same
weights, data split, image size, and validation settings used for evaluation.
The JSON contains detections and match flags only; it does not copy images,
labels, or model weights.
"""

import argparse
import datetime as dt
import json
import sys
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--weights", required=True, help="trained checkpoint, for example runs/train/exp/weights/best.pt")
    parser.add_argument("--data", required=True, help="the dataset YAML used for validation")
    parser.add_argument("--imgsz", "--img", type=int, default=640, help="inference image size, matching the original validation")
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--conf-thres", type=float, default=0.001, help="pre-NMS confidence threshold")
    parser.add_argument("--nms-iou", type=float, default=0.6, help="NMS IoU threshold, matching the original validation")
    parser.add_argument("--max-det", type=int, default=300)
    parser.add_argument("--task", choices=("val", "test"), default="val")
    parser.add_argument("--device", default="0", help="CUDA index or cpu")
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--output", help="JSON destination; defaults to a timestamped file under runs/val")
    parser.add_argument("--single-cls", action="store_true")
    parser.add_argument("--augment", action="store_true")
    parser.add_argument("--half", action="store_true", help="use half-precision inference, if that matches the original validation")
    return parser.parse_args()


def main():
    args = parse_args()
    yolo_root = Path(__file__).resolve().parent
    sys.path.insert(0, str(yolo_root))

    try:
        import numpy as np
        import val
    except Exception as error:
        raise SystemExit(
            "Could not import this YOLOv5 checkout and its Python environment. "
            "Run the script from the environment where this repository's val.py works. "
            f"Details: {error}"
        ) from error

    captured = {}
    original_ap_per_class = val.ap_per_class

    def capture_ap_per_class(tp, confidence, predicted_classes, target_classes, *positional, **keywords):
        result = original_ap_per_class(tp, confidence, predicted_classes, target_classes, *positional, **keywords)
        target_classes = np.asarray(target_classes).astype(int)
        class_ids, target_counts = np.unique(target_classes, return_counts=True)
        names = keywords.get("names", {})
        if isinstance(names, (list, tuple)):
            name_by_id = {index: str(name) for index, name in enumerate(names)}
        else:
            name_by_id = {int(index): str(name) for index, name in dict(names).items()}

        classes = [
            {
                "id": int(class_id),
                "name": name_by_id.get(int(class_id), str(int(class_id))),
                "groundTruthCount": int(count),
            }
            for class_id, count in zip(class_ids, target_counts)
        ]
        order = np.argsort(-np.asarray(confidence))
        predictions = [
            {
                "classId": int(predicted_classes[index]),
                "confidence": round(float(confidence[index]), 8),
                "correct": [bool(value) for value in tp[index]],
            }
            for index in order
        ]

        per_class = []
        if len(result) >= 7:
            _, _, precision, recall, f1, average_precision, ap_class_ids = result[:7]
            ap_class_ids = np.asarray(ap_class_ids).astype(int)
            for index, class_id in enumerate(ap_class_ids):
                ap_values = np.asarray(average_precision[index]).astype(float)
                per_class.append(
                    {
                        "classId": int(class_id),
                        "precision": float(precision[index]),
                        "recall": float(recall[index]),
                        "f1": float(f1[index]),
                        "ap50": float(ap_values[0]),
                        "ap50_95": float(ap_values.mean()),
                    }
                )

        captured.update(classes=classes, predictions=predictions, yoloV5Metrics=per_class)
        return result

    val.ap_per_class = capture_ap_per_class
    run_name = "visionlab-export-" + dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    val.run(
        data=args.data,
        weights=args.weights,
        batch_size=args.batch_size,
        imgsz=args.imgsz,
        conf_thres=args.conf_thres,
        iou_thres=args.nms_iou,
        max_det=args.max_det,
        task=args.task,
        device=args.device,
        workers=args.workers,
        single_cls=args.single_cls,
        augment=args.augment,
        half=args.half,
        project=str(yolo_root / "runs" / "val" / "visionlab-export"),
        name=run_name,
        exist_ok=False,
        plots=False,
    )

    if not captured:
        raise SystemExit("YOLOv5 did not produce validation matches. Check that the selected split contains labels and the model detects at least one target.")

    output = Path(args.output) if args.output else yolo_root / "runs" / "val" / ("visionlab-metrics-" + dt.datetime.now().strftime("%Y%m%d-%H%M%S") + ".json")
    if not output.is_absolute():
        output = yolo_root / output
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "format": "visionlab-yolov5-eval-v1",
        "source": {
            "framework": "YOLOv5",
            "model": Path(args.weights).name,
            "dataset": Path(args.data).name,
            "split": args.task,
            "imageSize": args.imgsz,
            "nmsIou": args.nms_iou,
            "confidenceFloor": args.conf_thres,
            "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        },
        "iouThresholds": [round(0.5 + index * 0.05, 2) for index in range(10)],
        **captured,
    }
    output.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Saved {len(payload['predictions']):,} predictions and {sum(item['groundTruthCount'] for item in payload['classes']):,} labels to {output}")
    print("Import this JSON into VisionLab's PR · F1 · mAP experiment.")


if __name__ == "__main__":
    main()
