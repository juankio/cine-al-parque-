const fs = require('fs');

let content = fs.readFileSync('components/home/HomeHero.vue', 'utf8');

// I need to add the deep space / cinema background back, keeping the flashlight.

const bgMarkup = `
    <!-- Cinema Background -->
    <div class="absolute inset-0 z-0 bg-black">
      <img 
        src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=2670&auto=format&fit=crop" 
        alt="Cinema Background" 
        class="hero-bg-overlay w-full h-full object-cover opacity-20 mix-blend-screen"
      />
    </div>

    <!-- Gradient Vignette -->
    <div class="absolute inset-0 z-0 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent"></div>
    <div class="absolute inset-0 z-0 bg-gradient-to-r from-[#020202] via-[#020202]/80 to-transparent lg:via-[#020202]/90"></div>

    <!-- Linterna Effect (Sólo visible en hover) -->
`;

content = content.replace('<!-- Linterna Effect (Sólo visible en hover) -->', bgMarkup);

fs.writeFileSync('components/home/HomeHero.vue', content);
