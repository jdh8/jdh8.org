---
layout: post
title: Rewriting Natsuki in Rust
category: Rust
tags: Discord DDLC
---
I'm rewriting Natsuki (3.0) in Rust for several reasons. You can track my
progress at [this branch][branch].

1. **Hosting**: Free hosting tend to assume that node.js projects are websites.
   They put the app to sleep when *idle*, which effectively takes down a
   Discord bot. I'm now self-hosting Natsuki, but I'm not a fan of that.
   Rewriting in another language solves this issue.
2. **Economy commands**: [Shuttle][shuttle] provides free hosting even with 500
   MB of database. This means we can make stateful features in the future, such
   as economy and games.
3. Also please note that I'm considering remove NSFW functions. Discord has
   been more and more hostile to NSFW features. Making Natsuki SFW can spread
   her further.

[branch]: https://github.com/jdh8/natsuki/tree/rewrite-in-rust
[shuttle]: https://www.shuttle.rs/pricing
