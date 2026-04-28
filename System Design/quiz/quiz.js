// ========== CONFIGURATION ==========
const CONFIG = {
  quizFilePath: "./quiz.json", // Path to the quiz JSON file
  pagination_size: 10, // Number of questions per "Load More" batch
};

// ========== SVG ICONS ==========
// Inline SVGs - no external dependency, consistent cross-platform rendering.
// Uses currentColor so the parent element's CSS color property drives the stroke.
const ICON_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;
const ICON_CROSS = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

// ========== GLOBAL STATE ==========
let allQuestions = null; // Full parsed quiz data object { meta, questions }
let tagColorMap = new Map(); // tag -> CSS colour string
let currentFilterTags = new Set(); // tags active from URL
let filteredIndexes = []; // shuffled indices into allQuestions.questions
let loadedCount = 0; // cards rendered so far
let questionStates = new Map(); // questionId -> { submitted, selectedOption, showAnswer }
let totalFilteredCount = 0; // total questions matching current filter

// ========== DOM ELEMENTS ==========
const quizHeader = document.getElementById("quiz-header");
const activeFiltersDiv = document.getElementById("active-filters");
const quizQuestionsDiv = document.getElementById("quiz-questions");
const loadMoreBtn = document.getElementById("load-more-btn");
const backToTopBtn = document.getElementById("back-to-top");
const menuIcon = document.getElementById("menu-icon");
const drawer = document.getElementById("tag-drawer");
const tagCheckboxesDiv = document.getElementById("tag-checkboxes");
const applyBtn = document.getElementById("apply-btn");
const resetTagsBtn = document.getElementById("reset-btn");

// ========== DRAWER ==========
// Module-scoped so they're accessible from both menuIcon click and the
// drawer's own keydown focus-trap listener without closure coupling.

function openDrawer() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  document.getElementById("drawer-overlay").hidden = false;
  menuIcon.setAttribute("aria-expanded", "true");
  const firstCheck = drawer.querySelector(".tag-checkbox-item input");
  if (firstCheck) firstCheck.focus();
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  document.getElementById("drawer-overlay").hidden = true;
  menuIcon.setAttribute("aria-expanded", "false");
  menuIcon.focus();
}

// ========== HELPERS ==========

// Round-robin colour assignment from a fixed palette.
// Colours are cached; same tag always returns same colour.
function getColorForTag(tag) {
  if (tagColorMap.has(tag)) return tagColorMap.get(tag);
  const palette = [
    "#f3d9f1",
    "#f9e0c7",
    "#e0f3e8",
    "#fce4d6",
    "#e0f0fd",
    "#ffe0f0",
    "#d9f0e3",
    "#fff0c0",
    "#f0e0f0",
    "#d0f0f0",
    "#f0d0f0",
    "#e0f0d0",
    "#f0e0d0",
    "#d0e0f0",
    "#f0f0c0",
  ];
  const color = palette[tagColorMap.size % palette.length];
  tagColorMap.set(tag, color);
  return color;
}

