"""Build the course archive for peilong-website from the published site's git history.

usage: python3 build_archive.py SITE_ROOT
  SITE_ROOT/public           - clone of Peilong.github.io (history source)
  writes SITE_ROOT/content/courses/archive/<yyyy-season>/<course>/index.html  (one page per offering)
  writes SITE_ROOT/data/teaching.json                                          (landing page + history grid)
"""
import html, json, os, re, shutil, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from offerings import OFFERINGS, snapshot

ROOT = sys.argv[1]
REPO = os.path.join(ROOT, "public")

# Course "lineages": rows of the history grid. Renamed courses share a row.
LINEAGES = [  # key, current code, current title, member course dirs, former name
    ("cs113", "CS 113", "The Power and Beauty of Computing", ["cs113"], ""),
    ("cs121", "CS 121", "Computer Science I", ["cs121"], ""),
    ("cs122", "CS 122", "Computer Science II", ["cs122"], ""),
    ("cs222", "CS/EGR 222", "Systems Programming", ["cs222"], ""),
    ("cs230", "CS 230", "Computer Architecture", ["cs230"], ""),
    ("cs250", "CS 250", "Foundations of AI and Data Science", ["ds200", "cs250"], "DS 200 Introduction to Data Science"),
    ("cs350", "CS 350", "From Data Mining to Deep Learning", ["ds300", "cs350"], "DS 300 Data Mining"),
    ("cs354", "CS 354", "Big Data", ["ds420", "cs354"], "DS 420 Big Data"),
    ("cs363", "CS 363", "Computer Security", ["cs363"], ""),
    ("cs364", "CS 364", "Network Security", ["cs364"], ""),
    ("cs400", "CS 400", "Projects in Computing", ["cs400"], ""),
    ("cs495", "CS 495", "Honors Projects in Computing", ["cs495"], ""),
    ("ds400", "DS 400", "Data Science Capstone", ["ds400"], ""),
    ("ds495", "DS 495", "Honors Data Science Capstone", ["ds495"], ""),
    ("egr401", "EGR 401", "Senior Project in Engineering I", ["egr401"], ""),
]
LINEAGE_OF = {c: key for key, _, _, members, _ in LINEAGES for c in members}

# Current semester (shown at the top).
CURRENT = {"term": "Spring 2027", "courses": ["cs122", "cs230", "cs354"]}
NEW_COURSES = {}

# Offerings with no archived page (source: the PI's teaching record, 2026-11-18).
BEFORE_ARCHIVE = "before the site's archive began (Dec 2019)"
NOT_UPDATED = "the course page was not updated this semester"
NO_ARCHIVE = {
    "Fall 2018":   [("cs121", BEFORE_ARCHIVE), ("ds200", BEFORE_ARCHIVE)],
    "Spring 2019": [("cs121", BEFORE_ARCHIVE), ("cs222", BEFORE_ARCHIVE), ("ds200", BEFORE_ARCHIVE)],
    "Fall 2019":   [("cs121", BEFORE_ARCHIVE), ("ds300", BEFORE_ARCHIVE)],
    "Fall 2021":   [("ds300", NOT_UPDATED), ("ds420", NOT_UPDATED)],
    "Spring 2023": [("cs495", NOT_UPDATED)],
    "Spring 2024": [("cs400", NOT_UPDATED), ("cs495", NOT_UPDATED)],
    "Fall 2024":   [("ds400", NOT_UPDATED)],
    "Spring 2025": [("ds400", NOT_UPDATED)],
}
OLD_TITLES = {"cs121": "CS 121 Computer Science I", "cs222": "CS 222 Systems Programming",
              "ds200": "DS 200 Introduction to Data Science", "ds300": "DS 300 Data Mining",
              "ds420": "DS 420 Big Data", "cs400": "CS 400 Projects in Computing",
              "cs495": "CS 495 Honors Projects in Computing", "ds400": "DS 400 Data Science Capstone"}

# Offerings documented elsewhere (external syllabus).
EGR401_SYLLABUS = "https://users.etown.edu/w/wunderjt/syllabi/EGR401%20Wunderlich,Joseph%20and%20Li,Peilong.pdf"
EXTERNAL = {
    "Fall 2019":   [("egr401", "EGR 401 Senior Project in Engineering I", EGR401_SYLLABUS, "co-taught with Dr. Joseph Wunderlich")],
    "Spring 2020": [("egr401", "EGR 401 Senior Project in Engineering I", EGR401_SYLLABUS, "co-taught with Dr. Joseph Wunderlich")],
}

