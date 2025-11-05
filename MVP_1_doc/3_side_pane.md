# Side Pane (Conversation List)

This document describes the functionality of the side pane, which displays the list of conversations.

## Features

*   **File Loading:** Upon folder selection, the application will scan the chosen directory for all `.json` files.
*   **Display:** The side pane will display a list of the loaded conversations.
*   **Sorting:** The list will be sorted by the `last_m_time` field in each JSON file, with the most recently modified conversations appearing first.
*   **Title:** Each item in the list will display a title generated from the first 50 characters of the `text` field in the JSON file (with newlines and spaces stripped). If the `text` field is empty, the title will be empty.

**Note on Conversation Saving:** When the chat functionality is implemented, conversations will be saved in files with the format `yymmdd_hhmmss.json`, where the timestamp represents the creation time of the conversation.
