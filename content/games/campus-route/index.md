---
title: "Campus Route"
summary: "A daily puzzle: find the fastest walk across the Elizabethtown College campus. Everyone gets the same route each day, and practice routes are unlimited."
date: 2026-11-24
layout: campusroute  # layouts/games/campusroute.html; game files in assets/games/campus-route/
share: false
weight: 20
card_tagline: "Find the fastest walk across the Etown campus. A new route every day, plus unlimited practice."
card_tags: ["Daily puzzle", "Practice", "Leaderboard"]
card_art: "campusroute"
---

### How a map app finds the fastest route

The shortest-looking route is often not the fastest one, which is why map apps don't just pick the path with the
fewest turns. They use a method worked out by the computer scientist Edsger Dijkstra in 1956 and published in 1959.

It works like this: start where you are, at 0 minutes. Then, again and again, take the closest place whose time
isn't final yet, mark its time as final, and see whether going through it gives any of its neighbors a faster time.
When the destination's time becomes final, it is guaranteed to be the fastest possible. Press **Watch a computer
solve it** after a puzzle to see each step on the map.
