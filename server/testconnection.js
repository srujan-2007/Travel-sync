const { MongoClient, ServerApiVersion } = require("mongodb");

const uri =
    "mongodb+srv://travelsync_admin:pg9VLD6USMseKWYI@travelsynccluster.c43a3ip.mongodb.net/?appName=TravelSyncCluster";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();

        await client.db("admin").command({ ping: 1 });

        console.log("✅ Successfully connected to MongoDB!");
    } catch (err) {
        console.error("❌ Connection failed:");
        console.error(err);
    } finally {
        await client.close();
    }
}

run();