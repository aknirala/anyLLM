window.addMessageToChat = function (message, sender) {
  const chatMessages = document.getElementById("chat-messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", `${sender}-message`);
  messageElement.innerHTML = `
    <input type="checkbox" class="message-checkbox" checked>
    <p>${message}</p>
  `;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

window.loadConversation = function (conversationData) {
  window.setCurrentConversation(conversationData);
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = "";

  conversationData.conversation.forEach((turn) => {
    window.addMessageToChat(turn.user_message, "user");
    window.addMessageToChat(turn.ai_response, "ai");
  });
};

// Function to send a message to the LLM
async function sendMessageToLLM(message, chatHistory) {
  // Mock LLM response for now
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("This is a mock response from the LLM.");
    }, 1000);
  });
}

// Function to save the conversation to a JSON file
async function saveConversation(conversation) {
  const folderHandle = window.getFolderHandle();
  if (!folderHandle) {
    console.error("Folder handle not available.");
    return;
  }
  const creationTime = conversation.creation_time || new Date().toISOString();
  const fileName = `${creationTime}.json`;
  const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(conversation, null, 2));
  await writable.close();
}

// Function to handle sending a message
async function handleSendMessage() {
  const chatInput = document.getElementById("chat-input");
  const message = chatInput.value.trim();
  if (message) {
    window.addMessageToChat(message, "user");
    chatInput.value = "";

    const chatHistory = getChatHistory();
    const llmResponse = await sendMessageToLLM(message, chatHistory);
    window.addMessageToChat(llmResponse, "ai");

    let conversation = window.getCurrentConversation();
    if (conversation) {
      conversation.last_modified_time = new Date().toISOString();
      conversation.conversation = getChatHistoryForSave();
    } else {
      conversation = {
        creation_time: new Date().toISOString(),
        last_modified_time: new Date().toISOString(),
        primary_model_selected: document.getElementById("primary-llm").value,
        primary_model_system_prompt: document.getElementById("primary-llm-prompt").value,
        secondary_model_selected: document.getElementById("secondary-llm").value,
        secondary_model_system_prompt: document.getElementById("secondary-llm-prompt").value,
        conversation: getChatHistoryForSave(),
      };
      window.setCurrentConversation(conversation);
      addConversationToList(conversation);
    }

    await saveConversation(conversation);
  }
}

function addConversationToList(conversation) {
  const conversationList = document.getElementById("conversation-list");
  const listItem = document.createElement("li");
  listItem.textContent = conversation.creation_time + ".json";
  listItem.classList.add("conversation-list-item");
  listItem.addEventListener("click", () => {
    window.loadConversation(conversation);
  });
  conversationList.prepend(listItem);
}
// Function to get the chat history from the UI for saving
function getChatHistoryForSave() {
  const chatHistory = [];
  const messageElements = document.querySelectorAll(".message");
  let user_message, user_timestamp;

  for (let i = 0; i < messageElements.length; i++) {
    const messageElement = messageElements[i];
    const messageText = messageElement.querySelector("p").textContent;

    if (messageElement.classList.contains("user-message")) {
      user_message = messageText;
      user_timestamp = new Date().toISOString();
    } else if (messageElement.classList.contains("ai-message")) {
      chatHistory.push({
        user_message: user_message,
        user_timestamp: user_timestamp,
        ai_response: messageText,
        ai_timestamp: new Date().toISOString(),
      });
    }
  }
  return chatHistory;
}

// Function to get the chat history from the UI
function getChatHistory() {
  const chatHistory = [];
  const messageElements = document.querySelectorAll(".message");
  messageElements.forEach((messageElement) => {
    const checkbox = messageElement.querySelector(".message-checkbox");
    if (checkbox.checked) {
      const messageText = messageElement.querySelector("p").textContent;
      const sender = messageElement.classList.contains("user-message") ? "user" : "ai";
      chatHistory.push({ role: sender, content: messageText });
    }
  });
  return chatHistory;
}

document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("send-button");
  sendButton.addEventListener("click", handleSendMessage);

  const chatInput = document.getElementById("chat-input");
  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  });
});
