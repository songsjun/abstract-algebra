'use strict';

const parts = window.courseParts;
const chapters = window.courseChapters;
const lessons = window.lessonSets.flat();
const assessmentForms = window.assessmentForms;
const currentForm = 2;
const assessmentSize = assessmentForms[currentForm].length;
const lessonById = new Map(lessons.map(lesson => [lesson.section, lesson]));
const core = lessons.filter(lesson => lesson.core);
const storageKey = 'abstract-algebra-study-v1';
const letters = ['A', 'B', 'C', 'D'];
const target = Math.ceil(assessmentSize * 0.60);
const header = document.querySelector('.site-header');
const main = document.querySelector('main');
const desktopNav = document.querySelector('#desktop-nav');
const dialog = document.querySelector('#mobile-nav');
let mobileOpener;
let currentView;
let currentLesson;
let canSave = true;

new ResizeObserver(() => {
  document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
}).observe(header);

function readState() {
  const empty = {last: core[0].section, mode: 'core', practice: {}, draft: null, draftForm: 1, position: 0, first: null, latest: null};
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === 'object' && saved.practice && typeof saved.practice === 'object') {
      return {...empty, ...saved, last: lessonById.has(saved.last) ? saved.last : empty.last};
    }
  } catch {
    canSave = false;
  }
  return empty;
}

let state = readState();

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    canSave = true;
  } catch {
    canSave = false;
  }
}

window.addEventListener('storage', event => {
  if (event.key !== storageKey) return;
  state = readState();
  updateProgress();
  if (currentView === 'lesson') {
    currentLesson.questions.forEach((question, index) => renderPracticeQuestion(currentLesson, index));
  }
  if (currentView === 'review') renderReview();
  if (currentView === 'assessment') renderAssessment();
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character =>
    ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[character]);
}

function chapterOf(lesson) {
  return lesson.section.split('.')[0];
}

function partOf(lesson) {
  return parts.find(part => part.chapters.includes(chapterOf(lesson)));
}

function chapterLabel(chapter) {
  if (chapter === '0') return '预备知识';
  if (chapter === 'A' || chapter === 'B') return chapter === 'A' ? '附录 I' : '附录 II';
  return '第 ' + chapter + ' 章';
}

function sectionLabel(lesson) {
  const chapter = chapterOf(lesson);
  return chapter === 'A' || chapter === 'B' ? chapterLabel(chapter) : '§ ' + lesson.section;
}

function practiceId(lesson, index) {
  const base = lesson.section + ':' + index;
  const revision = lesson.questions[index].revision;
  return revision ? base + ':' + revision : base;
}

function hasPreviousPractice(lesson, index) {
  return lesson.questions[index].revision && state.practice[lesson.section + ':' + index]?.first != null;
}

function lessonDone(lesson) {
  return lesson.questions.every((question, index) => state.practice[practiceId(lesson, index)]?.first != null);
}

function meter(value, total, label) {
  return '<progress class="meter" aria-label="' + label + '" value="' + value + '" max="' + total + '">' + value + '/' + total + '</progress>';
}

function updateProgress() {
  const complete = core.filter(lessonDone).length;
  document.querySelector('#header-meter-fill').style.width = (100 * complete / core.length) + '%';
  document.querySelector('#progress-label').textContent = '学习记录 ' + complete + '/' + core.length;
  document.querySelectorAll('[data-done-section]').forEach(element => {
    const done = lessonDone(lessonById.get(element.dataset.doneSection));
    element.classList.toggle('done', done);
    element.textContent = done ? '✓' : '';
    element.setAttribute('title', done ? '已完成练习' : '尚未完成练习');
  });
  document.querySelectorAll('[data-core-progress]').forEach(element => {
    element.textContent = complete + ' / ' + core.length + ' 节';
  });
  document.querySelectorAll('[data-core-meter]').forEach(element => {
    element.value = complete;
  });
}

function pathSwitch() {
  return '<div class="path-switch" role="group" aria-label="目录显示范围">' +
    ['core', 'all'].map(mode => '<button type="button" data-mode="' + mode + '" aria-pressed="' +
      (state.mode === mode) + '">' + (mode === 'core' ? '基础路线' : '全书') + '</button>').join('') + '</div>';
}

