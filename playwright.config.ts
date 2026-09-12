import { defineConfig, devices } from "@playwright/test";
// E2E runs against the production build (run `npm run build` first). The dev
// server compiles chunks on demand and can serve 403s under parallel load,
// which kills hydration nondeterministically.
export default defineConfig({testDir:"./tests/e2e",fullyParallel:true,retries:process.env.CI?1:0,workers:process.env.CI?2:undefined,reporter:process.env.CI?"github":"list",use:{baseURL:"http://127.0.0.1:3000",trace:"retain-on-failure"},webServer:{command:"npm run start",url:"http://127.0.0.1:3000",reuseExistingServer:!process.env.CI,timeout:120_000},projects:[{name:"desktop",use:{...devices["Desktop Chrome"],viewport:{width:1440,height:900}}},{name:"mobile",use:{...devices["iPhone 13"],viewport:{width:390,height:844}}}]});
