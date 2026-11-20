---
title: "For Chairs: Course Offerings, Teaching Loads and Schedules"
subtitle: "Part 8 of 9 in AI at a Small College"
summary: "Chatbots are poor at building schedules, but optimization software, a different kind of tool, does this job well. Here is how a chair can forecast demand, write down the department's rules, and get a balanced first draft of teaching assignments, with AI handling the paperwork around it."
authors: ["admin"]
tags: ["AI at a Small College", "AI in Education", "Academic Administration"]
categories: ["AI in Education"]
date: 2026-12-07T07:00:00-05:00
lastmod: 2026-12-07T07:00:00-05:00
featured: false
draft: false

image:
  caption: ""
  focal_point: ""
  preview_only: false

projects: []
---

*Part 8 of 9 in the series [AI at a Small College](/tags/ai-at-a-small-college/).*

Every year, a department chair solves a puzzle. Which courses run, and how many sections? Who teaches what, given everyone's load, sabbaticals and course releases, the elective rotation, the general-education commitments, preferences and an adjunct budget? And when does each section meet without colliding with the courses majors take together? Most chairs solve it in a spreadsheet over several evenings, and then solve it again when someone's leave changes.

National data suggest the result is often far from ideal. In a 2024 benchmark report covering 1.3 million students, scheduling-software company Ad Astra found:

- **Underused courses:** 45% of courses were underused.
- **Demand balance:** only a third were balanced with student demand.
- **Crowded time slots:** 83% of sections crowded into prime-time hours.
- **Blocked paths:** 71% of programs' "paths to completion" were blocked by gaps in the schedule.

Those numbers come from a vendor, but they match what many registrars report.

## Why a chatbot is the wrong tool for this

It is tempting to paste everything into a chatbot and ask for a schedule. The research is clear that this does not work well:

- **Feasibility drops with size.** Tested as stand-alone schedulers, even the best AI models produced a valid timetable only about 80% of the time on *small* problems, and did worse as problems grew.
- **Feedback doesn't fix it.** Asking them to fix their own mistakes was described as "unstable and unreliable".
- **Weights shift with wording.** When AI models are asked how much each preference should matter, their answers change depending on the order the options are listed in.

A different kind of software, **optimization solvers**, does this job well. These are the tools airlines and factories use for scheduling. You describe the rules ("every section needs a qualified instructor", "no one exceeds their load", "this course runs every other fall"). The solver then searches for the best arrangement, and can tell you when no arrangement satisfies every rule. In a prototype tested on made-up data for this series, an open-source solver assigned instructors for a college-sized problem, **456 sections and 108 instructors**, with a mathematically proven best balance of teaching loads in **under five seconds** on a laptop.

So the division of labor is clear:

- **The solver decides** the assignments.
- **AI helps with the words around it:** turning your policy memo into a checklist of rules, answering "what if?" questions by re-running the solver, and explaining the result in plain language.

## Step 1: Forecast demand simply

You don't need anything fancy. With 8 to 10 years of enrollment history, a simple approach works well.

1. **Get census-date enrollments** per course per term from the registrar or institutional research.
2. **Average the last three years of the same season** (fall with fall, spring with spring). In a test on made-up data, this simple average predicted almost as well as a statistical model.
3. **Treat full sections as "at least this many".** A capped section hides how many students actually wanted in.
4. **For upper-level major courses, count the pipeline.** Ask the registrar how many students' degree audits still list each course, by class year. This shows rising demand two years before averages do. Ask for counts only, not names.
5. **Plan for the high end.** If a course's enrollment swings, plan for a number you would exceed only about one year in five.

## Step 2: Write the rules down

Write the memo you would send your dean: loads, leaves, releases, rotations, who can teach what, general-education commitments and preferences. Then use AI to turn it into a checklist you can verify:

```text
Here is my department's staffing memo for next year (instructors are identified by codes
like F01, not names). Turn it into a numbered checklist of rules. For each rule give:
the rule in one plain sentence; whether it is a MUST or a PREFERENCE; and the exact quote
from my memo it comes from. List anything you could not turn into a clear rule under
"NEEDS DECISION". Do not add rules that are not in my memo.
```