// Fisher-Yates shuffle - mutates and returns the array.
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Returns meta.allowed_tags. Falls back to scanning questions if missing.
function getAllTags() {
  if (!allQuestions?.questions?.length) return [];
  const allowed = allQuestions.meta?.allowed_tags;
  if (Array.isArray(allowed) && allowed.length) return allowed;
  const tagSet = new Set();
  allQuestions.questions.forEach((q) => q.tags?.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

// Filter questions by currentFilterTags (union/OR). Returns all if no filter.
function filterQuestionsByTags() {
  if (!allQuestions?.questions?.length) return [];
  const { questions } = allQuestions;
  if (currentFilterTags.size === 0) return [...questions];
  return questions.filter(
    (q) => Array.isArray(q.tags) && q.tags.some((t) => currentFilterTags.has(t))
  );
}

// Parse ?tags=a,b,c from URL into a Set.
function getTagsFromURL() {
  const raw = new URLSearchParams(window.location.search).get("tags");
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
  );
}

// Persist selected tags to URL and reload.
function updateURLWithTags(tagsArray) {
  const params = new URLSearchParams(window.location.search);
  if (tagsArray.length) {
    params.set("tags", tagsArray.join(","));
  } else {
    params.delete("tags");
  }
  window.location.href = `${window.location.pathname}${
    params.toString() ? "?" + params.toString() : ""
  }`;
}

// Minimal HTML escaping to prevent XSS in innerHTML injection.
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ========== RENDERING ==========

// Build the static HTML string for one question card.
// NOTE: icons and card-glow classes are applied via handleSubmit (direct DOM
// manipulation) so CSS animations trigger correctly - they are NOT in this template.
function renderQuestionCard(question) {
  const state = questionStates.get(question.id) || {
    submitted: false,
    selectedOption: null,
    showAnswer: false,
  };

  const optionsHtml = question.options
    .map((opt, i) => {
      let cls = "";
      if (state.submitted) {
        if (i === question.answer) cls = "correct-highlight";
        else if (i === state.selectedOption) cls = "incorrect-highlight";
      }
      return `
            <div class="option ${cls}" data-option-index="${i}">
                <input type="radio" name="q-${question.id}" value="${i}"
                    id="q-${question.id}-opt-${i}"
                    ${state.selectedOption === i ? "checked" : ""}
                    ${state.submitted ? "disabled" : ""}>
                <label for="q-${question.id}-opt-${i}">${escapeHtml(
        opt
      )}</label>
            </div>`;
    })
    .join("");

  const tagsHtml = (question.tags || [])
    .map(
      (tag) =>
        `<span class="tag-chip" style="background-color:${getColorForTag(
          tag
        )}">${escapeHtml(tag)}</span>`
    )
    .join("");

  let revealHtml = "";
  if (state.showAnswer) {
    let explanationRendered = "";
    try {
      explanationRendered = marked.parse(question.explanation || "");
    } catch (e) {
      explanationRendered = escapeHtml(question.explanation || "");
    }
    revealHtml = `
            <div class="answer-section"><strong>Answer:</strong> ${escapeHtml(
              question.options[question.answer]
            )}</div>
            <div class="explanation-section"><strong>Explanation:</strong> ${explanationRendered}</div>`;
  }

  return `
        <div class="card" id="card-${question.id}" data-question-id="${
    question.id
  }">
            <div class="question-text">${escapeHtml(question.question)}</div>
            <div class="tags-container">${tagsHtml}</div>
            <div class="options">${optionsHtml}</div>
            <div class="action-buttons">
                <div class="btn-group-left">
                    <button class="btn-secondary toggle-answer-btn">${
                      state.showAnswer ? "Hide Answer" : "Show Answer"
                    }</button>
                    <button class="btn-secondary clear-selection-btn"
                        ${
                          state.submitted || state.selectedOption === null
                            ? "disabled"
                            : ""
                        }>Clear Selection</button>
                </div>
                <div class="btn-group-right">
                    <button class="btn-primary submit-answer-btn" ${
                      state.submitted ? "disabled" : ""
                    }>Submit Answer</button>
                </div>
            </div>
            <div id="answer-explanation-${
              question.id
            }" class="answer-explanation-container">
                ${revealHtml}
            </div>
        </div>`;
}

// Replace a rendered card in-place. Used by toggle and clear (not submit).
// Preserves card-glow and icons from a previous submission so they survive re-renders.
function refreshCard(questionId) {
  const cardElement = document.getElementById(`card-${questionId}`);
  if (!cardElement) return;
  const question = (allQuestions.questions || []).find(
    (q) => q.id === questionId
  );
  if (!question) return;

  // Capture submitted visual state before the DOM node is replaced
  const wasCorrect = cardElement.classList.contains("card--correct");
  const wasIncorrect = cardElement.classList.contains("card--incorrect");

  const wrapper = document.createElement("div");
  wrapper.innerHTML = renderQuestionCard(question).trim();
  const newCard = wrapper.firstElementChild;
  cardElement.parentNode.replaceChild(newCard, cardElement);

  // Re-apply card glow (skip bloom animation - it already played)
  if (wasCorrect) newCard.classList.add("card--correct");
  if (wasIncorrect) newCard.classList.add("card--incorrect");

  // Re-inject icons without spring animation (already shown once)
  const state = questionStates.get(questionId);
  if (state?.submitted) {
    injectIcons(newCard, question, state.selectedOption, /* animated */ false);
  }

  attachCardEvents(newCard, questionId);
}

// Append check/cross icons to the relevant option rows.
// animated=true  → spring-in keyframe plays (first appearance after submit)
// animated=false → icon appears instantly (re-render case, e.g. toggle show/hide)
function injectIcons(cardElement, question, selectedOption, animated) {
  const isCorrect = selectedOption === question.answer;
  cardElement.querySelectorAll(".option").forEach((optEl, i) => {
    let svg = null;
    let cls = "option-icon";
    if (i === question.answer) {
      svg = ICON_CHECK;
      cls += " option-icon--correct";
    } else if (i === selectedOption && !isCorrect) {
      svg = ICON_CROSS;
      cls += " option-icon--incorrect";
    }
    if (!svg) return;
    if (!animated) cls += " option-icon--instant";
    const span = document.createElement("span");
    span.className = cls;
    span.innerHTML = svg;
    optEl.appendChild(span);
  });
}

// ========== SUBMIT ==========
// Uses direct DOM manipulation (not refreshCard) so CSS animations fire correctly.
// A full DOM replacement would give the browser a brand-new node, killing transitions.
function handleSubmit(cardElement, questionId) {
  const selectedRadio = cardElement.querySelector(
    'input[type="radio"]:checked'
  );
  if (!selectedRadio) {
    Swal.fire("No selection", "Please select an answer first.", "info");
    return;
  }

  const selectedOption = parseInt(selectedRadio.value, 10);
  const question = (allQuestions.questions || []).find(
    (q) => q.id === questionId
  );
  if (!question) return;

  // Persist state
  const state = questionStates.get(questionId) || {
    submitted: false,
    selectedOption: null,
    showAnswer: false,
  };
  state.submitted = true;
  state.selectedOption = selectedOption;
  state.showAnswer = true;
  questionStates.set(questionId, state);

  const isCorrect = selectedOption === question.answer;

  // ── Step 1 (0ms): lock UI + highlight options + reveal answer ──────────
  cardElement
    .querySelectorAll('input[type="radio"]')
    .forEach((r) => (r.disabled = true));
  cardElement.querySelector(".submit-answer-btn").disabled = true;
  cardElement.querySelector(".clear-selection-btn").disabled = true;

  cardElement.querySelectorAll(".option").forEach((optEl, i) => {
    if (i === question.answer) optEl.classList.add("correct-highlight");
    else if (i === selectedOption && !isCorrect)
      optEl.classList.add("incorrect-highlight");
  });

  let explanationRendered = "";
  try {
    explanationRendered = marked.parse(question.explanation || "");
  } catch (e) {
    explanationRendered = escapeHtml(question.explanation || "");
  }
  const revealContainer = cardElement.querySelector(
    `#answer-explanation-${questionId}`
  );
  revealContainer.innerHTML = `
        <div class="answer-section"><strong>Answer:</strong> ${escapeHtml(
          question.options[question.answer]
        )}</div>
        <div class="explanation-section"><strong>Explanation:</strong> ${explanationRendered}</div>`;
  revealContainer.classList.add("reveal-animate");

  cardElement.querySelector(".toggle-answer-btn").textContent = "Hide Answer";

  // ── Step 2 (50ms): icons spring in ─────────────────────────────────────
  setTimeout(
    () =>
      injectIcons(cardElement, question, selectedOption, /* animated */ true),
    50
  );

  // ── Step 3 (100ms): card border glow bloom ─────────────────────────────
  setTimeout(() => {
    cardElement.classList.add(isCorrect ? "card--correct" : "card--incorrect");
  }, 100);

  // ── Step 4 (400ms): scroll correct option to center ────────────────────
  setTimeout(() => {
    const correctOpt = cardElement.querySelector(
      `.option[data-option-index="${question.answer}"]`
    );
    if (correctOpt)
      correctOpt.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 400);
}

// ========== CARD EVENT WIRING ==========

function attachCardEvents(cardElement, questionId) {
  const toggleBtn = cardElement.querySelector(".toggle-answer-btn");
  const clearBtn = cardElement.querySelector(".clear-selection-btn");
  const submitBtn = cardElement.querySelector(".submit-answer-btn");
  const radios = cardElement.querySelectorAll('input[type="radio"]');

  toggleBtn.addEventListener("click", () => {
    const state = questionStates.get(questionId) || {
      submitted: false,
      selectedOption: null,
      showAnswer: false,
    };
    state.showAnswer = !state.showAnswer;
    questionStates.set(questionId, state);
    refreshCard(questionId);
  });

  clearBtn.addEventListener("click", () => {
    const state = questionStates.get(questionId) || {
      submitted: false,
      selectedOption: null,
      showAnswer: false,
    };
    state.selectedOption = null;
    questionStates.set(questionId, state);
    refreshCard(questionId);
  });

  submitBtn.addEventListener("click", () =>
    handleSubmit(cardElement, questionId)
  );

  // Track radio changes in state; clearBtn is already in scope - no re-query needed
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const state = questionStates.get(questionId) || {
        submitted: false,
        selectedOption: null,
        showAnswer: false,
      };
      if (!state.submitted) {
        state.selectedOption = parseInt(radio.value, 10);
        questionStates.set(questionId, state);
        clearBtn.disabled = false;
      }
    });
  });
}

