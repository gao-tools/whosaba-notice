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

let templates = JSON.parse(localStorage.getItem("weeklyTemplates")) || defaultTemplates;

function loadWeeklyTemplate() {
  const key = document.getElementById("weeklyTemplate").value;
  const template = templates[key];
  const editor = document.getElementById("weeklyEditor");

  editor.innerHTML = "";

  days.forEach(day => {
    const row = document.createElement("div");
    row.className = "week-row";

    row.innerHTML = `
      <div class="week-day">${day}</div>
      <input id="buff-${day}" value="${template.days[day].buff}" />
      <input id="event-${day}" value="${template.days[day].event}" />
    `;

    editor.appendChild(row);
  });
}

function saveWeeklyTemplate() {
  const key = document.getElementById("weeklyTemplate").value;

  days.forEach(day => {
    templates[key].days[day].buff = document.getElementById(`buff-${day}`).value;
    templates[key].days[day].event = document.getElementById(`event-${day}`).value;
  });

  localStorage.setItem("weeklyTemplates", JSON.stringify(templates));
  alert("週間テンプレを保存しました");
}

function saveSettings() {
  const settings = {
    greeting: document.getElementById("greeting").value,
    intro: document.getElementById("intro").value,
    footer: document.getElementById("footer").value
  };

  localStorage.setItem("fixedSettings", JSON.stringify(settings));
  alert("固定文言を保存しました");
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem("fixedSettings"));
  if (!settings) return;

  document.getElementById("greeting").value = settings.greeting;
  document.getElementById("intro").value = settings.intro;
  document.getElementById("footer").value = settings.footer;
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
  const template = templates[key];

  const weeklyText = days.map(day => {
    const buff = template.days[day].buff;
    const event = template.days[day].event;
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

function copyResult() {
  const result = document.getElementById("result");
  result.select();
  document.execCommand("copy");
  alert("コピーしました");
}

loadSettings();
loadWeeklyTemplate();