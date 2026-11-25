---
title: "Bit Flip"
summary: "A one-minute game about how computers count. Flip the switches so they add up to the number."
date: 2026-11-24
layout: bitflip      # layouts/games/bitflip.html; game files in assets/games/bitflip/
share: false
weight: 10           # order on the Games page
card_tagline: "Flip eight switches to make the number before time runs out. A one-minute lesson in how computers count."
card_tags: ["1 minute", "Leaderboard"]
card_art: "bitflip"  # drawing in layouts/partials/games/card-art.html
---

### What you just did

Computers store every number as a row of on/off switches called **bits**. Each switch is worth double the one to its
right: 1, 2, 4, 8, and so on up to 128. Eight of them together make a **byte**, which can hold any whole number from 0
to 255. The row of 0s and 1s under the number is that byte, written the way a computer stores it. So when you made 37,
you wrote **00100101**, which is 37 in binary.
