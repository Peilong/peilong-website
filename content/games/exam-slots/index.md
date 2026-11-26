---
title: "Exam Slots"
summary: "A daily scheduling puzzle: fit every exam into the fewest time slots so that no student has two exams at once."
date: 2026-11-25
layout: examslots    # layouts/games/examslots.html; game files in assets/games/exam-slots/
share: false
weight: 60
card_tagline: "Courses that share students can't hold their exams at the same time. Fit every exam into the slots you're given. A new puzzle every day."
card_tags: ["Daily puzzle", "Practice", "Leaderboard"]
card_art: "examslots"
---

### Exam schedules are a coloring puzzle

Every college has to fit its final exams into a few time slots so that no student has two exams at once. Computer
scientists draw this as a **graph**: each course is a dot, and a line joins two courses that share a student. Giving
every course a slot so that no line joins two courses in the same slot is called **graph coloring**, because the slots
are usually drawn as colors. In 1967 the mathematicians Dominic Welsh and Martin Powell showed how a simple coloring
method applies to timetabling, and scheduling software still builds on ideas like theirs.

### Why the fewest slots is hard to find

Checking a finished schedule is easy: look at every line. Finding one with the fewest slots is another matter. In 1972
Richard Karp showed that this problem belongs to a large family of problems for which nobody knows a fast method, and
it is still one of computing's famous hard problems. With a few hundred courses, trying every schedule is out of
reach, so real scheduling software uses clever shortcuts that find good answers, not always the best one.

### Four slots are always enough here

These puzzles are drawn so that no two lines cross. For any drawing like that, four slots are always enough. This
is the **Four Color Theorem**, first asked about maps in 1852 and proved in 1976 by Kenneth Appel and Wolfgang
Haken: the first major theorem proved with the help of a computer. Real exam schedules have lines crossing
everywhere, so they can need many more slots.
