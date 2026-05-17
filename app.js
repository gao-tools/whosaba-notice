const days = ["月", "火", "水", "木", "金", "土", "日"];

const defaultTemplates = {
  normal: {
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
  svsPrepare: {
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
  svsBattle: {
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
};

const defaultEventPresets = [
  { label: "熊", text: "①21:00〜 熊【live】" },
  { label: "兵器", text: "①21:00〜 兵器【live】" },
  { label: "峡谷", text: "①20:00〜 峡谷" },
  { label: "SVS", text: "①20:00〜 SVS" },
  { label: "砦", text: "①砦要塞" }
];

let eventPresets = [];

let templates = structuredClone(defaultTemplates);

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
    templates = mergeTemplates(saved);
  } catch (e) {
    templates = structuredClone(defaultTemplates);
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

  const savedStart = localStorage.getItem("migrationStartDate");
  if (savedStart) {
    document.getElementById("migrationStartDate").value = savedStart;
    calcMigrationDay();
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
}

function calcMigrationDay() {
  const start = document.getElementById("migrationStartDate").value;
  if (!start) return;

  localStorage.setItem("migrationStartDate", start);

  const startDate = new Date(start + "T00:00:00");
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diff = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  if (diff > 0) {
    document.getElementById("migrationDay").value = diff;
    generateNotice();
  }
}

function loadWeeklyTemplate() {
  const key = document.getElementById("weeklyTemplate").value;
  const template = templates[key] || templates.normal;
  const editor = document.getElementById("weeklyEditor");
  const today = getTodayInfo().dayLabel;

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

  days.forEach(day => {
    templates[key].days[day].buff = document.getElementById(`buff-${day}`).value;
    templates[key].days[day].event = document.getElementById(`event-${day}`).value;
  });

  localStorage.setItem("weeklyTemplates", JSON.stringify(templates));
  showToast("週間テンプレを保存しました");
  generateNotice();
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
  const current = area.value.trim();

  area.value = current ? `${current}\n${text}` : text;
  generateNotice();
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
  const template = templates[key] || templates.normal;

  const weeklyText = days.map(day => {
    const buff = document.getElementById(`buff-${day}`)?.value || template.days[day].buff;
    const event = document.getElementById(`event-${day}`)?.value || template.days[day].event;
    return `${day}-◎${buff}-${event}`;
  }).join("\n");

  const text = `GaO新聞 ${date}
＝＝＝＝＝＝＝
【移民${migrationDay}日目】
${greeting}
${intro}
${todayEvents}

${specialNotice}


【定時発動イベ】
${weeklyText}
◎執バフ予定

${footer}`;

  document.getElementById("result").value = text;
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
  loadSettings();
  initTodayFields();
  loadWeeklyTemplate();

  document.getElementById("migrationStartDate").addEventListener("change", calcMigrationDay);
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
  try {
    eventPresets = JSON.parse(localStorage.getItem("eventPresets")) || defaultEventPresets;
  } catch (e) {
    eventPresets = defaultEventPresets;
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
    button.onclick = () => addEventPreset(preset.text);
    box.appendChild(button);
  });
}

function renderPresetEditor() {
  const editor = document.getElementById("presetEditor");
  editor.innerHTML = "";

  eventPresets.forEach((preset, index) => {
    const row = document.createElement("div");
    row.className = "preset-edit-row";

    row.innerHTML = `
      <input id="preset-label-${index}" value="${preset.label}" placeholder="表示名" />
      <input id="preset-text-${index}" value="${preset.text}" placeholder="挿入内容" />
      <button type="button" class="danger" onclick="deletePresetRow(${index})">削除</button>
    `;

    editor.appendChild(row);
  });
}

function addPresetRow() {
  eventPresets.push({ label: "新規", text: "①" });
  renderPresetEditor();
}

function deletePresetRow(index) {
  eventPresets.splice(index, 1);
  renderPresetEditor();
  renderPresetButtons();
}

function saveEventPresets() {
  eventPresets = eventPresets.map((preset, index) => ({
    label: document.getElementById(`preset-label-${index}`).value,
    text: document.getElementById(`preset-text-${index}`).value
  })).filter(preset => preset.label.trim() && preset.text.trim());

  localStorage.setItem("eventPresets", JSON.stringify(eventPresets));
  renderPresetButtons();
  renderPresetEditor();
  showToast("イベントプリセットを保存しました");
}

function clearTodayEvents() {
  document.getElementById("todayEvents").value = "";
  generateNotice();
  showToast("今日の予定をクリアしました");
}
