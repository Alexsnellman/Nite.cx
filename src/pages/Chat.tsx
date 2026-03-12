import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockChats = [
  { id: "1", name: "Techno Warehouse Night", lastMsg: "See you all there! 🔥", time: "2m", unread: 3 },
  { id: "3", name: "SUBTERRANEAN", lastMsg: "Anyone know the lineup?", time: "15m", unread: 0 },
];

const Chat = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pt-14 pb-24 px-5">
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">Messages</h1>

      {mockChats.length === 0 ? (
        <div className="text-center mt-20">
          <MessageCircle size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-mono text-sm">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mockChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="flex items-center gap-3 p-4 bg-card rounded-xl cursor-pointer hover:bg-card/80 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-foreground text-sm truncate">
                    {chat.name}
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">{chat.time}</span>
                </div>
                <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">
                  {chat.lastMsg}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-heading font-bold text-primary-foreground">
                    {chat.unread}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;
