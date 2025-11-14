const DB_NAME = "SmartNotes";

export async function getNotes() {
  const data = localStorage.getItem(DB_NAME);
  return data ? JSON.parse(data) : [];
}

export async function saveNote(note) {
  const notes = await getNotes();
  const index = notes.findIndex((n) => n.id === note.id);
  if (index >= 0) {
    notes[index] = { ...note, updatedAt: Date.now() };
  } else {
    notes.push({
      ...note,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
  localStorage.setItem(DB_NAME, JSON.stringify(notes));
  return note;
}

export async function deleteNote(id) {
  const notes = await getNotes();
  const filtered = notes.filter((n) => n.id !== id);
  localStorage.setItem(DB_NAME, JSON.stringify(filtered));
}
