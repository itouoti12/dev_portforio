<script lang="ts">
  import { fade } from 'svelte/transition';
  import DarkButton from './DarkButton.svelte';
  import { createEventDispatcher } from 'svelte';

  export let isJp = false;
  export let showNavigation = true;
  export let showLanguageToggle = true;

  const dispatch = createEventDispatcher();

  let isMenuOpen = false;

  function onChangeLanguage() {
    dispatch('changeLanguage');
  }

  function changeDarkMode(event: CustomEvent<{ isDarkmode: boolean }>) {
    dispatch('changeDarkMode', event.detail);
  }

  function scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      isMenuOpen = false;
    }
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  function navigateToHome() {
    window.location.href = '/';
  }
</script>

<div class="fixed top-0 left-0 w-screen h-16 z-10 backdrop-blur-sm bg-white/10 dark:text-white text-slate-800">
  <div class="h-full grid grid-cols-12">
    <div class="col-span-2 mx-auto my-auto">
      <DarkButton on:change={changeDarkMode} />
    </div>

    {#if showNavigation}
      <!-- デスクトップナビゲーション -->
      <nav class="hidden lg:flex col-span-7 items-center justify-center">
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('title')}>
          HOME
        </button>
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('about')}>
          ABOUT
        </button>
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('history')}>
          HISTORY
        </button>
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('skills')}>
          SKILLS
        </button>
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('projects')}>
          PROJECTS
        </button>
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('works')}>
          WORKS
        </button>
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('writing')}>
          WRITING
        </button>
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('patent')}>
          PATENT
        </button>
        <button class="mx-3 hover:font-bold transition-all" on:click={() => scrollToSection('contact')}>
          CONTACT
        </button>
      </nav>

      <!-- ハンバーガーメニューボタン -->
      <div class="lg:hidden col-span-7 flex items-center justify-center">
        <button on:click={toggleMenu} class="text-2xl">
          <i class={isMenuOpen ? 'fa-solid fa-times' : 'fa-solid fa-bars'} />
        </button>
      </div>
    {:else}
      <!-- WORKSページ用 - HOMEに戻るボタン -->
      <div class="col-span-8 flex items-center justify-center">
        <button class="hover:font-bold transition-all" on:click={navigateToHome}>
          <i class="fa-solid fa-home mr-2" />
          HOME
        </button>
      </div>
    {/if}

    {#if showLanguageToggle}
      <div class="col-end-13 col-span-2 mx-auto my-auto">
        <button class="" on:click={onChangeLanguage}>
          <i class="fa-solid fa-globe fa-xl" />
          <span class="text-xs">
            <span class:font-bold={isJp === false} class:text-sm={isJp === false}>English</span>
            {' / '}
            <span class:font-bold={isJp === true} class:text-sm={isJp === true}>Japanese</span>
          </span>
        </button>
      </div>
    {:else}
      <div class="col-end-13 col-span-2" />
    {/if}
  </div>
</div>

<!-- モバイルメニュー -->
{#if isMenuOpen && showNavigation}
  <div 
    class="fixed top-16 left-0 w-screen h-[calc(100vh-4rem)] z-20 backdrop-blur-md bg-white/90 dark:bg-slate-800/90 lg:hidden"
    transition:fade={{ duration: 200 }}>
    <nav class="flex flex-col items-center justify-center h-full space-y-6 text-xl">
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('title')}>
        HOME
      </button>
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('about')}>
        ABOUT
      </button>
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('history')}>
        HISTORY
      </button>
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('skills')}>
        SKILLS
      </button>
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('projects')}>
        PROJECTS
      </button>
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('works')}>
        WORKS
      </button>
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('writing')}>
        WRITING
      </button>
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('patent')}>
        PATENT
      </button>
      <button class="hover:font-bold transition-all" on:click={() => scrollToSection('contact')}>
        CONTACT
      </button>
    </nav>
  </div>
{/if}