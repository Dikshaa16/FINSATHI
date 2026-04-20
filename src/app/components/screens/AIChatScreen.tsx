import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles, Send, Mic, TrendingUp, Target, PiggyBank,
  BarChart3, ChevronRight, RefreshCw, Copy, ThumbsUp,
} from "lucide-react";
import { useUser } from "../../Root";
import { useFinancialData } from "../../../hooks/useFinancialData";
import { useTransactions } from "../../../hooks/useTransactions";
import { useGoals } from "../../../hooks/useGoals";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
}

const suggestions = [
  { icon: TrendingUp, text: "How much did I spend on food this month?" },
  { icon: Target, text: "Help me save ₹1 lakh this year" },
  { icon: PiggyBank, text: "Best SIP funds for me right now?" },
  { icon: BarChart3, text: "Analyse my spending pattern" },
];

// Generate AI responses based on real user data
function generateAIResponse(msg: string, financialData: any, transactions: any[], goals: any[], userName: string): string {
  const lower = msg.toLowerCase();
  const { balance, monthlyIncome, currentExpenses, savings } = financialData;
  
  // Ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
  // Food spending analysis
  if (lower.includes("food") || lower.includes("swiggy") || lower.includes("zomato")) {
    const foodTransactions = safeTransactions.filter(tx => 
      tx.category?.toLowerCase().includes('food') || 
      tx.merchant?.toLowerCase().includes('swiggy') ||
      tx.merchant?.toLowerCase().includes('zomato') ||
      tx.description?.toLowerCase().includes('food')
    );
    const foodSpending = foodTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const avgMonthlyFood = foodSpending > 0 ? foodSpending : 8430; // fallback
    const suggestedBudget = Math.round(avgMonthlyFood * 0.75);
    const potentialSavings = avgMonthlyFood - suggestedBudget;
    
    return `You spent ₹${avgMonthlyFood.toLocaleString("en-IN")} on food this month${foodTransactions.length > 0 ? ` across ${foodTransactions.length} transactions` : ''}. ${foodTransactions.some(tx => tx.merchant?.toLowerCase().includes('swiggy')) ? 'Swiggy orders are a major contributor.' : ''}\n\n• Set a ₹${suggestedBudget.toLocaleString("en-IN")} food budget\n• Cook at home 3x a week\n• Estimated savings: ₹${potentialSavings.toLocaleString("en-IN")}/month\n\nShall I set up this budget for you?`;
  }
  
  // Savings goal analysis
  if (lower.includes("save") || lower.includes("lakh") || lower.includes("goal")) {
    const targetAmount = 100000;
    const monthsNeeded = monthlyIncome > 0 ? Math.ceil(targetAmount / (savings || monthlyIncome * 0.2)) : 8;
    const monthlySavingsNeeded = Math.ceil(targetAmount / 12);
    
    return `To save ₹1 lakh by year-end, you need ₹${monthlySavingsNeeded.toLocaleString("en-IN")}/month. Based on your income (₹${monthlyIncome.toLocaleString("en-IN")}) and current expenses (₹${currentExpenses.toLocaleString("en-IN")}), this is ${savings >= monthlySavingsNeeded ? 'very achievable' : 'challenging but possible'}!\n\n• Automate ₹${monthlySavingsNeeded.toLocaleString("en-IN")} to savings on salary day\n• Expected timeline: ${monthsNeeded} months\n• Current savings rate: ₹${savings.toLocaleString("en-IN")}/month\n\nWant me to set this up?`;
  }
  
  // Investment recommendations
  if (lower.includes("sip") || lower.includes("invest") || lower.includes("mutual")) {
    const investmentCapacity = Math.max(0, savings * 0.6);
    const largeCap = Math.round(investmentCapacity * 0.4);
    const midCap = Math.round(investmentCapacity * 0.3);
    const balanced = Math.round(investmentCapacity * 0.3);
    
    return `Based on your savings capacity (₹${savings.toLocaleString("en-IN")}/month) and moderate risk profile, I recommend:\n\n📈 Mirae Asset Large Cap — ₹${largeCap.toLocaleString("en-IN")}/mo\n📊 Axis Midcap Fund — ₹${midCap.toLocaleString("en-IN")}/mo\n⚖️ ICICI Balanced Advantage — ₹${balanced.toLocaleString("en-IN")}/mo\n\nTotal: ₹${(largeCap + midCap + balanced).toLocaleString("en-IN")}/month\nExpected 12% CAGR over 5 years. Shall I initiate these?`;
  }
  
  // Spending pattern analysis
  if (lower.includes("pattern") || lower.includes("analys") || lower.includes("spend")) {
    const categorySpending = safeTransactions.reduce((acc, tx) => {
      const category = tx.category || 'other';
      acc[category] = (acc[category] || 0) + Math.abs(tx.amount);
      return acc;
    }, {} as Record<string, number>);
    
    const sortedCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (sortedCategories.length === 0) {
      return `I don't have enough transaction data to analyze your spending patterns yet. Connect your SMS extraction or add some transactions manually to get personalized insights!\n\nOnce I have your data, I can show you:\n• Top spending categories\n• Monthly trends\n• Optimization opportunities\n• Budget recommendations`;
    }
    
    const total = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    let analysis = `Your spending breakdown this month:\n\n`;
    
    sortedCategories.forEach(([category, amount], index) => {
      const percentage = Math.round((amount / total) * 100);
      const emoji = getCategoryEmoji(category);
      analysis += `${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)} — ₹${amount.toLocaleString("en-IN")} (${percentage}%)\n`;
    });
    
    analysis += `\nTotal analyzed: ₹${total.toLocaleString("en-IN")}\nWant tips to optimize your spending?`;
    return analysis;
  }
  
  // Goals progress
  if (lower.includes("goal") && goals.length > 0) {
    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length === 0) {
      return `You have ${goals.length} goals, but none are currently active. Consider reactivating some goals or creating new ones to stay motivated!\n\nCompleted goals: ${goals.filter(g => g.status === 'completed').length}\nWant to create a new savings goal?`;
    }
    
    let response = `Here's your goals progress, ${userName}:\n\n`;
    activeGoals.slice(0, 3).forEach(goal => {
      const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
      response += `${goal.emoji || '🎯'} ${goal.name}: ${progress}% (₹${goal.currentAmount.toLocaleString("en-IN")} / ₹${goal.targetAmount.toLocaleString("en-IN")})\n`;
    });
    
    const totalGoalAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress = Math.round((totalSaved / totalGoalAmount) * 100);
    
    response += `\nOverall progress: ${overallProgress}%\nNeed help accelerating any goal?`;
    return response;
  }
  
  // Default response with personalized data
  return `Great question, ${userName}! Based on your financial profile:\n\n💰 Current Balance: ₹${balance.toLocaleString("en-IN")}\n📈 Monthly Income: ₹${monthlyIncome.toLocaleString("en-IN")}\n💸 This Month's Expenses: ₹${currentExpenses.toLocaleString("en-IN")}\n💎 Savings Rate: ₹${savings.toLocaleString("en-IN")}/month\n\n${goals.length > 0 ? `🎯 Active Goals: ${goals.filter(g => g.status === 'active').length}` : '🎯 No active goals yet'}\n\nYou're ${savings > monthlyIncome * 0.2 ? 'doing great with savings!' : 'on track, but there\'s room to optimize.'} What specific area would you like to improve?`;
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    food: "🍕",
    transport: "🚗", 
    shopping: "🛍️",
    entertainment: "🎬",
    utilities: "💡",
    healthcare: "🏥",
    education: "📚",
    other: "💳"
  };
  return emojis[category.toLowerCase()] || "💳";
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.15)" }}>
        <Sparkles size={13} color="#7C3AED" strokeWidth={1.8} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5" style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.3)" }}
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 0.9, delay: i * 0.2, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

