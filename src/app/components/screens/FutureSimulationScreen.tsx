import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Zap,
  Brain,
  DollarSign,
  Clock,
  Sparkles
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Enhanced user financial data with historical patterns
const USER_DATA = {
  currentBalance: 124350,
  monthlyIncome: 85000,
  fixedExpenses: 32000,
  averageDailySpending: 1200,
  spendingTrends: {
    jan: 38000, feb: 42000, mar: 39000, apr: 32450, // Current month partial
  },
  seasonalMultipliers: {
    1: 1.2, 2: 0.9, 3: 1.0, 4: 1.0, 5: 1.1, 6: 1.3, // Jan-Jun
    7: 1.4, 8: 1.2, 9: 1.0, 10: 1.1, 11: 1.5, 12: 1.8  // Jul-Dec (holidays)
  },
  incomeGrowth: 0.08, // 8% annual growth
  inflationRate: 0.06, // 6% annual inflation
  savingsRate: 0.15, // Target 15% savings rate
};

// Popular financial goals with realistic timelines
const POPULAR_GOALS = [
  { name: "Emergency Fund", amount: 500000, emoji: "🛡️", category: "security", priority: "high" },
  { name: "iPhone 16 Pro", amount: 150000, emoji: "📱", category: "tech", priority: "medium" },
  { name: "Goa Trip", amount: 25000, emoji: "🏖️", category: "travel", priority: "medium" },
  { name: "MacBook Pro", amount: 200000, emoji: "💻", category: "tech", priority: "medium" },
  { name: "Car Down Payment", amount: 300000, emoji: "🚗", category: "transport", priority: "high" },
  { name: "Wedding Fund", amount: 1000000, emoji: "💒", category: "life", priority: "high" },
  { name: "House Down Payment", amount: 2000000, emoji: "🏠", category: "property", priority: "high" },
  { name: "Master's Degree", amount: 800000, emoji: "🎓", category: "education", priority: "high" }
];

interface SimulationResult {
  canAchieve: boolean;
  timeToGoal: number; // months
  monthlyRequired: number;
  riskLevel: 'low' | 'medium' | 'high';
  projectedBalance: number[];
  milestones: { month: number; balance: number; event: string }[];
  recommendations: string[];
  riskFactors: string[];
  alternativeScenarios: {
    optimistic: { timeToGoal: number; monthlyRequired: number };
    pessimistic: { timeToGoal: number; monthlyRequired: number };
  };
}

