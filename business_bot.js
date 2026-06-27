require("dotenv").config();
// ============================================
//   YOUR DISCORD BUSINESS BOT
//   For: Thumbnail Design / Social Media Services
//   Made for beginners — easy to customize!
// ============================================

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ✏️ CUSTOMIZE YOUR BOT SETTINGS HERE
const PREFIX = "!"; // Commands start with !
const OWNER_ID = process.env.OWNER_ID; // Replace with your Discord ID (right-click your name > Copy ID)

// ✏️ YOUR SERVICES & PRICES — Edit these!
const SERVICES = [
  { name: "Discord Server B00st / 1M / 14x", price: "$3.5", delivery: "24 hours" },
  { name: "Discord N1tro B00st / 1M ", price: "$3.7", delivery: "Instant" },
  { name: "Decoration", price: "1.9$", delivery: "1-2 Hours" },
  { name: "Full Guide", price: "$25", delivery: "Instant" },
  { name: "Paid Bots / Tools", price: "13$", delivery: "2 days" },
];

// ✏️ YOUR INFO
const YOUR_NAME = "LegitMart"; // Your name or brand
const PORTFOLIO_LINK = "https://yourportfolio.com"; // Or a Discord server link
const PAYMENT_INFO = "Crypto (BTC/LTC/USDT) or Upi"; // How you accept payment

// 📦 STOCK LIST — managed by !restock command (owner only)
let stockList = [];

// ============================================
//   BOT READY
// ============================================
client.once("ready", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  client.user.setActivity("!services | Taking Orders 🚀", { type: "WATCHING" });
});

