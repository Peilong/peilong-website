# Course archive

Generates the Courses page data (`data/teaching.json`) and one archived page per past course
offering (`content/courses/archive/<yyyy-season>/<course>/index.html`) from the git history of the
published site (`public/`, i.e. Peilong/Peilong.github.io).

```sh
python3 scripts/course-archive/build_archive.py "$PWD"
```

Each semester:
1. `offerings.py` – add the semester that just ended to `OFFERINGS` (term -> course folders).
2. `build_archive.py` – set `CURRENT` to the new semester; add any taught-but-not-archived
   offerings to `NO_ARCHIVE` and semesters without teaching to `NO_TEACHING`.
3. Run the script, build with `hugo`, and publish as usual.

Templates: `layouts/courses/courses-home.html` (landing page), `layouts/course-archive/single.html`
(archived offering) and `layouts/partials/docs_layout.html` ("Past offerings" line on course pages).
