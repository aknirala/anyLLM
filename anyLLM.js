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
  // Case 1: Update an existing file
  if (
    currentFileHandle &&
    textEditor.value !== textEditor.dataset.originalText
  ) {
    try {
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

      originalFileData.text = updatedContent.text;
      originalFileData.last_m_time = updatedContent.last_m_time;
      textEditor.dataset.originalText = updatedContent.text;

      fileList.innerHTML = "";
      renderFileList();

      console.log(`File ${currentFileHandle.name} saved successfully.`);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  }
  // Case 2: Create a new file
  else if (!currentFileHandle && textEditor.value.trim() !== "") {
    if (!directoryHandle) {
      alert("Please select a folder first.");
      return;
    }
    try {
      const now = new Date();
      const filename =
        now.getFullYear().toString().slice(-2) +
        ("0" + (now.getMonth() + 1)).slice(-2) +
        ("0" + now.getDate()).slice(-2) +
        "_" +
        ("0" + now.getHours()).slice(-2) +
        ("0" + now.getMinutes()).slice(-2) +
        ("0" + now.getSeconds()).slice(-2) +
        ".json";

      const timestamp = Math.floor(now.getTime() / 1000);
      const newContent = {
        cr_time: timestamp,
        last_m_time: timestamp,
        text: textEditor.value,
      };

      const newFileHandle = await directoryHandle.getFileHandle(filename, {
        create: true,
      });
      const writable = await newFileHandle.createWritable();
      await writable.write(JSON.stringify(newContent, null, 2));
      await writable.close();

      const newFileData = {
        handle: newFileHandle,
        ...newContent,
      };

      filesData.push(newFileData);
      currentFileHandle = newFileHandle;
      textEditor.dataset.originalText = newContent.text;

      fileList.innerHTML = "";
      renderFileList();

      console.log(`File ${filename} created successfully.`);
    } catch (error) {
      console.error("Error creating new file:", error);
    }
  }
});
