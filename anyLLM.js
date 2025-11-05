document.addEventListener("DOMContentLoaded", () => {
  const folderPickerBtn = document.getElementById("folder-picker-btn");
  const fileList = document.getElementById("file-list");
  const conversationList = document.getElementById("conversation-list");
  const llmSelectionCollapse = new bootstrap.Collapse(document.getElementById("llm-selection-collapse"), {
    toggle: false,
  });

  const primaryLlm = document.getElementById("primary-llm");
  const primaryLlmKey = document.getElementById("primary-llm-key");
  const primaryLlmPrompt = document.getElementById("primary-llm-prompt");
  const secondaryLlm = document.getElementById("secondary-llm");
  const secondaryLlmKey = document.getElementById("secondary-llm-key");
  const secondaryLlmPrompt = document.getElementById("secondary-llm-prompt");
  const saveSettingsButton = document.getElementById("save-settings");
  const llmSelectionDisplay = document.getElementById("llm-selection-display");

  function updateLlmSelectionDisplay() {
    const primary = primaryLlm.value !== "Choose..." ? primaryLlm.value : "";
    const secondary = secondaryLlm.value !== "Choose..." ? secondaryLlm.value : "";

    llmSelectionDisplay.textContent = `${primary} - ${secondary}`;
  }

  primaryLlm.addEventListener("change", updateLlmSelectionDisplay);
  secondaryLlm.addEventListener("change", updateLlmSelectionDisplay);

  updateLlmSelectionDisplay();

  const dbName = "anyLLMDB";
  const storeName = "folderStore";

  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore(storeName);
      };
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  function saveFolderHandle(handle) {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        store.put(handle, "folderHandle");
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = (event) => {
          reject(event.target.error);
        };
      });
    });
  }

  function getFolderHandle() {
    return openDB().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get("folderHandle");
        request.onsuccess = (event) => {
          resolve(event.target.result);
        };
        request.onerror = (event) => {
          reject(event.target.error);
        };
      });
    });
  }

  let folderHandle;
  let currentConversation;

  window.getFolderHandle = () => {
    return folderHandle;
  };

  window.getCurrentConversation = () => {
    return currentConversation;
  };

  window.setCurrentConversation = (conversation) => {
    currentConversation = conversation;
  };

  async function loadFolder(handle) {
    folderHandle = handle;
    currentConversation = null; // Clear current conversation
    fileList.innerHTML = ""; // Clear the file list
    const jsonFiles = [];

    for await (const entry of folderHandle.values()) {
      const listItem = document.createElement("li");
      listItem.textContent = entry.name;
      fileList.appendChild(listItem);

      if (entry.kind === "file" && entry.name.endsWith(".json") && entry.name !== "model.json") {
        const file = await entry.getFile();
        const content = await file.text();
        const data = JSON.parse(content);
        jsonFiles.push({ ...data, fileName: file.name });
      }
    }

    // Sort files by last_modified_time in descending order
    jsonFiles.sort((a, b) => new Date(b.last_modified_time) - new Date(a.last_modified_time));

    // Clear the conversation list
    conversationList.innerHTML = "";

    // Populate the conversation list
    jsonFiles.forEach((fileData) => {
      const listItem = document.createElement("li");
      listItem.textContent = fileData.fileName;
      listItem.classList.add("conversation-list-item");
      listItem.addEventListener("click", () => {
        window.loadConversation(fileData);
      });
      conversationList.appendChild(listItem);
    });

    // Load settings from model.json if it exists
    try {
      const modelFileHandle = await folderHandle.getFileHandle("model.json");
      const modelFile = await modelFileHandle.getFile();
      const content = await modelFile.text();
      const models = JSON.parse(content);
      primaryLlm.value = models.primary_llm || "";
      primaryLlmKey.value = models.primary_llm_key || "";
      primaryLlmPrompt.value = models.primary_llm_prompt || "";
      secondaryLlm.value = models.secondary_llm || "";
      secondaryLlmKey.value = models.secondary_llm_key || "";
      secondaryLlmPrompt.value = models.secondary_llm_prompt || "";

      updateLlmSelectionDisplay();

      if (models.primary_llm && models.secondary_llm) {
        llmSelectionCollapse.hide();
      }
    } catch (error) {
      console.error("Error reading or parsing model.json:", error);
    }
  }

  getFolderHandle().then((handle) => {
    if (handle) {
      loadFolder(handle);
    }
  });

  folderPickerBtn.addEventListener("click", async () => {
    try {
      const handle = await window.showDirectoryPicker();
      await saveFolderHandle(handle);
      await loadFolder(handle);
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  });

  saveSettingsButton.addEventListener("click", async () => {
    const settings = {
      primary_llm: primaryLlm.value,
      primary_llm_key: primaryLlmKey.value,
      primary_llm_prompt: primaryLlmPrompt.value,
      secondary_llm: secondaryLlm.value,
      secondary_llm_key: secondaryLlmKey.value,
      secondary_llm_prompt: secondaryLlmPrompt.value,
    };

    if (folderHandle) {
      try {
        const fileHandle = await folderHandle.getFileHandle("model.json", {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(settings, null, 2));
        await writable.close();
        alert("Settings saved successfully!");
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    } else {
      alert("Please select a folder first.");
    }
  });
});