export function AIChatScreen() {
  const { user } = useUser();
  const { balance, monthlyIncome, currentExpenses, savings, loading: financialLoading } = useFinancialData();
  const { transactions: rawTransactions, loading: transactionsLoading } = useTransactions(50); // Get more transactions for analysis
  const { goals, loading: goalsLoading } = useGoals();
  
  const firstName = user?.firstName || 'User';
  
  // Ensure transactions is always an array
  const transactions = Array.isArray(rawTransactions) ? rawTransactions : [];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      text: `Hey ${firstName}! 👋 I'm FIN AI — your personal money genius. I can help you understand your spending, plan investments, set savings goals, and much more.\n\nI'm analyzing your financial data to provide personalized insights. What would you like to explore today?`,
      time: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim(), time: "Now" };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);
    setShowSuggestions(false);

    const delay = 1500 + Math.random() * 800;
    setTimeout(() => {
      setTyping(false);
      const financialData = { balance, monthlyIncome, currentExpenses, savings };
      const aiResponse = generateAIResponse(text, financialData, transactions, goals, firstName);
      setMessages((p) => [...p, { id: Date.now() + 1, role: "ai", text: aiResponse, time: "Now" }]);
    }, delay);
  };

  const reset = () => {
    setMessages([{
      id: Date.now(),
      role: "ai",
      text: `Hey ${firstName}! 👋 I'm FIN AI — your personal money genius. What would you like to explore today?`,
      time: "Now",
    }]);
    setShowSuggestions(true);
    setTyping(false);
    setInput("");
  };

  // Show loading state while financial data is being fetched
  const isLoading = financialLoading || transactionsLoading || goalsLoading;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 68px)", maxHeight: "100vh" }}>
      {/* Header */}
      <div
        className="px-5 md:px-8 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(11,11,15,0.8)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(124,58,237,0.08))",
              border: "1px solid rgba(124,58,237,0.2)",
            }}
          >
            <Sparkles size={18} color="#7C3AED" strokeWidth={1.8} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p style={{ fontSize: "15px", color: "#fff" }}>FIN AI</p>
              <span
                className="px-1.5 py-0.5 rounded-full"
                style={{ fontSize: "9px", background: "rgba(124,58,237,0.2)", color: "#7C3AED", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                {isLoading ? "LOADING" : "LIVE"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: isLoading ? "#F59E0B" : "#00D68F" }} />
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                {isLoading ? "Analyzing your data..." : "AI-powered · Always learning"}
              </p>
            </div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={reset}
          className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <RefreshCw size={15} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
        </motion.button>
      </div>

      {/* Centering wrapper for desktop */}
      <div className="flex-1 flex flex-col overflow-hidden md:max-w-3xl md:mx-auto md:w-full">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 md:px-8 py-5 flex flex-col gap-4" style={{ scrollbarWidth: "none" }}>
          {/* Suggestions */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2"
              >
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", gridColumn: "1/-1", marginBottom: "4px" }}>
                  Suggested for you
                </p>
                {suggestions.map(({ icon: Icon, text }) => (
                  <motion.button
                    key={text}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => send(text)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl text-left"
                    style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <Icon size={14} color="rgba(255,255,255,0.4)" strokeWidth={1.8} />
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: "1.4" }}>{text}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "ai" && (
                  <div
                    className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mb-0.5"
                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.12)" }}
                  >
                    <Sparkles size={13} color="#7C3AED" strokeWidth={1.8} />
                  </div>
                )}
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className="px-4 py-3 rounded-2xl"
                    style={
                      msg.role === "user"
                        ? { background: "rgba(0,214,143,0.1)", border: "1px solid rgba(0,214,143,0.15)", borderBottomRightRadius: "4px" }
                        : { background: "#181820", border: "1px solid rgba(255,255,255,0.05)", borderBottomLeftRadius: "4px" }
                    }
                  >
                    <p style={{ fontSize: "13px", color: msg.role === "user" ? "#fff" : "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap", lineHeight: "1.55" }}>
                      {msg.text}
                    </p>
                  </div>
                  {msg.role === "ai" && (
                    <div className="flex items-center gap-2 ml-1">
                      <motion.button whileTap={{ scale: 0.9 }} className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                        <Copy size={11} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Copy</span>
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} className="flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                        <ThumbsUp size={11} color="rgba(255,255,255,0.5)" strokeWidth={1.8} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <TypingDots />
            </motion.div>
          )}

          {/* Quick replies */}
          {messages.length > 2 && !typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {["Tell me more", "Set this up for me", "Show my goals", "Cut my expenses"].map((q) => (
                <motion.button
                  key={q}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => send(q)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
                  style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>{q}</span>
                  <ChevronRight size={11} color="rgba(255,255,255,0.3)" strokeWidth={1.8} />
                </motion.button>
              ))}
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div
          className="flex-shrink-0 px-5 md:px-8 py-3 pb-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(11,11,15,0.8)" }}
        >
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask anything about your money..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: "13px", color: "#fff" }}
            />
            <div className="flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.9 }}>
                <Mic size={18} color="rgba(255,255,255,0.25)" strokeWidth={1.8} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => send(input)}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: input.trim() ? "#00D68F" : "rgba(255,255,255,0.05)", transition: "background 0.2s" }}
              >
                <Send size={14} color={input.trim() ? "#000" : "rgba(255,255,255,0.2)"} strokeWidth={2} />
              </motion.button>
            </div>
          </div>
          <p className="text-center mt-2" style={{ fontSize: "10px", color: "rgba(255,255,255,0.18)" }}>
            FIN AI may make mistakes. Always verify important financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
