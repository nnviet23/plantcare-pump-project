import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',fullyParallel:false,workers:1,timeout:30000,
 use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:5180',channel:'msedge',headless:true,viewport:{width:1536,height:1024},screenshot:'only-on-failure'},
 webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5180 --strictPort',url:'http://127.0.0.1:5180',reuseExistingServer:false},
});
