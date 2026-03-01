const form = document.getElementById('entryForm');
const timeline = document.getElementById('timeline');
const entryCount = document.getElementById('entryCount');
const statsEl = document.getElementById('stats');
const exportBtn = document.getElementById('exportBtn');
const exportDialog = document.getElementById('exportDialog');
const exportPayload = document.getElementById('exportPayload');
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const entries = [];

function createEntry(data) {
  const timestamp = new Date().toLocaleString(undefined, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
  return { id: crypto.randomUUID(), timestamp, ...data };
}

function renderTimeline() {
  timeline.innerHTML = '';
  entries.slice().reverse().forEach((entry) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="meta">${entry.person} ↔ ${entry.artifact} · ${entry.principle}</div>
      <h3>${entry.tags.join(' · ') || 'untagged'}</h3>
      <p>${entry.narrative}</p>
      <small class="meta">Recorded ${entry.timestamp}</small>
    `;
    timeline.appendChild(li);
  });
  entryCount.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
}

function summarize() {
  const people = new Set(entries.map((e) => e.person));
  const artifacts = new Set(entries.map((e) => e.artifact));
  const principles = new Set(entries.map((e) => e.principle));

  statsEl.innerHTML = `
    <div>${people.size} people linked</div>
    <div>${artifacts.size} artifacts referenced</div>
    <div>${principles.size} principles invoked</div>
  `;
}

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (entries.length === 0) {
    ctx.fillStyle = '#ffffff22';
    ctx.font = '14px Space Grotesk';
    ctx.fillText('Add entries to see the weave', 110, canvas.height / 2);
    return;
  }
  const center = { x: canvas.width / 2, y: canvas.height / 2 };
  const radius = Math.min(canvas.width, canvas.height) / 2 - 40;
  const nodes = [];

  entries.forEach((entry, index) => {
    const angle = (index / entries.length) * Math.PI * 2;
    nodes.push({
      label: `${entry.person} ↔ ${entry.artifact}`,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      color: entryColor(entry.principle),
    });
  });

  ctx.strokeStyle = '#ffffff15';
  ctx.lineWidth = 1;
  nodes.forEach((node) => {
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(node.x, node.y);
    ctx.stroke();
  });

  nodes.forEach((node) => {
    ctx.beginPath();
    ctx.fillStyle = node.color;
    ctx.shadowColor = node.color + '60';
    ctx.shadowBlur = 12;
    ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.fillStyle = '#f9f9ff';
  ctx.font = 'bold 18px Space Grotesk';
  ctx.textAlign = 'center';
  ctx.fillText('Context Hub', center.x, center.y);
}

function entryColor(principle) {
  const palette = ['#7df7d5', '#6ba7ff', '#ff9ed7', '#f6d06f'];
  let hash = 0;
  for (let i = 0; i < principle.length; i += 1) {
    hash = principle.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

function update() {
  renderTimeline();
  summarize();
  drawGraph();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const entry = createEntry({
    person: form.person.value.trim(),
    artifact: form.artifact.value.trim(),
    principle: form.principle.value.trim(),
    tags: form.tags.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    narrative: form.narrative.value.trim(),
  });
  entries.push(entry);
  form.reset();
  update();
});

form.addEventListener('reset', () => {
  // Delay to let native reset clear fields before potential future logic
  setTimeout(() => form.person.focus(), 0);
});

exportBtn.addEventListener('click', () => {
  if (entries.length === 0) {
    alert('Nothing to export yet.');
    return;
  }
  const payload = JSON.stringify(entries, null, 2);
  exportPayload.value = payload;
  exportDialog.showModal();
});

update();
