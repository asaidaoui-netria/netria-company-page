---
title: "I moved my X feed filter onto my laptop. Same API, different scores"
description: Ollama now runs decision models through the same API as Jev. Could a model on my own laptop filter my feed as well as Jev does from the cloud? To find out, I moved Xift's four questions from the cloud to my laptop. The request worked unchanged. The scores didn't mean the same thing.
# Share image: edit assets/og-local-models.svg, then re-export the PNG at 1200x630.
image: /assets/og-local-models.png
imageAlt: "Same API, different scores. Average rage bait score over the same 442 posts: Jev in the cloud 0.08, Tev1 4B on a laptop 0.03, Tev1 0.8B on a laptop 0.29."
author:
    name: Abderrahman Said-Alaoui
    url: https://www.netria.dev/#founder
---

When I [put a decision model to work on my X feed](/articles/decision-model-x-feed/), every post it judged went to Jev, TypeSafe's model, through OpenRouter. The cost was never the issue: about 3 cents for a thousand posts. What bothered me was everything else. The posts I read left my laptop, and the filter needed an API key and an OpenRouter account.

Then Ollama, which runs open models on your own computer, added decision models. Its [release notes](https://github.com/ollama/ollama/releases/tag/v0.35.0) describe the new endpoint as "based on TypeSafe's Jev API". It launched with two open models, Tev1 from Together AI and Nimble from Bespoke Labs. Cloudflare's [Clef models](https://blog.cloudflare.com/clef-decision-models/) followed, and [Ollama's docs](https://github.com/ollama/ollama/blob/main/docs/capabilities/decision.mdx) say those can also judge images. A [later release](https://github.com/ollama/ollama/releases/tag/v0.40.0) runs them all on Apple's MLX framework. If the API really matched, my add-on, Xift, could ask its questions without anything leaving my laptop.

It did match. Xift sends each post with four `noul` questions: does it mainly fish for likes, reposts, replies or follows, is it mainly written to provoke anger, does it share little real information, and is it mainly selling something. I sent the same request to Ollama and got four probabilities back in the same shape. The only change was the address: a port on my own laptop instead of OpenRouter.

Memory was the real limit. My laptop is a MacBook Pro with an M4 chip and 16 GB of memory, which the processor and the graphics share. Tev1 comes in two sizes, 0.8 and 4 billion parameters, 1.5 and 4.4 GB to download, and both load without trouble. Clef Flash, the model that reads photos, needs 11.5 GB of graphics memory, more than macOS gives Ollama on a 16 GB Mac. Raising that limit let it load. On five photo posts I wrote for the test, it reached the same verdicts as Jev, and without the photos it missed three of them. But each post took between 9 and 78 seconds, with almost no memory left for anything else. On this laptop, local means text only.

I started where I did with Jev: posts I wrote myself, the kind my feed is full of. Of 16, eleven were noise and five were worth reading. Under the limits I had set for Jev, Jev collapsed all eleven. Tev1 4B collapsed six, Tev1 0.8B five, and Nimble, the largest text model at 9 GB, eight. None of them collapsed a post worth reading. The local models weren't blind to the noise. They scored it lower, so it rarely reached limits measured on Jev.

That is where the design of the first version paid off. Jev only gives scores. A post collapses when any score reaches its limit, and the limits are mine, outside the model. So each model now gets its own limits, lower for the local models, and keeps its own saved scores, so one model's numbers are never compared against another model's limits.

Invented posts are not my feed, though. So I let a script scroll X search results on AI agents and LLMs, ten minutes for each local model. Afterwards I had all three models score the 442 posts those scrolls saw, from their text alone, each under its own limits.

<figure class="decision-figure">
<span class="df-label">The same 442 posts, three models</span>
<div class="mx-table-wrap">
<table class="mx-table">
<thead><tr><th></th><th>Jev</th><th>Tev1 4B</th><th>Tev1 0.8B</th></tr></thead>
<tbody>
<tr><td>Posts collapsed</td><td>37 (8%)</td><td>34 (8%)</td><td>24 (5%)</td></tr>
<tr><td>Mostly as</td><td>Low substance, self-promotion</td><td>Self-promotion</td><td>Rage bait</td></tr>
<tr><td>Also collapsed by Jev</td><td>–</td><td>13</td><td>2</td></tr>
<tr><td>Average rage bait score</td><td>0.08</td><td>0.03</td><td>0.29</td></tr>
<tr><td>Average low substance score</td><td>0.42</td><td>0.14</td><td>0.33</td></tr>
</tbody>
</table>
</div>
<figcaption>Every post two ten-minute scrolls of X searches showed, scored afterwards by each model from its text. Jev used the limits from the first article; the local models used their own, lower ones.</figcaption>
</figure>

The rates were close. Jev collapsed 8% of the posts, Tev1 4B 8% and Tev1 0.8B 5%. The posts weren't. Of the 37 Jev collapsed, Tev1 4B collapsed 13 and Tev1 0.8B only 2. Just one post was collapsed by all three.

Each model had its own idea of noise. Tev1 4B collapsed posts only for selling something: mostly AI-agent products, crypto projects and event plugs. Jev had given most of them between 0.5 and its limit of 0.85 for self-promotion, so those calls were easy to defend. Tev1 0.8B collapsed posts mostly as rage bait, including news and plain questions that Jev scored well under its limit. Neither caught what Jev caught most often: empty one-liners and throwaway replies, posts that call something great and say nothing else. Jev gave those 0.90 or more for low substance. The local models gave them anywhere from about 0.1 to 0.7, and none reached its limit.

This is where the meaning of a score comes in. A forecaster who says there is a 30% chance of rain is calibrated if it rains on about three in ten of those days. A calibrated decision model works the same way: of the posts it gives 0.3 for rage bait, about three in ten really are. It follows that across many posts, a calibrated model's average score is close to the share of posts that really are what the question asks. On these 442 posts, Jev's average rage bait score was 0.08 and Tev1 0.8B's was 0.29. One says about one post in twelve is rage bait, the other more than one in four. They can't both be calibrated, and the posts Tev1 0.8B collapsed suggest it is the one that overshoots on rage bait. On low substance the gap runs the other way: Jev averages 0.42 and Tev1 4B 0.14, about four posts in ten against one in seven, and there I can't tell which is closer. Calibration is not a given for neural networks: [one widely cited study](https://proceedings.mlr.press/v70/guo17a.html) found that "modern neural networks, unlike those from a decade ago, are poorly calibrated".

In the first article I left one claim untested: that a 0.9 is right nine times in ten. I still can't say that for any of these models. What I can say is that a 0.9 from one model is not a 0.9 from another. Two models behind the same API answer the same question on different scales, and limits measured on one don't carry over to the other.

Speed was the other half. Over the network, Jev answered in about a third of a second. While scrolling, Tev1 0.8B took 0.75 seconds a post and kept up: on average, 1% of the posts on screen were still waiting for a verdict. Tev1 4B took 3.2 seconds, and 4 in 10 posts on screen were still waiting. A verdict that arrives after I've scrolled past a post leaves it open, so a slow model filters less than its scores suggest. These times say as much about my laptop as about the models. Jev runs on hardware no laptop matches, so this is not a like-for-like comparison. But a laptop is what most people would run Ollama on, and if privacy doesn't matter to you, the cloud's speed is a fair reason to stay there.

So on a 16 GB laptop, running locally is a trade. The model that judges well enough is too slow to keep up, and the one that keeps up judges poorly. What I get in return is real: no key, no account, and nothing I read leaves the laptop. A machine with more memory might change the speed half of that trade; I haven't tested one. It wouldn't change the other lesson. The shared API made switching models a one-line change, and the scores made it a new calibration.

Xift now has a Local setting next to Jev, with the setup in [its README](https://github.com/asaidaoui-netria/xift#run-it-on-your-mac). Jev stays the default. With Local, posts go to Ollama on your own computer and nothing goes to OpenRouter. Next I want to try a model small enough to run inside Firefox itself, for people who don't run Ollama. Ollama keeps a [list of the decision models it runs](https://ollama.com/search?c=decision); the ones here are the ones it had in October 2026.
