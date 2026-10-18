---
title: "Putting a decision model to work on my X feed"
description: To understand decision models, I tried one on my X feed, where I follow tech news and where a good share of the posts aren't worth my attention. What Jev got right, where it needed me, and how the experiment became a small Firefox add-on.
# Share image: edit assets/og-xift.svg, then re-export the PNG at 1200x630.
image: /assets/og-xift.png
imageAlt: "Putting a decision model to work on my X feed. A feed where a rage-bait post and an engagement-bait post are folded into one-line bars, and a post about cutting CI time stays open."
author:
    name: Abderrahman Said-Alaoui
    url: https://www.netria.dev/#founder
---

<figure class="feed-hook">
    <div class="fh-frame" aria-hidden="true"><div class="fh-scene">
        <div class="fh-caps"><p class="fh-cap fh-cap-0">This is my X feed.</p><p class="fh-cap fh-cap-1">A decision model reads each post in about a third of a second.</p><p class="fh-cap fh-cap-2">The noise folds into one line. The rest stays open.</p><p class="fh-cap fh-cap-3">Noise is personal, so one click teaches it.</p><p class="fh-cap fh-cap-4">Here is what it got right, and where it needed me.</p></div>
        <div class="fh-feed">
            <div class="fh-post fh-post-0 fh-noise"><div class="fh-body"><i class="fh-name"></i><p>Unbelievable. They raised parking fees AGAIN. Share before they delete it.</p></div><div class="fh-bar"><b>Rage bait</b><i class="fh-who"></i><span>Show</span><span>Keep</span></div></div>
            <div class="fh-post fh-post-1"><i class="fh-mark"></i><div class="fh-body"><i class="fh-name"></i><p>We cut our CI time from 14 to 6 minutes by caching Docker layers per branch.</p></div></div>
            <div class="fh-post fh-post-2 fh-noise"><div class="fh-body"><i class="fh-name"></i><p>Like and repost if you agree!!! Follow for more, giveaway at 10k 🔥🔥</p></div><div class="fh-bar"><b>Engagement bait</b><i class="fh-who"></i><span>Show</span><span>Keep</span></div></div>
            <div class="fh-post fh-post-3 fh-noise fh-short"><div class="fh-body"><i class="fh-name"></i><p>Big things coming. Stay tuned 👀</p></div><div class="fh-bar"><b>Low substance</b><i class="fh-who"></i><span>Show</span><span>Keep</span></div></div>
            <div class="fh-post fh-post-4 fh-noise"><i class="fh-mark"></i><div class="fh-body"><i class="fh-name"></i><p>My new course is live! Early-bird price ends Friday. Link in bio.</p></div><div class="fh-bar"><b>Self-promotion</b><i class="fh-who"></i><span>Show</span><span class="fh-keep">Keep</span></div></div>
            <div class="fh-post fh-post-5"><i class="fh-mark"></i><div class="fh-body"><i class="fh-name"></i><p>My code works and I have no idea why. My code doesn’t work and I have no idea why.</p></div></div>
            <div class="fh-post fh-post-6"><i class="fh-mark"></i><div class="fh-body"><i class="fh-name"></i><p>Hot take: most teams don’t need microservices.</p></div></div>
            <svg class="fh-cursor" viewBox="0 0 12 18"><path d="M1 1v14l3.6-3.4 2.5 5.6 2.4-1.1-2.5-5.5H12z" fill="#f2f5f1" stroke="#050706" stroke-width="1.2" stroke-linejoin="round"/></svg>
        </div>
    </div></div><!--/fh-->
    <figcaption><span>My feed with Xift, drawn from this article’s test posts: posts blur while Jev reads them, noise folds into one-line bars, and Keep reopens a post.</span><label class="fh-pause"><input type="checkbox"> Pause</label></figcaption>
</figure>

When TypeSafe released Jev, I wrote [an overview of decision models](/articles/decision-models/): what they are, how they differ from language models, and why their makers call them a System 1 for software. The claims were easy to repeat: a judgment in a third of a second, almost no cost per call, honest confidence. I wanted to see how one behaves on real input, so I tried it on something I do every day.

