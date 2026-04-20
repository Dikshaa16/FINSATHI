import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Brain,
  Target,
  Shield,
  Heart,
  ShoppingBag,
  PiggyBank,
  Settings,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { Button } from "../ui/button";

// Enhanced user financial data with behavioral patterns
const USER_DATA = {
  monthlyIncome: 85000,
  currentBalance: 124350,
  spendingBehavior: {
    consistency: 0.85, // 85% consistent spending
    impulsiveness: 0.25, // 25% impulsive purchases
    savingsGoalAdherence: 0.78, // 78% goal adherence
    categoryDiscipline: {
      needs: 0.95, // Very disciplined with needs
      wants: 0.65, // Moderately disciplined with wants
      savings: 0.80, // Good savings discipline
    }
  },
  historicalData: {
    lastMonthSavings: 18500,
    averageWantsSpending: 22000,
    averageNeedsSpending: 32000,
    savingsGoalMisses: 2, // Last 2 months missed savings target
    impulsePurchases: 3, // Last month
  }
};

// Money flow categories with intelligent defaults
interface FlowCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  defaultPercentage: number;
  currentPercentage: number;
  priority: 'high' | 'medium' | 'low';
  adaptable: boolean;
}

const FLOW_CATEGORIES: FlowCategory[] = [
  {
    id: 'needs',
    name: 'Needs',
    icon: <Shield size={20} color="#00D68F" />,
    color: '#00D68F',
    bgColor: 'rgba(0,214,143,0.1)',
    description: 'Rent, utilities, groceries, transport',
    defaultPercentage: 50,
    currentPercentage: 50,
    priority: 'high',
    adaptable: false
  },
  {
    id: 'wants',
    name: 'Wants',
    icon: <Heart size={20} color="#7C3AED" />,
    color: '#7C3AED',
    bgColor: 'rgba(124,58,237,0.1)',
    description: 'Entertainment, dining, shopping',
    defaultPercentage: 30,
    currentPercentage: 30,
    priority: 'medium',
    adaptable: true
  },
  {
    id: 'savings',
    name: 'Savings',
    icon: <PiggyBank size={20} color="#F59E0B" />,
    color: '#F59E0B',
    bgColor: 'rgba(245,158,11,0.1)',
    description: 'Emergency fund, investments, goals',
    defaultPercentage: 20,
    currentPercentage: 20,
    priority: 'high',
    adaptable: true
  }
];

// AI-powered flow optimization engine
function optimizeMoneyFlow(
  income: number,
  behaviorData: typeof USER_DATA.spendingBehavior,
  historicalData: typeof USER_DATA.historicalData
): FlowCategory[] {
  const optimizedFlow = [...FLOW_CATEGORIES];
  
  // Analyze spending behavior patterns
  const { consistency, impulsiveness, savingsGoalAdherence, categoryDiscipline } = behaviorData;
  const { savingsGoalMisses, impulsePurchases, lastMonthSavings } = historicalData;
  
  // Dynamic adjustment based on behavior
  optimizedFlow.forEach(category => {
    if (!category.adaptable) return;
    
    switch (category.id) {
      case 'wants':
        // Reduce wants if user is impulsive or overspending
        if (impulsiveness > 0.3 || impulsePurchases > 5) {
          category.currentPercentage = Math.max(20, category.defaultPercentage - 5);
        }
        // Increase wants if user is very disciplined
        else if (categoryDiscipline.wants > 0.8 && consistency > 0.9) {
          category.currentPercentage = Math.min(35, category.defaultPercentage + 5);
        }
        break;
        
      case 'savings':
        // Increase savings if user missed goals (motivation boost)
        if (savingsGoalMisses > 1) {
          category.currentPercentage = Math.min(30, category.defaultPercentage + 5);
        }
        // Maintain higher savings if user is consistent
        else if (savingsGoalAdherence > 0.8) {
          category.currentPercentage = Math.min(25, category.defaultPercentage + 3);
        }
        // Reduce slightly if user consistently oversaves (lifestyle balance)
        else if (lastMonthSavings > income * 0.25) {
          category.currentPercentage = Math.max(15, category.defaultPercentage - 2);
        }
        break;
    }
  });
  
  // Ensure percentages add up to 100%
  const totalPercentage = optimizedFlow.reduce((sum, cat) => sum + cat.currentPercentage, 0);
  if (totalPercentage !== 100) {
    const diff = 100 - totalPercentage;
    // Adjust the most adaptable category (wants)
    const wantsCategory = optimizedFlow.find(cat => cat.id === 'wants');
    if (wantsCategory) {
      wantsCategory.currentPercentage = Math.max(15, Math.min(40, wantsCategory.currentPercentage + diff));
    }
  }
  
  return optimizedFlow;
}

