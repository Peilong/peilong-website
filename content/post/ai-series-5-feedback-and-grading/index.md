---
title: "Feedback and Grading: Where AI Helps and Where It Slows You Down"
subtitle: "Part 5 of 9 in AI at a Small College"
summary: "The evidence on AI feedback is the most mixed in this series. Here is how to keep the grade human, use AI where it measurably helps, and find out in two weeks whether it is saving you time or costing you."
authors: ["admin"]
tags: ["AI at a Small College", "AI in Education", "Assessment", "Feedback"]
categories: ["AI in Education"]
date: 2026-12-01T07:00:00-05:00
lastmod: 2026-12-01T07:00:00-05:00
featured: false
draft: false

image:
  caption: ""
  focal_point: ""
  preview_only: false

projects: []
---

*Part 5 of 9 in the series [AI at a Small College](/tags/ai-at-a-small-college/).*

Grading is where most of us would most like help, and where the research says to be most careful. Here is what recent studies found:

- **Drafts can slow you down.** In a randomized study presented at the 2025 SIGCSE computing-education conference, teaching assistants given AI-drafted feedback took *significantly longer* than those who wrote their own. Some trusted the drafts and missed the AI's mistakes, and student test scores did not improve.
- **AI feedback can mislead.** In another 2025 study, AI feedback on students' plain-English explanations sometimes reinforced their misconceptions.
- **Agreement with teachers is only moderate.** Across four years of an introductory course, the best AI model reached only moderate agreement with teachers' grades.
- **Teachers disagree too.** In one experiment, 28 graders could not agree on grades for the same 40 assignments.
- **Specific rubrics help a lot.** When each question had its own detailed rubric, AI scores tracked human scores closely.

The lesson is not "never use AI for feedback". It is: **the rubric decides, AI drafts the words, and a person assigns the grade.** Then measure whether it actually helps you.

## Step 1: Make the rubric specific

A vague rubric produces vague AI feedback, and vague human feedback too. For your next assignment, write each rubric row as observable features at each level, not adjectives.

- **Weak:** "Strong argument."
- **Better:** "States a claim in the first paragraph; supports it with at least two pieces of evidence from the assigned sources; addresses one counterargument."

AI can help you draft a rubric from your assignment prompt and learning goals. You decide what each level means.

## Step 2: Calibrate before you grade

Before a big assignment, grade the same five to ten submissions with your co-instructors or TAs, with names removed. If you like, add an AI draft as one more "grader". Discuss where you disagreed and tighten the rubric. Research on grading consistency shows that this kind of session helps whether or not AI is involved. It is also the cheapest way to see how the AI reads your rubric.

## Step 3: Use AI for the words, not the grade

With an approved tool ([Part 2](/post/ai-series-2-before-you-paste/)) and with names and IDs removed from the submission, ask for short feedback tied to rubric rows:

```text
Here is my rubric (pasted) and a student submission with the name removed.
For each rubric row, write ONE or TWO sentences of feedback addressed to the student:
first what the work does well (quote a short phrase from it), then the single most
useful next step. Do not assign a score or grade. Do not comment on anything outside
the rubric. If you are unsure whether the work meets a criterion, say "[INSTRUCTOR CHECK]".
```

Then read the submission yourself, assign the grade, and edit the feedback until it says what you would say. Keep the AI's sentences short and tied to rubric rows. Long, open-ended AI commentary is what slowed reviewers down in the study above.

**A faster alternative many faculty prefer: a feedback bank.** Before grading, give the AI your rubric and the assignment prompt and ask for 3–4 comment templates per rubric row and level. Edit them once. While grading, pick and adjust from your bank. No student work goes into AI at all, and you stay in control of every comment.

## Tools built for parts of this

- **Paper exams and worksheets:** Gradescope's AI-assisted answer grouping clusters similar answers on fixed-template assignments, so you grade each group once. The instructor reviews every group. Turnitin, which makes Gradescope, states plainly that the AI "does not autograde".
- **Problems with right answers** (computation, code, short numeric answers): automatic checking (built-in LMS quiz questions, or autograders in programming courses) is more reliable than any AI judgment. Save your time for the parts that need a person.

## Course evaluations: faster themes, checked quotes

Reading course-evaluation comments for themes is a task where AI clearly saves time: in one study, about 10–15 minutes against 27 minutes by hand. The agreement with human readers was uneven, though, so use this routine:

1. **Remove names**, including your own and TAs', and any identifying details.
2. **Be careful with small classes.** In a seminar of 12, writing style and project topics can identify students. Keep those comments on your college's most protected tool, or read them yourself.
3. **Run the analysis twice and keep only the themes that appear both times.**
4. **Verify every quoted comment** against the original before you rely on it.

```text
Here are anonymous course-evaluation comments. Identify up to 6 themes. For each theme:
a one-sentence description, how many comments mention it, and 2 short quotes copied
EXACTLY from the comments. Separate praise, criticism and suggestions. Do not infer
anything about who wrote a comment.
```

## Step 4: Measure, then decide

Because the evidence is mixed, your own numbers matter most. For one assignment:

1. Grade five submissions your usual way and time each one.
2. Grade five with your chosen AI routine (feedback bank or drafts) and time each one, including checking.
3. Compare the minutes, and also the quality: would a student learn more from one set of comments than the other?

If AI made you slower or your feedback worse, stop using it for that task. That is useful knowledge, not wasted effort.

## Try it this week

1. **Pick an assignment** you will grade in the next two weeks.
2. **Rewrite one rubric row** as observable features at each level.
3. **Build a feedback bank** for that row with AI, and edit it.
4. **Run the five-and-five timing comparison above**, and write down the result.

Next time: an AI tutor for every student, and how to stop it from simply giving away answers.

*Tried a routine that worked, or one that didn't? I'd like to hear about it: lip AT etown DOT edu.*

## Sources

- Ahmed et al., [Augmenting teaching assistants with AI for CS1 programming feedback](https://www.comp.nus.edu.sg/~bleong/publications/sigcse25-AI-augmented%20TAs.pdf), SIGCSE 2025
- Kerslake et al., [Student reactions to LLM-generated feedback on "Explain in Plain English" problems](https://sigcse2025.sigcse.org/details/sigcse-ts-2025-Papers/68/Exploring-Student-Reactions-to-LLM-Generated-Feedback-on-Explain-in-Plain-English-Pro), SIGCSE 2025
- [Four years of LLM grading in an introductory course](https://arxiv.org/html/2509.26483v1) (2025)
- [Human graders' agreement on CS1 assignments](https://www.arxiv.org/pdf/2409.12967) (2024)
- [Question-specific rubrics and LLM grading](https://arxiv.org/html/2503.23989v1) (2025)
- Gradescope, [AI-assisted answer groups](https://guides.gradescope.com/hc/en-us/articles/24838908062093); Turnitin, [design principles of AI-assisted grading](https://turnitin.com/blog/design-principles-of-ai-assisted-grading)
- BMC Medical Education, [AI analysis of course-evaluation comments](https://bmcmededuc.biomedcentral.com/articles/10.1186/s12909-024-05316-2) (2024); University at Buffalo, [selective alignment of LLM sentiment with human raters](https://researchconnect.buffalo.edu/en/publications/llm-sentiment-quantification-reveals-selective-alignment-with-hum/)
