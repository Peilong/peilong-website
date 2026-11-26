---
title: "Logic Lights"
summary: "A daily circuit puzzle: flip switches to light the bulb using as few switches as possible."
date: 2026-11-25
layout: logiclights  # layouts/games/logiclights.html; game files in assets/games/logic-lights/
share: false
weight: 40
card_tagline: "Flip switches to light the bulb through AND, OR and NOT gates, using as few switches as you can. A new circuit every day."
card_tags: ["Daily puzzle", "Practice", "Leaderboard"]
card_art: "logiclights"
---

### What the gates do

Every decision a computer makes is built from tiny circuits like this one. Each **gate** takes signals that are
on or off and passes on a new one: **AND** is on only when both of its inputs are on, **OR** is on when at least one
is, **NOT** flips its input, and **XOR** (from Friday on) is on when exactly one input is on. A computer's processor
is built from gates like these, made of billions of tiny electronic switches called transistors.

### Why "Watch a computer solve it" matters

A computer can simply try every combination of switches: with 6 switches there are only 64. But each extra switch
doubles the count, so with 30 switches there would be over a billion combinations. Telling which circuits can
ever be switched on is a famous hard problem in computer science, and much of the field is about finding cleverer
ways than trying everything.
