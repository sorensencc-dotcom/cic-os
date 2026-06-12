# Rewrite Labs AI Model Fine‑Tuning Playbook

Technical, operator‑grade guide aligned with Nemotron + CLOE.

---

## **1. Purpose**
Defines how Rewrite Labs fine‑tunes models for:

- Redesign quality  
- Layout generation  
- Industry‑specific patterns  
- Outreach personalization  

---

## **2. Model Stack**
- **Base Model:** Nemotron Nano 30B  
- **Fine‑Tuning Framework:** LoRA / QLoRA  
- **Serving:** NIM Gateway  

---

## **3. Data Sources**

### **3.1 Redesign Data**
- High‑performing variants  
- Industry‑specific layouts  
- Semantic block patterns  

### **3.2 Outreach Data**
- Email opens  
- Clicks  
- Replies  
- Conversions  

### **3.3 Negative Examples**
- Low‑performing variants  
- Poor layouts  
- Spam‑like outreach  

---

## **4. Fine‑Tuning Pipeline**

### **Step 1 — Data Collection**
CLOE aggregates:

- Variant performance  
- Outreach metrics  
- Semantic patterns  

### **Step 2 — Data Cleaning**
- Remove duplicates  
- Normalize HTML  
- Strip scripts  
- Validate structure  

### **Step 3 — Prompt/Response Pairing**
Example:

**Prompt:**  
"Redesign this HVAC website for mobile."

**Response:**  
High‑performing variant HTML.

---

### **Step 4 — LoRA Training**
- 8‑bit quantization  
- 4–8 GPUs  
- 3 epochs  
- Early stopping  

---

### **Step 5 — Evaluation**
Metrics:

- Layout coherence  
- Semantic accuracy  
- Conversion proxy score  

---

### **Step 6 — Deployment**
- Hot‑swap via NIM  
- Canary rollout  
- Drift monitoring  

---

## **5. Safety & Compliance**
- No training on personal data  
- No training on client‑identifiable content  
- All data anonymized  

---

## **6. Continuous Learning Loop**
CLOE → Fine‑Tuning → Deployment → CLOE

---

**Created:** 2026-06-11  
**Status:** Ready for Implementation  
**Version:** 1.0
