export async function fetchUserRelations(googleId) {
  try {
    const relationResponse = await fetch(
      `http://localhost:5050/users/${googleId}/relations`
    );
    if (!relationResponse.ok) {
      throw new Error("Failed to fetch relations");
    }

    const relations = await relationResponse.json();
    return relations;
  } catch (error) {
    console.error("Error fetching relations info:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

export async function fetchUserAssistantId(googleId) {
  try {
    const response = await fetch(
      `http://localhost:5050/users/${googleId}/assistant_id`
    );

    const assistantId = await response.text();

    if (assistantId && assistantId !== "") {
      return assistantId;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user assistant id:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

export async function updateUserAssistantId(googleId, assistantId) {
  try {
    const response = await fetch(
      `http://localhost:5050/users/${googleId}/${assistantId}`,
      {
        method: "PATCH",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("Successfully updated user assistant ID");
  } catch (error) {
    console.error("Error updating user assistant id:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

export async function fetchUserThreadId(googleId) {
  try {
    const response = await fetch(
      `http://localhost:5050/users/${googleId}/thread_id`
    );
    const threadId = await response.text();
    return threadId;
  } catch (error) {
    console.error("Error fetching user thread id:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}
