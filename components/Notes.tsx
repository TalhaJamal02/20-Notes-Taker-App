"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilePenIcon, TrashIcon } from "lucide-react";

export type Note = {
  id: number;
  title: string;
  content: string;
}

export const defaultNotes: Note[] = [
  {
    id: 1,
    title: "Workout Plan",
    content: "Monday: Chest, Tuesday: Back, Wednesday: Legs",
  },
  {
    id: 2,
    title: "Books to Read",
    content: "Atomic Habits, Clean Code, The Pragmatic Programmer",
  },
  {
    id: 3,
    title: "Vacation Destinations",
    content: "Japan, Switzerland, New Zealand",
  },
];

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error);
        }
      }
    }
    return initialValue;
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
      }
    }
  };

  return [storedValue, setValue] as const;
}

function Notes() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", defaultNotes);
  const [newNote, setNewNote] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddNote = (): void => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const newNoteWithId = { id: Date.now(), ...newNote };
      setNotes([...notes, newNoteWithId]);
      setNewNote({ title: "", content: "" });
    }
  };

  const handleEditNote = (id: number): void => {
    const noteToEdit = notes.find((note) => note.id === id);
    if (noteToEdit) {
      setNewNote({ title: noteToEdit.title, content: noteToEdit.content });
      setEditingNoteId(id);
    }
  };

  const handleUpdateNote = (): void => {
    if (newNote.title.trim() && newNote.content.trim()) {
      setNotes(
        notes.map((note) =>
          note.id === editingNoteId
            ? { id: note.id, title: newNote.title, content: newNote.content }
            : note
        )
      );
      setNewNote({ title: "", content: "" });
      setEditingNoteId(null);
    }
  };

  const handleDeleteNote = (id: number): void => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="bg-gray-200 p-4 shadow-md">
        <h1 className="text-2xl font-bold">Note Taker</h1>
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Title"
            value={newNote.title || ""}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            placeholder="Content"
            value={newNote.content || ""}
            onChange={(e) =>
              setNewNote({ ...newNote, content: e.target.value })
            }
            className="mt-2 w-full rounded-md border border-input bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            rows={4}
          />
          {editingNoteId === null ? (
            <Button onClick={handleAddNote} className="mt-2">
              Add Note
            </Button>
          ) : (
            <Button onClick={handleUpdateNote} className="mt-2">
              Update Note
            </Button>
          )}
        </div>
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-4 shadow-md hover:shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{note.title}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditNote(note.id)}
                  >
                    <FilePenIcon className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <TrashIcon className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">{note.content}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Notes;