// Flow automation states
type AutoFlowState = 'inactive' | 'analyzing' | 'active' | 'paused';

interface FlowInsight {
  type: 'optimization' | 'warning' | 'achievement';
  message: string;
  impact: string;
  action?: string;
}

export function AutoFlowScreen() {
  const [flowState, setFlowState] = useState<AutoFlowState>('inactive');
  const [categories, setCategories] = useState<FlowCategory[]>(FLOW_CATEGORIES);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [insights, setInsights] = useState<FlowInsight[]>([]);
  const [monthlyAllocations, setMonthlyAllocations] = useState<{[key: string]: number}>({});

  // Initialize optimized flow on component mount
  useEffect(() => {
    const optimizedCategories = optimizeMoneyFlow(
      USER_DATA.monthlyIncome,
      USER_DATA.spendingBehavior,
      USER_DATA.historicalData
    );
    setCategories(optimizedCategories);
    
    // Calculate monthly allocations
    const allocations: {[key: string]: number} = {};
    optimizedCategories.forEach(cat => {
      allocations[cat.id] = Math.round((USER_DATA.monthlyIncome * cat.currentPercentage) / 100);
    });
    setMonthlyAllocations(allocations);
    
    // Generate insights
    generateInsights(optimizedCategories);
  }, []);

  const generateInsights = (cats: FlowCategory[]) => {
    const newInsights: FlowInsight[] = [];
    
    // Check for optimizations
    const wantsCategory = cats.find(cat => cat.id === 'wants');
    const savingsCategory = cats.find(cat => cat.id === 'savings');
    
    if (wantsCategory && wantsCategory.currentPercentage < wantsCategory.defaultPercentage) {
      newInsights.push({
        type: 'optimization',
        message: 'Wants budget reduced due to recent impulsive spending',
        impact: `Saving ₹${Math.round(USER_DATA.monthlyIncome * 0.05)} monthly`,
        action: 'Track spending for 2 weeks to restore full budget'
      });
    }
    
    if (savingsCategory && savingsCategory.currentPercentage > savingsCategory.defaultPercentage) {
      newInsights.push({
        type: 'achievement',
        message: 'Savings rate increased due to missed goals',
        impact: `Extra ₹${Math.round(USER_DATA.monthlyIncome * 0.05)} towards goals`,
        action: 'Stay consistent to maintain this boost'
      });
    }
    
    if (USER_DATA.spendingBehavior.impulsiveness > 0.3) {
      newInsights.push({
        type: 'warning',
        message: 'High impulsive spending detected',
        impact: 'May affect long-term financial goals',
        action: 'Enable spending alerts and 24-hour purchase delays'
      });
    }
    
    setInsights(newInsights);
  };

  const startAutoFlow = () => {
    setIsOptimizing(true);
    setFlowState('analyzing');
    
    // Simulate AI analysis
    setTimeout(() => {
      setFlowState('active');
      setIsOptimizing(false);
    }, 3000);
  };

  const pauseAutoFlow = () => {
    setFlowState('paused');
  };

  const resetToDefaults = () => {
    const resetCategories = FLOW_CATEGORIES.map(cat => ({
      ...cat,
      currentPercentage: cat.defaultPercentage
    }));
    setCategories(resetCategories);
    
    const allocations: {[key: string]: number} = {};
    resetCategories.forEach(cat => {
      allocations[cat.id] = Math.round((USER_DATA.monthlyIncome * cat.currentPercentage) / 100);
    });
    setMonthlyAllocations(allocations);
    setFlowState('inactive');
  };

  const getStateColor = (state: AutoFlowState) => {
    switch (state) {
      case 'active': return '#00D68F';
      case 'analyzing': return '#7C3AED';
      case 'paused': return '#F59E0B';
      default: return 'rgba(255,255,255,0.4)';
    }
  };

  const getStateText = (state: AutoFlowState) => {
    switch (state) {
      case 'active': return 'Auto Flow Active';
      case 'analyzing': return 'Analyzing Patterns...';
      case 'paused': return 'Auto Flow Paused';
      default: return 'Auto Flow Inactive';
    }
  };

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
            Auto Money Flow
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Intelligent income allocation system
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl p-6 mb-6"
          style={{
            background: "linear-gradient(145deg, #14141f 0%, #1a1a2e 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" 
                   style={{ background: "rgba(0,214,143,0.2)" }}>
                <Zap size={24} color="#00D68F" />
              </div>
              <div>
                <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "4px" }}>
                  {getStateText(flowState)}
                </h3>
                <p style={{ fontSize: "13px", color: getStateColor(flowState) }}>
                  {flowState === 'active' && "Automatically optimizing your money allocation"}
                  {flowState === 'analyzing' && "Running behavioral analysis and optimization"}
                  {flowState === 'paused' && "Flow optimization temporarily paused"}
                  {flowState === 'inactive' && "Ready to start intelligent money management"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {flowState === 'inactive' && (
                <Button
                  onClick={startAutoFlow}
                  disabled={isOptimizing}
                  className="h-10 px-4"
                  style={{
                    background: "linear-gradient(135deg, #00D68F, #00b377)",
                    border: "none"
                  }}
                >
                  <Play size={16} className="mr-2" />
                  Start Auto Flow
                </Button>
              )}
              
              {flowState === 'active' && (
                <Button
                  onClick={pauseAutoFlow}
                  className="h-10 px-4"
                  style={{
                    background: "rgba(245,158,11,0.2)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    color: "#F59E0B"
                  }}
                >
                  <Pause size={16} className="mr-2" />
                  Pause
                </Button>
              )}
              
              {(flowState === 'paused' || flowState === 'active') && (
                <Button
                  onClick={resetToDefaults}
                  variant="ghost"
                  className="h-10 px-4"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                >
                  <RotateCcw size={16} className="mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Analysis Progress */}
          <AnimatePresence>
            {isOptimizing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(124,58,237,0.2)" }}
                  >
                    <Brain size={16} color="#7C3AED" />
                  </motion.div>
                  <span style={{ fontSize: "14px", color: "#fff" }}>
                    AI Behavioral Analysis in Progress
                  </span>
                </div>
                
                <div className="space-y-2">
                  {[
                    "Analyzing spending consistency patterns...",
                    "Evaluating impulsive purchase behavior...",
                    "Assessing savings goal adherence...",
                    "Optimizing category allocations...",
                    "Generating personalized recommendations..."
                  ].map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.5 }}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ background: "#7C3AED" }} />
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                        {step}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Money Flow Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: "#181820",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <h4 style={{ fontSize: "18px", color: "#fff", marginBottom: "20px" }}>
            Monthly Income Allocation
          </h4>
          
          {/* Visual Flow Animation */}
          {flowState === 'active' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-4 rounded-xl relative overflow-hidden"
              style={{ background: "rgba(0,214,143,0.05)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,214,143,0.2)" }}
                >
                  <Zap size={20} color="#00D68F" />
                </motion.div>
                <div>
                  <p style={{ fontSize: "14px", color: "#00D68F" }}>
                    Auto Flow Active
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    Money is being automatically allocated based on your behavior
                  </p>
                </div>
              </div>
              
              {/* Flowing money animation */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden"
                     style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #00D68F, #7C3AED, #F59E0B)" }}
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <span style={{ fontSize: "12px", color: "#00D68F" }}>
                  ₹{USER_DATA.monthlyIncome.toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}
          
          {/* Flow Bars */}
          <div className="space-y-4 mb-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                         style={{ background: category.bgColor }}>
                      {category.icon}
                    </div>
                    <div>
                      <span style={{ fontSize: "14px", color: "#fff" }}>
                        {category.name}
                      </span>
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span style={{ fontSize: "16px", color: category.color }}>
                      {category.currentPercentage}%
                    </span>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      ₹{monthlyAllocations[category.id]?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 rounded-full overflow-hidden"
                     style={{ background: "rgba(255,255,255,0.05)" }}>
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${category.currentPercentage}%` }}
                    transition={{ duration: 1.5, delay: 0.5 + index * 0.2, ease: "easeOut" }}
                    style={{ background: category.color }}
                  >
                    {/* Flow animation */}
                    {flowState === 'active' && (
                      <motion.div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)"
                        }}
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: index * 0.3 }}
                      />
                    )}
                  </motion.div>
                </div>
                
                {/* Change indicator */}
                {category.currentPercentage !== category.defaultPercentage && (
                  <div className="flex items-center gap-1 mt-1">
                    {category.currentPercentage > category.defaultPercentage ? (
                      <TrendingUp size={12} color="#00D68F" />
                    ) : (
                      <TrendingDown size={12} color="#F59E0B" />
                    )}
                    <span style={{ 
                      fontSize: "10px", 
                      color: category.currentPercentage > category.defaultPercentage ? "#00D68F" : "#F59E0B" 
                    }}>
                      {category.currentPercentage > category.defaultPercentage ? "+" : ""}
                      {category.currentPercentage - category.defaultPercentage}% from default
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Total Verification */}
          <div className="flex items-center justify-between p-3 rounded-xl"
               style={{ background: "rgba(0,214,143,0.05)", border: "1px solid rgba(0,214,143,0.1)" }}>
            <span style={{ fontSize: "14px", color: "#fff" }}>
              Total Monthly Income
            </span>
            <span style={{ fontSize: "16px", color: "#00D68F" }}>
              ₹{USER_DATA.monthlyIncome.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl p-5 mb-6"
            style={{
              background: "#181820",
              border: "1px solid rgba(255,255,255,0.05)"
            }}
          >
            <h4 style={{ fontSize: "16px", color: "#fff", marginBottom: "16px" }}>
              AI Behavioral Insights
            </h4>
            
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{
                    background: insight.type === 'achievement' 
                      ? "rgba(0,214,143,0.05)" 
                      : insight.type === 'warning'
                      ? "rgba(239,68,68,0.05)"
                      : "rgba(124,58,237,0.05)"
                  }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {insight.type === 'achievement' && (
                      <CheckCircle size={16} color="#00D68F" />
                    )}
                    {insight.type === 'warning' && (
                      <AlertTriangle size={16} color="#EF4444" />
                    )}
                    {insight.type === 'optimization' && (
                      <Sparkles size={16} color="#7C3AED" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: "14px", color: "#fff", marginBottom: "4px" }}>
                      {insight.message}
                    </p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "8px" }}>
                      Impact: {insight.impact}
                    </p>
                    {insight.action && (
                      <p style={{ fontSize: "11px", color: "#7C3AED" }}>
                        Action: {insight.action}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Behavioral Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,214,143,0.08))",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
        >
          <h4 style={{ fontSize: "16px", color: "#fff", marginBottom: "16px" }}>
            Spending Behavior Analysis
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                   style={{ background: "rgba(0,214,143,0.15)" }}>
                <div className="text-center">
                  <div style={{ fontSize: "18px", color: "#00D68F", fontWeight: 600 }}>
                    {Math.round(USER_DATA.spendingBehavior.consistency * 100)}%
                  </div>
                  <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>
                    CONSISTENCY
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Spending Consistency
              </p>
              <p style={{ fontSize: "10px", color: "#00D68F" }}>
                Very Consistent
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                   style={{ background: "rgba(245,158,11,0.15)" }}>
                <div className="text-center">
                  <div style={{ fontSize: "18px", color: "#F59E0B", fontWeight: 600 }}>
                    {Math.round(USER_DATA.spendingBehavior.impulsiveness * 100)}%
                  </div>
                  <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>
                    IMPULSE
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Impulsive Spending
              </p>
              <p style={{ fontSize: "10px", color: "#F59E0B" }}>
                Moderate Risk
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                   style={{ background: "rgba(124,58,237,0.15)" }}>
                <div className="text-center">
                  <div style={{ fontSize: "18px", color: "#7C3AED", fontWeight: 600 }}>
                    {Math.round(USER_DATA.spendingBehavior.savingsGoalAdherence * 100)}%
                  </div>
                  <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>
                    GOALS
                  </div>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                Goal Adherence
              </p>
              <p style={{ fontSize: "10px", color: "#7C3AED" }}>
                Good Progress
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}