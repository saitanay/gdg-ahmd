import { useState, useEffect } from "react";
import { getNotes, saveNote, deleteNote } from "./lib/db";
import NoteList from "./components/NoteList";
import NoteEditor from "./components/NoteEditor";

function App() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({
    id: null,
    title: "",
    content: "",
  });

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    const data = await getNotes();
    setNotes(data);
  }

  async function handleSave() {
    if (!currentNote.title && !currentNote.content) return;
    await saveNote(currentNote);
    await loadNotes();
    setCurrentNote({ id: null, title: "", content: "" });
  }

  async function handleDelete(id) {
    await deleteNote(id);
    await loadNotes();
    if (currentNote.id === id) {
      setCurrentNote({ id: null, title: "", content: "" });
    }
  }

  function handleNewNote() {
    setCurrentNote({ id: null, title: "", content: "" });
  }

  function handleSelectNote(note) {
    setCurrentNote(note);
  }

  return (
    <div className="app">
      <NoteList
        notes={notes}
        currentNote={currentNote}
        onSelectNote={handleSelectNote}
        onNewNote={handleNewNote}
        onDeleteNote={handleDelete}
      />
      <div className="main-content">
        <NoteEditor currentNote={currentNote} onNoteChange={setCurrentNote} />
        <div className="action-bar">
          <button className="button button-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
