import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TransactionService } from './transaction.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PrismaService, TransactionService],
})
export class WalletModule {}
