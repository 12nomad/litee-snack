import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon from 'argon2';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'pizza',
    slug: 'pizza',
    image: 'https://cdn-icons-png.flaticon.com/512/1404/1404945.png',
  },
  {
    name: 'fast food',
    slug: 'fast-food',
    image: 'https://cdn-icons-png.flaticon.com/512/3703/3703377.png',
  },
  {
    name: 'barbecue',
    slug: 'barbecue',
    image: 'https://cdn-icons-png.flaticon.com/512/1142/1142695.png',
  },
  {
    name: 'italian',
    slug: 'italian',
    image: 'https://cdn-icons-png.flaticon.com/512/5787/5787180.png',
  },
  {
    name: 'mexican',
    slug: 'mexican',
    image: 'https://cdn-icons-png.flaticon.com/512/4727/4727450.png',
  },
  {
    name: 'asian',
    slug: 'asian',
    image: 'https://cdn-icons-png.flaticon.com/512/6166/6166230.png',
  },
  {
    name: 'desserts',
    slug: 'desserts',
    image: 'https://cdn-icons-png.flaticon.com/512/702/702503.png',
  },
  {
    name: 'drinks',
    slug: 'drinks',
    image: 'https://cdn-icons-png.flaticon.com/512/1790/1790488.png',
  },
];

const shops = [
  {
    name: faker.company.name() + ' Pizza',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1590947132387-155cc02f3212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Pizza',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Wheels Pizza',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Burger',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Hot Dog',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Brunch',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Beef',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Ribs',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJhcmJlY3VlfGVufDB8fDB8fHww&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Smoked',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1534797258760-1bd2cc95a5bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Spaghetti',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1589227365533-cee630bd59bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c3BhZ2hldHRpfGVufDB8fDB8fHww&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Italia',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGl6emF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Pasta',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1551183053-bf91a1d81141?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHBhc3RhfGVufDB8fDB8fHww&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Tacos',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGFjb3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Tacos',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1613514785940-daed07799d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dGFjb3N8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Mexicana',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1584208632869-05fa2b2a5934?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bWV4aWNhbiUyMGZvb2R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Dumplings',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hpbmVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Ramen',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGNoaW5lc2UlMjBmb29kfGVufDB8fDB8fHww&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Sushi',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c3VzaGl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Bakery',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1612203985729-70726954388c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVzc2VydHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' House',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1547414368-ac947d00b91d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGVzc2VydHN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Candies',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1558326567-98ae2405596b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGRlc3NlcnRzfGVufDB8fDB8fHww&auto=format&fit=crop&w=1280&h=720',
  },
  {
    name: faker.company.name() + ' Drinks',
    address: faker.location.streetAddress(),
    ownerId: 1,
    image:
      'https://images.unsplash.com/photo-1596803244618-8dbee441d70b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y29jYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=1280&q=720',
  },
];

async function main() {
  const hashed = await argon.hash('qwerty123456');
  await prisma.user.create({
    data: {
      email: 'rodan0022@gmail.com',
      name: 'Rodan',
      role: 'SHOP',
      password: hashed,
      verified: false,
    },
  });

  await prisma.category.createMany({
    data: categories,
  });

  await prisma.shop.createMany({
    data: shops,
  });

  // Category => Shop
  let i = 1;
  for (let j = 1; j < 23; j += 3) {
    if (i === 8) {
      await prisma.category.update({
        where: { id: i },
        data: {
          shops: { connect: [{ id: j }] },
        },
      });
    } else {
      await prisma.category.update({
        where: { id: i },
        data: {
          shops: { connect: [{ id: j }, { id: j + 1 }, { id: j + 2 }] },
        },
      });
      i++;
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
