---
title: "Coding Agents in the Small-College CS Classroom"
subtitle: "What the research says so far, and why a liberal arts college may be the best place to teach with these tools"
summary: "Coding agents like Claude Code and Codex can now finish most CS homework on their own. Here is what the evidence says about learning with them, and how I think a small liberal arts college should respond."
authors: ["admin"]
tags: ["Teaching", "Agentic Coding", "AI in Education", "Liberal Arts"]
categories: ["Teaching"]
date: 2026-11-18
lastmod: 2026-11-18
featured: false
draft: false

image:
  caption: ""
  focal_point: ""
  preview_only: false

projects: []
---

A year ago, the question in CS department hallways was whether students should be allowed to use ChatGPT on homework. That question is already out of date. Tools like Claude Code and OpenAI's Codex are not chatbots that hand you a snippet. They are *agents*: they read a whole project, edit files, run the tests, see what broke and try again. Brown University's new intro course design puts the difference well. A chat tool produces code "without an underlying validation and revision loop"; an agent has that loop built in.

For a typical assignment in an intro or mid-level course, an agent can produce working code in minutes. So the question for those of us who teach computing is no longer *whether* students will use these tools. It is what a computer science education should build when typing code is no longer the hard part.

I teach computer science at Elizabethtown College, a small liberal arts college in Pennsylvania, and I run an undergraduate research lab. Below is my reading of the evidence so far, and why I think small colleges are in an unusually good position to get this right.

## What the evidence says so far

The research is young, but a consistent picture is forming.

**AI widens the gap between students.** In "The Widening Gap," Prather and colleagues watched novices solve a programming problem with generative AI tools across 21 lab sessions, using interviews and eye tracking. Students who were already doing well used the tools to speed up code they had planned to write anyway. Students who struggled found their existing difficulties compounded. Many thought they had done better than they had, and "finished with an illusion of competence."

**Handing off the work can cost the learning.** In a randomized trial Anthropic published in January 2026, 52 mostly junior engineers learned an unfamiliar Python library, with or without AI help. The AI group averaged about 50% on the follow-up quiz, against 67% for those who coded by hand, and it was not significantly faster. The biggest gap was on debugging questions. How people used the AI mattered, though: participants who asked conceptual follow-up questions retained far more than those who let the AI write or fix the code for them.

**Feeling faster is not the same as being faster.** In METR's 2025 randomized study, experienced open-source developers working in their own large codebases took about 19% longer when they could use early-2025 AI tools. Afterward, they still believed the tools had sped them up by about 20%. If seasoned professionals misjudge their own productivity that badly, we should not expect students to judge their own learning accurately.

**The entry-level job market is shifting.** Using ADP payroll data, Brynjolfsson, Chandar and Chen at Stanford found a 13% relative decline in employment for 22- to 25-year-olds in the most AI-exposed occupations. Early-career software developers were among the hardest hit, and the declines were concentrated where AI automates work rather than assisting with it. Their monthly dashboard still shows the pattern. Our graduates will be competing for jobs where "I can write the code" is no longer enough.

**Educators have not figured it out either.** An ACM task force surveyed 763 computing educators from 49 countries in 2025. Their top concern was students' growing dependency on the technology (87%). Of those who answered the question, 68% had already changed how they assess students. The most common barrier to adapting was a lack of examples of best practices (48%). Nobody has a playbook yet, so small programs can experiment without waiting for one.

## Why a small college is well placed

Most of the published experiments come from large universities. Yet nearly every promising idea in them depends on something small colleges already do well.

**Small classes make oral assessment practical.** The most direct response to AI-written code is to ask students to explain it. Researchers at Utah State made a 15-minute code review interview mandatory after every weekly assignment in a 96-student CS1 course. Students could use AI as much as they liked, as long as they could justify their code in the interview. Running it took eleven trained teaching assistants. At a college where classes are small, the professor can hold many of those conversations in person. We also know our students well enough to notice when a student's confidence has drifted away from their understanding, which is exactly the illusion of competence the research describes.

**The liberal arts already teach the skills agents demand.** Working well with an agent is mostly an exercise in writing and judgment: stating a problem precisely, breaking it into steps, reading someone else's work critically and defending a decision. Those are the habits a liberal arts education claims to build in every major. A clear specification is a piece of writing. A code review is an argument with evidence.

**Ethics is not a separate course.** Agents raise questions students will face on the job: who is responsible for code nobody typed, when and how to disclose AI use, which data should never be pasted into a third-party tool. Small programs can work these questions into every course instead of leaving them to a single ethics requirement.

