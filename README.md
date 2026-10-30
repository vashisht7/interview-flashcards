# Interview Studio

114 personalized AI engineering interview flashcards covering NoteEchoes, MFlash, Python, production engineering, MCP, and behavioral questions.

## Use

Open https://vashisht7.github.io/interview-flashcards/ . Reveal an answer, then choose Still learning or Got it. Search, filter by project or difficulty, bookmark, shuffle, or browse the deck.

Progress is stored only in the current browser. It does not sync across devices or transfer automatically from the earlier ChatGPT-hosted site.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000 . No build step or package installation is required.

## Validate

```sh
node check.mjs
node --check app.mjs
```

## Publish

GitHub Pages serves the root of the main branch. The .nojekyll file preserves the static site. All assets use relative paths for project-site hosting.

## Content

Answers reflect supplied resume and technical briefings. They distinguish implementation evidence, archived evaluation results, proposed improvements, and personal confirmation items. Confidence ratings are self-assessment, not a measured readiness score.

## JD fundamentals expansion

Cards 73-114 add LLMs and prompting, RAG and data science, agents and MCP, software engineering, cloud operations, governance, experimentation, and Agile delivery. Each adds a short answer, example, optional deeper explanation, and guidance for discussing knowledge without inventing experience. Original IDs and browser storage keys are retained.

The downloadable PDF remains the original 72-card project guide. The additional cards are available on the site.

## Learning aids

All 114 cards are scanned for matching technical terms. Each match has a plain-language definition and an example in the answer. The sidebar's Technical terms button opens the searchable glossary. Nine diagrams cover classification, attention, adapter training, retrieval, note capture, authorization, evaluation, crash recovery, and release. Use Next/Previous Step or Play/Pause; nothing auto-plays on opening a card.

Glossary reference sources include scikit-learn neural-network documentation, PyTorch CrossEntropyLoss and AdamW documentation, SQLite FTS5 and WAL documentation, the QLoRA paper, and the rank-stabilized LoRA paper. Definitions are simplified learning explanations, not additional claims about personal project ownership.

## Mathematical notation

Equations use native MathML with symbol keys, plain-language interpretations, and examples. Attention, softmax, reciprocal rank fusion, precision/recall/F1, dot products, complexity, initial learning rate, loss weighting, and exact-match rate are covered. Scientific notation and numeric fractions also render inline in card and glossary content. There is no external math-script dependency.
