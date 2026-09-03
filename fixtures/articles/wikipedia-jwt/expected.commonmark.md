- **JSON Web Token:** Abbreviation · **col2:** JWT
- **JSON Web Token:** Status · **col2:** [Proposed Standard](https://en.wikipedia.org/wiki/Internet_Standard#Proposed_Standard "Internet Standard")
- **JSON Web Token:** First published · **col2:** December28,2010(2010-12-28)
- **JSON Web Token:** Latest version · **col2:** .mw-parser-output cite.citation{font-style:inherit;word-wrap:break-word}.mw-parser-output .citation q{quotes:"\\"""\\"""'""'"}.mw-parser-output .citation:target{background-color:rgba(0,127,255,0.133)}.mw-parser-output .id-lock-free.id-lock-free a{background:url("//upload.wikimedia.org/wikipedia/commons/6/65/Lock-green.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-limited.id-lock-limited a,.mw-parser-output .id-lock-registration.id-lock-registration a{background:url("//upload.wikimedia.org/wikipedia/commons/d/d6/Lock-gray-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-subscription.id-lock-subscription a{background:url("//upload.wikimedia.org/wikipedia/commons/a/aa/Lock-red-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .cs1-ws-icon a{background:url("//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg")right 0.1em center/12px no-repeat}body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-free a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-limited a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-registration a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-subscription a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .cs1-ws-icon a{background-size:contain;padding:0 1em 0 0}.mw-parser-output .cs1-code{color:inherit;background:inherit;border:none;padding:inherit}.mw-parser-output .cs1-hidden-error{display:none;color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-visible-error{color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-maint{display:none;color:#085;margin-left:0.3em}.mw-parser-output .cs1-kern-left{padding-left:0.2em}.mw-parser-output .cs1-kern-right{padding-right:0.2em}.mw-parser-output .citation .mw-selflink{font-weight:inherit}@media screen{.mw-parser-output .cs1-format{font-size:95%}html.skin-theme-clientpref-night .mw-parser-output .cs1-maint{color:#18911f}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .cs1-maint{color:#18911f}}[RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[7519](https://www.rfc-editor.org/rfc/rfc7519)\ May 2015
- **JSON Web Token:** Organization · **col2:** [IETF](https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force "Internet Engineering Task Force")
- **JSON Web Token:** Committee · **col2:** [IEGS](https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force#Internet_Engineering_Steering_Group "Internet Engineering Task Force")
- **JSON Web Token:** Authors · **col2:** Michael B. Jones [Microsoft](https://en.wikipedia.org/wiki/Microsoft "Microsoft") John Bradley [Ping Identity](https://en.wikipedia.org/wiki/Ping_Identity "Ping Identity") Nat Sakimura [NRI](https://en.wikipedia.org/wiki/Nomura_Research_Institute "Nomura Research Institute") 
- **JSON Web Token:** Base standards · **col2:** [JSON](https://en.wikipedia.org/wiki/JSON "JSON") [JSON Web Encryption](https://en.wikipedia.org/wiki/JSON_Web_Encryption "JSON Web Encryption") (JWE) [JSON Web Signature](https://en.wikipedia.org/wiki/JSON_Web_Signature "JSON Web Signature") (JWS) 
- **JSON Web Token:** Domain · **col2:** [Data exchange](https://en.wikipedia.org/wiki/Data_exchange "Data exchange")
- **JSON Web Token:** Website · **col2:** [datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519)

**JSON Web Token** (**JWT**, suggested pronunciation [/dʒɒt/](https://en.wikipedia.org/wiki/Help:IPA/English "Help:IPA/English"), same as the word "jot")[1] is a [proposed Internet standard](https://en.wikipedia.org/wiki/Internet_Standard#Proposed_Standard "Internet Standard") for creating data with optional [signature](https://en.wikipedia.org/wiki/Signature_(cryptography) "Signature (cryptography)") and/or optional [encryption](https://en.wikipedia.org/wiki/Encryption "Encryption") whose [payload](https://en.wikipedia.org/wiki/Payload_(computing) "Payload (computing)") holds [JSON](https://en.wikipedia.org/wiki/JSON "JSON") that asserts some number of [claims](https://en.wikipedia.org/wiki/Claims-based_identity "Claims-based identity"). The tokens are signed either using a [private secret](https://en.wikipedia.org/wiki/Shared_secret "Shared secret") or a [public/private key](https://en.wikipedia.org/wiki/Public-key_cryptography "Public-key cryptography").

For example, a server could generate a token that has the claim "logged in as administrator" and provide that to a client. The client could then use that token to prove that it is logged in as admin. The tokens can be signed by one party's private key (usually the server's) so that any party can subsequently verify whether the token is legitimate. If the other party, by some suitable and trustworthy means, is in possession of the corresponding public key, they too are able to verify the token's legitimacy. The [tokens](https://en.wikipedia.org/wiki/Session_token "Session token") are designed to be compact,[2] [URL](https://en.wikipedia.org/wiki/URL "URL")-safe,[3] and usable, especially in a [web-browser](https://en.wikipedia.org/wiki/Web_browser "Web browser") [single-sign-on](https://en.wikipedia.org/wiki/Single_sign-on "Single sign-on") (SSO) context. JWT claims can typically be used to pass identity of authenticated users between an [identity provider](https://en.wikipedia.org/wiki/Identity_provider "Identity provider") and a [service provider](https://en.wikipedia.org/wiki/Service_provider "Service provider"), or any other type of claims as required by business processes.[4][5]

JWT relies on other JSON-based standards: [JSON Web Signature](https://en.wikipedia.org/wiki/JSON_Web_Signature "JSON Web Signature") and [JSON Web Encryption](https://en.wikipedia.org/wiki/JSON_Web_Encryption "JSON Web Encryption").[1][6][7]

## Structure

```html
<code id="mwRQ">HS256</code>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/HMAC" title="HMAC" id="mwSA">HMAC</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/SHA-256" title="SHA-256" class="mw-redirect" id="mwSQ">SHA-256</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Digital_signature" title="Digital signature" id="mwSg">RSA signature</a>
```

```html
<sup about="#mwt32" class="mw-ref reference" id="cite_ref-8" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{},&quot;body&quot;:{&quot;id&quot;:&quot;mw-reference-text-cite_note-8&quot;}}"><a href="#cite_note-8" id="mwSw"><span class="mw-reflink-text" id="mwTA"><span class="cite-bracket" id="mwTQ">[</span>8<span class="cite-bracket" id="mwTg">]</span></span></a></sup>
```

```json
{
  "alg": "HS256",
  "typ": "JWT"
}

```

```html
<a rel="mw:WikiLink" href="#Standard_fields" class="mw-selflink-fragment" id="mwYg">standard fields</a>
```

```html
<sup about="#mwt34" class="mw-ref reference" id="cite_ref-rfc7519_1-2" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{&quot;name&quot;:&quot;rfc7519&quot;}}"><a href="#cite_note-rfc7519-1" id="mwYw"><span class="mw-reflink-text" id="mwZA"><span class="cite-bracket" id="mwZQ">[</span>1<span class="cite-bracket" id="mwZg">]</span></span></a></sup>
```

```html
<code id="mwaA">iat</code>
```

```html
<code id="mwaQ">loggedInAs</code>
```

```json
{
  "loggedInAs": "admin",
  "iat": 1422779638
}

```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Base64#RFC_4648" title="Base64" id="mwfQ">Base64url Encoding</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/RFC_(identifier)" title="RFC (identifier)" about="#mwt36" class="mw-redirect">RFC</a>
```

```html
<a rel="mw:ExtLink nofollow" href="https://www.rfc-editor.org/rfc/rfc4648" about="#mwt36" class="external text">4648</a>
```

```html
<i id="mwfw">Base64url Encoding</i>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Base64" title="Base64" id="mwgA">base64</a>
```

```
HMAC_SHA256(
  secret,
  base64urlEncoding(header) + '.' +
  base64urlEncoding(payload)
)

```

The three are encoded separately using [Base64url Encoding](https://en.wikipedia.org/wiki/Base64#RFC_4648 "Base64") [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[4648](https://www.rfc-editor.org/rfc/rfc4648), and concatenated using periods to produce the JWT:

```typescript
const token: string = base64urlEncoding(header) + '.' + base64urlEncoding(payload) + '.' + base64urlEncoding(signature)

```

The above data and the secret of "secretkey" creates the token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dnZWRJbkFzIjoiYWRtaW4iLCJpYXQiOjE0MjI3Nzk2Mzh9.gzSraSYS8EXBxLN
_oWnFSRgCzcmJmMjLiuyu5CSpyHI

```

_(The above json strings are formatted without newlines or spaces, into utf-8 byte arrays. This is important as even slight changes in the data will affect the resulting token)_

This resulting token can be easily passed into [HTML](https://en.wikipedia.org/wiki/HTML "HTML") and [HTTP](https://en.wikipedia.org/wiki/HTTP "HTTP").[3]

## Use

- **![](https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Ambox_important.svg/40px-Ambox_important.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail):** [![icon\](https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Question_book-new.svg/60px-Question_book-new.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)](https://en.wikipedia.org/wiki/File:Question_book-new.svg) · ****This section has multiple issues.** Please help **[improve it](https://en.wikipedia.org/wiki/Special:EditPage/JSON_Web_Token "Special:EditPage/JSON Web Token")** or discuss these issues on the **[talk page](https://en.wikipedia.org/wiki/Talk:JSON_Web_Token "Talk:JSON Web Token")**. _([Learn how and when to remove these messages](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_ [![icon\](https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Question_book-new.svg/60px-Question_book-new.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)](https://en.wikipedia.org/wiki/File:Question_book-new.svg)This section **does not [cite](https://en.wikipedia.org/wiki/Wikipedia:Citing_sources "Wikipedia:Citing sources") any [sources](https://en.wikipedia.org/wiki/Wikipedia:Verifiability "Wikipedia:Verifiability")**. Please help [improve this section](https://en.wikipedia.org/wiki/Special:EditPage/JSON_Web_Token "Special:EditPage/JSON Web Token") by [adding citations to reliable sources](https://en.wikipedia.org/wiki/Help:Referencing_for_beginners "Help:Referencing for beginners"). Unsourced material may be challenged and [removed](https://en.wikipedia.org/wiki/Wikipedia:Verifiability#Burden_of_evidence "Wikipedia:Verifiability"). _(February 2026)__ ([Learn how and when to remove this message](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_![](https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Ambox_important.svg/40px-Ambox_important.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)This section **contains [instructions or advice](https://en.wikipedia.org/wiki/Wikipedia:What_Wikipedia_is_not#GUIDE "Wikipedia:What Wikipedia is not")**. Wikipedia is not a guidebook; please help [rewrite such content](https://en.wikipedia.org/w/index.php?title=JSON_Web_Token&action=edit) to be encyclopedic or move it to [Wikiversity](https://en.wikiversity.org/wiki/ "v:"), [Wikibooks](https://en.wikibooks.org/wiki/ "b:"), or [Wikivoyage](https://en.wikivoyage.org/wiki/ "voy:"). _(February 2026)__ ([Learn how and when to remove this message](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_  _ ([Learn how and when to remove this message](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_:** This section **does not [cite](https://en.wikipedia.org/wiki/Wikipedia:Citing_sources "Wikipedia:Citing sources") any [sources](https://en.wikipedia.org/wiki/Wikipedia:Verifiability "Wikipedia:Verifiability")**. Please help [improve this section](https://en.wikipedia.org/wiki/Special:EditPage/JSON_Web_Token "Special:EditPage/JSON Web Token") by [adding citations to reliable sources](https://en.wikipedia.org/wiki/Help:Referencing_for_beginners "Help:Referencing for beginners"). Unsourced material may be challenged and [removed](https://en.wikipedia.org/wiki/Wikipedia:Verifiability#Burden_of_evidence "Wikipedia:Verifiability"). _(February 2026)__ ([Learn how and when to remove this message](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_
- **![](https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Ambox_important.svg/40px-Ambox_important.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail):** ![](https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Ambox_important.svg/40px-Ambox_important.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail) · ****This section has multiple issues.** Please help **[improve it](https://en.wikipedia.org/wiki/Special:EditPage/JSON_Web_Token "Special:EditPage/JSON Web Token")** or discuss these issues on the **[talk page](https://en.wikipedia.org/wiki/Talk:JSON_Web_Token "Talk:JSON Web Token")**. _([Learn how and when to remove these messages](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_ [![icon\](https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Question_book-new.svg/60px-Question_book-new.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)](https://en.wikipedia.org/wiki/File:Question_book-new.svg)This section **does not [cite](https://en.wikipedia.org/wiki/Wikipedia:Citing_sources "Wikipedia:Citing sources") any [sources](https://en.wikipedia.org/wiki/Wikipedia:Verifiability "Wikipedia:Verifiability")**. Please help [improve this section](https://en.wikipedia.org/wiki/Special:EditPage/JSON_Web_Token "Special:EditPage/JSON Web Token") by [adding citations to reliable sources](https://en.wikipedia.org/wiki/Help:Referencing_for_beginners "Help:Referencing for beginners"). Unsourced material may be challenged and [removed](https://en.wikipedia.org/wiki/Wikipedia:Verifiability#Burden_of_evidence "Wikipedia:Verifiability"). _(February 2026)__ ([Learn how and when to remove this message](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_![](https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Ambox_important.svg/40px-Ambox_important.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)This section **contains [instructions or advice](https://en.wikipedia.org/wiki/Wikipedia:What_Wikipedia_is_not#GUIDE "Wikipedia:What Wikipedia is not")**. Wikipedia is not a guidebook; please help [rewrite such content](https://en.wikipedia.org/w/index.php?title=JSON_Web_Token&action=edit) to be encyclopedic or move it to [Wikiversity](https://en.wikiversity.org/wiki/ "v:"), [Wikibooks](https://en.wikibooks.org/wiki/ "b:"), or [Wikivoyage](https://en.wikivoyage.org/wiki/ "voy:"). _(February 2026)__ ([Learn how and when to remove this message](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_  _ ([Learn how and when to remove this message](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_:** This section **contains [instructions or advice](https://en.wikipedia.org/wiki/Wikipedia:What_Wikipedia_is_not#GUIDE "Wikipedia:What Wikipedia is not")**. Wikipedia is not a guidebook; please help [rewrite such content](https://en.wikipedia.org/w/index.php?title=JSON_Web_Token&action=edit) to be encyclopedic or move it to [Wikiversity](https://en.wikiversity.org/wiki/ "v:"), [Wikibooks](https://en.wikibooks.org/wiki/ "b:"), or [Wikivoyage](https://en.wikivoyage.org/wiki/ "voy:"). _(February 2026)__ ([Learn how and when to remove this message](https://en.wikipedia.org/wiki/Help:Maintenance_template_removal "Help:Maintenance template removal"))_

In authentication, when a user successfully logs in, a JSON Web Token (JWT) is often returned. This token should be sent to the client using a secure mechanism like an [HTTP-only cookie](https://en.wikipedia.org/wiki/HTTP_cookie#Secure_and_HttpOnly "HTTP cookie"). Storing the JWT locally in browser storage mechanisms like [local or session storage](https://en.wikipedia.org/wiki/Web_storage "Web storage") is discouraged. This is because JavaScript running on the client-side (including browser extensions) can access these storage mechanisms, exposing the JWT and compromising security. To make use of the HTTP-only cookie, as you might need it to authenticate with cross-origin APIs, the best approach is to use the credentials property to tell the browser to automatically send the cookies to the external APIs via a `fetch` call like so:

```javascript
try {
  const res = await fetch('https://api.example.com/data', {
    method: 'GET',
    credentials: 'include', // This tells the browser to include cookies, etc.
  });
  const data = await res.json();
  console.log(data);
} catch (err) {
  console.error('Error:', err);
}

```

By using this method, the JWT is never exposed to client-side JavaScript; this is the best approach to make use of your JWT while maintaining security best practices. For unattended processes, the client may also authenticate directly by generating and signing its own JWT with a pre-shared secret and passing it to an [OAuth](https://en.wikipedia.org/wiki/OAuth "OAuth") compliant service like so:

```
POST /oauth2/token
Content-type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=eyJhb...

```

If the client passes a valid JWT assertion the server will generate an access\_token valid for making calls to the application and pass it back to the client:

```json
{
  "access_token": "eyJhb...",
  "token_type": "Bearer",
  "expires_in": 3600
}

```

When the client wants to access a protected route or resource, the user agent should send the JWT, typically in the `Authorization` [HTTP header](https://en.wikipedia.org/wiki/HTTP_header "HTTP header") using the `Bearer` schema. The content of the header might look like the following:

```html
Authorization: Bearer eyJhbGci...<snip>...yu5CSpyHI
```

This is a stateless authentication mechanism as the user state is never saved in server memory. The server's protected routes will check for a valid JWT in the Authorization header, and if it is present, the user will be allowed to access protected resources. As JWTs are self-contained, all the necessary information is there, reducing the need to query the database multiple times.

## Standard fields

- **Code:** Standard claim fields · **Name:** The internet drafts define the following standard fields ("claims") that can be used inside a JWT claim set.
- **Code:** `iss` · **Name:** Issuer · **Description:** Identifies principal that issued the JWT, e.g. the name of an organization or a URL of a website.
- **Code:** `sub` · **Name:** Subject · **Description:** Identifies the subject of the JWT, e.g. a username or account number.
- **Code:** `aud` · **Name:** Audience · **Description:** Identifies the recipients that the JWT is intended for. Each principal intended to process the JWT **must** identify itself with a value in the audience claim. If the principal processing the claim does not identify itself with a value in the `aud` claim when this claim is present, then the JWT **must** be rejected.
- **Code:** `exp` · **Name:** Expiration Time · **Description:** Identifies the expiration time on and after which the JWT **must not** be accepted for processing. The value must be a NumericDate:[9] either an integer or decimal, representing seconds past [1970-01-01 00:00:00Z](https://en.wikipedia.org/wiki/Unix_time "Unix time").
- **Code:** `nbf` · **Name:** Not Before · **Description:** Identifies the time on which the JWT will start to be accepted for processing. The value must be a NumericDate.
- **Code:** `iat` · **Name:** Issued at · **Description:** Identifies the time at which the JWT was issued. The value must be a NumericDate.
- **Code:** `jti` · **Name:** JWT ID · **Description:** Case-sensitive unique identifier of the token even among different issuers.
- **Code:** Commonly-used header fields · **Name:** The following fields are commonly used in the header of a JWT
- **Code:** `typ` · **Name:** Token type · **Description:** If present, it must be set to a registered [IANA Media Type](https://www.iana.org/assignments/media-types/media-types.xhtml).
- **Code:** `cty` · **Name:** Content type · **Description:** If nested signing or encryption is employed, it is recommended to set this to `JWT`; otherwise, omit this field.[1]
- **Code:** `alg` · **Name:** Message authentication code algorithm · **Description:** The issuer can freely set an algorithm to verify the signature on the token. However, some supported algorithms are insecure.[10]
- **Code:** `kid` · **Name:** Key ID · **Description:** A hint indicating which key the client used to generate the token signature. The server will match this value to a key on file in order to verify that the signature is valid and the token is authentic.
- **Code:** `x5c` · **Name:** x.509 Certificate Chain · **Description:** A certificate chain in RFC4945 format corresponding to the private key used to generate the token signature. The server will use this information to verify that the signature is valid and the token is authentic.
- **Code:** `x5u` · **Name:** x.509 Certificate Chain URL · **Description:** A URL where the server can retrieve a certificate chain corresponding to the private key used to generate the token signature. The server will retrieve and use this information to verify that the signature is authentic.
- **Code:** `crit` · **Name:** Critical · **Description:** A list of headers that must be understood by the server in order to accept the token as valid
- **Code:** Code · **Name:** Name · **Description:** Description

List of currently registered claim names can be obtained from [IANA](https://en.wikipedia.org/wiki/IANA "IANA") JSON Web Token Claims Registry.[11]

## Implementations

JWT implementations exist for many languages and frameworks, including but not limited to:

- [.NET (C# VB.Net etc.)](https://en.wikipedia.org/wiki/.NET_Framework ".NET Framework")[12]
- [C](https://en.wikipedia.org/wiki/C_(programming_language) "C (programming language)")[13]
- [C++](https://en.wikipedia.org/wiki/C++ "C++")[14][15]
- [Clojure](https://en.wikipedia.org/wiki/Clojure "Clojure")[16]
- [Common Lisp](https://en.wikipedia.org/wiki/Common_Lisp "Common Lisp")[17]
- [Dart](https://en.wikipedia.org/wiki/Dart_(programming_language) "Dart (programming language)")[18]
- [Elixir](https://en.wikipedia.org/wiki/Elixir_(programming_language) "Elixir (programming language)")[19]
- [Erlang](https://en.wikipedia.org/wiki/Erlang_(programming_language) "Erlang (programming language)")
- [Go](https://en.wikipedia.org/wiki/Go_(programming_language) "Go (programming language)")[20]
- [Haskell](https://en.wikipedia.org/wiki/Haskell_(programming_language) "Haskell (programming language)")[21]
- [Java](https://en.wikipedia.org/wiki/Java_(programming_language) "Java (programming language)")[22]
- [JavaScript](https://en.wikipedia.org/wiki/JavaScript "JavaScript")[23]
- [Julia](https://en.wikipedia.org/wiki/Julia_(programming_language) "Julia (programming language)")[24]
- [Lua](https://en.wikipedia.org/wiki/Lua_(programming_language) "Lua (programming language)")[25]
- [Node.js](https://en.wikipedia.org/wiki/Node.js "Node.js")[26]
- [OCaml](https://en.wikipedia.org/wiki/OCaml "OCaml")[27]
- [Perl](https://en.wikipedia.org/wiki/Perl "Perl")[28]
- [PHP](https://en.wikipedia.org/wiki/PHP "PHP")[29]
- [PL/SQL](https://en.wikipedia.org/wiki/PL/SQL "PL/SQL")[30]
- [PowerShell](https://en.wikipedia.org/wiki/PowerShell "PowerShell")[31]
- [Python](https://en.wikipedia.org/wiki/Python_(programming_language) "Python (programming language)")[32]
- [Racket](https://en.wikipedia.org/wiki/Racket_(programming_language) "Racket (programming language)")[33]
- [Raku](https://en.wikipedia.org/wiki/Raku_(programming_language) "Raku (programming language)")[34]
- [Ruby](https://en.wikipedia.org/wiki/Ruby_(programming_language) "Ruby (programming language)")[35]
- [Rust](https://en.wikipedia.org/wiki/Rust_(programming_language) "Rust (programming language)")[36][37]
- [Scala](https://en.wikipedia.org/wiki/Scala_(programming_language) "Scala (programming language)")[38]
- [Swift](https://en.wikipedia.org/wiki/Swift_(programming_language) "Swift (programming language)")[39]

## Vulnerabilities

JSON web tokens may contain session state. But if project requirements allow session invalidation before JWT expiration, services can no longer trust token assertions by the token alone. To validate that the session stored in the token is not revoked, token assertions must be checked against a [data store](https://en.wikipedia.org/wiki/Data_store "Data store"). This renders the tokens no longer stateless, undermining the primary advantage of JWTs.[40]

Security consultant Tim McLean reported vulnerabilities in some JWT libraries that used the `alg` field to incorrectly validate tokens, most commonly by accepting a `alg=none` token. While these vulnerabilities were patched, McLean suggested deprecating the `alg` field altogether to prevent similar implementation confusion.[10] Still, new `alg=none` vulnerabilities are still being found in the wild, with four [CVEs](https://en.wikipedia.org/wiki/Common_Vulnerabilities_and_Exposures "Common Vulnerabilities and Exposures") filed in the 2018-2021 period having this cause.[41]

With proper design, developers can address algorithm vulnerabilities by taking precautions:[42][43]

1. Never let the JWT header alone drive verification
2. Know the algorithms (avoid depending on the `alg` field alone)
3. Use an appropriate key size

Several JWT libraries were found to be vulnerable to an [invalid Elliptic-curve attack](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography#Invalid_curve_attack "Elliptic-curve cryptography") in 2017.[44]

Some have argued that JSON web tokens are difficult to use securely due to the many different encryption algorithms and options available in the standard, and that alternate standards should be used instead for both web frontends[45] and backends.[46]

## See also

- [API key](https://en.wikipedia.org/wiki/API_key "API key")
- [Access token](https://en.wikipedia.org/wiki/Access_token "Access token")
- [Basic access authentication](https://en.wikipedia.org/wiki/Basic_access_authentication "Basic access authentication")
- [Digest access authentication](https://en.wikipedia.org/wiki/Digest_access_authentication "Digest access authentication")
- [Claims-based identity](https://en.wikipedia.org/wiki/Claims-based_identity "Claims-based identity")
- [HTTP header](https://en.wikipedia.org/wiki/HTTP_header "HTTP header")
- Concise Binary Object Representation ([CBOR](https://en.wikipedia.org/wiki/CBOR "CBOR"))

## References

- [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[7519](https://www.rfc-editor.org/rfc/rfc7519)
- [jwt.io](https://jwt.io/) – specialized website about JWT with tools and documentation, maintained by Auth0

1. Jones, Michael B.; Bradley, John; Sakimura, Nat (May 2015). JSON Web Token (JWT). IETF. doi:10.17487/RFC7519. ISSN 2070-1721. RFC 7519.
2. Nickel, Jochen (2016). Mastering Identity and Access Management with Microsoft Azure. Packt Publishing. p. 84. ISBN 9781785887888. Retrieved July 20, 2018.
3. "JWT.IO - JSON Web Tokens Introduction". jwt.io. Retrieved July 20, 2018.
4. Sevilleja, Chris. "The Anatomy of a JSON Web Token". Retrieved May 8, 2015.
5. "Atlassian Connect Documentation". developer.atlassian.com. Archived from the original on May 18, 2015. Retrieved May 8, 2015.
6. Jones, Michael B.; Bradley, John; Sakimura, Nat (May 2015). "draft-ietf-jose-json-web-signature-41 - JSON Web Signature (JWS)". tools.ietf.org. Retrieved May 8, 2015.
7. Jones, Michael B.; Hildebrand, Joe (May 2015). "draft-ietf-jose-json-web-encryption-40 - JSON Web Encryption (JWE)". tools.ietf.org. Retrieved May 8, 2015.
8. Jones, Michael B. (May 2015). "draft-ietf-jose-json-web-algorithms-40 - JSON Web Algorithms (JWA)". tools.ietf.org. Retrieved May 8, 2015.
9. Jones, Michael B.; Bradley, Bradley; Sakimura, Sakimura (May 2015). ""exp" (Expiration Time) Claim". JSON Web Token (JWT). IETF. sec. 4.1.4. doi:10.17487/RFC7519. ISSN 2070-1721. RFC 7519.
10. McLean, Tim (March 31, 2015). "Critical vulnerabilities in JSON Web Token libraries". Auth0. Retrieved March 29, 2016.
11. "JSON Web Token (JWT)". IANA. January 23, 2015. Retrieved December 5, 2024.
12. jwt-dotnet on github.com
13. libjwt on github.com
14. jwt-cpp on github.com
15. POCO C++ Libraries library Poco::JWT
16. "liquidz/clj-jwt". GitHub. Retrieved May 7, 2018.
17. cljwt on github.com
18. JustJWT on github.com
19. "bryanjos/joken". GitHub. Retrieved May 7, 2018.
20. "golang-jwt/jwt". GitHub. Retrieved January 8, 2018.
21. "jose: JSON Object Signing and Encryption (JOSE) and JSON Web Token (JWT) library". Hackage. Retrieved December 25, 2022.
22. auth0/java-jwt on github.com
23. "kjur/jsrsasign". GitHub. Retrieved May 7, 2018.
24. "JWTs.jl". GitHub. Retrieved October 31, 2025.
25. "SkyLothar/lua-resty-jwt". GitHub. Retrieved May 7, 2018.
26. "jsonwebtoken". npm. Retrieved May 7, 2018.
27. ocaml-jwt on github.com
28. Crypt::JWT on cpan.org
29. lcobucci/jwt on github.com
30. Egan, Morten (February 7, 2019), GitHub - morten-egan/jwt\_ninja: PLSQL Implementation of JSON Web Tokens., retrieved March 14, 2019
31. "SP3269/posh-jwt". GitHub. Retrieved August 1, 2018.
32. "jpadilla/pyjwt". GitHub. Retrieved March 21, 2017.
33. net-jwt on pkgs.racket-lang.org
34. JSON-WebToken on github.com
35. ruby-jwt on github.com
36. jsonwebtoken on github.com
37. rust-jwt on github.com
38. jwt-scala on github.com
39. on github.com
40. Slootweg, Sven. "Stop using JWT for sessions". joepie91 Ramblings. Retrieved August 1, 2018.
41. "CVE - Search Results". cve.mitre.org.
42. "Common JWT security vulnerabilities and how to avoid them". Retrieved May 14, 2018.
43. Andreas, Happe. "JWT: Signature vs MAC attacks". snikt.net. Retrieved May 27, 2019.
44. "Critical Vulnerability in JSON Web Encryption". Auth0 - Blog. Retrieved October 14, 2023.
45. "No Way, JOSE! Javascript Object Signing and Encryption is a Bad Standard That Everyone Should Avoid - Paragon Initiative Enterprises Blog". paragonie.com. Retrieved October 13, 2023.
46. "Pitfalls of JWT Authorization". authzed.com. Retrieved November 16, 2023.