// ============================================
//   COMMANDS
// ============================================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Ignore other bots
  if (!message.content.startsWith(PREFIX)) return; // Ignore non-commands

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args[0].toLowerCase();

  // ---- !help ----
  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("📋 Bot Commands")
      .setColor("#5865F2")
      .addFields(
        { name: "!services", value: "View all services & prices" },
        { name: "!order [service name]", value: "Place an order" },
        { name: "!stock", value: "View current stock & availability" },
        { name: "!portfolio", value: "View my work" },
        { name: "!payment", value: "How to pay" },
        { name: "!contact", value: "Get in touch with me" },
        { name: "!restock (owner only)", value: "Add/update stock: !restock \"Product\" $price quantity \"time\"" }
      )
      .setFooter({ text: `${YOUR_NAME}'s Business Bot` });

    message.reply({ embeds: [embed] });
  }

  // ---- !services ----
  else if (command === "services") {
    const serviceList = SERVICES.map(
      (s, i) =>
        `**${i + 1}. ${s.name}**\n💰 Price: ${s.price} | ⏱️ Delivery: ${s.delivery}`
    ).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("🛒 Services & Pricing")
      .setDescription(serviceList)
      .setColor("#57F287")
      .setFooter({ text: "Type !order [service name] to place an order!" });

    message.reply({ embeds: [embed] });
  }

  // ---- !order ----
  else if (command === "order") {
    const serviceName = args.slice(1).join(" ");

    if (!serviceName) {
      return message.reply(
        "❌ Please tell me what you want to order!\nExample: `!order YouTube Thumbnail`"
      );
    }

    // Find the service (case-insensitive)
    const found = SERVICES.find((s) =>
      s.name.toLowerCase().includes(serviceName.toLowerCase())
    );

    if (!found) {
      return message.reply(
        `❌ I couldn't find that service. Type \`!services\` to see what's available.`
      );
    }

    // Send order confirmation to the user
    const userEmbed = new EmbedBuilder()
      .setTitle("✅ Order Received!")
      .setColor("#57F287")
      .setDescription(
        `Thanks for your order, **${message.author.username}**! I'll be in touch soon.`
      )
      .addFields(
        { name: "Service", value: found.name, inline: true },
        { name: "Price", value: found.price, inline: true },
        { name: "Delivery", value: found.delivery, inline: true },
        { name: "Next Step", value: `Please DM me to confirm your order and arrange payment.\nPayment: ${PAYMENT_INFO}` }
      )
      .setFooter({ text: `${YOUR_NAME}'s Business` });

    message.reply({ embeds: [userEmbed] });

    // Notify YOU (the owner) about the new order via DM
    try {
      const owner = await client.users.fetch(OWNER_ID);
      const ownerEmbed = new EmbedBuilder()
        .setTitle("🔔 NEW ORDER!")
        .setColor("#FEE75C")
        .addFields(
          { name: "Customer", value: `${message.author.tag} (${message.author.id})`, inline: true },
          { name: "Service", value: found.name, inline: true },
          { name: "Price", value: found.price, inline: true },
          { name: "Server", value: message.guild?.name || "DM", inline: true }
        );
      owner.send({ embeds: [ownerEmbed] });
    } catch (e) {
      console.log("Could not DM owner. Make sure OWNER_ID is set correctly.");
    }
  }

  // ---- !portfolio ----
  else if (command === "portfolio") {
    const embed = new EmbedBuilder()
      .setTitle("🎨 My Portfolio")
      .setDescription(`Check out my work here:\n🔗 ${PORTFOLIO_LINK}`)
      .setColor("#EB459E")
      .setFooter({ text: "Like what you see? Type !order to get started!" });

    message.reply({ embeds: [embed] });
  }

  // ---- !payment ----
  else if (command === "payment") {
    const embed = new EmbedBuilder()
      .setTitle("💳 Payment Methods")
      .setDescription(
        `I accept: **${PAYMENT_INFO}**\n\nPayment is required upfront before work begins.\nYou'll receive your files once payment is confirmed. ✅`
      )
      .setColor("#ED4245");

    message.reply({ embeds: [embed] });
  }

  // ---- !contact ----
  else if (command === "contact") {
    const embed = new EmbedBuilder()
      .setTitle("📩 Contact Me")
      .setDescription(
        `DM me directly on Discord or use \`!order\` to place an order.\n\nI usually reply within **a few hours**. ⚡`
      )
      .setColor("#5865F2");

    message.reply({ embeds: [embed] });
  }

  // ---- !restock (OWNER ONLY) ----
  // Usage: !restock "Product Name" $price quantity "delivery time"
  // Example: !restock "YouTube Thumbnail" $10 5 "24 hours"
  else if (command === "restock") {
    // 🔒 Owner only check
    if (message.author.id !== OWNER_ID) {
      return message.reply("❌ Only the owner can use this command!");
    }

    // Parse arguments — supports quoted strings e.g. "YouTube Thumbnail"
    const rawArgs = message.content.slice(PREFIX.length + command.length).trim();
    const parts = rawArgs.match(/(".*?"|[^\s]+)/g);

    if (!parts || parts.length < 4) {
      return message.reply(
        `❌ **Wrong format!**\n\nCorrect usage:\n\`\`\`!restock "Product Name" $price quantity "delivery time"\`\`\`\nExample:\n\`\`\`!restock "YouTube Thumbnail" $10 5 "24 hours"\`\`\``
      );
    }

    const product  = parts[0].replace(/"/g, "");
    const price    = parts[1].replace(/"/g, "");
    const quantity = parseInt(parts[2]);
    const time     = parts[3].replace(/"/g, "");

    if (isNaN(quantity) || quantity <= 0) {
      return message.reply("❌ Quantity must be a number greater than 0!\nExample: `!restock \"Thumbnail\" $10 5 \"24 hours\"`");
    }

    // Check if product already exists — update it instead of duplicating
    const existing = stockList.find(s => s.product.toLowerCase() === product.toLowerCase());
    if (existing) {
      existing.price    = price;
      existing.quantity = quantity;
      existing.time     = time;
    } else {
      stockList.push({ product, price, quantity, time });
    }

    const embed = new EmbedBuilder()
      .setTitle("📦 Stock Updated!")
      .setColor("#57F287")
      .addFields(
        { name: "📌 Product",  value: product,             inline: true },
        { name: "💰 Price",    value: price,               inline: true },
        { name: "🔢 Quantity", value: `${quantity} slots`, inline: true },
        { name: "⏱️ Delivery", value: time,                inline: true }
      )
      .setFooter({ text: "Customers can now see this with !stock" });

    message.reply({ embeds: [embed] });
  }

  // ---- !stock (everyone can see current stock) ----
  else if (command === "stock") {
    if (stockList.length === 0) {
      return message.reply("📭 No stock available right now. Check back later!");
    }

    const list = stockList.map((s, i) =>
      `**${i + 1}. ${s.product}**\n💰 ${s.price} | 🔢 ${s.quantity} slots left | ⏱️ ${s.time}`
    ).join("\n\n");

    const embed = new EmbedBuilder()
      .setTitle("📦 Current Stock")
      .setDescription(list)
      .setColor("#FEE75C")
      .setFooter({ text: "Type !order [product] to grab a slot!" });

    message.reply({ embeds: [embed] });
  }

});

// ============================================
//   LOGIN — Replace with your bot token
// ============================================
client.login(process.env.BOT_TOKEN);