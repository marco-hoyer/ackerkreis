import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Distribution Centers
  const centerNord = await prisma.distributionCenter.create({
    data: {
      name: 'Stadtteil Nord',
      address: 'Nordstrasse 12, 12345 Musterstadt',
      description: 'Abholung jeden Donnerstag 16-18 Uhr',
      latitude: 52.5350,
      longitude: 13.4000,
    },
  });

  const centerSued = await prisma.distributionCenter.create({
    data: {
      name: 'Stadtteil Sued',
      address: 'Suedweg 45, 12345 Musterstadt',
      description: 'Abholung jeden Freitag 15-17 Uhr',
      latitude: 52.4850,
      longitude: 13.3900,
    },
  });

  const centerOst = await prisma.distributionCenter.create({
    data: {
      name: 'Stadtteil Ost',
      address: 'Ostplatz 8, 12345 Musterstadt',
      description: 'Abholung jeden Mittwoch 17-19 Uhr',
      latitude: 52.5100,
      longitude: 13.4500,
    },
  });

  console.log('Created distribution centers');

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@solawi-test.de',
      name: 'Admin Benutzer',
      role: 'ADMIN',
    },
  });

  console.log('Created admin user: admin@solawi-test.de');

  // Create 20 Subscriptions with Users
  const subscriptions = [];
  const centers = [centerNord, centerSued, centerOst];

  for (let i = 1; i <= 20; i++) {
    const subscription = await prisma.subscription.create({
      data: {
        subscriptionId: `S${i.toString().padStart(4, '0')}`,
        distributionCenterId: centers[i % 3].id,
        status: 'ACTIVE',
      },
    });

    subscriptions.push(subscription);

    // Create 1-2 users per subscription
    await prisma.user.create({
      data: {
        email: `mitglied${i}@solawi-test.de`,
        name: `Test Mitglied ${i}`,
        role: 'MEMBER',
        subscriptionId: subscription.id,
      },
    });

    // Some subscriptions have two users
    if (i % 3 === 0) {
      await prisma.user.create({
        data: {
          email: `mitglied${i}b@solawi-test.de`,
          name: `Test Mitglied ${i}B`,
          role: 'MEMBER',
          subscriptionId: subscription.id,
        },
      });
    }
  }

  console.log('Created 20 subscriptions with users');

  // Create Voting Round for current year
  const currentYear = new Date().getFullYear();
  const votingRound = await prisma.votingRound.create({
    data: {
      year: currentYear,
      targetIncome: new Decimal(150000),
      status: 'OPEN',
      startDate: new Date(),
    },
  });

  console.log(`Created voting round for ${currentYear}`);

  // Create votes for first 15 subscriptions
  for (let i = 0; i < 15; i++) {
    const subscription = subscriptions[i];
    const user = await prisma.user.findFirst({
      where: { subscriptionId: subscription.id },
    });

    if (user) {
      // Random amount between 80 and 150 EUR
      const amount = 80 + Math.floor(Math.random() * 70);

      await prisma.vote.create({
        data: {
          subscriptionId: subscription.id,
          userId: user.id,
          votingRoundId: votingRound.id,
          amount: new Decimal(amount),
        },
      });
    }
  }

  console.log('Created votes for 15 subscriptions');

  // Create Blog Entries
  await prisma.blogEntry.create({
    data: {
      title: 'Willkommen in der neuen Saison',
      slug: 'willkommen-neue-saison',
      content: `
# Willkommen in der neuen Saison!

Die neue Erntesaison hat begonnen und wir freuen uns auf ein weiteres Jahr voller frischem Gemuese.

## Was euch erwartet

- Frische saisonale Gemuesesorten
- Neue Rezeptideen
- Gemeinschaftliche Ernte-Events

Wir freuen uns auf euch!
      `.trim(),
      authorId: admin.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  await prisma.blogEntry.create({
    data: {
      title: 'Neuer Verteilpunkt eroeffnet',
      slug: 'neuer-verteilpunkt',
      content: `
# Neuer Verteilpunkt im Osten

Wir freuen uns, einen neuen Verteilpunkt im Stadtteil Ost zu eroeffnen!

## Details

- Adresse: Ostplatz 8
- Abholung: Mittwoch 17-19 Uhr

Willkommen an alle neuen Mitglieder!
      `.trim(),
      authorId: admin.id,
      status: 'PUBLISHED',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
  });

  console.log('Created blog entries');

  // Create Sample Recipes (admin only)
  await prisma.recipe.create({
    data: {
      title: 'Klassischer Kartoffelsalat',
      description: 'Ein einfacher und leckerer Kartoffelsalat',
      ingredients: [
        '1 kg Kartoffeln',
        '1 Zwiebel',
        '200 ml Gemuesebruehe',
        '3 EL Essig',
        '4 EL Oel',
        'Salz',
        'Pfeffer',
        'Schnittlauch',
      ],
      instructions: `
1. Kartoffeln kochen, schaelen und in Scheiben schneiden
2. Zwiebel fein wuerfeln
3. Bruehe erwaermen und mit Essig und Oel verruehren
4. Alles vermischen und ziehen lassen
5. Mit Salz, Pfeffer und Schnittlauch abschmecken
      `.trim(),
      authorId: admin.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: 'Gemuese-Pfanne',
      description: 'Schnelles Gemuese aus der Pfanne',
      ingredients: [
        '2 Zucchini',
        '1 Paprika',
        '200g Champignons',
        '2 Knoblauchzehen',
        'Olivenoel',
        'Krauter der Provence',
      ],
      instructions: `
1. Gemuese waschen und in Stuecke schneiden
2. Oel in der Pfanne erhitzen
3. Gemuese anbraten, Knoblauch dazu
4. Mit Gewuerzen abschmecken
5. Servieren mit Reis oder Brot
      `.trim(),
      authorId: admin.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: 'Karottensuppe',
      description: 'Cremige Suppe mit frischen Karotten',
      ingredients: [
        '500g Karotten',
        '1 Zwiebel',
        '2 Kartoffeln',
        '1 Liter Gemuesebruehe',
        '100ml Sahne',
        'Ingwer',
        'Salz',
        'Pfeffer',
      ],
      instructions: `
1. Karotten und Kartoffeln schaelen und wuerfeln
2. Zwiebel hacken und in Butter anschwitzen
3. Gemuese dazugeben und mit Bruehe aufgiessen
4. 20 Minuten kochen, dann puerieren
5. Sahne einruehren und mit Ingwer, Salz, Pfeffer abschmecken
      `.trim(),
      authorId: admin.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: 'Ratatouille',
      description: 'Franzoesisches Gemuese-Schmorgericht',
      ingredients: [
        '2 Zucchini',
        '1 Aubergine',
        '2 Paprika',
        '4 Tomaten',
        '2 Zwiebeln',
        '3 Knoblauchzehen',
        'Olivenoel',
        'Thymian',
        'Rosmarin',
      ],
      instructions: `
1. Alles Gemuese in gleich grosse Wuerfel schneiden
2. Zwiebeln und Knoblauch in Olivenoel anschwitzen
3. Restliches Gemuese nach und nach dazugeben
4. Mit Kraeutern wuerzen und bei niedriger Hitze 30 Min. schmoren
5. Mit frischem Brot servieren
      `.trim(),
      authorId: admin.id,
    },
  });

  await prisma.recipe.create({
    data: {
      title: 'Spinat-Kartoffel-Auflauf',
      description: 'Herzhafter Auflauf mit Spinat',
      ingredients: [
        '800g Kartoffeln',
        '500g Spinat',
        '200g Feta',
        '2 Eier',
        '200ml Sahne',
        '1 Zwiebel',
        'Knoblauch',
        'Muskatnuss',
      ],
      instructions: `
1. Kartoffeln kochen und in Scheiben schneiden
2. Spinat blanchieren und ausdr?cken
3. Zwiebel und Knoblauch anbraten, Spinat dazugeben
4. Eier mit Sahne verquirlen, wuerzen
5. Alles schichten, mit Feta bestreuen und 30 Min. bei 180 Grad backen
      `.trim(),
      authorId: admin.id,
    },
  });

  console.log('Created sample recipes');

  // Create Sample Bank Transactions
  const importBatchId = crypto.randomUUID();

  // Matched transactions
  for (let i = 0; i < 10; i++) {
    const subscription = subscriptions[i];
    const amount = 80 + Math.floor(Math.random() * 70);
    const daysAgo = Math.floor(Math.random() * 30);

    await prisma.bankTransaction.create({
      data: {
        date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        amount: new Decimal(amount),
        description: `Dauerauftrag ${subscription.subscriptionId} Solawi Beitrag`,
        subscriptionId: subscription.id,
        matched: true,
        importBatchId,
      },
    });
  }

  // Unmatched transactions
  await prisma.bankTransaction.create({
    data: {
      date: new Date(),
      amount: new Decimal(95),
      description: 'Ueberweisung Solawi Beitrag Familie Mueller',
      matched: false,
      importBatchId,
    },
  });

  await prisma.bankTransaction.create({
    data: {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      amount: new Decimal(120),
      description: 'Spende fuer die Solawi',
      matched: false,
      importBatchId,
    },
  });

  console.log('Created sample bank transactions');

  // Create Sample Applications
  await prisma.application.create({
    data: {
      name: 'Max Mustermann',
      email: 'max.mustermann@example.de',
      phone: '0123-456789',
      message: 'Wir sind eine Familie mit zwei Kindern und interessieren uns sehr fuer frisches, regionales Gemuese. Wir wuerden gerne Teil der Solawi werden.',
      distributionCenterId: centerNord.id,
      status: 'PENDING',
    },
  });

  await prisma.application.create({
    data: {
      name: 'Anna Schmidt',
      email: 'anna.schmidt@example.de',
      message: 'Ich moechte gerne die lokale Landwirtschaft unterstuetzen und freue mich auf die Gemeinschaft.',
      distributionCenterId: centerSued.id,
      status: 'PENDING',
    },
  });

  console.log('Created sample applications');

  console.log('Seeding completed!');
  console.log('');
  console.log('Test accounts:');
  console.log('  Admin: admin@solawi-test.de');
  console.log('  Member: mitglied1@solawi-test.de ... mitglied20@solawi-test.de');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
