---
title: "Running an LLM In-House: Early Lessons from EMTutor"
subtitle: "What a self-hosted AI tutor on two 2018-era GPUs taught me about deploying local LLMs for small businesses and enterprises"
summary: "Many organizations want an AI assistant whose data never leaves their own servers. Here are preliminary performance numbers and the tradeoffs we hit while building EMTutor, a self-hosted tutor that runs on modest, reused hardware."
authors: ["admin"]
tags: ["Local LLM", "Self-Hosting", "AI Infrastructure", "Privacy", "EMTutor"]
categories: ["AI Systems"]
date: 2026-11-19
lastmod: 2026-11-19
featured: false
draft: false

image:
  caption: ""
  focal_point: ""
  preview_only: false

projects: []
---

Every organization I talk to wants the same thing from AI: the usefulness of a chat assistant without sending its data to someone else's servers. A clinic has patient records. A law firm has client files. A manufacturer has designs and supplier contracts. A college has student records protected by FERPA. For all of them, "just use a cloud API" comes with a privacy question that someone has to answer.

This fall my students and I have been building **EMTutor**, a self-hosted AI tutor for introductory computer science at Elizabethtown College. It is part of a [college-funded project](https://bluejayadal.github.io/project/etown-llm/) to prototype a self-hosted LLM for campus. Every part of it runs on college hardware, and no student data leaves campus. Its main job is to be a *Socratic* coding tutor: it helps students work through problems by asking questions, and it is designed never to hand over the solution.

EMTutor has not launched to students yet. The numbers below come from our test environment, with simulated students and a synthetic course. They are preliminary, but they already changed several of our design decisions. Because the hardware is modest, and probably close to what a small business already owns or could buy, the lessons should transfer well beyond education.

## The setup

The hardware is deliberately ordinary, and all of it was already in our lab:

- **One GPU workstation** with two NVIDIA RTX 2080 Ti cards from 2018: 11 GB of memory each, 22 GB in total, linked with NVLink.
- **Two older rack servers** with no GPUs, for everything else: the web front end, the database, search over course materials, a sandbox for running student code, monitoring and backups.

The software is all open source except the small pieces we wrote:

| Layer | What we use |
|---|---|
| Model | An open-weight 8-billion-parameter model ([Qwen3-8B-AWQ](https://huggingface.co/Qwen/Qwen3-8B-AWQ), 4-bit), served by [vLLM](https://github.com/vllm-project/vllm) across both GPUs |
| Chat interface | [Open WebUI](https://github.com/open-webui/open-webui), behind the college's single sign-on |
| Retrieval | Hybrid keyword and vector search over course slides, so answers can cite the course |
| Gateway | A small proxy we wrote that sits between the chat interface and the model and enforces the tutor's rules |
| Code sandbox | Runs a student's program with no network, a read-only file system and strict time and memory limits |

A faculty lead and three undergraduate interns, each working a few hours a week, built it. Every change goes through code review, automated tests and the evaluations described below.

## Lesson 1: Size for many users at once, not for one fast user

Most published speed numbers for local LLMs measure one user at a time. An organization needs the opposite measurement: how long does each person wait when 20 or 30 colleagues are using the system at once?

The metric we track is **time to first token**, the wait between pressing Enter and seeing the first word of the reply. For a chat tool it is what users feel. Our target is a 95th percentile under 5 seconds: only 1 reply in 20 may take longer than that.

Under load, the limit is usually not raw GPU speed but GPU *memory*. Every active conversation needs working memory on the GPU, called the **KV cache**, and it grows with the length of the conversation. Whatever memory the model's own weights leave over decides how many conversations fit at once. Beyond that, new requests wait in line.

## Lesson 2: Measure on your hardware, because estimates can be far off

Before we touched the hardware, our sizing estimates said IBM's [Granite 4.1-8B](https://huggingface.co/ibm-granite/granite-4.1-8b) would hold about 27 typical conversations of 3,000 tokens at once. On the real cards, it held about six.

Here is vLLM's own benchmark on our two GPUs. It is a deliberately harsh test: every request is a fresh 2,800-token prompt with nothing shared to reuse, followed by a 250-token reply.

| Model | Memory left for conversations | Requests at once | Median wait for first word | 95th-percentile wait | Total output |
|---|---|---|---|---|---|
| Granite 4.1-8B (16-bit) | 17,920 tokens (about 6 conversations) | 1 | 1.8 s | 1.8 s | 36 tokens/s |
| | | 8 | 8.2 s | 20.6 s | 71 tokens/s |
| | | 16 | 38.8 s | 43.3 s | 71 tokens/s |
| Qwen3-8B-AWQ (4-bit) | 93,248 tokens (about 30 conversations) | 1 | 1.5 s | 1.5 s | 58 tokens/s |
| | | 8 | 4.3 s | 10.1 s | 111 tokens/s |
| | | 16 | 5.2 s | 14.7 s | 121 tokens/s |
| | | 24 | 41.0 s | 60.4 s | 72 tokens/s |

Two models of the same size behaved very differently. The 4-bit quantized model left **five times as much memory** for conversations and answered a single user **1.6 times faster**. That settled our default model. Past about 16 simultaneous fresh prompts, both models slow down because the GPUs spend their time reading prompts. In real use this happens less often, because the system prompt and earlier turns of a conversation are cached and reused.

**Older GPUs also rule out options you might be counting on.** Our 2018-era cards lack features newer models and tools assume:

- vLLM refused an 8-bit KV cache, which would have doubled capacity, because it needs a newer GPU generation.
- Google's Gemma 4 models would not load in vLLM at all: their attention layers need more on-chip memory than these cards have.
- Large open models such as DeepSeek's and Kimi's flagships need hundreds of gigabytes of GPU memory, 15 to 70 times what we have, even at 4 bits.

## Lesson 3: Pick the serving engine for concurrency

[llama.cpp](https://github.com/ggml-org/llama.cpp) is excellent for one person on a laptop or workstation, and it ran Gemma 4 12B, which vLLM could not. With 8 or 16 requests at once, though, the slowest users waited **64 to 87 seconds** for the first word, because llama.cpp does not batch long prompts the way vLLM does. vLLM, which is built to batch many requests on the GPU, is our production engine. llama.cpp is our fallback and our CPU stand-in for development.

The same caution applies to the many new "fastest local inference" projects. When I reviewed several of them for our hardware, their headline speeds came from one user at a time, often on newer or modified GPUs. A system that is fast for one user but serves only one at a time is worse for an office of 30.

## Lesson 4: The bottleneck may not be the GPU at all

The most useful test we ran was a **load test through the whole stack**: simulated students who sign in, ask questions about the course, and pause 8 to 25 seconds between messages, for 10 minutes. The first runs surprised us.

| Retrieval setup | Simulated students | 95th-percentile wait for first word | Replies in 10 minutes | Errors |
|---|---|---|---|---|
| No retrieval | 50 | 0.4 s | 1,673 | 0 |
| Retrieval with a reranker on CPU | 50 | 284 s | 154 | 0 |
| No reranker, 10 candidate slides | 50 | 17.9 s | 914 | 1 |
| No reranker, 6 candidates, more CPU threads for search | 50 | 7.3 s | 1,042 | 0 |
| The same | 35 | **3.6 s** | 850 | 0 |

Without retrieval, the model and gateway served 50 students with a 0.4-second wait. Adding search over course slides pushed the wait to almost five minutes. The culprit was a **reranker**, a second model that re-sorts search results for relevance, running on one of the CPU servers. Reranking one question took it about four seconds as deployed, and 50 students ask about three questions a second.

Dropping the reranker was a real tradeoff. On our retrieval test, the best slide came first for 96% of questions with the reranker and 83% without it. However, the right slide was still among the five the tutor sees for 100% of questions, at about a sixth of the cost. We dropped it.

Retrieval also changes the GPU's workload. The tutor's instructions, about 1,050 tokens, are cached and reused for every question. Retrieved slides add about 300 new tokens that must be read fresh each time, roughly ten times the prompt reading per reply. With 50 students that work keeps both GPUs busy, so for now **35 students chatting at once** is the pilot's capacity. Fifty is the goal once we see the real course materials.

One error in those runs is worth mentioning because every multi-part system hits it eventually. Two components disagreed on how long to keep an idle connection open, and one reused a connection the other had just closed. A longer keep-alive setting fixed it. Load tests find problems like this; demos don't.

## Lesson 5: Put your rules in a gateway you own

A chat interface can carry the right system prompt and settings, but users can often switch presets or call the model directly. So we wrote a small **gateway**, an OpenAI-compatible proxy between the chat interface and the model. Every request passes through it, whatever settings the user picked. It:

- adds the tutor's instructions to every request;
- turns off the model's visible "thinking", which in a tutor would show students the solution it is withholding;
- checks each reply for a near-complete solution before it reaches the student;
- runs student code in the sandbox when the tutor needs to see its output;
- logs what happened for auditing.

Because everything downstream talks to "the tutor" through the gateway, swapping the model is a configuration change plus a re-run of the evaluations, not a code change. For a business, the same layer is where you would remove personal information, enforce approved uses and keep an audit trail.

## Lesson 6: Test behavior, not just speed

Our central claim is that the tutor does not hand out answers, so we test exactly that. The leakage evaluation sends 180 attempts to extract a solution: 12 introductory problems, each asked 15 different ways, including direct requests, fake permission, role-play, asking for the answer piece by piece and "just fix my code." Code in a reply that passes the problem's own tests counts as a full leak. A held-out set of 120 more cases, which no prompt is tuned on, guards against teaching to the test.

What we learned:

- **The model matters.** Our first prompt leaked full solutions in 45 of 180 cases (25%) on a small 3-billion-parameter model. The current prompt leaks none of the 180 on our 8B model, and 5 of the 120 held-out cases.
- **More rules can make it worse.** A version that listed every forbidden kind of answer leaked more than the simpler one before it.
- **Surrounding text matters.** With the chat interface's default retrieval template, which asks for "a clear and direct response," the tutor fixed students' buggy code in 7 of 12 cases where it otherwise refused. We rewrote the template.
- **Layers help.** With retrieval on, 2 of 180 cases leaked in full, and the gateway's check caught both.

Every change to the prompt must pass this evaluation before it merges. A business should build the same kind of test for its own worst case, whether that is leaking a client's data, inventing a policy or giving advice it is not allowed to give, and rerun it on every change to the model, prompt or retrieval setup.

## Lesson 7: Watch the defaults

Several of our risks came from defaults no one would notice in a demo:

- **Containers can bypass your firewall.** Docker writes its own firewall rules, so a published port can be reachable from the whole network even when the host firewall says no. Bind each service to a specific address, and scan from another machine to check.
- **Some components ship without authentication**, including popular vector databases. Turn it on.
- **Some apps phone home** with telemetry or update checks by default. In a "data never leaves" system, that has to be turned off and verified.
- **Untrusted code needs a real sandbox:** no network, a read-only file system, and process, memory and time limits.
- **Write down "no cloud fallback" as a requirement.** Otherwise someone will eventually add one to fix a capacity problem.
- **Pin every version.** We never update the GPU server blindly during the semester.
- **Read the licenses.** Open WebUI's license, for example, limits removing its branding above 50 users without an enterprise license.

Consumer hardware has limits of its own. Our GPU workstation has no error-correcting memory, no redundant power supply and no remote management. It puts out about 500 watts of heat under load in a desktop case. We monitor GPU temperature and power and keep encrypted backups. Before launch, we plan monthly drills for restoring from backup and for losing the GPU server.

## The tradeoffs in one table

| | Local model on your hardware | Cloud API |
|---|---|---|
| Data | Stays on your servers | Leaves your network; governed by a contract |
| Model capability | Limited by your GPU memory; an 8B model on our cards | Frontier models |
| Cost | Hardware, power and staff time; flat as usage grows | Pay per use; nothing up front |
| Capacity | Fixed; measured in users at once | Scales on demand |
| Control | You pin versions and decide when anything changes | The provider can change or retire models |
| Operations | You patch, monitor, back up and recover | The provider does |

For a focused task like ours, a well-tested 8B model with good retrieval and firm guardrails is enough. For open-ended work that needs the strongest reasoning, a cloud model may still be the better tool. Many organizations will end up using both, with a clear rule about which data may go where.

## If you are considering this for your organization

1. **Describe the workload first:** how many people at once, how long their questions are and how long they can wait.
2. **Start small:** a 7 to 8 billion parameter open model, 4-bit quantized, on vLLM, is a sensible first try on modest GPUs.
3. **Benchmark the model on your hardware, then load-test the whole system** with realistic users. Our biggest surprise was not in the GPU.
4. **Build an evaluation for your main failure mode** and run it on every change.
5. **Put a gateway in front of the model** so your rules cannot be clicked around.
6. **Lock down the defaults** and plan for the hardware failing.

Next for EMTutor: a pilot with students in an introductory course, real course materials in place of our synthetic ones, and tests over winter break of newer engine builds that could fit more conversations on the same cards. I will share updated numbers as they come in.

If your organization is weighing a local deployment and you want to compare notes, you can reach me at [lip@etown.edu](mailto:lip@etown.edu).
