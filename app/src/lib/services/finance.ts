import { db } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import type { Vote, BankTransaction } from '@prisma/client';

// CSV Parser
export interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ';' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function findColumnIndex(header: string[], possibleNames: string[]): number {
  const normalizedHeader = header.map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
  return normalizedHeader.findIndex((h) => possibleNames.some((name) => h.includes(name)));
}

function parseGermanDate(dateStr: string): Date {
  const cleaned = dateStr.replace(/"/g, '').trim();
  const match = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

  if (!match) {
    throw new Error(`Ungueltiges Datumsformat: ${dateStr}`);
  }

  const [, day, month, year] = match;
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

function parseGermanAmount(amountStr: string): number {
  const cleaned = amountStr
    .replace(/"/g, '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');

  const amount = parseFloat(cleaned);

  if (isNaN(amount)) {
    throw new Error(`Ungueltiger Betrag: ${amountStr}`);
  }

  return amount;
}

export function parseBankCsv(csvContent: string): ParsedTransaction[] {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten');
  }

  const header = parseCsvLine(lines[0]);
  const dateIndex = findColumnIndex(header, ['buchungstag', 'datum', 'date']);
  const descriptionIndex = findColumnIndex(header, ['verwendungszweck', 'beschreibung', 'description', 'zweck']);
  const amountIndex = findColumnIndex(header, ['betrag', 'amount', 'summe']);

  if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
    throw new Error('CSV-Datei muss die Spalten Buchungstag, Verwendungszweck und Betrag enthalten');
  }

  const transactions: ParsedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = parseCsvLine(line);

    try {
      const date = parseGermanDate(columns[dateIndex]);
      const amount = parseGermanAmount(columns[amountIndex]);
      const description = columns[descriptionIndex]?.trim() || '';

      if (amount > 0) {
        transactions.push({ date, amount, description });
      }
    } catch {
      // Skip invalid lines
    }
  }

  return transactions;
}

// Transaction Matcher
const SUBSCRIPTION_ID_PATTERN = /S\d{4}/gi;

async function matchTransaction(description: string): Promise<string | null> {
  const matches = description.match(SUBSCRIPTION_ID_PATTERN);

  if (!matches || matches.length === 0) {
    return null;
  }

  const potentialId = matches[0].toUpperCase();

  const subscription = await db.subscription.findUnique({
    where: { subscriptionId: potentialId },
  });

  return subscription ? subscription.id : null;
}

async function matchTransactions(descriptions: string[]): Promise<Map<number, string | null>> {
  const results = new Map<number, string | null>();

  const subscriptions = await db.subscription.findMany({
    select: { id: true, subscriptionId: true },
  });

  const subscriptionMap = new Map<string, string>(
    subscriptions.map((s: { id: string; subscriptionId: string }) => [s.subscriptionId, s.id])
  );

  for (let i = 0; i < descriptions.length; i++) {
    const description = descriptions[i];
    const matches = description.match(SUBSCRIPTION_ID_PATTERN);

    if (matches && matches.length > 0) {
      const potentialId = matches[0].toUpperCase();
      const subscriptionDbId = subscriptionMap.get(potentialId);
      results.set(i, subscriptionDbId || null);
    } else {
      results.set(i, null);
    }
  }

  return results;
}

// Finance Service
export async function importTransactions(csvContent: string) {
  const parsed = parseBankCsv(csvContent);
  const importBatchId = crypto.randomUUID();

  const descriptions = parsed.map((t) => t.description);
  const matches = await matchTransactions(descriptions);

  const transactions = await Promise.all(
    parsed.map(async (t, index) => {
      const subscriptionId = matches.get(index) || null;

      return db.bankTransaction.create({
        data: {
          date: t.date,
          amount: new Decimal(t.amount),
          description: t.description,
          subscriptionId,
          matched: !!subscriptionId,
          importBatchId,
        },
        include: { subscription: true },
      });
    })
  );

  const matchedCount = transactions.filter((t) => t.matched).length;

  return {
    importBatchId,
    total: transactions.length,
    matched: matchedCount,
    unmatched: transactions.length - matchedCount,
    transactions,
  };
}

