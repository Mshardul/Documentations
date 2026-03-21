// ========== CONFIGURATION ==========
const CONFIG = {
    quizFilePath: "./quiz.json",   // Path to the quiz JSON file
    pagination_size: 10            // Number of questions per "Load More" batch
};

// ========== GLOBAL STATE ==========
let allQuestions = null;              // Full parsed quiz data object { meta, questions }
let tagColorMap = new Map();          // Tag -> CSS colour (string)
let currentFilterTags = new Set();    // Tags from URL
let filteredIndexes = [];             // Shuffled indices of filtered questions
let loadedCount = 0;                  // How many have been rendered so far
let questionStates = new Map();       // Per‑question state: { submitted, selectedOption, showAnswer }
let totalFilteredCount = 0;           // Total questions after filtering (for badge)

// ========== DOM ELEMENTS ==========
const quizHeader = document.getElementById('quiz-header');
const activeFiltersDiv = document.getElementById('active-filters');
const quizQuestionsDiv = document.getElementById('quiz-questions');
const loadMoreBtn = document.getElementById('load-more-btn');
const backToTopBtn = document.getElementById('back-to-top');
const menuIcon = document.getElementById('menu-icon');
const drawer = document.getElementById('tag-drawer');
const tagCheckboxesDiv = document.getElementById('tag-checkboxes');
const applyBtn = document.getElementById('apply-btn');
const resetTagsBtn = document.getElementById('reset-btn');

// ========== HELPER FUNCTIONS ==========

// Generate a light, deterministic colour for a tag (round‑robin from a fixed palette)
function getColorForTag(tag) {
    if (tagColorMap.has(tag)) return tagColorMap.get(tag);
    const palette = [
        '#f2acec', '#fad0a6', '#b1f9cf', '#f8ba96', '#94c9f5',
        '#f5a8d0', '#a4f9c9', '#eacb67', '#c97ec9', '#4dc6c6',
        '#df90df', '#bef489', '#f6af69', '#5c93cb', '#cbcb76'
    ];
    const index = tagColorMap.size % palette.length;
    const color = palette[index];
    tagColorMap.set(tag, color);
    return color;
}

// Shuffle array (Fisher‑Yates)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Extract unique tags from meta.allowed_tags (master list)
function getAllTags() {
    if (!allQuestions?.questions?.length) return [];
    // Use allowed_tags from meta if present, otherwise fallback to scanning questions
    const meta = allQuestions.meta || {};
    if (meta.allowed_tags && Array.isArray(meta.allowed_tags)) {
        return meta.allowed_tags;
    }
    // Fallback: scan all questions (should not happen because meta is mandatory)
    const tagsSet = new Set();
    allQuestions.forEach(q => {
        if (q.tags && Array.isArray(q.tags)) {
            q.tags.forEach(t => tagsSet.add(t));
        }
    });
    return Array.from(tagsSet).sort();
}

// Filter questions (OR) using currentFilterTags
function filterQuestionsByTags() {
    if (!allQuestions?.questions?.length) return [];
    const questions = allQuestions.questions || [];
    if (currentFilterTags.size === 0) return [...questions];
    return questions.filter(q => {
        if (!q.tags || !Array.isArray(q.tags)) return false;
        return Array.from(currentFilterTags).some(t => q.tags.includes(t));
    });
}

// Get tags from URL query param 'tags' (comma-separated)
function getTagsFromURL() {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get('tags');
    if (!tagsParam) return new Set();
    return new Set(tagsParam.split(',').map(t => t.trim()).filter(t => t));
}

// Update URL with new tags (reloads page)
function updateURLWithTags(tagsArray) {
    const params = new URLSearchParams(window.location.search);
    if (tagsArray.length) {
        params.set('tags', tagsArray.join(','));
    } else {
        params.delete('tags');
    }
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.location.href = newUrl;
}