function pathContent() {
  const current = currentLesson || lessonById.get(state.last);
  const currentPart = partOf(current);
  const available = state.mode === 'all' ? lessons : core;
  return pathSwitch() + '<nav class="path-list" aria-label="分章学习路径">' + parts.map(part => {
    const partLessons = available.filter(lesson => partOf(lesson) === part);
    if (!partLessons.length) return '';
    const partChapters = part.chapters.map(chapter => {
      const items = partLessons.filter(lesson => chapterOf(lesson) === chapter);
      if (!items.length) return '';
      const label = chapter === '0' ? '集合、整数与同余' : chapters[chapter];
      return '<details class="path-chapter"' + (chapter === chapterOf(current) ? ' open' : '') + '>' +
        '<summary><span class="chapter-num">' + chapter + '</span><span>' + escapeHtml(label) +
        '</span><i class="chevron" aria-hidden="true"></i></summary><ul>' +
        items.map(lesson => '<li><a href="#lesson/' + lesson.section + '"' +
          (currentView === 'lesson' && lesson === current ? ' aria-current="page"' : '') +
          '><span class="path-section">' + escapeHtml(sectionLabel(lesson)) + '</span><span>' +
          escapeHtml(lesson.title) + '</span><span class="done-dot" data-done-section="' +
          lesson.section + '" aria-hidden="true"></span></a></li>').join('') + '</ul></details>';
    }).join('');
    return '<details class="path-part"' + (part === currentPart ? ' open' : '') + '><summary><span>' +
      escapeHtml(part.label) + '</span><span class="path-count">' + partLessons.length +
      '</span><i class="chevron" aria-hidden="true"></i></summary>' + partChapters + '</details>';
  }).join('') + '</nav>';
}

function renderNavigation() {
  const content = pathContent();
  document.querySelector('#desktop-nav').innerHTML = '<div class="path-heading"><h2>学习路径</h2>' +
    '<p><strong data-core-progress></strong><span>基础练习已完成</span></p>' +
    '<progress class="meter" aria-label="基础小节完成进度" data-core-meter value="0" max="' + core.length + '"></progress></div>' +
    content + '<a class="path-footer" href="#catalog">浏览完整教材目录</a>';
  document.querySelector('#mobile-nav-content').innerHTML = content;
  const highlighted = document.querySelector('.desktop-nav [aria-current="page"]');
  if (highlighted && highlighted.offsetTop + highlighted.offsetHeight > desktopNav.clientHeight) {
    desktopNav.scrollTop = highlighted.offsetTop - desktopNav.clientHeight / 2;
  }
  updateProgress();
}

function sourceLine(lesson, page = lesson.page) {
  return '纸本第 ' + page + ' 页 · PDF 第 ' + (page + 14) + ' 页';
}

function heroArt(part) {
  return '<div class="hero-art" aria-hidden="true"><span class="art-ring ring-outer"></span>' +
    '<span class="art-ring ring-inner"></span><span class="art-line art-line-x"></span>' +
    '<span class="art-line art-line-y"></span><span class="art-node node-one">' + part.symbols[0] +
    '</span><span class="art-node node-two">' + part.symbols[1] + '</span>' +
    '<span class="art-node node-three">' + part.symbols[2] + '</span></div>';
}

function jumpControls(lesson) {
  const path = state.mode === 'core' && lesson.core ? core : lessons;
  const index = path.indexOf(lesson);
  const before = path[index - 1];
  const after = path[index + 1];
  return '<nav class="lesson-pagination" aria-label="切换小节">' +
    (before ? '<a class="button subtle" href="#lesson/' + before.section + '">上一节 <span>' +
      escapeHtml(before.title) + '</span></a>' : '<span></span>') +
    (after ? '<a class="button primary" href="#lesson/' + after.section + '">下一节 <span>' +
      escapeHtml(after.title) + '</span></a>' : '<a class="button primary" href="#assessment">开始基础测验</a>') +
    '</nav>';
}

function sectionJumps() {
  return '<button class="section-jump" data-jump="concept">核心概念</button>' +
    '<button class="section-jump" data-jump="example">分步例题</button>' +
    '<button class="section-jump" data-jump="practice">动手检查</button>';
}

