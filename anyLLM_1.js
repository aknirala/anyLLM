document.addEventListener("DOMContentLoaded", () => {
  const selectFolderBtn = document.getElementById("select-folder");
  const fileList = document.getElementById("file-list");
  const chatHistory = document.getElementById("chat-history");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const primaryLlmSelect = document.getElementById("primary-llm");
  const primaryLlmKeyInput = document.getElementById("primary-llm-key");
  const secondaryLlmSelect = document.getElementById("secondary-llm");
  const secondaryLlmKeyInput = document.getElementById("secondary-llm-key");
  const primarySystemPromptTextarea = document.getElementById(
    "primary-system-prompt",
  );
  const secondarySystemPromptTextarea = document.getElementById(
    "secondary-system-prompt",
  );
  const saveSettingsBtn = document.getElementById("save-settings");

  let directoryHandle = null;
  let activeFileHandle = null;

  // 1. Folder Selection
  selectFolderBtn.addEventListener("click", async () => {
    try {
      directoryHandle = await window.showDirectoryPicker();
      await loadFiles();
      await loadSettings();
    } catch (err) {
      console.error("Error selecting folder:", err);
    }
  });

  // 2. File Loading and Display
  async function loadFiles() {
    if (!directoryHandle) return;
    fileList.innerHTML = "";
    const files = [];
    for await (const entry of directoryHandle.values()) {
      if (
        entry.kind === "file" &&
        entry.name.endsWith(".json") &&
        entry.name !== "models.json"
      ) {
        const file = await entry.getFile();
        const content = await file.text();
        try {
          const data = JSON.parse(content);
          files.push({
            name: entry.name,
            handle: entry,
            last_m_time: data.last_m_time,
            text: data.text,
          });
        } catch (e) {
          console.error(`Error parsing ${entry.name}:`, e);
        }
      }
    }

    files.sort((a, b) => b.last_m_time - a.last_m_time);

    files.forEach((file) => {
      const li = document.createElement("li");
      li.textContent = file.text ? file.text.substring(0, 50) : file.name;
      li.addEventListener("click", () => loadFileContent(file.handle));
      fileList.appendChild(li);
    });
  }

  // 3. Load File Content
  async function loadFileContent(fileHandle) {
    activeFileHandle = fileHandle;
    const file = await fileHandle.getFile();
    const content = await file.text();
    try {
      const data = JSON.parse(content);
      chatHistory.innerHTML = ""; // Clear previous history
      if (data.messages) {
        data.messages.forEach((msg) => {
          const messageElement = document.createElement("div");
          messageElement.textContent = `${msg.role}: ${msg.content}`;
          chatHistory.appendChild(messageElement);
        });
      }
    } catch (e) {
      console.error(`Error parsing ${fileHandle.name}:`, e);
    }
  }

  // 4. Settings Management
  async function loadSettings() {
    if (!directoryHandle) return;
    try {
      const modelsFileHandle = await directoryHandle.getFileHandle(
        "models.json",
        { create: false },
      );
      const file = await modelsFileHandle.getFile();
      const content = await file.text();
      const settings = JSON.parse(content);

      primaryLlmSelect.value = settings.primaryLlm || "gpt-4";
      primaryLlmKeyInput.value = settings.primaryLlmKey || "";
      secondaryLlmSelect.value = settings.secondaryLlm || "gpt-3.5-turbo";
      secondaryLlmKeyInput.value = settings.secondaryLlmKey || "";
      primarySystemPromptTextarea.value = settings.primarySystemPrompt || "";
      secondarySystemPromptTextarea.value =
        settings.secondarySystemPrompt || "";
    } catch (e) {
      // models.json doesn't exist or is invalid, use defaults
      console.log("models.json not found, using default settings.");
    }
  }

  saveSettingsBtn.addEventListener("click", async () => {
    if (!directoryHandle) {
      alert("Please select a folder first.");
      return;
    }
    const settings = {
      primaryLlm: primaryLlmSelect.value,
      primaryLlmKey: primaryLlmKeyInput.value,
      secondaryLlm: secondaryLlmSelect.value,
      secondaryLlmKey: secondaryLlmKeyInput.value,
      primarySystemPrompt: primarySystemPromptTextarea.value,
      secondarySystemPrompt: secondarySystemPromptTextarea.value,
    };

    try {
      const modelsFileHandle = await directoryHandle.getFileHandle(
        "models.json",
        { create: true },
      );
      const writable = await modelsFileHandle.createWritable();
      await writable.write(JSON.stringify(settings, null, 2));
      await writable.close();
      alert("Settings saved.");
    } catch (e) {
      console.error("Error saving settings:", e);
      alert("Error saving settings.");
    }
  });

  // 5. Chat Logic
  sendButton.addEventListener("click", async () => {
    const message = messageInput.value.trim();
    if (!message) return;

    addMessageToHistory("user", message);
    messageInput.value = "";

    // Placeholder for LLM calls
    const primaryResponse = await getPrimaryLlmResponse(message);
    addMessageToHistory("assistant", `Primary: ${primaryResponse}`);

    const secondaryResponse = await getSecondaryLlmResponse(
      message,
      primaryResponse,
    );
    addMessageToHistory("assistant", `Secondary: ${secondaryResponse}`);

    if (activeFileHandle) {
      await saveConversation();
    }
  });

  function addMessageToHistory(role, content) {
    const messageElement = document.createElement("div");
    messageElement.textContent = `${role}: ${content}`;
    chatHistory.appendChild(messageElement);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  async function saveConversation() {
    if (!activeFileHandle) return;

    const file = await activeFileHandle.getFile();
    const content = await file.text();
    let data = {};
    try {
      data = JSON.parse(content);
    } catch (e) {
      // File is empty or invalid JSON, start with a new object
      data = { cr_time: Date.now(), messages: [] };
    }

    data.last_m_time = Date.now();
    if (!data.messages) {
      data.messages = [];
    }
    // This is a simplified representation. You'd likely want to push the new messages.
    data.text = chatHistory.innerText;

    try {
      const writable = await activeFileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (e) {
      console.error("Error saving conversation:", e);
    }
  }

  // Placeholder LLM functions
  async function getPrimaryLlmResponse(prompt) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Response to: "${prompt}"`);
      }, 500);
    });
  }

  async function getSecondaryLlmResponse(originalPrompt, primaryResponse) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Refined response for: "${primaryResponse}"`);
      }, 500);
    });
  }
});
