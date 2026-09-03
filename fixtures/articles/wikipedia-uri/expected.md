---
title: Uniform Resource Identifier
source_url: https://en.wikipedia.org/wiki/Uniform_Resource_Identifier
canonical_url: https://en.wikipedia.org/wiki/Uniform_Resource_Identifier
captured: "2026-01-01T00:00:00.000Z"
extractor_version: 1.0.0
export_status: complete_with_warnings
capture_kind: technical_article
---

"URI" redirects here. For other uses, see [URI (disambiguation)](https://en.wikipedia.org/wiki/URI_(disambiguation) "URI (disambiguation)").

Not to be confused with [URL](https://en.wikipedia.org/wiki/URL "URL").

| Uniform Resource Identifier |
| --- |
| Abbreviation |
| Native name |
| Status |
| Organization |
| Authors |
| Domain |
| Website |

A **Uniform Resource Identifier** (**URI**), formerly **Universal Resource Identifier**, is a unique sequence of characters that identifies an abstract or physical resource,[1][: 1] such as resources on a [webpage](https://en.wikipedia.org/wiki/Web_page "Web page"), [email address](https://en.wikipedia.org/wiki/Email_address "Email address"), phone number,[1][: 7] books, real-world objects such as people and places, and concepts. In particular, the resource need not be retrievable via the Internet, or any computer network.[1][: 5]

URIs that provide a means of locating and [retrieving](https://en.wikipedia.org/wiki/Information_retrieval "Information retrieval") information resources on a [network](https://en.wikipedia.org/wiki/Network_(computing) "Network (computing)") (like the [Internet](https://en.wikipedia.org/wiki/Internet "Internet"), an [Intranet](https://en.wikipedia.org/wiki/Intranet "Intranet") or a [computer file system](https://en.wikipedia.org/wiki/Computer_file_system "Computer file system")) are called [Uniform Resource Locators](https://en.wikipedia.org/wiki/Uniform_Resource_Locator "Uniform Resource Locator") (URLs). URLs are therefore a subset of URIs.[1][: 7] Other URIs provide only a unique name, without a means of locating or retrieving the resource or information about it; these are [Uniform Resource Names](https://en.wikipedia.org/wiki/Uniform_Resource_Name "Uniform Resource Name") (URNs). The web technologies that use URIs are not limited to [web browsers](https://en.wikipedia.org/wiki/Web_browser "Web browser").

## History

### Conception

URIs and URLs have a shared history. In 1990, [Tim Berners-Lee](https://en.wikipedia.org/wiki/Tim_Berners-Lee "Tim Berners-Lee")'s proposals for [hypertext](https://en.wikipedia.org/wiki/Hypertext "Hypertext") implicitly introduced the idea of a URL as a short string representing a resource that is the target of a [hyperlink](https://en.wikipedia.org/wiki/Hyperlink "Hyperlink").[2] At the time, people referred to it as a "hypertext name"[3] or "document name".

Over the next three and a half years, as the [World Wide Web](https://en.wikipedia.org/wiki/World_Wide_Web "World Wide Web")'s core technologies of [HTML](https://en.wikipedia.org/wiki/HTML "HTML"), [HTTP](https://en.wikipedia.org/wiki/HTTP "HTTP"), and [web browsers](https://en.wikipedia.org/wiki/Web_browser "Web browser") developed, a need to distinguish a string that provided an address for a resource from a string that merely named a resource emerged. Although not yet formally defined, the term _Uniform Resource Locator_ came to represent the former, and the more contentious _Uniform Resource Name_ came to represent the latter. In July 1992 Berners-Lee's report on the [Internet Engineering Task Force](https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force "Internet Engineering Task Force") (IETF) "UDI (Universal Document Identifiers) [BOF](https://en.wikipedia.org/wiki/Birds_of_a_feather_(computing) "Birds of a feather (computing)")" mentions URLs (as Uniform Resource Locators), URNs (originally, as Unique Resource Numbers), and the need to charter a new working group.[4] In November 1992 the IETF "URI Working Group" met for the first time.[5]

During the debate over defining URLs and URNs, it became evident that the concepts embodied by the two terms were merely aspects of the fundamental, overarching, notion of resource _identification_. In June 1994, the IETF published [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[1630](https://www.rfc-editor.org/rfc/rfc1630), Berners-Lee's first _[Request for Comments](https://en.wikipedia.org/wiki/Request_for_Comments "Request for Comments")_ that acknowledged the existence of URLs and URNs. Most importantly, it defined a formal syntax for _Universal Resource Identifiers_ (i.e. URL-like strings whose precise syntaxes and semantics depended on their schemes). It also attempted to summarize the syntaxes of URL schemes in use at the time. It acknowledged—_but did not standardize_—the existence of relative URLs and fragment identifiers.[6]

### Refinement

In December 1994, RFC[1738](https://www.rfc-editor.org/rfc/rfc1738)[7] formally defined relative and absolute URLs, refined the general URL syntax, defined how to resolve relative URLs to absolute form, and better enumerated the URL schemes then in use. The agreed definition and syntax of URNs had to wait until the publication of IETF RFC[2141](https://www.rfc-editor.org/rfc/rfc2141)[8] in May 1997.

The publication of IETF [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[2396](https://www.rfc-editor.org/rfc/rfc2396)[9] in August 1998 saw the URI syntax become a separate specification[9] and most of the parts of RFCs 1630 and 1738 relating to URIs and URLs in general were revised and expanded by the IETF. The new RFC changed the meaning of _U_ in _URI_ from "Universal" to "Uniform."

In December 1999, RFC[2732](https://www.rfc-editor.org/rfc/rfc2732)[10] provided a minor update to RFC 2396, allowing URIs to accommodate [IPv6](https://en.wikipedia.org/wiki/IPv6 "IPv6") addresses. A number of shortcomings discovered in the two specifications led to a community effort, coordinated by RFC 2396 co-author [Roy Fielding](https://en.wikipedia.org/wiki/Roy_Fielding "Roy Fielding"), that culminated in the publication of IETF RFC[3986](https://www.rfc-editor.org/rfc/rfc3986)[1] in January 2005. While obsoleting the prior standard, it did not render the details of existing URL schemes obsolete; RFC 1738 continues to govern such schemes except where otherwise superseded. IETF RFC[2616](https://www.rfc-editor.org/rfc/rfc2616)[11] for example, refines the `http` scheme. Simultaneously, the IETF published the content of RFC 3986 as the full standard STD 66, reflecting the establishment of the URI generic syntax as an official Internet protocol.

In 2001, the [World Wide Web Consortium](https://en.wikipedia.org/wiki/World_Wide_Web_Consortium "World Wide Web Consortium")'s (W3C) Technical Architecture Group (TAG) published a guide to [best practices](https://en.wikipedia.org/wiki/Best_practices "Best practices") and canonical URIs for publishing multiple versions of a given resource.[12] For example, content might differ by language or by size to adjust for capacity or settings of the device used to access that content.

In August 2002, IETF [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[3305](https://www.rfc-editor.org/rfc/rfc3305)[13] pointed out that the term "URL" had, despite widespread public use, faded into near obsolescence, and serves only as a reminder that some URIs act as addresses by having schemes implying network accessibility, regardless of any such actual use. As URI-based standards such as [Resource Description Framework](https://en.wikipedia.org/wiki/Resource_Description_Framework "Resource Description Framework") make evident, resource identification need not suggest the retrieval of resource representations over the Internet, nor need they imply network-based resources at all.

The [Semantic Web](https://en.wikipedia.org/wiki/Semantic_Web "Semantic Web") uses the HTTP URI scheme to identify both documents and concepts for practical uses, a distinction which has caused confusion as to how to distinguish the two. The _TAG_ published an e-mail in 2005 with a solution of the problem, which became known as the _httpRange-14 resolution_.[14] The W3C subsequently published an Interest Group Note titled "Cool URIs for the Semantic Web", which explained the use of [content negotiation](https://en.wikipedia.org/wiki/Content_negotiation "Content negotiation") and the [HTTP 303](https://en.wikipedia.org/wiki/HTTP_303 "HTTP 303") response code for redirections in more detail.[15]

## Design

### URLs and URNs

A [Uniform Resource Name](https://en.wikipedia.org/wiki/Uniform_Resource_Name "Uniform Resource Name") (URN) is a URI that identifies a resource by name in a particular namespace. A URN may be used to talk about a resource without implying its location or how to access it. For example, in the [International Standard Book Number](https://en.wikipedia.org/wiki/International_Standard_Book_Number "International Standard Book Number") (ISBN) system, _ISBN 0-486-27557-4_ identifies a specific edition of the [William Shakespeare](https://en.wikipedia.org/wiki/William_Shakespeare "William Shakespeare") play _[Romeo and Juliet](https://en.wikipedia.org/wiki/Romeo_and_Juliet "Romeo and Juliet")_. The URN for that edition would be _urn:isbn:0-486-27557-4_. However, it gives no information as to where to find a copy of that book.

A [Uniform Resource Locator](https://en.wikipedia.org/wiki/Uniform_Resource_Locator "Uniform Resource Locator") (URL) is a URI that specifies the means of acting upon or obtaining the representation of a resource, i.e. specifying both its primary access mechanism and network location. For example, the URL `http://example.org/wiki/Main_Page` refers to a resource identified as `/wiki/Main_Page`, whose representation is obtainable via the [Hypertext Transfer Protocol](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol "Hypertext Transfer Protocol") (_http:_) from a network host whose [domain name](https://en.wikipedia.org/wiki/Domain_name "Domain name") is `example.org`. (In this case, HTTP usually implies it to be in the form of [HTML](https://en.wikipedia.org/wiki/HTML "HTML") and related code. In practice, that is not necessarily the case, as HTTP allows specifying arbitrary formats in its header.)

A URN is analogous to a person's name, while a URL is analogous to their street address. In other words, a URN identifies an item and a URL provides a method for finding it.

Technical publications, especially standards produced by the IETF and by the W3C, normally reflect a view outlined in a [W3C Recommendation](https://en.wikipedia.org/wiki/W3C_Recommendation "W3C Recommendation") of 30 July 2001, which acknowledges the precedence of the term URI rather than endorsing any formal subdivision into URL and URN.

> URL is a useful but informal concept: a URL is a type of URI that identifies a resource via a representation of its primary access mechanism (e.g., its network "location"), rather than by some other attributes it may have.[16]

As such, a URL is simply a URI that happens to point to a resource over a network.[a][13] However, in non-technical contexts and in software for the World Wide Web, the term "URL" remains widely used. Additionally, the term "web address" (which has no formal definition) often occurs in non-technical publications as a synonym for a URI that uses the _http_ or _https_ schemes. Such assumptions can lead to confusion, for example, in the case of XML namespaces that have a [visual similarity to resolvable URIs](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#Relation_to_XML_namespaces).

Specifications produced by the [WHATWG](https://en.wikipedia.org/wiki/WHATWG "WHATWG") prefer _URL_ over _URI_, and so newer HTML5 APIs use _URL_ over _URI_.[17]

> Standardize on the term URL. URI and IRI \[Internationalized Resource Identifier\] are just confusing. In practice a single algorithm is used for both so keeping them distinct is not helping anyone. URL also easily wins the search result popularity contest.[18]

While most URI schemes were originally designed to be used with a particular [protocol](https://en.wikipedia.org/wiki/Protocol_(computing) "Protocol (computing)"), and often have the same name, they are semantically different from protocols. For example, the scheme _http_ is generally used for interacting with [web resources](https://en.wikipedia.org/wiki/Web_resource "Web resource") using HTTP, but the scheme _[file](https://en.wikipedia.org/wiki/File_URI_scheme "File URI scheme")_ has no protocol.

### Syntax

See also: [List of URI schemes](https://en.wikipedia.org/wiki/List_of_URI_schemes "List of URI schemes")

A URI has a scheme that refers to a specification for assigning identifiers within that scheme. As such, the URI syntax is a federated and extensible naming system wherein each scheme's specification may further restrict the syntax and semantics of identifiers using that scheme. The URI generic syntax is a superset of the syntax of all URI schemes. It was first defined in [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[2396](https://www.rfc-editor.org/rfc/rfc2396), published in August 1998,[9] and finalized in [RFC](https://en.wikipedia.org/wiki/RFC_(identifier) "RFC (identifier)")[3986](https://www.rfc-editor.org/rfc/rfc3986), published in January 2005.[19]

A URI is composed from an allowed set of [ASCII](https://en.wikipedia.org/wiki/ASCII "ASCII") characters consisting of [reserved characters](https://en.wikipedia.org/wiki/Filename "Filename") (gen-delims: `:`, `/`, `?`, `#`, `[`, `]`, and `@`; sub-delims: `!`, `$`, `&`, `'`, `(`, `)`, `*`, `+`, `,`, `;`, and `=`),[1][: 13–14] unreserved characters ([uppercase and lowercase letters](https://en.wikipedia.org/wiki/Latin-script_alphabet "Latin-script alphabet"), [decimal digits](https://en.wikipedia.org/wiki/Arabic_numerals "Arabic numerals"), `-`, `.`, `_`, and `~`),[1][: 13–14] and the character `%`.[1][: 12] Syntax components and subcomponents are separated by _delimiters_ from the reserved characters (only from generic reserved characters for components) and define _identifying data_ represented as unreserved characters, reserved characters that do not act as delimiters in the component and subcomponent respectively,[1][: §2] and [percent-encodings](https://en.wikipedia.org/wiki/Percent-encoding "Percent-encoding") when the corresponding character is outside the allowed set or is being used as a delimiter of, or within, the component. A percent-encoding of an identifying data [octet](https://en.wikipedia.org/wiki/Octet_(computing) "Octet (computing)") is a sequence of three characters, consisting of the character `%` followed by the two hexadecimal digits representing that octet's numeric value.[1][: §2.1]

The URI generic syntax consists of five _components_ organized hierarchically in order of decreasing significance from left to right:[1][: §3]

```
URI = scheme ":" ["//" authority] path ["?" query] ["#" fragment]

```

A component is _undefined_ if it has an associated delimiter and the delimiter does not appear in the URI; the scheme and path components are always defined.[1][: §5.2.1] A component is _empty_ if it has no characters; the scheme component is always non-empty.[1][: §3]

The authority component consists of _subcomponents_:

```
authority = [userinfo "@"] host [":" port]

```

This is represented in a [syntax diagram](https://en.wikipedia.org/wiki/Syntax_diagram "Syntax diagram") as:

The URI comprises:

- A non-empty **.mw-parser-output .vanchor>:target~.vanchor-text{background-color:#ebf4ff}@media screen{html.skin-theme-clientpref-night .mw-parser-output .vanchor>:target~.vanchor-text{background-color:#0f4dc9}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .vanchor>:target~.vanchor-text{background-color:#0f4dc9}}scheme** component followed by a colon (`:`), consisting of a sequence of characters beginning with a letter and followed by any combination of letters, digits, plus (`+`), period (`.`), or hyphen (`-`). Although schemes are case-insensitive, the canonical form is lowercase and documents that specify schemes must do so with lowercase letters. Examples of popular schemes include `http`, `https`, `ftp`, `mailto`, `file`, `data` and `irc`. URI schemes should be registered with the [Internet Assigned Numbers Authority (IANA)](https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority "Internet Assigned Numbers Authority"), although non-registered schemes are used in practice.[20]

- An optional **authority** component preceded by two slashes (`//`), comprising:

  - An optional **userinfo** subcomponent followed by an at symbol (`@`), that may consist of a [user name](https://en.wikipedia.org/wiki/User_(computing) "User (computing)") and an optional [password](https://en.wikipedia.org/wiki/Password "Password") preceded by a colon (`:`). Use of the format `username:password` in the userinfo subcomponent is deprecated for security reasons. Applications should not render as clear text any data after the first colon (`:`) found within a userinfo subcomponent unless the data after the colon is the empty string (indicating no password).
  - A **host** subcomponent, consisting of either a registered name (including but not limited to a [hostname](https://en.wikipedia.org/wiki/Hostname "Hostname")) or an [IP address](https://en.wikipedia.org/wiki/IP_address "IP address"). [IPv4](https://en.wikipedia.org/wiki/IPv4 "IPv4") addresses must be in [dot-decimal notation](https://en.wikipedia.org/wiki/Dot-decimal_notation "Dot-decimal notation"), and [IPv6](https://en.wikipedia.org/wiki/IPv6 "IPv6") addresses must be enclosed in brackets (`[]`).[1][: §3.2.2][b]
  - An optional **port** subcomponent preceded by a colon (`:`), consisting of decimal digits.

- A **path** component, consisting of a sequence of path segments separated by a slash (`/`). A path is always defined for a URI, though the defined path may be empty (zero length). A segment may also be empty, resulting in two consecutive slashes (`//`) in the path component. A path component may resemble or map exactly to a [file system path](https://en.wikipedia.org/wiki/Path_(computing) "Path (computing)") but does not always imply a relation to one. If an authority component is defined, then the path component must either be empty or begin with a slash (`/`). If an authority component is undefined, then the path cannot begin with an empty segment—that is, with two slashes (`//`)—since the following characters would be interpreted as an authority component.[9][: §3.3]

By convention, in **http** and **https** URIs, the last part of a _path_ is named **pathinfo** and it is optional. It is composed by zero or more path segments that do not refer to an existing physical resource name (e.g. a file, an internal module program or an executable program) but to a logical part (e.g. a command or a qualifier part) that has to be passed separately to the first part of the path that identifies an executable module or program managed by a [web server](https://en.wikipedia.org/wiki/Web_server "Web server"); this is often used to select dynamic content (a document, etc.) or to tailor it as requested (see also: [CGI](https://en.wikipedia.org/wiki/Common_Gateway_Interface "Common Gateway Interface") and PATH\_INFO, etc.).

Example:

URI: `"http://www.example.com/questions/3456/my-document"`

where: `"/questions"` is the first part of the _path_ (an executable module or program) and `"/3456/my-document"` is the second part of the _path_ named _pathinfo_, which is passed to the executable module or program named `"/questions"` to select the requested document.

An **http** or **https** URI containing a _pathinfo_ part without a [query](https://en.wikipedia.org/wiki/Uniform_Resource_Identifier#query) part may also be referred to as a '[clean URL](https://en.wikipedia.org/wiki/Clean_URL "Clean URL"),' whose last part may be a '[slug](https://en.wikipedia.org/wiki/Clean_URL#Slug "Clean URL").'

| Query delimiter | Example |
| --- | --- |
| Ampersand (`&`) | `key1=value1&key2=value2` |
| Semicolon (`;`)[c] | `key1=value1;key2=value2` |

- An optional **query** component preceded by a question mark (`?`), consisting of a [query string](https://en.wikipedia.org/wiki/Query_string "Query string") of non-hierarchical data. Its syntax is not well defined, but by convention is most often a sequence of [attribute–value pairs](https://en.wikipedia.org/wiki/Attribute%E2%80%93value_pair "Attribute–value pair") separated by a [delimiter](https://en.wikipedia.org/wiki/Delimiter "Delimiter").
- An optional **fragment** component preceded by a [hash](https://en.wikipedia.org/wiki/Number_sign "Number sign") (`#`). The fragment contains a [fragment identifier](https://en.wikipedia.org/wiki/Fragment_identifier "Fragment identifier") providing direction to a secondary resource, such as a section heading in an article identified by the remainder of the URI. When the primary resource is an [HTML](https://en.wikipedia.org/wiki/HTML "HTML") document, the fragment is often an [`id` attribute](https://en.wikipedia.org/wiki/HTML#Attributes "HTML") of a specific element, and web browsers will scroll this element into view.

The scheme- or implementation-specific reserved character `+` may be used in the scheme, userinfo, host, path, query, and fragment, and the scheme- or implementation-specific reserved characters `!`, `$`, `&`, `'`, `(`, `)`, `*`, `,`, `;`, and `=` may be used in the userinfo, host, path, query, and fragment. Additionally, the generic reserved character `:` may be used in the userinfo, path, query and fragment, the generic reserved characters `@` and `/` may be used in the path, query and fragment, and the generic reserved character `?` may be used in the query and fragment.[1][: §A]

### Example URIs

The following displays example URIs and their component parts.

```

          @media screen{html.skin-theme-clientpref-night .mw-parser-output div:not(.notheme)>.tmp-color,html.skin-theme-clientpref-night .mw-parser-output p>.tmp-color,html.skin-theme-clientpref-night .mw-parser-output table:not(.notheme) .tmp-color{color:inherit!important}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output div:not(.notheme)>.tmp-color,html.skin-theme-clientpref-os .mw-parser-output p>.tmp-color,html.skin-theme-clientpref-os .mw-parser-output table:not(.notheme) .tmp-color{color:inherit!important}}userinfo       host      port
          ┌──┴───┐ ┌──────┴──────┐ ┌┴─┐
  https://john.doe@www.example.com:1234/forum/questions/?tag=networking&order=newest#top
  └─┬─┘   └─────────────┬─────────────┘└───────┬───────┘ └────────────┬────────────┘ └┬┘
  scheme            authority                path                   query          fragment
          userinfo       host      port
          ┌──┴───┐ ┌──────┴──────┐ ┌┴─┐
  https://john.doe@www.example.com:1234/forum/questions/?tag=networking&order=newest#:~:text=whatever
  └─┬─┘   └─────────────┬─────────────┘└───────┬───────┘ └────────────┬────────────┘ └───────┬───────┘
  scheme            authority                path                   query                 fragment

  ldap://[2001:db8::7]/c=GB?objectClass?one
  └┬─┘   └─────┬─────┘└─┬─┘ └──────┬──────┘
  scheme   authority   path      query

  mailto:John.Doe@example.com
  └─┬──┘ └────┬─────────────┘
  scheme     path

  news:comp.infosystems.www.servers.unix
  └┬─┘ └─────────────┬─────────────────┘
  scheme            path

  tel:+1-816-555-1212
  └┬┘ └──────┬──────┘
  scheme    path

  telnet://192.0.2.16:80/
  └─┬──┘   └─────┬─────┘│
  scheme     authority  path

  urn:oasis:names:specification:docbook:dtd:xml:4.1.2
  └┬┘ └──────────────────────┬──────────────────────┘
  scheme                    path

```

DOIs ([digital object identifiers](https://en.wikipedia.org/wiki/Digital_object_identifier "Digital object identifier")) fit within the [Handle System](https://en.wikipedia.org/wiki/Handle_System "Handle System") and fit within the URI system, [as facilitated by appropriate syntax](https://en.wikipedia.org/wiki/Handle_System#DOIs-Handles-URIs "Handle System").

### URI references

A _URI reference_ is either a URI or a _relative reference_ when it does not begin with a scheme component followed by a colon (`:`).[1][: §4.1] A path segment that contains a colon character (e.g., `foo:bar`) cannot be used as the first path segment of a relative reference if its path component does not begin with a slash (`/`), as it would be mistaken for a scheme component. Such a path segment must be preceded by a dot path segment (e.g., `./foo:bar`).[1][: §4.2]

Web document [markup languages](https://en.wikipedia.org/wiki/Markup_language "Markup language") frequently use URI references to point to other resources, such as external documents or specific portions of the same logical document:[1][: §4.4]

- in [HTML](https://en.wikipedia.org/wiki/HTML "HTML"), the value of the `src` attribute of the `img` element provides a URI reference, as does the value of the `href` attribute of the `a` or `link` element;
- in [XML](https://en.wikipedia.org/wiki/XML "XML"), the [system identifier](https://en.wikipedia.org/wiki/System_identifier "System identifier") appearing after the `SYSTEM` keyword in a [DTD](https://en.wikipedia.org/wiki/Document_Type_Definition "Document Type Definition") is a fragmentless URI reference;
- in [XSLT](https://en.wikipedia.org/wiki/XSLT "XSLT"), the value of the `href` attribute of the `xsl:import` element/instruction is a URI reference; likewise the first argument to the `document()` function.

```
https://example.com/path/resource.txt#fragment
//example.com/path/resource.txt
/path/resource.txt
path/resource.txt
../resource.txt
./resource.txt
resource.txt
#fragment

```

### Resolution

_Resolving_ a URI reference against a _base URI_ results in a _target URI_. This implies that the base URI exists and is an _absolute URI_ (a URI with no fragment component). The base URI can be obtained, in order of precedence, from:[1][: §5.1]

- the reference URI itself if it is a URI;
- the content of the representation;
- the entity encapsulating the representation;
- the URI used for the actual retrieval of the representation;
- the context of the application.

Within a representation with a well defined base URI of

```
http://a/b/c/d;p?q

```

a relative reference is resolved to its target URI as follows:[1][: §5.4]

```
"g:h"     -> "g:h"
"g"       -> "http://a/b/c/g"
"./g"     -> "http://a/b/c/g"
"g/"      -> "http://a/b/c/g/"
"/g"      -> "http://a/g"
"//g"     -> "http://g"
"?y"      -> "http://a/b/c/d;p?y"
"g?y"     -> "http://a/b/c/g?y"
"#s"      -> "http://a/b/c/d;p?q#s"
"g#s"     -> "http://a/b/c/g#s"
"g?y#s"   -> "http://a/b/c/g?y#s"
";x"      -> "http://a/b/c/;x"
"g;x"     -> "http://a/b/c/g;x"
"g;x?y#s" -> "http://a/b/c/g;x?y#s"
""        -> "http://a/b/c/d;p?q"
"."       -> "http://a/b/c/"
"./"      -> "http://a/b/c/"
".."      -> "http://a/b/"
"../"     -> "http://a/b/"
"../g"    -> "http://a/b/g"
"../.."   -> "http://a/"
"../../"  -> "http://a/"
"../../g" -> "http://a/g"

```

### URL munging

URL munging is a technique by which a [command](https://en.wikipedia.org/wiki/Command_(computing) "Command (computing)") is appended to a URL, usually at the end, after a "?" [token](https://en.wikipedia.org/wiki/Lexical_analysis#Token "Lexical analysis"). It is commonly used in [WebDAV](https://en.wikipedia.org/wiki/WebDAV "WebDAV") as a mechanism of adding functionality to [HTTP](https://en.wikipedia.org/wiki/HTTP "HTTP"). In a versioning system, for example, to add a "checkout" command to a URL, it is written as `http://editing.com/resource/file.php?command=checkout`. It has the advantage of both being easy for [CGI parsers](https://en.wikipedia.org/wiki/Common_Gateway_Interface "Common Gateway Interface") and also acts as an intermediary between HTTP and underlying resource, in this case.[24]

### Relation to XML namespaces

In [XML](https://en.wikipedia.org/wiki/XML "XML"), a [namespace](https://en.wikipedia.org/wiki/XML_namespace "XML namespace") is an abstract domain to which a collection of element and attribute names can be assigned. The namespace name is a character string which must adhere to the generic URI syntax.[25] However, the name is generally not considered to be a URI,[26] because the URI specification bases the decision not only on lexical components, but also on their intended use. A namespace name does not necessarily imply any of the semantics of URI schemes; for example, a namespace name beginning with _http:_ may have no connotation to the use of the [HTTP](https://en.wikipedia.org/wiki/HTTP "HTTP").

Originally, the namespace name could match the syntax of any non-empty URI reference, but the use of relative URI references was deprecated by the W3C.[27] A separate W3C specification for namespaces in XML 1.1 permits [Internationalized Resource Identifier](https://en.wikipedia.org/wiki/Internationalized_Resource_Identifier "Internationalized Resource Identifier") (IRI) references to serve as the basis for namespace names in addition to URI references.[28]

## See also

- [CURIE](https://en.wikipedia.org/wiki/CURIE?action=edit&redlink=1 "CURIE (page does not exist)")
- [Linked data](https://en.wikipedia.org/wiki/Linked_data "Linked data")
- [Extensible Resource Identifier](https://en.wikipedia.org/wiki/Extensible_Resource_Identifier "Extensible Resource Identifier")
- [Internationalized Resource Identifier](https://en.wikipedia.org/wiki/Internationalized_Resource_Identifier "Internationalized Resource Identifier") (IRI)
- [Internet resource locator](https://en.wikipedia.org/wiki/Internet_resource_locator "Internet resource locator")
- [Persistent uniform resource locator](https://en.wikipedia.org/wiki/Persistent_uniform_resource_locator "Persistent uniform resource locator")
- [Uniform Naming Convention](https://en.wikipedia.org/wiki/Uniform_Naming_Convention "Uniform Naming Convention")
- [Resource Directory Description Language](https://en.wikipedia.org/wiki/Resource_Directory_Description_Language "Resource Directory Description Language")
- [Universally unique identifier](https://en.wikipedia.org/wiki/Universally_unique_identifier "Universally unique identifier")
- [List of URI schemes](https://en.wikipedia.org/wiki/List_of_URI_schemes "List of URI schemes")
- [Resource Description Framework](https://en.wikipedia.org/wiki/Resource_Description_Framework "Resource Description Framework")

## Notes

## References

### Works cited

- [Bray, Tim](https://en.wikipedia.org/wiki/Tim_Bray "Tim Bray"); Hollander, Dave; Layman, Andrew; Tobin, Richard, eds. (2006-08-16). ["Namespaces in XML 1.1 (Second Edition)"](http://www.w3.org/TR/REC-xml-names/#iri-use). [World Wide Web Consortium](https://en.wikipedia.org/wiki/World_Wide_Web_Consortium "World Wide Web Consortium"). 2.2 Use of URIs as Namespace Names. Retrieved 2015-08-31.
- [Bray, Tim](https://en.wikipedia.org/wiki/Tim_Bray "Tim Bray"); Hollander, Dave; Layman, Andrew; Tobin, Richard; Thompson, Henry S., eds. (2009-12-08). ["Namespaces in XML 1.0 (Third Edition)"](http://www.w3.org/TR/REC-xml-names/#iri-use). [World Wide Web Consortium](https://en.wikipedia.org/wiki/World_Wide_Web_Consortium "World Wide Web Consortium"). 2.2 Use of URIs as Namespace Names. Retrieved 2015-08-31.
- [Harold, Elliotte Rusty](https://en.wikipedia.org/wiki/Elliotte_Rusty_Harold "Elliotte Rusty Harold") (2004). _XML 1.1 Bible_ (Thirded.). [Wiley Publishing](https://en.wikipedia.org/wiki/Wiley_Publishing "Wiley Publishing"). p.291. [ISBN](https://en.wikipedia.org/wiki/ISBN_(identifier) "ISBN (identifier)")[978-0-7645-4986-1](https://en.wikipedia.org/wiki/Special:BookSources/978-0-7645-4986-1 "Special:BookSources/978-0-7645-4986-1").
- Lawrence, Eric (2014-03-06). ["Browser Arcana: IP Literals in URLs"](http://blogs.msdn.com/b/ieinternals/archive/2014/03/06/browser-arcana-ipv4-ipv6-literal-urls-dotted-va-dotless.aspx). _IEInternals_. [Microsoft](https://en.wikipedia.org/wiki/Microsoft "Microsoft"). Retrieved 2016-04-25.
- [Morrison, Michael Wayne](https://en.wikipedia.org/wiki/Michael_Wayne_Morrison "Michael Wayne Morrison") (2006). "Hour 5: _Putting Namespaces to Use_". _Sams Teach Yourself XML_. [Sams Publishing](https://en.wikipedia.org/wiki/Sams_Publishing "Sams Publishing"). p.91.
- Whitehead, E.J (1998). "WebDAV: IEFT standard for collaborative authoring on the Web". _[IEEE Internet Computing](https://en.wikipedia.org/wiki/IEEE_Internet_Computing "IEEE Internet Computing")_. **2** (5): 34–40. [doi](https://en.wikipedia.org/wiki/Doi_(identifier) "Doi (identifier)"):[10.1109/4236.722228](https://doi.org/10.1109%2F4236.722228). [ISSN](https://en.wikipedia.org/wiki/ISSN_(identifier) "ISSN (identifier)")[1941-0131](https://search.worldcat.org/issn/1941-0131).

## Further reading

- URI Planning Interest Group, W3C/IETF (2001-09-21). ["URIs, URLs, and URNs: Clarifications and Recommendations 1.0"](http://www.w3.org/TR/uri-clarification/). Retrieved 2009-07-27.
- ["On Linking Alternative Representations To Enable Discovery And Publishing"](http://www.w3.org/2001/tag/doc/alternatives-discovery.html). [World Wide Web Consortium](https://en.wikipedia.org/wiki/World_Wide_Web_Consortium "World Wide Web Consortium"). 2006 \[2001\]. Retrieved 2012-04-03.

## External links

- [URI Schemes](https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml)– [IANA](https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority "Internet Assigned Numbers Authority")-maintained registry of URI Schemes
- [URI schemes on the W3C wiki](https://www.w3.org/wiki/UriSchemes)
- [Architecture of the World Wide Web, Volume One, §2: Identification](https://www.w3.org/TR/webarch/#identification)– by W3C
- [W3C URI Clarification](https://www.w3.org/TR/uri-clarification/)

1. A report published in 2002 by a joint W3C/IETF working group aimed to normalize the divergent views held within the IETF and W3C over the relationship between the various 'UR\*' terms and standards. While not published as a full standard by either organization, it has become the basis for the above common understanding and has informed many standards since then.
2. For URIs relating to resources on the World Wide Web, some web browsers allow .0 portions of dot-decimal notation to be dropped or raw integer IP addresses to be used.\[21\]
3. Historic RFC 1866 (obsoleted by RFC 2854\[22\]) encourages CGI authors to support ';' in addition to '&'.\[23\]: §8.2.1
4. T. Berners-Lee; R. Fielding; L. Masinter (January 2005). Uniform Resource Identifier (URI): Generic Syntax. Network Working Group. doi:10.17487/RFC3986. STD 66. RFC 3986. Internet Standard 66. Obsoletes RFC 2732, 2396 and 1808. Updated by RFC 6874, 7320 and 8820. Updates RFC 1738.
5. Palmer, Sean. "The Early History of HTML". infomesh.net. Retrieved 2020-12-06.
6. "W3 Naming Schemes". W3C. 1992-02-24. Retrieved 2020-12-06.
7. "Proceedings of the Twenty-Fourth Internet Engineering Task Force" (PDF). IETF. Corporation for National Research Initiatives. July 1992. p. 193. Retrieved 2021-07-27.
8. "Proceedings of the Twenty-Fifth Internet Engineering Task Force" (PDF). IETF. Corporation for National Research Initiatives. November 1992. p. 501. Retrieved 2021-07-27.
9. Berners-Lee, Tim (June 1994). Universal Resource Identifiers in WWW: A Unifying Syntax for the Expression of Names and Addresses of Objects on the Network as used in the World-Wide Web. Network Working Group. doi:10.17487/RFC1630. RFC 1630. Informational.
10. T. Berners-Lee; L. Masinter; M. McCahill (December 1994). Uniform Resource Locators (URL). Network Working Group. doi:10.17487/RFC1738. RFC 1738. Obsolete. Obsoleted by RFC 4248 and 4266. Updated by RFC 1808, 2368, 2396, 3986, 6196, 6270 and 8089.
11. R. Moats (May 1997). P. Vixie (ed.). URN Syntax. IETF Network Working Group. doi:10.17487/RFC2141. RFC 2141. Proposed Standard. Obsoleted by RFC 8141.
12. T. Berners-Lee; R. Fielding; L. Masinter (August 1998). Uniform Resource Identifiers (URI): Generic Syntax. Network Working Group. doi:10.17487/RFC2396. RFC 2396. Obsolete. Obsoleted by RFC 3986. Updated by RFC 2732. Updates RFC 1808 and 1738.
13. R. Hinden; B. Carpenter; L. Masinter (December 1999). Format for Literal IPv6 Addresses in URL's. Network Working Group. doi:10.17487/RFC2732. RFC 2732. Obsolete. Obsoleted by RFC 3986.
14. R. Fielding; J. Gettys; J. Mogul; H. Frystyk; L. Masinter; P. Leach; T. Berners-Lee (August 1999). Hypertext Transfer Protocol -- HTTP/1.1. Network Working Group. doi:10.17487/RFC2616. RFC 2616. Obsolete. Obsoleted by RFC 7230, 7231, 7232, 7233, 7234 and 7235. Obsoletes RFC 2068. Updated by RFC 2817, 5785, 6266 and 6585.
15. Raman, T.V. (2006-11-01). "On Linking Alternative Representations To Enable Discovery And Publishing". W3C. Retrieved 2020-12-06.
16. Mealling, Michael H.; Denenberg, Ray (August 2002). Report from the Joint W3C/IETF URI Planning Interest Group: Uniform Resource Identifiers (URIs), URLs, and Uniform Resource Names (URNs): Clarifications and Recommendations. Network Working Group. doi:10.17487/RFC3305. RFC 3305. Informational.
17. Fielding, Roy (2005-06-18). "\[httpRange-14\] Resolved". W3C Public mailing list archives. Retrieved 2020-12-06.
18. Ayers, Danny; Völkel, Max (2008-12-03). Sauermann, Leo; Cyganiak, Richard (eds.). "Cool URIs for the Semantic Web". W3C. Retrieved 2020-12-06.
19. URI Planning Interest Group, W3C/IETF (September 2001). "URIs, URLs, and URNs: Clarifications and Recommendations 1.0". www.w3.org. W3C/IETF. Retrieved 2020-12-08.
20. "6.3. URL APIs elsewhere". URL Standard. 2025-05-12.
21. "URL Standard: Goals".
22. Berners-Lee, Tim; Fielding, Roy T.; Masinter, Larry 2005, p. 46; "9. Acknowledgements" sfn error: no target: CITEREFBerners-Lee,\_Tim;\_Fielding,\_Roy\_T.;\_Masinter,\_Larry2005 (help)
23. Hansen, Tony; Hardie, Ted (June 2015). Thaler, Dave (ed.). Guidelines and Registration Procedures for URI Schemes. Internet Engineering Task Force. doi:10.17487/RFC7595. ISSN 2070-1721. BCP 35. RFC 7595. Best Current Practice 35. Updated by RFC 8615. Obsoletes RFC 4395.
24. Lawrence (2014).
25. D. Connolly; L. Masinter (June 2000). The 'text/html' Media Type. Network Working Group. doi:10.17487/RFC2854. RFC 2854. Informational / Legacy. Obsoletes RFC 1980, 1867, 1942, 1866 and 2070. Not endorsed by the IETF.
26. Berners-Lee, Tim; Connolly, Daniel W. (November 1995). Hypertext Markup Language - 2.0. Network Working Group. doi:10.17487/RFC1866. RFC 1866. Historic. Obsoleted by RFC 2854.
27. Whitehead 1998, p. 38.
28. Morrison (2006).
29. Harold (2004).
30. W3C (2009).
31. W3C (2006).