Check every rule against its quote. Use codes, not names, unless your tool is approved for personnel information.

## Step 3: Gather five simple spreadsheets

Any solver, whether a colleague's script or a registrar's software, needs the same five lists. Building them is most of the work, and useful on its own:

1. **Instructors:** code, rank, target load per term, leaves and releases.
2. **Who can teach what:** instructor code and course pairs.
3. **Sections needed:** course, term and number of sections (from Step 1).
4. **Time blocks:** the meeting patterns your college uses.
5. **Preferences:** instructor code, course or time, and how strongly.

Keep the code-to-name key separately, and never include salaries.

## Step 4: Get a first draft from a solver

Options, from least to most effort:

- **Ask a quantitative colleague or institutional research.** Free, open-source solvers handle department and college-sized problems easily. I have a prototype, tested on made-up data, that reads the five spreadsheets above and produces a balanced assignment plus a load summary. I'm happy to share it.
- **For registrars:** UniTime, an open-source course-timetabling system, can be piloted on test data.
- **Commercial scheduling platforms** offer similar optimization, with support.

Ask for two things with every draft:

- **A list of sections no qualified instructor is free to teach.** This turns a hidden problem into a clear hire-or-cancel decision.
- **A minimal-change option for "what if" questions.** In the prototype, re-solving from scratch after one change moved 9 sections. Re-solving while keeping as much of the plan as possible moved only the 3 that had to change. Faculty trust a plan that doesn't reshuffle with every adjustment.

## Step 5: Check fairness, then sign off

Before anything goes out, look at two things by rank (tenure-track, non-tenure-track, adjunct):

- how far each person's load is from their target;
- how many of their preferences were met.

Optimization can quietly shift introductory and general-education sections toward non-tenure-track or adjunct faculty unless a rule you approved says so. Then follow a sign-off order everyone can see:

1. You draft the rules, and the solver drafts the plan.
2. You review loads and any sections with no qualified instructor.
3. Faculty get a review window to correct preferences.
4. You and the dean approve.
5. The registrar enters it.

## What AI should never do here

- **Choose how much each preference matters.** That is a policy decision for you.
- **Claim a schedule works** without the solver confirming it.
- **Make final staffing decisions.**
- **See personnel information** in a tool not approved for it. Leaves, preferences and costs are personnel data.

## Try it this week

1. **Ask your registrar** for eight years of census enrollments for your department's courses, plus counts of students whose audits still list each upper-level course.
2. **Compute the same-season three-year averages** in a spreadsheet, and mark which sections were full.
3. **Write your staffing memo** with instructor codes, and turn it into a rule checklist with the prompt above.
4. **Build the five spreadsheets.** Even without a solver, you'll see conflicts sooner.

Next time, the last part: committee work, accreditation, and how to measure whether any of this is saving time.

*Chairs and registrars interested in the prototype can write to me at lip AT etown DOT edu.*

## Sources

- Ad Astra, [2024 Benchmark Report](https://4523134.fs1.hubspotusercontent-na1.net/hubfs/4523134/2024%20Content%20Pieces/Ad-Astra-Benchmark-Report-02-2024.pdf) (vendor report)
- [Assessing LLMs as autonomous solvers for university course timetabling](https://www.iajit.org/paper/5453/Assessing-the-Effectiveness-of-LLMs-as-Autonomous-Solvers-for-University-Course-Timetabling), *IAJIT* (2026)
- [Formalize, Don't Optimize](https://arxiv.org/abs/2605.12421) (2026) and [order effects in LLM preference weights](https://arxiv.org/pdf/2610.23673) (2026)
- OptiGuide, [LLMs that answer what-if questions by re-running a solver](https://ar5iv.labs.arxiv.org/html/2307.03875)
- Google OR-Tools, [CP-SAT solver](https://developers.google.com/optimization/cp/cp_solver)
- Apereo, [UniTime](https://www.apereo.org/programs/software/unitime)
