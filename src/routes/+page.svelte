<script lang="ts">
  import { afterUpdate, onMount } from 'svelte';
  import '../app.css';
  import Map from './common/map/Map.svelte';
  import { get } from 'svelte/store';
  import { storemap } from './common/store';
  import myPhoto from '$lib/assets/img/myphoto.jpg';
  import qiitaLogo from '$lib/assets/img/qiitaLogo.png';
  import { TextScramble } from './textScrumble';
  import { defportforioTexts } from './text';
  import { fade } from 'svelte/transition';
  import DarkButton from './DarkButton.svelte';
  import { isElementAppear } from './functions';
  import BuildingLayer from './common/map/BuildingLayer.svelte';
  import soldierModel from '$lib/assets/three/models/Soldier.glb';
  import GltfModel from './common/map/GltfModel.svelte';
  import worksImg1 from '$lib/assets/img/mapbox_on_model.png';
  import worksImg2 from '$lib/assets/img/threejs_basic_controls.png';
  import worksImg_threejsvrm from '$lib/assets/img/threejs_vrm.png';
  import worksImg_tamaki from '$lib/assets/img/tamaki_ss.png';
  import worksImg_storytailor from '$lib/assets/img/storytailor_ss.png';
  import worksImg_instantpodedit from '$lib/assets/img/instantpodedit.png';

  let totalPageHeight: number;
  let viewHeight: number;
  let scrollY: number;
  let currentScrollPercentage = 0;

  let isJp = false;
  let portforioTexts = defportforioTexts;
  let isDispTitle = false;
  let isDispMain = false;

  interface CustomPageElementProps {
    isDisplay?: boolean;
    isTrrigerd?: boolean;
  }
  let pageElements: { [key: string]: Element & CustomPageElementProps } = {};
  let isDrawLandscape = false;
  let isDrawModel = false;
  const MODEL_LAYER_ID = 'soldier';
  const movingOffset = 0.00000005;

  onMount(() => {
    totalPageHeight = document.documentElement.scrollHeight;

    setTimeout(() => {
      isDispTitle = true;

      setTimeout(() => {
        window.scrollTo(0, 0);
        isDispMain = true;
      }, 5000);
    }, 300);
  });

  afterUpdate(() => {
    currentScrollPercentage = Math.round((scrollY / (totalPageHeight - viewHeight)) * 100);
    totalPageHeight = document.documentElement.scrollHeight;

    if (!isDispMain) return;

    // 要素が画面内に表示されているかの更新
    Object.keys(pageElements).forEach((key) => {
      pageElements[key].isDisplay = isElementAppear(pageElements[key], viewHeight);
    });

    const map = get(storemap);

    // NOTE: aboutに遷移
    if (pageElements['about_detail'].isDisplay && !pageElements['about_detail'].isTrrigerd && map?.loaded()) {
      map?.flyTo({
        center: [139.744237, 35.656897],
        zoom: 18,
        bearing: 20,
        pitch: 80
      });
      pageElements['title'].isTrrigerd = false;
      pageElements['about_detail'].isTrrigerd = true;
      isDrawLandscape = true;
      return;
    }

    // NOTE: aboutから上に戻る
    if (
      pageElements['title'].isDisplay &&
      !pageElements['about_detail'].isDisplay &&
      !pageElements['title'].isTrrigerd &&
      map?.loaded()
    ) {
      map?.flyTo({
        center: [0, 0],
        zoom: 2,
        bearing: 0,
        pitch: 0
      });
      pageElements['title'].isTrrigerd = true;
      pageElements['about_detail'].isTrrigerd = false;
      isDrawLandscape = false;
      return;
    }

    // NOTE: historyに遷移
    if (pageElements['history_detail'].isDisplay && !pageElements['history_detail'].isTrrigerd && map?.loaded()) {
      map?.panTo([139.777116, 35.723513], {
        duration: 60000
      });
      pageElements['history_detail'].isTrrigerd = true;
      return;
    }

    // NOTE: historyから上に戻る
    if (
      pageElements['about_detail'].isDisplay &&
      !pageElements['history_detail'].isDisplay &&
      pageElements['history_detail'].isTrrigerd &&
      map?.loaded()
    ) {
      map?.panTo([139.744237, 35.656897], {
        duration: 1500
      });
      pageElements['history_detail'].isTrrigerd = false;
      return;
    }

    // NOTE: projectsに遷移
    if (pageElements['project_detail'].isDisplay && !pageElements['project_detail'].isTrrigerd && map?.loaded()) {
      map?.flyTo({
        center: [139.776627, 35.716939],
        zoom: 21,
        bearing: -58,
        pitch: 80
      });
      pageElements['project_detail'].isTrrigerd = true;
      isDrawModel = true;
      return;
    }

    // NOTE: projectsから上に戻る
    if (
      pageElements['skills_detail'].isDisplay &&
      !pageElements['project_detail'].isDisplay &&
      pageElements['project_detail'].isTrrigerd
    ) {
      map?.flyTo({
        center: [139.777116, 35.723513],
        zoom: 18,
        bearing: 20,
        pitch: 80
      });
      pageElements['project_detail'].isTrrigerd = false;
      isDrawModel = false;
      return;
    }
  });

  function onChangeLanguage() {
    isJp = !isJp;

    let changeLanguagePromises: Promise<unknown>[] = [];
    Object.keys(portforioTexts).forEach((key) => {
      const scrambler = new TextScramble(portforioTexts[key].el as Element);
      changeLanguagePromises.push(scrambler.setText(isJp ? portforioTexts[key].jp : portforioTexts[key].en));
    });
    const execute = Promise.all(changeLanguagePromises);

    execute.then(() => {
      console.log('finish all');
    });
  }

  function changeDarkMode(event: CustomEvent<{ isDarkmode: boolean }>) {
    const isDarkmode = event.detail.isDarkmode;
    const map = get(storemap);

    function change() {
      map?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': isDarkmode ? 'rgb(41, 209, 255)' : 'rgb(180, 227, 104)',
        'horizon-blend': 0.05,
        'space-color': isDarkmode ? 'rgb(26, 1, 61)' : 'rgb(192, 235, 242)',
        'star-intensity': isDarkmode ? 0.3 : 0
      });
    }
    if (map?.isStyleLoaded()) {
      change();
    } else {
      map?.on('style.load', () => {
        change();
      });
    }
  }