// Render a single question card and attach event listeners
function renderQuestionCard(question, indexInFiltered) {
    const cardId = `card-${question.id}`;
    const state = questionStates.get(question.id) || {
        submitted: false,
        selectedOption: null,
        showAnswer: false
    };

    // Build options HTML
    let optionsHtml = '';
    question.options.forEach((opt, optIdx) => {
        let optionClass = '';
        if (state.submitted) {
            if (optIdx === question.answer) optionClass = 'correct-highlight';
            else if (optIdx === state.selectedOption) optionClass = 'incorrect-highlight';
        }
        const checkedAttr = (state.selectedOption === optIdx) ? 'checked' : '';
        optionsHtml += `
            <div class="option ${optionClass}">
                <input type="radio" name="q-${question.id}" value="${optIdx}" id="q-${question.id}-opt-${optIdx}" ${checkedAttr}>
                <label for="q-${question.id}-opt-${optIdx}">${escapeHtml(opt)}</label>
            </div>
        `;
    });

    // Tags chips
    const tagsHtml = (question.tags || []).map(tag => {
        const bgColor = getColorForTag(tag);
        return `<span class="tag-chip" style="background-color: ${bgColor};">${escapeHtml(tag)}</span>`;
    }).join('');

    // Answer & explanation sections
    const answerHtml = `<div class="answer-section"><strong>Answer:</strong> ${escapeHtml(question.options[question.answer])}</div>`;
    let explanationHtml = '';
    try {
        const rendered = marked.parse(question.explanation || '');
        explanationHtml = `<div class="explanation-section"><strong>Explanation:</strong> ${rendered}</div>`;
    } catch (e) {
        console.warn('Markdown parse error for question', question.id, e);
        explanationHtml = `<div class="explanation-section"><strong>Explanation:</strong> ${escapeHtml(question.explanation || '')}</div>`;
    }
    const answerAndExplanationHtml = state.showAnswer ? `${answerHtml}${explanationHtml}` : '';

    return `
        <div class="card" id="${cardId}" data-question-id="${question.id}">
            <div class="question-text">${escapeHtml(question.question)}</div>
            <div class="tags-container">${tagsHtml}</div>
            <div class="options">${optionsHtml}</div>
            <div class="action-buttons">
                <div class="btn-group-left">
                    <button class="btn-secondary toggle-answer-btn">${state.showAnswer ? 'Hide Answer' : 'Show Answer'}</button>
                    <button class="btn-secondary clear-selection-btn" ${state.submitted || state.selectedOption === null ? 'disabled' : ''}>Clear Selection</button>
                </div>
                <div class="btn-group-right">
                    <button class="btn-primary submit-answer-btn" ${state.submitted ? 'disabled' : ''}>Submit Answer</button>
                </div>
            </div>
            <div id="answer-explanation-${question.id}" class="answer-explanation-container">
                ${answerAndExplanationHtml}
            </div>
        </div>
    `;
}

// Helper: escape HTML to prevent injection
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Re-render a specific card after state change
function refreshCard(questionId) {
    const cardElement = document.getElementById(`card-${questionId}`);
    if (!cardElement) return;
    const question = (allQuestions.questions || []).find(q => q.id === questionId);
    if (!question) return;
    const indexInFiltered = filteredIndexes.findIndex(idx => allQuestions.questions[idx].id === questionId);
    if (indexInFiltered === -1) return;
    const newHtml = renderQuestionCard(question, indexInFiltered);
    const parent = cardElement.parentNode;
    const newCard = document.createElement('div');
    newCard.innerHTML = newHtml.trim();
    const newCardElement = newCard.firstChild;
    parent.replaceChild(newCardElement, cardElement);
    attachCardEvents(newCardElement, questionId);
}

