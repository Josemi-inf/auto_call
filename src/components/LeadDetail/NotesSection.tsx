import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LeadNote } from "@/types";
import { getLeadNotes, addLeadNote } from "@/services/api";
import { StickyNote, Plus, User as UserIcon, Calendar } from "lucide-react";

interface NotesSectionProps {
  leadId: string;
  brandDealershipId: string;
}

export function NotesSection({ leadId, brandDealershipId }: NotesSectionProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const queryClient = useQueryClient();

  const { data: notes, isLoading } = useQuery({
    queryKey: ["notes", leadId, brandDealershipId],
    queryFn: () => getLeadNotes(leadId, brandDealershipId),
  });

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => addLeadNote(leadId, brandDealershipId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", leadId, brandDealershipId] });
      setNewNoteContent("");
      setIsAddingNote(false);
    },
  });

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    addNoteMutation.mutate(newNoteContent);
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <StickyNote className="h-5 w-5" />
          <span>Notas y Observaciones</span>
          {notes && notes.length > 0 && (
            <Badge variant="outline">{notes.length}</Badge>
          )}
        </h3>
        {!isAddingNote && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingNote(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar nota
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="mb-4 p-4 border border-border rounded-lg bg-muted/20">
          <Textarea
            placeholder="Escribe tu observación o nota..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            rows={4}
            className="mb-3"
          />
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim() || addNoteMutation.isPending}
            >
              {addNoteMutation.isPending ? "Guardando..." : "Guardar nota"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingNote(false);
                setNewNoteContent("");
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes && notes.length > 0 ? (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.nota_id}
              className="p-4 border border-border rounded-lg bg-yellow-50/50 hover:bg-yellow-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium text-card-foreground">
                    {note.usuario_nombre || "Usuario"}
                  </span>
                  <span>•</span>
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(note.created_at).toLocaleDateString()}{" "}
                    {new Date(note.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-card-foreground whitespace-pre-wrap">
                {note.contenido}
              </p>
              {note.updated_at !== note.created_at && (
                <p className="text-xs text-muted-foreground mt-2">
                  Editado: {new Date(note.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        !isAddingNote && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay notas registradas. Haz clic en "Agregar nota" para crear una.
          </p>
        )
      )}
    </Card>
  );
}
