**Base64** is a [binary-to-text encoding](https://en.wikipedia.org/wiki/Binary-to-text_encoding "Binary-to-text encoding") that uses 64 [printable characters](https://en.wikipedia.org/wiki/Graphic_character "Graphic character") to represent each 6-bit segment of a sequence of byte[1] values. As for all binary-to-text encodings, Base64 encoding enables [transmitting](https://en.wikipedia.org/wiki/Data_transmission "Data transmission") [binary data](https://en.wikipedia.org/wiki/Binary_data "Binary data") on a [communication channel](https://en.wikipedia.org/wiki/Communication_channel "Communication channel") that only supports text.

When comparing the original data to the resulting encoded data, Base64 encoding increases the size by 33% plus about 4% additional if inserting line breaks for typical line length.

The earliest uses of this encoding were for dial-up communication between systems running the same [operating system](https://en.wikipedia.org/wiki/Operating_system "Operating system") – for example, [uuencode](https://en.wikipedia.org/wiki/Uuencoding "Uuencoding") for [UNIX](https://en.wikipedia.org/wiki/UNIX "UNIX") and [BinHex](https://en.wikipedia.org/wiki/BinHex "BinHex") for the [TRS-80](https://en.wikipedia.org/wiki/TRS-80 "TRS-80") (later adapted for the [Macintosh](https://en.wikipedia.org/wiki/Macintosh "Macintosh")) – and could therefore make more assumptions about what characters were safe to use. For instance, uuencode uses uppercase letters, digits, and many punctuation characters, but no lowercase.[2][3][4][5]

## Applications

![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/35_mm_angle_of_view_vs_focal_length.svg/250px-35_mm_angle_of_view_vs_focal_length.svg.png?utm_source=en.wikipedia.org&utm_campaign=parser&utm_content=thumbnail)

Example of an SVG file containing embedded JPEG images encoded in Base64[6]

Notable applications of Base64:

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/World_Wide_Web" title="World Wide Web" id="mwNQ">World Wide Web</a>
```

```html
<sup about="#mwt18" class="mw-ref reference" id="cite_ref-7" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{},&quot;body&quot;:{&quot;id&quot;:&quot;mw-reference-text-cite_note-7&quot;}}"><a href="#cite_note-7" id="mwNg"><span class="mw-reflink-text" id="mwNw"><span class="cite-bracket" id="mwOA">[</span>7<span class="cite-bracket" id="mwOQ">]</span></span></a></sup>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/HTML" title="HTML" id="mwOg">HTML</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/CSS" title="CSS" id="mwOw">CSS</a>
```

```html
<sup about="#mwt21" class="mw-ref reference" id="cite_ref-8" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{},&quot;body&quot;:{&quot;id&quot;:&quot;mw-reference-text-cite_note-8&quot;}}"><a href="#cite_note-8" id="mwPA"><span class="mw-reflink-text" id="mwPQ"><span class="cite-bracket" id="mwPg">[</span>8<span class="cite-bracket" id="mwPw">]</span></span></a></sup>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/E-mail" title="E-mail" class="mw-redirect" id="mwQg">e-mail</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol" title="Simple Mail Transfer Protocol" id="mwQw">SMTP</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/7-bit_ASCII" title="7-bit ASCII" class="mw-redirect" id="mwRg">7-bit ASCII</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/XML" title="XML" id="mwSw">XML</a>
```

```html
<code id="mwTA"><span typeof="mw:Nowiki" id="mwTQ">&lt;data encoding="base64"&gt;...&lt;/data&gt;</span></code>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Favicon" title="Favicon" id="mwTg">favicons</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Firefox" title="Firefox" id="mwTw">Firefox</a>
```

```html
<code id="mwUA">bookmarks.html</code>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/PDF" title="PDF" id="mwUw">PDF</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/SVG" title="SVG" id="mwVg">SVG</a>
```

```html
<sup about="#mwt24" class="mw-ref reference" id="cite_ref-9" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{},&quot;body&quot;:{&quot;id&quot;:&quot;mw-reference-text-cite_note-9&quot;}}"><a href="#cite_note-9" id="mwVw"><span class="mw-reflink-text" id="mwWA"><span class="cite-bracket" id="mwWQ">[</span>9<span class="cite-bracket" id="mwWg">]</span></span></a></sup>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Delimiter_collision" title="Delimiter collision" class="mw-redirect" id="mwXQ">delimiter collision</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/LDAP_Data_Interchange_Format" title="LDAP Data Interchange Format" id="mwYA">LDAP Data Interchange Format</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Data_URI_scheme" title="Data URI scheme" id="mwYw">data URI scheme</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/CSS" title="CSS" id="mwZA">CSS</a>
```

```html
<code id="mwZQ">data:</code>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Clipboard_(computing)" title="Clipboard (computing)" id="mwaA">clipboard</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Cryptocurrency" title="Cryptocurrency" id="mwaQ">cryptocurrency</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Cryptocurrency_wallet" title="Cryptocurrency wallet" id="mwag">wallet software</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Checksum" title="Checksum" id="mwbQ">file checksums</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Public_key_fingerprint" title="Public key fingerprint" id="mwbg">key fingerprints</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Pretty_Good_Privacy" title="Pretty Good Privacy" id="mwbw">PGP</a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/QR_code" title="QR code" id="mwcg">QR code</a>
```

## Alphabet

The set of characters used to represent the values for each base-64 digit (value from 0 to 63) differs slightly between the variations of Base64. The general strategy is to use printable characters that are common to most [character encodings](https://en.wikipedia.org/wiki/Character_encoding "Character encoding"). This tends to result in data remaining unchanged as it moves through information systems, such as email, that were traditionally not [8-bit clean](https://en.wikipedia.org/wiki/8-bit_clean "8-bit clean").[5] Typically, an encoding uses `A`–`Z`, `a`–`z`, and `0`–`9` for the first 62 values. Many variants use `+` and `/` for the last two.

Per [RFC 4648 §4](https://datatracker.ietf.org/doc/html/rfc4648#section-4), the following table lists the characters used for each numeric value. To indicate padding, `=` is used.

| Value | char |  | Value | char |  | value | char |  | value | char |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | `A` | 16 | `Q` | 32 | `g` | 48 | `w` |  |  |  |
| 1 | `B` | 17 | `R` | 33 | `h` | 49 | `x` |  |  |  |
| 2 | `C` | 18 | `S` | 34 | `i` | 50 | `y` |  |  |  |
| 3 | `D` | 19 | `T` | 35 | `j` | 51 | `z` |  |  |  |
| 4 | `E` | 20 | `U` | 36 | `k` | 52 | `0` |  |  |  |
| 5 | `F` | 21 | `V` | 37 | `l` | 53 | `1` |  |  |  |
| 6 | `G` | 22 | `W` | 38 | `m` | 54 | `2` |  |  |  |
| 7 | `H` | 23 | `X` | 39 | `n` | 55 | `3` |  |  |  |
| 8 | `I` | 24 | `Y` | 40 | `o` | 56 | `4` |  |  |  |
| 9 | `J` | 25 | `Z` | 41 | `p` | 57 | `5` |  |  |  |
| 10 | `K` | 26 | `a` | 42 | `q` | 58 | `6` |  |  |  |
| 11 | `L` | 27 | `b` | 43 | `r` | 59 | `7` |  |  |  |
| 12 | `M` | 28 | `c` | 44 | `s` | 60 | `8` |  |  |  |
| 13 | `N` | 29 | `d` | 45 | `t` | 61 | `9` |  |  |  |
| 14 | `O` | 30 | `e` | 46 | `u` | 62 | `+` |  |  |  |
| 15 | `P` | 31 | `f` | 47 | `v` | 63 | `/` |  |  |  |

Base64URL encoding replaces `+` with `-` and `/` with `_` to make the encoded string HTTP-safe and avoid the need for escaping.

## Examples

To simplify explanation, the example below uses plain text for input. While this is done in practice, a much more common use is encoding images and other data that are normally not representable with plain text, and the result then represents the data in a printable text format.

For the input data:

```
Many hands make light work.

