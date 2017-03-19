---
layout: post
title: How to set charset all text responses on nginx
---
It's usual that all text files on a site share the same character encoding.
Especially [UTF-8][utf8] is modern *de facto* standard.  However, the default
[`charset_types`][types] does not contain `text/css`, let alone other non-plain
text types e.g. `text/markdown`.

The default `charset_types` should be `text/*` because most of them are parsed
in [ASCII][ascii] (`us-ascii`) by default for backward compatibility.  [A
`text/xml` response is parsed in ASCII][broken] even if [BOM][bom] and [XML
declaration][decl] tells otherwise.  <small>Therefore, we should really use
`application/xml` for XML responses now.</small>

Nevertheless, the `charset_types` setting checks complete matches only, or we
have to resort to the universal match (`*`).  Luckily, nginx has `map` powered
with regex and `charset_types` accepts a variable.

```nginx
map $sent_http_content_type $charset {
    ~^text/   utf-8;
}

charset       $charset;
charset_types *;
```

This setting would make nginx specify UTF-8 for all text responses, e.g.
`text/css; charset=utf-8`.

[ascii]: https://en.wikipedia.org/wiki/ASCII
[bom]: https://en.wikipedia.org/wiki/Byte_order_mark
[broken]: https://annevankesteren.nl/2005/03/text-xml
[decl]: https://xmlwriter.net/xml_guide/xml_declaration.shtml
[types]: https://nginx.org/en/docs/http/ngx_http_charset_module.html#charset_types
[utf8]: https://en.wikipedia.org/wiki/UTF-8

*[ASCII]: American Standard Code for Information Interchange
*[BOM]: byte order mark
*[regex]: regular expression