// ========== PAGINATION ==========

function renderQuestionsRange(start, end) {
  const questions = allQuestions.questions || [];
  for (let i = start; i < end && i < filteredIndexes.length; i++) {
    const question = questions[filteredIndexes[i]];
    if (!question) continue;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderQuestionCard(question).trim();
    const cardElement = wrapper.firstElementChild;
    quizQuestionsDiv.appendChild(cardElement);
    attachCardEvents(cardElement, question.id);
  }
}

function loadMore() {
  const start = loadedCount;
  const end = Math.min(
    loadedCount + CONFIG.pagination_size,
    filteredIndexes.length
  );
  if (start >= filteredIndexes.length) return;
  renderQuestionsRange(start, end);
  loadedCount = end;
  const exhausted = loadedCount >= filteredIndexes.length;
  loadMoreBtn.disabled = exhausted;
  loadMoreBtn.textContent = exhausted
    ? "All Questions Loaded"
    : "Load more questions";
}

// ========== FILTER + ACTIVE BAR ==========

function rebuildFilteredIndexes() {
  const filtered = filterQuestionsByTags();
  totalFilteredCount = filtered.length;
  const questions = allQuestions.questions || [];
  const indices = filtered
    .map((fq) => questions.findIndex((q) => q.id === fq.id))
    .filter((i) => i !== -1);
  filteredIndexes = shuffleArray(indices);
  loadedCount = 0;
  questionStates.clear();
  quizQuestionsDiv.innerHTML = "";
  loadMore();
}

