// Firebase Web SDK: browser modules. A bundler is not necessary for this small static site.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {getDatabase,ref,onValue,get,set,runTransaction} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js';

const config = window.YIHUI_FIREBASE_CONFIG;
const send = (name, detail={})=>window.dispatchEvent(new CustomEvent('yihui-firebase-'+name,{detail}));
const configured = config && ['apiKey','authDomain','databaseURL','projectId','appId','adminUid'].every(k=>
  typeof config[k]==='string' && config[k].trim() && !/^(PASTE_|YOUR_)/.test(config[k]) && !config[k].includes('YOUR_'));
if (!configured) {
  send('unconfigured');
} else {
  try {
    const app=initializeApp(config);
    const auth=getAuth(app);
    const database=getDatabase(app);
    const library=ref(database,'library');
    window.YihuiFirebase = {
      signIn: async(email,password)=>(await signInWithEmailAndPassword(auth,email,password)).user,
      signOut: ()=>signOut(auth),
      save: data=>set(library,data),
      reload: async()=> (await get(library)).val(),
      initializeIfEmpty: data =>runTransaction(library,current=>current===null?data:undefined,{applyLocally:false}),
    };
    onAuthStateChanged(auth,user=>send('auth',{uid:user?.uid||null}),e=>send('error',{message:e.message}));
    onValue(library,snapshot=>send('data',{data:snapshot.val()}),error=>send('error',{message:error.message}));
  } catch(error) {
    send('error',{message:error.message||String(error)});
  }
}
