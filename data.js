// CaseScan - Cyber Forensics Database Seed & Helpers
const DEFAULT_DB = {
  users: [
    {
      id: "user_1",
      username: "keralapolice",
      passwordHash: "cybercell2026",
      role: "Investigator",
      name: "Inspector Gopinath K."
    }
  ],
  cases: [
    {
      id: "case_1",
      caseNumber: "KP-2026-0812",
      title: "Operation Cyber-Shield (Deepfake Generation Network)",
      description: "Investigation into suspected distributed network generating and sharing AI-synthesized illicit materials via Telegram channels in Kochi, Kerala.",
      status: "Active",
      createdAt: "2026-07-06T10:00:00Z",
      investigatorId: "user_1",
      suspect: {
        name: "Rohan Kurian",
        alias: "Rohan K.",
        age: 28,
        status: "Under Surveillance"
      }
    }
  ],
  evidence: [
    {
      id: "ev_1",
      caseId: "case_1",
      name: "iPhone_14_Dump_Rohan.bin",
      type: "Phone Dump",
      source: "Seized iPhone 14 Pro Max",
      hash: "pdq:018f3a74de92a83f124bc57d291e0a29",
      sizeBytes: 128456000000,
      uploadedAt: "2026-07-06T11:15:00Z",
      status: "Analyzed",
      fileCount: 42
    },
    {
      id: "ev_2",
      caseId: "case_1",
      name: "Dell_Latitude_Laptop.img",
      type: "Disk Image",
      source: "Seized Laptop",
      hash: "pdq:f9a28c3104e76a1a100bc59d2911b333",
      sizeBytes: 512000000000,
      uploadedAt: "2026-07-06T12:00:00Z",
      status: "Analyzed",
      fileCount: 108
    }
  ],
  nodes: [
    { id: "suspect_rohan", label: "Rohan Kurian", type: "Suspect", status: "confirmed", details: { age: 28, address: "Kadavanthra, Kochi", phone: "+91 98450 12345" } },
    { id: "device_iphone", label: "iPhone 14 Pro Max", type: "Device", status: "confirmed", details: { os: "iOS 17.2", serial: "FK2L9081X7", imei: "359874102938475" } },
    { id: "device_laptop", label: "Dell Latitude 5430", type: "Device", status: "confirmed", details: { os: "Windows 11 Pro", serial: "B7HG91S", mac: "00:1A:2B:3C:4D:5E" } },
    { id: "account_telegram", label: "Telegram: @rohan_k", type: "Account", status: "confirmed", details: { username: "rohan_k", phone: "+91 98450 12345", platform: "Telegram" } },
    { id: "account_instagram", label: "Instagram: @rohan_kurian", type: "Account", status: "proposed", details: { username: "rohan_kurian", platform: "Instagram", reason: "Found in iPhone autofill passwords and correlated by recovery email." } },
    { id: "file_photo_1", label: "IMG_8471.jpg", type: "File", status: "confirmed", details: { format: "JPEG", size: "4.2MB", exif_make: "Apple", exif_model: "iPhone 14 Pro Max", hash_pdq: "7a8b9c1d2e3f" } },
    { id: "file_photo_2", label: "synth_img_0029.png", type: "File", status: "confirmed", details: { format: "PNG", size: "8.1MB", hash_pdq: "e1f2a3b4c5d6", synthetic: true, confidence: 0.94 } },
    { id: "loc_kochi", label: "Kadavanthra, Kochi", type: "Location", status: "confirmed", details: { lat: 9.9678, lng: 76.2995, source: "EXIF GPS in IMG_8471.jpg" } },
    { id: "identity_face_1", label: "Face Signature #049", type: "Identity", status: "proposed", details: { matched_count: 3, confidence: 0.98, reason: "Same face detected in IMG_8471.jpg and Telegram profile photo." } }
  ],
  edges: [
    { id: "edge_rohan_iphone", source: "suspect_rohan", target: "device_iphone", label: "OWNS", status: "confirmed" },
    { id: "edge_rohan_laptop", source: "suspect_rohan", target: "device_laptop", label: "OWNS", status: "confirmed" },
    { id: "edge_rohan_tg", source: "suspect_rohan", target: "account_telegram", label: "OPERATES", status: "confirmed" },
    { id: "edge_rohan_ig", source: "suspect_rohan", target: "account_instagram", label: "OPERATES", status: "proposed", reason: "Correlation Agent: Correlated recovery email (r***n@gmail.com) matches Rohan's personal email." },
    { id: "edge_iphone_file1", source: "device_iphone", target: "file_photo_1", label: "CONTAINS", status: "confirmed" },
    { id: "edge_laptop_file2", source: "device_laptop", target: "file_photo_2", label: "CONTAINS", status: "confirmed" },
    { id: "edge_file1_loc", source: "file_photo_1", target: "loc_kochi", label: "LOCATED_AT", status: "confirmed" },
    { id: "edge_file1_face", source: "file_photo_1", target: "identity_face_1", label: "DEPICTS", status: "proposed", reason: "Classifier Agent: Extracted face embedding matches target subject signature." },
    { id: "edge_tg_face", source: "account_telegram", target: "identity_face_1", label: "AVATAR_DEPICTS", status: "proposed", reason: "Correlation Agent: Face matched across Telegram avatar and local phone photo." }
  ],
  timeline_events: [
    {
      id: "time_1",
      caseId: "case_1",
      timestamp: "2026-05-10T08:24:00Z",
      title: "Telegram Account Created",
      description: "Telegram account @rohan_k registered using phone number +91 98450 12345.",
      type: "Account Activity",
      sourceId: "account_telegram",
      severity: "info"
    },
    {
      id: "time_2",
      caseId: "case_1",
      timestamp: "2026-06-15T14:30:22Z",
      title: "Photo Captured (Kochi)",
      description: "Photo IMG_8471.jpg taken on iPhone 14. EXIF data places the device in Kadavanthra, Kochi.",
      type: "Media Capture",
      sourceId: "file_photo_1",
      severity: "warning"
    },
    {
      id: "time_3",
      caseId: "case_1",
      timestamp: "2026-06-20T11:05:40Z",
      title: "AI Synthesis Execution",
      description: "AI-generated image synth_img_0029.png saved on Dell Laptop. Synthetic-media agent flags 94% probability of Stable Diffusion v1.5 output.",
      type: "AI Generation",
      sourceId: "file_photo_2",
      severity: "danger"
    }
  ],
  case_reports: [
    {
      id: "rep_1",
      caseId: "case_1",
      title: "Case Report #KP-2026-0812 Draft",
      content: `## Case Summary
Operation Cyber-Shield targets a suspected network generating and distributing illicit AI materials in Kochi. The principal subject under surveillance is **Rohan Kurian** ([suspect_rohan](node://suspect_rohan)), located at Kadavanthra, Kochi ([loc_kochi](node://loc_kochi)).
## Correlated Evidence
1. **Devices and Operations**: 
   - Rohan Kurian owns and operates an iPhone 14 Pro Max ([device_iphone](node://device_iphone)) and a Dell Latitude Laptop ([device_laptop](node://device_laptop)). 
   - A Telegram account @rohan_k ([account_telegram](node://account_telegram)) is registered to his verified phone number.
2. **Visual Correlation & Face Identification**:
   - The Face Signature #049 ([identity_face_1](node://identity_face_1)) links Rohan's Telegram profile picture to high-resolution photographs taken on his personal iPhone ([file_photo_1](node://file_photo_1)), which contains geolocations matching his home address in Kochi.
3. **Synthetic Material Creation**:
   - File review on his Dell Latitude Laptop reveals a suspicious image \`synth_img_0029.png\` ([file_photo_2](node://file_photo_2)). The **Synthetic-Media Agent** flagged this with a **94% confidence score** as AI-generated. 
## Case Conclusion & Lead Verification
The correlation engine successfully established that Rohan Kurian operates the device and Telegram account used in distribution. The discovery of local generative AI output templates confirms active production rather than simple consumption. Recommend proceeding with immediate custodial interrogation.`,
      generatedAt: "2026-07-06T13:00:00Z",
      status: "Draft"
    }
  ]
};
// Simple Client DB Manager
window.CaseScanDB = {
  init() {
    if (!localStorage.getItem('casescan_db')) {
      localStorage.setItem('casescan_db', JSON.stringify(DEFAULT_DB));
    }
  },
  get(table) {
    this.init();
    const db = JSON.parse(localStorage.getItem('casescan_db'));
    return db[table] || [];
  },
  save(table, data) {
    this.init();
    const db = JSON.parse(localStorage.getItem('casescan_db'));
    db[table] = data;
    localStorage.setItem('casescan_db', JSON.stringify(db));
  },
  reset() {
    localStorage.setItem('casescan_db', JSON.stringify(DEFAULT_DB));
  },
  confirmNode(nodeId) {
    const nodes = this.get('nodes');
    const index = nodes.findIndex(n => n.id === nodeId);
    if (index !== -1) {
      nodes[index].status = 'confirmed';
      this.save('nodes', nodes);
      // Also confirm connected edges
      const edges = this.get('edges');
      const updatedEdges = edges.map(edge => {
        if ((edge.source === nodeId || edge.target === nodeId) && edge.status === 'proposed') {
          return { ...edge, status: 'confirmed' };
        }
        return edge;
      });
      this.save('edges', updatedEdges);
    }
  },
  rejectNode(nodeId) {
    const nodes = this.get('nodes');
    const filteredNodes = nodes.filter(n => n.id !== nodeId);
    this.save('nodes', filteredNodes);
    // Remove connected edges
    const edges = this.get('edges');
    const filteredEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
    this.save('edges', filteredEdges);
  },
  confirmEdge(edgeId) {
    const edges = this.get('edges');
    const index = edges.findIndex(e => e.id === edgeId);
    if (index !== -1) {
      edges[index].status = 'confirmed';
      this.save('edges', edges);
    }
  },
  rejectEdge(edgeId) {
    const edges = this.get('edges');
    const filteredEdges = edges.filter(e => e.id !== edgeId);
    this.save('edges', filteredEdges);
  },
  updateReport(caseId, content) {
    const reports = this.get('case_reports');
    const index = reports.findIndex(r => r.caseId === caseId);
    if (index !== -1) {
      reports[index].content = content;
      reports[index].generatedAt = new Date().toISOString();
      this.save('case_reports', reports);
    }
  },
  // Simulates agent execution pipeline step-by-step
  runIngestion(caseId, file, onStepCallback) {
    const nodes = this.get('nodes');
    const edges = this.get('edges');
    const events = this.get('timeline_events');
    const reports = this.get('case_reports');
    const evidence = this.get('evidence');
    const fileName = file.name;
    const fileHash = file.hash || 'pdq:' + Math.random().toString(36).substring(7);
    const fileType = file.type || 'Media File';
    const fileMetadata = file.metadata || {};
    let stepDelay = 1000; // time between steps in ms
    // Step 1: Hashing
    setTimeout(() => {
      onStepCallback(1, {
        agent: "Known-Content Ingestion Engine",
        status: "success",
        message: `Parsed metadata & generated perceptual hash`,
        details: `PDQ Hash: ${fileHash}. Checked against Microsoft PhotoDNA & Meta PDQ master list. No match found on known blacklists.`
      });
    }, stepDelay * 1);
    // Step 2: Classifier
    const fileNodeId = `file_${Date.now()}`;
    const fileNode = {
      id: fileNodeId,
      label: fileName,
      type: "File",
      status: "confirmed",
      details: {
        format: fileName.split('.').pop().toUpperCase(),
        size: "5.1MB",
        hash_pdq: fileHash.substring(4),
        source: "Digital Dump Upload",
        ...fileMetadata
      }
    };
    setTimeout(() => {
      nodes.push(fileNode);
      // Link to suspect device
      const deviceNode = nodes.find(n => n.type === 'Device');
      const fileEdge = {
        id: `edge_${Date.now()}_file`,
        source: deviceNode ? deviceNode.id : "suspect_rohan",
        target: fileNodeId,
        label: "CONTAINS",
        status: "confirmed"
      };
      edges.push(fileEdge);
      this.save('nodes', nodes);
      this.save('edges', edges);
      onStepCallback(2, {
        agent: "Classifier Agent",
        status: "success",
        message: `Content classification flagged for review`,
        details: `Deep neural networks detected elements of potential investigative relevance. Marked for human confirmation.`
      });
    }, stepDelay * 2);
    // Step 3: Correlation
    setTimeout(() => {
      let message = "Scanning for network correlations...";
      let details = "Scan finished. No new cross-device or identity links found.";
      
      if (fileMetadata.extracted_phone) {
        const phoneNodeId = `phone_${Date.now()}`;
        const phoneNode = {
          id: phoneNodeId,
          label: `Phone: ${fileMetadata.extracted_phone}`,
          type: "Account",
          status: "proposed",
          details: {
            platform: "Cell Provider",
            number: fileMetadata.extracted_phone,
            reason: `Extracted from document in ${fileName}.`
          }
        };
        nodes.push(phoneNode);
        const corrEdge = {
          id: `edge_${Date.now()}_corr`,
          source: "suspect_rohan",
          target: phoneNodeId,
          label: "OPERATES",
          status: "proposed",
          reason: `Correlation Agent: Matches phone pattern in metadata. Correlated through automated chat transcript parsing.`
        };
        edges.push(corrEdge);
        this.save('nodes', nodes);
        this.save('edges', edges);
        message = `Correlation proposed: Operating number ${fileMetadata.extracted_phone}`;
        details = `Associated Rohan Kurian (Suspect) to Phone node based on chat owner metadata matching.`;
      } else if (fileMetadata.extracted_face) {
        const faceNodeId = `identity_face_${Date.now()}`;
        const faceNode = {
          id: faceNodeId,
          label: `Face Signature: ${fileMetadata.extracted_face}`,
          type: "Identity",
          status: "proposed",
          details: {
            matched_count: 2,
            confidence: 0.96,
            reason: `Face embedding similarity match across local files.`
          }
        };
        nodes.push(faceNode);
        const corrEdge = {
          id: `edge_${Date.now()}_corr_face`,
          source: fileNodeId,
          target: faceNodeId,
          label: "DEPICTS",
          status: "proposed",
          reason: `Correlation Agent: Local face extraction algorithm detected 96% facial match similarity to target subject.`
        };
        edges.push(corrEdge);
        this.save('nodes', nodes);
        this.save('edges', edges);
        message = `Visual correlation proposed: Face matched`;
        details = `Correlated suspect face signature inside ${fileName}. Added proposed identity edge.`;
      }
      onStepCallback(3, {
        agent: "Correlation Agent",
        status: "success",
        message,
        details
      });
    }, stepDelay * 3);
    // Step 4: Timeline
    const fileTimestamp = fileMetadata.timestamp || new Date().toISOString();
    setTimeout(() => {
      const timelineEvent = {
        id: `time_${Date.now()}`,
        caseId,
        timestamp: fileTimestamp,
        title: `File Activity: ${fileName}`,
        description: `Activity logged for ${fileName}. EXIF metadata stamps event on ${new Date(fileTimestamp).toLocaleString()}`,
        type: "File Metadata",
        sourceId: fileNodeId,
        severity: fileMetadata.synthetic ? "danger" : "warning"
      };
      events.push(timelineEvent);
      this.save('timeline_events', events);
      onStepCallback(4, {
        agent: "Timeline Agent",
        status: "success",
        message: `Timeline chronologically mapped`,
        details: `Injected event metadata at timestamp ${new Date(fileTimestamp).toLocaleString()} into the suspect's timeline sequence.`
      });
    }, stepDelay * 4);
    // Step 5: Synthetic
    const isSynthetic = fileName.toLowerCase().includes('synth') || fileName.toLowerCase().includes('generate') || fileMetadata.synthetic;
    setTimeout(() => {
      let status = "success";
      let message = "Media authenticity verified";
      let details = "Calculated camera sensor noise maps. Media matches natural digital sensor capture.";
      if (isSynthetic) {
        status = "danger";
        fileNode.details.synthetic = true;
        fileNode.details.confidence = fileMetadata.confidence || 0.95;
        this.save('nodes', nodes);
        message = `Synthetic Media Alert (AI-Generated content detected)`;
        details = `Flagged noise-distribution anomalies and diffusion artifacts. Classifier reports 95% confidence of synthetic manipulation.`;
      }
      onStepCallback(5, {
        agent: "Synthetic-Media Agent",
        status,
        message,
        details
      });
    }, stepDelay * 5);
    // Step 6: Reporting
    setTimeout(() => {
      const reportIndex = reports.findIndex(r => r.caseId === caseId);
      if (reportIndex !== -1) {
        const report = reports[reportIndex];
        let appendText = `\n\n### New Findings Ingested (${new Date().toLocaleDateString()})
- **Evidence File**: Ingested \`${fileName}\` ([${fileNodeId}](node://${fileNodeId})). 
`;
        if (isSynthetic) {
          appendText += `- **Synthetic Media Alert**: This file was identified as synthetic AI material with a high probability (${(fileNode.details.confidence * 100).toFixed(0)}% confidence), suggesting active manipulation or generation tools.
`;
        }
        if (fileMetadata.extracted_phone) {
          appendText += `- **Associated Entity**: Correlated a new phone contact \`${fileMetadata.extracted_phone}\` mentioned in documents.
`;
        }
        report.content += appendText;
        report.generatedAt = new Date().toISOString();
        this.save('case_reports', reports);
      }
      // Add to evidence table
      evidence.push({
        id: `ev_${Date.now()}`,
        caseId,
        name: fileName,
        type: fileType,
        source: "Digital Dump Upload",
        hash: fileHash,
        sizeBytes: 15400000,
        uploadedAt: new Date().toISOString(),
        status: "Analyzed"
      });
      this.save('evidence', evidence);
      onStepCallback(6, {
        agent: "Report Agent",
        status: "success",
        message: `Executive brief updated`,
        details: `Appended findings to Case Report Draft linked with evidence ID [${fileNodeId}]. Pipeline complete.`
      });
    }, stepDelay * 6);
  }
};
