<script lang="ts">
  import { onMount } from 'svelte';
  import '../../app.css';
  import Header from '../common/header/Header.svelte';
  import worksImg1 from '$lib/assets/img/mapbox_on_model.png';
  import worksImg2 from '$lib/assets/img/threejs_basic_controls.png';
  import worksImg_threejsvrm from '$lib/assets/img/threejs_vrm.png';
  import worksImg_tamaki from '$lib/assets/img/tamaki_ss.png';
  import worksImg_storytailor from '$lib/assets/img/storytailor_ss.png';
  import worksImg_instantpodedit from '$lib/assets/img/instantpodedit.png';

  let isJp = false;
  let isDarkMode = false;

  onMount(() => {
    // ダークモードの初期状態を取得
    isDarkMode = document.documentElement.classList.contains('dark');
  });

  function onChangeLanguage() {
    isJp = !isJp;
  }

  function changeDarkMode(event: CustomEvent<{ isDarkmode: boolean }>) {
    isDarkMode = event.detail.isDarkmode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
</script>

<Header 
  {isJp} 
  showNavigation={false}
  showLanguageToggle={false}
  on:changeLanguage={onChangeLanguage} 
  on:changeDarkMode={changeDarkMode} 
/>

<div class="fixed h-full w-full -z-50 bg-slate-50 dark:bg-slate-900" />

<main class="pt-20 pb-20">
  <div class="container mx-auto px-8 max-w-full">

    <!-- Introduction -->
    <section class="mb-20 mt-16 p-12 ">
      <h2 class="text-5xl font-bold mb-6 text-slate-800 dark:text-white">Hello, I'm Kansuke, a Software engineer with a background in web development.</h2>
      <p class="text-xl text-slate-600 dark:text-slate-300">
        9+ years of developing experience across fintech, E-commerce, and autonomous driving industries.
      </p>
    </section>

    <div class="space-y-8">
      <!-- InstantPodEdit -->
      <a href="https://1shotedit.com/" role="button" target="_blank" class="block hover:brightness-110 transition-all">
        <div class="rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800 flex flex-col w-full">
          <img class="w-full h-[600px] object-cover" src={worksImg_instantpodedit} alt="InstantPodEdit" />
          <div class="p-8">
            <div class="font-bold text-2xl mb-4">InstantPodEdit</div>
            <p class="text-base mb-6">
              InstantPodEdit is an AI-powered web tool for podcast creators that automatically removes background noise, unwanted sounds, and long silences.
            </p>
            <div>
              <span class="skill-badge-gray">Next.js</span>
              <span class="skill-badge-gray">Firebase</span>
              <span class="skill-badge-gray">Cloudflare</span>
              <span class="skill-badge-gray">Typescript</span>
              <span class="skill-badge-gray">Python</span>
              <span class="skill-badge-gray">Replicate AI</span>
            </div>
          </div>
        </div>
      </a>

      <!-- StoryTailor -->
      <a
        href="https://apps.apple.com/us/app/storytailor/id6744620244"
        role="button"
        target="_blank"
        class="block hover:brightness-110 transition-all">
        <div class="rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800 flex flex-col w-full">
          <img class="w-full h-[600px] object-cover object-top" src={worksImg_storytailor} alt="StoryTailor" />
          <div class="p-8">
            <div class="font-bold text-2xl mb-4">StoryTailor (for iOS, Android)</div>
            <p class="text-base mb-6">
              StoryTailor is an application that generates unique and original stories based on words entered by the user.
            </p>
            <div>
              <span class="skill-badge-gray">React Native</span>
              <span class="skill-badge-gray">Firebase</span>
              <span class="skill-badge-gray">Typescript</span>
              <span class="skill-badge-gray">Recraft AI API</span>
              <span class="skill-badge-gray">Open AI API</span>
            </div>
          </div>
        </div>
      </a>

      <!-- TAMAKI -->
      <a href="https://busstop.tamaki.ito-u-oti.com/" role="button" target="_blank" class="block hover:brightness-110 transition-all">
        <div class="rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800 flex flex-col w-full">
          <img class="w-full h-[600px] object-cover" src={worksImg_tamaki} alt="TAMAKI" />
          <div class="p-8">
            <div class="font-bold text-2xl mb-4">TAMAKI (for iOS, Android)</div>
            <p class="text-base mb-6">
              TAMAKI is an application that specializes in accurately and quickly displaying the estimated arrival time of public transportation buses.
            </p>
            <div>
              <span class="skill-badge-gray">React Native</span>
              <span class="skill-badge-gray">Firebase</span>
              <span class="skill-badge-gray">Typescript</span>
              <span class="skill-badge-gray">GTFS Open Data</span>
            </div>
          </div>
        </div>
      </a>

      <!-- Digital twin -->
      <a href="/samplepage/mapbox" role="button" target="_blank" class="block hover:brightness-110 transition-all">
        <div class="rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800 flex flex-col w-full">
          <img class="w-full h-[600px] object-cover" src={worksImg1} alt="Digital twin" />
          <div class="p-8">
            <div class="font-bold text-2xl mb-4">Walking earth</div>
            <p class="text-base mb-6">
              Share the location of the person manipulating the model with the map by opening the page.
            </p>
            <div>
              <span class="skill-badge-gray">mapbox.gl</span>
              <span class="skill-badge-gray">WebRTC</span>
              <span class="skill-badge-gray">three.js</span>
              <span class="skill-badge-gray">svelte.js</span>
              <span class="skill-badge-gray">Typescript</span>
            </div>
          </div>
        </div>
      </a>

      <!-- VRM Model Controls -->
      <a href="/samplepage/three-vrm" role="button" target="_blank" class="block hover:brightness-110 transition-all">
        <div class="rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800 flex flex-col w-full">
          <img class="w-full h-[600px] object-cover" src={worksImg_threejsvrm} alt="VRM Model" />
          <div class="p-8">
            <div class="font-bold text-2xl mb-4">VRM Model Controls</div>
            <p class="text-base mb-6">
              VRM Model Controls on Svelte with three.js. In addition, Mixamo Animation is attached after model loaded.
            </p>
            <div>
              <span class="skill-badge-gray">three.js</span>
              <span class="skill-badge-gray">svelte.js</span>
              <span class="skill-badge-gray">Typescript</span>
            </div>
          </div>
        </div>
      </a>

    </div>
  </div>
</main>

<style lang="postcss">
  .skill-badge-gray {
    @apply bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500;
  }
</style>