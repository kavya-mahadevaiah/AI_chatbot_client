export default function ChatBubble({ sender, text }) {
  const isUser = sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-2`}>
      <div className={`p-3 max-w-xs rounded-2xl shadow ${
        isUser
          ? 'bg-pink-500 text-white rounded-br-none'
          : 'bg-white text-pink-800 rounded-bl-none'
      } font-fancy`}>
        {sender === 'bot' && <span>🦄 </span>}
        {text}
      </div>
    </div>
  );
}
