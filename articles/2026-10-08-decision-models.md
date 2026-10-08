---
title: "Decision models: a System 1 for software"
description: Decision models answer typed questions with a confidence score instead of text. What they are, how they work, and what is still unproven.
# Share image: edit assets/og-decision-models.svg, then re-export the PNG at 1200x630.
image: /assets/og-decision-models.png
imageAlt: "Decision models: a System 1 for software. A decision model scores low, medium and high urgency at once and picks high, at 0.94."
author:
    name: Abderrahman SaidAlaoui
    # TODO: add `url:` once Netria has an author profile page (see README, To do).
# Nunjucks first, for the model explorer shortcode below; then Markdown.
templateEngineOverride: njk,md
---

Software usually decides with rules. Rules are fast and predictable, but they break when the input looks different from what their author expected.

Large language models handle messy input, but they answer by writing text, one word at a time. Each call takes seconds, costs money, and returns text a program must parse.

Decision models sit between the two. They judge messy input quickly and return typed answers with a confidence score. More than a dozen have appeared since mid-September.

## What a decision model is

A decision model takes an input and a set of questions, each with a fixed list of allowed answers. It returns one answer per question, with a probability. It never writes text.

A simplified example, not any vendor's exact format:

<figure class="decision-figure">
    <div class="df-input">
        <span class="df-label">Input</span>
        <p>“Checkout keeps failing with error 502 since this morning. We’re losing orders.”</p>
    </div>
    <p class="df-pass" aria-hidden="true">↓ read once, every answer scored together</p>
    <div class="df-questions">
        <div class="df-q">
            <span class="df-label">Urgency</span>
            <div class="df-opt"><span>low</span><span class="df-bar" style="--p: 0.01" aria-hidden="true"></span><span class="df-num">0.01</span></div>
            <div class="df-opt"><span>medium</span><span class="df-bar" style="--p: 0.05" aria-hidden="true"></span><span class="df-num">0.05</span></div>
            <div class="df-opt df-win"><span>high</span><span class="df-bar" style="--p: 0.94" aria-hidden="true"></span><span class="df-num">0.94</span></div>
        </div>
        <div class="df-q">
            <span class="df-label">Team</span>
            <div class="df-opt"><span>billing</span><span class="df-bar" style="--p: 0.06" aria-hidden="true"></span><span class="df-num">0.06</span></div>
            <div class="df-opt df-win"><span>platform</span><span class="df-bar" style="--p: 0.81" aria-hidden="true"></span><span class="df-num">0.81</span></div>
            <div class="df-opt"><span>support</span><span class="df-bar" style="--p: 0.13" aria-hidden="true"></span><span class="df-num">0.13</span></div>
        </div>
        <div class="df-q">
            <span class="df-label">Refund requested</span>
            <div class="df-opt"><span>yes</span><span class="df-bar" style="--p: 0.12" aria-hidden="true"></span><span class="df-num">0.12</span></div>
            <div class="df-opt df-win"><span>no</span><span class="df-bar" style="--p: 0.88" aria-hidden="true"></span><span class="df-num">0.88</span></div>
        </div>
    </div>
    <figcaption>One pass over the ticket scores every allowed answer at once. The top score is the answer, and its probability is the confidence. Numbers are illustrative.</figcaption>
</figure>

[TypeSafe AI](https://typesafe.ai/blog/introducing-system-one-models-and-jev), which created the category, calls them "smart if-statements": an if-statement whose condition is a judgment, not a rule.

## Fast and slow thinking

TypeSafe calls these System One models, after Daniel Kahneman's book [*Thinking, Fast and Slow*](https://lccn.loc.gov/2011027143).

Kahneman describes two modes of thought. **System 1** is fast and automatic: reading anger on a face, finishing "bread and…", knowing 2 + 2. **System 2** is slow and deliberate: working out 17 × 24, filling in a tax form. We run mostly on System 1. System 2 steps in when a question has no quick answer.

Software has lacked a System 1. Rules have no judgment. Language models, especially those that reason step by step, behave like System 2: capable but slow. Using one for every small call is like taking out pen and paper to add 2 + 2.

Decision models aim to be the System 1. TypeSafe's [documentation](https://docs.typesafe.ai/introduction) says each question should be "a gut-check determination: the kind of judgment a highly knowledgeable person could make in a few seconds given the right context." Bigger questions should be split: "Ask each factor as a separate question, then combine the results with logic in your code."

Kahneman also warns that System 1 jumps to conclusions. It judges only what is in front of it, which he calls "what you see is all there is", and it stays confident even with little information. Decision models share this blind spot. TypeSafe admits that "System 1 thinking" has implied error-prone, and says it will explain later why its models can be more reliable.

## How they work

A decision model reads the input and all the questions once, then scores every allowed answer at the same time. Cloudflare calls this a "prefill-only pass". Because nothing is generated, an answer takes well under a second.

The answers can only come from the options you define. That is what vendors mean when they say these models "can't hallucinate": the output always fits the schema, although it can still be the wrong option. The models are also trained to be honest about their confidence, so that answers given at 90% are right about 90% of the time.

None of this is new on its own. Classifiers and confidence thresholds have existed for years. What is new is one general model that takes questions defined at request time, fast and cheap enough to run on every input.

## The models so far

Jev started the category in mid-September. Within three weeks, more than a dozen others followed, from start-ups, cloud platforms and open-source developers. Pick one to see what is known about it, or compare them all.

{% modelExplorer decisionModels %}

Each vendor publishes benchmarks it wins, and the results conflict. On the same banking benchmark, Laya reports Jev doing about twice as well as Laya, while Cloudflare reports Clef well ahead of Jev. No independent tests exist yet.

## Keeping up

This list will age quickly. For the current picture, OpenRouter publishes [live decision model rankings](https://openrouter.ai/rankings/decisions#top-models-by-category) built from real traffic. It shows which models are used most, overall and by category, domain and market share.

Read it as a measure of use, not quality: a model can lead because it came first or costs less. In the week to 7 October, Jev handled the vast majority of requests, while new models were arriving every few days.

## Where they are used

Most early uses are about sorting and checking. Decision models triage and route tickets, emails and requests. They screen prompts for moderation and jailbreak attempts, and check what a language model writes before anyone sees it. Cloudflare's threat intelligence team uses Clef to classify domains, including how likely each one is to be phishing.

Agents are the other natural fit. A decision model can choose an agent's next action, or decide when to hand over to a person, without waiting on a full language model call. It also makes classification affordable for datasets far too large to send through a language model.

## Fast first, slow when unsure

These models are designed for a handoff, like System 1 passing hard cases to System 2. The model answers everything and reports its confidence. Answers above a threshold are used directly. The rest go to a language model or a person.

A higher threshold means fewer answers used directly, but more of them right. Laya reports 75.3% accuracy overall and 94.7% on its most confident half. The right threshold depends on the cost of a mistake.

This only works if the confidence is honest. That makes calibration, not raw accuracy, the first thing to test.

## What to watch

The category is only weeks old, so treat every number as a vendor claim until someone independent confirms it. Calibration can also drift: confidence tuned on public benchmarks may not hold on real data, though a few hundred labeled examples are enough to find out. And some questions are harder than others. Laya, for one, says questions with many options, and graded scales such as minor, major and critical, are its weakest.

People stay in the loop, too. Cloudflare says a human "does not necessarily need to be in the loop", but keeps the option to "defer to a human when needed". The threshold is what decides when.

Decision models will not replace language models, just as System 1 does not replace System 2. They handle the small, frequent judgments in between. Whether their confidence holds up outside the vendors' own tests is the open question.
