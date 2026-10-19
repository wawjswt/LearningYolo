"""Run with PyTorch installed; first export examples with verify-depth-notes.cjs."""
import ast
import contextlib
import io
import json
import sys

import torch

with open(sys.argv[1], encoding="utf-8") as source:
    examples = json.load(source)
for example in examples:
    ast.parse(example["code"])
    scope = {}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(compile(example["code"], example["title"], "exec"), scope)
    if example["lesson"] == "gradient":
        assert torch.allclose(scope["w"], torch.tensor(1.6))
        assert torch.allclose(scope["b"], torch.tensor(0.3))
        assert torch.allclose(scope["loss_after"], torch.tensor(1.125))
    elif "stable_loss" in scope:
        assert torch.isfinite(scope["stable_loss"])
        assert abs(scope["stable_loss"].item() - 2000.3133) < 0.001
    elif "logits" in scope:
        assert torch.allclose(scope["logits"].grad, torch.tensor([[0.7, -0.8, 0.1]]), atol=1e-6)
    elif "wrong_errors" in scope:
        assert scope["wrong_errors"].shape == (2, 2)
        assert scope["wrong_errors"].square().mean().item() == 0.5
    elif example["lesson"] == "optimizer":
        assert abs(scope["parameter"].item() - 0.9) < 1e-6
        assert abs(scope["state"]["exp_avg_sq"].item() - 0.004) < 1e-6
    elif "updates" in scope:
        assert scope["updates"] == 4 and scope["samples_in_group"] == 5
    else:
        assert abs(scope["sample_mean"] - 1.8) < 1e-9
    print("PASS:", example["lesson"], example["title"])

# A separate whole-batch computation checks the accumulation rule,
# including the final group of 5 samples, rather than reusing its output.
x = torch.arange(1.0, 102.0).unsqueeze(1) / 100
y = 2 * x + 1
for start in (0, 32, 64, 96):
    end = min(start + 32, len(x))
    model = torch.nn.Linear(1, 1)
    (model(x[start:end]) - y[start:end]).square().mean().backward()
    expected = [parameter.grad.clone() for parameter in model.parameters()]
    model.zero_grad(set_to_none=True)
    for offset in range(start, end, 8):
        stop = min(offset + 8, end)
        ((model(x[offset:stop]) - y[offset:stop]).square().sum() / (end - start)).backward()
    for parameter, gradient in zip(model.parameters(), expected):
        assert torch.allclose(parameter.grad, gradient, atol=1e-6, rtol=1e-5)
print("PASS: uneven gradient accumulation matches direct sample mean; PyTorch", torch.__version__)
