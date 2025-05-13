# Event Recommendation Chatbot

A chatbot that recommends events based on user preferences and notifies them about upcoming events in their city via Telegram.

---

## 📌 Features

- 📍 Event recommendations by category and location
- 🤖 Telegram bot interface for user interaction
- 🧠 Fallback responses when LLM/API fails
- 🗃️ MongoDB for storing user preferences and event history
- ⚙️ Designed for scalability and reliability

---

## 🛠️ Technology Stack

**Backend:**
- Node.js / Express – API logic and routing
- MongoDB – User preferences and event storage
- (Initially) Hugging Face LLM (Mistral-7B) via LangChain

**Frontend:**
- Telegram Bot – Conversational UI for users

---

## ⚙️ Workflow

1. Users chat with the Telegram bot.
2. They provide preferences (event categories, location).
3. The backend processes the input and:
   - Uses LLM for recommendations (when API is available)
   - Falls back to local predefined responses (when API fails)

---

## 🧩 Challenges Faced

### 🔐 Hugging Face API Issues
- Frequent timeouts, blob fetch failures, and rate limits
- Required error handling and API key management

### 🧱 LangChain Dependency Problems
- Version conflicts (`ERR_PACKAGE_PATH_NOT_EXPORTED`)
- Breaking changes across versions

### ⚠️ MongoDB Schema Warnings
- Duplicate index warnings due to redundant definitions

### 🔁 Fallback Reliability
- Needed a consistent backup method when LLM/API failed

---

## ✅ Improvements Made

### 1. Removed External API Dependencies
- Eliminated Hugging Face dependency
- Removed rate limits, network failures, and API key issues

### 2. Simplified Architecture
- Removed LangChain
- Used hardcoded, categorized responses:
```javascript
const LOCAL_RESPONSES = {
  music: ["Check concerts in {location}..."],
  sports: ["Games in {location} are listed on..."],
};
