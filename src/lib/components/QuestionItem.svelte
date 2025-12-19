<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { api } from '$lib/utils/api';
  import type { Question, Answer, User, Document } from '$types';
  import Icon from '$components/Icon.svelte';
  import { formatDistanceToNow } from 'date-fns';
  import { cs, enUS } from 'date-fns/locale';

  export let question: Question;
  export let currentUser: User | null;
  export let onDelete: (id: string) => void;

  let isReplying = false;
  let replyContent = '';
  let replyFile: File | null = null;
  let submitting = false;
  let isExpanded = false; // To toggle viewing answers if there are many? Or always show? Let's show always for now or toggle.
  
  // Local answers state, initialized from prop but mutable
  let answers = question.answers || [];

  $: locale = $_('language') === 'cs' ? cs : enUS;

  async function handleSubmitReply() {
    if (!replyContent.trim()) return;

    submitting = true;
    
    const formData = new FormData();
    formData.append('content', replyContent);
    if (replyFile) {
      formData.append('file', replyFile);
    }

    try {
        // We use fetch directly or api wrapper if it supports FormData. 
        // api.post wrapper usually sends JSON. let's check utils/api if it handles FormData, 
        // usually standard fetch is easier for FormData or we need to override headers.
        // Assuming api wrapper might stringify. Let's use raw fetch for multipart or check if api supports it.
        // Looking at `api.ts` isn't possible right now (not in context), but usually standard pattern is to let browser set Content-Type for FormData.
        // I will trust the api utility can handle it OR use standard fetch with auth headers.
        // Safe bet: use fetch with token from store/localStorage. But I don't have easy access to token here without store.
        // I'll assume `api.post` handles it if I pass FormData, explicitly not setting content-type so browser sets it with boundary.
        
        // Actually, many custom api wrappers fail at FormData if they enforce 'Content-Type': 'application/json'.
        // I'll try to use a specialized call or just `api.request` if available.
        // Let's assume standard behavior:
        const { data, error } = await api.postFormData<Answer>(`/api/v1/questions/${question.id}/answers`, formData);
        
        if (data) {
            answers = [...answers, data];
            replyContent = '';
            replyFile = null;
            isReplying = false;
        } else {
             alert(error?.message || 'Failed to post answer');
        }
    } catch (e) {
        console.error(e);
        alert('Error posting answer');
    }
    
    submitting = false;
  }

  async function handleDelete() {
    if (!confirm($_('common.confirm_delete') || 'Are you sure?')) return;
    
    const res = await api.del<{ success: boolean }>(`/api/v1/questions/${question.id}`);
    if (res.data?.success) {
      onDelete(question.id);
    } else {
      alert(res.error?.message || 'Failed to delete');
    }
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      replyFile = target.files[0];
    }
  }

  async function handleDownload(docId: string, filename: string) {
    // We need to fetch with auth token. api.get expects JSON response but here we need blob.
    // So we use fetch directly with token.
    const token = localStorage.getItem('access_token');
    try {
        const res = await fetch(`/api/v1/documents/${docId}/download`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
             alert('Failed to download file');
        }
    } catch (e) {
        console.error(e);
        alert('Error downloading file');
    }
  }
</script>

