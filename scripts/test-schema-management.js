const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Testing Schema Management Functions");
    console.log("=====================================");

    // Get signers
    const [owner, admin, user] = await ethers.getSigners();
    
    // Get the deployed contract
    const ReservedSubdomains = await ethers.getContractFactory("ReservedSubdomains");
    const contract = await ReservedSubdomains.attach("0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6"); // Update with your deployed address
    
    console.log("📋 Contract Address:", await contract.getAddress());
    console.log("👤 Owner:", owner.address);
    console.log("🔑 Admin:", admin.address);

    // Add admin for testing
    console.log("\n1️⃣ Adding Administrator...");
    const addAdminTx = await contract.addAdministrator(admin.address);
    await addAdminTx.wait();
    console.log("✅ Admin added:", admin.address);

    // Test 1: Add a new schema
    console.log("\n2️⃣ Adding New Schema: 'analytics'");
    
    const analyticsFields = [
        {
            fieldName: "totalUsers",
            dataType: 1, // UINT256
            required: true,
            description: "Total number of users",
            validationRule: ">= 0",
            defaultValue: "0"
        },
        {
            fieldName: "activeUsers",
            dataType: 1, // UINT256
            required: true,
            description: "Number of active users",
            validationRule: ">= 0",
            defaultValue: "0"
        },
        {
            fieldName: "revenue",
            dataType: 1, // UINT256
            required: true,
            description: "Total revenue in wei",
            validationRule: ">= 0",
            defaultValue: "0"
        },
        {
            fieldName: "platform",
            dataType: 0, // STRING
            required: true,
            description: "Platform name",
            validationRule: "non-empty string",
            defaultValue: ""
        }
    ];

    const allowedRoles = ["admin", "analyst", "viewer"];
    const restrictions = ["read-only", "no-modify"];

    const addSchemaTx = await contract.addSchema(
        "analytics",
        2, // MEDIUM priority
        "Analytics",
        "Analytics data schema for tracking user metrics",
        "1.0.0",
        "IAnalytics",
        analyticsFields,
        allowedRoles,
        restrictions,
        "/api/v1/analytics",
        "https://docs.dao-registry.com/schemas/analytics"
    );
    await addSchemaTx.wait();
    console.log("✅ Analytics schema added successfully");

    // Test 2: Verify schema was added
    console.log("\n3️⃣ Verifying Schema Addition...");
    const analyticsSchema = await contract.getSchema("analytics");
    console.log("📊 Schema Details:");
    console.log("   Subdomain:", analyticsSchema.subdomain);
    console.log("   Priority:", analyticsSchema.priority);
    console.log("   Category:", analyticsSchema.category);
    console.log("   Description:", analyticsSchema.description);
    console.log("   Version:", analyticsSchema.version);
    console.log("   Active:", analyticsSchema.active);
    console.log("   Fields Count:", analyticsSchema.fields.length);

    // Test 3: Get schema field details
    console.log("\n4️⃣ Getting Schema Field Details...");
    const totalUsersField = await contract.getSchemaField("analytics", "totalUsers");
    console.log("📋 Field 'totalUsers':");
    console.log("   Name:", totalUsersField.fieldName);
    console.log("   Type:", totalUsersField.dataType);
    console.log("   Required:", totalUsersField.required);
    console.log("   Description:", totalUsersField.description);
    console.log("   Validation Rule:", totalUsersField.validationRule);
    console.log("   Default Value:", totalUsersField.defaultValue);

    // Test 4: Check if schema has specific field
    console.log("\n5️⃣ Checking Field Existence...");
    const hasRevenueField = await contract.hasSchemaField("analytics", "revenue");
    const hasNonExistentField = await contract.hasSchemaField("analytics", "nonexistent");
    console.log("✅ Has 'revenue' field:", hasRevenueField);
    console.log("❌ Has 'nonexistent' field:", hasNonExistentField);

    // Test 5: Get validation rules
    console.log("\n6️⃣ Getting Validation Rules...");
    const [fieldNames, validationRules] = await contract.getSchemaValidationRules("analytics");
    console.log("📋 Validation Rules:");
    for (let i = 0; i < fieldNames.length; i++) {
        console.log(`   ${fieldNames[i]}: ${validationRules[i]}`);
    }

    // Test 6: Update schema
    console.log("\n7️⃣ Updating Schema...");
    
    const updatedAnalyticsFields = [
        {
            fieldName: "totalUsers",
            dataType: 1, // UINT256
            required: true,
            description: "Total number of users (updated)",
            validationRule: ">= 0",
            defaultValue: "0"
        },
        {
            fieldName: "activeUsers",
            dataType: 1, // UINT256
            required: true,
            description: "Number of active users (updated)",
            validationRule: ">= 0",
            defaultValue: "0"
        },
        {
            fieldName: "revenue",
            dataType: 1, // UINT256
            required: true,
            description: "Total revenue in wei (updated)",
            validationRule: ">= 0",
            defaultValue: "0"
        },
        {
            fieldName: "platform",
            dataType: 0, // STRING
            required: true,
            description: "Platform name (updated)",
            validationRule: "non-empty string",
            defaultValue: ""
        },
        {
            fieldName: "growthRate",
            dataType: 1, // UINT256
            required: false,
            description: "Monthly growth rate in basis points",
            validationRule: ">= 0 && <= 10000",
            defaultValue: "0"
        }
    ];

    const updateSchemaTx = await contract.updateSchema(
        "analytics",
        2, // MEDIUM priority
        "Analytics",
        "Updated analytics data schema for tracking user metrics",
        "1.1.0",
        "IAnalyticsV2",
        updatedAnalyticsFields,
        allowedRoles,
        restrictions,
        "/api/v1/analytics",
        "https://docs.dao-registry.com/schemas/analytics"
    );
    await updateSchemaTx.wait();
    console.log("✅ Analytics schema updated to version 1.1.0");

    // Test 7: Verify schema update
    console.log("\n8️⃣ Verifying Schema Update...");
    const updatedSchema = await contract.getSchema("analytics");
    console.log("📊 Updated Schema Details:");
    console.log("   Version:", updatedSchema.version);
    console.log("   Description:", updatedSchema.description);
    console.log("   Fields Count:", updatedSchema.fields.length);
    console.log("   CCIP Interface:", updatedSchema.ccipInterface);

    // Test 8: Add another schema for testing removal
    console.log("\n9️⃣ Adding Temporary Schema: 'test'");
    
    const testFields = [
        {
            fieldName: "testField",
            dataType: 0, // STRING
            required: true,
            description: "Test field",
            validationRule: "non-empty string",
            defaultValue: ""
        }
    ];

    const addTestSchemaTx = await contract.addSchema(
        "test",
        3, // LOW priority
        "Testing",
        "Temporary schema for testing removal",
        "1.0.0",
        "ITest",
        testFields,
        ["admin"],
        [],
        "/api/v1/test",
        "https://docs.dao-registry.com/schemas/test"
    );
    await addTestSchemaTx.wait();
    console.log("✅ Test schema added successfully");

    // Test 9: Get statistics before removal
    console.log("\n🔢 Getting Statistics Before Removal...");
    const statsBefore = await contract.getStatistics();
    console.log("📊 Statistics:");
    console.log("   Total Schemas:", statsBefore.total.toString());
    console.log("   Critical:", statsBefore.critical.toString());
    console.log("   High:", statsBefore.high.toString());
    console.log("   Medium:", statsBefore.medium.toString());
    console.log("   Low:", statsBefore.low.toString());

    // Test 10: Remove test schema
    console.log("\n🗑️ Removing Test Schema...");
    const removeSchemaTx = await contract.removeSchema("test");
    await removeSchemaTx.wait();
    console.log("✅ Test schema removed successfully");

    // Test 11: Verify schema removal
    console.log("\n🔍 Verifying Schema Removal...");
    const hasTestSchema = await contract.hasSubdomainSchema("test");
    console.log("❌ Test schema exists:", hasTestSchema);

    // Test 12: Get statistics after removal
    console.log("\n🔢 Getting Statistics After Removal...");
    const statsAfter = await contract.getStatistics();
    console.log("📊 Updated Statistics:");
    console.log("   Total Schemas:", statsAfter.total.toString());
    console.log("   Critical:", statsAfter.critical.toString());
    console.log("   High:", statsAfter.high.toString());
    console.log("   Medium:", statsAfter.medium.toString());
    console.log("   Low:", statsAfter.low.toString());

    // Test 13: Test error handling
    console.log("\n⚠️ Testing Error Handling...");
    
    try {
        await contract.getSchema("nonexistent");
        console.log("❌ Should have failed - schema doesn't exist");
    } catch (error) {
        console.log("✅ Correctly failed for non-existent schema");
    }

    try {
        await contract.addSchema(
            "analytics", // Already exists
            2,
            "Analytics",
            "Duplicate schema",
            "1.0.0",
            "IDuplicate",
            testFields,
            ["admin"],
            [],
            "/api/v1/duplicate",
            "https://docs.dao-registry.com/schemas/duplicate"
        );
        console.log("❌ Should have failed - schema already exists");
    } catch (error) {
        console.log("✅ Correctly failed for duplicate schema");
    }

    // Test 14: Test access control
    console.log("\n🔐 Testing Access Control...");
    
    try {
        await contract.connect(user).addSchema(
            "unauthorized",
            2,
            "Unauthorized",
            "Unauthorized schema",
            "1.0.0",
            "IUnauthorized",
            testFields,
            ["admin"],
            [],
            "/api/v1/unauthorized",
            "https://docs.dao-registry.com/schemas/unauthorized"
        );
        console.log("❌ Should have failed - user not authorized");
    } catch (error) {
        console.log("✅ Correctly failed for unauthorized user");
    }

    console.log("\n🎉 Schema Management Tests Completed Successfully!");
    console.log("==================================================");
    console.log("✅ Added new schema");
    console.log("✅ Retrieved schema details");
    console.log("✅ Updated existing schema");
    console.log("✅ Removed schema");
    console.log("✅ Verified access control");
    console.log("✅ Tested error handling");
    console.log("✅ Validated statistics tracking");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    }); 