### Task 1: Add the cover middleware matrix

**Files:**
- Modify: `tools/generate_resume.py` inside `draw_pdf_cover()` only.

**Global constraints:**
- Preserve the existing ten highlight boxes, engineering statement, contact bar, and footer positions.
- Add exactly four middleware entries in two rows and two columns, without a separate section heading.
- Match the existing highlight boxes at `236pt × 42pt`, with a `15pt` column gap and a `9pt` row gap.
- Do not modify shared resume data or PDF pages 2 through 9.
- Preserve every pre-existing user change in the dirty working tree.
- Do not commit or stage files.

**Implementation:**

Replace the current six-item compact middleware block with this structure after the existing highlights loop and before the engineering statement:

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

Update the following section comment numbers so the engineering statement remains section 5 and the footer remains section 6. Do not add tests for static drawing code; run `python -m py_compile tools/generate_resume.py` and report the result.

