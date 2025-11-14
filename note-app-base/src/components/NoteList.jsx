function NoteList({
  notes,
  currentNote,
  onSelectNote,
  onNewNote,
  onDeleteNote,
}) {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">Notes</h2>
      <button className="button button-primary" onClick={onNewNote}>
        New Note
      </button>
      <div className="note-list">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`note-item ${
              currentNote.id === note.id ? "note-item-active" : ""
            }`}
            onClick={() => onSelectNote(note)}
          >
            <div className="note-item-title">{note.title || "Untitled"}</div>
            <div className="note-item-preview">
              {note.content.substring(0, 50)}...
            </div>
            <button
              className="button button-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteNote(note.id);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NoteList;
