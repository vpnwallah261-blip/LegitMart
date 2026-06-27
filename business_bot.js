require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = "!";
const OWNER_ID = process.env.OWNER_ID;
const YOUR_NAME = "LegitMart";
const PAYMENT_INFO = "Crypto (BTC/LTC/USDT) or UPI";

const SERVICES = [
  { name: "Discord Server Boost 1M 14x", price: "$3.5", delivery: "24 hours" },
  { name: "Discord Nitro Boost 1M", price: "$3.7", delivery: "Instant" },
  { name: "Decoration", price: "$1.9", delivery: "1-2 Hours" },
  { name: "Full Guide", price: "$25", delivery: "Instant" },
  { name: "Paid Bots and Tools", price: "$13", delivery: "2 days" },
];

let stockList = [];

client.once("clientReady", () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  client.user.setActivity("!services | Taking Orders 🚀", { type: "WATCHING" });
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  console.log(`📩 Command: ${message.content} from ${message.author.tag}`);

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args[0].toLowerCase();

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setTitle("📋 Bot Commands")
      .setColor("#5865F2")
      .addFields(
        { name: "!services", value: "View all services & prices" },
        { name: "!order [service name]", value: "Place an order" },
        { name: "!stock", value: "View current stock & availability" },
        { name: "!payment", value: "How to pay" },
        { name: "!contact", value: "Get in touch with me" },
        { name: "!restock (owner only)", value: '!restock "Product" $price quantity "time"' }
      )
      .setFooter({ text: `${YOUR_NAME}'s Business Bot` });
    message.reply({ embeds: [embed] });
  }

  else if (command === "services") {
    const serviceList = SERVICES.map((s, i) =>
      `**${i + 1}. ${s.name}**\n💰 Price: ${s.price} | ⏱️ Delivery: ${s.delivery}`
    ).join("\n\n");
    const embed = new EmbedBuilder()
      .setTitle("🛒 Services & Pricing")
      .setDescription(serviceList)
      .setColor("#57F287")
      .setFooter({ text: "Type !order [service name] to place an order!" });
    message.reply({ embeds: [embed] });
  }

  else if (command === "order") {
    const serviceName = args.slice(1).join(" ");
    if (!serviceName) return message.reply("❌ Example: `!order Decoration`");
    const found = SERVICES.find((s) =>
      s.name.toLowerCase().includes(serviceName.toLowerCase())
    );
    if (!found) return message.reply("❌ Service not found. Type `!services` to see options.");
    const userEmbed = new EmbedBuilder()
      .setTitle("✅ Order Received!")
      .setColor("#57F287")
      .setDescription(`Thanks **${message.author.username}**! I'll be in touch soon.`)
      .addFields(
        { name: "Service", value: found.name, inline: true },
        { name: "Price", value: found.price, inline: true },
        { name: "Delivery", value: found.delivery, inline: true },
        { name: "Next Step", value: `DM me to confirm and arrange payment.\nPayment: ${PAYMENT_INFO}` }
      )
      .setFooter({ text: `${YOUR_NAME}'s Business` });
    message.reply({ embeds: [userEmbed] });
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
      console.log("Could not DM owner:", e.message);
    }
  }

  else if (command === "payment") {
    const embed = new EmbedBuilder()
      .setTitle("💳 Payment Methods")
      .setDescription(`I accept: **${PAYMENT_INFO}**\n\nPayment required upfront. You'll receive your order once confirmed. ✅`)
      .setColor("#ED4245");
    message.reply({ embeds: [embed] });
  }

  else if (command === "contact") {
    const embed = new EmbedBuilder()
      .setTitle("📩 Contact Me")
      .setDescription("DM me directly or use `!order` to place an order.\n\nI usually reply within **a few hours**. ⚡")
      .setColor("#5865F2");
    message.reply({ embeds: [embed] });
  }

  else if (command === "restock") {
    if (message.author.id !== OWNER_ID) return message.reply("❌ Only the owner can use this command!");
    const rawArgs = message.content.slice(PREFIX.length + command.length).trim();
    const parts = rawArgs.match(/(".*?"|[^\s]+)/g);
    if (!parts || parts.length < 4) return message.reply('❌ Format: `!restock "Product" $price quantity "time"`');
    const product  = parts[0].replace(/"/g, "");
    const price    = parts[1].replace(/"/g, "");
    const quantity = parseInt(parts[2]);
    const time     = parts[3].replace(/"/g, "");
    if (isNaN(quantity) || quantity <= 0) return message.reply("❌ Quantity must be a number!");
    const existing = stockList.find(s => s.product.toLowerCase() === product.toLowerCase());
    if (existing) { existing.price = price; existing.quantity = quantity; existing.time = time; }
    else stockList.push({ product, price, quantity, time });
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

  else if (command === "stock") {
    if (stockList.length === 0) return message.reply("📭 No stock available right now. Check back later!");
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

client.login(process.env.BOT_TOKEN);
