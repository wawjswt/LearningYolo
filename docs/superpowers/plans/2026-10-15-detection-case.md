# Detection Learning Path Implementation Plan

> **For agentic workers:** use `superpowers:executing-plans` to carry out this already approved implementation inline.

**Goal:** Make course counts reflect the live lesson data and add an interactive, end-to-end YOLO-style detection walkthrough.

**Architecture:** Keep the static site architecture. Add a focused `textbook-pipeline.js` module that renders and updates one new lab tab; connect it through the existing lab tab renderer. Keep all example data deterministic and disclose where values are illustrative.

**Tech Stack:** HTML, CSS, vanilla JavaScript, inline SVG.

**Spec:** User-approved continuation of the existing VisionLab learning site: dynamic course counts; one shared detection example spanning data, preprocessing, augmentation, scale matching, training signals, confidence/NMS, and evaluation.

## Global Constraints

- Preserve the site's existing owner-private audience and static deployment setup.
- Reuse the current visual language, course links, lab patterns, and no external runtime dependencies.
- Label synthetic teaching data and do not present a single-image result as AP or mAP.
- Keep the walkthrough usable on narrow mobile screens and by keyboard.

## Review Focus

- Lesson totals, group totals, and progress percentages must use the actual lesson array.
- Candidate confidence is objectness multiplied by class confidence.
- NMS suppresses by class in class-aware mode; evaluation matches by class and IoU.
- Precision/recall handle zero retained predictions without invalid values.
- Single-image evaluation is clearly distinguished from dataset-level AP/mAP.

---

### Task 1: Dynamic Course Counts

**Files:**
- Modify: `dist/index.html`
- Modify: `dist/textbook-ui-v3.js`
- Modify: `dist/textbook-app.js`

**Interfaces:**
- Reads the existing `lessons` array and `groups` object.
- Emits the real lesson total into the sidebar badge and calculates legacy group ratios from each group's actual lesson count.

- [ ] Replace the hard-coded sidebar badge with a dynamic count target updated by the active renderer.
- [ ] Replace legacy home-page totals and per-group `/4` progress with `lessons.length` and actual group counts.

### Task 2: End-to-End Detection Walkthrough

**Files:**
- Create: `dist/textbook-pipeline.js`
- Modify: `dist/textbook-lab.js`
- Modify: `dist/textbook-v3.css`
- Modify: `dist/index.html`

**Interfaces:**
- `window.detectionPipeline.render()` returns the `pipeline` tab panel markup.
- `window.detectionPipeline.initialize()` renders the initial stage and teaching scene.
- The existing lab tab controller owns tab selection and keyboard navigation.

- [ ] Add seven stages using one fixed synthetic scene: data/labels, preprocessing, synchronized augmentation, scale matching, training signals, confidence plus NMS, and evaluation.
- [ ] Render candidate scores from objectness × class confidence; make confidence, NMS IoU, class-aware mode, and match IoU adjustable.
- [ ] Show post-NMS TP/FP/FN, precision, recall, and F1, while linking dataset AP/mAP to the existing metrics lab.
- [ ] Add responsive styling and accessible labels, live readouts, and keyboard-operable stage controls.

### Task 3: Review and Publish

**Files:**
- Review all files above.

- [ ] Inspect the diff and run syntax checks for the changed JavaScript.
- [ ] Package and publish the exact source commit to the existing private Site.
