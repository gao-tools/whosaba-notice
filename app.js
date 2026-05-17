const days = ["月", "火", "水", "木", "金", "土", "日"];
const ALLIANCE_BIRTHDAY = "2025-04-07";

const defaultTemplates = [
  {
    id: "normal",
    name: "通常週",
    days: {
      月: { buff: "建設", event: "イベなし" },
      火: { buff: "研究", event: "除雪、熊" },
      水: { buff: "なし", event: "除雪" },
      木: { buff: "訓練", event: "除雪、熊" },
      金: { buff: "なし", event: "砦要塞" },
      土: { buff: "なし", event: "峡谷、熊" },
      日: { buff: "なし", event: "兵器" }
    }
  },
  {
    id: "svsPrepare",
    name: "SVS準備週",
    days: {
      月: { buff: "建設", event: "イベなし" },
      火: { buff: "研究", event: "除雪、熊" },
      水: { buff: "なし", event: "除雪" },
      木: { buff: "訓練", event: "除雪、熊" },
      金: { buff: "なし", event: "砦要塞" },
      土: { buff: "なし", event: "SVS準備" },
      日: { buff: "なし", event: "兵器" }
    }
  },
  {
    id: "svsBattle",
    name: "SVS戦闘週",
    days: {
      月: { buff: "建設", event: "イベなし" },
      火: { buff: "研究", event: "除雪、熊" },
      水: { buff: "なし", event: "除雪" },
      木: { buff: "訓練", event: "除雪、熊" },
      金: { buff: "なし", event: "砦要塞" },
      土: { buff: "なし", event: "SVS戦闘" },
      日: { buff: "なし", event: "兵器" }
    }
  }
];

let templates = [];

const defaultEventPresets = [
  { label: "熊", text: "21:00〜 熊【live】" },
  { label: "兵器", text: "21:00〜 兵器【live】" },
  { label: "峡谷", text: "20:00〜 峡谷" },
  { label: "SVS", text: "20:00〜 SVS" },
  { label: "砦", text: "砦要塞" }
];

const defaultSpecialPresets = [
  {
    label: "烈火と牙",
    text: "⚫︎明日から【烈火と牙】"
  },
  {
    label: "灯台注意",
    text: "17時以降の灯台は回収せず、明日の朝9時以降に回収しよう！"
  },
  {
    label: "アグネス",
    text: "今日のアグネスは17時以降に押してね！"
  },
  {
    label: "シールド",
    text: "シールド切れに注意お願いします！"
  },
  {
    label: "兵調整",
    text: "兵数調整が必要な方は早めにお願いします！"
  }
];

let specialPresets = [];

let eventPresets = [];

function getTodayInfo() {
  const now = new Date();
  const week = ["日", "月", "火", "水", "木", "金", "土"];
  return {
    dateText: `${now.getMonth() + 1}月${now.getDate()}日(${week[now.getDay()]})`,
    dayLabel: week[now.getDay()]
  };
}

function mergeTemplates(saved) {
  if (!saved) return structuredClone(defaultTemplates);

  const merged = structuredClone(defaultTemplates);

  Object.keys(defaultTemplates).forEach(key => {
    if (saved[key] && saved[key].days) {
      days.forEach(day => {
        if (saved[key].days[day]) {
          merged[key].days[day].buff = saved[key].days[day].buff ?? merged[key].days[day].buff;
          merged[key].days[day].event = saved[key].days[day].event ?? merged[key].days[day].event;
        }
      });
    }
  });

  return merged;
}

function initTemplates() {
  try {
    const saved = JSON.parse(localStorage.getItem("weeklyTemplates"));

    if (Array.isArray(saved)) {
      templates = saved;
    } else if (saved && typeof saved === "object") {
      templates = Object.keys(saved).map(key => ({
        id: key,
        name: saved[key].name || key,
        days: saved[key].days
      }));
    } else {
      templates = structuredClone(defaultTemplates);
    }
  } catch (e) {
    templates = structuredClone(defaultTemplates);
  }

  renderWeeklyTemplateSelect();
}

function renderWeeklyTemplateSelect(selectedId) {
  const select = document.getElementById("weeklyTemplate");
  const savedSelected =
  localStorage.getItem("selectedWeeklyTemplateId");

  const current =
    selectedId ||
    savedSelected ||
    select.value ||
    templates[0]?.id;

  select.innerHTML = "";

  templates.forEach(template => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.name;
    select.appendChild(option);
  });

  if (templates.some(t => t.id === current)) {
    select.value = current;
  }
}