function updateActiveFiltersBar() {
  if (currentFilterTags.size === 0) {
    activeFiltersDiv.classList.add("hidden");
    return;
  }
  activeFiltersDiv.classList.remove("hidden");
  const chipsHtml = [...currentFilterTags]
    .map(
      (tag) =>
        `<span class="active-filter-chip" style="background-color:${getColorForTag(
          tag
        )}">${escapeHtml(tag)}</span>`
    )
    .join("");
  const badge = `<span class="filter-count-badge" title="${totalFilteredCount} questions match">${totalFilteredCount}</span>`;
  activeFiltersDiv.innerHTML = `<span><strong>Active filters:</strong></span><div class="chips-container">${chipsHtml}${badge}</div>`;
}

function populateTagDrawer() {
  const allTags = getAllTags();
  tagCheckboxesDiv.innerHTML = "";
  allTags.forEach((tag) => {
    const isChecked = currentFilterTags.has(tag);
    const item = document.createElement("label");
    item.className = "tag-checkbox-item" + (isChecked ? " selected" : "");
    item.innerHTML = `
            <input type="checkbox" value="${escapeHtml(tag)}" ${
      isChecked ? "checked" : ""
    } aria-label="${escapeHtml(tag)}">
            <span class="tag-chip" style="background-color:${getColorForTag(
              tag
            )}">${escapeHtml(tag)}</span>`;
    item.querySelector("input").addEventListener("change", (e) => {
      item.classList.toggle("selected", e.target.checked);
    });
    tagCheckboxesDiv.appendChild(item);
  });
}

