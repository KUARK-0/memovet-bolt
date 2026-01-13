import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Bot } from 'lucide-react';
import { Input } from './ui/input';

const getAIAssistantResponse = async (prompt: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const p = prompt.toLowerCase();

  if (p.includes('şap') || p.includes('belirti')) {
    return `🐄 **Şap Hastalığı (FMD) Hatırlatması:**

• **Kritik Belirtiler:** Ağız ve tırnakta veziküller, salya artışı, iştahsızlık.
• **Hızlı Müdahale:** İyotlu solüsyonlar ile dezenfeksiyon, destekleyici vitamin takviyesi.
• **Yasal Not:** Şüpheli vakaları 24 saat içinde Tarım İlçe Müdürlüğü'ne bildiriniz.`;
  }

  if (p.includes('ishal') || p.includes('buzağı')) {
    return `🍼 **Buzağı İshali (Scour) Protokolü:**

• **İlk Adım:** Dehidrasyon seviyesini kontrol edin (deri elastikiyeti).
• **Tedavi:** Elektrolit takviyesi (Sözlü/IV), uygun antibiyotik ve probiyotik kullanımı.
• **Koruma:** Kolostrum kalitesini ve buzağı kulübelerinin hijyenini denetleyin.`;
  }

  if (p.includes('süt humması') || p.includes('hipokalsemi')) {
    return `🥛 **Süt Humması (Puerperal Parezi):**

• **Gözlem:** Hayvanın S-pozisyonunda yatması, soğuk kulaklar, titreme.
• **Acil Müdahale:** IV Kalsiyum uygulaması (yavaş hızda).
• **Öneri:** Doğum öncesi düşük kalsiyum diyeti uygulanması riskleri azaltır.`;
  }

  if (p.includes('rapor') || p.includes('yaz')) {
    return `📝 **Vaka Raporu Taslağı:**

**Tarih:** ${new Date().toLocaleDateString('tr-TR')}
**Muayene Bulguları:** Genel durum orta, ateş normal.
**Tanı:** Beslenme kaynaklı hazımsızlık.
**Uygulanan Tedavi:** Rumen stimülanları ve B vitamini kompleksi verildi.`;
  }

  return `👋 Merhaba! Ben **MemoAI**.

Yerel modda çalışıyorum. Size şu konularda yardımcı olabilirim:

• **Şap hastalığı** belirtileri ve tedavisi
• **Buzağı ishali** protokolü  
• **Süt humması** müdahalesi
• **Vaka raporu** hazırlama

Sormak istediğiniz bir şey var mı?`;
};

const AIAssistant = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await getAIAssistantResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Bir hata oluştu. Lütfen tekrar deneyin.' }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Şap belirtileri', query: 'Şap hastalığı belirtileri nelerdir?' },
    { label: 'Buzağı ishali', query: 'Buzağı ishali tedavisi nasıl yapılır?' },
    { label: 'Rapor hazırla', query: 'Vaka raporu yaz' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] animate-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">MemoAI</h2>
            <p className="text-muted-foreground text-sm">Yerel veteriner asistanınız</p>
          </div>
        </div>
      </div>

      <div className="flex-1 section-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 shadow-glow animate-float">
                <Bot className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Merhaba!</h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-8">
                Veteriner sorularınızı yanıtlamak için buradayım. Hastalık belirtileri, tedavi protokolleri veya rapor hazırlama konusunda yardımcı olabilirim.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(action.query);
                    }}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-muted hover:bg-accent text-foreground transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'gradient-primary text-primary-foreground rounded-br-md' 
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start animate-in">
                  <div className="bg-muted p-4 rounded-2xl rounded-bl-md">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Düşünüyorum...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="mt-4 flex gap-3 pt-4 border-t border-border/50">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Bir soru sorun..."
            disabled={loading}
            className="input-modern flex-1"
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim()}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
