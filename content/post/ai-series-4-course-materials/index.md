---
title: "Course Materials You Can Trust: Quizzes, Handouts, Slides and Accessibility"
subtitle: "Part 4 of 9 in AI at a Small College"
summary: "AI-written quiz questions can perform as well as expert-written ones, but they fail in predictable ways. Here is a routine for quizzes, handouts and slides that catches those failures, plus the accessibility deadlines worth knowing about."
authors: ["admin"]
tags: ["AI at a Small College", "AI in Education", "Assessment", "Accessibility"]
categories: ["AI in Education"]
date: 2026-11-29T07:00:00-05:00
lastmod: 2026-11-29T07:00:00-05:00
featured: false
draft: false

image:
  caption: ""
  focal_point: ""
  preview_only: false

projects: []
---

*Part 4 of 9 in the series [AI at a Small College](/tags/ai-at-a-small-college/).*

Can AI write a good quiz question? Recent studies say yes, often. In a study of 91 classes and about 1,700 students, AI-written questions refined through several rounds of critique performed comparably to expert-written exam questions when measured on real students. Another study found no significant difference between ChatGPT-written and human-written items.

The same research shows **predictable failure modes**. In one study of 651 AI-generated multiple-choice questions, some had **more than one correct answer**, and some had a wrong option that **gave away the right one**. Quality also drops when one request tries to do too much: in a 2025 study of generated exercises, tasks covered every requested concept 94% of the time with one concept, but only 40% of the time with three.

So the routine is simple: one concept per request, generate from your own material, and check for the known failures.

## Quizzes and question banks

Use your course workspace from [Part 3](/post/ai-series-3-planning-a-course/), with your notes or the reading attached, and ask for a few questions at a time on **one** learning goal:

```text
Using ONLY the attached [lecture notes / chapter], write 4 multiple-choice questions on
this single learning goal: "[paste one learning goal]".
For each question give:
- the question and four options (A-D), exactly one correct;
- the correct answer;
- for EACH wrong option, the specific misunderstanding it represents;
- the sentence from my material that supports the correct answer.
Vary difficulty: one recall, two application, one that requires comparing or judging.
Do not use "all of the above" or "none of the above".
```

Asking for the misunderstanding behind each wrong option does two things. You can quickly spot a distractor that is accidentally correct. And the explanations can go straight into feedback, so students who pick that option learn what they missed.

Before any question reaches students, run this five-point check:

1. **Exactly one correct answer?** Read each wrong option and ask, "Could a strong student defend this?"
2. **No giveaways?** Watch for a correct option that is noticeably longer or more precise, or that repeats words from the question.
3. **Supported by your material?** The quoted sentence should actually say what the question assumes.
4. **Right difficulty?** Would this distinguish a student who understands from one who memorized?
5. **Any numbers, code, formulas or data worked out yourself?** Don't trust AI arithmetic or code you have not run.

**Getting questions into your LMS.** Typing a few questions in by hand is fine. For larger banks, Canvas can import question files in a standard format called QTI, and Moodle imports formats called GIFT and Moodle XML. Ask your instructional technologist to set up a template once. Some colleges have also turned on Canvas's own AI question generator (IgniteAI Question Authoring, in preview since December 2025), which writes questions from your course content.

**After the quiz, let the data improve it.** Your LMS's quiz statistics show, for each question, how many students got it right and whether stronger students did better on it than weaker ones. Flag questions that are:

- nearly everyone right or nearly everyone wrong;
- answered no better by strong students than by weak ones;
- carrying a wrong option nobody chose.

Paste the flagged question and its statistics (no student names) into your workspace and ask why it might be underperforming and how to revise it. A question bank improved this way gets better every term.

## Handouts, study guides and slides

The same rules apply. Generate from your material, one section at a time, and check for errors.

