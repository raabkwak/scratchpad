const form = document.getElementById('entryForm');
const timeline = document.getElementById('timeline');
const entryCount = document.getElementById('entryCount');
const statsEl = document.getElementById('stats');
const legendEl = document.getElementById('legend');
const exportBtn = document.getElementById('exportBtn');
const exportDialog = document.getElementById('exportDialog');
const exportPayload = document.getElementById('exportPayload');
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

const entries = [];

const nodeConfigs = [
  { key: 'person', label: 'People', color: '#7df7d5', accessor: (entry) => [entry.person] },
  { key: 'workspace', label: 'Workspaces', color: '#6ba7ff', accessor: (entry) => [entry.workspace] },
  { key: 'artifact', label: 'Artifacts', color: '#ff9ed7', accessor: (entry) => [entry.artifact] },
  { key: 'principle', label: 'Principles', color: '#f6d06f', accessor: (entry) => [entry.principle] },
  { key: 'asset', label: 'Assets', color: '#c99bff', accessor: (entry) => [entry.asset?.label || entry.asset?.url] },
  { key: 'event', label: 'Events', color: '#73f2ff', accessor: (entry) => [entry.eventName] },
  { key: 'thread', label: 'Threads', color: '#ffa36c', accessor: (entry) => [entry.thread] },
  { key: 'automation', label: 'Automations', color: '#9df18f', accessor: (entry) => [entry.automation] },
];

function parseCsv(value = '') {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function createEntry(data) {
  const timestamp = new Date().toLocaleString(undefined, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
  return {
    id: crypto.randomUUID(),
    timestamp,
    ...data,
    owners: data.owners ?? [],
    tags: data.tags ?? [],
    asset: data.asset ?? {},
  };
}

function buildNodeGroups() {
  const map = new Map();
  entries.forEach((entry) => {
    nodeConfigs.forEach((config) => {
      const values = config.accessor(entry).filter(Boolean);
      values.forEach((value) => {
        const key = `${config.key}:${value.toLowerCase()}`;
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            label: value,
            type: config.key,
            color: config.color,
            count: 1,
            owners: new Set(entry.owners),
            visibility: entry.visibility,
          });
        } else {
          const node = map.get(key);
          node.count += 1;
          entry.owners.forEach((owner) => node.owners.add(owner));
        }
      });
    });
  });

  return nodeConfigs.map((config) => ({
    ...config,
    nodes: Array.from(map.values()).filter((node) => node.type === config.key),
  }));
}

function renderTimeline() {
  timeline.innerHTML = '';
  entries
    .slice()
    .reverse()
    .forEach((entry) => {
      const li = document.createElement('li');
      const tagLine = entry.tags.length ? entry.tags.join(' · ') : 'untagged';
      const assetLine = entry.asset?.label || entry.asset?.url
        ? `<div class="meta-line">Asset: ${entry.asset.label || 'Unnamed'}${entry.asset.url ? ` · <a href="${entry.asset.url}" target="_blank" rel="noreferrer">open link</a>` : ''}${entry.asset.provider ? ` · ${entry.asset.provider}` : ''}${entry.asset.metadata ? ` · ${entry.asset.metadata}` : ''}</div>`
        : '';

      const contextBits = [entry.workspace, entry.eventName, entry.eventWindow, entry.thread, entry.automation]
        .filter(Boolean)
        .join(' · ');
      const contextLine = contextBits
        ? `<div class="meta-line">Context: ${contextBits}</div>`
        : '';

      const ownerLine = `<div class="meta-line">Owners: ${entry.owners.join(', ') || 'unassigned'} · Visibility: ${entry.visibility}${entry.policy ? ` · Policy: ${entry.policy}` : ''}</div>`;
      const aiLine = entry.aiHints ? `<div class="meta-line">AI hints: ${entry.aiHints}</div>` : '';

      li.innerHTML = `
        <div class="meta">${entry.person || 'Unknown person'} ↔ ${entry.artifact || 'Artifact'} · ${entry.principle || 'Principle'}</div>
        <h3>${tagLine}</h3>
        <p>${entry.narrative}</p>
        ${contextLine}
        ${assetLine}
        ${ownerLine}
        ${aiLine}
        <small class="meta">Recorded ${entry.timestamp}</small>
      `;
      timeline.appendChild(li);
    });
  entryCount.textContent = `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}`;
}

function summarize() {
  const groups = buildNodeGroups();
  const ownerSet = new Set(entries.flatMap((entry) => entry.owners));
  const assetCount = entries.filter((entry) => entry.asset?.label || entry.asset?.url).length;
  const aiHintCount = entries.filter((entry) => entry.aiHints).length;

  statsEl.innerHTML = `
    <div>${ownerSet.size} unique stewards</div>
    <div>${assetCount} assets registered</div>
    <div>${aiHintCount} AI-ready hints</div>
  `;

  legendEl.innerHTML = groups
    .filter((group) => group.nodes.length)
    .map(
      (group) => `
        <span>
          <i style="background:${group.color}"></i>
          ${group.label}: ${group.nodes.length}
        </span>
      `
    )
    .join('');
}

function drawGraph() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const groups = buildNodeGroups().filter((group) => group.nodes.length);

  if (!groups.length) {
    ctx.fillStyle = '#ffffff22';
    ctx.font = '14px Space Grotesk';
    ctx.fillText('Add entries to see the weave', 100, canvas.height / 2);
    return;
  }

  const center = { x: canvas.width / 2, y: canvas.height / 2 };
  ctx.fillStyle = '#f9f9ff';
  ctx.font = 'bold 18px Space Grotesk';
  ctx.textAlign = 'center';
  ctx.fillText('Context Hub', center.x, center.y);

  const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 30;
  const ringSpacing = maxRadius / (groups.length + 1);

  groups.forEach((group, index) => {
    const radius = ringSpacing * (index + 1);

    ctx.strokeStyle = '#ffffff18';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();

    group.nodes.forEach((node, nodeIndex) => {
      const angle = (nodeIndex / group.nodes.length) * Math.PI * 2;
      const x = center.x + Math.cos(angle) * radius;
      const y = center.y + Math.sin(angle) * radius;

      ctx.strokeStyle = '#ffffff12';
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = node.color;
      ctx.shadowColor = `${node.color}80`;
      ctx.shadowBlur = 12;
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#d5d3eb';
      ctx.font = '11px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, x, y - 14);
    });
  });
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
    workspace: form.workspace.value.trim(),
    artifact: form.artifact.value.trim(),
    principle: form.principle.value.trim(),
    eventName: form.eventName.value.trim(),
    eventWindow: form.eventWindow.value.trim(),
    thread: form.thread.value.trim(),
    automation: form.automation.value.trim(),
    asset: {
      label: form.assetLabel.value.trim(),
      url: form.assetUrl.value.trim(),
      provider: form.assetProvider.value.trim(),
      type: form.assetType.value.trim(),
      metadata: form.assetMetadata.value.trim(),
    },
    owners: parseCsv(form.owners.value),
    visibility: form.visibility.value,
    policy: form.policy.value.trim(),
    aiHints: form.aiHints.value.trim(),
    tags: parseCsv(form.tags.value),
    narrative: form.narrative.value.trim(),
  });
  entries.push(entry);
  form.reset();
  update();
});

form.addEventListener('reset', () => {
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
