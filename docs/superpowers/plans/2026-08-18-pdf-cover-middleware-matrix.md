# PDF Cover Middleware Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill the PDF cover's lower blank area with four full-height middleware wireframes arranged in two rows and two columns.

**Architecture:** Extend only `draw_pdf_cover()` with a local immutable middleware definition and a small ReportLab drawing loop. Keep the shared resume JSON and DOCX layout unchanged, then regenerate both artifacts from the existing single source and verify the rendered PDF visually.

**Tech Stack:** Python 3, ReportLab, python-docx, Poppler PDF rendering tools

## Global Constraints

- Preserve the existing ten highlight boxes, engineering statement, contact bar, and footer positions.
- Add exactly four middleware entries in two rows and two columns, without a separate section heading.
- Match the existing highlight boxes at `236pt × 42pt`, with a `15pt` column gap and a `9pt` row gap.
- Do not modify shared resume data or PDF pages 2 through 9.
- The regenerated PDF must remain 9 pages.

---

### Task 1: Add the cover middleware matrix

**Files:**
- Modify: `tools/generate_resume.py:828-854`

**Interfaces:**
- Consumes: the existing ReportLab `canvas.Canvas`, color constants, `FONT_REGULAR`, and `FONT_BOLD` inside `draw_pdf_cover()`.
- Produces: a PDF-only `middleware_items` tuple rendered between the highlight matrix and engineering statement.

- [ ] **Step 1: Record the current cover geometry**

Run:

```powershell
python -c "from reportlab.lib.pagesizes import A4; print(A4[1] - 316 - 4 * (42 + 9), 120 + 100)"
```

Expected: the final highlight row begins at approximately `321.89pt` and the statement ends at `220pt`, confirming about `101pt` of available vertical space.

- [ ] **Step 2: Add the middleware definition and drawing loop**

Insert the following structure after the existing highlights loop and before the engineering statement block, using the exact existing two-column alignment:

```python
    middleware_items = (
        ("Redis Cluster", TEAL),
        ("RabbitMQ", ORANGE),
        ("Nacos", CYAN),
        ("Sentinel", TEAL),
    )
    middleware_start_y = 275

    for index, (technology, accent) in enumerate(middleware_items):
        col = index % 2
        row = index // 2
        x = 54 + col * (box_w + col_gap)
        y = middleware_start_y - row * (box_h + row_gap)
        c.setFillColor(HexColor("#102027"))
        c.setStrokeColor(HexColor("#264750"))
        c.setLineWidth(0.9)
        c.rect(x, y, box_w, box_h, fill=1, stroke=1)
        c.setFillColor(HexColor(f"#{accent}"))
        c.rect(x, y, 4.5, box_h, fill=1, stroke=0)
        c.setFont(FONT_BOLD, 8.4)
        c.setFillColor(HexColor(f"#{COLD_WHITE}"))
        c.drawString(x + 14, y + 17, technology)
```

- [ ] **Step 3: Check source syntax**

Run:

```powershell
python -m py_compile tools/generate_resume.py
```

Expected: exit code `0` with no output.

### Task 2: Regenerate and verify artifacts

**Files:**
- Regenerate: `付道品-高级Java开发工程师.pdf`
- Regenerate: `付道品-高级Java开发工程师.docx`
- Regenerate: `page_1_preview.png` through `page_9_preview.png`

**Interfaces:**
- Consumes: `main()` in `tools/generate_resume.py`.
- Produces: a valid 9-page PDF, a valid DOCX, and current page preview images.

- [ ] **Step 1: Generate the PDF and DOCX**

Run:

```powershell
python tools/generate_resume.py
```

Expected: exit code `0` and paths to both regenerated artifacts.

- [ ] **Step 2: Validate document structure**

Run a read-only validation that opens the PDF with `pypdf`, opens the DOCX with `python-docx`, and asserts a PDF page count of `9`.

Expected: `PDF pages: 9` and successful DOCX paragraph/table enumeration.

- [ ] **Step 3: Render all PDF pages**

Run Poppler's `pdftoppm` at a readable resolution to overwrite the nine current preview PNG files.

Expected: `page_1_preview.png` through `page_9_preview.png` are regenerated without renderer errors.

- [ ] **Step 4: Inspect visual output**

Inspect page 1 at full scale and compare pages 2 and 9 for pagination regressions. Confirm that the four boxes match the highlight geometry, have no heading, retain about `4pt` to `5pt` of separation above and below, and have no text overflow.

- [ ] **Step 5: Verify only intended source geometry changed**

Run:

```powershell
git diff -- tools/generate_resume.py
```

Expected: the new middleware matrix is the only change made by this task within `draw_pdf_cover()`; pre-existing user edits remain preserved.

## Plan Self-Review

- Spec coverage: Tasks 1 and 2 cover all content, geometry, artifact, pagination, and visual requirements.
- Placeholder scan: no deferred implementation steps or unspecified code changes remain.
- Type consistency: all names use existing ReportLab canvas APIs and reuse the existing `box_w`, `box_h`, `col_gap`, and `row_gap` geometry.