That something was [my X feed](https://x.com/abdou__dev). X is one of the places where I keep track of the latest news and developments in tech, mostly through search and lists that already pick the subjects for me. It is also known for a high share of posts that aren't worth the attention: requests to like and repost, rage bait, vague hype that says nothing, launches with a link in bio. Posts like these spread because they work: in [a study of 2.7 million posts](https://www.pnas.org/doi/10.1073/pnas.2024292118), each word referring to the other political side raised a post's odds of being shared by 67%. Skipping one takes a second, but on a long feed those seconds add up to more attention on the noise than on the news. Muting words doesn't help, because noise has no keyword: a new model's name turns up in careful benchmarks and in giveaways alike, so muting it hides both. Telling them apart takes the quick judgment decision models claim to offer, and asking a language model about every post in a scrolling feed would be too slow and costly. It looked like a fair test.

I left topics out of it. Search and lists already choose the subject, and they do it well. What they can't do is judge how a post is written, so I asked Jev about the noise instead. Each post gets four questions: does it mainly fish for likes, reposts, replies or follows, is it mainly written to provoke anger, does it share little real information, and is it mainly selling something. Jev calls these `noul` questions. Each is written as an instruction with one sentence for yes and one for no, and the answer is the probability of yes. Here is the rage question, exactly as it is sent:

```js
{
  type: "noul",
  instructions:
    "Is `post.text` mainly written to provoke anger or outrage?",
  criteria: {
    true:
      "`post.text` is mainly written to provoke anger or outrage.",
    false:
      "`post.text` is not mainly written to provoke anger or outrage.",
  },
}
```

The post itself goes along as context: the author's name and handle, the text, any quoted text and the image descriptions. Jev reads it once and scores all four questions in the same pass. What comes back is four numbers and the cost of the call, so there is no text to parse and no answer that falls outside the question.

To see what those numbers look like without using anyone's real posts, I wrote seven of my own, the kind my feed is full of, and sent them to Jev through the same code. This is the rage-bait one:

<figure class="decision-figure df-still">
    <div class="df-input">
        <span class="df-label">Post</span>
        <p>“Unbelievable. The city council just voted to raise parking fees AGAIN while they drive around in company cars. These people think we’re stupid. Share before they delete it.”</p>
    </div>
    <p class="df-pass" aria-hidden="true">↓ read once, four questions scored together</p>
    <div class="df-questions">
        <div class="df-q">
            <span class="df-label">Engagement bait</span>
            <div class="df-opt df-win"><span>score</span><span class="df-bar" style="--p: 0.85" aria-hidden="true"></span><span class="df-num">0.85</span></div>
            <div class="df-opt"><span>limit</span><span class="df-bar" style="--p: 0.80" aria-hidden="true"></span><span class="df-num">0.80</span></div>
        </div>
        <div class="df-q">
            <span class="df-label">Rage bait</span>
            <div class="df-opt df-win"><span>score</span><span class="df-bar" style="--p: 0.95" aria-hidden="true"></span><span class="df-num">0.95</span></div>
            <div class="df-opt"><span>limit</span><span class="df-bar" style="--p: 0.80" aria-hidden="true"></span><span class="df-num">0.80</span></div>
        </div>
        <div class="df-q">
            <span class="df-label">Low substance</span>
            <div class="df-opt"><span>score</span><span class="df-bar" style="--p: 0.33" aria-hidden="true"></span><span class="df-num">0.33</span></div>
            <div class="df-opt"><span>limit</span><span class="df-bar" style="--p: 0.90" aria-hidden="true"></span><span class="df-num">0.90</span></div>
        </div>
        <div class="df-q">
            <span class="df-label">Self-promotion</span>
            <div class="df-opt"><span>score</span><span class="df-bar" style="--p: 0.02" aria-hidden="true"></span><span class="df-num">0.02</span></div>
            <div class="df-opt"><span>limit</span><span class="df-bar" style="--p: 0.85" aria-hidden="true"></span><span class="df-num">0.85</span></div>
        </div>
    </div>
    <figcaption>Jev’s real scores for a post I wrote for the test. Two of them pass their limits, and the post collapses under the one furthest over, “Rage bait 0.95”.</figcaption>
</figure>

Two scores passed their limits, so the post collapses into a one-line bar that names the bigger miss, "Rage bait 0.95". The closing "Share before they delete it" is what pulled engagement bait over as well. Here are all seven, against the limits I settled on:

<figure class="decision-figure">
<span class="df-label">All seven posts</span>
<div class="mx-table-wrap">
<table class="mx-table">
<thead><tr><th>Post</th><th>Bait</th><th>Rage</th><th>Low</th><th>Promo</th><th>On the feed</th></tr></thead>
<tbody>
<tr><td>“Like and repost if you agree!!! Follow me for more, giveaway at 10k followers 🔥🔥”</td><td>0.98</td><td>0.02</td><td>0.96</td><td>0.73</td><td>Engagement bait 0.98</td></tr>
<tr><td>“Unbelievable. The city council just voted to raise parking fees AGAIN…”</td><td>0.85</td><td>0.95</td><td>0.33</td><td>0.02</td><td>Rage bait 0.95</td></tr>
<tr><td>“Big things coming. Stay tuned 👀”</td><td>0.55</td><td>0.02</td><td>0.97</td><td>0.17</td><td>Low substance 0.97</td></tr>
<tr><td>“My new course ‘Ship Your SaaS in 30 Days’ is live! Early-bird price ends Friday. Link in bio.”</td><td>0.11</td><td>0.02</td><td>0.69</td><td>0.99</td><td>Self-promotion 0.99</td></tr>
<tr><td>“We cut our CI time from 14 to 6 minutes by caching Docker layers per branch…”</td><td>0.12</td><td>0.02</td><td>0.09</td><td>0.02</td><td>Open</td></tr>
<tr><td>“Hot take: most teams don’t need microservices…”</td><td>0.41</td><td>0.13</td><td>0.21</td><td>0.02</td><td>Open</td></tr>
<tr><td>“My code works and I have no idea why. My code doesn’t work and I have no idea why.”</td><td>0.52</td><td>0.02</td><td>0.62</td><td>0.01</td><td>Open</td></tr>
</tbody>
</table>
</div>
<figcaption>Jev’s scores for my seven test posts. The limits: bait 0.80, rage 0.80, low substance 0.90, promo 0.85.</figcaption>
</figure>

The four noisy posts collapsed, each for the reason I would have given myself, and the three I'd want to read stayed open. The joke and the hot take scored higher than the CI write-up, but nowhere near a limit. Each call took between 286 and 484 milliseconds from my laptop and cost $0.000026, about 3 cents for a thousand posts. I sent the CI post three times to see how stable the answers are, and no score moved by more than 0.01.

Those limits are where the model stops and my own code takes over. Jev only gives scores, and the rule for what to do with them fits in one sentence: a post collapses when any score reaches its limit. I set them by scoring a few dozen posts I wrote for the purpose and placing each limit in the gap between the noise and the posts worth reading. Low substance got the highest limit, because noise of every kind scores high on it, and so can a good joke.

Keeping the decision outside the model mattered more than I expected. When a limit is wrong, I change a number instead of rewriting a prompt. It is also why I pin one dated version of Jev: the limits were measured against it, and a new version means measuring again.

The limits also had to keep learning, because what counts as noise is personal. In the overview, I described decision models handing their unsure cases to a slower System 2. On my feed, that System 2 is me. A collapsed post stays in place as a bar, one click from opening. When I keep one, each limit it crossed rises a little. When I hide a post that stayed open, the limit it came closest to drops a little, but only if the post came near it. If it wasn't close, I probably hid it for its topic, and nothing is learned. Jev itself never changes. The limits drift, one click at a time, toward what I actually want to read.

<figure class="decision-figure">
    <span class="df-label">Feed</span>
    <div class="df-feed">
        <div class="df-post" aria-hidden="true"><i style="--w: 35%"></i><i style="--w: 92%"></i><i style="--w: 68%"></i></div>
        <div class="df-collapsed"><b>Rage bait 0.85</b><span class="df-who">@author</span><span class="df-pill">Show</span><span class="df-pill df-pressed">Keep</span></div>
        <div class="df-post" aria-hidden="true"><i style="--w: 28%"></i><i style="--w: 84%"></i><i style="--w: 52%"></i></div>
    </div>
    <figcaption>A mockup of a collapsed post. In its place, a one-line bar gives the reason and the score. Pressing Keep opens the post and raises the rage bait limit from 0.80 to 0.82.</figcaption>
</figure>

Everything so far was about text. TypeSafe has since [announced image input for Jev](https://typesafe.ai/blog/jev-1-14) as an experimental feature, so I now send each post's first photo along with its text. The announcement warns that every model, Jev included, does worse on images than on text, and my first tests agreed: a photo shifts the scores enough that limits set on text don't carry over. So I treat photo judgments as unproven. Keeping or hiding a post judged with a photo doesn't change the limits yet, and I'll keep calibrating and checking them on real use before I rely on them.

Looking back, much of what I learned about Jev is about wording. A decision model has no prompt around its questions, so the questions are the whole interface, and one word can move an answer. A post that shares a benchmark and ends with "reply with your numbers" went over the engagement bait limit when I asked whether it fishes for replies, and stayed under it when I asked whether it mainly does. The questions also overlap: the rage post scored high on bait too, which is why each quality has its own limit and the bar names only one reason.

The speed claim held up. At about a third of a second, a post blurs for a moment while it is judged, then opens or collapses. Scores are kept for a week, so scrolling back or reloading doesn't call Jev again. I haven't tested the stronger claim, that a 0.9 is right nine times in ten. For this use, the scores only had to separate noise from the rest, and on my posts they did.

Kahneman's warning, which I quoted in the overview, holds too: what you see is all there is. Jev sees the post, not the person behind it or the thread around it, so a reply that only makes sense in its thread is judged as if it stood alone. That is the main reason nothing is ever hidden outright. A wrong call costs me a second and a click, and I never lose a post I would have wanted.

What started as a test became the way I read X. Within a week it grew around the same goal of a calmer feed. Focus mode shows one post at a time. X's menu and trending column stay out of view until I reach for them. Keys move between posts, and a list keeps what I have already read. I called it Xift.

It is free and open source on [GitHub](https://github.com/asaidaoui-netria/xift), and it runs in Firefox with your own OpenRouter key. For now it installs from the source; a listing on Firefox's add-on site will follow. Only the post being judged leaves the browser, and it goes only to Jev, through OpenRouter. If you are weighing decision models for your own work, I'd suggest the same route: pick a small judgment you make every day and hand it over. A week of that taught me more about what these models can do than reading their benchmarks did.
