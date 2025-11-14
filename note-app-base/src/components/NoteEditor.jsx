function NoteEditor({ currentNote, onNoteChange }) {
  return (
    <div className="editor">
      <input
        className="editor-title"
        placeholder="Note title"
        value={currentNote.title}
        onChange={(e) =>
          onNoteChange({ ...currentNote, title: e.target.value })
        }
      />
      <textarea
        className="editor-content"
        placeholder="Write your note here..."
        value={currentNote.content}
        onChange={(e) =>
          onNoteChange({ ...currentNote, content: e.target.value })
        }
      />
    </div>
  );
}

export default NoteEditor;
