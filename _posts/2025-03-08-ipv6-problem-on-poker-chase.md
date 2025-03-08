---
layout: post
class: aside
title: IPv6 problem on Poker Chase
category: Network
tags: Web
---
I encountered asset loading problem when playing [Poker Chase][chase] in IPv6
networks.  Asset loading fails from time to time.  Sometimes I have to switch to
mobile app to continue playing.

[chase]: https://poker-chase.com/

I found a solution on Firefox.  Go to `about:config` and set
`network.http.fast-fallback-to-IPv4` to `false`.  I am still not sure what causes
the problem.  I suspect it is related to the CDN used by the game.
