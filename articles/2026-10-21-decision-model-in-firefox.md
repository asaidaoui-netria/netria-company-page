---
title: "I ran my X feed filter inside Firefox. It works, at a second a post"
description: Could a decision model run inside Firefox itself, for people who don't run Ollama? A 0.6B model in a throwaway add-on answered Xift's four questions in the ordinary release of Firefox, with nothing leaving the browser. It took one to two seconds a post, and on two of the four questions it did no better than chance.
# Share image: edit assets/og-firefox-model.svg, then re-export the PNG at 1200x630.
image: /assets/og-firefox-model.png
imageAlt: "Inside Firefox, 1 second per post. Median time for Xift's four questions about one post: kev-0.6b in Chrome 102 ms, Jev in the cloud 409 ms, kev-0.6b in Firefox 1,074 ms."
author:
    name: Abderrahman Said-Alaoui
    url: https://www.netria.dev/#founder
---

At the end of [the last article](/articles/local-decision-models/), I said I wanted to try a model small enough to run inside Firefox itself, for people who don't run Ollama. That model exists, and it runs. The ordinary release of Firefox on my laptop, with no settings changed, answered Xift's four questions about a post on its own. Nothing went to a server, and no key or account was needed.

It took one to two seconds a post. And outside two of the four questions, the answers weren't good enough to decide what my feed collapses.