# Semesters without teaching.
NO_TEACHING = {"Fall 2026": "Sabbatical leave (no teaching)"}

EARLIER = {
    "Elizabethtown College (no course pages)": [
        "EGR 402 Senior Project in Engineering II",
    ],
    "University of Massachusetts Lowell": [
        ("EECE.2160 ECE Application Programming", "https://www.uml.edu/catalog/courses/EECE/2160"),
        ("EECE.7110 Special Topics: Heterogeneous Computing (now EECE.6540)", "https://www.uml.edu/catalog/courses/EECE/6540"),
        ("EECE.3170 Microprocessors Systems Design I", "https://www.uml.edu/catalog/courses/EECE/3170"),
        ("EECE.5520 Microprocessor Systems II & Embedded Systems", "https://www.uml.edu/catalog/courses/EECE/5520"),
    ],
}

SECTION_ORDER = ["", "overview", "schedule", "grading", "rubrics", "policy", "software", "proposal"]


def git_show(commit, path):
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=REPO, capture_output=True, text=True).stdout


def article(page_html):
    m = re.search(r'<div class="article-style">(.*?)</div>\s*(?:<div class="article-widget|<div class="body-footer|</article)',
                  page_html, re.S)
    return m.group(1) if m else ""


def page_title(page_html):
    for t in re.findall(r"<h1>(.*?)</h1>", page_html, re.S):
        t = html.unescape(re.sub(r"<[^>]+>", "", t)).strip()
        if t and t != "Search":
            return t
    return ""


def clean(fragment, sec_id, course, sub_ids):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", fragment, flags=re.S)
    # demote headings one level so each archived sub-page sits under its own <h2>
    s = re.sub(r"<(/?)h([1-5])\b", lambda m: f"<{m.group(1)}h{int(m.group(2)) + 1}", s)
    # namespace ids/anchors so sections can't collide
    s = re.sub(r'\bid="([^"]+)"', lambda m: f'id="{sec_id}-{m.group(1)}"', s)
    s = re.sub(r'href="#([^"]+)"', lambda m: f'href="#{sec_id}-{m.group(1)}"', s)
    # links to this course's own sub-pages -> in-page sections
    def relink(m):
        sub = (m.group(1) or "").strip("/")
        if sub in sub_ids:
            return f'href="#{sub_ids[sub]}"'
        return m.group(0)
    s = re.sub(r'href="(?:https?://[Pp]eilong\.github\.io)?/courses/%s/([^"#?]*)"' % re.escape(course), relink, s)
    return s.strip()


def term_key(term):
    season, year = term.split()
    return int(year), {"Spring": 1, "Summer": 2, "Fall": 3}[season]


def term_slug(term):
    season, year = term.split()
    return f"{year}-{season.lower()}"


