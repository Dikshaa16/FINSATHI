# 🏦 FINSATHI - AI-Powered Gen Z Fintech Platform

> **Intelligent Financial Decision Making for the Next Generation**

FINSATHI is a comprehensive fintech platform that combines AI-powered insights with intuitive design to help Gen Z users make smarter financial decisions. Built with modern web technologies and featuring real-time SMS transaction processing.

## ✨ Features

### 🧠 **AI-Powered Core Features**
- **Smart Affordability Engine** - Real-time purchase decision analysis
- **Future Financial Simulation** - Monte Carlo modeling for goal planning  
- **Auto Money Flow** - Intelligent income allocation (50/30/20 rule)
- **Financial Personality Analysis** - Behavioral spending pattern insights

### 📱 **SMS Transaction Intelligence**
- Automatic SMS transaction extraction from bank messages
- 95%+ accuracy parsing for Indian banks and UPI services
- Real-time spending pattern detection and categorization
- Privacy-first approach - only processes financial messages

### 🎯 **Smart Analytics**
- Impulse spending detection and alerts
- Recurring expense recognition and prediction
- Spending velocity monitoring
- Risk assessment and safety recommendations

## 🏗️ Architecture

### **Frontend** (React + TypeScript + Vite)
- Modern, responsive web application
- Dark theme optimized for Gen Z users
- Real-time data visualization with Recharts
- Mobile-first responsive design

### **Backend** (Node.js + Express + SQLite)
- RESTful API with JWT authentication
- Advanced SMS processing algorithms
- AI-powered financial intelligence engine
- Scalable database architecture

### **Mobile** (Expo React Native)
- Cross-platform SMS extraction app
- Real-time sync with backend services
- Privacy-controlled transaction processing
- Expo Go compatible for easy testing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Expo Go app (for mobile testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Dikshaa16/FINSATHI.git
   cd FINSATHI
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   
   # Mobile (optional)
   cd ../mobile
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Start the application**
   ```bash
   # Terminal 1: Backend API
   cd backend
   npm start
   
   # Terminal 2: Web Application  
   npm run dev
   
   # Terminal 3: Mobile App (optional)
   cd mobile
   npm start
   ```

5. **Access the application**
   - Web App: http://localhost:5173
   - Backend API: http://localhost:3001
   - Mobile: Scan QR code with Expo Go

## 📊 Technology Stack

### **Frontend**
- React 18 with TypeScript
- Vite for fast development
- TailwindCSS for styling
- Recharts for data visualization
- React Router for navigation

### **Backend**
- Node.js with Express framework
- SQLite database with Sequelize ORM
- JWT authentication
- Advanced SMS processing algorithms
- AI-powered financial intelligence

### **Mobile**
- Expo SDK 54
- React Native
- AsyncStorage for local data
- Axios for API communication

## 🔒 Privacy & Security

- **SMS Privacy**: Only bank/UPI messages are processed
- **Data Encryption**: All API communications are encrypted
- **Local Processing**: SMS parsing happens on-device
- **User Control**: Full control over data sharing and processing
- **No Personal Data**: Personal messages are never accessed

## 🧪 Testing

### **Web Application**
```bash
npm run dev
# Navigate to http://localhost:5173
```

### **SMS Simulator**
```bash
# Access the built-in SMS simulator
http://localhost:5173/sms-simulator
```

### **Mobile App**
```bash
cd mobile
npm start
# Scan QR code with Expo Go app
```

## 📱 SMS Processing

FINSATHI supports automatic transaction extraction from:
- **Indian Banks**: HDFC, ICICI, SBI, Axis, Kotak, PNB, and more
- **UPI Services**: PhonePe, Google Pay, Paytm, BHIM
- **Digital Wallets**: Amazon Pay, Mobikwik, Freecharge

### Supported Transaction Types
- Debit/Credit card transactions
- UPI payments and transfers
- Net banking transactions
- Wallet top-ups and payments
- Bill payments and recharges

## 🎯 Key Algorithms

### **Affordability Engine**
- Multi-factor risk analysis
- Real-time spending velocity calculation
- Emergency fund protection
- Contextual decision making

### **SMS Processing**
- Pattern matching for 15+ bank formats
- Merchant name extraction and categorization
- Confidence scoring for accuracy
- Duplicate detection and handling

### **Financial Intelligence**
- Impulse spending detection (late-night, category-based)
- Recurring expense pattern recognition
- Future expense prediction using historical data
- Behavioral analysis and personality scoring

## 🚀 Deployment

### **Production Setup**
1. **Database**: Switch to PostgreSQL for production
2. **Environment**: Configure production environment variables
3. **Security**: Enable HTTPS and security headers
4. **Monitoring**: Set up logging and error tracking

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for Gen Z financial empowerment
- Inspired by modern fintech innovations
- Designed with privacy-first principles
- Powered by AI and machine learning

## 📞 Support

For support, email support@finsathi.com or create an issue in this repository.

---

**Built with ❤️ for the next generation of financial decision makers**