</script>

<svelte:window bind:scrollY bind:innerHeight={viewHeight} />

<div class="fixed top-0 left-0 h-full w-full -z-50">
  <Map zoom={2}>
    {#if isDrawLandscape}
      <BuildingLayer />
    {/if}
    {#if isDrawModel}
      <GltfModel
        layerId={MODEL_LAYER_ID}
        modelOrigin={[139.776627, 35.716939]}
        modelPath={soldierModel}
        scale={2}
        bearing={-58}
        {movingOffset}
        isTrackingModel
        isMe
        isAutowalk />
    {/if}
  </Map>
</div>

<!-- NOTE: use debug -->
<!-- <div class="fixed bottom-0 left-0 h-full w-full -z-40">
  {#if Object.keys(pageElements).length !== 0}
    {#each Object.keys(pageElements) as key}
      <h1 class="text-white text-2xl font-bold"> {key} is view : {pageElements[key].isDisplay}</h1>
    {/each}
  {/if}
</div> -->

<div class="fixed top-0 left-0 w-screen h-16 z-10 backdrop-blur-sm bg-white/10 text-white">
  <div class="h-full grid grid-cols-12">
    <div class="col-span-2 mx-auto my-auto">
      <DarkButton on:change={changeDarkMode} />
    </div>

    <div class="col-end-13 col-span-3 mx-auto my-auto">
      <button class="" on:click={onChangeLanguage}>
        <i class="fa-solid fa-globe fa-xl" />
        <span class="text-xs">
          <span class:font-bold={isJp === false} class:text-sm={isJp === false}>English</span>
          {' / '}
          <span class:font-bold={isJp === true} class:text-sm={isJp === true}>Japanese</span>
        </span>
      </button>
    </div>
  </div>
</div>

{#if !isDispMain}
  <section
    class="fixed h-screen w-screen flex justify-center items-center z-30 bg-slate-50 dark:bg-slate-800"
    out:fade={{ duration: 1000 }}>
    {#if isDispTitle}
      <h1 class="text-6xl font-bold" in:fade={{ duration: 3000 }}>KANSUKE ITO</h1>
    {/if}
  </section>
{/if}

<div
  class="fixed h-[calc(100vh-_2rem)] w-screen flex justify-center items-center -z-30 bg-slate-50/25 dark:bg-slate-700/25 backdrop-blur-sm" />

<main>
  <section class="h-screen w-screen flex justify-center items-center" bind:this={pageElements['title']}>
    <h1 class="text-6xl font-bold">KANSUKE ITO</h1>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <h1 class="text-6xl font-bold">ABOUT</h1>
  </section>

  <section class="w-6/12 my-auto mx-auto py-40" bind:this={pageElements['about_detail']}>
    <h2 class="text-4xl" bind:this={portforioTexts['about_name'].el}>{portforioTexts['about_name'].en}</h2>
    <img class="mt-5 w-full" src={myPhoto} alt="myphoto" />
    <p class="pt-10" bind:this={portforioTexts['about_desc1'].el}>
      {portforioTexts['about_desc1'].en}
    </p>
    <p class="pt-5" bind:this={portforioTexts['about_desc2'].el}>
      {portforioTexts['about_desc2'].en}
    </p>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <h1 class="text-6xl font-bold">HISTORY</h1>
  </section>
  <section class="h-screen w-6/12 my-auto mx-auto py-40" bind:this={pageElements['history_detail']}>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4">1992.12.16</div>
      <div class="col-span-1" bind:this={portforioTexts['history_0'].el}>
        {portforioTexts['history_0'].en}
      </div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4">2015.04 - 2019.03</div>
      <div class="col-span-1" bind:this={portforioTexts['history_1'].el}>
        {portforioTexts['history_1'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs" bind:this={portforioTexts['history_1_position'].el}>
        {portforioTexts['history_1_position'].en}
      </div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4">2019.04 - 2021.09</div>
      <div class="col-span-1" bind:this={portforioTexts['history_2'].el}>
        {portforioTexts['history_2'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs break-keep" bind:this={portforioTexts['history_2_position'].el}>
        {portforioTexts['history_2_position'].en}
      </div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4">2021.10 - 2024.06</div>
      <div class="col-span-1" bind:this={portforioTexts['history_3'].el}>
        {portforioTexts['history_3'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs" bind:this={portforioTexts['history_3_position'].el}>
        {portforioTexts['history_3_position'].en}
      </div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4">2024.12 - 2025.01</div>
      <div class="col-span-1" bind:this={portforioTexts['history_4'].el}>
        {portforioTexts['history_4'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs" bind:this={portforioTexts['history_4_position'].el}>
        {portforioTexts['history_4_position'].en}
      </div>
    </div>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <h1 class="text-6xl font-bold">SKILLS</h1>
  </section>

  <section class="w-8/12 my-auto mx-auto py-40" bind:this={pageElements['skills_detail']}>
    <h2 class="text-4xl pt-8 pb-4">CAPABILITIES</h2>
    <div>
      <span class="skill-badge-gray">Web Development</span>
      <span class="skill-badge-gray">Application Development</span>
      <span class="skill-badge-gray">Scrum master</span>
      <br />
      <span class="skill-badge-gray">Backend Development</span>
      <span class="skill-badge-gray">Infrastructure Development</span>
      <br />
      <span class="skill-badge-gray">CI/CD</span>
      <span class="skill-badge-gray">DevOps</span>
    </div>

    <h2 class="text-4xl pt-8 pb-4">LANGUAGE</h2>
    <div>
      <span class="skill-badge-gray">Japanese</span>
      <span class="skill-badge-gray">English </span>
      <span class="skill-badge-gray">C</span>
      <span class="skill-badge-gray">Java</span>
      <span class="skill-badge-gray">Python</span>
      <br />
      <span class="skill-badge-gray">Javascript(ES5/ES6)</span>
      <span class="skill-badge-pink">Typescript</span>
      <span class="skill-badge-pink">HTML</span>
      <br />
      <span class="skill-badge-gray">CSS</span>
      <span class="skill-badge-gray">Dart</span>
    </div>

    <h2 class="text-4xl pt-8 pb-4">TOOL</h2>
    <div>
      <span class="skill-badge-gray">Spring Boot</span>
      <span class="skill-badge-gray">Spring Batch</span>
      <span class="skill-badge-gray">React.js</span>
      <span class="skill-badge-gray">Next.js</span>
      <span class="skill-badge-gray">Vue.js</span>
      <span class="skill-badge-pink">three.js</span>
      <span class="skill-badge-pink">svelte.js</span>
      <br />
      <span class="skill-badge-pink">mapbox.gl</span>
      <span class="skill-badge-gray">Bootstrap</span>
      <span class="skill-badge-pink">Tailwind.css</span>
      <span class="skill-badge-gray">WordPress</span>
      <br />
      <span class="skill-badge-gray">Pytorch</span>
      <span class="skill-badge-gray">Flutter</span>
      <span class="skill-badge-gray">React Native</span>
      <span class="skill-badge-gray">Googel App Script</span>
    </div>

    <h2 class="text-4xl pt-8 pb-4">TEST</h2>
    <div>
      <span class="skill-badge-gray">JUnit</span>
      <span class="skill-badge-gray">DBUnit</span>
      <span class="skill-badge-gray">DBSetup</span>
      <span class="skill-badge-gray">Mybatis</span>
      <span class="skill-badge-gray">mockito</span>
      <span class="skill-badge-gray">Jest</span>
      <br />
      <span class="skill-badge-gray">Vitest</span>
      <span class="skill-badge-gray">testing-library</span>
      <span class="skill-badge-gray">enzyme</span>
      <span class="skill-badge-gray">Pytest</span>
      <span class="skill-badge-gray">Selenium</span>
      <br />
      <span class="skill-badge-gray">Nightwatch.js</span>
      <span class="skill-badge-gray">cypress.js</span>
    </div>

    <h2 class="text-4xl pt-8 pb-4">INFRA</h2>
    <div>
      <span class="skill-badge-gray">linux centos</span>
      <span class="skill-badge-gray">tomcat</span>
      <span class="skill-badge-gray">nginx</span>
      <span class="skill-badge-gray">vagrant</span>
      <span class="skill-badge-gray">docker</span>
      <span class="skill-badge-gray">AWS</span>
      <span class="skill-badge-gray">Firebase</span>
    </div>

    <h2 class="text-4xl pt-8 pb-4">AUTOMATION</h2>
    <div>
      <span class="skill-badge-gray">Ansible</span>
      <span class="skill-badge-gray">Jenkins(include pipeline)</span>
      <span class="skill-badge-pink">Github Actions</span>
    </div>

    <h2 class="text-4xl pt-8 pb-4">etc...</h2>
    <div>
      <span class="skill-badge-gray">NPM</span>
      <span class="skill-badge-pink">YARN</span>
      <span class="skill-badge-pink">Vite</span>
      <span class="skill-badge-gray">Figma</span>
      <span class="skill-badge-gray">Bluetooth(BLE)</span>
      <span class="skill-badge-gray">Raspberry Pi</span>
    </div>

    <div class="dark:text-slate-200 text-slate-800 pt-8">
      <span bind:this={portforioTexts['skill_note1'].el}>{portforioTexts['skill_note1'].en}</span>
      <span class="skill-badge-pink ml-3">badge</span>
      <span bind:this={portforioTexts['skill_note2'].el}>{portforioTexts['skill_note2'].en}</span>
    </div>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <h1 class="text-6xl font-bold">PROJECTS</h1>
  </section>
  <section class="w-6/12 my-auto mx-auto py-40" bind:this={pageElements['project_detail']}>
    <div class="grid grid-rows-3 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-3" bind:this={portforioTexts['projects_vls_solution'].el}>
        {portforioTexts['projects_vls_solution'].en}
      </div>
      <div class="col-span-1" bind:this={portforioTexts['projects_vls_solution_product'].el}>
        {portforioTexts['projects_vls_solution_product'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs">frontend engineer</div>
    </div>
    <div class="grid grid-rows-3 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-3" bind:this={portforioTexts['projects_1_company'].el}>
        {portforioTexts['projects_1_company'].en}
      </div>
      <div class="col-span-1" bind:this={portforioTexts['projects_1_product'].el}>
        {portforioTexts['projects_1_product'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs">frontend engineer</div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4" bind:this={portforioTexts['projects_2_company'].el}>
        {portforioTexts['projects_2_company'].en}
      </div>
      <div class="col-span-1" bind:this={portforioTexts['projects_2_product'].el}>
        {portforioTexts['projects_2_product'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs">scrum master</div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4" bind:this={portforioTexts['projects_3_company'].el}>
        {portforioTexts['projects_3_company'].en}
      </div>
      <div class="col-span-1" bind:this={portforioTexts['projects_3_product'].el}>
        {portforioTexts['projects_3_product'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs">fullstack engineer/scrum master</div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4" bind:this={portforioTexts['projects_4_company'].el}>
        {portforioTexts['projects_4_company'].en}
      </div>
      <div class="col-span-1" bind:this={portforioTexts['projects_4_product'].el}>
        {portforioTexts['projects_4_product'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs">backend engineer</div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4" bind:this={portforioTexts['projects_5_company'].el}>
        {portforioTexts['projects_5_company'].en}
      </div>
      <div class="col-span-1" bind:this={portforioTexts['projects_5_product'].el}>
        {portforioTexts['projects_5_product'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs">backend engineer</div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4" bind:this={portforioTexts['projects_6_company'].el}>
        {portforioTexts['projects_6_company'].en}
      </div>
      <div class="col-span-1" bind:this={portforioTexts['projects_6_product'].el}>
        {portforioTexts['projects_6_product'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs">Open-source framework document writer</div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4" bind:this={portforioTexts['projects_7_company'].el}>
        {portforioTexts['projects_7_company'].en}
      </div>
      <div class="col-span-1" bind:this={portforioTexts['projects_7_product'].el}>
        {portforioTexts['projects_7_product'].en}
      </div>
      <div class="row-span-2 col-span-1 text-xs">backend engineer</div>
    </div>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <h1 class="text-6xl font-bold">WORKS</h1>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <div class="grid grid-cols-7 gap-4">
      <!-- mapbox上でモデルを動かす -->
      <div class="col-start-2 col-end-4">
        <a href="/samplepage/mapbox" role="button" target="_blank" class="hover:brightness-110">
          <div class="max-w-sm rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800">
            <img class="w-full h-60 object-cover" src={worksImg1} alt="Sunset in the mountains" />
            <div class="px-6 py-4 h-40">
              <div class="font-bold text-xl mb-2">Digital twin</div>
              <p class="text-base">
                Share the location of the person manipulating the model with the map by opening the page.
              </p>
            </div>
            <div class="px-6 pt-4 pb-2 h-32">
              <span class="skill-badge-gray">mapbox.gl</span>
              <span class="skill-badge-gray">WebRTC</span>
              <span class="skill-badge-gray">three.js</span>
              <span class="skill-badge-gray">svelte.js</span>
              <span class="skill-badge-gray">Typescript</span>
            </div>
          </div>
        </a>
      </div>

      <!-- VRMモデルを動かす -->
      <div class="col-start-5 col-end-7">
        <a href="/samplepage/three-vrm" role="button" target="_blank" class="hover:brightness-110">
          <div class="max-w-sm rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800">
            <img class="w-full h-60 object-cover" src={worksImg_threejsvrm} alt="Sunset in the mountains" />
            <div class="px-6 py-4 h-40">
              <div class="font-bold text-xl mb-2">Vrm Model Controls</div>
              <p class="text-base">
                Vrm Model Controls on Svelte with three.js. In addition, Mixamo Animation is attached after model
                loaded.
              </p>
            </div>
            <div class="px-6 pt-4 pb-2 h-32">
              <span class="skill-badge-gray">three.js</span>
              <span class="skill-badge-gray">svelte.js</span>
              <span class="skill-badge-gray">Typescript</span>
            </div>
          </div>
        </a>
      </div>

      <div class="col-start-2 col-end-4">
        <a
          href="https://apps.apple.com/us/app/storytailor/id6744620244?itscg=30200&itsct=apps_box_link&mttnsubad=6744620244"
          role="button"
          target="_blank"
          class="hover:brightness-110">
          <div class="max-w-sm rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800">
            <img class="w-full h-60 object-cover" src={worksImg_storytailor} alt="Sunset in the mountains" />
            <div class="px-6 py-4 h-40">
              <div class="font-bold text-xl mb-2">Storytailor (for iOS, Android)</div>
              <p class="text-base">
                StoryTailor is an application that generates unique and original stories based on words entered by the
                user.
              </p>
            </div>
            <div class="px-6 pt-4 pb-2 h-32">
              <span class="skill-badge-gray">React Native</span>
              <span class="skill-badge-gray">Firebase</span>
              <span class="skill-badge-gray">Typescript</span>
              <span class="skill-badge-gray">Recraft AI API</span>
              <span class="skill-badge-gray">Open AI API</span>
            </div>
          </div>
        </a>
      </div>

      <div class="col-start-5 col-end-7">
        <a href="https://busstop.tamaki.ito-u-oti.com/" role="button" target="_blank" class="hover:brightness-110">
          <div class="max-w-sm rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800">
            <img class="w-full h-60 object-cover" src={worksImg_tamaki} alt="Sunset in the mountains" />
            <div class="px-6 py-4 h-40">
              <div class="font-bold text-xl mb-2">TAMAKI (for iOS, Android)</div>
              <p class="text-base">
                TAMAKI is an application that specializes in accurately and quickly displaying the estimated arrival
                time of public transportation buses.
              </p>
            </div>
            <div class="px-6 pt-4 pb-2 h-32">
              <span class="skill-badge-gray">React Native</span>
              <span class="skill-badge-gray">Firebase</span>
              <span class="skill-badge-gray">Typescript</span>
              <span class="skill-badge-gray">GTFS Open Data</span>
            </div>
          </div>
        </a>
      </div>

      <div class="col-start-2 col-end-4">
        <a href="https://1shotedit.com/" role="button" target="_blank" class="hover:brightness-110">
          <div class="max-w-sm rounded overflow-hidden shadow-lg bg-slate-50 dark:bg-slate-800">
            <img class="w-full h-60 object-cover" src={worksImg_instantpodedit} alt="InstantPodEdit" />
            <div class="px-6 py-4 h-40">
              <div class="font-bold text-xl mb-2">InstantPodEdit</div>
              <p class="text-base">
                InstantPodEdit is an AI-powered web tool for podcast creators that automatically removes
                background noise, unwanted sounds, and long silences, reducing editing time from hours to minutes.
              </p>
            </div>
            <div class="px-6 pt-4 pb-2 h-32">
              <span class="skill-badge-gray">Next.js</span>
              <span class="skill-badge-gray">Firebase</span>
              <span class="skill-badge-gray">Cloudflare</span>
              <span class="skill-badge-gray">Typescript</span>
              <span class="skill-badge-gray">Python</span>
              <span class="skill-badge-gray">Replicate AI</span>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <h1 class="text-6xl font-bold">WRITING</h1>
  </section>

  <section class="h-screen w-6/12 my-auto mx-auto pb-40 pt-80">
    <div class="text-center flex items-center justify-center">
      <a href="https://qiita.com/itouoti" role="button" target="_blank">
        <img width="150px" src={qiitaLogo} alt="Qiita link" class="inline-block hover:brightness-110" />
      </a>
      <a href="https://ito-u-oti.com/" role="button" target="_blank" class="ml-10">
        <i class="fa-brands fa-wordpress fa-4x hover:text-slate-800 dark:hover:text-slate-200" />
      </a>
    </div>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <h1 class="text-6xl font-bold">PATENT</h1>
  </section>

  <section class="h-screen w-6/12 my-auto mx-auto py-40">
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4">特開2024-066676</div>
      <div class="col-span-1">
        <a
          href="https://jglobal.jst.go.jp/detail?JGLOBAL_ID=202403001530235598&rel=1"
          role="button"
          target="_blank"
          class="hover:text-[#0000ee]">
          ウォーターサーバーの管理システム
        </a>
      </div>
    </div>
    <div class="grid grid-rows-4 grid-cols-2 grid-flow-col gap-1">
      <div class="row-span-4">特開2023-158808</div>
      <div class="col-span-1">
        <a
          href="https://jglobal.jst.go.jp/detail?JGLOBAL_ID=202403000064684631&rel=1"
          role="button"
          target="_blank"
          class="hover:text-[#0000ee]">
          情報処理装置、自動運転車両予約方法、および自動運転車両予約プログラム
        </a>
      </div>
    </div>
  </section>

  <section class="h-screen w-screen flex justify-center items-center">
    <h1 class="text-6xl font-bold">CONTACT</h1>
  </section>
  <section class="h-screen w-screen flex justify-center items-center">
    <div>
      <p class="pl-24">
        お気軽にご連絡ください。<br />
        If you just want to say hello, feel free to get in touch.
      </p>

      <div class="pl-24 pt-3">
        <a href="https://twitter.com/kanito_u_oti" role="button" target="_blank">
          <i class="fa-brands fa-x-twitter fa-xl hover:text-slate-800 dark:hover:text-slate-200" />
        </a>
        <a href="https://www.linkedin.com/in/itouoti/" role="button" target="_blank" class="ml-2">
          <i class="fa-brands fa-linkedin fa-xl hover:text-slate-800 dark:hover:text-slate-200" />
        </a>
      </div>
    </div>
  </section>
</main>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }

  .skill-badge-gray {
    @apply bg-gray-100 text-gray-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-500;
  }
  .skill-badge-pink {
    @apply bg-pink-100 text-pink-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-pink-400 border border-pink-400;
  }
</style>
