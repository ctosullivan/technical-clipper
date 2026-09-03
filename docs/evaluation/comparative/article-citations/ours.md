| JSON Web Token |
| --- |
| Abbreviation |
| Status |
| First published |
| Latest version |
| Organization |
| Committee |
| Authors |
| Base standards |
| Domain |
| Website |

**JSON Web Token** (**JWT**, suggested pronunciation [/dʒɒt/](https://en.wikipedia.org/wiki/Help:IPA/English "Help:IPA/English"), same as the word "jot")[1] is a [proposed Internet standard](https://en.wikipedia.org/wiki/Internet_Standard#Proposed_Standard "Internet Standard") for creating data with optional [signature](https://en.wikipedia.org/wiki/Signature_(cryptography) "Signature (cryptography)") and/or optional [encryption](https://en.wikipedia.org/wiki/Encryption "Encryption") whose [payload](https://en.wikipedia.org/wiki/Payload_(computing) "Payload (computing)") holds [JSON](https://en.wikipedia.org/wiki/JSON "JSON") that asserts some number of [claims](https://en.wikipedia.org/wiki/Claims-based_identity "Claims-based identity"). The tokens are signed either using a [private secret](https://en.wikipedia.org/wiki/Shared_secret "Shared secret") or a [public/private key](https://en.wikipedia.org/wiki/Public-key_cryptography "Public-key cryptography").

For example, a server could generate a token that has the claim "logged in as administrator" and provide that to a client. The client could then use that token to prove that it is logged in as admin. The tokens can be signed by one party's private key (usually the server's) so that any party can subsequently verify whether the token is legitimate. If the other party, by some suitable and trustworthy means, is in possession of the corresponding public key, they too are able to verify the token's legitimacy. The [tokens](https://en.wikipedia.org/wiki/Session_token "Session token") are designed to be compact,[2] [URL](https://en.wikipedia.org/wiki/URL "URL")-safe,[3] and usable, especially in a [web-browser](https://en.wikipedia.org/wiki/Web_browser "Web browser") [single-sign-on](https://en.wikipedia.org/wiki/Single_sign-on "Single sign-on") (SSO) context. JWT claims can typically be used to pass identity of authenticated users between an [identity provider](https://en.wikipedia.org/wiki/Identity_provider "Identity provider") and a [service provider](https://en.wikipedia.org/wiki/Service_provider "Service provider"), or any other type of claims as required by business processes.[4][5]

JWT relies on other JSON-based standards: [JSON Web Signature](https://en.wikipedia.org/wiki/JSON_Web_Signature "JSON Web Signature") and [JSON Web Encryption](https://en.wikipedia.org/wiki/JSON_Web_Encryption "JSON Web Encryption").[1][6][7]

## Structure

Header

Identifies which algorithm is used to generate the signature. In the below example, `HS256` indicates that this token is signed using HMAC-SHA256.

Typical cryptographic algorithms used are [HMAC](https://en.wikipedia.org/wiki/HMAC "HMAC") with [SHA-256](https://en.wikipedia.org/wiki/SHA-256 "SHA-256") (HS256) and [RSA signature](https://en.wikipedia.org/wiki/Digital_signature "Digital signature") with SHA-256 (RS256). JWA (JSON Web Algorithms) RFC 7518 introduces many more for both authentication and encryption.[8]

```json
{
  "alg": "HS256",
  "typ": "JWT"
}

```

Payload

Contains a set of claims. The JWT specification defines seven Registered Claim Names, which are the [standard fields](https://en.wikipedia.org/wiki/JSON_Web_Token#Standard_fields) commonly included in tokens.[1] Custom claims are usually also included, depending on the purpose of the token.

This example has the standard Issued At Time claim (`iat`) and a custom claim (`loggedInAs`).

```json
{
  "loggedInAs": "admin",
  "iat": 1422779638
}

```

Signature

Securely validates the token. The signature is calculated by encoding the header and payload using [Base64url Encoding](https://en.wikipedia.org/wiki/Base64#RFC_4648 "Base64")

[RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[4648](https://www.rfc-editor.org/rfc/rfc4648) and concatenating the two together with a period separator. That string is then run through the cryptographic algorithm specified in the header. This example uses HMAC-SHA256 with a shared secret (public key algorithms are also defined). The _Base64url Encoding_ is similar to [base64](https://en.wikipedia.org/wiki/Base64 "Base64"), but uses different non-alphanumeric characters and omits padding.

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
