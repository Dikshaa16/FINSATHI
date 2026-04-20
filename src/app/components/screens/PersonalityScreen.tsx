import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Brain,
  Target,
  Shield,
  Heart,
  Zap,
  Award,
  Star,
  Trophy,
  Sparkles,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { Button } from "../ui/button";
import { api } from "../../../services/api";

// Enhanced user financial data with comprehensive behavioral analysis
const USER_DATA = {
  monthlyIncome: 85000,
  currentBalance: 124350,
  spendingBehavior: {
    consistency: 0.85,
    impulsiveness: 0.25,
    savingsGoalAdherence: 0.78,
    riskTolerance: 0.65,
    planningHorizon: 0.72, // How far ahead they plan
    emotionalSpending: 0.30, // Spending based on emotions
    socialInfluence: 0.40, // Influenced by others' spending
    categoryDiscipline: {
      needs: 0.95,
      wants: 0.65,
      savings: 0.80,
    }
  },
  historicalData: {
    monthsTracked: 6,
    goalCompletionRate: 0.67,
    budgetAdherenceRate: 0.73,
    emergencyFundMonths: 3.2,
    investmentDiversification: 0.45,
    debtToIncomeRatio: 0.15,
    savingsRate: 0.22,
    spendingVolatility: 0.18
  }
};

// Financial personality types with detailed profiles
const PERSONALITY_TYPES = {
  'disciplined-saver': {
    name: 'Disciplined Saver',
    emoji: '🎯',
    color: '#00D68F',
    bgColor: 'rgba(0,214,143,0.1)',
    description: 'You have excellent financial discipline and consistently save towards your goals.',
    traits: ['Goal-oriented', 'Consistent', 'Risk-aware', 'Future-focused'],
    strengths: [
      'Excellent savings discipline',
      'Consistent spending patterns',
      'Strong goal adherence',
      'Good emergency planning'
    ],
    improvements: [
      'Consider increasing investment risk for higher returns',
      'Allow some flexibility for lifestyle enjoyment',
      'Explore new income opportunities'
    ],
    scoreRange: [80, 100]
  },
  'balanced-planner': {
    name: 'Balanced Planner',
    emoji: '⚖️',
    color: '#7C3AED',
    bgColor: 'rgba(124,58,237,0.1)',
    description: 'You maintain a healthy balance between saving, spending, and enjoying life.',
    traits: ['Balanced', 'Practical', 'Adaptable', 'Moderate risk'],
    strengths: [
      'Good balance between saving and spending',
      'Reasonable financial planning',
      'Moderate risk tolerance',
      'Flexible approach to money'
    ],
    improvements: [
      'Increase savings rate during high-income periods',
      'Set more specific financial goals',
      'Track spending more consistently'
    ],
    scoreRange: [60, 79]
  },
  'impulsive-spender': {
    name: 'Impulsive Spender',
    emoji: '🛍️',
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.1)',
    description: 'You enjoy spending and sometimes make purchases without much planning.',
    traits: ['Spontaneous', 'Present-focused', 'Social', 'Experience-driven'],
    strengths: [
      'Enjoys life and experiences',
      'Adaptable to opportunities',
      'Good at earning money',
      'Socially engaged'
    ],
    improvements: [
      'Implement 24-hour purchase delays',
      'Set up automatic savings',
      'Create specific spending budgets',
      'Track emotional spending triggers'
    ],
    scoreRange: [40, 59]
  },
  'anxious-saver': {
    name: 'Anxious Saver',
    emoji: '😰',
    color: '#EF4444',
    bgColor: 'rgba(239,68,68,0.1)',
    description: 'You worry about money and tend to over-save at the expense of current enjoyment.',
    traits: ['Cautious', 'Worry-prone', 'Risk-averse', 'Security-focused'],
    strengths: [
      'Strong emergency fund',
      'Very low debt levels',
      'Excellent at avoiding financial risks',
      'Long-term security focused'
    ],
    improvements: [
      'Allow some money for current enjoyment',
      'Consider moderate investment opportunities',
      'Set lifestyle spending goals',
      'Practice mindful money decisions'
    ],
    scoreRange: [20, 39]
  },
  'financial-novice': {
    name: 'Financial Novice',
    emoji: '🌱',
    color: '#10B981',
    bgColor: 'rgba(16,185,129,0.1)',
    description: 'You\'re just starting your financial journey and learning about money management.',
    traits: ['Learning', 'Growing', 'Curious', 'Developing'],
    strengths: [
      'Open to learning',
      'Growing financial awareness',
      'Willing to improve',
      'Starting good habits'
    ],
    improvements: [
      'Learn basic budgeting principles',
      'Start with simple savings goals',
      'Track spending for awareness',
      'Build emergency fund gradually'
    ],
    scoreRange: [0, 19]
  }
};