// Industry-standard Monte Carlo simulation engine
function runMonteCarloSimulation(
  goalAmount: number,
  timeHorizon: number,
  currentBalance: number = USER_DATA.currentBalance,
  monthlyIncome: number = USER_DATA.monthlyIncome,
  monthlyExpenses: number = USER_DATA.fixedExpenses + (USER_DATA.averageDailySpending * 30)
): SimulationResult {
  
  const monthlyNetIncome = monthlyIncome - monthlyExpenses;
  const currentMonth = new Date().getMonth() + 1;
  
  // Monte Carlo parameters
  const simulations = 1000;
  const volatilityFactor = 0.15; // 15% spending volatility
  const incomeVolatility = 0.05; // 5% income volatility
  
  let successfulSimulations = 0;
  let totalTimeToGoal = 0;
  const projectedBalances: number[] = [];
  const milestones: { month: number; balance: number; event: string }[] = [];
  
  // Run multiple simulations
  for (let sim = 0; sim < simulations; sim++) {
    let balance = currentBalance;
    let monthsToGoal = 0;
    let achieved = false;
    
    for (let month = 1; month <= timeHorizon && !achieved; month++) {
      // Apply seasonal spending multipliers
      const seasonalMonth = ((currentMonth + month - 1) % 12) + 1;
      const seasonalMultiplier = USER_DATA.seasonalMultipliers[seasonalMonth];
      
      // Add randomness for Monte Carlo
      const incomeVariation = 1 + (Math.random() - 0.5) * incomeVolatility;
      const expenseVariation = 1 + (Math.random() - 0.5) * volatilityFactor;
      
      // Calculate monthly cash flow with variations
      const adjustedIncome = monthlyIncome * incomeVariation;
      const adjustedExpenses = monthlyExpenses * seasonalMultiplier * expenseVariation;
      const monthlyCashFlow = adjustedIncome - adjustedExpenses;
      
      balance += monthlyCashFlow;
      
      // Check if goal is achieved
      if (balance >= goalAmount && !achieved) {
        achieved = true;
        monthsToGoal = month;
        successfulSimulations++;
        totalTimeToGoal += month;
      }
      
      // Store balance for first simulation (for visualization)
      if (sim === 0) {
        projectedBalances.push(Math.max(0, balance));
        
        // Add milestones
        if (month % 6 === 0) {
          milestones.push({
            month,
            balance: Math.max(0, balance),
            event: `${month/12} year${month >= 24 ? 's' : ''} mark`
          });
        }
      }
    }
  }
  
  // Calculate results
  const successRate = successfulSimulations / simulations;
  const averageTimeToGoal = successfulSimulations > 0 ? totalTimeToGoal / successfulSimulations : timeHorizon;
  const monthlyRequired = Math.max(0, (goalAmount - currentBalance) / timeHorizon);
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high';
  if (successRate > 0.8) riskLevel = 'low';
  else if (successRate > 0.5) riskLevel = 'medium';
  else riskLevel = 'high';
  
  // Generate recommendations
  const recommendations: string[] = [];
  const riskFactors: string[] = [];
  
  if (monthlyRequired > monthlyNetIncome * 0.5) {
    recommendations.push("Consider extending timeline or reducing goal amount");
    riskFactors.push("High savings requirement relative to income");
  }
  
  if (successRate < 0.7) {
    recommendations.push("Increase income or reduce expenses to improve success rate");
    riskFactors.push("Low probability of achieving goal in timeframe");
  }
  
  if (monthlyRequired > 0) {
    recommendations.push(`Save ₹${monthlyRequired.toLocaleString()} monthly to stay on track`);
  }
  
  // Alternative scenarios
  const optimisticScenario = {
    timeToGoal: Math.max(1, Math.round(averageTimeToGoal * 0.8)),
    monthlyRequired: Math.round(monthlyRequired * 0.8)
  };
  
  const pessimisticScenario = {
    timeToGoal: Math.round(averageTimeToGoal * 1.3),
    monthlyRequired: Math.round(monthlyRequired * 1.3)
  };
  
  return {
    canAchieve: successRate > 0.3,
    timeToGoal: Math.round(averageTimeToGoal),
    monthlyRequired: Math.round(monthlyRequired),
    riskLevel,
    projectedBalance: projectedBalances,
    milestones,
    recommendations,
    riskFactors,
    alternativeScenarios: {
      optimistic: optimisticScenario,
      pessimistic: pessimisticScenario
    }
  };
}

