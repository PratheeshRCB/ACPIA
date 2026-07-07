import { db } from './db.js';
/**
 * Runs a simulated Agentic AI Pipeline for ingestion.
 * Returns an array of steps with detailed logs, and updates the database state.
 */
export function runAgentCore(caseId, file) {
  const steps = [];
  const addedNodes = [];
  const addedEdges = [];
  const addedEvents = [];
  // Get current state
  const nodes = db.getTable('nodes');
  const edges = db.getTable('edges');
  const events = db.getTable('timeline_events');
  const reports = db.getTable('case_reports');
  // Parse simulated file characteristics
  const fileName = file.name || 'unnamed_evidence.bin';
  const fileHash = file.hash || 'pdq:' + Math.random().toString(36).substring(7);
  const fileType = file.type || 'unknown';
  const fileMetadata = file.metadata || {};
  // Step 1: Known-Content Hashing & Classifier Agent
  steps.push({
    agent: "Known-Content Ingestion Engine",
    status: "success",
    message: `Extracting metadata and calculating perceptual hashes for ${fileName}`,
    details: `PDQ Hash: ${fileHash}. Checked against Microsoft PhotoDNA & Meta PDQ local DB.`
  });
  const isKnownAbuseMaterial = fileHash === "pdq:known_abuse_material_12345";
  if (isKnownAbuseMaterial) {
    steps.push({
      agent: "Classifier Agent",
      status: "triaged",
      message: `CRITICAL MATCH: File ${fileName} matched known signature list.`,
      details: "Auto-triaged to Restricted Evidence Vault. No human review required (zero false positive threshold)."
    });
    // Insert evidence record
    db.insert('evidence', {
      id: `ev_${Date.now()}`,
      caseId,
      name: fileName,
      type: fileType,
      source: "Uploaded Package",
      hash: fileHash,
      sizeBytes: 15400000,
      uploadedAt: new Date().toISOString(),
      status: "Auto-Triaged"
    });
    return { steps, addedNodes, addedEdges, addedEvents };
  }
  // Not known material. Run active Classifier
  const fileNodeId = `file_${Date.now()}`;
  const fileNode = {
    id: fileNodeId,
    label: fileName,
    type: "File",
    status: "confirmed",
    details: {
      format: fileName.split('.').pop().toUpperCase(),
      size: "6.8MB",
      hash_pdq: fileHash.substring(4),
      source: "Uploaded Forensic Dump",
      ...fileMetadata
    }
  };
  nodes.push(fileNode);
  addedNodes.push(fileNode);
  // Connect file to suspect's device if device is specified, or directly to suspect
  const deviceNode = nodes.find(n => n.type === 'Device' && n.status === 'confirmed');
  const suspectNode = nodes.find(n => n.type === 'Suspect');
  const fileEdge = {
    id: `edge_${Date.now()}_file`,
    source: deviceNode ? deviceNode.id : suspectNode.id,
    target: fileNodeId,
    label: "CONTAINS",
    status: "confirmed"
  };
  edges.push(fileEdge);
  addedEdges.push(fileEdge);
  steps.push({
    agent: "Classifier Agent",
    status: "success",
    message: `Flagged unseen content: ${fileName}`,
    details: `Vision classification models detected potential child protection relevance markers. Queueing for mandatory human investigator workspace approval.`
  });
  // Step 2: Correlation Agent
  let correlationFound = false;
  if (fileMetadata.extracted_phone) {
    const phone = fileMetadata.extracted_phone;
    const phoneNodeId = `phone_${Date.now()}`;
    const phoneNode = {
      id: phoneNodeId,
      label: `Phone: ${phone}`,
      type: "Account",
      status: "proposed",
      details: {
        platform: "Cell Provider",
        number: phone,
        reason: `Extracted from chat transcript in ${fileName}.`
      }
    };
    nodes.push(phoneNode);
    addedNodes.push(phoneNode);
    const corrEdge = {
      id: `edge_${Date.now()}_corr_phone`,
      source: suspectNode.id,
      target: phoneNodeId,
      label: "OPERATES",
      status: "proposed",
      reason: `Correlation Agent: Matches phone pattern in file metadata. Recovered chat log records owner as Rohan Kurian.`
    };
    edges.push(corrEdge);
    addedEdges.push(corrEdge);
    steps.push({
      agent: "Correlation Agent",
      status: "success",
      message: `Correlated entity: New phone number found (${phone})`,
      details: `Identified connection suspect_rohan -> ${phone} via text match in chat history file.`
    });
    correlationFound = true;
  }
  if (fileMetadata.extracted_face) {
    const faceSignature = fileMetadata.extracted_face;
    const faceNodeId = `identity_face_${Date.now()}`;
    const faceNode = {
      id: faceNodeId,
      label: `Face: ${faceSignature}`,
      type: "Identity",
      status: "proposed",
      details: {
        matched_count: 2,
        confidence: 0.95,
        reason: `Face embedding similarity match across local files.`
      }
    };
    nodes.push(faceNode);
    addedNodes.push(faceNode);
    const corrEdge = {
      id: `edge_${Date.now()}_corr_face`,
      source: fileNodeId,
      target: faceNodeId,
      label: "DEPICTS",
      status: "proposed",
      reason: `Correlation Agent: Local face extraction algorithm detected 95% facial match similarity to target subject.`
    };
    edges.push(corrEdge);
    addedEdges.push(corrEdge);
    steps.push({
      agent: "Correlation Agent",
      status: "success",
      message: `Correlated entity: Face profile match found (${faceSignature})`,
      details: `Discovered suspect face signature inside file ${fileName}. Proposed visual link.`
    });
    correlationFound = true;
  }
  if (!correlationFound) {
    steps.push({
      agent: "Correlation Agent",
      status: "success",
      message: "Scanning files for metadata cross-links",
      details: "Completed scan. No new identities or secondary suspect connections proposed in this file."
    });
  }
  // Step 3: Timeline Agent
  const fileTimestamp = fileMetadata.timestamp || new Date().toISOString();
  const timelineEvent = {
    id: `time_${Date.now()}`,
    caseId,
    timestamp: fileTimestamp,
    title: `File Activity: ${fileName}`,
    description: `Activity logged for ${fileName}. Source metadata indicates action time as ${new Date(fileTimestamp).toLocaleString()}`,
    type: "File Metadata",
    sourceId: fileNodeId,
    severity: fileMetadata.synthetic ? "danger" : "warning"
  };
  events.push(timelineEvent);
  addedEvents.push(timelineEvent);
  steps.push({
    agent: "Timeline Agent",
    status: "success",
    message: `Chronology mapping completed`,
    details: `Mapped event at ${new Date(fileTimestamp).toLocaleString()} into the suspect's timeline sequence.`
  });
  // Step 4: Synthetic-Media Agent
  let isSynthetic = fileMetadata.synthetic || false;
  if (fileName.toLowerCase().includes('synth') || fileName.toLowerCase().includes('generate') || fileMetadata.synthetic) {
    isSynthetic = true;
  }
  if (isSynthetic) {
    fileNode.details.synthetic = true;
    fileNode.details.confidence = fileMetadata.confidence || 0.96;
    steps.push({
      agent: "Synthetic-Media Agent",
      status: "danger",
      message: `WARNING: Synthetic Media Detected (${(fileNode.details.confidence * 100).toFixed(0)}% confidence)`,
      details: `Detected noise fingerprint anomalies and structural artifact patterns matching Stable Diffusion/Flux generation generators. Injected alert into evidence details.`
    });
  } else {
    steps.push({
      agent: "Synthetic-Media Agent",
      status: "success",
      message: `Media Authenticity Scan`,
      details: `Analyzed double-compression matrices and metadata structure. Content appears to be a natural sensor-captured photograph.`
    });
  }
  // Step 5: Report Agent
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
    reports[reportIndex] = report;
  }
  steps.push({
    agent: "Report Agent",
    status: "success",
    message: `Updated Executive Case Brief`,
    details: `Appended findings to Case Report Draft linked with evidence ID [${fileNodeId}].`
  });
  // Write updates to database
  db.saveTable('nodes', nodes);
  db.saveTable('edges', edges);
  db.saveTable('timeline_events', events);
  db.saveTable('case_reports', reports);
  // Also insert raw evidence object
  db.insert('evidence', {
    id: `ev_${Date.now()}`,
    caseId,
    name: fileName,
    type: fileType,
    source: "Uploaded Forensic Dump",
    hash: fileHash,
    sizeBytes: 15400000,
    uploadedAt: new Date().toISOString(),
    status: "Analyzed"
  });
  return { steps, addedNodes, addedEdges, addedEvents };
}