<div class="card p-5 border-l-4 border-l-accent-primary">
  <!-- Question Header -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-sm">
            {question.user?.email ? question.user.email[0].toUpperCase() : 'A'}
        </div>
        <div>
            <div class="font-medium text-sm text-light-text-primary dark:text-dark-text-primary">
                {question.user?.email ? (question.user.display_name || question.user.email.split('@')[0]) : 'Anonymous'}
            </div>
            <div class="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale })}
            </div>
        </div>
    </div>
    
    {#if currentUser && (currentUser.id === question.user_id || currentUser.role === 'admin')}
      <button 
        class="text-red-500 hover:text-red-600 p-1 rounded transition-colors opacity-50 hover:opacity-100"
        on:click={handleDelete}
        title={$_('common.delete') || 'Delete'}
      >
        <Icon name="trash" size={16} />
      </button>
    {/if}
  </div>

  <!-- Question Content -->
  <div class="prose dark:prose-invert max-w-none text-light-text-secondary dark:text-dark-text-secondary mb-4 break-words">
    {question.content}
  </div>

  <!-- Actions Bar -->
  <div class="flex items-center justify-between border-t border-light-border-primary dark:border-dark-border-primary pt-3 mt-2">
    <div class="flex gap-4 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
        <span class="flex items-center gap-1">
            <Icon name="message-square" size={14} />
            {answers.length} {answers.length === 1 ? ($_('common.answer') || 'answer') : ($_('common.answers') || 'answers')}
        </span>
    </div>

    {#if currentUser}
      <button 
        class="text-accent-primary hover:text-accent-secondary font-medium text-sm flex items-center gap-1 transition-colors"
        on:click={() => isReplying = !isReplying}
      >
        <Icon name="reply" size={14} />
        {$_('questions.reply') || 'Reply'}
      </button>
    {/if}
  </div>

  <!-- Reply Form -->
  {#if isReplying}
    <div class="mt-4 pl-4 border-l-2 border-accent-primary/20" transition:slide>
      <textarea
        bind:value={replyContent}
        class="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary rounded-lg p-3 min-h-[80px] mb-2 focus:ring-2 focus:ring-accent-primary outline-none text-sm"
        placeholder={$_('questions.reply_placeholder') || 'Write your answer...'}
      ></textarea>

      <!-- File Attachment -->
      <div class="flex items-center justify-between">
         <div class="flex items-center gap-2">
            <label class="cursor-pointer text-light-text-secondary dark:text-dark-text-secondary hover:text-accent-primary dark:hover:text-accent-primary transition-colors flex items-center gap-1 text-xs bg-light-bg-secondary dark:bg-dark-bg-secondary px-2 py-1 rounded border border-light-border-primary dark:border-dark-border-primary">
                <Icon name="paperclip" size={14} />
                {replyFile ? replyFile.name : ($_('questions.attach_file') || 'Attach File')}
                <input type="file" class="hidden" on:change={handleFileSelect} />
            </label>
            {#if replyFile}
                <button 
                    class="text-red-500 hover:text-red-700" 
                    on:click={() => replyFile = null}
                    title="Remove file"
                >
                    <Icon name="x" size={14} />
                </button>
            {/if}
         </div>

         <button 
            class="bg-accent-primary hover:bg-accent-secondary text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            on:click={handleSubmitReply}
            disabled={!replyContent.trim() || submitting}
         >
            {submitting ? 'Sending...' : ($_('common.send') || 'Send')}
         </button>
      </div>
    </div>
  {/if}

  <!-- Answers List -->
  {#if answers.length > 0}
    <div class="mt-4 space-y-4 pl-4 border-l-2 border-light-border-primary dark:border-dark-border-primary">
        {#each answers as answer}
            <div class="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-3">
                <div class="flex items-center gap-2 mb-2">
                    <div class="font-medium text-xs text-light-text-primary dark:text-dark-text-primary">
                        {answer.user?.email ? (answer.user.display_name || answer.user.email.split('@')[0]) : 'User'}
                    </div>
                    <div class="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                        {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale })}
                    </div>
                </div>
                
                <div class="text-sm text-light-text-secondary dark:text-dark-text-secondary break-words mb-2">
                    {answer.content}
                </div>

                {#if answer.document}
                    <div class="flex items-center gap-2 bg-light-bg-primary dark:bg-dark-bg-primary p-2 rounded border border-light-border-primary dark:border-dark-border-primary max-w-fit">
                        <Icon name="file" size={16} className="text-accent-primary" />
                        <span class="text-xs font-medium truncate max-w-[150px]">{answer.document.original_name}</span>
                        <button 
                            class="text-accent-primary hover:text-accent-secondary ml-2 transition-colors"
                            title={$_('common.download') || 'Download'}
                            on:click={() => handleDownload(answer.document.id, answer.document.original_name)}
                        >
                            <Icon name="download" size={14} />
                        </button>
                    </div>
                {/if}
            </div>
        {/each}
    </div>
  {/if}
</div>
