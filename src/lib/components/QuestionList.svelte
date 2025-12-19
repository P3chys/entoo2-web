<script lang="ts">
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { api } from '$lib/utils/api';
  import type { Question, User } from '$types';
  import Icon from '$components/Icon.svelte';
  import QuestionItem from './QuestionItem.svelte';
  import { slide } from 'svelte/transition';

  export let subjectId: string;
  export let currentUser: User | null;

  let questions: Question[] = [];
  let loading = true;
  let error = '';
  
  // New question form
  let isAsking = false;
  let newQuestionContent = '';
  let isAnonymous = false;
  let submitting = false;

  async function loadQuestions() {
    loading = true;
    const res = await api.get<{ success: boolean; data: Question[] }>(`/api/v1/subjects/${subjectId}/questions`);
    if (res.data?.success) {
      questions = res.data.data;
    } else {
      error = res.error?.message || 'Failed to load questions';
    }
    loading = false;
  }

  async function handleSubmit() {
    if (!newQuestionContent.trim()) return;
    
    submitting = true;
    const res = await api.post<{ success: boolean; data: Question }>(`/api/v1/subjects/${subjectId}/questions`, {
      content: newQuestionContent,
      is_anonymous: isAnonymous
    });

    if (res.data?.success) {
      questions = [res.data.data, ...questions];
      newQuestionContent = '';
      isAsking = false;
    } else {
      alert(res.error?.message || 'Failed to post question');
    }
    submitting = false;
  }

  function handleQuestionDeleted(id: string) {
    questions = questions.filter(q => q.id !== id);
  }

  onMount(loadQuestions);
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold flex items-center gap-2">
      <Icon name="chat" size={28} className="text-accent-primary" />
      {$_('questions.title') || 'Q&A'}
    </h2>
    
    {#if currentUser && !isAsking}
      <button 
        class="bg-accent-primary hover:bg-accent-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        on:click={() => isAsking = true}
      >
        <Icon name="plus" size={16} />
        {$_('questions.ask_button') || 'Ask Question'}
      </button>
    {/if}
  </div>

  {#if isAsking}
    <div class="card p-4 border border-accent-primary/20" transition:slide>
      <h3 class="font-bold mb-2">{$_('questions.new_question_title') || 'New Question'}</h3>
      <textarea
        bind:value={newQuestionContent}
        class="w-full bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-3 min-h-[100px] mb-3 focus:ring-2 focus:ring-accent-primary outline-none"
        placeholder={$_('questions.placeholder') || 'What is your question?'}
      ></textarea>
      
      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" bind:checked={isAnonymous} class="rounded text-accent-primary focus:ring-accent-primary bg-light-bg-tertiary dark:bg-dark-bg-tertiary border-light-border-primary dark:border-dark-border-primary" />
          <span>{$_('comments.anonymous') || 'Post anonymously'}</span>
        </label>
        
        <div class="flex gap-2">
          <button 
            class="px-3 py-1.5 text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-sm font-medium transition-colors"
            on:click={() => isAsking = false}
            disabled={submitting}
          >
            {$_('common.cancel') || 'Cancel'}
          </button>
          <button 
            class="bg-accent-primary hover:bg-accent-secondary text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            on:click={handleSubmit}
            disabled={!newQuestionContent.trim() || submitting}
          >
            {#if submitting}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            {/if}
            {$_('common.submit') || 'Submit'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if loading}
    <div class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  {:else if error}
    <div class="text-red-500 text-center py-4">{error}</div>
  {:else if questions.length === 0}
    <div class="text-center py-12 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl border-2 border-dashed border-light-border-primary dark:border-dark-border-primary">
      <Icon name="chat" size={48} className="text-light-text-tertiary dark:text-dark-text-tertiary mx-auto mb-3" />
      <p class="text-light-text-secondary dark:text-dark-text-secondary">{$_('questions.empty') || 'No questions yet. Be the first to ask!'}</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each questions as question (question.id)}
        <QuestionItem {question} {currentUser} onDelete={handleQuestionDeleted} />
      {/each}
    </div>
  {/if}
</div>