function loadSettings() {
  const defaults = {
    greeting: "おは〜ヾ(^▽^)ﾉ",
    intro: "本日の連絡です！",
    footer: "★鯖ルール\n星マーク通知で確認を！\n不明点は幹部までヾ(^▽^)ﾉ"
  };

  let settings = defaults;

  try {
    settings = JSON.parse(localStorage.getItem("fixedSettings")) || defaults;
  } catch (e) {
    settings = defaults;
  }

  document.getElementById("greeting").value = settings.greeting || defaults.greeting;
  document.getElementById("intro").value = settings.intro || defaults.intro;
  document.getElementById("footer").value = settings.footer || defaults.footer;
}

function initTodayFields() {
  const today = getTodayInfo();

  const noticeDate = document.getElementById("noticeDate");
  if (!noticeDate.value) {
    noticeDate.value = today.dateText;
  }

  const todayEvents = document.getElementById("todayEvents");
  if (!todayEvents.value.trim()) {
    todayEvents.value = "①21:00〜 兵器【live】";
  }

  const specialNotice = document.getElementById("specialNotice");
  if (!specialNotice.value.trim()) {
    specialNotice.value =
      "⚫︎明日から【烈火と牙】\n今日のアグネスは17時以降に押してね！\nあと17時以降の灯台回収せず、明日の朝9時以降に回収しよう！";
  }
  calcMigrationDay();
}