// Attach event handlers to a card's buttons
function attachCardEvents(cardElement, questionId) {
    const toggleBtn = cardElement.querySelector('.toggle-answer-btn');
    const clearBtn = cardElement.querySelector('.clear-selection-btn');
    const submitBtn = cardElement.querySelector('.submit-answer-btn');
    const radios = cardElement.querySelectorAll('input[type="radio"]');

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const state = questionStates.get(questionId) || { submitted: false, selectedOption: null, showAnswer: false };
        state.showAnswer = !state.showAnswer;
        questionStates.set(questionId, state);
        refreshCard(questionId);
    });

    clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const state = questionStates.get(questionId) || { submitted: false, selectedOption: null, showAnswer: false };
        // Only clear the radio selection; do NOT reset submitted or showAnswer
        state.selectedOption = null;
        questionStates.set(questionId, state);
        refreshCard(questionId);
    });

    submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedRadio = cardElement.querySelector('input[type="radio"]:checked');
        if (!selectedRadio) {
            Swal.fire('No selection', 'Please select an answer first.', 'info');
            return;
        }
        const selectedOption = parseInt(selectedRadio.value);
        const question = (allQuestions.questions || []).find(q => q.id === questionId);
        if (!question) return;

        const state = questionStates.get(questionId) || { submitted: false, selectedOption: null, showAnswer: false };
        state.submitted = true;
        state.selectedOption = selectedOption;
        state.showAnswer = true;
        questionStates.set(questionId, state);
        refreshCard(questionId);
    });

    // Update state when radio changes (before submit)
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            const state = questionStates.get(questionId) || { submitted: false, selectedOption: null, showAnswer: false };
            if (!state.submitted) {
                state.selectedOption = parseInt(radio.value);
                questionStates.set(questionId, state);
                const clearBtnLocal = document.getElementById(`card-${questionId}`).querySelector('.clear-selection-btn');
                if (clearBtnLocal) clearBtnLocal.disabled = false;
            }
        });
    });
}

// Render a range of questions (from start to end) and append to container
function renderQuestionsRange(start, end) {
    const container = quizQuestionsDiv;
    const questions = allQuestions.questions || [];
    console.log(`Rendering questions from index ${start} to ${end} (filteredIndexes length: ${filteredIndexes.length})`);
    for (let i = start; i < end && i < filteredIndexes.length; i++) {
        const questionIdx = filteredIndexes[i];
        const question = questions[questionIdx];
        if (!question) continue;
        const cardHtml = renderQuestionCard(question, i);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHtml.trim();
        const cardElement = tempDiv.firstChild;
        container.appendChild(cardElement);
        attachCardEvents(cardElement, question.id);
    }
}

// Load more questions (next page)
function loadMore() {
    console.log("Load More clicked. Current loadedCount:", loadedCount, "Total filtered:", totalFilteredCount);
    const newStart = loadedCount;
    const newEnd = Math.min(loadedCount + CONFIG.pagination_size, filteredIndexes.length);
    if (newStart >= filteredIndexes.length) return;
    renderQuestionsRange(newStart, newEnd);
    loadedCount = newEnd;

    // Disable button if no more questions
    if (loadedCount >= filteredIndexes.length) {
        loadMoreBtn.disabled = true;
    } else {
        loadMoreBtn.disabled = false;
    }
}

// Build the shuffled filtered index list (on filter change or initial load)
function rebuildFilteredIndexes() {
    const filteredQuestions = filterQuestionsByTags();
    totalFilteredCount = filteredQuestions.length;
    // Build array of indices of the filtered questions within the full questions array
    const questions = allQuestions.questions || [];
    const indices = [];
    filteredQuestions.forEach(fq => {
        const idx = questions.findIndex(q => q.id === fq.id);
        if (idx !== -1) indices.push(idx);
    });
    filteredIndexes = shuffleArray([...indices]);
    loadedCount = 0;
    // Reset question states (all answers cleared)
    questionStates.clear();
    // Clear the container
    quizQuestionsDiv.innerHTML = '';
    // Load first page
    loadMore();
}

// Update the active filters bar (Div2)
function updateActiveFiltersBar() {
    if (currentFilterTags.size === 0) {
        activeFiltersDiv.classList.add('hidden');
        return;
    }
    activeFiltersDiv.classList.remove('hidden');
    // Build chips
    let chipsHtml = '';
    currentFilterTags.forEach(tag => {
        const bgColor = getColorForTag(tag);
        chipsHtml += `<span class="active-filter-chip" style="background-color: ${bgColor};">${escapeHtml(tag)}</span>`;
    });
    // Add count badge
    chipsHtml += `<span class="filter-count-badge">${totalFilteredCount}</span>`;
    activeFiltersDiv.innerHTML = `<span><strong>Active filters:</strong></span><div class="chips-container">${chipsHtml}</div>`;
}