function renderLesson(lesson) {
  const part = partOf(lesson);
  const chapter = chapterOf(lesson);
  main.innerHTML = `
    <div class="breadcrumb"><button class="button subtle mobile-only" data-action="open-menu">学习路径</button>
      <span>${escapeHtml(part.label)}</span>${chapter === '0' ? '' :
        '<span class="crumb-divider" aria-hidden="true">/</span><span>' + escapeHtml(chapterLabel(chapter)) + '</span>'}</div>
    <section class="hero lesson-hero" aria-labelledby="page-title">
      <div class="hero-copy"><div class="hero-meta"><span class="section-tag">${escapeHtml(sectionLabel(lesson))}</span>
        <span class="level ${lesson.core ? 'level-core' : 'level-extra'}">${lesson.core ? '基础路线' : '进阶导读'}</span></div>
        <h1 id="page-title">${escapeHtml(lesson.title)}</h1>
        <p class="english-title" lang="en">${escapeHtml(lesson.english)}</p>
        <p class="lesson-goal">${escapeHtml(lesson.goal)}</p>
      </div>${heroArt(part)}
    </section>
    <nav class="compact-jumps" aria-label="本节内容">${sectionJumps()}</nav>
    <div class="lesson-grid">
      <div class="lesson-flow">
        <section class="card study-card" id="concept">
          <h2><span class="section-icon concept-icon" aria-hidden="true">≡</span>核心概念</h2>
          ${lesson.concept.map(paragraph => '<p>' + escapeHtml(paragraph) + '</p>').join('')}
        </section>
        <section class="card study-card" id="example">
          <h2><span class="section-icon example-icon" aria-hidden="true">↳</span>分步例题</h2>
          <p class="example-prompt">${escapeHtml(lesson.example.prompt)}</p>
          <ol class="worked-steps">${lesson.example.steps.map(step => '<li>' + escapeHtml(step) + '</li>').join('')}</ol>
        </section>
        <section class="card study-card practice-card" id="practice">
          <h2><span class="section-icon practice-icon" aria-hidden="true">✓</span>动手检查</h2>
          <p class="secondary">每题选一个答案。提交后查看解析。</p>
          ${lesson.questions.map((question, index) => '<div class="practice-question" id="question-' + index + '"></div>').join('')}
        </section>
        <div id="pagination">${jumpControls(lesson)}</div>
      </div>
      <aside class="lesson-rail" aria-label="本节导航与教材出处">
        <nav class="card rail-card desktop-jumps" aria-label="本节内容">
          <h2>本节内容</h2>
          <div class="rail-list">${sectionJumps()}</div>
        </nav>
        <section class="card rail-card source-card">
          <h2>教材出处</h2>
          <p class="book-name" lang="en">Abstract Algebra</p>
          <p>Dummit &amp; Foote · 第三版</p>
          <p class="page-reference">${sourceLine(lesson)}</p>
        </section>
        <div class="goal-note"><strong>基础目标 ${target}/${assessmentSize}</strong><p>完成练习后，用一组新题检查理解。</p>
          <a href="#assessment">打开基础测验</a></div>
      </aside>
    </div>`;
  lesson.questions.forEach((question, index) => renderPracticeQuestion(lesson, index));
}

function choiceOptions(question, name, selected, graded = false, required = true) {
  return question.options.map((option, index) => {
    let status = '';
    let mark = '';
    if (graded && index === question.answer) {
      status = ' correct-choice';
      mark = '<span class="option-mark">正确答案</span>';
    } else if (graded && index === selected) {
      status = ' wrong-choice';
      mark = '<span class="option-mark">你的选择</span>';
    }
    return '<label class="choice' + status + '"><input type="radio" name="' + name + '" value="' +
      index + '"' + (selected === index ? ' checked' : '') + (graded ? ' disabled' : required ? ' required' : '') + '>' +
      '<span class="choice-letter" aria-hidden="true">' + letters[index] + '</span><span>' +
      escapeHtml(option) + '</span>' + mark + '</label>';
  }).join('');
}