**Undergraduate research can be more ambitious.** With agents, a small team of undergraduates can build systems that would have been out of reach a few years ago. That raises the bar for what students need to manage: specifications, branches, code review, tests and continuous integration. In my lab, [ADAL](https://bluejayadal.github.io/), the [list of what we look for in student researchers](https://bluejayadal.github.io/#skills) now starts with agentic coding and verifying what agents write, ahead of fluency in any particular language.

**The constraints are real.** Small colleges do not have rooms full of teaching assistants, every new form of assessment costs faculty time, and agent access costs money. Brown gave the students in its Agentic Studio course $20-a-month Claude plans by design, and the instructors note that those limits "curtailed some of what we asked them to do." If access depends on what each student can afford, these tools will widen exactly the gaps small colleges work hard to close. Colleges should plan to provide access rather than leave it to individual students.

## How I think we should teach with agents

These are the principles I am planning around. None is fully proven, but all are consistent with the evidence above.

1. **Fundamentals by hand first, agents later.** Writing code by hand is how students build mental models of how programs work, and the evidence says novices pay the highest price for handing that work off. Introductory courses should keep substantial hand-written work and in-person exams. Brown's pilot intro course allows only chat tools for the first two months and introduces agents in the last month. Upper-level courses and capstones are where agents belong, used fully.

2. **Grade understanding, not just the artifact.** If an agent can produce the artifact, the artifact alone tells me little about what the student learned. Short code walkthroughs, in-class problems and "change this function while I watch" questions show what a student actually understands. In the Utah State course, exam scores held steady, even rising slightly (though not significantly), while the share of pasted code went up.

3. **Make verification a core skill.** Treat everything an agent writes as a draft. Students should write tests before asking an agent for code, read every diff, and be able to explain why the result is correct. The Anthropic study found the largest losses in debugging, which is exactly the skill needed to catch an agent's mistakes. Debugging deserves more class time, not less.

4. **Turn specifications and design into writing assignments.** Have students write the specification, the design rationale and the code review, and grade them as seriously as the code. This plays directly to a liberal arts college's strengths.

5. **Go bigger, earlier.** Agents make it realistic for students to work on larger, longer-lived projects much sooner. Use that to teach what employers now look for in new graduates: working in an existing codebase, Git workflows, code review and testing. Brown's students "found significant value in the peer-review and crit activities."

6. **Ask for transparency.** Brown's Agentic Studio required reflection journals and chat transcripts. In the instructors' early observations, most students "developed their own personal boundaries for when to use agents and for how much." Asking students to show how they worked, not just what they produced, turns reflection into a habit.

## The case for the liberal arts gets stronger

Brown's students named the risk themselves. According to the instructors, "a majority of students were concerned about their lack of understanding of their code bases," and most worried about the loss of learning if agents arrived in intro courses. That worry is healthy. The goal is not to shield students from these tools, or to hand the tools over without a plan. It is to graduate people who can decide what software should exist, direct agents to build it, and show that it works.

That has always been the promise of a liberal arts education: think clearly, write precisely, weigh evidence and take responsibility for your work. As coding agents take over more of the typing, those skills are no longer the soft side of a computer science degree. They are the job.

If you teach computing at a small college and are trying any of this, I would like to compare notes. You can reach me at lip AT etown DOT edu.

## Sources

- Prather et al., [The Widening Gap: The Benefits and Harms of Generative AI for Novice Programmers](https://arxiv.org/abs/2405.17739) (2024).
- Shen and Tamkin, [How AI assistance impacts the formation of coding skills](https://www.anthropic.com/research/AI-assistance-coding-skills), Anthropic (January 2026).
- Becker et al., [Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity](https://arxiv.org/abs/2507.09089), METR (2025).
- Brynjolfsson, Chandar and Chen, [Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence](https://digitaleconomy.stanford.edu/project/indicators/canaries/), Stanford Digital Economy Lab, and the [monthly dashboard](https://digitaleconomy.stanford.edu/project/canaries-dashboard/).
- Gordon et al., [ACM Task Force on Generative AI and Programming Assessment: Final Report](https://acm-education-genai-task-force.github.io/ACM_Taskforce_GenAI_Report_16Feb26.pdf) (February 2026).
- Fowles et al., [Combating Harms of Generative AI in CS1 with Code Review Interviews and a Flipped Classroom](https://arxiv.org/abs/2605.21374) (preprint, May 2026).
- Brown University, [Brown professors devise course to explore generative AI in computer science education](https://www.brown.edu/news/2026-06-11/agentic-studio-ai-programming) (June 2026); [Agentic Studio notes for visitors](https://cs.brown.edu/courses/csci1970kf/agentic-spr-2026/visitors.html); and [CSCI 0111E course design](https://cs.brown.edu/courses/csci0111e/fall26/course-design.html) (Fall 2026).
