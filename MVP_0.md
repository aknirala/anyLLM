# MVP0: Simple JSON File Editor

This document outlines the requirements for the first Minimum Viable Product (MVP), a simple web-based editor for JSON files.

The landing page is anyLLM_0.html

## Core Features

1.  **Folder Selection:**
    - The application shall provide an interface for the user to browse and select a directory from their local filesystem.

2.  **JSON File Loading:**
    - Upon folder selection, the application will read all files with a `.json` extension from the chosen directory (which could be empty).

3.  **File Display:**
    - The application will display a list of the loaded JSON files.
    - This list will be sorted based on the `last_m_time` field in each JSON file, with the most recently modified files appearing first.
    - Each item in the list will display the `title` which is simply first 50 characters (removing any new line and spaces etc so call strip() on it) from text. If text is empty it is empty.

4.  **Editing Interface:**
    - When a user clicks on a file from the list, the content of the `text` field from that JSON file will be loaded into an editable `<textarea>`.

5.  **Auto-Save on Modify:**
    - The application will automatically save any changes made to the text in the textarea.
    - Saving is triggered when the textarea loses focus (e.g., the user clicks elsewhere on the page).
    - Saving should only occur if the content has actually been modified.

## JSON Structure

Each JSON file is expected to have the following structure:

```json
{
  "cr_time": 1678886400,
  "last_m_time": 1678886400,
  "text": "This is the sample text content."
}
```