// ========== INIT ==========

async function init() {
  try {
    const response = await fetch(CONFIG.quizFilePath);
    if (!response.ok)
      throw new Error(
        `HTTP ${response.status}: Failed to load ${CONFIG.quizFilePath}`
      );
    const data = await response.json();

    if (!data.meta || !Array.isArray(data.questions)) {
      throw new Error('Invalid JSON: missing "meta" or "questions" array');
    }

    allQuestions = data;
    quizHeader.textContent = data.meta.topic || "Quiz";
    document.title = data.meta.topic || "Quiz";

    currentFilterTags = getTagsFromURL();
    getAllTags().forEach((tag) => getColorForTag(tag)); // pre-build colour map

    populateTagDrawer();
    rebuildFilteredIndexes();
    updateActiveFiltersBar();

    // Load More
    loadMoreBtn.addEventListener("click", loadMore);

    // Back to top
    backToTopBtn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
    window.addEventListener(
      "scroll",
      () => {
        backToTopBtn.classList.toggle("hidden", window.scrollY <= 300);
      },
      { passive: true }
    );
    window.dispatchEvent(new Event("scroll"));

    // Drawer
    menuIcon.addEventListener("click", openDrawer);
    document
      .getElementById("drawer-overlay")
      .addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer.classList.contains("open"))
        closeDrawer();
    });

    // Focus trap inside drawer
    drawer.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusable = [
        ...drawer.querySelectorAll('button, input[type="checkbox"]'),
      ].filter((el) => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Apply filter
    applyBtn.addEventListener("click", async () => {
      const selectedTags = [
        ...tagCheckboxesDiv.querySelectorAll("input:checked"),
      ].map((cb) => cb.value);
      const { isConfirmed } = await Swal.fire({
        title: "Apply filter?",
        text: "This will reload the page and reset all your progress.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, apply",
        cancelButtonText: "Cancel",
      });
      if (isConfirmed) updateURLWithTags(selectedTags);
    });

    // Reset drawer - clears both checkbox state AND selected chip styling
    resetTagsBtn.addEventListener("click", () => {
      tagCheckboxesDiv
        .querySelectorAll(".tag-checkbox-item")
        .forEach((item) => {
          item.querySelector("input").checked = false;
          item.classList.remove("selected");
        });
    });
  } catch (error) {
    console.error(error);
    Swal.fire("Error", `Failed to load quiz data: ${error.message}`, "error");
    quizQuestionsDiv.innerHTML = `<p class="error">Error loading questions. Make sure ${escapeHtml(
      CONFIG.quizFilePath
    )} is present and valid.</p>`;
    quizHeader.textContent = "Error loading quiz";
  }
}

document.addEventListener("DOMContentLoaded", init);
