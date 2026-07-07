import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');
// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
// Initial Database Schema and Seed Data
const DEFAULT_DB = {
  users: [
    {
      id: "user_1",
      username: "keralapolice",
      passwordHash: "cybercell2026", // simple for demo
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
// Database class helper
class Database {
  constructor() {
    this.data = null;
    this.init();
  }
  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.data = { ...DEFAULT_DB };
      this.save();
    } else {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to parse database.json, recreating with defaults...', err);
        this.data = { ...DEFAULT_DB };
        this.save();
      }
    }
  }
  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error writing database:', err);
    }
  }
  getTable(tableName) {
    this.init(); // Reload latest
    return this.data[tableName] || [];
  }
  saveTable(tableName, tableData) {
    this.data[tableName] = tableData;
    this.save();
  }
  insert(tableName, row) {
    const table = this.getTable(tableName);
    table.push(row);
    this.saveTable(tableName, table);
    return row;
  }
  update(tableName, key, value, updatedFields) {
    const table = this.getTable(tableName);
    const index = table.findIndex(item => item[key] === value);
    if (index !== -1) {
      table[index] = { ...table[index], ...updatedFields };
      this.saveTable(tableName, table);
      return table[index];
    }
    return null;
  }
  delete(tableName, key, value) {
    const table = this.getTable(tableName);
    const filtered = table.filter(item => item[key] !== value);
    this.saveTable(tableName, filtered);
  }
}
export const db = new Database();
