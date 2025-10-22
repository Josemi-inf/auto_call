import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { WhatsAppMessage } from "@/types";
import { getWhatsAppMessages } from "@/services/api";
import { MessageSquare, Send, Bot, User as UserIcon, CheckCheck, Check } from "lucide-react";

interface WhatsAppConversationProps {
  leadId: string;
  brandDealershipId: string;
}

export function WhatsAppConversation({ leadId, brandDealershipId }: WhatsAppConversationProps) {
  const [newMessage, setNewMessage] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["whatsapp", leadId, brandDealershipId],
    queryFn: () => getWhatsAppMessages(leadId, brandDealershipId),
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // TODO: Implement send message API call
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Conversaciones WhatsApp</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          No hay mensajes de WhatsApp para esta marca/concesionario
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>Conversaciones WhatsApp</span>
          <Badge variant="outline">{messages.length}</Badge>
        </h3>
      </div>

      {/* Messages Container */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto p-4 bg-muted/20 rounded-lg">
        {messages.map((message) => {
          const isFromLead = message.sender === "lead";
          const isSystem = message.sender === "system";
          const isAutomatic = message.metadata?.tipo_automatico;

          return (
            <div
              key={message.message_id}
              className={`flex ${isFromLead ? "justify-start" : "justify-end"}`}
            >
              <div className={`max-w-[75%] ${isFromLead ? "" : "text-right"}`}>
                {/* Message Header */}
                <div className="flex items-center space-x-2 mb-1 px-2">
                  {isFromLead ? (
                    <UserIcon className="h-3 w-3 text-muted-foreground" />
                  ) : isSystem || isAutomatic ? (
                    <Bot className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <UserIcon className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {isFromLead
                      ? "Lead"
                      : isSystem || isAutomatic
                      ? "Sistema"
                      : message.metadata?.agente_nombre || "Agente"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.timestamp_mensaje).toLocaleDateString()}{" "}
                    {new Date(message.timestamp_mensaje).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {isFromLead && message.metadata?.respondido && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✅ RESPONDIÓ
                    </Badge>
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-lg ${
                    isFromLead
                      ? "bg-white border border-border"
                      : isSystem || isAutomatic
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.contenido}</p>

                  {/* Read Receipts (for sent messages) */}
                  {!isFromLead && (
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-xs opacity-70">
                        {message.metadata?.enviado ? "Enviado" : "Pendiente"}
                      </span>
                      {message.metadata?.leido ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : message.metadata?.enviado ? (
                        <Check className="h-3 w-3" />
                      ) : null}
                    </div>
                  )}
                </div>

                {/* Automatic Message Indicator */}
                {isAutomatic && (
                  <p className="text-xs text-muted-foreground mt-1 px-2">
                    ⚡ Mensaje automático enviado
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Send Message Input */}
      <div className="flex items-center space-x-2 pt-4 border-t border-border">
        <Input
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Send className="h-4 w-4 mr-2" />
          Enviar
        </Button>
      </div>
    </Card>
  );
}