```

The typical Base64 representation is:

```
TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu

```

### Encoding when no padding needed

Each input sequence of 6 bits (which can encode 26=64 values) is mapped to a Base64 alphabet letter. Therefore, Base64 encoding results in four characters for each three input bytes. Assuming the input is ASCII or similar, the byte-data for the first three characters 'M', 'a', 'n' are values `77`, `97`, and `110` which in 8-bit binary representation are `01001101`, `01100001`, and `01101110`. Joining these representations and splitting into 6-bit groups gives:

```
010011 010110 000101 101110

```

Which encodes the string `TWFu` (per ASCII or similar).

The following table shows how input is encoded. For example, the letter 'M' has the value `77` (per ASCII and similar). The first 6 bits of the value is `010011` or 19 decimal which maps to Base64 letter 'T' which has a value `84` (per ASCII and similar).

| Input\ (ASCII) | Letter (ASCII) | M | a | n |
| --- | --- | --- | --- | --- |
| 8-bit\ decimal value | 77 | 97 | 110 |  |
| Hexadecimal\ value | 4 | D | 6 | 1 |
| Bits | 0 | 1 | 0 | 0 |
| Encoded\ (Base64) | 6-bit\ decimal value | 19 | 22 | 5 |
| Letter\ (Base64 alphabet) | T | W | F | u |
| Byte | 84 | 87 | 70 | 117 |

### Encoding with one padding character

If the input consists of a number of bytes that is 2 more than a multiple of 3 (e.g. 'M', 'a'), then the last 2 bytes (16 bits) are encoded in 3 Base64 digits (18 bits). The two [least significant bits](https://en.wikipedia.org/wiki/Least_significant_bit "Least significant bit") of the last content-bearing 6-bit block are treated as zero for encoding and discarded for decoding (along with the trailing `=` padding character).

| Input\  (ASCII) | Letter (ASCII) | M | a |  |
| --- | --- | --- | --- | :---: |
| 8-bit \  decimal value | 77 | 97 |  |  |
| Hexadecimal\ value | 4 | D | 6 | 1 |
| Bits | 0 | 1 | 0 | 0 |
| Encoded\ (Base64) | 6-bit\ decimal value | 19 | 22 | 4 |
| Letter\ (Base64 alphabet) | T | W | E | = |
| Byte | 84 | 87 | 69 | 61 |

### Encoding with two padding characters

If the input consists of a number of bytes that is 1 more than a multiple of 3 (e.g. 'M'), then the last 8 bits are represented in 2 Base64 digits (12 bits). The four [least significant bits](https://en.wikipedia.org/wiki/Least_significant_bit "Least significant bit") of the last content-bearing 6-bit block are treated as zero for encoding and discarded for decoding (along with the trailing two `=` padding characters):

| Input\ (ASCII) | Letter (ASCII) | M |  |
| --- | --- | --- | :---: |
| 8-bit\ decimal value | 77 |  |  |
| Hexadecimal\ value | 4 | D |  |
| Bits | 0 | 1 | 0 |
| Encoded\ (Base64) | 6-bit\ decimal value | 19 | 16 |
| Letter\ (Base64 alphabet) | T | Q | = |
| byte | 84 | 81 | 61 |

### Decoding with padding

When decoding, each sequence of four encoded characters is converted to three output bytes, but with a single padding character the final 4 characters decode to only two bytes, or with two padding characters, the final 4 characters decode to a single byte. For example:

| Encoded | Padding | Length | Decoded |
| --- | --- | --- | --- |
| .mw-parser-output .monospaced{font-family:monospace,monospace}bGlnaHQgdw== | `==` | 1 | _light w_ |
| bGlnaHQgd28= | `=` | 2 | _light wo_ |
| bGlnaHQgd29y | None | 3 | _light wor_ |

Another way to interpret the padding character is to consider it as an instruction to discard 2 trailing bits from the bit string each time a `=` is encountered. For example, when bGlnaHQgdw== is decoded, we convert each character (except the trailing occurrences of `=`) into their corresponding 6-bit representation, and then discard 2 trailing bits for the first `=` and another 2 trailing bits for the other `=`. In this instance, we would get 6 bits from the `d`, and another 6 bits from the `w` for a bit string of length 12, but since we remove 2 bits for each `=` (for a total of 4 bits), the `dw==` ends up producing 8 bits (1 byte) when decoded.

### Decoding without padding

Use of the padding character in encoded text is not essential for decoding. The number of missing bytes can be inferred from the length of the encoded text. In some variants, the padding character is mandatory, while for others it is not used. Notably, when [concatenating](https://en.wikipedia.org/wiki/String_concatenation "String concatenation") Base64 encoded strings, then use of padding characters is _required_ during encoding to avoid ambiguity when decoding.

Without padding, after decoding each sequence of 4 encoded characters, there may be 2 or 3 encoded characters left over (as seen in the table above). A single remaining encoded character is not possible because a single Base64 character only contains 6 bits, and 8 bits are required to create a byte, so the first Base64 character contributes 6 bits, and the second Base64 character contributes its first 2 bits to finish filling the byte (see above).

The following table demonstrates decoding encoded strings that have 2, 3 or no left-over characters.

| Encoded | Length\ of last group | "missing" bytes | Decoded | Decoded length\ of last group |
| --- | --- | --- | --- | --- |
| bGlnaHQgdw | 2 | 2 | _light w_ | 1 |
| bGlnaHQgd28 | 3 | 1 | _light wo_ | 2 |
| bGlnaHQgd29y | 4 | 0 | _light wor_ | 3 |

Decoding without padding is not performed consistently among decoders - some decoders require padding while other decoders infer the correct amount of padding from the encoded input string.[10] In addition, allowing padless decoding by definition allows one list of strings written in some particular order to decode into several possible different output strings rather than only one possible output string, which can be a security risk due to the unpredictable and/or unexpected decoding.[11]

## Variants

Variations of Base64 differ in the alphabet used and structural aspects like maximum line length. The most commonly used alphabet is that described by RFC 4648 and most variations only differ in the last two letters used. The following table describes more commonly used encodings that are specified by an [RFC](https://en.wikipedia.org/wiki/Request_for_Comments "Request for Comments").

| Encoding[12] | Specification | Alphabet | Lines |
| --- | --- | --- | --- |
| 62nd | 63rd | pad | Separators |
| Base 64 Encoding | [RFC 4648 §4](https://datatracker.ietf.org/doc/html/rfc4648#section-4) | `+` | `/` |
| Base 64 Encoding with URL and Filename Safe Alphabet | [RFC 4648 §5](https://datatracker.ietf.org/doc/html/rfc4648#section-5) | `-` | `_` |
| for [MIME](https://en.wikipedia.org/wiki/Base64#MIME) | [RFC 2045](https://datatracker.ietf.org/doc/html/rfc2045) | `+` | `/` |
| for [Privacy-Enhanced Mail](https://en.wikipedia.org/wiki/Base64#Privacy-enhanced_mail) (deprecated) | [RFC 1421](https://datatracker.ietf.org/doc/html/rfc1421) | `+` | `/` |
| for [UTF-7](https://en.wikipedia.org/wiki/Base64#UTF-7) | [RFC 2152](https://datatracker.ietf.org/doc/html/rfc2152) | `+` | `/` |
| for IMAP mailbox names | [RFC 3501](https://datatracker.ietf.org/doc/html/rfc3501#section-5.1.3) | `+` | `,` |
| Textual Encodings of PKIX, PKCS, and CMS Structures | [RFC 7468](https://datatracker.ietf.org/doc/html/rfc7468) | `+` | `/` |
| ASCII armor for [OpenPGP](https://en.wikipedia.org/wiki/Base64#OpenPGP) | [RFC 9580](https://datatracker.ietf.org/doc/html/rfc9580) | `+` | `/` |

### RFC 4648

.mw-parser-output cite.citation{font-style:inherit;word-wrap:break-word}.mw-parser-output .citation q{quotes:"\\"""\\"""'""'"}.mw-parser-output .citation:target{background-color:rgba(0,127,255,0.133)}.mw-parser-output .id-lock-free.id-lock-free a{background:url("//upload.wikimedia.org/wikipedia/commons/6/65/Lock-green.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-limited.id-lock-limited a,.mw-parser-output .id-lock-registration.id-lock-registration a{background:url("//upload.wikimedia.org/wikipedia/commons/d/d6/Lock-gray-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-subscription.id-lock-subscription a{background:url("//upload.wikimedia.org/wikipedia/commons/a/aa/Lock-red-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .cs1-ws-icon a{background:url("//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg")right 0.1em center/12px no-repeat}body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-free a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-limited a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-registration a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-subscription a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .cs1-ws-icon a{background-size:contain;padding:0 1em 0 0}.mw-parser-output .cs1-code{color:inherit;background:inherit;border:none;padding:inherit}.mw-parser-output .cs1-hidden-error{display:none;color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-visible-error{color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-maint{display:none;color:#085;margin-left:0.3em}.mw-parser-output .cs1-kern-left{padding-left:0.2em}.mw-parser-output .cs1-kern-right{padding-right:0.2em}.mw-parser-output .citation .mw-selflink{font-weight:inherit}@media screen{.mw-parser-output .cs1-format{font-size:95%}html.skin-theme-clientpref-night .mw-parser-output .cs1-maint{color:#18911f}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .cs1-maint{color:#18911f}}[RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[4648](https://www.rfc-editor.org/rfc/rfc4648) describes various encodings including Base64, and it discusses the use of line feeds in encoded data, the use of padding in encoded data, the use of non-alphabet characters in encoded data, use of different encoding alphabets, and canonical encodings. The variant that it calls _Base 64 Encoding_ and _base64_ is intended for general-use.

The RFC also specifies a second Base64 encoding that it calls _Base 64 Encoding with URL and Filename Safe Alphabet_ that is intended for representing relatively long identifying information. For example, a database persistence framework for [Java](https://en.wikipedia.org/wiki/Java_(programming_language) "Java (programming language)") objects might use Base64 encoding to encode a relatively large unique id (generally 128-bit [UUIDs](https://en.wikipedia.org/wiki/UUID "UUID")) as a string for use as an HTTP parameter in an HTTP form or an HTTP GET [URL](https://en.wikipedia.org/wiki/URL "URL"). Also, many [applications](https://en.wikipedia.org/wiki/Application_software "Application software") need to encode binary data in a way that is convenient for inclusion in a URL, including in hidden web form fields, and Base64 is a convenient encoding to render them in a compact way.

Using standard Base64 in a [URL](https://en.wikipedia.org/wiki/URL "URL") requires encoding the `+`, `/` and `=` characters as special [percent-encoded](https://en.wikipedia.org/wiki/Percent-encoding "Percent-encoding") hexadecimal sequences (`+` becomes `%2B`, `/` becomes `%2F` and `=` becomes `%3D`), which makes the string longer and harder to read. Using a different alphabet allows for encoding as Base64 without requiring this extra markup. Typically, `+` and `/` are replaced by `-` and `_`, respectively, so that using URL encoders/decoders is no longer necessary and has no effect on the length of the encoded value, leaving the same encoded form intact for use in relational databases, web forms, and object identifiers in general. A popular site to make use of such is [YouTube](https://en.wikipedia.org/wiki/YouTube#Uploading "YouTube").[13] Some variants allow or require omitting the padding `=` signs to avoid them being confused with field separators, or require that any such padding be percent-encoded. Some libraries  encode `=` as `.`, potentially exposing applications to [relative path attacks](https://en.wikipedia.org/wiki/Directory_traversal_attack "Directory traversal attack") when a folder name is encoded from user data.

### RFC 3548

[RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[3548](https://www.rfc-editor.org/rfc/rfc3548), entitled _The Base16, Base32, and Base64 Data Encodings_, is an informational (non-normative) memo that attempts to unify the [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[1421](https://www.rfc-editor.org/rfc/rfc1421) and [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[2045](https://www.rfc-editor.org/rfc/rfc2045) specifications of Base64 encodings, alternative-alphabet encodings, and the Base32 (which is seldom used) and Base16 encodings. RFC 4648 obsoletes RFC 3548.

Unless an encoder is written to a specification that refers to [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[3548](https://www.rfc-editor.org/rfc/rfc3548) and specifically requires otherwise, RFC 3548 forbids an encoder from generating messages containing characters outside the encoding alphabet or without padding, and it also declares that a decoder must reject data that contain characters other than the encoding alphabet.[4]

### MIME

The [MIME](https://en.wikipedia.org/wiki/MIME "MIME") (Multipurpose Internet Mail Extensions) specification lists Base64 as one of two [binary-to-text encoding](https://en.wikipedia.org/wiki/Binary-to-text_encoding "Binary-to-text encoding") schemes (the other being [quoted-printable](https://en.wikipedia.org/wiki/Quoted-printable "Quoted-printable")).[3] MIME's Base64 encoding is based on that of the [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[1421](https://www.rfc-editor.org/rfc/rfc1421) version of PEM: it uses the same 64-character alphabet and encoding mechanism as PEM and uses the `=` symbol for output padding in the same way, as described at [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[2045](https://www.rfc-editor.org/rfc/rfc2045).

MIME does not specify a fixed length for Base64-encoded lines, but it does specify a maximum line length of 76 characters. Additionally, it specifies that any character outside the standard set of 64 encoding characters (for example CRLF sequences), must be ignored by a compliant decoder, although most implementations use a CR/LF [newline](https://en.wikipedia.org/wiki/Newline "Newline") pair to delimit encoded lines.

Thus, the actual length of MIME-compliant Base64-encoded binary data is usually about 137% of the original data length (.mw-parser-output .frac{white-space:nowrap}.mw-parser-output .frac .num,.mw-parser-output .frac .den{font-size:80%;line-height:0;vertical-align:super}.mw-parser-output .frac .den{vertical-align:sub}.mw-parser-output .sr-only{border:0;clip:rect(0,0,0,0);clip-path:polygon(0px 0px,0px 0px,0px 0px);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}4⁄3×78⁄76), though for very short messages the overhead can be much higher due to the overhead of the headers. Very roughly, the final size of Base64-encoded binary data is equal to 1.37 times the original data size + 814 bytes (for headers). The size of the decoded data can be approximated with this formula:

```
bytes = (string_length(encoded_string) − 814) / 1.37

