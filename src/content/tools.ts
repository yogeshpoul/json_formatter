import type { ToolContent, ToolId } from "@/types/content";

export const tools: Record<ToolId, ToolContent> = {
  formatter: {
    id: "formatter",
    href: "/",
    name: "JSON Formatter",
    icon: "braces",
    summary: "Pretty print, validate and minify JSON with custom indentation.",
    metaTitle: "JSON Formatter & Validator – Free, Private, Online",
    metaDescription:
      "Free online JSON formatter and validator that runs entirely in your browser. Pretty print, minify and fix JSON instantly. No uploads, no servers, no tracking.",
    h1: "Free Online JSON Formatter & Validator",
    lead: "Format, validate, and beautify JSON instantly. Your data stays private because everything runs directly in your browser. No uploads. No servers. No tracking of your JSON.",
    intro: [
      "A JSON formatter turns compact or messy JSON into a clean, indented layout that is easy to read and review. This formatter also validates your input as you type, points to the exact line and column of any syntax error, and can minify JSON back to a single line for production use.",
      "Unlike many online tools, this formatter never sends your JSON to a server. Parsing and formatting run inside your browser tab, so API responses, configuration files and logs that contain tokens or personal data stay on your device.",
    ],
    howTo: {
      title: "How to format JSON",
      steps: [
        "Paste JSON into the input panel, drop a .json file onto it, or click Upload.",
        "Choose 2 spaces, 4 spaces or tabs, and optionally sort object keys alphabetically.",
        "The formatted JSON appears instantly in the output panel. Errors are highlighted with their line and column.",
        "Copy the result or download it as a .json file.",
      ],
    },
    features: [
      { title: "Lossless formatting", text: "Numbers, strings and escape sequences are kept exactly as written. Large integers keep every digit." },
      { title: "Precise error messages", text: "Get the line, column and a plain-English explanation such as a missing comma or a trailing comma." },
      { title: "Indentation options", text: "Switch between 2 spaces, 4 spaces, tabs or a minified single line." },
      { title: "Optional key sorting", text: "Sort object keys alphabetically at every level to make documents easier to compare." },
      { title: "Handles large files", text: "Big documents are processed in a background thread, so the page stays responsive." },
      { title: "Keyboard shortcuts", text: "Format with Ctrl/⌘ + Enter, minify with Ctrl/⌘ + Shift + Enter, and save with Ctrl/⌘ + S." },
    ],
    faqs: [
      {
        question: "Is this JSON formatter secure?",
        answer:
          "All formatting and validation run locally in your browser using JavaScript. Your JSON is not uploaded to a server, saved in browser storage, or sent to analytics. As with any website, you should keep your browser and extensions trustworthy, because extensions can read page content.",
      },
      {
        question: "Does this tool upload my JSON?",
        answer:
          "No. The site is a static website with no backend. The editor content is never included in any network request. You can confirm this by opening your browser's developer tools, switching to the Network tab, and formatting some JSON.",
      },
      {
        question: "Is my JSON stored anywhere?",
        answer:
          "No. Your JSON exists only in the memory of the open browser tab. It is not written to cookies, localStorage, sessionStorage or IndexedDB, and it disappears when you close or reload the page.",
      },
      {
        question: "Can I format large JSON files?",
        answer:
          "Yes. Documents larger than a few hundred kilobytes are processed in a Web Worker so the interface does not freeze. Files of tens of megabytes work in modern desktop browsers; the practical limit depends on your device's memory.",
      },
      {
        question: "How do I validate JSON?",
        answer:
          "Paste your JSON into the editor. The status bar shows immediately whether it is valid. If it is not, you will see the error message with its line and column, and you can jump straight to the problem.",
      },
      {
        question: "What is JSON beautification?",
        answer:
          "Beautification, also called pretty printing, adds line breaks and consistent indentation to JSON so that nested objects and arrays are easy to read. It does not change any data.",
      },
      {
        question: "What is the difference between JSON formatting and minification?",
        answer:
          "Formatting adds whitespace to make JSON readable for people. Minification removes all unnecessary whitespace to make the file as small as possible for machines. Both represent exactly the same data.",
      },
      {
        question: "Can I use this JSON formatter offline?",
        answer:
          "Once the page has loaded, formatting and validation do not need an internet connection, because all processing happens in your browser. You can disconnect from the network and keep working in the open tab.",
      },
    ],
    related: ["validator", "minifier", "tree", "diff"],
    keywords: ["JSON formatter", "online JSON formatter", "free JSON formatter", "secure JSON formatter", "browser based JSON formatter"],
  },

  validator: {
    id: "validator",
    href: "/json-validator",
    name: "JSON Validator",
    icon: "shield-check",
    summary: "Check JSON syntax and find errors by line and column.",
    metaTitle: "JSON Validator – Check & Fix JSON Syntax Online",
    metaDescription:
      "Validate JSON online and find syntax errors by exact line and column. Clear explanations for missing commas, quotes and brackets. Runs privately in your browser.",
    h1: "JSON Validator",
    lead: "Check whether your JSON is valid and see exactly where and why it breaks. Validation happens in your browser, so your data is never uploaded.",
    intro: [
      "A JSON validator checks a document against the JSON standard (RFC 8259) and reports anything that would make a parser reject it. Common problems include trailing commas, single-quoted strings, unquoted property names, comments and unescaped line breaks inside strings.",
      "This validator goes beyond a yes or no answer. It shows the line and column of the first error, a code excerpt with a marker under the problem, and a plain-English explanation. It also warns about valid but risky JSON, such as duplicate keys or integers too large for JavaScript to represent exactly.",
    ],
    howTo: {
      title: "How to validate JSON",
      steps: [
        "Paste your JSON into the input panel or upload a .json file.",
        "Read the validation report on the right. It updates as you type.",
        "If there is an error, click Go to error to move the cursor to the exact position.",
        "Fix the problem and watch the status change to Valid JSON.",
      ],
    },
    features: [
      { title: "Strict RFC 8259 checks", text: "The same rules that browsers, Node.js and most APIs apply when parsing JSON." },
      { title: "Line and column numbers", text: "Every error includes its exact location and a highlighted code excerpt." },
      { title: "Human-friendly messages", text: "Explains common mistakes such as trailing commas, comments or Python-style True and None." },
      { title: "Risk warnings", text: "Flags duplicate keys and numbers that lose precision in JavaScript, even when the JSON is technically valid." },
      { title: "Document summary", text: "See the root type, key count, nesting depth and size of valid documents." },
      { title: "Private by design", text: "Validation runs locally. Nothing you paste is transmitted or stored." },
    ],
    faqs: [
      {
        question: "What makes JSON invalid?",
        answer:
          "The most common causes are trailing commas after the last item, single quotes instead of double quotes, property names without quotes, comments, and special values such as undefined, NaN or Infinity, which JSON does not support.",
      },
      {
        question: "Why does my JSON work in JavaScript but fail validation?",
        answer:
          "JavaScript object literals are more permissive than JSON. They allow unquoted keys, single quotes, trailing commas and comments. JSON requires double-quoted keys and strings and forbids comments and trailing commas.",
      },
      {
        question: "Are duplicate keys valid JSON?",
        answer:
          "The JSON standard says keys should be unique but does not forbid duplicates. Most parsers silently keep only the last value, which can hide bugs. This validator accepts the document but shows a warning for each duplicate.",
      },
      {
        question: "Why do I see a warning about large numbers?",
        answer:
          "JavaScript stores numbers as 64-bit floating point values, so integers beyond 9,007,199,254,740,991 are rounded when parsed with JSON.parse. IDs such as Twitter or database snowflake IDs are often affected. Consider sending them as strings.",
      },
      {
        question: "Is my JSON sent to a server for validation?",
        answer: "No. The validator runs entirely in your browser. Your input is never uploaded, logged or stored.",
      },
    ],
    related: ["formatter", "beautifier", "tree", "diff"],
    keywords: ["JSON validator", "validate JSON", "JSON syntax checker", "JSON lint"],
  },

  minifier: {
    id: "minifier",
    href: "/json-minifier",
    name: "JSON Minifier",
    icon: "minimize",
    summary: "Compress JSON to a single line and see the size savings.",
    metaTitle: "JSON Minifier – Compress JSON Online, Privately",
    metaDescription:
      "Minify JSON by removing whitespace and line breaks. See exactly how many bytes you save. Free, fast and private: your JSON never leaves your browser.",
    h1: "JSON Minifier",
    lead: "Remove every unnecessary space and line break from your JSON to make it as compact as possible, without changing a single value.",
    intro: [
      "Minified JSON contains only the characters that carry meaning. Removing indentation and line breaks makes payloads smaller, which reduces bandwidth, speeds up API responses and saves space when JSON is embedded in HTML, environment variables or database fields.",
      "This minifier removes whitespace only between tokens. Spaces inside string values are preserved exactly, and number literals are not rewritten, so the minified document is equivalent to the original.",
    ],
    howTo: {
      title: "How to minify JSON",
      steps: [
        "Paste formatted JSON into the input panel or upload a file.",
        "The minified version appears in the output panel, along with the original and new size.",
        "Optionally sort keys to produce stable output that is easier to compare.",
        "Copy the compact JSON or download it as a file.",
      ],
    },
    features: [
      { title: "Byte savings report", text: "See the input size, output size and percentage saved." },
      { title: "Values untouched", text: "Whitespace inside strings and the exact spelling of numbers are preserved." },
      { title: "Validation included", text: "Invalid JSON is reported with its line and column instead of producing broken output." },
      { title: "Stable output", text: "Optional alphabetical key sorting produces deterministic, diff-friendly minified JSON." },
      { title: "Large file support", text: "Background processing keeps the page responsive with multi-megabyte inputs." },
      { title: "No uploads", text: "Compression happens in your browser, so confidential payloads stay on your machine." },
    ],
    faqs: [
      {
        question: "Does minifying JSON change the data?",
        answer: "No. Minification removes only insignificant whitespace between tokens. Keys, values, order and string contents remain identical.",
      },
      {
        question: "How much smaller does minified JSON get?",
        answer:
          "It depends on how much indentation the original had. Deeply nested documents with 4-space indentation often shrink by 20–40 percent. The tool shows the exact saving for your input.",
      },
      {
        question: "Should I minify JSON for APIs?",
        answer:
          "For network transfer, HTTP compression such as gzip or Brotli usually gives larger savings, and minification adds a little more on top. Minified JSON is most useful where compression is not available, such as in environment variables, query strings or stored blobs.",
      },
      {
        question: "Can I turn minified JSON back into readable JSON?",
        answer: "Yes. Use the JSON Formatter or JSON Beautifier to add indentation back at any time. No information is lost.",
      },
    ],
    related: ["formatter", "beautifier", "escape", "validator"],
    keywords: ["JSON minifier", "minify JSON", "compress JSON", "JSON compressor"],
  },

  beautifier: {
    id: "beautifier",
    href: "/json-beautifier",
    name: "JSON Beautifier",
    icon: "sparkles",
    summary: "Turn compact JSON into clean, readable, indented text.",
    metaTitle: "JSON Beautifier – Pretty Print JSON Online for Free",
    metaDescription:
      "Beautify and pretty print JSON with 2-space, 4-space or tab indentation and optional key sorting. Private, browser-based and free. No sign-up required.",
    h1: "JSON Beautifier",
    lead: "Turn minified or messy JSON into neatly indented, readable text. Choose your indentation style and optionally sort keys.",
    intro: [
      "JSON from APIs, logs and build tools is often delivered on a single line. The JSON Beautifier, also known as a pretty printer, rebuilds the structure with line breaks and consistent indentation, so you can scan nested objects, spot missing fields and review changes.",
      "The output layout matches what JavaScript's JSON.stringify produces, which makes it a good fit for configuration files and code reviews. Unlike re-serialising with JSON.stringify, this beautifier keeps every literal exactly as written, including large numbers and Unicode escapes.",
    ],
    howTo: {
      title: "How to beautify JSON",
      steps: [
        "Paste compact JSON, or upload a .json file from your computer.",
        "Pick 2 spaces, 4 spaces or tab indentation.",
        "Turn on Sort keys if you want object properties in alphabetical order.",
        "Copy the beautified result or save it with Download.",
      ],
    },
    features: [
      { title: "Your preferred style", text: "2 spaces for JavaScript projects, 4 spaces for Python projects, or tabs if your team uses them." },
      { title: "Syntax highlighting", text: "Keys, strings, numbers and literals are color coded in both light and dark themes." },
      { title: "Code folding", text: "Collapse large objects and arrays in the output to focus on what matters." },
      { title: "Alphabetical keys", text: "Optional recursive key sorting makes documents predictable and easier to compare." },
      { title: "Faithful output", text: "Large integers, escape sequences and decimal formatting are never altered." },
      { title: "Runs offline", text: "After the page loads, beautifying works without a network connection." },
    ],
    faqs: [
      {
        question: "What is the difference between a JSON beautifier and a JSON formatter?",
        answer:
          "They are usually the same thing. Beautifying focuses on making JSON readable with indentation. A formatter typically offers beautifying plus related actions such as minifying and validating.",
      },
      {
        question: "Which indentation should I use?",
        answer:
          "Two spaces is the most common choice for JSON and JavaScript projects. Four spaces is common in Python projects. Tabs let each reader choose their own visual width. Pick whatever matches your project's style guide.",
      },
      {
        question: "Does sorting keys change my JSON?",
        answer:
          "Sorting changes the order of properties within objects, but not their values. JSON objects are unordered by definition, so most programs treat the sorted and original documents as equivalent. Array order is never changed.",
      },
      {
        question: "Can I beautify invalid JSON?",
        answer:
          "Not reliably, because the structure can't be determined until the syntax is fixed. The tool shows exactly where the error is so you can correct it, and then beautifies the result.",
      },
    ],
    related: ["formatter", "minifier", "viewer", "tree"],
    keywords: ["JSON beautifier", "beautify JSON", "pretty print JSON", "JSON pretty printer"],
  },

  viewer: {
    id: "viewer",
    href: "/json-viewer",
    name: "JSON Viewer",
    icon: "eye",
    summary: "Read JSON with folding, highlighting and a structure summary.",
    metaTitle: "JSON Viewer – Explore JSON with Folding & Stats",
    metaDescription:
      "View JSON in a syntax-highlighted, foldable editor with a full breakdown of keys, types and depth. Inspect API responses privately in your browser.",
    h1: "JSON Viewer",
    lead: "Explore JSON in a foldable, syntax-highlighted view and get an instant breakdown of its structure.",
    intro: [
      "The JSON Viewer is built for reading JSON rather than editing it. Paste a document and it is formatted into a read-only view with code folding, so you can collapse large sections and expand only the parts you care about.",
      "Alongside the document you get a structure summary: how many objects, arrays, strings, numbers, booleans and nulls it contains, the total number of keys and the maximum nesting depth. That makes it easy to understand an unfamiliar API response at a glance.",
    ],
    howTo: {
      title: "How to view JSON",
      steps: [
        "Paste JSON or upload a file in the input panel.",
        "Read the formatted document on the right, with syntax highlighting and line numbers.",
        "Use the fold arrows in the gutter, or Collapse all and Expand all, to navigate large documents.",
        "Check the structure summary to see types, key counts and depth.",
      ],
    },
    features: [
      { title: "Code folding", text: "Collapse or expand any object or array, or fold everything at once." },
      { title: "Structure summary", text: "Counts for every JSON type, total keys, top-level items and maximum depth." },
      { title: "Read-only view", text: "Explore without accidentally editing the formatted output." },
      { title: "Search", text: "Press Ctrl/⌘ + F inside the viewer to find keys and values." },
      { title: "Light and dark themes", text: "Comfortable highlighting that follows your system preference." },
      { title: "Local only", text: "Documents are rendered in your browser and never leave your device." },
    ],
    faqs: [
      {
        question: "What is a JSON viewer used for?",
        answer:
          "A JSON viewer helps you read and understand JSON documents, such as API responses, exported data or configuration files, by formatting them and letting you collapse sections you do not need.",
      },
      {
        question: "How is the JSON Viewer different from the JSON Tree Viewer?",
        answer:
          "The JSON Viewer shows the formatted text with folding and statistics, which is ideal for reading the document as code. The JSON Tree Viewer shows each key as an expandable node with search and copyable paths, which is ideal for navigating deeply nested data.",
      },
      {
        question: "Can I view very large JSON files?",
        answer:
          "Yes. The viewer renders only the visible lines, so documents with hundreds of thousands of lines remain smooth to scroll.",
      },
      {
        question: "Does the viewer modify my JSON?",
        answer: "No. It formats the document for display only. Values and literals are shown exactly as they appear in your input.",
      },
    ],
    related: ["tree", "formatter", "validator", "diff"],
    keywords: ["JSON viewer", "view JSON online", "JSON reader", "JSON inspector"],
  },

  csv: {
    id: "csv",
    href: "/json-to-csv",
    name: "JSON to CSV",
    icon: "table",
    summary: "Convert JSON arrays to CSV for Excel, Sheets and databases.",
    metaTitle: "JSON to CSV Converter – Free, Private & Browser-Based",
    metaDescription:
      "Convert JSON arrays to CSV with nested object flattening, custom delimiters and a table preview. Download a spreadsheet-ready file. No uploads required.",
    h1: "JSON to CSV Converter",
    lead: "Turn a JSON array of objects into CSV that opens in Excel, Google Sheets or any database import tool.",
    intro: [
      "CSV is the common language of spreadsheets and data tools, while most APIs return JSON. This converter takes a JSON array, uses each item as a row, and builds columns from all keys found across the items, so records with missing fields still line up correctly.",
      "Nested objects can be flattened into dotted column names such as address.city, and arrays into indexed columns such as tags[0]. If you prefer, nested values can instead be kept as compact JSON inside a single cell. Values containing commas, quotes or line breaks are quoted according to RFC 4180.",
    ],
    howTo: {
      title: "How to convert JSON to CSV",
      steps: [
        "Paste a JSON array of objects, or upload a .json file.",
        "Choose a delimiter (comma, semicolon or tab) and whether to flatten nested data.",
        "Check the table preview to confirm the columns look right.",
        "Download the .csv file or copy the CSV text.",
      ],
    },
    features: [
      { title: "Automatic columns", text: "Columns are the union of every key, in the order they first appear." },
      { title: "Nested data flattening", text: "Objects become dotted columns and arrays become indexed columns." },
      { title: "Delimiter choice", text: "Comma, semicolon for European Excel versions, or tab for TSV." },
      { title: "Excel friendly", text: "Optional UTF-8 byte order mark so Excel displays accented characters correctly." },
      { title: "Table preview", text: "Preview the first rows as a table before downloading." },
      { title: "Exact values", text: "Large numbers are written exactly as in the source, without rounding." },
    ],
    faqs: [
      {
        question: "What JSON structure works best for CSV?",
        answer:
          "An array of flat objects, where each object is one record, maps directly to rows and columns. A single object becomes one row. If your records are nested under a key, for example {\"data\": [...]}, paste just the array.",
      },
      {
        question: "How are nested objects converted?",
        answer:
          "With flattening on, {\"user\": {\"name\": \"Ada\"}} becomes a column named user.name. With flattening off, the whole nested value is written as compact JSON in one cell.",
      },
      {
        question: "Why do accented characters look wrong in Excel?",
        answer:
          "Some Excel versions assume a legacy encoding when opening CSV files. Turn on the Excel-compatible option to add a UTF-8 byte order mark to the downloaded file, which tells Excel to use UTF-8.",
      },
      {
        question: "How are null values represented?",
        answer: "CSV has no null type, so null becomes an empty cell. Booleans are written as true and false.",
      },
    ],
    related: ["xml", "formatter", "viewer", "validator"],
    keywords: ["JSON to CSV", "convert JSON to CSV", "JSON to Excel", "JSON CSV converter"],
  },

  xml: {
    id: "xml",
    href: "/json-to-xml",
    name: "JSON to XML",
    icon: "code",
    summary: "Convert JSON into well-formed, indented XML.",
    metaTitle: "JSON to XML Converter – Convert JSON Online, Privately",
    metaDescription:
      "Convert JSON to well-formed XML with a custom root element, array item names and indentation. Invalid names are fixed and reported. Runs in your browser.",
    h1: "JSON to XML Converter",
    lead: "Convert JSON objects and arrays into well-formed, readable XML for legacy systems, SOAP services and XML-based tools.",
    intro: [
      "Many enterprise systems, feeds and configuration formats still expect XML. This converter maps JSON objects to XML elements, repeats elements for array items, and escapes special characters so the output is always well-formed.",
      "XML element names have stricter rules than JSON keys. They cannot contain spaces or start with a digit. Keys that are not valid element names are adjusted by replacing invalid characters with underscores, and every renamed key is listed so nothing changes without you knowing.",
    ],
    howTo: {
      title: "How to convert JSON to XML",
      steps: [
        "Paste JSON or upload a .json file.",
        "Set the root element name and the element name used for array items.",
        "Choose indentation and whether to include the XML declaration.",
        "Copy the XML or download it as an .xml file.",
      ],
    },
    features: [
      { title: "Well-formed output", text: "Special characters such as &, < and > are escaped automatically." },
      { title: "Natural array mapping", text: "Arrays inside objects repeat the element, for example multiple <tag> elements." },
      { title: "Configurable names", text: "Choose the root element name and the name used for items of top-level arrays." },
      { title: "Transparent renaming", text: "Keys that are invalid XML names are fixed and reported, never silently changed." },
      { title: "Exact numbers", text: "Number values are written exactly as they appear in the JSON source." },
      { title: "Private conversion", text: "Conversion happens in your browser, so nothing is uploaded." },
    ],
    faqs: [
      {
        question: "How are JSON arrays converted to XML?",
        answer:
          "An array stored under a key repeats that key as an element for each item, so {\"tag\": [\"a\", \"b\"]} becomes <tag>a</tag><tag>b</tag>. Arrays at the top level, or arrays directly inside arrays, wrap each value in an item element.",
      },
      {
        question: "What happens to keys with spaces or special characters?",
        answer:
          "XML element names cannot contain spaces and cannot start with a digit. Invalid characters are replaced with underscores and a leading underscore is added when needed. The tool lists every key that was renamed.",
      },
      {
        question: "How are null values and data types represented?",
        answer:
          "XML has no built-in data types, so numbers and booleans become text content and null becomes an empty, self-closing element. If your consumer needs type information, it must apply its own schema.",
      },
      {
        question: "Can I convert XML back to JSON?",
        answer:
          "This tool converts in one direction, from JSON to XML. Because XML has attributes, mixed content and no native types, converting back is not always lossless.",
      },
    ],
    related: ["csv", "formatter", "escape", "validator"],
    keywords: ["JSON to XML", "convert JSON to XML", "JSON XML converter"],
  },

  escape: {
    id: "escape",
    href: "/json-escape-unescape",
    name: "JSON Escape / Unescape",
    icon: "quote",
    summary: "Escape text for JSON strings, or decode escaped JSON strings.",
    metaTitle: "JSON Escape & Unescape – Encode JSON Strings Online",
    metaDescription:
      "Escape text or JSON so it can be embedded in a JSON string, or unescape \\n, \\\" and \\u sequences back to plain text. Free, instant and private.",
    h1: "JSON Escape / Unescape",
    lead: "Escape quotes, backslashes, line breaks and control characters for use inside a JSON string, or turn an escaped string back into readable text.",
    intro: [
      "Inside a JSON string, some characters must be escaped. Double quotes become \\\", backslashes become \\\\, and line breaks become \\n. Escaping is needed when you embed a JSON document inside another JSON string, a log line, or a configuration value.",
      "Unescaping does the reverse. It turns a string full of \\n and \\\" sequences, which is common in logs and API error messages, back into readable text or JSON that you can then format. Both directions use the browser's native JSON functions, so the results match what your code will see.",
    ],
    howTo: {
      title: "How to escape or unescape JSON",
      steps: [
        "Choose Escape or Unescape.",
        "Paste your text, JSON or escaped string into the input panel.",
        "For escaping, choose whether to wrap the result in double quotes.",
        "Copy the result, or use Swap to reverse the operation.",
      ],
    },
    features: [
      { title: "Both directions", text: "Escape plain text or JSON, or unescape an escaped JSON string." },
      { title: "Standards compliant", text: "Uses JSON.stringify and JSON.parse for exactly the escaping JavaScript applies." },
      { title: "Forgiving input", text: "Unescape accepts strings with or without surrounding quotes." },
      { title: "Clear errors", text: "Invalid escape sequences and stray quotes are explained." },
      { title: "One-click swap", text: "Move the result back to the input to round-trip text." },
      { title: "Nothing uploaded", text: "Text is processed in your browser only." },
    ],
    faqs: [
      {
        question: "Which characters need to be escaped in JSON?",
        answer:
          "Double quotes, backslashes and control characters (U+0000 to U+001F), such as line breaks and tabs, must be escaped inside JSON strings. The forward slash may be escaped but does not need to be.",
      },
      {
        question: "How do I put JSON inside a JSON string?",
        answer:
          "Paste the inner JSON here with Escape selected and Wrap in quotes turned on. The result is a valid JSON string literal you can use as a value in another document.",
      },
      {
        question: "Why does my log show \\n instead of new lines?",
        answer:
          "The text was serialised as a JSON string, so line breaks were escaped. Paste it here with Unescape selected to restore the real line breaks.",
      },
      {
        question: "Is Unicode escaped?",
        answer:
          "No. Non-ASCII characters such as é or emoji are valid in JSON strings and are kept as-is. When unescaping, \\uXXXX sequences are converted back into the characters they represent.",
      },
    ],
    related: ["formatter", "minifier", "validator", "xml"],
    keywords: ["JSON escape", "JSON unescape", "escape JSON string", "unescape JSON"],
  },

  diff: {
    id: "diff",
    href: "/json-diff",
    name: "JSON Diff Checker",
    icon: "git-compare",
    summary: "Compare two JSON documents and list every difference by path.",
    metaTitle: "JSON Diff Checker – Compare Two JSON Files Online",
    metaDescription:
      "Compare two JSON documents structurally. See added, removed and changed values with exact paths, ignoring key order and formatting. Private and free.",
    h1: "JSON Diff Checker",
    lead: "Compare two JSON documents and see exactly which values were added, removed or changed. Formatting and key order are ignored.",
    intro: [
      "A plain text diff is noisy for JSON. Reordered keys or different indentation show up as changes even when the data is identical. This tool compares documents structurally: it walks both trees and reports only real differences in the data.",
      "Each difference is listed with its JSONPath, such as $.users[2].email, together with the old and new values. Numbers are compared by value, so 1.0 and 1 are equal, while large integers are compared exactly so that precision bugs are not hidden.",
    ],
    howTo: {
      title: "How to compare JSON",
      steps: [
        "Paste the original JSON in the left panel and the changed JSON in the right panel.",
        "Differences are calculated automatically as you type.",
        "Filter the results to show only added, removed or changed values.",
        "Copy any path to locate the change in your code or data.",
      ],
    },
    features: [
      { title: "Structural comparison", text: "Ignores whitespace, indentation and object key order." },
      { title: "Exact paths", text: "Each difference shows a JSONPath you can copy." },
      { title: "Change summary", text: "Counts of added, removed and changed values at a glance." },
      { title: "Type-aware", text: "Detects type changes such as \"1\" versus 1, and compares numbers by value." },
      { title: "Filters", text: "Focus on additions, removals or modifications." },
      { title: "Confidential", text: "Both documents stay in your browser and are never uploaded." },
    ],
    faqs: [
      {
        question: "Does the order of keys matter when comparing?",
        answer: "No. JSON objects are unordered, so documents with the same keys and values in a different order are reported as identical.",
      },
      {
        question: "How are arrays compared?",
        answer:
          "Arrays are compared position by position, because array order is meaningful in JSON. If an item is inserted at the start of an array, the following items will be reported as changed.",
      },
      {
        question: "Is \"1\" equal to 1?",
        answer: "No. A string and a number are different JSON types, so the change is reported. 1 and 1.0 are the same number and are treated as equal.",
      },
      {
        question: "Can I compare large JSON files?",
        answer:
          "Yes. Documents of several megabytes compare in well under a second on modern computers. The list shows up to 5,000 differences, and the summary counts include every difference.",
      },
    ],
    related: ["formatter", "tree", "validator", "viewer"],
    keywords: ["JSON diff", "compare JSON", "JSON compare online", "JSON difference checker"],
  },

  tree: {
    id: "tree",
    href: "/json-tree-viewer",
    name: "JSON Tree Viewer",
    icon: "network",
    summary: "Navigate nested JSON as an expandable tree with search.",
    metaTitle: "JSON Tree Viewer – Explore Nested JSON Interactively",
    metaDescription:
      "Explore JSON as an interactive tree. Expand and collapse nodes, search keys and values, and copy JSONPath for any field. Private and browser-based.",
    h1: "JSON Tree Viewer",
    lead: "Navigate complex, deeply nested JSON as an interactive tree. Search for keys and values and copy the path to any field.",
    intro: [
      "Deeply nested JSON is hard to follow as text. The tree viewer shows every object and array as an expandable node, with item counts and color-coded values, so you can drill into the data one level at a time.",
      "Search highlights matching keys and values and automatically expands the branches that contain them. Every node has a copyable JSONPath, such as $.orders[0].items[3].sku, which is useful when writing code, queries or test assertions.",
    ],
    howTo: {
      title: "How to use the JSON tree viewer",
      steps: [
        "Paste JSON or upload a file in the input panel.",
        "Click a node, or press Enter or Space on it, to expand or collapse it.",
        "Type in the search box to find keys or values. Matching branches open automatically.",
        "Use the copy button next to a node to copy its JSONPath.",
      ],
    },
    features: [
      { title: "Expandable nodes", text: "Open and close objects and arrays, or expand and collapse everything at once." },
      { title: "Search", text: "Find keys and values anywhere in the document with automatic expansion." },
      { title: "Copy JSONPath", text: "Get the exact path to any value with one click." },
      { title: "Type colors", text: "Strings, numbers, booleans and nulls are color coded for quick scanning." },
      { title: "Fast with big data", text: "Large arrays and objects are shown in pages of 100 items to stay responsive." },
      { title: "Keyboard accessible", text: "Navigate and toggle nodes with the keyboard." },
    ],
    faqs: [
      {
        question: "What is a JSON tree viewer?",
        answer:
          "A JSON tree viewer displays JSON as a hierarchy of collapsible nodes instead of text. It makes deeply nested structures much easier to explore.",
      },
      {
        question: "What is a JSONPath?",
        answer:
          "A JSONPath describes the location of a value inside a JSON document. $ is the root, .name selects a key, and [0] selects an array item. For example, $.users[0].email is the email of the first user.",
      },
      {
        question: "Can I search inside the tree?",
        answer:
          "Yes. The search matches key names and values, case-insensitively. Matching nodes are highlighted, and their parent nodes expand automatically.",
      },
      {
        question: "Is the tree viewer suitable for large files?",
        answer:
          "Yes. Children are rendered only when a node is expanded, and very large arrays or objects are shown in pages of 100 items.",
      },
    ],
    related: ["viewer", "formatter", "diff", "validator"],
    keywords: ["JSON tree viewer", "JSON tree", "JSON explorer", "visualize JSON"],
  },
};

export const toolOrder: ToolId[] = [
  "formatter",
  "validator",
  "minifier",
  "beautifier",
  "viewer",
  "tree",
  "diff",
  "csv",
  "xml",
  "escape",
];

export const allTools = toolOrder.map((id) => tools[id]);