function renderPracticeQuestion(lesson, index) {
  const question = lesson.questions[index];
  const record = state.practice[practiceId(lesson, index)];
  const selected = record?.latest;
  const graded = Number.isInteger(selected);
  const revisionNote = hasPreviousPractice(lesson, index) && !record ?
    '<p class="question-source">本题已修订，可以重新作答。</p>' : '';
  const right = selected === question.answer;
  const source = question.source;
  const citation = source ? '<p class="question-source">据教材 ' + escapeHtml(sectionLabel(lesson)) +
    ' 第 ' + escapeHtml(source.exercise) + ' 题（' + escapeHtml(source.kind) + '）改编 · ' + sourceLine(lesson, source.page) + '</p>' : '';

  document.querySelector('#question-' + index).innerHTML = `
    <form data-practice="${index}">
      <fieldset><legend><span class="question-num">${index + 1}</span>${escapeHtml(question.prompt)}</legend>
      ${citation}${revisionNote}<div class="choices">${choiceOptions(question, 'choice-' + index, selected, graded)}</div></fieldset>
      ${graded ? `<div class="feedback ${right ? 'positive' : 'incorrect'}" tabindex="-1">
        <h3>${right ? '答对了' : '查看解法'}</h3><p>${escapeHtml(question.explanation)}</p></div>
        ${right ? '' : '<button class="button subtle retry" data-retry="' + index + '" type="button">重做这题</button>'}` :
        '<button type="submit" class="button primary check-button">提交答案</button>'}
    </form>`;
}

function pageIntro(label, title, text) {
  return '<div class="page-intro"><button class="button subtle mobile-only" data-action="open-menu">学习路径</button>' +
    '<div class="eyebrow">' + label + '</div><h1 id="page-title">' + title + '</h1><p>' + text + '</p></div>';
}

function renderCatalog() {
  main.innerHTML = pageIntro('Dummit &amp; Foote · 第三版', '教材目录',
    '按教材顺序查看所有小节。基础路线练习常用定义和方法，进阶导读帮助你认识后续主题。') +
    '<div class="catalog-toolbar"><label for="catalog-search">搜索章节或概念</label>' +
    '<input type="search" id="catalog-search" placeholder="例如 3.2、陪集、Sylow" autocomplete="off">' +
    '<span id="catalog-total" role="status"></span></div><div id="catalog-results"></div>';
  catalogResults('');
}

function catalogResults(query) {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const items = lessons.filter(lesson => {
    const search = [lesson.section, lesson.title, lesson.english, chapters[chapterOf(lesson)],
      partOf(lesson).label, ...lesson.concept].join(' ').toLocaleLowerCase();
    return terms.every(term => search.includes(term));
  });
  document.querySelector('#catalog-total').textContent = items.length + ' 节';
  document.querySelector('#catalog-results').innerHTML = items.length ? parts.map(part => {
    const matching = items.filter(lesson => partOf(lesson) === part);
    if (!matching.length) return '';
    return '<section class="card catalog-part"><div class="catalog-part-head"><h2>' + escapeHtml(part.label) +
      '</h2><span lang="en">' + escapeHtml(part.english) + '</span></div>' + part.chapters.map(chapter => {
      const sections = matching.filter(lesson => chapterOf(lesson) === chapter);
      if (!sections.length) return '';
      const heading = chapter === '0' ? '预备小节' : chapterLabel(chapter) + ' · ' + chapters[chapter];
      return '<div class="catalog-chapter"><h3>' + escapeHtml(heading) + '</h3><ul>' +
        sections.map(lesson => '<li><a href="#lesson/' + lesson.section + '"><span class="path-section">' +
          escapeHtml(sectionLabel(lesson)) + '</span><span class="catalog-lesson-name">' + escapeHtml(lesson.title) +
          '<small lang="en">' + escapeHtml(lesson.english) + '</small></span><span class="level ' +
          (lesson.core ? 'level-core">基础' : 'level-extra">导读') + '</span><span class="catalog-page">p. ' +
          lesson.page + '</span></a></li>').join('') + '</ul></div>';
    }).join('') + '</section>';
  }).join('') : '<div class="card empty-state">没有找到匹配的小节。可以试试章节号或英文术语。</div>';
}

function answeredCount() {
  return Object.keys(state.draft || {}).length;
}

