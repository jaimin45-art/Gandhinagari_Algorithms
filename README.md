# Gandhinagari_Algorithms
Intellify – National Level Hackathon 3.0 by Marwadi University (MU), Gujarat

# Sign Language Translator Frontend

<div align="center">

<img width="30.9%" alt="SLT-frontend: Sign Language Translator Frontend logo" src="https://github.com/sign-language-translator/slt-frontend/blob/784d68a419e9c65c88129534b31dfbdd8270d456/public/logo512.png" />


---

## Pages and Features

### 1. Translator

Translate bidirectionally between various text and sign languages using a variety of AI models.

| ![translator](https://github.com/user-attachments/assets/1e1ad62f-6486-422d-b44a-94df315a6195) | ![slt-frontend-demo](https://github.com/user-attachments/assets/a863e8b5-ff42-4a90-b9ee-a0cdb73fdaad) |
| :-: | :-: |
| Design | Current |

### 2. Customize

Annotate sign language datasets and finetune AI models.

#### 2.1 Sign Dictionary Annotation

Label video clips of individual words/signs with text gloss & text translation in various spoken languages and export the data as a mapping JSON.

| ![dictionary](https://github.com/user-attachments/assets/542e9755-6073-413c-98b8-5097ca19a739) | ![label](https://github.com/user-attachments/assets/8a033b45-732d-44bf-8e35-3df99ef24e22)<br/>![sen](https://github.com/user-attachments/assets/749defe5-966d-40e7-9e5d-08e9be707573) |
| :-: | :-: |
| Design | Current |

#### 2.2 Sign Clip Extraction

Specify sections of a long video which correspond to individual sentence, phrase or word, label them with text and export the data as mp4 clips a mapping JSON.

| | ![cllip-extractor](https://github.com/user-attachments/assets/37ffbddf-1711-4555-800f-9d5bdae4aacd) |
| :-: | :-: |
| Design | Current |

#### 2.3 Synthetic Sentences

Arrange sign dictionary videos into sequences and label them with equivalent spoken language texts.

| | ![parallel corpus](https://github.com/user-attachments/assets/e521f09b-6365-45e7-ae22-b5ae1feae809) |
| :-: | :-: |
| Design | Current |

### 3. Learn

Train yourself to use this tool or teach hearing-impaired students quality lessons.

#### 3.1 Walkthrough

Start a step by step walkthrough on which components to click or watch a video tutorial.

#### 3.2 Courses

Interactive lessons in sign language videos, text & audio.

### 4. Documentation

Preview of the python library's documentation & research papers.



## Directory Tree

One line summary of each module.

<details open>
<summary><b><code>SLT-Frontend</code></b><!-- (click to expand)--></summary>
<pre>
├── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/LICENSE">LICENSE</a>
├── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/README.md">README.md</a>
├── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/index.html">index.html</a>
├── <b>public</b>
│   └── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/public/">*</a>
└── <b>src</b>
    ├── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/App.jsx">App.jsx</a>  <sub><sup>routes</sup></sub>
    ├── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/index.js">main.jsx</a>
    ├── <b>components</b>
    │   ├── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/components/index.jsx">index.jsx</a>  <sub><sup>export all components</sup></sub>
    │   ├── <b>Avatar</b>
    │   │   └── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/components/Avatar/index.jsx">index.jsx</a>  <sub><sup>three.js canvas with animated humanoid performing signs</sup></sub>
    │   │
    │   └── <b>TextArea</b>
    │       └── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/components/TextArea/index.jsx">index.jsx</a>  <sub><sup>write multilingual text with mic, virtual keyboad & speaker. tag supported & ambiguous tokens. Get synonyms & translation suggestions.</sup></sub>
    │
    ├── <b>pages</b>
    │   ├── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/pages/index.jsx">index.jsx</a>  <sub><sup>export all pages</sup></sub>
    │   ├── <b>Landing</b>
    │   │   └── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/pages/Landing/index.jsx">index.jsx</a>  <sub><sup>Welcome Page</sup></sub>
    │   │
    │   └── <b>Translator</b>
    │       └── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/pages/Translator/index.jsx">index.jsx</a>  <sub><sup>Bidirectional translation between signs & text</sup></sub>
    │
    └── <b>utils</b>
        └── <a href="https://github.com/sign-language-translator/slt-frontend/blob/main/src/utils/index.jsx">index.jsx</a>  <sub><sup>helpers</sup></sub>
</pre>
</details>

