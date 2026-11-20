---
title: "AI for Faculty Advisors: Meeting Prep Without Risking Student Records"
subtitle: "Part 7 of 9 in AI at a Small College"
summary: "AI makes up degree requirements when it works from memory, and risk-prediction tools carry documented bias. Here is a safer way for faculty advisors to use AI: look requirements up, prepare better questions, write follow-ups faster, and keep every decision human."
authors: ["admin"]
tags: ["AI at a Small College", "AI in Education", "Academic Advising", "Data Privacy"]
categories: ["AI in Education"]
date: 2026-12-05T07:00:00-05:00
lastmod: 2026-12-05T07:00:00-05:00
featured: false
draft: false

image:
  caption: ""
  focal_point: ""
  preview_only: false

projects: []
---

*Part 7 of 9 in the series [AI at a Small College](/tags/ai-at-a-small-college/).*

At a liberal arts college, most advising is done by faculty. Each of us might have 15 to 40 advisees, meet each of them two to four times a year, and have little time to re-read the catalog before each meeting. AI looks like the perfect assistant. The research says it can be, but only if it **looks things up instead of remembering them**.

## What the research says

- **AI invents requirements when it works from memory.** One 2026 research system found that a plain AI model "frequently proposes ineligible or nonexistent courses". When the same system made the AI work from the actual catalog and checked its suggestions with rules, its answers' similarity to expert advisors' rose from 0.68 to 0.93.
- **Advisors often disagree with AI advice.** In a Berkeley study, advisors rated GPT-4's explanations highly (4.0 out of 5) but **agreed with its recommended majors only 33% of the time**. Other studies found AI tools steering women toward social sciences and men toward engineering.
- **Risk scores can be biased.** Common student-success prediction models falsely predicted failure for 19% of Black and 21% of Hispanic students, compared with 12% of White and 6% of Asian students. Standard fixes did not remove the gap.
- **Simple, transparent nudges worked.** The strongest causal evidence comes from Georgia State, where a scripted, non-generative chatbot sent course-specific reminders. Students who received them were 4 percentage points more likely to earn an A or B, with consistent effects across demographic groups.

The practical rule follows: **requirements come from the catalog and the degree audit, not from the AI.** The AI helps you find, organize and write. You and the official records decide.

## The privacy line

As an advisor, you may see your advisees' records. Putting those records into an AI tool is a separate question ([Part 2](/post/ai-series-2-before-you-paste/)):

- **Use only tools your college has approved for student records.** If none is approved, use AI only with the public catalog and with your own notes after removing anything identifying.
- **Share the minimum.** For planning, the AI needs course codes, grades, terms and credits. It never needs a name, ID number, email address or personal circumstances.
- **Never upload a whole transcript or degree-audit PDF.** These carry names and IDs on every page.

## Step 1: Build a catalog assistant (30 minutes, once a year)

The catalog is public, so any licensed tool is fine for this step.

1. Create a notebook or project (for example in NotebookLM, Gemini, ChatGPT Edu, Claude or Copilot).
2. Upload **this year's catalog** and the catalog years your current advisees follow. Name each file clearly ("Catalog 2025-26") and don't replace old years, since students follow the catalog of their entry year.
3. Add your department's advising sheet and your campus's list of student resources.
4. Paste in these instructions:

```text
Answer advising questions using ONLY the uploaded catalogs and documents. For every answer:
- name the catalog year and quote the exact passage, with page or section;
- if the answer differs by catalog year, say so;
- if the documents don't answer it, reply "Not in the catalog - check with the Registrar."
Never guess course numbers, prerequisites, deadlines or policies. Never recommend a major
or predict a student's success.
```

5. **Test it with ten questions you already know the answers to**, for example:
   - "Can a course count for both the major and a general-education requirement?"
   - "What is the prerequisite for [a course in your department]?"
   - "What's the deadline to withdraw?"

   Check every quoted passage. If it ever invents a course or a deadline, don't use it for that kind of question.

## Step 2: Prepare for a meeting

