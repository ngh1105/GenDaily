# GenDaily Local Test Instructions

## Current Status
✅ **Server running**: http://localhost:3000  
✅ **GenLayer RPC**: https://studio.genlayer.com/api (tested and working)  
✅ **Contract address**: 0x95758c22476ABC199C9A7698bFd083be84A08CF5  
❓ **Contract deployment**: Need to verify if contract is deployed  

## Test Steps

### 1. Open Browser
- Go to: http://localhost:3000
- Open Developer Tools (F12)
- Check Console for errors

### 2. Connect Wallet
- Click "Connect Wallet" button
- Select MetaMask
- Switch to StudioNet (ChainId: 61999)
- RPC: https://studio.genlayer.com/api

### 3. Check Contract
- Look for console logs about contract calls
- Check if `current_day_index` returns a value
- Check if `get_my_stats` returns data

## Expected Issues
1. **Contract not deployed**: If contract address doesn't exist
2. **Wallet not connected**: Contract calls will fail
3. **Wrong network**: Need to be on StudioNet

## Debug Commands
```bash
# Check if server is running
netstat -ano | findstr :3000

# Test RPC endpoint
Invoke-WebRequest -Uri "https://studio.genlayer.com/api" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```