def main():
    out_root = os.path.join(ROOT, "content/courses/archive")
    if os.path.isdir(out_root):
        shutil.rmtree(out_root)
    lineage_offerings = {key: {} for key, *_ in LINEAGES}
    semesters = []
    all_terms = sorted(set(OFFERINGS) | set(NO_ARCHIVE) | set(EXTERNAL) | set(NO_TEACHING), key=term_key)
    for term in all_terms:
        courses = OFFERINGS.get(term, [])
        sem = {"term": term, "slug": term_slug(term), "offerings": [], "note": NO_TEACHING.get(term, "")}
        for c in courses:
            commit, date = snapshot(REPO, term, c)
            files = subprocess.run(["git", "ls-tree", "-r", "--name-only", commit, f"courses/{c}/"],
                                   cwd=REPO, capture_output=True, text=True).stdout.split()
            subs = sorted({f[len(f"courses/{c}/"):-len("index.html")].strip("/") for f in files if f.endswith("index.html")},
                          key=lambda x: (SECTION_ORDER.index(x) if x in SECTION_ORDER else 99, x))
            sub_ids = {sub: f"sec-{sub or 'info'}" for sub in subs}
            sections, body = [], []
            course_title = page_title(git_show(commit, f"courses/{c}/index.html"))
            for sub in subs:
                page = git_show(commit, f"courses/{c}/{sub + '/' if sub else ''}index.html")
                label = "Course Info" if sub == "" else page_title(page) or sub.title()
                frag = clean(article(page), sub_ids[sub], c, sub_ids)
                if not frag:
                    continue
                sections.append({"id": sub_ids[sub], "label": label})
                body.append(f'<section id="{sub_ids[sub]}" class="arch-section">\n<h2>{html.escape(label)}</h2>\n{frag}\n</section>')
            code = " ".join(course_title.split()[:2]) if course_title else c.upper()
            url = f"/courses/archive/{term_slug(term)}/{c}/"
            fm = {"title": course_title, "code": code, "term": term, "lineage": LINEAGE_OF[c], "course_dir": c,
                  "type": "course-archive", "date": date, "sections": sections,
                  "source": {"repo": "Peilong/Peilong.github.io", "commit": commit, "date": date},
                  "summary": f"Archived {term} offering of {course_title}."}
            d = os.path.join(out_root, term_slug(term), c)
            os.makedirs(d, exist_ok=True)
            with open(os.path.join(d, "index.html"), "w") as f:
                f.write("---\n" + "".join(f"{k}: {json.dumps(v, ensure_ascii=False)}\n" for k, v in fm.items()) + "---\n")
                f.write("\n\n".join(body) + "\n")
            sem["offerings"].append({"course": c, "code": code, "title": course_title, "url": url, "kind": "archive", "note": ""})
            lineage_offerings[LINEAGE_OF[c]][term] = {"url": url, "code": code, "kind": "archive", "note": "", "former": c != LINEAGE_OF[c]}
        for c, note in NO_ARCHIVE.get(term, []):
            title = OLD_TITLES[c]; code = " ".join(title.split()[:2])
            assert c not in courses, (term, c)
            sem["offerings"].append({"course": c, "code": code, "title": title, "url": "", "kind": "none", "note": note})
            lineage_offerings[LINEAGE_OF[c]][term] = {"url": "", "code": code, "kind": "none", "note": note, "former": c != LINEAGE_OF[c]}
        for c, title, url, note in EXTERNAL.get(term, []):
            code = " ".join(title.split()[:2])
            sem["offerings"].append({"course": c, "code": code, "title": title, "url": url, "kind": "external", "note": note})
            lineage_offerings[LINEAGE_OF[c]][term] = {"url": url, "code": code, "kind": "external", "note": note, "former": False}
        sem["offerings"].sort(key=lambda o: o["code"])
        semesters.append(sem)

    # Live course pages (current versions) for links from the landing page.
    def live(c):
        p = os.path.join(ROOT, "content/courses", c, "_index.md")
        if not os.path.exists(p):
            return None
        s = open(p).read()
        title = re.search(r"^title:\s*(.+)$", s, re.M).group(1).strip().strip('"')
        summary = re.search(r"^summary:\s*(.+)$", s, re.M)
        subs = sorted(x[:-3] for x in os.listdir(os.path.dirname(p)) if x.endswith(".md") and x != "_index.md")
        return {"title": title, "summary": summary.group(1).strip().strip('"') if summary else "",
                "url": f"/courses/{c}/", "pages": subs}

    current = {"term": CURRENT["term"], "courses": []}
    for c in CURRENT["courses"]:
        info = live(c)
        if info:
            code = " ".join(info["title"].split()[:2])
            current["courses"].append({"course": c, "code": code, "title": info["title"][len(code):].strip(),
                                       "summary": info["summary"], "url": info["url"],
                                       "links": [{"label": {"policy": "Policies"}.get(l, l.title()), "url": f"/courses/{c}/{l}/"}
                                                 for l in ["schedule", "overview", "policy"] if l in info["pages"]]})
        else:
            n = NEW_COURSES[c]
            current["courses"].append({"course": c, "code": n["code"], "title": n["title"], "summary": n["summary"], "url": "", "links": []})

    rows = []
    for key, code, title, members, former in LINEAGES:
        cur = live(key)
        rows.append({"key": key, "code": code, "title": title, "former": former,
                     "url": cur["url"] if cur else "", "offerings": lineage_offerings[key]})
    terms = [s["term"] for s in semesters]
    data = {"current": current, "terms": terms, "rows": rows, "semesters": list(reversed(semesters)),
            "earlier": [{"place": k, "items": [({"title": i[0], "url": i[1]} if isinstance(i, tuple) else {"title": i, "url": ""}) for i in v]}
                        for k, v in EARLIER.items()]}
    os.makedirs(os.path.join(ROOT, "data"), exist_ok=True)
    json.dump(data, open(os.path.join(ROOT, "data/teaching.json"), "w"), indent=1, ensure_ascii=False)
    n_arch = sum(o["kind"] == "archive" for s in semesters for o in s["offerings"])
    n_all = sum(len(s["offerings"]) for s in semesters)
    print(f"offerings: {n_all} (archived pages: {n_arch})  semesters: {len(semesters)}  rows: {len(rows)}")


if __name__ == "__main__":
    main()