function calcMigrationDay() {
  const startDate = new Date(ALLIANCE_BIRTHDAY + "T00:00:00");

  const today = new Date();
  const todayDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diff =
    Math.floor(
      (todayDate - startDate) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  document.getElementById("migrationDay").value = diff;

  generateNotice();
}

function loadWeeklyTemplate() {
  const key = document.getElementById("weeklyTemplate").value;
  localStorage.setItem("selectedWeeklyTemplateId", key);
  const template = templates.find(t => t.id === key) || templates[0];
  const editor = document.getElementById("weeklyEditor");
  const today = getTodayInfo().dayLabel;

  if (!template) return;

  document.getElementById("weeklyTemplateName").value = template.name;

  editor.innerHTML = "";

  days.forEach(day => {
    const row = document.createElement("div");
    row.className = "week-row" + (day === today ? " today" : "");

    row.innerHTML = `
      <div class="week-day">${day}</div>
      <input id="buff-${day}" value="${template.days[day].buff}" />
      <input id="event-${day}" value="${template.days[day].event}" />
    `;

    editor.appendChild(row);
  });

  generateNotice();
}

function saveWeeklyTemplate() {
  const key = document.getElementById("weeklyTemplate").value;
  const template = templates.find(t => t.id === key);

  if (!template) return;

  template.name = document.getElementById("weeklyTemplateName").value.trim() || "名称未設定";

  days.forEach(day => {
    template.days[day].buff = document.getElementById(`buff-${day}`).value;
    template.days[day].event = document.getElementById(`event-${day}`).value;
  });

  localStorage.setItem("weeklyTemplates", JSON.stringify(templates));

  renderWeeklyTemplateSelect(template.id);
  loadWeeklyTemplate();

  showToast("週間テンプレを保存しました");
}

function addWeeklyTemplate() {
  const base = templates.find(t => t.id === document.getElementById("weeklyTemplate").value) || templates[0];

  const newId = "template_" + Date.now();

  const newTemplate = {
    id: newId,
    name: "新規テンプレ",
    days: structuredClone(base.days)
  };

  templates.push(newTemplate);
  localStorage.setItem("weeklyTemplates", JSON.stringify(templates));

  renderWeeklyTemplateSelect(newId);
  loadWeeklyTemplate();

  showToast("週間テンプレを追加しました");
}

function deleteWeeklyTemplate() {
  if (templates.length <= 1) {
    showToast("最低1つは必要です");
    return;
  }

  const key = document.getElementById("weeklyTemplate").value;
  templates = templates.filter(t => t.id !== key);

  localStorage.setItem("weeklyTemplates", JSON.stringify(templates));

  renderWeeklyTemplateSelect(templates[0].id);
  loadWeeklyTemplate();

  showToast("週間テンプレを削除しました");
}

function saveSettings() {
  const settings = {
    greeting: document.getElementById("greeting").value,
    intro: document.getElementById("intro").value,
    footer: document.getElementById("footer").value
  };

  localStorage.setItem("fixedSettings", JSON.stringify(settings));
  showToast("固定文言を保存しました");
  generateNotice();
}

function addEventPreset(text) {
  const area = document.getElementById("todayEvents");

  const lines = area.value
    .split("\n")
    .filter(line => line.trim());

  const nextNumber = lines.length + 1;

  const numberedText = `${toCircledNumber(nextNumber)}${text}`;

  if (!area.value.trim()) {
    area.value = numberedText;
  } else {
    area.value += `\n${numberedText}`;
  }

  generateNotice();
}

function toCircledNumber(num) {
  const numbers = [
    "",
    "①",
    "②",
    "③",
    "④",
    "⑤",
    "⑥",
    "⑦",
    "⑧",
    "⑨",
    "⑩"
  ];

  return numbers[num] || `${num}.`;
}

function generateNotice() {
  const date = document.getElementById("noticeDate").value;
  const migrationDay = document.getElementById("migrationDay").value;
  const todayEvents = document.getElementById("todayEvents").value;
  const specialNotice = document.getElementById("specialNotice").value;
  const greeting = document.getElementById("greeting").value;
  const intro = document.getElementById("intro").value;
  const footer = document.getElementById("footer").value;

  const key = document.getElementById("weeklyTemplate").value;
  const template = templates.find(t => t.id === key) || templates[0];

  const weeklyText = days.map(day => {
    const buff = document.getElementById(`buff-${day}`)?.value || template.days[day].buff;
    const event = document.getElementById(`event-${day}`)?.value || template.days[day].event;
    return `${day}-◎${buff}-${event}`;
  }).join("\n");

  const text = `GaO新聞 ${date}
＝＝＝＝＝＝＝
【同盟${migrationDay}日目】
${greeting}
${intro}
${todayEvents}

${specialNotice}


【定時発動イベ】
${weeklyText}
◎執バフ予定

${footer}`;

  document.getElementById("result").value = text;
  updateCharCount(text);
}

async function copyResult() {
  const result = document.getElementById("result").value;

  if (!result.trim()) {
    showToast("コピーする内容がありません");
    return;
  }

  try {
    await navigator.clipboard.writeText(result);
    showToast("コピーしました");
  } catch (e) {
    const area = document.getElementById("result");
    area.select();
    document.execCommand("copy");
    showToast("コピーしました");
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

document.addEventListener("DOMContentLoaded", () => {
  initTemplates();
  initEventPresets();
  initSpecialPresets();
  loadSettings();
  initTodayFields();
  loadWeeklyTemplate();

  document.getElementById("noticeDate").addEventListener("input", generateNotice);
  document.getElementById("migrationDay").addEventListener("input", generateNotice);
  document.getElementById("todayEvents").addEventListener("input", generateNotice);
  document.getElementById("specialNotice").addEventListener("input", generateNotice);
  document.getElementById("greeting").addEventListener("input", generateNotice);
  document.getElementById("intro").addEventListener("input", generateNotice);
  document.getElementById("footer").addEventListener("input", generateNotice);

  generateNotice();
});

function initEventPresets() {
  const savedText = localStorage.getItem("eventPresets");

  if (savedText) {
    try {
      eventPresets = JSON.parse(savedText);
    } catch (e) {
      eventPresets = structuredClone(defaultEventPresets);
    }
  } else {
    eventPresets = structuredClone(defaultEventPresets);
  }

  renderPresetButtons();
  renderPresetEditor();
}

function renderPresetButtons() {
  const box = document.getElementById("presetButtons");
  box.innerHTML = "";

  eventPresets.forEach(preset => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = preset.label;
    button.addEventListener("click", () => {
      addEventPreset(preset.text);
    });
    box.appendChild(button);
  });
}

function renderPresetEditor() {
  const editor = document.getElementById("presetEditor");
  editor.innerHTML = "";

  eventPresets.forEach((preset, index) => {
    const row = document.createElement("div");
    row.className = "preset-edit-row";

    const labelInput = document.createElement("input");
    labelInput.value = preset.label;
    labelInput.placeholder = "表示名";

    const textInput = document.createElement("input");
    textInput.value = preset.text;
    textInput.placeholder = "挿入内容";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "削除";

    deleteButton.addEventListener("click", () => {
      deletePresetRow(index);
    });

    row.appendChild(labelInput);
    row.appendChild(textInput);
    row.appendChild(deleteButton);

    editor.appendChild(row);
  });
}

function addPresetRow() {
  readPresetEditorValues();

  eventPresets.push({
    label: "新規",
    text: "①"
  });

  renderPresetEditor();
}

function deletePresetRow(index) {
  eventPresets.splice(index, 1);

  localStorage.setItem("eventPresets", JSON.stringify(eventPresets));

  renderPresetButtons();
  renderPresetEditor();

  showToast("イベントプリセットを削除しました");
}

function readPresetEditorValues() {
  const rows = document.querySelectorAll(".preset-edit-row");

  eventPresets = Array.from(rows).map(row => {
    const inputs = row.querySelectorAll("input");

    return {
      label: inputs[0].value.trim(),
      text: inputs[1].value.trim()
    };
  }).filter(preset => preset.label && preset.text);
}

function saveEventPresets(showMessage = true) {
  readPresetEditorValues();

  localStorage.setItem("eventPresets", JSON.stringify(eventPresets));

  renderPresetButtons();
  renderPresetEditor();

  if (showMessage) {
    showToast("イベントプリセットを保存しました");
  }
}

function clearTodayEvents() {
  document.getElementById("todayEvents").value = "";
  generateNotice();
  showToast("今日の予定をクリアしました");
}

function initSpecialPresets() {
  const savedText = localStorage.getItem("specialPresets");

  if (savedText) {
    try {
      specialPresets = JSON.parse(savedText);
    } catch (e) {
      specialPresets = structuredClone(defaultSpecialPresets);
    }
  } else {
    specialPresets = structuredClone(defaultSpecialPresets);
  }

  renderSpecialPresetButtons();
  renderSpecialPresetEditor();
}

function renderSpecialPresetButtons() {
  const box = document.getElementById("specialPresetButtons");
  box.innerHTML = "";

  specialPresets.forEach(preset => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = preset.label;
    button.addEventListener("click", () => {
      addSpecialPreset(preset.text);
    });
    box.appendChild(button);
  });
}

function renderSpecialPresetEditor() {
  const editor = document.getElementById("specialPresetEditor");
  editor.innerHTML = "";

  specialPresets.forEach((preset, index) => {
    const row = document.createElement("div");
    row.className = "preset-edit-row";

    const labelInput = document.createElement("input");
    labelInput.value = preset.label;
    labelInput.placeholder = "表示名";

    const textInput = document.createElement("textarea");
    textInput.value = preset.text;
    textInput.placeholder = "挿入内容";
    textInput.rows = 4;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "danger";
    deleteButton.textContent = "削除";

    deleteButton.addEventListener("click", () => {
      deleteSpecialPresetRow(index);
    });

    row.appendChild(labelInput);
    row.appendChild(textInput);
    row.appendChild(deleteButton);

    editor.appendChild(row);
  });
}

function addSpecialPreset(text) {
  const area = document.getElementById("specialNotice");
  const current = area.value.trim();

  area.value = current ? `${current}\n${text}` : text;
  generateNotice();
}

function clearSpecialNotice() {
  document.getElementById("specialNotice").value = "";
  generateNotice();
  showToast("特記事項をクリアしました");
}

function addSpecialPresetRow() {
  readSpecialPresetEditorValues();

  specialPresets.push({
    label: "新規",
    text: "⚫︎"
  });

  renderSpecialPresetEditor();
}

function deleteSpecialPresetRow(index) {
  specialPresets.splice(index, 1);

  localStorage.setItem("specialPresets", JSON.stringify(specialPresets));

  renderSpecialPresetButtons();
  renderSpecialPresetEditor();

  showToast("特記事項プリセットを削除しました");
}

function readSpecialPresetEditorValues() {
  const rows = document.querySelectorAll("#specialPresetEditor .preset-edit-row");

  specialPresets = Array.from(rows).map(row => {
    const inputs = row.querySelectorAll("input");

    return {
      label: inputs[0].value.trim(),
      text: inputs[1].value.trim()
    };
  }).filter(preset => preset.label && preset.text);
}

function saveSpecialPresets() {
  readSpecialPresetEditorValues();

  localStorage.setItem("specialPresets", JSON.stringify(specialPresets));

  renderSpecialPresetButtons();
  renderSpecialPresetEditor();

  showToast("特記事項プリセットを保存しました");
}

function updateCharCount(text) {
  const count = text.length;
  const charCount = document.getElementById("charCount");

  charCount.textContent = `${count} / 300文字`;

  if (count > 300) {
    charCount.classList.add("over");

    const over = count - 300;
    charCount.textContent += `（${over}文字オーバー）`;
  } else {
    charCount.classList.remove("over");
  }
}