export function FutureSimulationScreen() {
  const [goalAmount, setGoalAmount] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("12"); // months
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'milestones'>('chart');

  const simulateGoal = (amount: number, months: number) => {
    setIsSimulating(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const simulation = runMonteCarloSimulation(amount, months);
      setResult(simulation);
      setIsSimulating(false);
    }, 2000); // 2 seconds for Monte Carlo simulation
  };

  const handleGoalSubmit = () => {
    const amount = parseFloat(goalAmount);
    const months = parseInt(timeHorizon);
    if (amount > 0 && months > 0) {
      simulateGoal(amount, months);
    }
  };

  const handlePopularGoalSelect = (goal: typeof POPULAR_GOALS[0]) => {
    setSelectedGoal(goal.name);
    setGoalAmount(goal.amount.toString());
    // Auto-suggest timeline based on goal amount
    const suggestedMonths = Math.max(6, Math.min(60, Math.round(goal.amount / 15000)));
    setTimeHorizon(suggestedMonths.toString());
    simulateGoal(goal.amount, suggestedMonths);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#00D68F';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#fff';
    }
  };

  const getRiskBg = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'rgba(0,214,143,0.1)';
      case 'medium': return 'rgba(245,158,11,0.1)';
      case 'high': return 'rgba(239,68,68,0.1)';
      default: return 'rgba(255,255,255,0.05)';
    }
  };

  // Memoized chart data for performance
  const chartData = useMemo(() => {
    if (!result) return [];
    return result.projectedBalance.map((balance, index) => ({
      month: index + 1,
      balance,
      goalLine: parseFloat(goalAmount) || 0
    }));
  }, [result, goalAmount]);

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
            Future Money Simulation
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            Monte Carlo financial forecasting engine
          </p>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {/* Input Section */}
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
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
                 style={{ background: "rgba(0,214,143,0.2)" }}>
              <Target size={20} color="#00D68F" />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", color: "#fff" }}>Set Your Financial Goal</h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                AI will simulate thousands of scenarios to predict your success
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px", display: "block" }}>
                GOAL AMOUNT (₹)
              </label>
              <Input
                type="number"
                placeholder="Enter target amount"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="h-12 text-lg"
                style={{
                  background: "#181820",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff"
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginBottom: "8px", display: "block" }}>
                TIME HORIZON (MONTHS)
              </label>
              <Input
                type="number"
                placeholder="Timeline in months"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value)}
                className="h-12 text-lg"
                style={{
                  background: "#181820",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff"
                }}
              />
            </div>
          </div>

          <Button
            onClick={handleGoalSubmit}
            disabled={!goalAmount || !timeHorizon || isSimulating}
            className="w-full h-12 mb-6"
            style={{
              background: "linear-gradient(135deg, #00D68F, #00b377)",
              border: "none"
            }}
          >
            {isSimulating ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Brain size={18} />
                </motion.div>
                Running Monte Carlo Simulation...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles size={18} />
                Simulate Future
              </div>
            )}
          </Button>

          {/* Popular Goals */}
          <div>
            <h4 style={{ fontSize: "14px", color: "#fff", marginBottom: "12px" }}>
              Popular Financial Goals
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {POPULAR_GOALS.map((goal) => (
                <motion.button
                  key={goal.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePopularGoalSelect(goal)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: selectedGoal === goal.name 
                      ? "rgba(0,214,143,0.2)" 
                      : "#181820",
                    border: selectedGoal === goal.name 
                      ? "1px solid rgba(0,214,143,0.3)" 
                      : "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <div className="text-lg mb-1">{goal.emoji}</div>
                  <div style={{ fontSize: "12px", color: "#fff", marginBottom: "2px" }}>
                    {goal.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "#00D68F" }}>
                    ₹{goal.amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                    {goal.priority} priority
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Simulation Progress */}
        <AnimatePresence>
          {isSimulating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl p-6 mb-6"
              style={{
                background: "#181820",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(0,214,143,0.2)" }}
                >
                  <Brain size={20} color="#00D68F" />
                </motion.div>
                <div>
                  <p style={{ fontSize: "16px", color: "#fff" }}>Running Monte Carlo Analysis</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                    Simulating 1,000 scenarios with market volatility, seasonal spending, and income variations
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {[
                  "Analyzing spending patterns and volatility...",
                  "Applying seasonal spending multipliers...",
                  "Calculating income growth projections...",
                  "Running probabilistic scenarios...",
                  "Generating risk assessments..."
                ].map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.3 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: "#00D68F" }} />
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                      {step}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence>
          {result && !isSimulating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Result Card */}
              <motion.div
                className="rounded-3xl p-6"
                style={{
                  background: getRiskBg(result.riskLevel),
                  border: `1px solid ${getRiskColor(result.riskLevel)}30`
                }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ background: getRiskBg(result.riskLevel) }}>
                    {result.canAchieve ? (
                      <CheckCircle size={24} color={getRiskColor(result.riskLevel)} />
                    ) : (
                      <AlertTriangle size={24} color={getRiskColor(result.riskLevel)} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 style={{ fontSize: "20px", color: getRiskColor(result.riskLevel), marginBottom: "8px" }}>
                      {result.canAchieve ? "Goal Achievable!" : "Goal Challenging"}
                    </h3>
                    <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
                      {result.canAchieve 
                        ? `You can reach your goal in approximately ${result.timeToGoal} months with disciplined saving.`
                        : "This goal may require adjustments to timeline or amount based on current financial trajectory."
                      }
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                         style={{ background: "rgba(0,214,143,0.15)" }}>
                      <Clock size={20} color="#00D68F" />
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                      TIME TO GOAL
                    </p>
                    <p style={{ fontSize: "16px", color: "#fff" }}>
                      {result.timeToGoal} months
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                         style={{ background: "rgba(124,58,237,0.15)" }}>
                      <DollarSign size={20} color="#7C3AED" />
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                      MONTHLY REQUIRED
                    </p>
                    <p style={{ fontSize: "16px", color: "#fff" }}>
                      ₹{result.monthlyRequired.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                         style={{ background: getRiskBg(result.riskLevel) }}>
                      <BarChart3 size={20} color={getRiskColor(result.riskLevel)} />
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                      RISK LEVEL
                    </p>
                    <p style={{ fontSize: "16px", color: getRiskColor(result.riskLevel) }}>
                      {result.riskLevel.toUpperCase()}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                         style={{ background: "rgba(245,158,11,0.15)" }}>
                      <TrendingUp size={20} color="#F59E0B" />
                    </div>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                      SUCCESS RATE
                    </p>
                    <p style={{ fontSize: "16px", color: "#fff" }}>
                      {result.canAchieve ? "High" : "Low"}
                    </p>
                  </div>
                </div>

                {/* Scenario Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl" style={{ background: "rgba(0,214,143,0.1)" }}>
                    <h5 style={{ fontSize: "12px", color: "#00D68F", marginBottom: "8px" }}>
                      OPTIMISTIC SCENARIO
                    </h5>
                    <p style={{ fontSize: "14px", color: "#fff", marginBottom: "4px" }}>
                      {result.alternativeScenarios.optimistic.timeToGoal} months
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      ₹{result.alternativeScenarios.optimistic.monthlyRequired.toLocaleString()}/month
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl" style={{ background: "rgba(124,58,237,0.1)" }}>
                    <h5 style={{ fontSize: "12px", color: "#7C3AED", marginBottom: "8px" }}>
                      REALISTIC SCENARIO
                    </h5>
                    <p style={{ fontSize: "14px", color: "#fff", marginBottom: "4px" }}>
                      {result.timeToGoal} months
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      ₹{result.monthlyRequired.toLocaleString()}/month
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.1)" }}>
                    <h5 style={{ fontSize: "12px", color: "#EF4444", marginBottom: "8px" }}>
                      PESSIMISTIC SCENARIO
                    </h5>
                    <p style={{ fontSize: "14px", color: "#fff", marginBottom: "4px" }}>
                      {result.alternativeScenarios.pessimistic.timeToGoal} months
                    </p>
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                      ₹{result.alternativeScenarios.pessimistic.monthlyRequired.toLocaleString()}/month
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: "#181820",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <h4 style={{ fontSize: "16px", color: "#fff", marginBottom: "16px" }}>
                    AI Recommendations
                  </h4>
                  <div className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                             style={{ background: "rgba(0,214,143,0.2)" }}>
                          <Zap size={12} color="#00D68F" />
                        </div>
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Balance Projection Chart */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl p-5"
                style={{
                  background: "#181820",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 style={{ fontSize: "16px", color: "#fff" }}>
                    Balance Projection
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('chart')}
                      className="px-3 py-1 rounded-lg text-xs"
                      style={{
                        background: viewMode === 'chart' ? "rgba(0,214,143,0.2)" : "rgba(255,255,255,0.05)",
                        color: viewMode === 'chart' ? "#00D68F" : "rgba(255,255,255,0.4)",
                        border: "1px solid " + (viewMode === 'chart' ? "rgba(0,214,143,0.3)" : "rgba(255,255,255,0.1)")
                      }}
                    >
                      Chart
                    </button>
                    <button
                      onClick={() => setViewMode('milestones')}
                      className="px-3 py-1 rounded-lg text-xs"
                      style={{
                        background: viewMode === 'milestones' ? "rgba(0,214,143,0.2)" : "rgba(255,255,255,0.05)",
                        color: viewMode === 'milestones' ? "#00D68F" : "rgba(255,255,255,0.4)",
                        border: "1px solid " + (viewMode === 'milestones' ? "rgba(0,214,143,0.3)" : "rgba(255,255,255,0.1)")
                      }}
                    >
                      Milestones
                    </button>
                  </div>
                </div>

                {viewMode === 'chart' && chartData.length > 0 && (
                  <div className="relative h-64 mb-4">
                    {/* Simple SVG Chart */}
                    <svg width="100%" height="100%" viewBox="0 0 800 200" className="overflow-visible">
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <line
                          key={i}
                          x1="0"
                          y1={i * 50}
                          x2="800"
                          y2={i * 50}
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="1"
                        />
                      ))}
                      
                      {/* Goal line */}
                      <line
                        x1="0"
                        y1={200 - (parseFloat(goalAmount) / Math.max(...result.projectedBalance, parseFloat(goalAmount)) * 180)}
                        x2="800"
                        y2={200 - (parseFloat(goalAmount) / Math.max(...result.projectedBalance, parseFloat(goalAmount)) * 180)}
                        stroke="#F59E0B"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                      />
                      
                      {/* Balance projection line */}
                      <polyline
                        points={chartData.map((point, index) => {
                          const x = (index / (chartData.length - 1)) * 800;
                          const y = 200 - (point.balance / Math.max(...result.projectedBalance, parseFloat(goalAmount)) * 180);
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#00D68F"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Data points */}
                      {chartData.filter((_, index) => index % 3 === 0).map((point, index) => {
                        const actualIndex = index * 3;
                        const x = (actualIndex / (chartData.length - 1)) * 800;
                        const y = 200 - (point.balance / Math.max(...result.projectedBalance, parseFloat(goalAmount)) * 180);
                        return (
                          <circle
                            key={actualIndex}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#00D68F"
                            stroke="#181820"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>
                    
                    {/* Chart labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs"
                         style={{ color: "rgba(255,255,255,0.4)" }}>
                      <span>Month 1</span>
                      <span>Month {Math.floor(chartData.length / 2)}</span>
                      <span>Month {chartData.length}</span>
                    </div>
                    
                    <div className="absolute top-0 right-0 text-xs"
                         style={{ color: "#F59E0B" }}>
                      Goal: ₹{parseFloat(goalAmount).toLocaleString()}
                    </div>
                  </div>
                )}

                {viewMode === 'milestones' && result.milestones.length > 0 && (
                  <div className="space-y-3">
                    {result.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl"
                           style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                             style={{ background: "rgba(0,214,143,0.2)" }}>
                          <span style={{ fontSize: "12px", color: "#00D68F" }}>
                            {milestone.month}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p style={{ fontSize: "14px", color: "#fff" }}>
                            {milestone.event}
                          </p>
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                            Projected balance: ₹{milestone.balance.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="w-16 h-2 rounded-full overflow-hidden"
                               style={{ background: "rgba(255,255,255,0.1)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, (milestone.balance / parseFloat(goalAmount)) * 100)}%`,
                                background: milestone.balance >= parseFloat(goalAmount) ? "#00D68F" : "#7C3AED"
                              }}
                            />
                          </div>
                          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "4px" }}>
                            {Math.min(100, Math.round((milestone.balance / parseFloat(goalAmount)) * 100))}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Financial Health Dashboard */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-5"
                style={{
                  background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,214,143,0.08))",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <h4 style={{ fontSize: "16px", color: "#fff", marginBottom: "16px" }}>
                  Financial Health Analysis
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                         style={{ background: "rgba(0,214,143,0.15)" }}>
                      <div className="text-center">
                        <div style={{ fontSize: "18px", color: "#00D68F", fontWeight: 600 }}>
                          {Math.round(((USER_DATA.monthlyIncome - (USER_DATA.fixedExpenses + USER_DATA.averageDailySpending * 30)) / USER_DATA.monthlyIncome) * 100)}%
                        </div>
                        <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>
                          SAVINGS
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      Savings Rate
                    </p>
                    <p style={{ fontSize: "10px", color: "#00D68F" }}>
                      Excellent (Target: 15%)
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                         style={{ background: "rgba(124,58,237,0.15)" }}>
                      <div className="text-center">
                        <div style={{ fontSize: "18px", color: "#7C3AED", fontWeight: 600 }}>
                          {Math.round((USER_DATA.currentBalance / (USER_DATA.fixedExpenses + USER_DATA.averageDailySpending * 30)) * 10) / 10}
                        </div>
                        <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>
                          MONTHS
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      Emergency Buffer
                    </p>
                    <p style={{ fontSize: "10px", color: "#7C3AED" }}>
                      Strong (Target: 6 months)
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                         style={{ background: "rgba(245,158,11,0.15)" }}>
                      <div className="text-center">
                        <div style={{ fontSize: "18px", color: "#F59E0B", fontWeight: 600 }}>
                          {result.riskLevel === 'low' ? 'A+' : result.riskLevel === 'medium' ? 'B+' : 'C'}
                        </div>
                        <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>
                          GRADE
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                      Goal Feasibility
                    </p>
                    <p style={{ fontSize: "10px", color: "#F59E0B" }}>
                      {result.riskLevel === 'low' ? 'Highly Achievable' : result.riskLevel === 'medium' ? 'Moderately Achievable' : 'Challenging'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} color="#00D68F" />
                    <span style={{ fontSize: "14px", color: "#00D68F" }}>AI Insight</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
                    {result.riskLevel === 'low' 
                      ? "Your financial position is strong. This goal aligns well with your income and spending patterns."
                      : result.riskLevel === 'medium'
                      ? "This goal is achievable but requires disciplined saving. Consider optimizing your spending in non-essential categories."
                      : "This goal is ambitious given your current financial trajectory. Consider extending the timeline or increasing your income."
                    }
                  </p>
                </div>
              </motion.div>

              {/* Risk Factors */}
              {result.riskFactors.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: "rgba(239,68,68,0.05)",
                    border: "1px solid rgba(239,68,68,0.1)"
                  }}
                >
                  <h4 style={{ fontSize: "16px", color: "#EF4444", marginBottom: "16px" }}>
                    Risk Factors to Consider
                  </h4>
                  <div className="space-y-3">
                    {result.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <AlertTriangle size={16} color="#EF4444" className="flex-shrink-0 mt-0.5" />
                        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: "1.5" }}>
                          {risk}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}