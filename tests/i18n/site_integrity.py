"""Dependency-free checks for public pages and their localized navigation."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import re
import unittest

ROOT = Path(__file__).resolve().parents[2]
LANGUAGES = re.findall(r'code:\s*[\'"]([^\'"]+)', (ROOT / 'assets/i18n/languages.js').read_text(encoding='utf-8'))
ORIGIN = 'https://www.exsports.fi/'


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.tags = []
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


def public_pages():
    directories = LANGUAGES + ['feedback', 'heda', 'legal', 'shodia', 'surveytools', 'user-guide']
    return [ROOT / 'index.html'] + [p for d in directories for p in (ROOT / d).rglob('*.html')]


class SiteIntegrity(unittest.TestCase):
    def test_local_links_resolve(self):
        missing = []
        for path in public_pages():
            base = urljoin(ORIGIN, path.relative_to(ROOT).as_posix())
            for tag, attrs in Page(path).tags:
                for attr in ['href', 'src']:
                    if attr not in attrs:
                        continue
                    url = urlsplit(urljoin(base, attrs[attr]))
                    if url.hostname not in ['www.exsports.fi', 'exsports.fi']:
                        continue
                    target = ROOT / unquote(url.path).lstrip('/')
                    if target.is_dir():
                        target /= 'index.html'
                    if not target.is_file():
                        missing.append(f'{path.relative_to(ROOT)}: {attrs[attr]}')
        self.assertEqual(missing, [])

    def test_complete_document_translations(self):
        modules = ['ctl-vcf', 'interpolation', 'shore-tank', 'unit-conversions', 'wedge']
        self.assertEqual(len(LANGUAGES), 15)
        for language in LANGUAGES:
            part = '' if language == 'en' else language + '/'
            documents = [f'shodia/user-guide/{part}index.html',
                         f'shodia/legal/{part}privacy_policy.html',
                         f'shodia/legal/{part}disclaimer.html',
                         f'surveytools/user-guide/{part}index.html']
            documents += [f'surveytools/user-guide/{part}modules/{module}.html' for module in modules]
            for document in documents:
                with self.subTest(document=document):
                    path = ROOT / document
                    self.assertTrue(path.is_file())
                    tags = Page(path).tags
                    html_language = next(attrs.get('lang', '') for tag, attrs in tags if tag == 'html')
                    self.assertEqual(html_language.split('-')[0], language)
                    mounts = [attrs for _, attrs in tags if 'data-i18n-switcher' in attrs]
                    self.assertEqual(len(mounts), 1)
                    self.assertEqual(mounts[0]['data-current'], language)
                    self.assertEqual(mounts[0]['data-root-lang'], 'en')

    def test_locale_links_do_not_return_to_auto_detect_picker(self):
        for language in LANGUAGES:
            for section in ['', 'heda/', 'shodia/', 'surveytools/', 'feedback/']:
                path = ROOT / f'{section}{language}/index.html'
                hrefs = [attrs.get('href') for tag, attrs in Page(path).tags if tag == 'a']
                with self.subTest(page=str(path.relative_to(ROOT))):
                    self.assertNotIn('/index.html', hrefs)
                    self.assertNotIn('/index.html?pick=1', hrefs)
                    if section == '':
                        for app in ['heda', 'shodia', 'surveytools']:
                            self.assertIn(f'/{app}/{language}/index.html', hrefs)
                    if section == 'surveytools/':
                        for document in ['privacy_policy', 'disclaimer']:
                            self.assertIn(f'/legal/{language}/{document}.html', hrefs)

    def test_no_corrupted_control_characters(self):
        for path in public_pages():
            text = path.read_text(encoding='utf-8')
            with self.subTest(page=str(path.relative_to(ROOT))):
                self.assertIsNone(re.search(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd]', text))


if __name__ == '__main__':
    unittest.main()
