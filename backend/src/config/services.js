const mongoose = require('mongoose');
const dns = require('node:dns');
mongoose.set('bufferCommands', false);
const connectDB = async () => {
  if (!process.env.COSMOSDB_URI) throw new Error('COSMOSDB_URI is required');
  // Optional per-process resolvers for networks whose DNS blocks MongoDB SRV queries.
  if (process.env.MONGODB_DNS_SERVERS) dns.setServers(process.env.MONGODB_DNS_SERVERS.split(',').map(s=>s.trim()).filter(Boolean));
  await mongoose.connect(process.env.COSMOSDB_URI,{serverSelectionTimeoutMS:10000,connectTimeoutMS:10000});
  console.log('[Database] Connected');
};
module.exports={connectDB};