function renderAssessment() {
  main.innerHTML = pageIntro('综合自测', '基础测验',
    assessmentSize + ' 道新题抽查预备知识、群、环、模与向量空间、域与伽罗瓦理论。');
  if (state.draft) {
    renderAssessmentQuestion();
  } else if (state.latest) {
    renderAssessmentResult();
  } else {
    main.innerHTML += `<section class="card exam-intro"><div class="exam-target"><strong>${target}<small>/${assessmentSize}</small></strong><span>站内 60% 目标</span></div>
      <div><h2>独立做一次</h2><p>每题权重相同。你可以前后翻题，填完后一次交卷，再查看分数、错题解析和对应小节。</p>
      <p class="secondary">测验抽查基本概念和短计算。系统会标出题目对应的小节，供你进一步复习。</p>
      <button class="button primary" type="button" data-action="start-assessment">开始测验</button></div></section>`;
  }
}

function renderAssessmentQuestion() {
  const quiz = assessmentForms[state.draftForm];
  const position = state.position;
  const question = quiz[position];
  const answered = answeredCount();
  main.insertAdjacentHTML('beforeend', `
    <div class="exam-grid"><section class="card exam-question" aria-labelledby="exam-heading">
      <div class="exam-question-meta"><span class="section-tag">第 ${position + 1} / ${quiz.length} 题</span><span>${answered} 题已作答</span></div>
      <form id="exam-form"><fieldset><legend id="exam-heading" tabindex="-1">${escapeHtml(question.prompt)}</legend>
      <div class="choices">${choiceOptions(question, 'exam-choice', state.draft[position], false, false)}</div></fieldset></form>
      <div class="exam-controls">
        <button type="button" class="button subtle" data-question="${position - 1}" ${position ? '' : 'disabled'}>上一题</button>
        <button type="button" class="button subtle compact-exam-jump" data-jump="answer-sheet">答题卡</button>
        <button type="button" class="button primary" data-question="${position + 1}" ${position < quiz.length - 1 ? '' : 'disabled'}>下一题</button>
      </div>
    </section>
    <aside id="answer-sheet" class="card exam-palette" aria-label="答题卡"><h2>答题卡</h2>
      ${meter(answered, quiz.length, '基础测验作答进度')}<p id="exam-progress">${answered} / ${quiz.length} 题已作答</p><div class="exam-number-grid">
      ${quiz.map((item, index) => '<button type="button" class="' + (state.draft[index] != null ? 'is-answered' : '') +
        '" data-question="' + index + '" aria-label="第 ' + (index + 1) + ' 题，' +
        (state.draft[index] != null ? '已作答' : '待作答') + '"' + (position === index ? ' aria-current="step"' : '') +
        '>' + (index + 1) + '</button>').join('')}</div>
      <button class="button primary" type="button" data-action="grade-assessment" ${answered === quiz.length ? '' : 'disabled'}>交卷并查看结果</button>
    </aside></div>`);
}

function grade(answers, quiz) {
  return quiz.reduce((sum, question, index) => sum + Number(answers[index] === question.answer), 0);
}

function renderAssessmentResult() {
  const {answers, score} = state.latest;
  const form = state.latest.form ?? 1;
  const firstForm = state.first.form ?? 1;
  const quiz = assessmentForms[form];
  const wrong = quiz.map((question, index) => ({question, index}))
    .filter(({question, index}) => answers[index] !== question.answer);
  const categories = parts.map(part => {
    const questions = quiz.map((question, index) => ({question, index}))
      .filter(({question}) => partOf(lessonById.get(question.section)) === part);
    const correct = questions.filter(({question, index}) => answers[index] === question.answer).length;
    return questions.length ? '<li><span>' + escapeHtml(part.label) + '</span><b>' + correct + ' / ' + questions.length + '</b></li>' : '';
  }).join('');

  main.insertAdjacentHTML('beforeend', `
    <div class="exam-grid result-grid"><section class="card exam-result">
      <div class="exam-score"><strong>${score}<small>/${quiz.length}</small></strong><div>
      <h2>${score >= target ? '达到站内基础目标' : '再复习几处基础概念'}</h2>
      <p>第 ${form} 版 · 本次得分 ${Math.round(score * 100 / quiz.length)}% · 目标 ${target}/${quiz.length}</p></div></div>
      <p>首次提交为第 ${firstForm} 版，得分 ${state.first.score}/${assessmentForms[firstForm].length}。</p>
      <button class="button subtle" type="button" data-action="start-assessment">${form === currentForm ? '重做测验' : '开始修订版测验'}</button></section>
      <section class="card exam-palette"><h2>分主题成绩</h2><ul class="score-breakdown">${categories}</ul></section>
    </div><section class="card exam-review"><h2>${wrong.length ? '错题回顾' : '题目回顾'}</h2>
    ${wrong.length ? wrong.map(({question, index}) => `<article>
      <h3>${index + 1}. ${escapeHtml(question.prompt)}</h3>
      <p>你选了 ${escapeHtml(question.options[answers[index]])}。正确答案是 ${escapeHtml(question.options[question.answer])}。</p>
      <p>${escapeHtml(question.explanation)}</p>
      <a href="#lesson/${question.section}">复习 ${escapeHtml(lessonById.get(question.section).title)}</a>
    </article>`).join('') : '<p>全部答对。可以回到教材目录，继续探索进阶内容。</p>'}
    </section>`);
}

