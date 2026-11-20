---
title: "Before You Paste: Student Privacy and Choosing the Right AI Tool"
subtitle: "Part 2 of 9 in AI at a Small College"
summary: "A plain-language guide to what you may put into which AI tool: why 'they promise not to train on it' is not enough, why removing names is not always enough at a small college, and how to check what your college has approved."
authors: ["admin"]
tags: ["AI at a Small College", "AI in Education", "Data Privacy", "FERPA"]
categories: ["AI in Education"]
date: 2026-11-25T07:00:00-05:00
lastmod: 2026-11-25T07:00:00-05:00
featured: false
draft: false

image:
  caption: ""
  focal_point: ""
  preview_only: false

projects: []
---

*Part 2 of 9 in the series [AI at a Small College](/tags/ai-at-a-small-college/).*

It is 11 p.m., you have 30 essays left, and a free chatbot is one tab away. Pasting in a student's essay to "get started on feedback" feels harmless. It may not be. Before any of the later posts in this series, it is worth spending ten minutes on what you may put into which tool.

*This post is general guidance, not legal advice. Your college's policies and counsel have the final word.*

## FERPA in plain words

FERPA, the federal student-privacy law, covers **education records**: grades, submitted work, advising notes, accommodation information and emails about a student, among others. You can see your own students' records because you have a legitimate educational interest in them. Sharing those records with an outside company is different.

An outside service may receive education records without each student's consent only if the college treats it as a "school official". That means it performs a service the college would otherwise do itself, is **under the college's direct control** over how the records are used and kept, and may not pass them on. In practice, that takes a contract.

Two misunderstandings are common:

- **"The company promises not to train on my data."** A no-training promise is helpful, but on its own it is not the same as the college's control over use, retention and deletion. Free personal accounts do not give the college that control.
- **"I removed the student's name, so it's anonymous."** At a small college, often not. A course list, a project topic or a detail like "the only veteran in the class" can identify a student. Removing names is good practice. Do it, but don't treat the result as anonymous.

## The traffic-light rule

Most colleges already classify their data. Map those classes to AI tools like this, and post the table where you will see it.

| Kind of information | Examples | Personal AI accounts | College-licensed AI (under contract) | College-hosted private AI |
|---|---|---|---|---|
| **Green: public** | Catalog, published syllabi, public web pages, published papers | Yes | Yes | Yes |
| **Yellow: internal** | Draft committee reports, internal procedures | No | Yes | Yes |
| **Orange: confidential or student records** | Grades, student work, advising notes, personnel files, search materials | No | Only if your college approves that tool for this kind of data | Only if your college approves it for this kind of data |
| **Red: highly restricted** | Social Security numbers, financial-aid tax data, health and disability records, passwords | No | No | No |

Two rules sit on top of the table:

- **Never record** tenure, promotion, grievance or conduct deliberations, whatever tool you use.
- **Don't ask an unapproved tool to "remove the names"** from identifiable text. By the time it removes them, it has already received them.

## Which tools you probably already have

Most colleges already pay for at least one education-tier AI tool, often without announcing it:

- **Google campuses:** the Gemini app and NotebookLM are "core services" in Google Workspace for Education, turned on by default for higher education since 2025. Google states that this data is not reviewed by humans or used to train its models.
- **Microsoft campuses:** Microsoft 365 Copilot Chat with enterprise data protection comes with the standard education licenses. The full Microsoft 365 Copilot is a paid add-on.
- **Contracted tools:** ChatGPT Edu and Claude for Education are sold to institutions under contract. Whether student records may go into them depends on that contract.
- **College-hosted:** some colleges run their own AI on campus servers. My college's [EMTutor pilot](/post/local-llm-lessons-from-emtutor/) is one example. Data stays on campus, but the college is responsible for securing it.

Universities read the same product differently. One major university allows student records in ChatGPT Edu under its contract, while another advises against uploading academic records even with a license. Another found a data-sharing setting turned **on** by default in its workspace. So the only list that matters is your own college's.

## Try it this week

1. **Find your college's approved-tools list.** Search your IT or teaching-center website for "AI tools" or "approved software". If there is no list, email IT one question: *"Which AI tools are approved for FERPA-protected student information, and which only for public or internal information?"* Until you hear back, treat everything except green as not allowed in AI tools.
2. **Sign in the protected way.** Use the AI tool through your college account, not a personal one. In Copilot, look for the indicator that enterprise data protection is on. In Gemini or NotebookLM, check that the account in the corner is your college account.
3. **Fix your personal account settings.** If you also use a personal ChatGPT account for public material, open Settings → Data controls and turn off "Improve the model for everyone".
4. **Clean up.** Look through your past chats in any personal AI account. Delete any that contain student work, grades or names.
5. **Practice de-identifying.** Before pasting anything about students into an approved tool:
   - Remove names, ID numbers and email addresses.
   - Remove details that identify someone by context.
   - Summarize groups instead of individuals.
   - Don't report on groups of fewer than five students.

## For chairs and directors: a one-page policy

If your department or office has no AI policy yet, one page is enough to cover:

- **Approved tools.** Which tools may be used with which kind of data (link the table above).
- **Responsibility.** Whoever uses AI is responsible for the accuracy of what they submit.
- **Decisions.** AI makes no final decisions on grades, admissions, hiring, discipline or financial aid.
- **Disclosure.** AI use is disclosed where an outside body requires it.
- **Recording.** Meetings are recorded only with consent, and sensitive deliberations never.
- **Incidents.** Problems are reported to IT promptly.
- **Review.** The policy is reviewed once a year.

Next time, with the rules settled, we start on the fun part: planning a course with AI, from learning goals to a first-draft syllabus.

*Questions about your own situation? Write to me at lip AT etown DOT edu.*

## Sources

- FERPA regulations, [34 CFR 99.31](https://www.law.cornell.edu/cfr/text/34/99.31) (the "school official" and de-identification provisions)
- US Department of Education Privacy Technical Assistance Center, [Protecting student privacy while using online educational services](https://studentprivacy.ed.gov/resources/protecting-student-privacy-while-using-online-educational-services-requirements-and-best)
- Future of Privacy Forum and Center for Democracy & Technology guidance on vendor contracts ([FPF](https://fpf.org/?p=13665), [CDT](https://cdt.org/?p=12827))
- Google, [Gemini and NotebookLM as core services for education](https://workspaceupdates.googleblog.com/2025/04/notebookLM-and-gemini-app-core-services-for-education-customers.html) and [data protection](https://blog.google/products-and-platforms/products/education/gemini-enterprise-grade-data-protection/)
- Microsoft, [Copilot in education](https://www.microsoft.com/en-us/education/products/copilot-in-education)
- Examples of differing university guidance: [Carnegie Mellon](https://cmu.edu/computing/services/ai/chatgpt/index.html), [BYU](https://ai.byu.edu/chatgpt-edu-data-restrictions-page), [University of Illinois](https://answers.illinois.edu/156622)
- Virginia Tech, [Responsible use of AI in advising](https://advising.vt.edu/advising-resources/responsible-use-of-ai-in-advising.html)