export async function getTransactions(page = 1, limit = 20, matched?: boolean) {
  const skip = (page - 1) * limit;
  const where = matched !== undefined ? { matched } : {};

  const [transactions, total] = await Promise.all([
    db.bankTransaction.findMany({
      where,
      skip,
      take: limit,
      include: { subscription: true },
      orderBy: { date: 'desc' },
    }),
    db.bankTransaction.count({ where }),
  ]);

  return {
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function manualMatchTransaction(transactionId: string, subscriptionIdInput: string) {
  const transaction = await db.bankTransaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error('Transaktion nicht gefunden');
  }

  const subscription = await db.subscription.findUnique({
    where: { subscriptionId: subscriptionIdInput.toUpperCase() },
  });

  if (!subscription) {
    throw new Error(`Abonnement ${subscriptionIdInput} nicht gefunden`);
  }

  return db.bankTransaction.update({
    where: { id: transactionId },
    data: {
      subscriptionId: subscription.id,
      matched: true,
    },
    include: { subscription: true },
  });
}

export async function getFinanceStatistics(year?: number) {
  const targetYear = year || new Date().getFullYear();
  const startDate = new Date(`${targetYear}-01-01`);
  const endDate = new Date(`${targetYear + 1}-01-01`);

  const votingRound = await db.votingRound.findUnique({
    where: { year: targetYear },
    include: { votes: true },
  });

  const expectedMonthly = votingRound
    ? votingRound.votes.reduce((sum: Decimal, v: Vote) => sum.add(v.amount), new Decimal(0))
    : new Decimal(0);

  const currentMonth = new Date().getMonth() + 1;
  const monthsElapsed = targetYear === new Date().getFullYear() ? currentMonth : 12;
  const expectedToDate = expectedMonthly.mul(monthsElapsed);

  const [matchedTransactions, unmatchedTransactions] = await Promise.all([
    db.bankTransaction.findMany({
      where: {
        date: { gte: startDate, lt: endDate },
        matched: true,
      },
    }),
    db.bankTransaction.count({
      where: {
        date: { gte: startDate, lt: endDate },
        matched: false,
      },
    }),
  ]);

  const actualIncome = matchedTransactions.reduce(
    (sum: Decimal, t: BankTransaction) => sum.add(t.amount),
    new Decimal(0)
  );

  const matchedCount = matchedTransactions.length;
  const transactionCount = matchedCount + unmatchedTransactions;

  return {
    totalIncome: actualIncome.toNumber(),
    expectedIncome: expectedToDate.toNumber(),
    difference: actualIncome.sub(expectedToDate).toNumber(),
    transactionCount,
    matchedCount,
    unmatchedCount: unmatchedTransactions,
  };
}

export async function getNegativeBalances() {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(`${currentYear}-01-01`);

  const subscriptions = await db.subscription.findMany({
    where: { status: 'ACTIVE' },
    include: {
      votes: {
        where: { votingRound: { year: currentYear } },
      },
      transactions: {
        where: { date: { gte: startDate } },
      },
    },
  });

  const currentMonth = new Date().getMonth() + 1;
  const negativeBalances = [];

  for (const subscription of subscriptions) {
    const monthlyAmount = subscription.votes[0]?.amount || new Decimal(0);
    const expectedAmount = monthlyAmount.mul(currentMonth);
    const totalPaid = subscription.transactions.reduce(
      (sum: Decimal, t: BankTransaction) => sum.add(t.amount),
      new Decimal(0)
    );
    const balance = totalPaid.sub(expectedAmount);

    if (balance.isNegative()) {
      negativeBalances.push({
        subscriptionId: subscription.subscriptionId,
        id: subscription.id,
        monthlyAmount: monthlyAmount.toNumber(),
        expectedAmount: expectedAmount.toNumber(),
        totalPaid: totalPaid.toNumber(),
        balance: balance.toNumber(),
      });
    }
  }

  return negativeBalances.sort((a, b) => a.balance - b.balance);
}
