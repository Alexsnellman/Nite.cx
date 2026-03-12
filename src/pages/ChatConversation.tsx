import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockMessages: Record<string, { id: string; text: string; fromMe: boolean; time: string }[]> = {
  "1": [
    { id: "m1", text: "Who's coming tonight?", fromMe: false, time: "18:01" },
    { id: "m2", text: "I'll be there with 3 friends 🔥", fromMe: true, time: "18:02" },
    { id: "m3", text: "Nice! Doors open at 22:00", fromMe: false, time: "18:03" },
    { id: "m4", text: "See you all there! 🔥", fromMe: false, time: "18:05" },
  ],
  "3": [
    { id: "m1", text: "Anyone know the lineup?", fromMe: false, time: "17:50" },
  ],
};

const chatNames: Record<string, string> = {
  "1": "Techno Warehouse Night",
  "3": "SUBTERRANEAN",
};

const ChatConversation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(mockMessages[id || ""] || []);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: `m${Date.now()}`, text: input.trim(), fromMe: true, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-10">
        <button onClick={() => navigate("/chat")} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="font-heading font-bold text-foreground text-sm truncate">{chatNames[id || ""] || "Chat"}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${msg.fromMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card text-foreground rounded-bl-md"}`}>
              <p className="text-sm font-mono">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.fromMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border bg-card/80 backdrop-blur-xl safe-area-bottom">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-background border border-border rounded-full px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="rounded-full h-10 w-10 shrink-0">
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;
