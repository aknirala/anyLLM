const folderPickerBtn = document.getElementById("folder-picker-btn");
const fileList = document.getElementById("file-list");
const textEditor = document.getElementById("text-editor");

let directoryHandle = null;
let filesData = [];
let currentFileHandle = null;

folderPickerBtn.addEventListener("click", async () => {
  try {
    directoryHandle = await window.showDirectoryPicker();
    await loadFiles();
  } catch (error) {
    console.error("Error picking directory:", error);
  }
});

async function loadFiles() {
  if (!directoryHandle) return;

  filesData = [];
  fileList.innerHTML = ""; // Clear the list

  for await (const entry of directoryHandle.values()) {
    if (entry.kind === "file" && entry.name.endsWith(".json")) {
      try {
        const file = await entry.getFile();
        const text = await file.text();
        const data = JSON.parse(text);
        filesData.push({
          handle: entry, // Store the file handle
          cr_time: data.cr_time,
          last_m_time: data.last_m_time,
          text: data.text,
        });
      } catch (error) {
        console.error(`Error reading or parsing file ${entry.name}:`, error);
      }
    }
  }

  renderFileList();
}

function renderFileList() {
  filesData.sort((a, b) => b.last_m_time - a.last_m_time);

  filesData.forEach((fileData) => {
    const listItem = document.createElement("li");
    const title = fileData.text
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 50);
    listItem.textContent = title || "(empty)";
    listItem.addEventListener("click", () => {
      loadFileIntoEditor(fileData);
    });
    fileList.appendChild(listItem);
  });
}

function loadFileIntoEditor(fileData) {
  textEditor.value = fileData.text;
  currentFileHandle = fileData.handle;
  textEditor.dataset.originalText = fileData.text;
}

textEditor.addEventListener("blur", async () => {
  alert(1);
  if (
    currentFileHandle &&
    textEditor.value !== textEditor.dataset.originalText
  ) {
    try {
      // Get the existing data to preserve cr_time
      const originalFileData = filesData.find(
        (f) => f.handle === currentFileHandle,
      );

      const updatedContent = {
        cr_time: originalFileData.cr_time,
        last_m_time: Math.floor(Date.now() / 1000),
        text: textEditor.value,
      };

      const writable = await currentFileHandle.createWritable();
      await writable.write(JSON.stringify(updatedContent, null, 2));
      await writable.close();

      // Update the in-memory data and re-render the list
      originalFileData.text = updatedContent.text;
      originalFileData.last_m_time = updatedContent.last_m_time;
      textEditor.dataset.originalText = updatedContent.text;
      renderFileList();

      console.log(`File ${currentFileHandle.name} saved successfully.`);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }
});