// Populate the tag drawer checkboxes from meta.allowed_tags
function populateTagDrawer() {
    const allTags = getAllTags();
    tagCheckboxesDiv.innerHTML = '';
    tagCheckboxesDiv.style.display = 'flex';
    tagCheckboxesDiv.style.flexWrap = 'wrap';
    tagCheckboxesDiv.style.gap = '0.5rem';

    allTags.forEach(tag => {
        const isChecked = currentFilterTags.has(tag);
        const bgColor = getColorForTag(tag);
        const item = document.createElement('label');
        item.className = 'tag-checkbox-item' + (isChecked ? ' selected' : '');
        item.innerHTML = `
            <input type="checkbox" value="${tag}" ${isChecked ? 'checked' : ''} aria-label="${tag}">
            <span class="tag-chip" style="background-color:${bgColor};">${tag}</span>
        `;
        // Toggle selected class on change
        item.querySelector('input').addEventListener('change', (e) => {
            item.classList.toggle('selected', e.target.checked);
        });
        tagCheckboxesDiv.appendChild(item);
    });
}

// Initialize the app
async function init() {
    try {
        // Fetch and validate JSON
        const response = await fetch(CONFIG.quizFilePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to load ${CONFIG.quizFilePath}`);
        const data = await response.json();
        console.log("Quiz data loaded: ", data);

        // Basic validation
        if (!data.meta || !data.questions || !Array.isArray(data.questions)) {
            throw new Error('Invalid JSON: missing "meta" or "questions" array');
        }
        allQuestions = data;
        quizHeader.textContent = data.meta.topic || 'Quiz';

        // Get tags from URL
        currentFilterTags = getTagsFromURL();
        console.log("currentFilterTags: ", currentFilterTags);

        // Build tag colour map for all tags (from meta.allowed_tags)
        const allTags = getAllTags();
        console.log("allTags: ", allTags);
        allTags.forEach(tag => getColorForTag(tag));

        // Populate drawer checkboxes
        populateTagDrawer();
        console.log("Tag Drawer populated");

        // Rebuild filtered indices and render first page
        rebuildFilteredIndexes();
        console.log("Filtered indexes built and first page rendered");
        updateActiveFiltersBar();
        console.log("Active filters bar updated");

        // Set up load more button
        loadMoreBtn.addEventListener('click', loadMore);
        console.log("Load More button event listener attached");

        // Back to top
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log("Back to top button clicked");
        });

        // Scroll listener for back to top button visibility
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        }, { passive: true });
        window.dispatchEvent(new Event('scroll'));

        // Drawer open/close
        function openDrawer() {
            drawer.classList.add('open');
            drawer.setAttribute('aria-hidden', 'false');
            document.getElementById('drawer-overlay').hidden = false;
            menuIcon.setAttribute('aria-expanded', 'true');
            const firstCheck = drawer.querySelector('.tag-checkbox-item input');
            if (firstCheck) firstCheck.focus();
        }
        function closeDrawer() {
            drawer.classList.remove('open');
            drawer.setAttribute('aria-hidden', 'true');
            document.getElementById('drawer-overlay').hidden = true;
            menuIcon.setAttribute('aria-expanded', 'false');
            menuIcon.focus();   // return focus to trigger
        }
        drawer.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            const focusable = [...drawer.querySelectorAll('button, input[type="checkbox"]')]
                .filter(el => !el.disabled);
            const first = focusable[0];
            const last  = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault(); last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault(); first.focus();
            }
        });
        menuIcon.addEventListener('click', openDrawer);
        document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
        });

        // Apply filter (OR) with SweetAlert warning
        applyBtn.addEventListener('click', async () => {
            const selectedCheckboxes = tagCheckboxesDiv.querySelectorAll('input:checked');
            const selectedTags = Array.from(selectedCheckboxes).map(cb => cb.value);
            const { isConfirmed } = await Swal.fire({
                title: 'Apply filter?',
                text: 'This will reload the page and reset all your progress.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, apply',
                cancelButtonText: 'Cancel'
            });
            if (isConfirmed) {
                updateURLWithTags(selectedTags);
            }
        });

        // Reset button: clear all checkboxes
        resetTagsBtn.addEventListener('click', () => {
            tagCheckboxesDiv.querySelectorAll('input').forEach(cb => cb.checked = false);
        });

    } catch (error) {
        console.error(error);
        Swal.fire('Error', `Failed to load quiz data: ${error.message}`, 'error');
        quizQuestionsDiv.innerHTML = `<p class="error">Error loading questions. Make sure ${CONFIG.quizFilePath} is present and valid.</p>`;
        quizHeader.textContent = 'Error loading quiz';
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);