function renderReview() {
  const done = core.filter(lessonDone).length;
  const attempted = [];
  lessons.forEach(lesson => lesson.questions.forEach((question, index) => {
    const record = state.practice[practiceId(lesson, index)];
    if (record?.first != null) attempted.push({lesson, question, record});
  }));
  const correct = attempted.filter(({question, record}) => question.answer === record.first).length;
  const needsReview = new Map();
  attempted.forEach(({lesson, question, record}) => {
    if (question.answer !== record.first) needsReview.set(lesson.section, lesson);
  });
  const revisedLessons = lessons.filter(lesson => lesson.questions.some((question, index) =>
    hasPreviousPractice(lesson, index) && state.practice[practiceId(lesson, index)]?.first == null));
  const resume = currentLesson || lessonById.get(state.last);
  main.innerHTML = pageIntro('本地学习进度', '学习记录',
    canSave ? '本浏览器会保存学习位置与作答记录。' : '当前浏览器未能保存数据。关闭页面后，进度可能丢失。') +
    `<div class="record-grid">
      <section class="card stat"><span>基础小节练习完成</span><strong>${done}<small> / ${core.length} 节</small></strong>${meter(done, core.length, '基础小节完成进度')}</section>
      <section class="card stat"><span>练习首答正确</span><strong>${correct}<small> / ${attempted.length} 题</small></strong><p>每题用第一次提交计算。</p></section>
      <section class="card stat"><span>首次基础测验</span><strong>${state.first ? state.first.score + '<small> / ' + assessmentForms[state.first.form ?? 1].length + '</small>' : '待完成'}</strong>
        <a href="#assessment">${state.draft ? '继续测验' : state.latest ? '查看测验结果' : '开始测验'}</a></section>
    </div><section class="card study-card review-resume"><h2>继续学习</h2><p>${escapeHtml(sectionLabel(resume))} · ${escapeHtml(resume.title)}</p>
    <a class="button primary" href="#lesson/${resume.section}">回到上次位置</a></section>
    <section class="card study-card"><h2>首答错题所在小节</h2>${needsReview.size ?
      '<ul class="review-links">' + [...needsReview.values()].map(lesson => '<li><a href="#lesson/' + lesson.section + '">' +
        escapeHtml(sectionLabel(lesson) + ' ' + lesson.title) + '</a></li>').join('') + '</ul>' :
      '<p>完成小节练习后，可以在这里查找首答出错的知识点。</p>'}</section>
    ${revisedLessons.length ? '<section class="card study-card"><h2>练习已有更新</h2><p>重新作答后，新题会计入学习进度。</p>' +
      '<ul class="review-links">' + revisedLessons.map(lesson => '<li><a href="#lesson/' + lesson.section + '">' +
        escapeHtml(sectionLabel(lesson) + ' ' + lesson.title) + '</a></li>').join('') + '</ul></section>' : ''}`;
}

