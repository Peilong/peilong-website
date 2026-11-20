---
title: "Planning a Course with AI: From Learning Goals to a First-Draft Syllabus"
subtitle: "Part 3 of 9 in AI at a Small College"
summary: "A step-by-step routine for using AI as a planning partner: write learning goals, align assignments to them, map the weeks and find readings, with the checks that keep the result yours and correct."
authors: ["admin"]
tags: ["AI at a Small College", "AI in Education", "Course Design"]
categories: ["AI in Education"]
date: 2026-11-27T07:00:00-05:00
lastmod: 2026-11-27T07:00:00-05:00
featured: false
draft: false

image:
  caption: ""
  focal_point: ""
  preview_only: false

projects: []
---

*Part 3 of 9 in the series [AI at a Small College](/tags/ai-at-a-small-college/).*

Course planning is where AI earns its keep for most faculty. It is also where its mistakes are easiest to miss. In the California State University system's fall 2025 survey, developing course materials was the most common way faculty used AI, at 55%. This post gives a routine that works in any discipline, whether you teach organic chemistry, first-year writing or a studio course. It follows the familiar "backward design" order:

1. Decide what students should be able to do.
2. Decide how you will know they can do it.
3. Plan the weeks.

AI drafts each step; you decide.

## Step 1: Set up a course workspace (15 minutes, once)

Most licensed AI tools now let you save instructions and files in one place, so you don't start from scratch each time. Depending on what your college offers, that place might be a NotebookLM notebook, a Gemini Gem, a ChatGPT project or custom GPT, a Claude project or a Copilot notebook.

Create one for the course and add:

- the catalog description and any department or general-education outcomes the course must meet;
- your last syllabus and schedule, if you have taught it before;
- your own notes on what worked and what did not;
- openly licensed or library-provided readings you already plan to use.

**Do not add student work, grades or student comments** (see [Part 2](/post/ai-series-2-before-you-paste/)).

Then paste in standing instructions, so every request follows the same rules:

```text
You are helping me plan [COURSE NAME], a [level, e.g., 200-level] course in [discipline]
for [who takes it, e.g., sophomores, mostly non-majors] at a small liberal arts college.
Work only from the files I provided and what I tell you. Never invent readings, citations,
page numbers, dates or college policies. When you need one, write [READING NEEDED],
[DATE NEEDED] or [POLICY NEEDED] instead. Keep suggestions realistic for a class of
[number] students meeting [days and length]. Ask me a question if something is unclear.
```

## Step 2: Draft learning goals (15 minutes)

```text
Draft 5 to 7 learning outcomes for this course. Each must start with an observable verb
(analyze, design, compare, explain, create...), fit the catalog description, and be
something a student could show in [the number of weeks] weeks. For each outcome, add one
sentence on how a student would demonstrate it. Mark which outcomes cover the department
or general-education outcomes in my files.
```

Read the list against your own sense of the course. Expect to rewrite. The value is a structured starting point and options you might not have considered, not a finished answer. Cut anything that sounds generic, such as "develop critical thinking skills", unless you can say exactly how students will show it.

## Step 3: Align assignments to the goals (20 minutes)

```text
For the outcomes I approved (pasted below), propose a set of assessments for the semester.
For each, give: which outcomes it measures, format, approximate student hours, and when in
the term it fits. Include at least one assessment that students complete in class or
explain orally, so it shows their own understanding. Finish with a table: rows = outcomes,
columns = assessments, cells = how strongly each assessment measures each outcome.
```

That last table, an alignment map, is the most useful thing in this step. It shows outcomes that nothing measures and assignments that measure nothing you care about. Check the student-hours column against your college's credit-hour expectations. AI is often optimistic about how long things take.

## Step 4: Map the weeks, but do the dates yourself

AI tools are unreliable at calendar arithmetic, such as which weekday a holiday falls on or how many class meetings fit before break. So **build the calendar first**:

1. Open your college's academic calendar.
2. Type every class meeting date into a simple table in a document or spreadsheet, and mark holidays and breaks.

Then ask AI only to fill topics into the rows you made:

```text
Here is my table of class meetings (dates already filled in; do not change them).
Fill in the Topic and Preparation columns so the course builds toward the assessments
in the order I approved. Keep one main topic per meeting. Put [READING NEEDED] wherever
a reading should go. Leave the rows marked BREAK empty.
```

## Step 5: Find readings yourself

**Never accept a citation an AI suggests without finding the source yourself.** In a 2025 study, GPT-4o fabricated almost 1 in 5 of the references it produced, and fabrication was worse on specialized topics, which is exactly where faculty need help. Ask instead for search terms and the kinds of sources to look for:

```text
For each [READING NEEDED] slot, suggest 3 search phrases I could use in our library
databases and the type of source that would fit (primary source, review article,
textbook chapter, case study, dataset). Do not name specific titles or authors.
```

Then search your library's databases or ask your subject librarian. Only list what you have actually opened.

## Step 6: Write the policies in your own voice

AI can draft standard syllabus sections such as attendance, late work and accessibility. Start from your college's required syllabus language. Your **AI-use policy for students** is worth writing yourself, because it signals what you value. A useful structure:

1. Where AI is welcome.
2. Where it is not.
3. How students should disclose AI use.
4. What happens if they don't.

## Step 7: Keep it yours

According to the US Copyright Office, prompts alone don't make you the author of what AI generates, but your selection, arrangement and revision can be protected. Beyond copyright, the course should sound like you. Keep a short "changes" note as you edit: what you cut, rewrote or added. That note also becomes your starting point next year.

## Next year: revise from evidence

At the end of the term, add to the workspace:

- your "changes" note;
- your reflections;
- **aggregate** results only, such as which quiz questions most students missed, or the three most common themes in course evaluations, with no names and no quotes from small classes.

Then ask:

```text
Using my notes and these aggregate results, suggest the three revisions most likely to
improve student learning next term. For each, say which outcome it serves, what evidence
in my files supports it, and what it would cost me in preparation time.
```

## Try it this week

1. **Pick a course** you will teach next term.
2. **Do Steps 1 to 3.** Plan on about 50 minutes.
3. **Compare the alignment map** with your current syllabus. Find one outcome that nothing measures well, or one assignment that doesn't map to any outcome.
4. **Write down the minutes it took**, and whether the result was better than what you would have done alone.

Next time: making quizzes, handouts and slides with AI, and catching the specific mistakes AI tends to make.

*Have a planning prompt that works well in your discipline? Send it to me at lip AT etown DOT edu, and I may include it in a later post.*

## Sources

- Inside Higher Ed, [California State University faculty AI survey](https://www.insidehighered.com/index%2ephp/node/206321) (fall 2025)
- UConn eCampus, [Backward design with AI](https://ecampus.uconn.edu/?p=12928)
- JMIR, [Citation fabrication by GPT-4o](https://mental.jmir.org/2025/1/e80371) (2025)
- US Copyright Office, [Copyright and Artificial Intelligence, Part 2: Copyrightability](https://copyright.gov/newsnet/2025/1060.html) (2025)