The degree audit (in Degree Works or your campus's system) is the source of truth for what a student has completed and what remains. Use AI to turn that into a better conversation, not to recompute it.

In a tool approved for student records, paste only course codes, grades and terms, plus the program and planned graduation term. No name, ID or personal details.

```text
Here is a student's completed coursework (course code, grade, term), their program and
planned graduation term. Using ONLY the catalog in this project, prepare a meeting brief
of no more than 250 words:
1. a one-paragraph progress snapshot;
2. requirements that appear to remain, by category, each with the catalog passage;
3. scheduling risks (courses offered only in certain terms or alternate years, heavy terms);
4. four or five open, strengths-based questions I could ask;
5. up to three relevant campus resources from my documents.
Mark anything you are unsure about [CHECK AUDIT]. Do not speculate about the student.
```

Before the meeting, check every remaining requirement against the official audit.

## Step 3: Write the follow-up faster

After the meeting, type a few bullet points and ask for two drafts:

```text
From my meeting notes below, draft:
(a) a friendly follow-up email to {{STUDENT}} listing what we agreed and next steps, with
    dates only if they appear in the catalog documents;
(b) a neutral 3-5 sentence advising note for the record: facts and agreed actions only,
    no diagnoses, no speculation, no sensitive personal details.
```

Fill in the student's name yourself after you copy the email out. Keep the record note factual: students can request to see their records.

## Step 4: Use simple flags, not risk scores

If you want an early-warning habit, use rules you can explain to the student, such as:

- credits well behind pace for the planned graduation date;
- a failed or withdrawn course that blocks several later courses in the major;
- more than one withdrawal in a term.

You can check these yourself from the audit in a minute. Avoid tools that turn a student into a single "risk score", for the reasons above.

## What AI must never do in advising

- Make or record final decisions: plan approvals, declarations, petitions or overloads.
- Simulate or replace a sensitive conversation.
- Score or rank a student's likelihood of success.
- Write speculation into the advising record.
- Listen to a meeting without everyone's consent.
- **Handle a crisis.** If a student mentions distress or safety concerns, follow your campus protocol: counseling services, and the 988 Suicide & Crisis Lifeline.

Virginia Tech's advising office sums this up as "Human-in, Human-out": a person decides what goes in, and a person reviews and owns what comes out. The national advising association, NACADA, had not issued a formal position on AI as of this writing. Virginia Tech's guidance is a good model to adapt.

## Career and graduate-school exploration

This is a good use of AI because it works with public information. Upload pages from graduate programs, summer research programs (such as REUs) and fellowship listings to a notebook, and ask for **questions to explore** and **options with their sources**, not a recommendation. The evidence on AI steering students by gender is a good reason to keep the AI out of the "what should you major in" decision.

## Try it this week

1. **Build the catalog assistant** (Step 1) and test it with ten questions you can answer yourself.
2. **Before your next advising meeting,** try the meeting brief with course codes only, then check it against the official audit.
3. **Note the minutes saved,** and anything it got wrong.

Next time: for department chairs, building course offerings, teaching loads and schedules, a job where AI chatbots perform poorly and other tools do much better.

*Advising colleagues: I'd like to hear what works for you. Write to me at lip AT etown DOT edu.*

## Sources

- [Aurora: grounded LLM academic advising](https://arxiv.org/html/2602.17999v1) (2026)
- Lekan & Pardos, [AI major recommendations and advisor agreement](https://learning-analytics.info/index.php/JLA/article/view/8593), *Journal of Learning Analytics* (2025)
- [Gender bias in LLM major recommendations](https://arxiv.org/html/2509.04498v1) (2025)
- Gándara et al., [Algorithmic bias in college student-success prediction](https://www.aera.net/Newsroom/Inside-the-Black-Box-Detecting-and-Mitigating-Algorithmic-Bias-Across-Racialized-Groups-in-College-Student-Success-Prediction), *AERA Open* (2024)
- Meyer, Page et al., [Course-specific chatbot nudges at Georgia State](https://edworkingpapers.com/sites/default/files/ai24-564_v2.pdf)
- Virginia Tech, [Responsible use of AI in advising](https://advising.vt.edu/advising-resources/responsible-use-of-ai-in-advising.html)