The model is [kev-0.6b](https://huggingface.co/onnx-community/kev-0.6b-ONNX), the default in [open-jev](https://github.com/nico-martin/open-jev), a small library that runs "open reproductions of the shape" of Jev in the browser on top of [Transformers.js](https://huggingface.co/docs/transformers.js/en/index). It has 0.6 billion parameters and runs on the graphics chip through WebGPU.

I didn't touch Xift itself. I built a throwaway add-on that loads the model and times it on posts I wrote.

Speed was the surprise.

<figure class="decision-figure df-still df-chart">
<span class="df-label">Median time for Xift’s four questions about one post</span>
<div class="df-opt"><span>Chrome, kev-0.6b</span><span class="df-bar" style="--p: 0.077" aria-hidden="true"></span><span class="df-num">102 ms</span></div>
<div class="df-opt"><span>Ollama, Tev1 0.8B</span><span class="df-bar" style="--p: 0.175" aria-hidden="true"></span><span class="df-num">233 ms</span></div>
<div class="df-opt"><span>Jev, in the cloud</span><span class="df-bar" style="--p: 0.307" aria-hidden="true"></span><span class="df-num">409 ms</span></div>
<div class="df-opt df-win"><span>Firefox, kev-0.6b</span><span class="df-bar" style="--p: 0.806" aria-hidden="true"></span><span class="df-num">1,074 ms</span></div>
<div class="df-opt"><span>Ollama, Tev1 4B</span><span class="df-bar" style="--p: 1" aria-hidden="true"></span><span class="df-num">1,332 ms</span></div>
<figcaption>Own measurements on an M4 MacBook Pro with 16 GB. Firefox 158.0.1: the 16 invented posts from the last article; Chrome 155: 10 of them, three rounds; both on 21 October 2026. Ollama and Jev: the same 16 posts, 19 October. The same model took 10.5 times as long in Firefox as in Chrome.</figcaption>
</figure>

Most of that second isn't the model. One question took 959 ms and four took 1,070, so nearly all of it is a fixed cost on every call. Mozilla has tracked the gap since June 2025, in a bug titled ["qwen3-webgpu is ~10x slower than Chrome"](https://bugzilla.mozilla.org/show_bug.cgi?id=1972635).

Real posts take longer than mine. On the 442 live posts I use below, the median was 1.7 s a post.

It also runs only where Firefox has WebGPU. kev-0.6b was the only one of open-jev's two models that worked, and the fallback that runs on the processor couldn't load the compressed version of either.

<figure class="decision-figure">
<span class="df-label">Where it runs</span>
<div class="mx-table-wrap">
<table class="mx-table">
<thead><tr><th>Platform</th><th>WebGPU in Firefox</th><th>kev-0.6b in Firefox</th></tr></thead>
<tbody>
<tr><td>Apple silicon Mac</td><td>Yes</td><td>Runs (tested)</td></tr>
<tr><td>Windows</td><td>Yes</td><td>Should run (not tested)</td></tr>
<tr><td>Linux</td><td>No</td><td>Doesn’t run</td></tr>
<tr><td>Intel Mac</td><td>No</td><td>Doesn’t run</td></tr>
</tbody>
</table>
</div>
<figcaption>WebGPU support from <a href="https://github.com/mdn/browser-compat-data/blob/main/api/GPU.json">MDN’s compatibility data</a>.</figcaption>
</figure>

Then the answers. I gave it the 442 posts from the last article, everything two ten-minute scrolls of X searches showed me, and compared its scores with Jev's. Scores don't carry across models, so I checked order: sorted by the model's score, do the posts Jev flagged come first? I asked the same of the two Ollama models, on the same posts.

<figure class="decision-figure">
<span class="df-label">The same 442 posts, ranked against Jev</span>
<div class="mx-table-wrap">
<table class="mx-table">
<thead><tr><th>Question</th><th>Posts Jev flagged</th><th>kev-0.6b, Firefox</th><th>Tev1 0.8B, Ollama</th><th>Tev1 4B, Ollama</th></tr></thead>
<tbody>
<tr><td>Rage bait</td><td>7</td><td>0.81</td><td>0.81</td><td>0.99</td></tr>
<tr><td>Self-promotion</td><td>46</td><td>0.72</td><td>0.76</td><td>0.98</td></tr>
<tr><td>Low substance</td><td>155</td><td>0.48</td><td>0.57</td><td>0.89</td></tr>
<tr><td>Engagement bait</td><td>13</td><td>0.46</td><td>0.68</td><td>0.70</td></tr>
</tbody>
</table>
</div>
<figcaption>How well each model ranks the posts Jev scored 0.5 or more above the rest (AUC): 1 is Jev’s order, 0.5 is chance. kev-0.6b in Firefox 158.0.1 on 21 October 2026; Tev1 and Jev scores from the last article, 19 October.</figcaption>
</figure>

On rage bait and self-promotion, kev-0.6b ranked about as well as Tev1 0.8B. On engagement bait and low substance, it did no better than chance. Tev1 4B came closest to Jev on all four, but it's also the slowest.

That matches what the model's author says. Its [model card](https://huggingface.co/onnx-community/kev-0.6b-ONNX) says "Out of domain it is a 0.6B model", right about 62% of the time on questions unlike its training data, where Jev gets 86% on the same tests.

There's a wait before the first answer, too. The model is 346 MB, more than the [200 MB that Mozilla's add-on site accepts](https://github.com/mozilla/addons-server/blob/master/src/olympia/lib/settings_base.py), so it downloads on first use. That took me almost five minutes.

So a decision model does run inside Firefox, with nothing to install, no key, and nothing I read leaving the browser. But it takes one to two seconds a post, does no better than chance on two of the four questions, and doesn't run at all on Linux or Intel Macs. That isn't ready to be a setting in Xift. Local stays Ollama, and Jev stays the default.

Three things could change that. Mozilla is working on the delay: the change that bug waits on, ["Don't poll WebGPU from a timer"](https://bugzilla.mozilla.org/show_bug.cgi?id=1870699), has an owner. Kev 1.0 has a 0.8B model, which [kev.js](https://github.com/ai-ecoverse/kev.js) runs in Chrome; I haven't tried it in Firefox. And Chrome is trialling a [built-in Decisions API](https://chromestatus.com/feature/5155080092385280), with the model inside the browser itself, behind a flag in Chrome 157. Mozilla hasn't [taken a position](https://github.com/mozilla/standards-positions/issues) on it.

Until one of those lands, the quickest way to run a decision model for Firefox is on the laptop beside it, through Ollama.
