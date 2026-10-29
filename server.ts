import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { AuctionManagerService } from './src/services/auctionManagerService';
import { LowestUniqueBidService } from './src/services/LowestUniqueBidService';
import { WalletLedgerService } from './src/services/walletLedgerService';
import { PaymentOrchestrator } from './src/services/paymentOrchestrator';
import { AdminService } from './src/services/adminService';
import { TestSuiteRunner } from './src/services/testSuiteRunner';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // ---------------- API ENDPOINTS ---------------- //

  // Auctions
  app.get('/api/auctions', (_req: Request, res: Response) => {
    res.json({ success: true, auctions: AuctionManagerService.getAllAuctions() });
  });

  app.get('/api/auctions/:id', (req: Request, res: Response) => {
    const auction = AuctionManagerService.getAuctionById(req.params.id);
    if (!auction) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }
    res.json({ success: true, auction });
  });

  app.post('/api/auctions/:id/enter', (req: Request, res: Response) => {
    const { userId, userName, isDemo } = req.body;
    const result = AuctionManagerService.enterAuction({
      auctionId: req.params.id,
      userId,
      userName,
      isDemo: isDemo ?? true
    });
    res.json(result);
  });

  app.post('/api/auctions/:id/bid', (req: Request, res: Response) => {
    const { entryId, userId, userName, numbers } = req.body;
    const result = AuctionManagerService.submitBids({
      auctionId: req.params.id,
      entryId,
      userId,
      userName,
      numbers
    });
    res.json(result);
  });

  app.post('/api/auctions/:id/close', (req: Request, res: Response) => {
    const result = AuctionManagerService.closeAndCalculateWinner(req.params.id);
    res.json(result);
  });

  // Wallet
  app.get('/api/wallet/:userId', (req: Request, res: Response) => {
    const wallet = WalletLedgerService.getOrCreateWallet(req.params.userId);
    res.json({ success: true, wallet });
  });

  app.post('/api/deposit', async (req: Request, res: Response) => {
    const { userId, amountCents, provider, isDemo } = req.body;
    const result = await PaymentOrchestrator.processCardOrPayPalDeposit({
      userId,
      amountCents,
      provider: provider || 'STRIPE',
      isDemo: isDemo ?? true
    });
    res.json(result);
  });

  app.post('/api/withdraw', (req: Request, res: Response) => {
    const { userId, amountCents, destination, isDemo } = req.body;
    const result = WalletLedgerService.requestWithdrawal({
      userId,
      amountCents,
      destination,
      isDemo: isDemo ?? true
    });
    res.json(result);
  });


  // Automated Tests Runner
  app.get('/api/tests/run', async (_req: Request, res: Response) => {
    const results = await TestSuiteRunner.runAllTests();
    res.json({ success: true, ...results });
  });

  // ---------------- VITE MIDDLEWARE OR STATIC ---------------- //
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`LOWwinner US full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