```

### Privacy-enhanced mail

The first known standardized use of the encoding now called MIME Base64 was in the [Privacy-Enhanced Mail](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail "Privacy-Enhanced Mail") (PEM) protocol, proposed by [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[989](https://www.rfc-editor.org/rfc/rfc989) in 1987. PEM defines a "printable encoding" scheme that uses Base64 encoding to transform an arbitrary sequence of bytes to a format that can be expressed in short lines of 6-bit characters, as required by transfer protocols such as [SMTP](https://en.wikipedia.org/wiki/SMTP "SMTP").[14]

The current version of PEM (specified in [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[1421](https://www.rfc-editor.org/rfc/rfc1421)) uses a 64-character alphabet consisting of upper- and lower-case [Roman letters](https://en.wikipedia.org/wiki/Roman_letters "Roman letters") (`A`–`Z`, `a`–`z`), the numerals (`0`–`9`), and the `+` and `/` symbols. The `=` symbol is also used as a padding suffix.[2] The original specification, [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[989](https://www.rfc-editor.org/rfc/rfc989), additionally used the `*` symbol to delimit encoded but unencrypted data within the output stream.

To convert data to PEM printable encoding, the first byte is placed in the [most significant](https://en.wikipedia.org/wiki/Most_significant_bit "Most significant bit") eight bits of a 24-bit [buffer](https://en.wikipedia.org/wiki/Data_buffer "Data buffer"), the next in the middle eight, and the third in the [least significant](https://en.wikipedia.org/wiki/Least_significant_bit "Least significant bit") eight bits. If there are fewer than three bytes left to encode (or in total), the remaining buffer bits will be zero. The buffer is then used, six bits at a time, most significant first, as indices into the string: "`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/`", and the indicated character is output.

The process is repeated on the remaining data until fewer than four bytes remain. If three bytes remain, they are processed normally. If fewer than three bytes (24 bits) are remaining to encode, the input data is right-padded with zero bits to form an integral multiple of six bits.

After encoding the non-padded data, if two bytes of the 24-bit buffer are padded-zeros, two `=` characters are appended to the output; if one byte of the 24-bit buffer is filled with padded-zeros, one `=` character is appended. This signals the decoder that the zero bits added due to padding should be excluded from the reconstructed data. This also guarantees that the encoded output length is a multiple of 4 bytes.

PEM requires that all encoded lines consist of exactly 64 printable characters, with the exception of the last line, which may contain fewer printable characters. Lines are delimited by whitespace characters according to local (platform-specific) conventions.

### UTF-7

[UTF-7](https://en.wikipedia.org/wiki/UTF-7 "UTF-7"), described first in [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[1642](https://www.rfc-editor.org/rfc/rfc1642), which was later superseded by [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[2152](https://www.rfc-editor.org/rfc/rfc2152), introduced a system called _modified Base64_. This data encoding scheme is used to encode [UTF-16](https://en.wikipedia.org/wiki/UTF-16 "UTF-16") as [ASCII](https://en.wikipedia.org/wiki/ASCII "ASCII") characters for use in 7-bit transports such as [SMTP](https://en.wikipedia.org/wiki/SMTP "SMTP"). It is a variant of the Base64 encoding used in MIME.[15][16]

The "Modified Base64" alphabet consists of the MIME Base64 alphabet, but does not use the "`=`" padding character. UTF-7 is intended for use in mail headers (defined in [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[2047](https://www.rfc-editor.org/rfc/rfc2047)), and the "`=`" character is reserved in that context as the escape character for "quoted-printable" encoding. Modified Base64 simply omits the padding and ends immediately after the last Base64 digit containing useful bits leaving up to three unused bits in the last Base64 digit.

### OpenPGP

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Pretty_Good_Privacy#OpenPGP" title="Pretty Good Privacy">Pretty Good Privacy §<span typeof="mw:Entity">&#160;</span>OpenPGP</a>
```

