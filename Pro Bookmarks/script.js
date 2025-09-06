(function(){
  const defaults = [
    { name: "Google", url: "https://www.google.com" },
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Facebook", url: "https://www.facebook.com" },
    { name: "LinkedIn", url: "https://www.linkedin.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Upwork", url: "https://www.upwork.com" },
    { name: "Freelancer", url: "https://www.freelancer.com" },
  ];

  const grid=document.getElementById('grid'),
        search=document.getElementById('search'),
        addBtn=document.getElementById('addBtn'),
        modal=document.getElementById('modal'),
        closeModal=document.getElementById('closeModal'),
        saveBtn=document.getElementById('saveBtn'),
        deleteBtn=document.getElementById('deleteBtn'),
        bkName=document.getElementById('bkName'),
        bkLink=document.getElementById('bkLink'),
        modalTitle=document.getElementById('modalTitle');

  let items = JSON.parse(localStorage.getItem('enam_bookmarks')||'null');
  if(!items){ 
    items = defaults.map(it => ({ ...it, iconUrl: faviconUrl(it.url) }));
    localStorage.setItem('enam_bookmarks', JSON.stringify(items)); 
  }

  let editIndex=null;

  function saveItems(){ localStorage.setItem('enam_bookmarks', JSON.stringify(items)); }
  function escapeHtml(t){ return String(t).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[s])); }
  function shortenUrl(u){ try{return new URL(u).hostname.replace('www.','');}catch(e){return u;} }
  function highlight(text,q){ if(!q) return escapeHtml(text); const re=new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g,'\\$&')})`,'gi'); return escapeHtml(text).replace(re,'<span class="highlight">$1</span>'); }

  // Auto favicon fetcher
  function faviconUrl(url){
    try{
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
    }catch(e){ return ''; }
  }

  function render(filter=''){
    grid.innerHTML='';
    const q=filter.trim().toLowerCase();
    items.forEach((it,idx)=>{
      const name=it.name||it.url;
      if(q && !(name.toLowerCase().includes(q) || it.url.toLowerCase().includes(q))) return;
      const card=document.createElement('div');
      card.className='card';
      card.dataset.index=idx;
      const favicon = faviconUrl(it.url);
      card.innerHTML=`
        <div class='icon' aria-hidden>
          ${favicon ? `<img src="${favicon}" alt="icon">` : `<svg width="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff"/></svg>`}
        </div>
        <div style='flex:1'>
          <div class='title'>${highlight(name,q)}</div>
          <div class='url'>${highlight(shortenUrl(it.url),q)}</div>
        </div>
        <div style='display:flex;flex-direction:column;gap:6px'>
          <button class='btn ghost openBtn' style='padding:6px 8px'>Open</button>
          <button class='btn ghost editBtn' style='padding:6px 8px'>Edit</button>
        </div>
      `;
      card.querySelector('.openBtn').addEventListener('click', e=>{ e.stopPropagation(); window.open(it.url,'_blank'); });
      card.querySelector('.editBtn').addEventListener('click', e=>{
        e.stopPropagation();
        editIndex=idx;
        bkName.value=it.name; bkLink.value=it.url;
        modalTitle.textContent='Edit Bookmark';
        deleteBtn.style.display='inline-block';
        modal.style.display='flex';
      });
      grid.appendChild(card);
    });
  }

  search.addEventListener('input', ()=>render(search.value));

  addBtn.addEventListener('click', ()=>{
    editIndex=null;
    bkName.value=''; bkLink.value='';
    modalTitle.textContent='Add Bookmark';
    deleteBtn.style.display='none';
    modal.style.display='flex';
    bkName.focus();
  });

  closeModal.addEventListener('click', ()=>modal.style.display='none');

  saveBtn.addEventListener('click', ()=>{
    const name=bkName.value.trim(), url=bkLink.value.trim();
    if(!url) return alert('Enter valid URL!');
    const iconUrl=faviconUrl(url);
    if(editIndex!==null){ items[editIndex]={name,url,iconUrl}; editIndex=null; }
    else items.push({name,url,iconUrl});
    saveItems(); render(search.value); modal.style.display='none';
  });

  deleteBtn.addEventListener('click', ()=>{
    if(editIndex!==null && confirm('Delete this bookmark?')){
      items.splice(editIndex,1);
      editIndex=null;
      saveItems(); render(search.value); modal.style.display='none';
    }
  });

  render();
})();