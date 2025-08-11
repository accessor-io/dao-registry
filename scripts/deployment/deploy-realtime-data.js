const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying RealTimeDataRegistry Contract");
    console.log("==========================================");

    // Get signers
    const [owner, dataProvider1, dataProvider2] = await ethers.getSigners();
    
    console.log("Owner:", owner.address);
    console.log("Data Provider 1:", dataProvider1.address);
    console.log("Data Provider 2:", dataProvider2.address);

    // Deploy RealTimeDataRegistry
    console.log("\n1. Deploying RealTimeDataRegistry...");
    const RealTimeDataRegistry = await ethers.getContractFactory("RealTimeDataRegistry");
    const realTimeRegistry = await RealTimeDataRegistry.deploy();
    await realTimeRegistry.waitForDeployment();
    
    const contractAddress = await realTimeRegistry.getAddress();
    console.log("RealTimeDataRegistry deployed to:", contractAddress);

    // Add data providers
    console.log("\n2. Adding Data Providers...");
    
    const addProvider1Tx = await realTimeDataRegistry.addDataProvider(
        dataProvider1.address,
        ["ETH_PRICE", "BTC_PRICE", "DAO_VOTES", "TREASURY_BALANCE"]
    );
    await addProvider1Tx.wait();
    console.log("Data Provider 1 added");

    const addProvider2Tx = await realTimeDataRegistry.addDataProvider(
        dataProvider2.address,
        ["MARKET_CAP", "TRADING_VOLUME", "SOCIAL_SENTIMENT"]
    );
    await addProvider2Tx.wait();
    console.log("Data Provider 2 added");

    // Register real-time data points
    console.log("\n3. Registering Real-Time Data Points...");

    // ETH Price Feed
    const ethPriceFields = ["price", "timestamp", "source"];
    const ethPriceValues = [
        ethers.encodeBytes32String("2500.50"),
        ethers.encodeBytes32String(block.timestamp.toString()),
        ethers.encodeBytes32String("chainlink")
    ];
    
    const registerEthPriceTx = await realTimeDataRegistry.connect(dataProvider1).registerDataPoint(
        "ETH_PRICE",
        0, // PRICE_FEED
        0, // CONTINUOUS
        ethPriceFields,
        ethPriceValues,
        '{"source": "chainlink", "decimals": 8, "description": "Ethereum price feed"}'
    );
    await registerEthPriceTx.wait();
    console.log("ETH_PRICE data point registered");

    // BTC Price Feed
    const btcPriceFields = ["price", "timestamp", "source"];
    const btcPriceValues = [
        ethers.encodeBytes32String("45000.00"),
        ethers.encodeBytes32String(block.timestamp.toString()),
        ethers.encodeBytes32String("chainlink")
    ];
    
    const registerBtcPriceTx = await realTimeDataRegistry.connect(dataProvider1).registerDataPoint(
        "BTC_PRICE",
        0, // PRICE_FEED
        0, // CONTINUOUS
        btcPriceFields,
        btcPriceValues,
        '{"source": "chainlink", "decimals": 8, "description": "Bitcoin price feed"}'
    );
    await registerBtcPriceTx.wait();
    console.log("BTC_PRICE data point registered");

    // DAO Votes
    const daoVotesFields = ["proposalId", "forVotes", "againstVotes", "abstainVotes", "totalVotes"];
    const daoVotesValues = [
        ethers.encodeBytes32String("1"),
        ethers.encodeBytes32String("1500"),
        ethers.encodeBytes32String("200"),
        ethers.encodeBytes32String("50"),
        ethers.encodeBytes32String("1750")
    ];
    
    const registerDaoVotesTx = await realTimeDataRegistry.connect(dataProvider1).registerDataPoint(
        "DAO_VOTES",
        2, // GOVERNANCE_VOTE
        0, // CONTINUOUS
        daoVotesFields,
        daoVotesValues,
        '{"proposal": "Increase treasury allocation", "status": "active", "endTime": "2024-01-15"}'
    );
    await registerDaoVotesTx.wait();
    console.log("DAO_VOTES data point registered");

    // Treasury Balance
    const treasuryFields = ["ethBalance", "tokenBalance", "totalValue", "lastUpdate"];
    const treasuryValues = [
        ethers.encodeBytes32String("1000000000000000000000"), // 1000 ETH
        ethers.encodeBytes32String("50000000000000000000000"), // 50,000 tokens
        ethers.encodeBytes32String("2500000"), // $2.5M USD
        ethers.encodeBytes32String(block.timestamp.toString())
    ];
    
    const registerTreasuryTx = await realTimeDataRegistry.connect(dataProvider1).registerDataPoint(
        "TREASURY_BALANCE",
        3, // TREASURY_BALANCE
        2, // PER_MINUTE
        treasuryFields,
        treasuryValues,
        '{"currency": "USD", "valuation": "real-time", "source": "defi-pulse"}'
    );
    await registerTreasuryTx.wait();
    console.log("TREASURY_BALANCE data point registered");

    // Market Cap
    const marketCapFields = ["marketCap", "volume24h", "priceChange24h", "circulatingSupply"];
    const marketCapValues = [
        ethers.encodeBytes32String("50000000000"), // $50B
        ethers.encodeBytes32String("2000000000"), // $2B
        ethers.encodeBytes32String("5.2"), // +5.2%
        ethers.encodeBytes32String("12000000000") // 12B tokens
    ];
    
    const registerMarketCapTx = await realTimeDataRegistry.connect(dataProvider2).registerDataPoint(
        "MARKET_CAP",
        1, // MARKET_DATA
        2, // PER_MINUTE
        marketCapFields,
        marketCapValues,
        '{"source": "coinmarketcap", "updateFrequency": "1min", "currency": "USD"}'
    );
    await registerMarketCapTx.wait();
    console.log("MARKET_CAP data point registered");

    // Social Sentiment
    const socialFields = ["sentiment", "mentions", "engagement", "trending"];
    const socialValues = [
        ethers.encodeBytes32String("positive"),
        ethers.encodeBytes32String("15000"),
        ethers.encodeBytes32String("85000"),
        ethers.encodeBytes32String("true")
    ];
    
    const registerSocialTx = await realTimeDataRegistry.connect(dataProvider2).registerDataPoint(
        "SOCIAL_SENTIMENT",
        6, // SOCIAL_METRICS
        3, // PER_HOUR
        socialFields,
        socialValues,
        '{"platforms": ["twitter", "reddit", "telegram"], "sentiment_analysis": "vader"}'
    );
    await registerSocialTx.wait();
    console.log("SOCIAL_SENTIMENT data point registered");

    // Update data points to simulate real-time changes
    console.log("\n4. Simulating Real-Time Updates...");

    // Update ETH price
    const newEthPriceValues = [
        ethers.encodeBytes32String("2510.75"),
        ethers.encodeBytes32String(block.timestamp.toString()),
        ethers.encodeBytes32String("chainlink")
    ];
    
    const updateEthPriceTx = await realTimeDataRegistry.connect(dataProvider1).updateDataPoint(
        "ETH_PRICE",
        ethPriceFields,
        newEthPriceValues,
        '{"source": "chainlink", "decimals": 8, "description": "Ethereum price feed", "updated": true}'
    );
    await updateEthPriceTx.wait();
    console.log("ETH_PRICE updated");

    // Update DAO votes
    const newDaoVotesValues = [
        ethers.encodeBytes32String("1"),
        ethers.encodeBytes32String("1600"),
        ethers.encodeBytes32String("220"),
        ethers.encodeBytes32String("60"),
        ethers.encodeBytes32String("1880")
    ];
    
    const updateDaoVotesTx = await realTimeDataRegistry.connect(dataProvider1).updateDataPoint(
        "DAO_VOTES",
        daoVotesFields,
        newDaoVotesValues,
        '{"proposal": "Increase treasury allocation", "status": "active", "endTime": "2024-01-15", "updated": true}'
    );
    await updateDaoVotesTx.wait();
    console.log("DAO_VOTES updated");

    // Batch update multiple data points
    console.log("\n5. Performing Batch Update...");
    
    const batchDataKeys = ["BTC_PRICE", "MARKET_CAP"];
    const batchFieldNames = [
        ["price", "timestamp", "source"],
        ["marketCap", "volume24h", "priceChange24h", "circulatingSupply"]
    ];
    const batchFieldValues = [
        [
            ethers.encodeBytes32String("45100.00"),
            ethers.encodeBytes32String(block.timestamp.toString()),
            ethers.encodeBytes32String("chainlink")
        ],
        [
            ethers.encodeBytes32String("51000000000"),
            ethers.encodeBytes32String("2100000000"),
            ethers.encodeBytes32String("6.1"),
            ethers.encodeBytes32String("12000000000")
        ]
    ];
    const batchMetadata = [
        '{"source": "chainlink", "decimals": 8, "description": "Bitcoin price feed", "batch": true}',
        '{"source": "coinmarketcap", "updateFrequency": "1min", "currency": "USD", "batch": true}'
    ];
    
    const batchUpdateTx = await realTimeDataRegistry.connect(dataProvider1).batchUpdateDataPoints(
        batchDataKeys,
        batchFieldNames,
        batchFieldValues,
        batchMetadata
    );
    await batchUpdateTx.wait();
    console.log("Batch update completed");

    // Get statistics
    console.log("\n6. Getting Statistics...");
    const stats = await realTimeDataRegistry.getStatistics();
    console.log("Statistics:");
    console.log("   Total Data Points:", stats.total.toString());
    console.log("   Price Feeds:", stats.priceFeeds.toString());
    console.log("   Market Data:", stats.marketData.toString());
    console.log("   Governance Votes:", stats.governanceVotes.toString());
    console.log("   Treasury Balances:", stats.treasuryBalances.toString());
    console.log("   Token Metrics:", stats.tokenMetrics.toString());
    console.log("   Network Stats:", stats.networkStats.toString());
    console.log("   Social Metrics:", stats.socialMetrics.toString());
    console.log("   DeFi Metrics:", stats.defiMetrics.toString());

    // Get data point details
    console.log("\n7. Getting Data Point Details...");
    const ethPriceData = await realTimeDataRegistry.getDataPoint("ETH_PRICE");
    console.log("ETH_PRICE Details:");
    console.log("   Data Key:", ethPriceData.dataKey);
    console.log("   Data Type:", ethPriceData.dataType);
    console.log("   Frequency:", ethPriceData.frequency);
    console.log("   Last Update Time:", ethPriceData.lastUpdateTime.toString());
    console.log("   Update Count:", ethPriceData.updateCount.toString());
    console.log("   Active:", ethPriceData.active);
    console.log("   Field Names:", ethPriceData.fieldNames);
    console.log("   Metadata:", ethPriceData.metadata);

    // Get update history
    console.log("\n8. Getting Update History...");
    const ethPriceHistory = await realTimeDataRegistry.getUpdateHistory("ETH_PRICE", 5);
    console.log("ETH_PRICE Update History:");
    for (let i = 0; i < ethPriceHistory.length; i++) {
        const event = ethPriceHistory[i];
        console.log(`   Event ${i + 1}:`);
        console.log("     Timestamp:", event.timestamp.toString());
        console.log("     Block Number:", event.blockNumber.toString());
        console.log("     Data Provider:", event.dataProvider);
        console.log("     Old Hash:", event.oldDataHash);
        console.log("     New Hash:", event.newDataHash);
    }

    // Get data points by type
    console.log("\n9. Getting Data Points by Type...");
    const priceFeeds = await realTimeDataRegistry.getDataPointsByType(0); // PRICE_FEED
    console.log("Price Feeds:", priceFeeds);

    const governanceVotes = await realTimeDataRegistry.getDataPointsByType(2); // GOVERNANCE_VOTE
    console.log("Governance Votes:", governanceVotes);

    // Get data providers
    console.log("\nGetting Data Providers...");
    const ethPriceProviders = await realTimeDataRegistry.getDataProviders("ETH_PRICE");
    console.log("ETH_PRICE Providers:", ethPriceProviders);

    const provider1Keys = await realTimeDataRegistry.getProviderDataKeys(dataProvider1.address);
    console.log("Provider 1 Data Keys:", provider1Keys);

    console.log("\nRealTimeDataRegistry Deployment and Testing Completed!");
    console.log("==========================================================");
    console.log("Contract deployed successfully");
    console.log("Data providers added");
    console.log("Real-time data points registered");
    console.log("Updates simulated");
    console.log("Batch updates performed");
    console.log("Statistics retrieved");
    console.log("Event history accessed");
    console.log("Cross-references verified");

    return {
        contractAddress,
        owner: owner.address,
        dataProvider1: dataProvider1.address,
        dataProvider2: dataProvider2.address
    };
}

main()
    .then((result) => {
        console.log("\nDeployment Summary:");
        console.log("Contract Address:", result.contractAddress);
        console.log("Owner:", result.owner);
        console.log("Data Provider 1:", result.dataProvider1);
        console.log("Data Provider 2:", result.dataProvider2);
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    }); 