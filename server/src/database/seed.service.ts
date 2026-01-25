import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { DRIZZLE, DrizzleDB } from './database.provider';
import { stores, products, NewStore, NewProduct } from './schema';
import { count } from 'drizzle-orm';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const [{ value: storeCount }] = await this.db
      .select({ value: count() })
      .from(stores);

    if (storeCount > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding database with initial data...');

    const seedStores: NewStore[] = [
      {
        name: 'Downtown Electronics Hub',
        address: '123 Main Street, New York, NY 10001',
        phone: '(212) 555-0100',
      },
      {
        name: 'Fashion District Outlet',
        address: '456 Style Avenue, Los Angeles, CA 90015',
        phone: '(310) 555-0200',
      },
      {
        name: 'Fresh Market Grocery',
        address: '789 Farm Road, Chicago, IL 60601',
        phone: '(312) 555-0300',
      },
    ];

    const insertedStores = await this.db
      .insert(stores)
      .values(seedStores)
      .returning();

    this.logger.log(`Created ${insertedStores.length} stores`);

    const electronicsProducts: Omit<NewProduct, 'storeId'>[] = [
      { name: 'iPhone 15 Pro', category: 'Electronics', price: '999.99', quantity: 25, sku: 'ELEC-IPH15P', description: 'Latest Apple smartphone with A17 Pro chip' },
      { name: 'Samsung Galaxy S24', category: 'Electronics', price: '849.99', quantity: 30, sku: 'ELEC-SGS24', description: 'Premium Android smartphone' },
      { name: 'MacBook Pro 14"', category: 'Electronics', price: '1999.99', quantity: 12, sku: 'ELEC-MBP14', description: 'Professional laptop with M3 Pro chip' },
      { name: 'Dell XPS 15', category: 'Electronics', price: '1499.99', quantity: 18, sku: 'ELEC-DXPS15', description: 'High-performance Windows laptop' },
      { name: 'Sony WH-1000XM5', category: 'Electronics', price: '349.99', quantity: 45, sku: 'ELEC-SNYWH5', description: 'Noise-cancelling wireless headphones' },
      { name: 'AirPods Pro 2', category: 'Electronics', price: '249.99', quantity: 60, sku: 'ELEC-APP2', description: 'Premium wireless earbuds with ANC' },
      { name: 'iPad Pro 12.9"', category: 'Electronics', price: '1099.99', quantity: 15, sku: 'ELEC-IPDP12', description: 'Professional tablet with M2 chip' },
      { name: 'Samsung 65" OLED TV', category: 'Electronics', price: '1799.99', quantity: 8, sku: 'ELEC-SGTV65', description: '4K OLED Smart TV' },
      { name: 'PlayStation 5', category: 'Electronics', price: '499.99', quantity: 20, sku: 'ELEC-PS5', description: 'Next-gen gaming console' },
      { name: 'Nintendo Switch OLED', category: 'Electronics', price: '349.99', quantity: 35, sku: 'ELEC-NSWOLED', description: 'Hybrid gaming console with OLED screen' },
      { name: 'Apple Watch Series 9', category: 'Electronics', price: '399.99', quantity: 40, sku: 'ELEC-AWS9', description: 'Advanced smartwatch with health features' },
      { name: 'GoPro Hero 12', category: 'Electronics', price: '399.99', quantity: 22, sku: 'ELEC-GPH12', description: 'Action camera with 5.3K video' },
      { name: 'Bose SoundLink Max', category: 'Electronics', price: '399.99', quantity: 28, sku: 'ELEC-BSLM', description: 'Portable Bluetooth speaker' },
      { name: 'Logitech MX Master 3S', category: 'Electronics', price: '99.99', quantity: 55, sku: 'ELEC-LGMX3S', description: 'Premium wireless mouse' },
      { name: 'Mechanical Keyboard K8', category: 'Electronics', price: '149.99', quantity: 42, sku: 'ELEC-KEYK8', description: 'TKL mechanical keyboard with RGB' },
      { name: 'LG 27" 4K Monitor', category: 'Electronics', price: '449.99', quantity: 16, sku: 'ELEC-LGM27', description: '27-inch 4K UHD monitor' },
      { name: 'Anker PowerCore 26800', category: 'Electronics', price: '59.99', quantity: 80, sku: 'ELEC-ANKPB', description: 'High-capacity portable charger' },
      { name: 'Ring Video Doorbell 4', category: 'Electronics', price: '199.99', quantity: 33, sku: 'ELEC-RVD4', description: 'Smart video doorbell with 1080p' },
      { name: 'Kindle Paperwhite', category: 'Electronics', price: '139.99', quantity: 48, sku: 'ELEC-KNDPW', description: 'E-reader with 6.8" display' },
      { name: 'DJI Mini 3 Pro', category: 'Electronics', price: '759.99', quantity: 10, sku: 'ELEC-DJIM3P', description: 'Compact drone with 4K camera' },
      { name: 'Sonos One SL', category: 'Electronics', price: '199.99', quantity: 25, sku: 'ELEC-SNS1SL', description: 'Wireless smart speaker' },
      { name: 'USB-C Hub 7-in-1', category: 'Electronics', price: '49.99', quantity: 90, sku: 'ELEC-USBHUB7', description: 'Multi-port USB-C adapter' },
      { name: 'Wireless Charging Pad', category: 'Electronics', price: '29.99', quantity: 100, sku: 'ELEC-WCHGP', description: '15W fast wireless charger' },
      { name: 'Smart LED Light Strip', category: 'Electronics', price: '39.99', quantity: 65, sku: 'ELEC-LEDST', description: 'RGB LED strip with app control' },
      { name: 'Webcam HD 1080p', category: 'Electronics', price: '79.99', quantity: 50, sku: 'ELEC-WCAM1080', description: 'HD webcam with microphone' },
      { name: 'External SSD 1TB', category: 'Electronics', price: '109.99', quantity: 38, sku: 'ELEC-SSD1TB', description: 'Portable solid state drive' },
      { name: 'Smart Thermostat', category: 'Electronics', price: '179.99', quantity: 20, sku: 'ELEC-STHERM', description: 'WiFi-enabled smart thermostat' },
      { name: 'Bluetooth Tracker 4-Pack', category: 'Electronics', price: '89.99', quantity: 55, sku: 'ELEC-BT4PK', description: 'Item tracker compatible with Find My' },
      { name: 'Gaming Mouse Pad XL', category: 'Electronics', price: '24.99', quantity: 75, sku: 'ELEC-GMPXL', description: 'Extended gaming mouse pad' },
      { name: 'HDMI Cable 6ft 4K', category: 'Electronics', price: '14.99', quantity: 120, sku: 'ELEC-HDMI6', description: 'High-speed HDMI 2.1 cable' },
      { name: 'Surge Protector 8-Outlet', category: 'Electronics', price: '34.99', quantity: 45, sku: 'ELEC-SPRG8', description: 'Power strip with surge protection' },
    ];

    const clothingProducts: Omit<NewProduct, 'storeId'>[] = [
      { name: 'Classic Denim Jeans', category: 'Clothing', price: '79.99', quantity: 50, sku: 'CLTH-JEANS01', description: 'Slim fit blue denim jeans' },
      { name: 'Cotton T-Shirt White', category: 'Clothing', price: '24.99', quantity: 100, sku: 'CLTH-TSWHT', description: '100% cotton crew neck t-shirt' },
      { name: 'Cotton T-Shirt Black', category: 'Clothing', price: '24.99', quantity: 95, sku: 'CLTH-TSBLK', description: '100% cotton crew neck t-shirt' },
      { name: 'Wool Blazer Navy', category: 'Clothing', price: '199.99', quantity: 20, sku: 'CLTH-BLZNVY', description: 'Classic wool blend blazer' },
      { name: 'Leather Jacket', category: 'Clothing', price: '349.99', quantity: 15, sku: 'CLTH-LTHRJK', description: 'Genuine leather motorcycle jacket' },
      { name: 'Silk Blouse', category: 'Clothing', price: '89.99', quantity: 30, sku: 'CLTH-SLKBLS', description: 'Elegant silk button-up blouse' },
      { name: 'Cashmere Sweater', category: 'Clothing', price: '149.99', quantity: 25, sku: 'CLTH-CSHSW', description: 'Soft cashmere pullover sweater' },
      { name: 'Chino Pants Khaki', category: 'Clothing', price: '59.99', quantity: 45, sku: 'CLTH-CHNKHK', description: 'Classic fit chino pants' },
      { name: 'Yoga Leggings', category: 'Clothing', price: '49.99', quantity: 60, sku: 'CLTH-YGLG', description: 'High-waist stretch leggings' },
      { name: 'Running Shorts', category: 'Clothing', price: '34.99', quantity: 55, sku: 'CLTH-RNSHRT', description: 'Lightweight athletic shorts' },
      { name: 'Hoodie Gray', category: 'Clothing', price: '64.99', quantity: 40, sku: 'CLTH-HDGRY', description: 'Fleece pullover hoodie' },
      { name: 'Down Jacket', category: 'Clothing', price: '249.99', quantity: 18, sku: 'CLTH-DWNJK', description: 'Insulated down puffer jacket' },
      { name: 'Trench Coat Beige', category: 'Clothing', price: '179.99', quantity: 12, sku: 'CLTH-TRNCHBG', description: 'Classic trench coat' },
      { name: 'Dress Shirt White', category: 'Clothing', price: '54.99', quantity: 35, sku: 'CLTH-DRSWHT', description: 'Formal cotton dress shirt' },
      { name: 'Linen Pants', category: 'Clothing', price: '69.99', quantity: 28, sku: 'CLTH-LNNPNT', description: 'Breathable linen trousers' },
      { name: 'Denim Jacket', category: 'Clothing', price: '89.99', quantity: 32, sku: 'CLTH-DNMJK', description: 'Classic blue denim jacket' },
      { name: 'Polo Shirt Navy', category: 'Clothing', price: '44.99', quantity: 48, sku: 'CLTH-PLONVY', description: 'Cotton pique polo shirt' },
      { name: 'Maxi Dress Floral', category: 'Clothing', price: '79.99', quantity: 22, sku: 'CLTH-MXDFLR', description: 'Long floral print dress' },
      { name: 'Cargo Pants Olive', category: 'Clothing', price: '74.99', quantity: 38, sku: 'CLTH-CRGOLV', description: 'Multi-pocket cargo pants' },
      { name: 'Swim Trunks', category: 'Clothing', price: '39.99', quantity: 42, sku: 'CLTH-SWMTR', description: 'Quick-dry swim shorts' },
      { name: 'Cardigan Knit', category: 'Clothing', price: '79.99', quantity: 26, sku: 'CLTH-CRDKNT', description: 'Button-front knit cardigan' },
      { name: 'Pleated Skirt', category: 'Clothing', price: '54.99', quantity: 30, sku: 'CLTH-PLTSKRT', description: 'A-line pleated midi skirt' },
      { name: 'Athletic Socks 6-Pack', category: 'Clothing', price: '19.99', quantity: 80, sku: 'CLTH-ATHSK6', description: 'Cushioned athletic socks' },
      { name: 'Beanie Hat Charcoal', category: 'Clothing', price: '24.99', quantity: 65, sku: 'CLTH-BNCHR', description: 'Knit winter beanie' },
      { name: 'Leather Belt Brown', category: 'Clothing', price: '49.99', quantity: 55, sku: 'CLTH-BLTBRN', description: 'Genuine leather dress belt' },
      { name: 'Scarf Cashmere', category: 'Clothing', price: '89.99', quantity: 20, sku: 'CLTH-SCRFCSH', description: 'Luxury cashmere scarf' },
      { name: 'Gloves Leather', category: 'Clothing', price: '59.99', quantity: 35, sku: 'CLTH-GLVLTH', description: 'Touchscreen-compatible leather gloves' },
      { name: 'Baseball Cap', category: 'Clothing', price: '29.99', quantity: 70, sku: 'CLTH-BSCAP', description: 'Adjustable cotton baseball cap' },
      { name: 'Sunglasses Aviator', category: 'Clothing', price: '129.99', quantity: 25, sku: 'CLTH-SNGAV', description: 'Classic aviator sunglasses' },
      { name: 'Sneakers White', category: 'Clothing', price: '99.99', quantity: 40, sku: 'CLTH-SNKWHT', description: 'Classic white leather sneakers' },
      { name: 'Ankle Boots Black', category: 'Clothing', price: '149.99', quantity: 22, sku: 'CLTH-ANKBTBLK', description: 'Leather ankle boots' },
    ];

    const foodProducts: Omit<NewProduct, 'storeId'>[] = [
      { name: 'Organic Bananas (bunch)', category: 'Food', price: '2.99', quantity: 150, sku: 'FOOD-BANORG', description: 'Fresh organic bananas' },
      { name: 'Avocados (4-pack)', category: 'Food', price: '5.99', quantity: 80, sku: 'FOOD-AVO4', description: 'Ripe Hass avocados' },
      { name: 'Organic Eggs (dozen)', category: 'Food', price: '6.99', quantity: 100, sku: 'FOOD-EGGORG', description: 'Free-range organic eggs' },
      { name: 'Almond Milk 64oz', category: 'Food', price: '4.49', quantity: 75, sku: 'FOOD-ALMMLK', description: 'Unsweetened almond milk' },
      { name: 'Greek Yogurt Plain', category: 'Food', price: '5.99', quantity: 90, sku: 'FOOD-GRKYGT', description: 'Plain Greek yogurt 32oz' },
      { name: 'Sourdough Bread', category: 'Food', price: '4.99', quantity: 45, sku: 'FOOD-SDBRD', description: 'Fresh baked sourdough loaf' },
      { name: 'Grass-Fed Ground Beef', category: 'Food', price: '9.99', quantity: 40, sku: 'FOOD-GFBEEF', description: '1lb grass-fed ground beef' },
      { name: 'Wild Salmon Fillet', category: 'Food', price: '14.99', quantity: 30, sku: 'FOOD-WSLMN', description: 'Fresh wild-caught salmon' },
      { name: 'Organic Chicken Breast', category: 'Food', price: '11.99', quantity: 50, sku: 'FOOD-ORGCHK', description: '1lb organic chicken breast' },
      { name: 'Extra Virgin Olive Oil', category: 'Food', price: '12.99', quantity: 55, sku: 'FOOD-EVOO', description: 'Premium olive oil 500ml' },
      { name: 'Aged Cheddar Cheese', category: 'Food', price: '7.99', quantity: 60, sku: 'FOOD-CHDR', description: 'Sharp aged cheddar 8oz' },
      { name: 'Organic Spinach', category: 'Food', price: '3.99', quantity: 65, sku: 'FOOD-SPNCH', description: 'Fresh organic baby spinach' },
      { name: 'Cherry Tomatoes', category: 'Food', price: '4.49', quantity: 70, sku: 'FOOD-CHTOM', description: 'Sweet cherry tomatoes pint' },
      { name: 'Mixed Berries', category: 'Food', price: '6.99', quantity: 45, sku: 'FOOD-MXBER', description: 'Fresh mixed berries 12oz' },
      { name: 'Organic Honey', category: 'Food', price: '8.99', quantity: 40, sku: 'FOOD-HONEY', description: 'Raw organic honey 16oz' },
      { name: 'Quinoa 2lb Bag', category: 'Food', price: '7.99', quantity: 55, sku: 'FOOD-QNOA', description: 'Organic white quinoa' },
      { name: 'Brown Rice 5lb', category: 'Food', price: '6.99', quantity: 60, sku: 'FOOD-BRNRC', description: 'Long grain brown rice' },
      { name: 'Pasta Penne', category: 'Food', price: '2.49', quantity: 85, sku: 'FOOD-PSTPN', description: 'Italian penne pasta 1lb' },
      { name: 'Marinara Sauce', category: 'Food', price: '4.99', quantity: 70, sku: 'FOOD-MRNSAUCE', description: 'Traditional marinara 24oz' },
      { name: 'Peanut Butter Natural', category: 'Food', price: '5.49', quantity: 65, sku: 'FOOD-PNTBTR', description: 'No-stir natural peanut butter' },
      { name: 'Dark Chocolate Bar', category: 'Food', price: '3.99', quantity: 90, sku: 'FOOD-DKCHOC', description: '72% dark chocolate 3.5oz' },
      { name: 'Trail Mix', category: 'Food', price: '6.99', quantity: 55, sku: 'FOOD-TRLMX', description: 'Premium nut and fruit mix' },
      { name: 'Sparkling Water 12-Pack', category: 'Food', price: '5.99', quantity: 80, sku: 'FOOD-SPKWTR', description: 'Unflavored sparkling water' },
      { name: 'Cold Brew Coffee', category: 'Food', price: '4.99', quantity: 50, sku: 'FOOD-CLDBREW', description: 'Ready-to-drink cold brew 32oz' },
      { name: 'Kombucha Ginger', category: 'Food', price: '3.99', quantity: 60, sku: 'FOOD-KMBGNG', description: 'Organic ginger kombucha' },
      { name: 'Hummus Original', category: 'Food', price: '4.49', quantity: 55, sku: 'FOOD-HMMUS', description: 'Classic hummus 10oz' },
      { name: 'Tortilla Chips', category: 'Food', price: '3.49', quantity: 75, sku: 'FOOD-TRTCHP', description: 'Stone-ground corn chips' },
      { name: 'Salsa Verde', category: 'Food', price: '4.29', quantity: 50, sku: 'FOOD-SLSVRD', description: 'Authentic green salsa 16oz' },
      { name: 'Coconut Oil', category: 'Food', price: '9.99', quantity: 40, sku: 'FOOD-CCOIL', description: 'Organic virgin coconut oil' },
      { name: 'Maple Syrup Grade A', category: 'Food', price: '11.99', quantity: 35, sku: 'FOOD-MPLSRP', description: 'Pure maple syrup 12oz' },
      { name: 'Oat Milk Barista', category: 'Food', price: '5.49', quantity: 0, sku: 'FOOD-OTMLKBR', description: 'Barista-style oat milk - OUT OF STOCK' },
      { name: 'Almond Butter', category: 'Food', price: '10.99', quantity: 3, sku: 'FOOD-ALMBT', description: 'Creamy almond butter - LOW STOCK' },
      { name: 'Chia Seeds', category: 'Food', price: '7.99', quantity: 2, sku: 'FOOD-CHISD', description: 'Organic chia seeds - LOW STOCK' },
    ];

    const electronicsStore = insertedStores[0];
    const clothingStore = insertedStores[1];
    const foodStore = insertedStores[2];

    const electronicsWithStoreId: NewProduct[] = electronicsProducts.map((p) => ({
      ...p,
      storeId: electronicsStore.id,
    }));

    const clothingWithStoreId: NewProduct[] = clothingProducts.map((p) => ({
      ...p,
      storeId: clothingStore.id,
    }));

    const foodWithStoreId: NewProduct[] = foodProducts.map((p) => ({
      ...p,
      storeId: foodStore.id,
    }));

    await this.db.insert(products).values([
      ...electronicsWithStoreId,
      ...clothingWithStoreId,
      ...foodWithStoreId,
    ]);

    this.logger.log(
      `Created ${electronicsProducts.length} electronics products for "${electronicsStore.name}"`,
    );
    this.logger.log(
      `Created ${clothingProducts.length} clothing products for "${clothingStore.name}"`,
    );
    this.logger.log(
      `Created ${foodProducts.length} food products for "${foodStore.name}"`,
    );

    this.logger.log('Database seeding completed successfully!');
  }
}
