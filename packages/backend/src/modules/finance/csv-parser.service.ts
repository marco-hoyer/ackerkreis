import { Injectable, BadRequestException } from '@nestjs/common';

export interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
}

@Injectable()
export class CsvParserService {
  /**
   * Parse German bank CSV format
   * Expected columns (semicolon-separated):
   * - Buchungstag (booking date, format: DD.MM.YYYY)
   * - Verwendungszweck (description/purpose)
   * - Betrag (amount, German format: "1.234,56" or "-1.234,56")
   */
  parse(csvContent: string): ParsedTransaction[] {
    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
      throw new BadRequestException('CSV-Datei muss mindestens eine Kopfzeile und eine Datenzeile enthalten');
    }

    // Parse header to find column indices
    const header = this.parseLine(lines[0]);
    const dateIndex = this.findColumnIndex(header, ['buchungstag', 'datum', 'date']);
    const descriptionIndex = this.findColumnIndex(header, ['verwendungszweck', 'beschreibung', 'description', 'zweck']);
    const amountIndex = this.findColumnIndex(header, ['betrag', 'amount', 'summe']);

    if (dateIndex === -1 || descriptionIndex === -1 || amountIndex === -1) {
      throw new BadRequestException(
        'CSV-Datei muss die Spalten Buchungstag, Verwendungszweck und Betrag enthalten',
      );
    }

    const transactions: ParsedTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = this.parseLine(line);

      try {
        const date = this.parseGermanDate(columns[dateIndex]);
        const amount = this.parseGermanAmount(columns[amountIndex]);
        const description = columns[descriptionIndex]?.trim() || '';

        // Only include positive amounts (income)
        if (amount > 0) {
          transactions.push({ date, amount, description });
        }
      } catch (error) {
        // Skip invalid lines
        console.warn(`Zeile ${i + 1} uebersprungen: ${error.message}`);
      }
    }

    return transactions;
  }

  private parseLine(line: string): string[] {
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

  private findColumnIndex(header: string[], possibleNames: string[]): number {
    const normalizedHeader = header.map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
    return normalizedHeader.findIndex((h) =>
      possibleNames.some((name) => h.includes(name)),
    );
  }

  private parseGermanDate(dateStr: string): Date {
    // Format: DD.MM.YYYY
    const cleaned = dateStr.replace(/"/g, '').trim();
    const match = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);

    if (!match) {
      throw new Error(`Ungueltiges Datumsformat: ${dateStr}`);
    }

    const [, day, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  private parseGermanAmount(amountStr: string): number {
    // German format: 1.234,56 or -1.234,56
    const cleaned = amountStr
      .replace(/"/g, '')
      .trim()
      .replace(/\./g, '')  // Remove thousand separators
      .replace(',', '.');   // Replace decimal comma with dot

    const amount = parseFloat(cleaned);

    if (isNaN(amount)) {
      throw new Error(`Ungueltiger Betrag: ${amountStr}`);
    }

    return amount;
  }
}
