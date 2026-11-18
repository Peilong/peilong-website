"""Teaching inventory recovered from the published site's git history (Peilong.github.io).
Each offering = (term, course dir). Snapshot = last commit touching that course inside the term's window."""
import subprocess, datetime
OFFERINGS = {
  "Spring 2020": ["cs121", "cs222", "ds200", "cs400", "cs495"],
  "Fall 2020":   ["cs121", "ds300", "ds420", "ds495", "cs495"],
  "Spring 2021": ["cs113", "cs222", "ds200", "ds495", "cs400"],
  "Fall 2021":   ["cs121"],
  "Spring 2022": ["cs222", "ds200", "ds420", "ds495"],
  "Fall 2022":   ["cs121", "ds300", "cs363", "cs400"],
  "Spring 2023": ["cs121", "cs222", "ds420", "ds400", "cs400"],
  "Fall 2023":   ["cs121", "cs363"],
  "Spring 2024": ["cs222", "ds200", "cs364"],
  "Fall 2024":   ["cs122", "cs250", "cs350"],
  "Spring 2025": ["cs222", "cs230", "cs354"],
  "Fall 2025":   ["cs122", "cs250", "cs363"],
  "Spring 2026": ["cs230", "cs350", "cs364"],
}
EXCLUDE = {"2024-08-12"}   # "sync old computer files": republished stale versions

def window(term):
    season, y = term.split(); y = int(y)
    if season == "Spring":
        return datetime.date(y - 1, 11, 15), datetime.date(y, 7, 31)
    return datetime.date(y, 6, 1), datetime.date(y + 1, 1, 5)

def snapshot(repo, term, course):
    lo, hi = window(term)
    out = subprocess.run(["git", "log", "--format=%h %ad", "--date=short", "--", f"courses/{course}"],
                         cwd=repo, capture_output=True, text=True).stdout.split("\n")
    for line in out:                      # newest first
        if not line: continue
        h, d = line.split()
        if d in EXCLUDE: continue
        if lo <= datetime.date.fromisoformat(d) <= hi:
            return h, d
    return None, None
