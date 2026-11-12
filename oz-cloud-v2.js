(() => {
  'use strict';
  const config=window.OZ_CONFIG||{};
  const ready=Boolean(config.supabaseUrl?.startsWith('https://') && config.supabaseAnonKey && !config.supabaseAnonKey.includes('COLE_AQUI'));
  const $=sel=>document.querySelector(sel);
  const msg=$('#login-message');
  const login=$('#google-login');
  const demo=$('#demo-login');
  const overlay=$('#login-overlay');
  const initial={companies:[{id:'komunica',name:'Komunica Mais',color:'#5776ec',archived:false},{id:'sozza',name:'SOZZA STUDIO',color:'#ff5a00',archived:false}],clients:[],batches:[],tasks:[],events:[]};
  let client=null,user=null,mode='demo',saveQueue=Promise.resolve();

  function dispatch(data){overlay.classList.add('hidden');window.dispatchEvent(new CustomEvent('oz-ready',{detail:{mode,user,data}}));}
  function errorMessage(error){console.error('[OZ PLANNER]',error);msg.textContent=error?.message||'Não foi possível conectar. Confira a configuração do Supabase e tente novamente.';login.disabled=false;}
  function announce(text){const t=$('#toast');if(!t)return;t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),5500);}
  async function enterCloud(sessionUser){
    if(!client||!sessionUser)return;
    user=sessionUser;
    msg.textContent='Verificando permissão e carregando seu espaço de trabalho...';
    try{
      const {data:permission,error:permissionError}=await client.rpc('oz_email_allowed');
      if(permissionError)throw new Error('Permissões ainda não configuradas. Execute o arquivo database.sql no Supabase.');
      if(!permission)throw new Error('Seu Gmail ainda não está autorizado. Inclua o endereço na tabela oz_allowed_emails pelo editor SQL do Supabase.');
      let {data:workspace,error}=await client.from('oz_workspaces').select('data').eq('owner_id',sessionUser.id).maybeSingle();
      if(error)throw error;
      if(!workspace){const created=await client.from('oz_workspaces').insert({owner_id:sessionUser.id,data:initial}).select('data').single();if(created.error)throw created.error;workspace=created.data;}
      mode='cloud';dispatch(workspace.data);
    }catch(error){errorMessage(error)}
  }
  async function signIn(){
    if(!ready||!client){errorMessage(new Error('Configure primeiro o arquivo config.js e o projeto Supabase.'));return}
    login.disabled=true;msg.textContent='Abrindo autenticação Google...';
    try{const redirectTo=window.location.origin+window.location.pathname;const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo,queryParams:{prompt:'select_account'}}});if(error)throw error}
    catch(error){errorMessage(error)}
  }
  async function signOut(){
    if(mode==='cloud'&&client){await client.auth.signOut();}
    window.location.reload();
  }
  function save(data){
    if(mode!=='cloud'||!user||!client)return;
    const copy=structuredClone(data);
    saveQueue=saveQueue.then(async()=>{
      const {error}=await client.from('oz_workspaces').upsert({owner_id:user.id,data:copy,updated_at:new Date().toISOString()},{onConflict:'owner_id'});
      if(error)throw error;
    }).catch(error=>{console.error('Falha ao salvar no Supabase:',error);announce('Erro de sincronização! Exporte um backup e confira sua conexão.');});
    return saveQueue;
  }
  window.OZCloud={save,signIn,signOut,get mode(){return mode}};
  login.addEventListener('click',signIn);
  demo.addEventListener('click',()=>{mode='demo';user=null;dispatch(null)});
  $('#logout-button').addEventListener('click',signOut);
  (async()=>{
    if(!ready){login.disabled=true;msg.textContent='O Google ainda não está configurado neste projeto. Configure o Supabase e o Google OAuth para ativar o acesso seguro. Você pode explorar a demonstração abaixo.';return}
    if(!window.supabase?.createClient){login.disabled=true;msg.textContent='Não foi possível carregar a biblioteca do Supabase. Verifique sua conexão à internet.';return}
    try{
      client=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}});
      const {data:{session},error}=await client.auth.getSession();
      if(error)throw error;
      if(session?.user)await enterCloud(session.user);
    }catch(error){errorMessage(error)}
  })();
})();
