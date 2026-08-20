import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import generate_resume as gr


class ResumeI18nTests(unittest.TestCase):
    def test_english_bundle_paths(self):
        bundle = gr.resume_bundle("en")
        self.assertTrue(str(bundle["data"]).endswith("resume-data.en.json"))
        self.assertIn("Daopin-Fu-Senior-Java-Engineer.pdf", str(bundle["pdf"]))
        self.assertIn("Daopin-Fu-Senior-Java-Engineer.docx", str(bundle["docx"]))

    def test_chinese_bundle_paths(self):
        bundle = gr.resume_bundle("zh")
        self.assertTrue(str(bundle["data"]).endswith("resume-data.zh.json"))
        self.assertIn("付道品-高级Java开发工程师.pdf", str(bundle["pdf"]))

    def test_chrome_has_matching_keys(self):
        self.assertEqual(set(gr.CHROME["zh"]), set(gr.CHROME["en"]))

    def test_bundle_data_files_exist(self):
        for lang in ("zh", "en"):
            bundle = gr.resume_bundle(lang)
            self.assertTrue(bundle["data"].exists(), f"missing data file for {lang}: {bundle['data']}")

    def test_chrome_lookup_for_both_langs(self):
        for lang in ("zh", "en"):
            chrome = gr.CHROME[lang]
            for key in ("page_before", "page_after", "stack", "museum", "overview",
                        "strengths", "experience", "outcome", "item_join", "item_stop",
                        "item_strip", "pdf_subject"):
                self.assertIn(key, chrome)


if __name__ == "__main__":
    unittest.main()
