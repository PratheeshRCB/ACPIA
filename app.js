// CaseScan - Core Application Engine
// Global State
const state = {
  currentView: 'login', // login, dashboard, workspace
  currentUser: null,
  activeCaseId: 'case_1',
  selectedNode: null,
  selectedEdge: null,
  activeWorkspaceTab: 'graph', // graph, timeline, report
  cy: null, // cytoscape instance
  ingestionQueue: [
    {
      name: 'IMG_2901_synth.png',
      type: 'Media File',
      metadata: {
        timestamp: '2026-06-25T16:42:10Z',
        synthetic: true,
        confidence: 0.95
      }
    },
    {
      name: 'chat_log_telegram.json',
      type: 'Chat Log Transcript',
      metadata: {
        timestamp: '2026-06-28T09:12:00Z',
        extracted_phone: '+91 94441 98765'
      }
    },
    {
      name: 'profile_av.jpg',
      type: 'Avatar Image',
      metadata: {
        timestamp: '2026-07-02T11:55:30Z',
        extracted_face: 'Face Signature #118'
      }
    },
    {
      name: 'PhotoDNA_Abuse_Match.png',
      type: 'Media File',
      hash: 'pdq:known_abuse_material_12345',
      metadata: {
        timestamp: '2026-07-05T14:20:00Z'
      }
    }
  ],
  ingestionActive: false,
  ingestCurrentStep: 0,
  ingestStepsData: []
};
// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  window.CaseScanDB.init();
  checkSession();
  setupEventListeners();
  render();
});
function checkSession() {
  const savedUser = sessionStorage.getItem('casescan_user');
  if (savedUser) {
    state.currentUser = JSON.parse(savedUser);
    state.currentView = 'dashboard';
  } else {
    state.currentView = 'login';
  }
}
// --- VIEW ROUTING & RENDERING ---
function navigate(view) {
  state.currentView = view;
  state.selectedNode = null;
  state.selectedEdge = null;
  
  if (view === 'workspace') {
    state.activeWorkspaceTab = 'graph';
  }
  
  render();
}
function render() {
  // Hide all views
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-dashboard').style.display = 'none';
  document.getElementById('view-workspace').style.display = 'none';
  // Header display
  const header = document.getElementById('app-header');
  if (state.currentView === 'login') {
    header.style.display = 'none';
  } else {
    header.style.display = 'flex';
    document.getElementById('header-user-name').innerText = state.currentUser ? state.currentUser.name : '';
    document.getElementById('header-user-role').innerText = state.currentUser ? state.currentUser.role : '';
    
    // Set active tab highlight in header
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-view') === state.currentView);
    });
  }
  // Show target view
  if (state.currentView === 'login') {
    document.getElementById('view-login').style.display = 'flex';
    document.getElementById('login-error').innerText = '';
  } else if (state.currentView === 'dashboard') {
    document.getElementById('view-dashboard').style.display = 'block';
    renderDashboard();
  } else if (state.currentView === 'workspace') {
    document.getElementById('view-workspace').style.display = 'grid';
    renderWorkspace();
  }
}
// --- EVENT LISTENERS ---
function setupEventListeners() {
  // Login Form
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const loginError = document.getElementById('login-error');
    const users = window.CaseScanDB.get('users');
    const matchedUser = users.find(u => u.username === username && u.passwordHash === password);
    if (matchedUser) {
      state.currentUser = matchedUser;
      sessionStorage.setItem('casescan_user', JSON.stringify(matchedUser));
      navigate('dashboard');
    } else {
      loginError.innerText = "Invalid credentials. Hint: keralapolice / cybercell2026";
    }
  });
  // Logout Button
  document.getElementById('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem('casescan_user');
    state.currentUser = null;
    navigate('login');
  });
  // Header Navigation Tab Clicks
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      navigate(tab.getAttribute('data-view'));
    });
  });
  // Workspace subtab selection
  document.querySelectorAll('.w-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetTab = e.currentTarget.getAttribute('data-tab');
      state.activeWorkspaceTab = targetTab;
      
      // Update UI tabs active class
      document.querySelectorAll('.w-tab').forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === targetTab));
      
      // Render layout area
      renderWorkspaceTab();
    });
  });
  // Ingestion Modal Trigger
  document.getElementById('btn-open-ingest').addEventListener('click', () => {
    openIngestionModal();
  });
  // Close Ingestion Modal
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('modal-ingestion').style.display = 'none';
    if (state.currentView === 'workspace') {
      renderWorkspace();
    } else {
      renderDashboard();
    }
  });
  // Reset database simulation button
  document.getElementById('btn-reset-db').addEventListener('click', () => {
    if (confirm("Reset local database to initial forensic demo seed data?")) {
      window.CaseScanDB.reset();
      render();
    }
  });
}
// --- DASHBOARD CONTROLLER ---
function renderDashboard() {
  const cases = window.CaseScanDB.get('cases');
  const nodes = window.CaseScanDB.get('nodes');
  const timeline = window.CaseScanDB.get('timeline_events');
  const evidence = window.CaseScanDB.get('evidence');
  // Stats calculation
  const confirmedNodesCount = nodes.filter(n => n.status === 'confirmed').length;
  const proposedNodesCount = nodes.filter(n => n.status === 'proposed').length;
  const syntheticFilesCount = nodes.filter(n => n.type === 'File' && n.details.synthetic).length;
  const totalEvidenceCount = evidence.length;
  document.getElementById('stat-evidence').innerText = totalEvidenceCount;
  document.getElementById('stat-nodes-confirmed').innerText = confirmedNodesCount;
  document.getElementById('stat-nodes-proposed').innerText = proposedNodesCount;
  document.getElementById('stat-synthetic').innerText = syntheticFilesCount;
  // Render Cases List
  const casesContainer = document.getElementById('dashboard-cases-list');
  casesContainer.innerHTML = '';
  if (cases.length === 0) {
    casesContainer.innerHTML = `<div style="padding: 20px; color: var(--text-muted);">No cases cataloged.</div>`;
  } else {
    cases.forEach(c => {
      const card = document.createElement('div');
      card.className = 'glass-panel case-card';
      card.innerHTML = `
        <div class="case-info-main">
          <span class="case-num">${c.caseNumber}</span>
          <h4 class="case-title">${c.title}</h4>
          <p class="case-desc">${c.description}</p>
        </div>
        <div class="case-meta">
          <span>Target: <strong>${c.suspect.name}</strong></span>
          <span class="tag tag-active">${c.status}</span>
        </div>
      `;
      card.addEventListener('click', () => {
        state.activeCaseId = c.id;
        navigate('workspace');
      });
      casesContainer.appendChild(card);
    });
  }
  // Render Alert List (Proposed nodes that need review)
  const alertsContainer = document.getElementById('dashboard-alerts-list');
  alertsContainer.innerHTML = '';
  const proposedNodes = nodes.filter(n => n.status === 'proposed');
  if (proposedNodes.length === 0) {
    alertsContainer.innerHTML = `
      <div style="padding: 15px; color: var(--text-muted); text-align: center; font-size: 13px;">
        All AI-proposed links and elements resolved.
      </div>`;
  } else {
    proposedNodes.forEach(n => {
      const alertItem = document.createElement('div');
      const isCritical = n.type === 'Identity' || n.type === 'File';
      alertItem.className = `alert-item ${isCritical ? 'danger' : 'warning'}`;
      
      let icon = 'alert-triangle';
      let title = `Proposed Link: ${n.label}`;
      let desc = n.details.reason || 'AI generated linkage hypothesis requires investigator confirmation.';
      if (n.type === 'Identity') {
        icon = 'user-check';
        title = `Face Signature Correlated`;
      } else if (n.type === 'Account') {
        icon = 'link-2';
        title = `Proposed Operation Account`;
      }
      alertItem.innerHTML = `
        <div class="alert-icon">
          <i data-lucide="${icon}"></i>
        </div>
        <div>
          <h5 class="alert-title">${title}</h5>
          <p class="alert-desc">${desc}</p>
        </div>
      `;
      alertsContainer.appendChild(alertItem);
    });
    lucide.createIcons();
  }
}
// --- WORKSPACE CONTROLLER ---
function renderWorkspace() {
  // Render main subtab contents
  renderWorkspaceTab();
}
function renderWorkspaceTab() {
  const graphArea = document.getElementById('workspace-graph-area');
  const timelineArea = document.getElementById('workspace-timeline-area');
  const reportArea = document.getElementById('workspace-report-area');
  // Hide all panels
  graphArea.style.display = 'none';
  timelineArea.style.display = 'none';
  reportArea.style.display = 'none';
  if (state.activeWorkspaceTab === 'graph') {
    graphArea.style.display = 'block';
    initCytoscape();
  } else if (state.activeWorkspaceTab === 'timeline') {
    timelineArea.style.display = 'block';
    renderTimeline();
  } else if (state.activeWorkspaceTab === 'report') {
    reportArea.style.display = 'block';
    renderReport();
  }
  // Render node drawer inspector
  renderInspector();
}
// Cytoscape initialization and graph mapping
function initCytoscape() {
  const nodesData = window.CaseScanDB.get('nodes');
  const edgesData = window.CaseScanDB.get('edges');
  // Map database elements to Cytoscape formatting
  const cyElements = [];
  nodesData.forEach(n => {
    cyElements.push({
      data: {
        id: n.id,
        label: n.label,
        type: n.type,
        status: n.status,
        details: n.details
      }
    });
  });
  edgesData.forEach(e => {
    cyElements.push({
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        status: e.status
      }
    });
  });
  // Cytoscape instance creation
  state.cy = cytoscape({
    container: document.getElementById('cy'),
    elements: cyElements,
    style: [
      {
        selector: 'node',
        style: {
          'content': 'data(label)',
          'color': '#f3f4f6',
          'font-family': 'Outfit',
          'font-size': '11px',
          'text-valign': 'bottom',
          'text-margin-y': '6px',
          'width': '34px',
          'height': '34px',
          'background-fit': 'contain',
          'border-width': '2px',
          'transition-property': 'background-color, border-color, width, height',
          'transition-duration': '0.2s'
        }
      },
      {
        selector: 'node[type="Suspect"]',
        style: {
          'shape': 'hexagon',
          'background-color': '#ef4444',
          'border-color': '#ef4444',
          'width': '46px',
          'height': '46px',
          'font-weight': 'bold',
          'text-margin-y': '8px'
        }
      },
      {
        selector: 'node[type="Device"]',
        style: {
          'shape': 'ellipse',
          'background-color': '#3b82f6',
          'border-color': '#3b82f6'
        }
      },
      {
        selector: 'node[type="File"]',
        style: {
          'shape': 'rectangle',
          'background-color': '#00f0ff',
          'border-color': '#00f0ff'
        }
      },
      {
        selector: 'node[type="Identity"]',
        style: {
          'shape': 'hexagon',
          'background-color': '#a855f7',
          'border-color': '#a855f7'
        }
      },
      {
        selector: 'node[type="Location"]',
        style: {
          'shape': 'rhombus',
          'background-color': '#f59e0b',
          'border-color': '#f59e0b'
        }
      },
      {
        selector: 'node[type="Account"]',
        style: {
          'shape': 'octagon',
          'background-color': '#10b981',
          'border-color': '#10b981'
        }
      },
      // Status formatting (Proposed vs Confirmed)
      {
        selector: 'node[status="proposed"]',
        style: {
          'border-style': 'dashed',
          'border-color': '#f59e0b',
          'border-width': '2.5px',
          'background-opacity': '0.45'
        }
      },
      // Edges styling
      {
        selector: 'edge',
        style: {
          'width': 2.5,
          'line-color': 'rgba(0, 240, 255, 0.25)',
          'target-arrow-color': 'rgba(0, 240, 255, 0.25)',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': '8px',
          'color': '#9ca3af',
          'text-rotation': 'autorotate',
          'text-margin-y': '-10px',
          'font-family': 'JetBrains Mono'
        }
      },
      {
        selector: 'edge[status="proposed"]',
        style: {
          'line-style': 'dashed',
          'line-color': '#f59e0b',
          'target-arrow-color': '#f59e0b',
          'width': 2
        }
      },
      // Selection highlight
      {
        selector: 'node:selected',
        style: {
          'border-color': '#00f0ff',
          'border-width': '3px',
          'box-shadow': '0 0 15px #00f0ff'
        }
      }
    ],
    layout: {
      name: 'cose',
      animate: true,
      idealEdgeLength: 100,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    }
  });
  // Setup click triggers on cytoscape canvas
  state.cy.on('tap', 'node', (e) => {
    const node = e.target.data();
    state.selectedNode = node;
    state.selectedEdge = null;
    renderInspector();
  });
  state.cy.on('tap', 'edge', (e) => {
    const edge = e.target.data();
    state.selectedEdge = edge;
    state.selectedNode = null;
    renderInspector();
  });
  state.cy.on('tap', (e) => {
    if (e.target === state.cy) {
      state.selectedNode = null;
      state.selectedEdge = null;
      renderInspector();
    }
  });
  // Zoom/fit tool buttons in toolbar
  document.getElementById('btn-zoom-in').onclick = () => state.cy.zoom(state.cy.zoom() + 0.1);
  document.getElementById('btn-zoom-out').onclick = () => state.cy.zoom(state.cy.zoom() - 0.1);
  document.getElementById('btn-zoom-fit').onclick = () => state.cy.fit();
}
// Node and Edge Inspector Drawer
function renderInspector() {
  const inspector = document.getElementById('inspector-content');
  inspector.innerHTML = '';
  if (!state.selectedNode && !state.selectedEdge) {
    // Show active case info by default
    const cases = window.CaseScanDB.get('cases');
    const activeCase = cases.find(c => c.id === state.activeCaseId);
    if (activeCase) {
      inspector.innerHTML = `
        <div class="inspector-header">
          <span class="inspector-type">ACTIVE CASE RECORD</span>
          <h3 class="inspector-title" style="margin-top: 4px;">${activeCase.title}</h3>
        </div>
        <div class="meta-grid">
          <div class="meta-row">
            <span class="meta-lbl">Case No</span>
            <span class="meta-val">${activeCase.caseNumber}</span>
          </div>
          <div class="meta-row">
            <span class="meta-lbl">Target Suspect</span>
            <span class="meta-val">${activeCase.suspect.name}</span>
          </div>
          <div class="meta-row">
            <span class="meta-lbl">Alias</span>
            <span class="meta-val">${activeCase.suspect.alias}</span>
          </div>
          <div class="meta-row">
            <span class="meta-lbl">Age</span>
            <span class="meta-val">${activeCase.suspect.age}</span>
          </div>
          <div class="meta-row">
            <span class="meta-lbl">Status</span>
            <span class="meta-val">${activeCase.suspect.status}</span>
          </div>
        </div>
        <div class="ai-alert-box" style="margin-top: 15px;">
          <div class="ai-alert-header">
            <i data-lucide="shield-alert" style="width: 16px; height: 16px;"></i>
            <span>Cyber Patrol Operations Manual</span>
          </div>
          <p style="font-size:12px; color:var(--text-secondary); line-height: 1.4;">
            All AI-proposed links (dashed nodes/edges) represent statistical leads generated by the Agent Core. Under Kerala Cyber Police SOP, all leads must be human-confirmed before inclusion in the judicial charge-sheet evidence file.
          </p>
        </div>
      `;
      lucide.createIcons();
    }
    return;
  }
  // Inspecting a Node
  if (state.selectedNode) {
    const node = state.selectedNode;
    
    let detailRows = '';
    Object.keys(node.details).forEach(key => {
      if (key === 'reason') return; // rendered separately in AI proposal card
      detailRows += `
        <div class="meta-row">
          <span class="meta-lbl" style="text-transform: capitalize;">${key.replace('_', ' ')}</span>
          <span class="meta-val">${node.details[key]}</span>
        </div>
      `;
    });
    let actionPanel = '';
    let proposalAlert = '';
    if (node.status === 'proposed') {
      proposalAlert = `
        <div class="ai-alert-box ${node.details.synthetic ? 'danger' : ''}">
          <div class="ai-alert-header">
            <i data-lucide="cpu" style="width:16px; height:16px;"></i>
            <span>AI Evidence Lead Hypothesis</span>
          </div>
          <p style="font-size:12px; color:var(--text-secondary); line-height: 1.4;">
            <strong>Correlation Rationale:</strong> ${node.details.reason || 'Automatically extracted and grouped via multi-source token pattern match.'}
          </p>
        </div>
      `;
      actionPanel = `
        <div class="inspector-actions">
          <button class="btn-action confirm" id="btn-node-confirm">Confirm Link</button>
          <button class="btn-action reject" id="btn-node-reject">Dismiss Lead</button>
        </div>
      `;
    }
    inspector.innerHTML = `
      <div class="inspector-header">
        <span class="inspector-type">${node.type} Node Info</span>
        <h3 class="inspector-title">${node.label}</h3>
        <span class="tag ${node.status === 'confirmed' ? 'tag-active' : 'tag-proposed'}" style="margin-top: 8px; display: inline-block;">
          ${node.status.toUpperCase()}
        </span>
      </div>
      <div class="meta-grid">
        ${detailRows}
      </div>
      ${proposalAlert}
      ${actionPanel}
    `;
    lucide.createIcons();
    // Wire up buttons
    if (node.status === 'proposed') {
      document.getElementById('btn-node-confirm').onclick = () => {
        window.CaseScanDB.confirmNode(node.id);
        state.selectedNode = null;
        renderWorkspace();
      };
      document.getElementById('btn-node-reject').onclick = () => {
        window.CaseScanDB.rejectNode(node.id);
        state.selectedNode = null;
        renderWorkspace();
      };
    }
  }
  // Inspecting an Edge
  if (state.selectedEdge) {
    const edge = state.selectedEdge;
    
    let proposalAlert = '';
    let actionPanel = '';
    if (edge.status === 'proposed') {
      proposalAlert = `
        <div class="ai-alert-box">
          <div class="ai-alert-header">
            <i data-lucide="cpu" style="width:16px; height:16px;"></i>
            <span>AI Suggested Relationship</span>
          </div>
          <p style="font-size:12px; color:var(--text-secondary); line-height: 1.4;">
            <strong>Reasoning:</strong> ${edge.reason || 'Correlation agent correlated identical data keys across both entities.'}
          </p>
        </div>
      `;
      actionPanel = `
        <div class="inspector-actions">
          <button class="btn-action confirm" id="btn-edge-confirm">Confirm Edge</button>
          <button class="btn-action reject" id="btn-edge-reject">Dismiss Edge</button>
        </div>
      `;
    }
    inspector.innerHTML = `
      <div class="inspector-header">
        <span class="inspector-type">Relationship Edge</span>
        <h3 class="inspector-title">${edge.source} &rarr; ${edge.target}</h3>
        <p style="font-size: 13px; color: var(--accent-cyan); margin-top: 4px;">Role: ${edge.label}</p>
        <span class="tag ${edge.status === 'confirmed' ? 'tag-active' : 'tag-proposed'}" style="margin-top: 8px; display: inline-block;">
          ${edge.status.toUpperCase()}
        </span>
      </div>
      ${proposalAlert}
      ${actionPanel}
    `;
    lucide.createIcons();
    // Wire up buttons
    if (edge.status === 'proposed') {
      document.getElementById('btn-edge-confirm').onclick = () => {
        window.CaseScanDB.confirmEdge(edge.id);
        state.selectedEdge = null;
        renderWorkspace();
      };
      document.getElementById('btn-edge-reject').onclick = () => {
        window.CaseScanDB.rejectEdge(edge.id);
        state.selectedEdge = null;
        renderWorkspace();
      };
    }
  }
}
// --- TIMELINE CONTROLLER ---
function renderTimeline() {
  const events = window.CaseScanDB.get('timeline_events');
  const container = document.getElementById('timeline-list');
  container.innerHTML = '';
  const caseEvents = events.filter(e => e.caseId === state.activeCaseId);
  caseEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  if (caseEvents.length === 0) {
    container.innerHTML = `<div style="padding:20px; color:var(--text-muted);">No timeline logs present.</div>`;
    return;
  }
  caseEvents.forEach(ev => {
    const card = document.createElement('div');
    card.className = 'glass-panel timeline-event-card';
    
    let severityClass = 'info';
    if (ev.severity === 'danger' || ev.severity === 'critical') severityClass = 'danger';
    else if (ev.severity === 'warning') severityClass = 'warning';
    card.innerHTML = `
      <div class="timeline-dot ${severityClass}"></div>
      <div class="timeline-time">${new Date(ev.timestamp).toLocaleString()}</div>
      <h4 class="timeline-title">${ev.title}</h4>
      <p class="timeline-desc">${ev.description}</p>
    `;
    container.appendChild(card);
  });
}
// --- REPORT CONTROLLER ---
function renderReport() {
  const reports = window.CaseScanDB.get('case_reports');
  const activeReport = reports.find(r => r.caseId === state.activeCaseId);
  const reportContainer = document.getElementById('report-container');
  reportContainer.innerHTML = '';
  if (!activeReport) {
    reportContainer.innerHTML = `<div style="padding:20px; color:var(--text-muted);">Report has not been drafted.</div>`;
    return;
  }
  reportContainer.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
      <h3 style="font-family:var(--font-title); font-size:22px;">${activeReport.title}</h3>
      <div style="display:flex; gap:10px;">
        <button class="btn-primary" id="btn-save-report" style="padding: 8px 15px; font-size: 13px; width: auto; box-shadow: none;">
          <i data-lucide="save" style="width: 16px; height: 16px;"></i> Save Report
        </button>
        <button class="btn-icon" id="btn-copy-report" title="Copy Markdown to Clipboard" style="padding: 10px;">
          <i data-lucide="clipboard" style="width: 16px; height: 16px;"></i>
        </button>
      </div>
    </div>
    <textarea class="report-editor" id="report-text">${activeReport.content}</textarea>
    <div style="font-size:11px; color:var(--text-muted); margin-top: 10px; font-family:var(--font-mono)">
      Generated: ${new Date(activeReport.generatedAt).toLocaleString()} | Status: ${activeReport.status}
    </div>
  `;
  lucide.createIcons();
  // Save report change handler
  document.getElementById('btn-save-report').onclick = () => {
    const text = document.getElementById('report-text').value;
    window.CaseScanDB.updateReport(state.activeCaseId, text);
    alert("Report updated successfully in Local Database.");
  };
  // Clipboard copy handler
  document.getElementById('btn-copy-report').onclick = () => {
    const text = document.getElementById('report-text').value;
    navigator.clipboard.writeText(text);
    alert("Case report text copied to clipboard.");
  };
}
// --- INGESTION MODAL CONTROLLER ---
function openIngestionModal() {
  const modal = document.getElementById('modal-ingestion');
  modal.style.display = 'flex';
  const selectContainer = document.getElementById('ingest-select-container');
  const progressContainer = document.getElementById('ingest-progress-container');
  // Reset progress displays
  selectContainer.style.display = 'block';
  progressContainer.style.display = 'none';
  // Render items in queue
  const queueList = document.getElementById('ingest-queue-list');
  queueList.innerHTML = '';
  state.ingestionQueue.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'glass-panel step-row';
    item.style.cursor = 'pointer';
    item.style.marginBottom = '8px';
    
    let typeIcon = 'file-text';
    if (file.name.endsWith('.png') || file.name.endsWith('.jpg')) typeIcon = 'image';
    item.innerHTML = `
      <div style="color:var(--accent-cyan); margin-top: 3px;">
        <i data-lucide="${typeIcon}"></i>
      </div>
      <div style="flex:1;">
        <div style="font-size: 14px; font-weight:600;">${file.name}</div>
        <div style="font-size: 11px; color:var(--text-secondary);">${file.type}</div>
      </div>
      <button class="btn-primary" style="width: auto; padding: 6px 12px; font-size:12px; box-shadow: none;">
        Process File
      </button>
    `;
    item.addEventListener('click', () => {
      triggerFileIngestion(file, index);
    });
    queueList.appendChild(item);
  });
  lucide.createIcons();
}
function triggerFileIngestion(file, index) {
  const selectContainer = document.getElementById('ingest-select-container');
  const progressContainer = document.getElementById('ingest-progress-container');
  selectContainer.style.display = 'none';
  progressContainer.style.display = 'block';
  // Populate stepper display
  const stepper = document.getElementById('ingest-stepper');
  stepper.innerHTML = `
    <div class="step-row" id="step-row-1">
      <div class="step-icon-wrapper loading" id="step-icon-1"><i data-lucide="loader"></i></div>
      <div>
        <div class="step-name">1. Known-Content Hashing (PhotoDNA/PDQ)</div>
        <div class="step-desc" id="step-desc-1">Awaiting hash generation...</div>
      </div>
    </div>
    <div class="step-row" id="step-row-2">
      <div class="step-icon-wrapper pending" id="step-icon-2"><i data-lucide="circle"></i></div>
      <div>
        <div class="step-name">2. Classifier Agent</div>
        <div class="step-desc" id="step-desc-2">Pending check...</div>
      </div>
    </div>
    <div class="step-row" id="step-row-3">
      <div class="step-icon-wrapper pending" id="step-icon-3"><i data-lucide="circle"></i></div>
      <div>
        <div class="step-name">3. Correlation Agent</div>
        <div class="step-desc" id="step-desc-3">Pending correlation scan...</div>
      </div>
    </div>
    <div class="step-row" id="step-row-4">
      <div class="step-icon-wrapper pending" id="step-icon-4"><i data-lucide="circle"></i></div>
      <div>
        <div class="step-name">4. Timeline Agent</div>
        <div class="step-desc" id="step-desc-4">Pending temporal sorting...</div>
      </div>
    </div>
    <div class="step-row" id="step-row-5">
      <div class="step-icon-wrapper pending" id="step-icon-5"><i data-lucide="circle"></i></div>
      <div>
        <div class="step-name">5. Synthetic-Media Agent</div>
        <div class="step-desc" id="step-desc-5">Pending deepfake neural mapping...</div>
      </div>
    </div>
    <div class="step-row" id="step-row-6">
      <div class="step-icon-wrapper pending" id="step-icon-6"><i data-lucide="circle"></i></div>
      <div>
        <div class="step-name">6. Report Agent (LLM Summarization)</div>
        <div class="step-desc" id="step-desc-6">Pending summary compilation...</div>
      </div>
    </div>
  `;
  lucide.createIcons();
  // Run database agent core simulation with status callback updates
  window.CaseScanDB.runIngestion(state.activeCaseId, file, (stepNum, stepData) => {
    updateStepUI(stepNum, stepData);
    
    // Once last step completes, enable Close and remove from queue
    if (stepNum === 6) {
      state.ingestionQueue.splice(index, 1);
    }
  });
}
function updateStepUI(stepNum, stepData) {
  const row = document.getElementById(`step-row-${stepNum}`);
  const iconWrapper = document.getElementById(`step-icon-${stepNum}`);
  const desc = document.getElementById(`step-desc-${stepNum}`);
  // Highlight step row active
  document.querySelectorAll('.step-row').forEach(r => r.classList.remove('active'));
  row.classList.add('active');
  // Set status details
  desc.innerText = stepData.message + " — " + stepData.details;
  if (stepData.status === 'success') {
    iconWrapper.className = 'step-icon-wrapper success';
    iconWrapper.innerHTML = `<i data-lucide="check-circle"></i>`;
  } else if (stepData.status === 'danger') {
    iconWrapper.className = 'step-icon-wrapper danger';
    iconWrapper.innerHTML = `<i data-lucide="alert-octagon"></i>`;
    row.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    row.style.background = 'rgba(239, 68, 68, 0.04)';
  } else if (stepData.status === 'triaged') {
    iconWrapper.className = 'step-icon-wrapper danger';
    iconWrapper.innerHTML = `<i data-lucide="shield-alert"></i>`;
    row.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    row.style.background = 'rgba(239, 68, 68, 0.06)';
  }
  // Trigger loading state for NEXT step if not last
  if (stepNum < 6) {
    const nextStepNum = stepNum + 1;
    const nextRow = document.getElementById(`step-row-${nextStepNum}`);
    const nextIconWrapper = document.getElementById(`step-icon-${nextStepNum}`);
    const nextDesc = document.getElementById(`step-desc-${nextStepNum}`);
    
    nextRow.classList.add('active');
    nextIconWrapper.className = 'step-icon-wrapper loading';
    nextIconWrapper.innerHTML = `<i data-lucide="loader"></i>`;
    nextDesc.innerText = 'Analyzing stream...';
  }
  lucide.createIcons();
}