- **Study guides and summaries:** tools like NotebookLM can produce a summary, a study guide or practice questions from the sources you upload, with links back to the passages they used. Check those links. Edit for emphasis: the AI doesn't know what you stressed in class.
- **Worked examples** (math, statistics, economics, chemistry, logic): ask for the solution first, then ask it to divide the solution into steps, then to explain each step for a beginner. Then **work the problem yourself**.
- **Slides:** ask for an outline with one idea per slide and speaker notes, then build the deck in your usual tool (PowerPoint and Google Slides both have built-in AI options). Keep slides sparse and put the detail in the notes.

## Accessibility: AI drafts, a human checks

Accessibility is about to matter more:

- **Public colleges and universities** must meet the WCAG 2.1 AA web accessibility standard. A federal rule sets the deadline for larger public institutions at **April 26, 2027**.
- **Private colleges** are covered by other disability laws instead (ADA Title III and Section 504). If a college receives funding from the Department of Health and Human Services, such as NIH grants, a separate HHS rule requires the same standard by **May 11, 2027** for institutions with 15 or more employees. Your grants office can tell you whether that applies.

Either way, the standard is the same, and AI makes the work faster.

**Alt text for images and charts.** Many images in course materials are public or internal information, so a licensed AI tool that can read images is a good fit:

```text
Write alt text (125 characters or fewer) for this image as used in a [course] slide about
[topic]. Describe what matters for the learning goal, not decoration. If it is a chart,
also write a long description (150 words or fewer) giving the axes, units, overall trend
and key values. If the image is purely decorative, reply DECORATIVE.
```

Check every result. AI sometimes misreads chart values.

**Captions and transcripts.** Use the automatic captions in your video platform (for example Panopto, Kaltura, YouTube, Zoom or Teams), then correct them. Automatic captions most often get wrong:

- names;
- technical terms;
- formulas;
- words in other languages.

Ten minutes of correction per lecture is typical once you know what to look for.

**Scanned PDFs.** A scanned page is an image, so screen readers cannot read it. Ask your library or accessibility office about OCR (text recognition). Where possible, put the content on an LMS page rather than in a PDF, because LMS pages are usually easier to make accessible.

## Try it this week

1. **Pick one class meeting** coming up and one learning goal for it.
2. **Generate four questions** with the prompt above.
3. **Run the five-point check.** Count how many questions you kept unchanged, edited or discarded, and write down how long it took.
4. **Write alt text** for three images in your next slide deck using the prompt above, and check each one.

Next time: feedback and grading, where the evidence is most mixed, and how to tell whether AI is actually saving you time.

*Questions or a discipline-specific example to share? Write to me at lip AT etown DOT edu.*

## Sources

- Isley et al., [AI-generated assessment items compared with expert items](https://arxiv.org/abs/2508.08314) (2025)
- Bhandari et al., [ChatGPT-generated vs. human-written test items](https://doaj.org/article/eac7a747885b4416ac405d13b03face0), *Computers & Education: AI* (2024)
- Doughty et al., [GPT-4 multiple-choice questions aligned to learning objectives](https://arxiv.org/abs/2312.03173), ACE 2024
- Jacobs et al., [Generating programming tasks with multiple concepts](https://arxiv.org/abs/2503.11704) (2025)
- Instructure Community, [IgniteAI Question Authoring](https://community.instructure.com/en/discussion/664351/igniteai-question-authoring-for-quizzes)
- Federal Register, [DOJ ADA Title II compliance-date extension](https://www.federalregister.gov/documents/2026/04/20/2026-07663/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web) (April 2026) and [HHS Section 504 compliance-date extension](https://www.federalregister.gov/documents/2026/05/11/2026-09266/extension-of-compliance-dates-for-nondiscrimination-on-the-basis-of-disability-accessibility-of-web) (May 2026)
- EDUCAUSE Review, [DOJ and HHS extend web accessibility deadlines](https://er.educause.edu/articles/2026/6/doj-and-hhs-extend-web-accessibility-deadlines-to-2027-2028) (2026)
