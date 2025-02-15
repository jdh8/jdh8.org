---
layout: post
title: Notifications when a Discord bot goes down
tags: Discord
---
I want [Natsuki][natsuki] to notify me when she goes down.  This task is harder
than I have thought.  How can I count on a failing bot to send a message?  I
cannot trust the hosting provider, either.  They may be the reason why the bot
goes down.  I have to rely on a third party.

[natsuki]: https://github.com/jdh8/natsuki

## Pair the bot with a web server

This sounds like a blasphemy against the [single-responsibility principle][srp].
There are practical reasons to do this.

1. Hosting providers may put *idle* bots to sleep.  Some providers are so
   web-centric that they require serving a web page to keep the bot alive.
2. HTTP(S) serves as a simple and reliable endpoint.  Everyone online can
   ping it.

Below is [how I pair Natsuki with an Axum server][pairing].  The [Axum][axum]
server only serves [204 No Content][204] at root.

```rust
#[shuttle_runtime::async_trait]
impl Service for Natsuki {
    async fn bind(mut self, addr: std::net::SocketAddr) -> Result<(), Error> {
        use axum::{response::NoContent, routing::get, Router};
        let router = Router::new().route("/", get(|| async { NoContent }));

        let (axum, serenity) = futures::join!(
            shuttle_axum::AxumService(router).bind(addr),
            self.0.start_autosharded(),
        );
        serenity.map_err(CustomError::new)?;
        axum
    }
}
```

[204]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204
[axum]: https://docs.rs/axum/latest/axum/
[pairing]: https://github.com/jdh8/natsuki/blob/5f700f64ca0b6f1b20e56b63614fb583da65e2d3/src/main.rs#L12-L25
[srp]: https://en.wikipedia.org/wiki/Single-responsibility_principle

## Monitor the web server

[To be continued...]