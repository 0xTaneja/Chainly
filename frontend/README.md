# Attention Futures Frontend

A modern, responsive frontend for the Attention Futures trading platform - enabling leveraged trading based on real-time social media attention scores powered by Chainlink oracles.

## 🌟 Features

### 📊 Live Dashboard
- **Real-time Oracle Data**: Live attention scores for BTC, ETH, PEPE, DOGE
- **Cross-chain Visualization**: Side-by-side display of Sepolia and Fuji data
- **Automated Refresh**: 5-second polling with live freshness indicators
- **Beautiful Animations**: Professional UI with smooth transitions

### 💹 Trading Interface
- **Position Management**: Open leveraged positions with 2x, 5x, 10x leverage
- **Safety Features**: Circuit breaker integration and stale data protection
- **Real-time Validation**: Oracle freshness checks before trading
- **Transaction Tracking**: Full transaction history with Etherscan links

### 📈 Portfolio Tracking
- **Position History**: View all open and closed positions
- **P&L Tracking**: Real-time profit/loss calculations
- **Filtering**: Filter by ALL/OPEN/CLOSED positions
- **Position Details**: Entry scores, current scores, timestamps

### 🔗 Multi-chain Support
- **Ethereum Sepolia**: Primary oracle and trading network
- **Avalanche Fuji**: Cross-chain synchronized data via CCIP
- **Seamless Switching**: Automatic network detection and switching

## 🛠 Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS v4 with custom components
- **Animations**: Framer Motion for smooth transitions
- **Web3**: wagmi + RainbowKit for wallet connections
- **Icons**: Heroicons for consistent iconography
- **Notifications**: React Hot Toast for user feedback

## 🏗 Architecture

### Smart Contract Integration
```
src/lib/
├── abi/                    # Contract ABIs
│   ├── attentionOracle.ts
│   ├── attentionFutures.ts
│   ├── scoreBridge.ts
│   └── dataRefresher.ts
├── addresses.ts            # Contract addresses per chain
└── chains.ts              # Chain configurations
```

### React Hooks
```
src/hooks/
├── useAttentionScore.ts    # Oracle data fetching
├── useMultipleAttentionScores.ts  # Multi-token support
└── usePolling.ts          # Automated data refresh
```

### Components
```
src/components/
├── HeroDashboard.tsx      # Main dashboard with live data
├── TradeForm.tsx          # Trading interface
├── PositionsList.tsx      # Portfolio management
└── Header.tsx            # Navigation header
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Testnet ETH for Sepolia and Fuji

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
```bash
# RPC endpoints for browser usage
NEXT_PUBLIC_SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_FUJI_RPC=https://avalanche-fuji-c-chain-rpc.publicnode.com

# Contract addresses
NEXT_PUBLIC_ORACLE_SEPOLIA=0x10F2370b3413b453154E520c516a2945e5f52dC8
NEXT_PUBLIC_FUTURES_SEPOLIA=0x715AeE1089db8F208cE41A4Ad6fd5Bae57e8FfCE
NEXT_PUBLIC_SENDER_SEPOLIA=0xE64F40435c377dfE5C4cC37b1CD997d00a502168

# WalletConnect (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

## 📱 Pages & Navigation

### 1. Dashboard (`/`)
- Live cross-chain oracle data visualization
- System statistics (uptime, refresh count, chains)
- Feature highlights and architecture overview

### 2. Trading (`/` - Trade tab)
- Position opening interface
- Real-time oracle status validation
- Leverage and collateral configuration
- Transaction confirmation and tracking

### 3. Positions (`/` - Positions tab)
- Portfolio overview with P&L tracking
- Position filtering (ALL/OPEN/CLOSED)
- Individual position management
- Historical performance data

### 4. About (`/about`)
- Project overview and innovation explanation
- Technical architecture documentation
- Chainlink integrations breakdown
- Security features and risk management

## 🎨 UI/UX Features

### Design System
- **Dark/Light Mode**: Automatic theme detection
- **Responsive Design**: Mobile-first approach
- **Consistent Typography**: Professional font hierarchy
- **Color Palette**: Blue/purple gradients with semantic colors

### Animations
- **Page Transitions**: Smooth route changes
- **Loading States**: Skeleton screens and spinners
- **Live Data**: Pulse animations for real-time updates
- **Interactive Elements**: Hover and click feedback

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG 2.1 AA compliance
- **Focus Management**: Clear focus indicators

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Organization
- **TypeScript**: Full type safety throughout
- **ESLint**: Code quality and consistency
- **Modular Components**: Reusable UI components
- **Custom Hooks**: Shared logic and state management

### Performance Optimizations
- **Next.js Optimizations**: Automatic code splitting and optimization
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Static generation and API caching

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm install -g vercel
vercel
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📊 Live Data Integration

### Oracle Data Flow
1. **Chainlink Functions**: Fetch social media data every 2.5 minutes
2. **CCIP Bridge**: Synchronize scores from Sepolia to Fuji
3. **Frontend Polling**: Refresh display every 5 seconds
4. **Freshness Validation**: Prevent trading on stale data

### Supported Tokens
- **BTC**: Bitcoin attention tracking
- **ETH**: Ethereum attention tracking  
- **PEPE**: PEPE token attention tracking
- **DOGE**: Dogecoin attention tracking

All tokens feature live oracle data with automated cross-chain synchronization.

## 🛡 Security Features

### Smart Contract Integration
- **Circuit Breaker**: Automatic trading pause on stale data
- **Freshness Validation**: Time-based oracle data validation
- **Error Handling**: Graceful failure handling and user feedback
- **Transaction Safety**: Multi-step confirmation process

### Frontend Security
- **Input Validation**: Client-side input sanitization
- **XSS Prevention**: Secure content rendering
- **CSRF Protection**: Built-in Next.js protections
- **Wallet Security**: Read-only operations by default

## 📞 Support & Contributing

### Getting Help
- **Documentation**: Comprehensive inline code documentation
- **Error Messages**: Clear error descriptions and solutions
- **Console Logs**: Detailed debugging information in development

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

---

**Built for the Chainlink Hackathon 2024** - Showcasing the power of decentralized oracles in creating new financial primitives.
