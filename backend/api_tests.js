const BASE_URL = 'http://localhost:4000';

async function runTests() {
    console.log("--- STARTING API TESTS (using native fetch) ---");

    try {
        // 1. Register User
        const testEmail = `test_${Date.now()}@example.com`;
        console.log(`\n[1/3] Registering user with email: ${testEmail}...`);
        const registerRes = await fetch(`${BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test User",
                email: testEmail,
                password: "password123",
                role: "admin"
            })
        });
        const registerData = await registerRes.json();
        console.log("Response:", registerData);

        // 2. Login User
        console.log("\n[2/3] Logging in...");
        const loginRes = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: "password123"
            })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Response (Token):", token ? "Token received!" : "NO TOKEN!");

        if (!token) {
            console.error("FAILED: No token received!");
            return;
        }

        // 3. Get Records
        console.log("\n[3/3] Fetching records with token...");
        const recordsRes = await fetch(`${BASE_URL}/records`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const recordsData = await recordsRes.json();
        console.log("Response (Count):", Array.isArray(recordsData) ? recordsData.length : "Not an array");
        console.log("First record:", recordsData[0] || "None");
        
        console.log("\nSUCCESS: All tests passed!");

    } catch (error) {
        console.error("API TEST FAILED:");
        console.error(error.message);
    }
}

runTests();
