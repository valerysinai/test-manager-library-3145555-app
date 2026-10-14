import {defineConfig} from 'vitest/config';
export default defineConfig({test:{environment:'jsdom',environmentOptions:{jsdom:{url:'https://localhost/'}},setupFiles:['./src/test/setup.ts'],restoreMocks:true}});