[OpenPGP](https://en.wikipedia.org/wiki/OpenPGP "OpenPGP"), described in [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[9580](https://www.rfc-editor.org/rfc/rfc9580), specifies "[ASCII armor](https://en.wikipedia.org/wiki/ASCII_armor "ASCII armor")", which is identical to the "Base64" encoding described by MIME, with the addition of an optional 24-bit [CRC](https://en.wikipedia.org/wiki/Cyclic_redundancy_check "Cyclic redundancy check"). The [checksum](https://en.wikipedia.org/wiki/Checksum "Checksum") is calculated on the input data before encoding; the checksum is then encoded with the same Base64 algorithm and, prefixed by the "`=`" symbol as the separator, appended to the encoded output data.[17]

### Javascript (DOM Web API)

The `atob()` and `btoa()` JavaScript methods, defined in the HTML5 draft specification,[18][19] provide Base64 encoding and decoding functionality to web pages. The `btoa()` method outputs padding characters, but these are optional in the input of the `atob()` method.\
 Example: Encoding of the beginning of a GIF file: `btoa("GIF89a")` ↦ `"R0lGODlh"`.

### With atypical alphabet order

Several variants use alphabets similar to the common variants, but in a different order.

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Crypt_(C)" title="Crypt (C)" id="mwBAQ"><b id="mwBAU">crypt</b></a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Passwd#Password_file" title="Passwd" id="mwBAY"><code id="mwBAc">/etc/passwd</code> file</a>
```

```html
<code id="mwBAg">.</code>
```

```html
<code id="mwBAk">/</code>
```

```html
<code id="mwBAo">./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz</code>
```

```html
<b id="mwBA0"><a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/GEDCOM" title="GEDCOM" id="mwBA4">GEDCOM</a></b>
```

```html
<code id="mwBBA">./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz</code>
```

```html
<sup about="#mwt226" class="mw-ref reference" id="cite_ref-20" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{},&quot;body&quot;:{&quot;id&quot;:&quot;mw-reference-text-cite_note-20&quot;}}"><a href="#cite_note-20" id="mwBBE"><span class="mw-reflink-text" id="mwBBI"><span class="cite-bracket" id="mwBBM">[</span>20<span class="cite-bracket" id="mwBBQ">]</span></span></a></sup>
```

```html
<b id="mwBBc"><a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Bcrypt" title="Bcrypt" id="mwBBg">bcrypt</a></b>
```

```html
<code id="mwBBo">./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789</code>
```

```html
<sup about="#mwt229" class="mw-ref reference" id="cite_ref-21" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{},&quot;body&quot;:{&quot;id&quot;:&quot;mw-reference-text-cite_note-21&quot;}}"><a href="#cite_note-21" id="mwBBs"><span class="mw-reflink-text" id="mwBBw"><span class="cite-bracket" id="mwBB0">[</span>21<span class="cite-bracket" id="mwBB4">]</span></span></a></sup>
```

```html
<b id="mwBCE"><a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Xxencoding" title="Xxencoding" id="mwBCI">Xxencoding</a></b>
```

```html
<code id="mwBCM">+</code>
```

```html
<code id="mwBCQ">-</code>
```

```html
<code id="mwBCU">.</code>
```

```html
<code id="mwBCY">/</code>
```

```html
<code id="mwBCg">+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz</code>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Terminal_node_controller" title="Terminal node controller" id="mwBCs">terminal node controllers</a>
```

```html
<sup about="#mwt232" class="mw-ref reference" id="cite_ref-22" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{},&quot;body&quot;:{&quot;id&quot;:&quot;mw-reference-text-cite_note-22&quot;}}"><a href="#cite_note-22" id="mwBCw"><span class="mw-reflink-text" id="mwBC0"><span class="cite-bracket" id="mwBC4">[</span>22<span class="cite-bracket" id="mwBC8">]</span></span></a></sup>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Bash_(Unix_shell)" title="Bash (Unix shell)" id="mwBDI"><b id="mwBDM">Bash</b></a>
```

```html
<code id="mwBDU">0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@_</code>
```

```html
<sup about="#mwt235" class="mw-ref reference" id="cite_ref-23" rel="dc:references" typeof="mw:Extension/ref" data-mw="{&quot;name&quot;:&quot;ref&quot;,&quot;attrs&quot;:{},&quot;body&quot;:{&quot;id&quot;:&quot;mw-reference-text-cite_note-23&quot;}}"><a href="#cite_note-23" id="mwBDY"><span class="mw-reflink-text" id="mwBDc"><span class="cite-bracket" id="mwBDg">[</span>23<span class="cite-bracket" id="mwBDk">]</span></span></a></sup>
```

### With atypical alphabet

Some variants use a Base64 alphabet that is significantly different from the alphabets used in the most common Base64 variants (like RFC 4648).

```html
<b id="mwBD8"><a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Uuencoding" title="Uuencoding" id="mwBEA">Uuencoding</a></b>
```

```html
<code id="mwBEM">_</code>
```

```html
<code id="mwBEU"><span typeof="mw:Entity" id="mwBEY">&#160;</span>!"#$%&amp;'()*+,-./0123456789:;&lt;=&gt;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_</code>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/BinHex" title="BinHex" id="mwBEs"><b id="mwBEw">BinHex 4</b></a>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/Classic_Mac_OS" title="Classic Mac OS" id="mwBE0">classic Mac OS</a>
```

```html
<code id="mwBE4">7</code>
```

```html
<code id="mwBE8">O</code>
```

```html
<code id="mwBFA">g</code>
```

```html
<code id="mwBFE">o</code>
```

~~~html
<code id="mwBFM"><span typeof="mw:Nowiki" id="mwBFQ">!"#$%&amp;'()*+,-012345689@ABCDEFGHIJKLMNPQRSTUVXYZ[`abcdefhijklmpqr</span></code>
~~~

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/UTF-8" title="UTF-8" id="mwBFc">UTF-8</a>
```

```html
<code id="mwBFg">0b10<b id="mwBFk">xxxxxx</b></code>
```

```html
<a rel="mw:WikiLink" href="https://en.wikipedia.org/wiki/UTF-8#Comparison_with_other_encodings" title="UTF-8" id="mwBFo">UTF-8#Self-synchronization</a>
```

## See also

- [8BITMIME](https://en.wikipedia.org/wiki/8BITMIME "8BITMIME") – 8-bit data transmission for SMTP
- [Ascii85](https://en.wikipedia.org/wiki/Ascii85 "Ascii85")– Encoding for a sequence of byte values using 85 printable characters
- [Base16](https://en.wikipedia.org/wiki/Base16 "Base16") – Encoding for a sequence of byte values using hexadecimal
- [Base32](https://en.wikipedia.org/wiki/Base32 "Base32")– Encoding for a sequence of byte values using 32 printable characters
- [Base36](https://en.wikipedia.org/wiki/Base36 "Base36")– Encoding for a sequence of byte values using 36 printable characters
- [Base62](https://en.wikipedia.org/wiki/Base62 "Base62")– Encoding for a sequence of byte values using 62 printable characters
- [Binary number](https://en.wikipedia.org/wiki/Binary_number "Binary number")– Number expressed in the base-2 numeral system

## References

1. technically octet
2. Privacy Enhancement for InternetElectronic Mail: Part I: Message Encryption and Authentication Procedures. IETF. February 1993. doi:10.17487/RFC1421. RFC 1421. Retrieved March 18, 2010.
3. Multipurpose Internet Mail Extensions: (MIME) Part One: Format of Internet Message Bodies. IETF. November 1996. doi:10.17487/RFC2045. RFC 2045. Retrieved March 18, 2010.
4. The Base16, Base32, and Base64 Data Encodings. IETF. July 2003. doi:10.17487/RFC3548. RFC 3548. Retrieved March 18, 2010.
5. The Base16, Base32, and Base64 Data Encodings. IETF. October 2006. doi:10.17487/RFC4648. RFC 4648. Retrieved March 18, 2010.
6. \<image xlink:href="data:image/jpeg;base64,JPEG contents encoded in Base64" ... />
7. "Base64 encoding and decoding – Web APIs". MDN Web Docs. Archived from the original on 2014-11-11.
8. "When to base64 encode images (and when not to)". 28 August 2011. Archived from the original on 2023-08-29.
9. "Edit fiddle". jsfiddle.net.
10. Andrews, William (May 27, 2026). "Base64 explained — what it is, when to use it, and the gotchas that bite developers". Retrieved June 15, 2026.
11. Chalkias, Konstantinos; Chatzigiannis, Panagiotis (30 May 2022). Base64 Malleability in Practice (PDF). ASIA CCS '22: 2022 ACM on Asia Conference on Computer and Communications Security. pp. 1219–1221. doi:10.1145/3488932.3527284.
12. Some specifications describe a Base64 encoding without naming it. This column identifies Base64 encodings in a descriptive way if no particular name is specified.
13. "Here's Why YouTube Will Practically Never Run Out of Unique Video IDs". www.mentalfloss.com. 23 March 2016. Retrieved 27 December 2021.
14. Privacy Enhancement for Internet Electronic Mail. IETF. February 1987. doi:10.17487/RFC0989. RFC 989. Retrieved March 18, 2010.
15. UTF-7 A Mail-Safe Transformation Format of Unicode. IETF. July 1994. doi:10.17487/RFC1642. RFC 1642. Retrieved March 18, 2010.
16. UTF-7 A Mail-Safe Transformation Format of Unicode. IETF. May 1997. doi:10.17487/RFC2152. RFC 2152. Retrieved March 18, 2010.
17. OpenPGP Message Format. IETF. July 2024. doi:10.17487/RFC9580. RFC 9580. Retrieved February 13, 2025.
18. "7.3. Base64 utility methods". HTML 5.2 Editor's Draft. World Wide Web Consortium. Retrieved 2 January 2018. Introduced by changeset 5814 Archived 2014-02-22 at the Wayback Machine, 2021-02-01.
19. "Window: btoa() method". 24 June 2025. Retrieved 2025-07-31.
20. "The GEDCOM Standard Release 5.5". Homepages.rootsweb.ancestry.com. Retrieved 2012-06-21.
21. Provos, Niels (1997-02-13). "src/lib/libc/crypt/bcrypt.c r1.1". Retrieved 2018-05-18.
22. "6PACK a "real time" PC to TNC protocol". Archived from the original on 2012-02-24. Retrieved 2013-05-19.
23. "Shell Arithmetic". Bash Reference Manual. Retrieved 8 April 2020. Otherwise, numbers take the form \[base#\]n, where the optional base is a decimal number between 2 and 64 representing the arithmetic base, and n is a number in that base.