function route(moveFocus = true) {
  const path = location.hash.slice(1);
  currentLesson = null;
  if (path === 'catalog') {
    currentView = 'catalog';
    renderCatalog();
  } else if (path === 'assessment') {
    currentView = 'assessment';
    renderAssessment();
  } else if (path === 'review') {
    currentView = 'review';
    renderReview();
  } else {
    currentView = 'lesson';
    currentLesson = lessonById.get(path.split('/')[1]) || lessonById.get(state.last);
    if (state.last !== currentLesson.section) {
      state.last = currentLesson.section;
      if (!currentLesson.core) state.mode = 'all';
      saveState();
    }
    renderLesson(currentLesson);
  }
  renderNavigation();
  document.querySelectorAll('[data-tab]').forEach(link => {
    if (link.dataset.tab === currentView) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.querySelector('.progress-link').classList.toggle('active', currentView === 'review');
  document.title = document.querySelector('#page-title').textContent + ' · 抽象代数学习室';
  if (moveFocus) {
    window.scrollTo(0, 0);
    main.focus({preventScroll: true});
  }
}

window.addEventListener('hashchange', () => route());
dialog.addEventListener('close', () => mobileOpener?.focus({preventScroll: true}));
window.addEventListener('resize', () => {
  if (!dialog.open || getComputedStyle(desktopNav).display === 'none') return;
  mobileOpener = null;
  dialog.close();
  main.focus({preventScroll: true});
});

document.addEventListener('click', event => {
  const control = event.target.closest('button, a');
  if (!control) return;
  const {mode, action, jump, retry, question} = control.dataset;
  if (control.classList.contains('skip')) {
    event.preventDefault();
    main.focus();
  }
  if (control.tagName === 'A' && dialog.contains(control)) {
    mobileOpener = null;
    dialog.close();
    if (control.hash === location.hash) main.focus();
  }
  if (mode) {
    state.mode = mode;
    saveState();
    renderNavigation();
    const nav = dialog.open ? dialog : document.querySelector('#desktop-nav');
    nav.querySelector('[data-mode="' + mode + '"]').focus();
    if (currentLesson) document.querySelector('#pagination').innerHTML = jumpControls(currentLesson);
  }
  if (jump) {
    const section = document.getElementById(jump);
    section.setAttribute('tabindex', '-1');
    section.scrollIntoView({behavior: 'auto'});
    section.focus({preventScroll: true});
  }
  if (retry != null && currentLesson) {
    state.practice[practiceId(currentLesson, retry)].latest = null;
    saveState();
    renderPracticeQuestion(currentLesson, Number(retry));
    document.querySelector('#question-' + retry + ' input').focus();
  }
  if (action === 'open-menu') {
    mobileOpener = control;
    dialog.showModal();
  }
  if (action === 'start-assessment') {
    state.draft = {};
    state.draftForm = currentForm;
    state.position = 0;
    saveState();
    renderAssessment();
    document.querySelector('#exam-heading').focus();
  }
  if (question != null && state.draft) {
    state.position = Number(question);
    saveState();
    renderAssessment();
    document.querySelector('#exam-heading').focus();
  }
  if (action === 'grade-assessment' && state.draft && answeredCount() === assessmentForms[state.draftForm].length) {
    const result = {answers: state.draft, form: state.draftForm, score: grade(state.draft, assessmentForms[state.draftForm])};
    state.latest = result;
    state.first ??= result;
    state.draft = null;
    saveState();
    renderAssessment();
    main.focus();
  }
});

main.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.dataset.practice == null || !currentLesson) return;
  const index = Number(event.target.dataset.practice);
  const choice = new FormData(event.target).get('choice-' + index);
  if (choice === null) return;
  const selected = Number(choice);
  const id = practiceId(currentLesson, index);
  state.practice[id] = {first: state.practice[id]?.first ?? selected, latest: selected};
  saveState();
  renderPracticeQuestion(currentLesson, index);
  updateProgress();
  document.querySelector('#question-' + index + ' .feedback').focus();
});

main.addEventListener('input', event => {
  if (event.target.id === 'catalog-search') catalogResults(event.target.value);
});

main.addEventListener('change', event => {
  if (event.target.name !== 'exam-choice' || !state.draft) return;
  const quiz = assessmentForms[state.draftForm];
  state.draft[state.position] = Number(event.target.value);
  saveState();
  const answered = answeredCount();
  document.querySelector('.exam-question-meta > span:last-child').textContent = answered + ' 题已作答';
  document.querySelector('#exam-progress').textContent = answered + ' / ' + quiz.length + ' 题已作答';
  document.querySelector('.exam-palette progress').value = answered;
  const questionNumber = document.querySelector('.exam-number-grid [data-question="' + state.position + '"]');
  questionNumber.classList.add('is-answered');
  questionNumber.setAttribute('aria-label', '第 ' + (state.position + 1) + ' 题，已作答');
  document.querySelector('[data-action="grade-assessment"]').disabled = answered < quiz.length;
});

route(false);