// Comprehensive personality scoring algorithm
function calculatePersonalityScore(behaviorData: typeof USER_DATA.spendingBehavior, historicalData: typeof USER_DATA.historicalData) {
  let score = 0;
  const weights = {
    consistency: 15,
    savingsGoalAdherence: 20,
    budgetAdherence: 15,
    emergencyFund: 15,
    savingsRate: 15,
    impulsiveness: -10, // Negative weight
    emotionalSpending: -8,
    spendingVolatility: -7,
    goalCompletion: 10,
    riskTolerance: 5,
    planningHorizon: 10
  };
  
  // Positive factors
  score += behaviorData.consistency * weights.consistency;
  score += behaviorData.savingsGoalAdherence * weights.savingsGoalAdherence;
  score += historicalData.budgetAdherenceRate * weights.budgetAdherence;
  score += Math.min(historicalData.emergencyFundMonths / 6, 1) * weights.emergencyFund;
  score += Math.min(historicalData.savingsRate / 0.2, 1) * weights.savingsRate;
  score += historicalData.goalCompletionRate * weights.goalCompletion;
  score += behaviorData.riskTolerance * weights.riskTolerance;
  score += behaviorData.planningHorizon * weights.planningHorizon;
  
  // Negative factors (higher values reduce score)
  score += (1 - behaviorData.impulsiveness) * Math.abs(weights.impulsiveness);
  score += (1 - behaviorData.emotionalSpending) * Math.abs(weights.emotionalSpending);
  score += (1 - historicalData.spendingVolatility) * Math.abs(weights.spendingVolatility);
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Determine personality type based on score and behavior patterns
function determinePersonalityType(score: number, behaviorData: typeof USER_DATA.spendingBehavior) {
  // Special cases based on behavior patterns
  if (behaviorData.impulsiveness > 0.6 && score < 70) {
    return 'impulsive-spender';
  }
  
  if (behaviorData.consistency > 0.9 && behaviorData.savingsGoalAdherence > 0.8 && score >= 80) {
    return 'disciplined-saver';
  }
  
  if (behaviorData.emotionalSpending < 0.2 && behaviorData.riskTolerance < 0.3) {
    return 'anxious-saver';
  }
  
  // Default to score-based determination
  for (const [typeId, type] of Object.entries(PERSONALITY_TYPES)) {
    if (score >= type.scoreRange[0] && score <= type.scoreRange[1]) {
      return typeId;
    }
  }
  
  return 'balanced-planner';
}

// Generate personalized insights and recommendations
function generatePersonalizedInsights(personalityType: string, score: number, behaviorData: typeof USER_DATA.spendingBehavior) {
  const insights = [];
  
  // Score-based insights
  if (score >= 80) {
    insights.push({
      type: 'achievement',
      title: 'Excellent Financial Health',
      message: 'Your financial discipline is in the top 20% of users',
      icon: <Trophy size={16} color="#00D68F" />
    });
  } else if (score >= 60) {
    insights.push({
      type: 'positive',
      title: 'Good Financial Foundation',
      message: 'You have solid financial habits with room for optimization',
      icon: <CheckCircle size={16} color="#7C3AED" />
    });
  } else {
    insights.push({
      type: 'improvement',
      title: 'Growth Opportunity',
      message: 'Focus on building consistent financial habits',
      icon: <Target size={16} color="#F59E0B" />
    });
  }
  
  // Behavior-specific insights
  if (behaviorData.consistency > 0.8) {
    insights.push({
      type: 'strength',
      title: 'Consistent Spender',
      message: 'Your spending patterns are predictable and manageable',
      icon: <Activity size={16} color="#00D68F" />
    });
  }
  
  if (behaviorData.impulsiveness > 0.4) {
    insights.push({
      type: 'warning',
      title: 'Impulse Control',
      message: 'Consider implementing purchase delays for non-essential items',
      icon: <AlertTriangle size={16} color="#F59E0B" />
    });
  }
  
  if (behaviorData.savingsGoalAdherence > 0.75) {
    insights.push({
      type: 'achievement',
      title: 'Goal Achiever',
      message: 'You consistently work towards your financial goals',
      icon: <Award size={16} color="#00D68F" />
    });
  }
  
  return insights;
}

export function PersonalityScreen() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [personalityScore, setPersonalityScore] = useState(0);
  const [personalityType, setPersonalityType] = useState<string>('');
  const [insights, setInsights] = useState<any[]>([]);
  const [animatedScore, setAnimatedScore] = useState(0);

  const runPersonalityAnalysis = async () => {
    setIsAnalyzing(true);
    setShowResults(false);
    
    try {
      // Try to get real analysis from backend
      const response = await api.analyzePersonality();
      
      if (response.data) {
        // Use real backend data
        const { score, personalityType, behaviorData, insights } = response.data;
        setPersonalityScore(score);
        setPersonalityType(personalityType.id);
        setInsights(insights);
        setIsAnalyzing(false);
        setShowResults(true);
        
        // Animate score counter
        let current = 0;
        const increment = score / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= score) {
            setAnimatedScore(score);
            clearInterval(timer);
          } else {
            setAnimatedScore(Math.floor(current));
          }
        }, 30);
        
        return;
      }
    } catch (error) {
      console.log('Backend not available, using mock data');
    }
    
    // Fallback to mock analysis if backend is not available
    setTimeout(() => {
      const score = calculatePersonalityScore(USER_DATA.spendingBehavior, USER_DATA.historicalData);
      const type = determinePersonalityType(score, USER_DATA.spendingBehavior);
      const personalizedInsights = generatePersonalizedInsights(type, score, USER_DATA.spendingBehavior);
      
      setPersonalityScore(score);
      setPersonalityType(type);
      setInsights(personalizedInsights);
      setIsAnalyzing(false);
      setShowResults(true);
      
      // Animate score counter
      let current = 0;
      const increment = score / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, 30);
      
    }, 3500); // Longer analysis time for comprehensive feel
  };

  const currentPersonality = personalityType ? PERSONALITY_TYPES[personalityType as keyof typeof PERSONALITY_TYPES] : null;

  return (
    <div className="px-5 md:px-8 pt-5 md:pt-6 pb-8" style={{ color: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-xl"
          style={{ background: "#181820", border: "1px solid rgba(255,255,255,0.06)" }}
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={18} color="rgba(255,255,255,0.7)" />
        </Button>
        <div>
          <h1 style={{ fontSize: "24px", color: "#fff", fontWeight: 600 }}>
            Financial Personality
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            AI-powered behavioral analysis & scoring
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* Analysis Trigger */}
        {!showResults && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-8 mb-6 text-center"
            style={{
              background: "linear-gradient(145deg, #14141f 0%, #1a1a2e 100%)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                 style={{ background: "rgba(124,58,237,0.2)" }}>
              <Brain size={40} color="#7C3AED" />
            </div>
            
            <h2 style={{ fontSize: "28px", color: "#fff", marginBottom: "16px", fontWeight: 600 }}>
              Discover Your Financial Personality
            </h2>
            
            <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: "1.6" }}>
              Our AI analyzes your spending patterns, savings behavior, and financial decisions to create 
              a comprehensive personality profile with personalized insights and recommendations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <BarChart3 size={24} color="#00D68F" />, title: "Spending Analysis", desc: "Pattern recognition & consistency scoring" },
                { icon: <Target size={24} color="#7C3AED" />, title: "Goal Behavior", desc: "Achievement rates & planning horizon" },
                { icon: <PieChart size={24} color="#F59E0B" />, title: "Risk Profile", desc: "Investment tolerance & decision making" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="p-4 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                       style={{ background: "rgba(255,255,255,0.05)" }}>
                    {item.icon}
                  </div>
                  <h4 style={{ fontSize: "14px", color: "#fff", marginBottom: "4px" }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
            
            <Button
              onClick={runPersonalityAnalysis}
              className="h-14 px-8 text-lg"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                border: "none",
                borderRadius: "16px"
              }}
            >
              <Sparkles size={20} className="mr-3" />
              Analyze My Personality
            </Button>
          </motion.div>
        )}

        {/* Analysis Progress */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl p-8 mb-6 text-center"
              style={{
                background: "#181820",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: "rgba(124,58,237,0.2)" }}
              >
                <Brain size={32} color="#7C3AED" />
              </motion.div>
              
              <h3 style={{ fontSize: "20px", color: "#fff", marginBottom: "16px" }}>
                AI Personality Analysis in Progress
              </h3>
              
              <div className="space-y-3 mb-6">
                {[
                  "Analyzing 6 months of spending data...",
                  "Evaluating goal achievement patterns...",
                  "Assessing risk tolerance and decision making...",
                  "Calculating behavioral consistency scores...",
                  "Identifying personality type and traits...",
                  "Generating personalized recommendations..."
                ].map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: "#7C3AED" }} />
                    <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
              
              <div className="w-full h-2 rounded-full overflow-hidden"
                   style={{ background: "rgba(255,255,255,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #7C3AED, #5B21B6)" }}
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 3.5, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResults && currentPersonality && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Personality Card */}
              <motion.div
                className="rounded-3xl p-8"
                style={{
                  background: currentPersonality.bgColor,
                  border: `1px solid ${currentPersonality.color}30`
                }}
              >
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">{currentPersonality.emoji}</div>
                  <h2 style={{ fontSize: "32px", color: currentPersonality.color, marginBottom: "8px", fontWeight: 600 }}>
                    {currentPersonality.name}
                  </h2>
                  <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)", marginBottom: "24px" }}>
                    {currentPersonality.description}
                  </p>
                  
                  {/* Score Display */}
                  <div className="flex items-center justify-center gap-8 mb-6">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center relative"
                           style={{ background: `${currentPersonality.color}20` }}>
                        <span style={{ fontSize: "28px", color: currentPersonality.color, fontWeight: 700 }}>
                          {animatedScore}
                        </span>
                        <div className="absolute inset-0 rounded-full"
                             style={{
                               background: `conic-gradient(${currentPersonality.color} ${animatedScore * 3.6}deg, rgba(255,255,255,0.1) 0deg)`
                             }} />
                      </div>
                      <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                        Financial Score
                      </p>
                    </div>
                    
                    <div className="text-left">
                      <h4 style={{ fontSize: "16px", color: "#fff", marginBottom: "8px" }}>
                        Key Traits
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentPersonality.traits.map((trait, index) => (
                          <span
                            key={trait}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              background: `${currentPersonality.color}20`,
                              color: currentPersonality.color
                            }}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 style={{ fontSize: "16px", color: "#00D68F", marginBottom: "12px" }}>
                      💪 Your Strengths
                    </h4>
                    <div className="space-y-2">
                      {currentPersonality.strengths.map((strength, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle size={16} color="#00D68F" className="mt-0.5 flex-shrink-0" />
                          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
                            {strength}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{ fontSize: "16px", color: "#F59E0B", marginBottom: "12px" }}>
                      🎯 Areas to Improve
                    </h4>
                    <div className="space-y-2">
                      {currentPersonality.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Target size={16} color="#F59E0B" className="mt-0.5 flex-shrink-0" />
                          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
                            {improvement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Behavioral Insights */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-6"
                style={{
                  background: "#181820",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <h4 style={{ fontSize: "18px", color: "#fff", marginBottom: "20px" }}>
                  Behavioral Analysis
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Spending Consistency", value: Math.round(USER_DATA.spendingBehavior.consistency * 100), color: "#00D68F" },
                    { label: "Goal Adherence", value: Math.round(USER_DATA.spendingBehavior.savingsGoalAdherence * 100), color: "#7C3AED" },
                    { label: "Risk Tolerance", value: Math.round(USER_DATA.spendingBehavior.riskTolerance * 100), color: "#F59E0B" },
                    { label: "Planning Horizon", value: Math.round(USER_DATA.spendingBehavior.planningHorizon * 100), color: "#5B8DEF" }
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="text-center p-4 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                           style={{ background: `${metric.color}20` }}>
                        <span style={{ fontSize: "18px", color: metric.color, fontWeight: 600 }}>
                          {metric.value}%
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                        {metric.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Personalized Insights */}
              {insights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-2xl p-6"
                  style={{
                    background: "#181820",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <h4 style={{ fontSize: "18px", color: "#fff", marginBottom: "20px" }}>
                    Personalized Insights
                  </h4>
                  
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-start gap-3 p-4 rounded-xl"
                        style={{
                          background: insight.type === 'achievement' 
                            ? "rgba(0,214,143,0.05)" 
                            : insight.type === 'warning'
                            ? "rgba(245,158,11,0.05)"
                            : "rgba(124,58,237,0.05)"
                        }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          {insight.icon}
                        </div>
                        <div className="flex-1">
                          <h5 style={{ fontSize: "14px", color: "#fff", marginBottom: "4px" }}>
                            {insight.title}
                          </h5>
                          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
                            {insight.message}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Share Results */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <Button
                  className="h-12 px-8"
                  style={{
                    background: "linear-gradient(135deg, #00D68F, #00b377)",
                    border: "none",
                    borderRadius: "12px"
                  }}
                >
                  <Star size={18} className="mr-2" />
                  Share My Financial Personality
                </Button>
                
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "12px" }}>
                  Show your friends how financially smart you are!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}