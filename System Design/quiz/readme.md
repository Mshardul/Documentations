planning this project with only 3 files - html, css, and js

- The HTML file 
    - properties
        - no filter by default.
            - filters (if applied) are persisted in url query params eg `?tags=security,aws`
        - pagination activated (picks up from the config json - can be changed).
            - at the end of the page, there should be a "load more questions" button.
                - this button loads next set of paginated questions, based on the filters (if filters applied).
        - contains a floating "back to top" button (up arrow) near the bottom right side of the page. 
    - content
        - Div1: header (not fixed, centered) - Title of the quiz
        - Div2: tags selected (hidden by default)
            - Shows up when tag filtration is applied.
            - shows a list of tags in chips form (2 px larger than the size of the tags in the questions div - Div)
            - also, after all the tags end, it should show a number enclosed in a circle
                - this number is the total number of filtered (not loaded or displayed) questions in this filter combination
                - the styling should be different so that the user can easily identify, shouldn't look like any tag chip.
        - Div3: the actual quiz
            - Div3.1: contains one card for each question. each card 
                - properties
                    - has light-greyed backgound with ${secondry-color} border.
                - content
                    - Div3.1.1: Question in Bold
                    - Div3.1.2: tags in coloured-chips
                    - Div3.1.3: options (with radio buttons)
                        - radio buttons are not inline, one radio button (option) in each line.
                        - user selects one of these
                    - Div3.1.4: Action Buttons (Inline)
                        - Div3.1.4.1: float left
                            - Button1: Show/Hide (based on whether Div3.1.5 is visible or hidden) Answer
                                - a passive peek without marking it as attempted
                            - Button2: Clear Selection (only when one of the option is selected)
                        - Div3.1.4.2: float right
                            - Button1: Submit Answer with ${primary-color} color button.
                                - validates the selection, 
                                - highlights correct/incorrect option (green/red), 
                                - then auto-reveals answer + explanation
                                - changes the "Show/Hide Answer" button to "Hide Answer".
                    - Div3.1.5: 2 child divs (hidden, by default), each in new line.
                        - Div3.1.5.1: answer in Bold
                        - Div3.1.5.2: explanation displayed in markdown
    - should have a menu icon floating near bottom right (similar to confluence) with just icons.
        - Icon1: Tags
            - when clicked
                - opens a menu drawer from right side (doesn't impact the rest of the page).
                    - should reflect URL state on load (eg. `?tags=security,aws`)
            - content: divided into 2 divs vertically 
                - Div1: (top 90%): contains the list of tag names (scrollable), each in a checkbox
                    - properties
                        - these tags are pulled from the `meta` field of the `quiz.json` file.
                        - User can select one or more of these tags
                        - To indicate selection, increase the darkness of the tag chip and bolds the tag name.
                    - content: thin-bordered box, containing all the tags - same as in the page (design, size, colour, etc).
                - Div2: (bottom 10%): 
                    - 2 Buttons
                        - Button1: Apply
                            - use sweetalert to show the warning that this will reload the page and all the progress will be lost.
                            - once user agrees to the sweetalert, the page refreshes with the applied filter.
                        - Button2: Reset
                            - just resets the selection.
                            - to reset filtering, user needs to reset the selection and then click the Apply button
    - should have a vertically-centered "load more questions" button at the end of the page.
        - once clicked, it adds more questions (pagination_size) from the filters, if applied
            - between the last question int he current page and this button
        - and the "load more questions" button slides down (again at the bottom of the page)
        - when no more questions are left in the questions bank
            - this button is greyed-out.
    - additional design decisions
        - chips for tag
            - let's keep a static list of around 100 light-themed colors. At runtime, the tags pick these colour in round-robin fashion. repeats, if more than 100 tags.
            - all the chips of a particular tag have same color throughout the page.

- js file
    - It should get a file path (path to this json file)
        - verifies this file first
    - on init, decides the colors for each of the tags, and caches this in a local variable (tag-to-colour map would be better, I think)
    - should be able to filter by tags (union of the selected tags)
    - should be able to shuffle the next set of questions
        - this is not user-driven, when the html page asks for new set of questions, the questions are randomly selected
        - this is very much required, so that the user is not bored of seeing the same set of question every time.
    - should be able to apply pagination, takes this value from config, user can update this and refresh the html page.
    - on load or filter change, rebuild an array of all the index of questions that belong to this filter.
        - then shuffle this array
        - every time a request for the new set of questions come in, fetch the indices using this array.
        - then get the actual value of these indices from the json file.
        - solves possible duplication issue on shuffle+pagination

- external dependencies
    - `SweetAlert2` — for the filter warning
    - `marked.js` (or similar) — for rendering explanation markdown

- decisions worth mentions
    - accessibility through keyboard navigation matters highly, and should be supported properly.
    - we don't need shuffle option from UI. shuffle will be take care of js file whenever it is asked to send a set of questions - this is required so that user doesn't get bored seeing the same set of question every time they open the app.
    - The issue of page reloading on applying filter - Let's give user an alert warning (sweet alert or something), and if they accept yes, then only the page reloads. The page reload is important, what if the user has marked the answers that were not part of these tags.
    - Where is config stored? config is not a separate json file, but a small json (only pagination_size for now) in the js file itself. We don't need to complicate it right away. 1 html, 1 css, and 1 js. that's it.
    - Right now user doesn't have any option of updating the pagination_size, it should be static. To update, they can update the value in js file, and restart the app (refresh html file).


- v2
    - score / progress indicator not required currently, will be part of v2 - that's why 2 different buttons (`show answer` and `submit`) to calculate the score.



- sections to cover
1. Overview — What this project is, what problem it solves, and who it is for.
2. Usage Instructions - Step‑by‑step guide: how to run the app (e.g., using a local server), how to load custom questions, how to apply filters, how to interact with quiz cards, etc
3. Project Structure — The 3-file layout (html, css, js) and what each file is responsible for.
4. Architecture - how the 3 files interact
5. Quiz JSON Schema — Full spec of the quiz.json format including meta, questions, field types, and constraints.
6. Tag System — Rules for tags: format, controlled vocabulary, allowed_tags in meta, and how colours are assigned at runtime.
7. Features - High‑level list of functionality: filtering by tags (with URL persistence), pagination with “Load more”, answer validation, markdown explanations, tag colors, drawer menu, etc.
8. Configuration - Where to set static values like `pagination_size` and the path to the JSON file (inside the JS file); notes that changes require a page refresh.
9. UI Structure — Documents the Div hierarchy, floating menu, drawer, and action buttons in a readable way.
10. Keyboard Accessibility — What keyboard interactions are supported and which elements are focusable.
11. External Dependencies — Lists SweetAlert2 and marked.js with their purpose and CDN usage.
12. Known Limitations — Current constraints worth knowing: no persistence across reloads, static pagination size, no score tracking yet.
13. V2 Roadmap — Planned features deferred to v2, currently (a) score/progress tracking, (b) add "finish quiz" button, (c) final downloadable report (pdf with questions, options, answer selected, correct answer, final stats, etc) on finishing the quiz (d) adding new questions from UI
