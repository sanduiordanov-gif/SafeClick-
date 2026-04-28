/* ===========================
   SafeClick – app.js (v2 Dark Edition)
   =========================== */

// ── AUTH STATE ───────────────────────────────────────────────────────────────

let currentUser = null;

function openLogin() {
  document.getElementById('login-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeLogin() {
  document.getElementById('login-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
  document.getElementById('tab-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('tab-register').classList.toggle('hidden', tab !== 'register');
}
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) { alert('Completează toate câmpurile.'); return; }
  setUser(email.split('@')[0]);
}
function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  if (!name || !email || !pass) { alert('Completează toate câmpurile.'); return; }
  if (pass.length < 8) { alert('Parola trebuie să aibă minim 8 caractere.'); return; }
  setUser(name);
}
function doGuestLogin() { setUser('Vizitator'); }
function setUser(name) {
  currentUser = name;
  document.getElementById('login-btn-header').classList.add('hidden');
  const pill = document.getElementById('user-pill');
  pill.classList.remove('hidden');
  pill.style.display = 'flex';
  document.getElementById('user-name-display').textContent = '👤 ' + name;
  closeLogin();
}
function doLogout() {
  currentUser = null;
  document.getElementById('login-btn-header').classList.remove('hidden');
  const pill = document.getElementById('user-pill');
  pill.classList.add('hidden');
  pill.style.display = '';
}

// Close modal on overlay click
document.getElementById('login-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeLogin();
});

// ── AI CHAT ──────────────────────────────────────────────────────────────────

let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('ai-chat-box').classList.toggle('hidden', !chatOpen);
  document.getElementById('ai-fab-icon').textContent = chatOpen ? '✕' : '🤖';
}

async function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  appendMsg(text, 'user');
  const typing = appendMsg('SafeBot scrie...', 'bot typing');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `Ești SafeBot, asistentul de securitate online al platformei SafeClick. 
Răspunzi ÎNTOTDEAUNA în limba română. 
Ajuți utilizatorii cu întrebări despre securitate online, phishing, parole, protecție, 
malware și alte amenințări digitale. 
Fii concis, prietenos și practic. Răspunsurile să fie scurte (2-4 propoziții maxim).
Nu răspunde la subiecte care nu au legătură cu securitatea online.`,
        messages: [{ role: 'user', content: text }]
      })
    });
    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Scuze, nu am putut procesa întrebarea ta.';
    typing.remove();
    appendMsg(reply, 'bot');
  } catch (err) {
    typing.remove();
    appendMsg('Conexiune indisponibilă. Încearcă din nou mai târziu.', 'bot');
  }

  const msgs = document.getElementById('ai-messages');
  msgs.scrollTop = msgs.scrollHeight;
}

function appendMsg(text, cls) {
  const msgs = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = 'ai-msg ' + cls;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

// ── DATA ─────────────────────────────────────────────────────────────────────

const threats = [
  { title:"Phishing", icon:"📧", description:"Atacuri prin e-mail sau mesaje care încearcă să te păcălească să dezvălui informații personale sau să accesezi link-uri periculoase.", examples:["E-mailuri false de la bănci sau servicii online","Mesaje care pretind că ai câștigat un premiu","Link-uri care imită site-uri oficiale"], severity:"high" },
  { title:"Malware", icon:"🦠", description:"Software malițios conceput să deterioreze, să fure date sau să preia controlul dispozitivului tău.", examples:["Viruși care infectează fișierele sistemului","Ransomware care criptează datele tale","Spyware care monitorizează activitatea ta"], severity:"high" },
  { title:"Furt de Identitate", icon:"💳", description:"Furtul informațiilor personale pentru a fi folosite în scopuri frauduloase sau pentru a accesa conturile tale.", examples:["Furtul datelor cardului de credit","Acces neautorizat la conturi bancare","Utilizarea identității tale pentru fraude"], severity:"high" },
  { title:"Inginerie Socială", icon:"👥", description:"Manipularea psihologică a utilizatorilor pentru a dezvălui informații confidențiale sau a efectua acțiuni periculoase.", examples:["Apeluri false de la suport tehnic","Pretextarea pentru a obține informații","Crearea unui sentiment de urgență falsă"], severity:"medium" },
  { title:"Parole Compromise", icon:"🔐", description:"Parolele tale pot fi furate prin diverse metode, expunându-ți conturile la risc.", examples:["Breșe de securitate la servicii online","Keyloggere care înregistrează tastele","Parole slabe ușor de ghicit"], severity:"high" },
];

const protectionMethods = [
  { title:"Parole Puternice", icon:"🔑", description:"Folosește parole complexe și unice pentru fiecare cont.", tips:["Cel puțin 12 caractere cu litere, cifre și simboluri","Evită cuvinte comune sau informații personale","Folosește un manager de parole pentru gestionare","Schimbă parolele periodic"], color:"emerald" },
  { title:"Autentificare 2FA", icon:"📱", description:"Adaugă un nivel suplimentar de securitate pentru conturile tale.", tips:["Activează 2FA pe toate conturile importante","Folosește aplicații de autentificare (Google Authenticator)","Păstrează coduri de backup într-un loc sigur","Evită SMS-urile ca metodă principală de 2FA"], color:"blue" },
  { title:"Actualizări Regulate", icon:"🔄", description:"Menține sistemul și aplicațiile la zi pentru securitate maximă.", tips:["Activează actualizările automate pentru sistem","Actualizează browserul web regulat","Verifică actualizări pentru aplicații și software","Nu amâna patch-urile de securitate"], color:"violet" },
  { title:"Antivirus și Firewall", icon:"🛡️", description:"Folosește software de protecție pentru a detecta și bloca amenințările.", tips:["Instalează un antivirus de încredere","Menține firewall-ul activ permanent","Scanează regulat sistemul pentru malware","Verifică fișierele descărcate înainte de deschidere"], color:"red" },
  { title:"Navigare Sigură", icon:"👁️", description:"Fii atent la link-uri și site-uri web pentru a evita capcanele.", tips:["Verifică URL-urile înainte de a accesa site-uri","Caută pictograma de lacăt (HTTPS) în browser","Evită descărcările de pe site-uri nesigure","Folosește extensii de browser pentru blocare reclame"], color:"amber" },
  { title:"Backup Date", icon:"💾", description:"Protejează-ți datele importante prin copii de siguranță regulate.", tips:["Creează backup-uri automate zilnic/săptămânal","Păstrează copii în cloud și local","Verifică integritatea backup-urilor periodic","Criptează backup-urile sensibile"], color:"teal" },
];

const mistakes = [
  { title:"Reutilizarea Parolelor", icon:"👁️", mistake:"Folosirea aceleiași parole pentru multiple conturi.", consequence:"Dacă un cont este compromis, toate celelalte devin vulnerabile.", solution:"Folosește parole unice pentru fiecare cont și un manager de parole.", severity:"critical" },
  { title:"Click pe Link-uri Suspecte", icon:"🔗", mistake:"Accesarea link-urilor din e-mailuri sau mesaje necunoscute.", consequence:"Risc de phishing, infectare cu malware sau furt de date personale.", solution:"Verifică întotdeauna sursa înainte de a accesa un link.", severity:"critical" },
  { title:"Ignorarea Actualizărilor", icon:"⏰", mistake:"Amânarea sau ignorarea actualizărilor de sistem și aplicații.", consequence:"Vulnerabilități cunoscute rămân neacoperite, ușor de exploatat.", solution:"Activează actualizările automate și instalează patch-urile imediat.", severity:"high" },
  { title:"WiFi Public Nesecurizat", icon:"📶", mistake:"Conectarea la rețele WiFi publice fără protecție pentru activități sensibile.", consequence:"Datele tale pot fi interceptate de atacatori pe aceeași rețea.", solution:"Folosește un VPN când te conectezi la WiFi public.", severity:"high" },
  { title:"Descărcări din Surse Nesigure", icon:"⬇️", mistake:"Descărcarea de fișiere sau aplicații din surse neoficiale.", consequence:"Risc ridicat de infectare cu malware, viruși sau ransomware.", solution:"Descarcă doar din surse oficiale și scanează fișierele înainte de deschidere.", severity:"critical" },
  { title:"Lipsa 2FA", icon:"❌", mistake:"Neactivarea autentificării cu doi factori pe conturi importante.", consequence:"Conturile sunt protejate doar de o parolă, ușor de compromis.", solution:"Activează 2FA pe toate conturile care oferă această opțiune.", severity:"high" },
];

const guides = [
  { title:"Verificarea unui E-mail Suspect", icon:"📧", steps:["Verifică adresa de e-mail a expeditorului (nu doar numele afișat)","Caută greșeli gramaticale sau de formatare","Nu accesa link-uri direct – treci cu mouse-ul peste ele","Verifică dacă e-mailul cere informații personale urgente","Contactează compania direct prin canalele oficiale"], color:"blue", gradient:"linear-gradient(135deg,#1d4ed8,#1e40af)" },
  { title:"Crearea unei Parole Puternice", icon:"✅", steps:["Folosește minim 12-16 caractere","Combină litere mari, mici, cifre și simboluri","Evită cuvinte din dicționar sau informații personale","Folosește o frază de trecere (passphrase) ușor de reținut","Păstrează parole unice pentru fiecare cont","Folosește un manager de parole"], color:"emerald", gradient:"linear-gradient(135deg,#15803d,#047857)" },
  { title:"Navigare Sigură pe Internet", icon:"🌐", steps:["Verifică dacă site-ul folosește HTTPS","Instalează extensii de blocare reclame și trackere","Folosește navigare privată pentru activități sensibile","Șterge cookie-urile și istoricul periodic","Evită descărcările automate și pop-up-urile"], color:"violet", gradient:"linear-gradient(135deg,#6d28d9,#5b21b6)" },
  { title:"Cumpărături Online în Siguranță", icon:"🛒", steps:["Cumpără doar de pe site-uri de încredere cu HTTPS","Verifică recenziile și reputația magazinului","Folosește metode de plată sigure (PayPal, card virtual)","Nu salva datele cardului pe site-uri","Verifică extrasele bancare pentru tranzacții necunoscute"], color:"amber", gradient:"linear-gradient(135deg,#b45309,#92400e)" },
  { title:"Securizarea Dispozitivelor", icon:"💻", steps:["Setează parole/PIN-uri puternice pentru deblocare","Activează criptarea diskului (BitLocker, FileVault)","Instalează și actualizează software antivirus","Activează firewall-ul sistemului","Dezactivează serviciile și porturile nefolosite","Activează funcția de găsire/ștergere la distanță"], color:"red", gradient:"linear-gradient(135deg,#b91c1c,#991b1b)" },
];

const colorMap = {
  emerald: { checkColor:"#22c55e" },
  blue:    { checkColor:"#3b82f6" },
  violet:  { checkColor:"#8b5cf6" },
  red:     { checkColor:"#ef4444" },
  amber:   { checkColor:"#f59e0b" },
  teal:    { checkColor:"#14b8a6" },
};

// ── QUIZ DATA ─────────────────────────────────────────────────────────────────

const quizQuestions = [
  { q:"Ce este phishing-ul?", opts:["Un tip de virus care se răspândește prin rețea","O metodă de a înșela utilizatorii să dezvăluie informații personale prin mesaje false","Un software de protecție împotriva atacurilor","Un protocol de securitate pentru rețele WiFi"], correct:1, explanation:"Phishing-ul este o tehnică de înșelăciune prin e-mailuri sau mesaje false care imită surse de încredere." },
  { q:"Care este lungimea minimă recomandată pentru o parolă sigură?", opts:["6 caractere","8 caractere","12 caractere","20 caractere"], correct:2, explanation:"Experții în securitate recomandă parole de minim 12 caractere cu o combinație de litere, cifre și simboluri." },
  { q:"Ce înseamnă 2FA?", opts:["Two Factor Authentication – autentificare cu doi factori","Two File Access – acces la două fișiere","Transfer File Authorization – autorizare transfer fișier","Two Firewall Access – acces dublu firewall"], correct:0, explanation:"2FA (Two Factor Authentication) adaugă un al doilea nivel de verificare pe lângă parolă, sporind securitatea contului." },
  { q:"Ce indică pictograma 🔒 (lacăt) în bara de adrese a browserului?", opts:["Site-ul este complet sigur și de încredere","Conexiunea folosește HTTPS, deci datele sunt criptate","Site-ul a fost verificat de poliție","Nu poți descărca nimic de pe site"], correct:1, explanation:"Lacătul indică că site-ul folosește HTTPS – conexiunea ta este criptată. Nu garantează că site-ul este legitim." },
  { q:"Ce ar trebui să faci când primești un e-mail suspect de la 'bancă'?", opts:["Accesezi link-ul din e-mail pentru a verifica","Dai reply cu datele tale pentru confirmare","Contactezi banca direct prin numărul oficial de pe card","Ignori complet e-mailul și nu faci nimic"], correct:2, explanation:"Contactează întotdeauna banca prin canalele oficiale (număr de pe card/site oficial), niciodată prin link-uri din e-mailuri." },
  { q:"Ce este un VPN?", opts:["Un program antivirus avansat","Un serviciu care criptează traficul internet și ascunde IP-ul tău","Un tip de parolă cu mai mulți factori","Un firewall hardware pentru rețele mari"], correct:1, explanation:"VPN (Virtual Private Network) criptează conexiunea ta la internet și îți protejează datele, mai ales pe WiFi public." },
];

let quizState = { current: 0, score: 0, answered: false };

// ── ROUTER ───────────────────────────────────────────────────────────────────

const pages = { home: renderHome, amenintari: renderThreats, protectie: renderProtection, greseli: renderMistakes, ghiduri: renderGuides, quiz: renderQuiz, contact: renderContact };

function navigateTo(page) {
  if (!pages[page]) page = 'home';
  document.querySelectorAll('#main-nav a, .mobile-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  const content = document.getElementById('app-content');
  content.innerHTML = pages[page]();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  history.pushState({ page }, '', '#' + page);
  if (page === 'quiz') { quizState = { current:0, score:0, answered:false }; renderQuizQuestion(); }
}

window.addEventListener('popstate', (e) => navigateTo(e.state?.page || 'home'));

function toggleMenu() {
  document.getElementById('mobile-nav').classList.toggle('open');
}

// ── EXPANDABLE CARDS ──────────────────────────────────────────────────────────

function toggleExpand(id) {
  const content = document.getElementById('exp-' + id);
  const btn = document.getElementById('btn-' + id);
  const isOpen = content.classList.contains('expanded');
  content.classList.toggle('collapsed', isOpen);
  content.classList.toggle('expanded', !isOpen);
  btn.classList.toggle('open', !isOpen);
  btn.querySelector('.arrow').textContent = isOpen ? '▶' : '▼';
}

// ── PAGE RENDERS ──────────────────────────────────────────────────────────────

function renderHome() {
  const cards = [
    { title:"Amenințări Online",  desc:"Descoperă cele mai frecvente pericole și cum să le recunoști.", icon:"⚠️", page:"amenintari", bar:"linear-gradient(90deg,#ef4444,#f97316)" },
    { title:"Cum Te Protejezi",   desc:"Metodele și instrumentele esențiale pentru securitatea ta.", icon:"🔒", page:"protectie",  bar:"linear-gradient(90deg,#22c55e,#14b8a6)" },
    { title:"Greșeli Frecvente",  desc:"Evită cele mai comune erori care îți pot compromite siguranța.", icon:"❌", page:"greseli",   bar:"linear-gradient(90deg,#f59e0b,#eab308)" },
    { title:"Ghiduri Rapide",     desc:"Sfaturi practice și pași concreți pentru securitate imediată.", icon:"📖", page:"ghiduri",   bar:"linear-gradient(90deg,#3b82f6,#8b5cf6)" },
  ];
  return `
    <div class="home-wrap">
      <div class="container">
        <section class="hero">
          <div class="hero-badge">🛡️ Platforma #1 de Educație în Securitate Online</div>
          <h1>Navighează Online<br><span>în Siguranță Deplină</span></h1>
          <p>Învață cum să te protejezi de amenințări cibernetice, să recunoști înșelătoriile și să îți securizezi viața digitală.</p>
          <div class="hero-buttons">
            <button class="btn-primary" onclick="navigateTo('amenintari')">Explorează Amenințările →</button>
            <button class="btn-secondary" onclick="navigateTo('quiz')">🧠 Testează-te</button>
          </div>
        </section>

        <div class="stats-bar">
          <div class="stat-item"><div class="stat-num">5+</div><div class="stat-lbl">Tipuri de Amenințări</div></div>
          <div class="stat-item"><div class="stat-num">6</div><div class="stat-lbl">Metode de Protecție</div></div>
          <div class="stat-item"><div class="stat-num">100%</div><div class="stat-lbl">Gratuit & Accesibil</div></div>
        </div>

        <section>
          <h2 class="section-title">Explorează Resursele</h2>
          <p class="section-sub">Tot ce ai nevoie pentru a fi în siguranță online, organizat clar.</p>
          <div class="cards-grid">
            ${cards.map(c => `
              <div class="card" onclick="navigateTo('${c.page}')">
                <div class="card-top-bar" style="background:${c.bar}"></div>
                <div class="card-body">
                  <div class="card-icon-wrap"><span>${c.icon}</span></div>
                  <h3>${c.title}</h3>
                  <p>${c.desc}</p>
                  <div class="card-link">Explorează <span>→</span></div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="quiz-cta-section">
          <div class="quiz-cta-card">
            <div>
              <h3>🧠 Cât de pregătit ești?</h3>
              <p>Testează-ți cunoștințele de securitate online cu quiz-ul nostru interactiv. 6 întrebări, scoruri imediate și explicații detaliate.</p>
            </div>
            <button class="btn-primary" onclick="navigateTo('quiz')">Începe Quiz-ul</button>
          </div>
        </section>

        <section class="cta-banner">
          <h2>De ce este importantă siguranța online?</h2>
          <p>În fiecare zi, milioane de utilizatori sunt expuși la riscuri online. Cunoștințele tale pot face diferența dintre o experiență sigură și una periculoasă. SafeClick te ajută să rămâi informat și protejat.</p>
        </section>
      </div>
    </div>`;
}

function renderThreats() {
  return `
    <div class="page-wrap">
      <div class="container">
        <div class="page-inner">
          <div class="page-hero">
            <div class="page-icon-wrap"><span>⚠️</span></div>
            <h1>Amenințări Online</h1>
            <p>Cunoașterea amenințărilor este primul pas către protecție. Iată cele mai frecvente pericole din mediul online.</p>
          </div>
          <div class="item-list">
            ${threats.map((t, i) => {
              const isHigh = t.severity === 'high';
              const color = isHigh ? '#ef4444' : '#f59e0b';
              return `
              <div class="item-card" style="border-left-color:${color}">
                <div class="item-card-inner">
                  <div class="item-icon-wrap">${t.icon}</div>
                  <div class="item-body">
                    <div class="item-header">
                      <h3>${t.title}</h3>
                      <span class="badge ${isHigh ? 'badge-red' : 'badge-amber'}">${isHigh ? 'Risc Ridicat' : 'Risc Mediu'}</span>
                    </div>
                    <p class="item-desc">${t.description}</p>
                    <button class="expand-btn" id="btn-t${i}" onclick="toggleExpand('t${i}')">
                      <em class="arrow">▶</em> Vezi exemple
                    </button>
                    <div class="expandable-content collapsed" id="exp-t${i}">
                      <div class="examples-box">
                        <h4>Exemple comune:</h4>
                        <ul>${t.examples.map(e => `<li>${e}</li>`).join('')}</ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="bottom-banner" style="background:linear-gradient(135deg,#7f1d1d,#b91c1c)">
            <h2>🛡️ Rămâi Vigilent!</h2>
            <p>Aceste amenințări evoluează constant. Informează-te regulat și fii mereu atent la activitatea ta online.</p>
          </div>
        </div>
      </div>
    </div>`;
}

function renderProtection() {
  return `
    <div class="page-wrap">
      <div class="container">
        <div class="page-inner-wide">
          <div class="page-hero">
            <div class="page-icon-wrap"><span>🔒</span></div>
            <h1>Cum Te Protejezi</h1>
            <p>Descoperă metodele și instrumentele esențiale pentru a-ți securiza prezența online.</p>
          </div>
          <div class="protection-grid">
            ${protectionMethods.map((m, i) => {
              const c = colorMap[m.color];
              return `
              <div class="prot-card" style="border-left-color:${c.checkColor}">
                <div class="prot-card-top">
                  <div class="prot-icon-wrap">${m.icon}</div>
                  <div>
                    <h3>${m.title}</h3>
                    <p>${m.description}</p>
                  </div>
                </div>
                <button class="expand-btn" id="btn-p${i}" onclick="toggleExpand('p${i}')">
                  <em class="arrow">▶</em> Sfaturi practice
                </button>
                <div class="expandable-content collapsed" id="exp-p${i}">
                  <div class="tips-list">
                    <ul>${m.tips.map(tip => `
                      <li><span class="tip-check" style="color:${c.checkColor}">✓</span><span>${tip}</span></li>
                    `).join('')}</ul>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="bottom-banner" style="background:linear-gradient(135deg,#052e16,#14532d)">
            <h2>🔐 Securitatea este un proces continuu</h2>
            <p>Nu există o soluție unică. Combină aceste metode și adaptează-le nevoilor tale pentru o protecție completă.</p>
            <div class="banner-pills">
              <span class="banner-pill">✦ Educă-te constant</span>
              <span class="banner-pill">✦ Fii proactiv</span>
              <span class="banner-pill">✦ Verifică regulat</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderMistakes() {
  return `
    <div class="page-wrap">
      <div class="container">
        <div class="page-inner">
          <div class="page-hero">
            <div class="page-icon-wrap"><span>❌</span></div>
            <h1>Greșeli Frecvente</h1>
            <p>Învață din greșelile altora. Iată cele mai comune erori care îți pot compromite securitatea online.</p>
          </div>
          <div class="item-list">
            ${mistakes.map((item, i) => {
              const isCrit = item.severity === 'critical';
              const color = isCrit ? '#ef4444' : '#f59e0b';
              return `
              <div class="item-card" style="border-left-color:${color}">
                <div class="item-card-inner">
                  <div class="item-icon-wrap">${item.icon}</div>
                  <div class="item-body">
                    <div class="item-header">
                      <h3>${item.title}</h3>
                      <span class="badge ${isCrit ? 'badge-red' : 'badge-amber'}">${isCrit ? 'CRITIC' : 'RIDICAT'}</span>
                    </div>
                    <button class="expand-btn" id="btn-m${i}" onclick="toggleExpand('m${i}')">
                      <em class="arrow">▶</em> Vezi detalii
                    </button>
                    <div class="expandable-content collapsed" id="exp-m${i}">
                      <div class="box-dark mistake-section" style="margin-top:.75rem">
                        <div class="mistake-section">
                          <h4 style="color:#fca5a5">❌ Greșeala:</h4>
                          <p>${item.mistake}</p>
                        </div>
                        <div class="box-red-dark mistake-section">
                          <h4 style="color:#fca5a5">⚠️ Consecință:</h4>
                          <p>${item.consequence}</p>
                        </div>
                        <div class="box-green-dark mistake-section">
                          <h4 style="color:#86efac">✅ Soluție:</h4>
                          <p>${item.solution}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="bottom-banner" style="background:linear-gradient(135deg,#78350f,#b45309)">
            <h2>💡 Învață din Greșeli!</h2>
            <p>Cunoașterea acestor greșeli comune te poate ajuta să le eviti și să rămâi în siguranță online.</p>
          </div>
        </div>
      </div>
    </div>`;
}

function renderGuides() {
  return `
    <div class="page-wrap">
      <div class="container">
        <div class="page-inner-wide">
          <div class="page-hero">
            <div class="page-icon-wrap"><span>📖</span></div>
            <h1>Ghiduri Rapide</h1>
            <p>Pași concreți și practici pentru diverse situații de securitate online.</p>
          </div>
          <div class="guides-list">
            ${guides.map((g, i) => {
              const c = colorMap[g.color];
              return `
              <div class="guide-card">
                <div class="guide-header" style="background:${g.gradient}">
                  <div class="guide-header-icon">${g.icon}</div>
                  <h3>${g.title}</h3>
                </div>
                <div class="guide-body">
                  <button class="expand-btn" id="btn-g${i}" onclick="toggleExpand('g${i}')">
                    <em class="arrow">▶</em> Arată pașii
                  </button>
                  <div class="expandable-content collapsed" id="exp-g${i}">
                    <div class="guide-steps">
                      <div class="guide-steps-title">📋 Pași de urmat:</div>
                      <ol class="steps-ol">
                        ${g.steps.map((step, j) => `
                          <li>
                            <span class="step-num" style="border-color:${c.checkColor};color:${c.checkColor}">${j+1}</span>
                            <span class="step-text">${step}</span>
                          </li>
                        `).join('')}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="bottom-banner" style="background:linear-gradient(135deg,#1e1b4b,#312e81)">
            <h2>📌 Pune-le în Practică!</h2>
            <p>Aceste ghiduri sunt cele mai eficiente când le aplici imediat. Construiește treptat obiceiuri de securitate solide.</p>
            <div class="banner-stats">
              <div class="banner-stat"><div class="num">5</div><div class="lbl">Ghiduri</div></div>
              <div class="banner-stat"><div class="num">30+</div><div class="lbl">Pași</div></div>
              <div class="banner-stat"><div class="num">100%</div><div class="lbl">Aplicabile Acum</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderQuiz() {
  return `
    <div class="page-wrap">
      <div class="container">
        <div class="page-inner">
          <div class="page-hero">
            <div class="page-icon-wrap"><span>🧠</span></div>
            <h1>Quiz de Securitate</h1>
            <p>Testează-ți cunoștințele despre securitatea online cu ${quizQuestions.length} întrebări.</p>
          </div>
          <div class="quiz-wrap">
            <div class="quiz-card" id="quiz-card">
              <div id="quiz-content"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function renderQuizQuestion() {
  const card = document.getElementById('quiz-content');
  if (!card) return;
  const q = quizQuestions[quizState.current];
  card.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-bar-bg"><div class="quiz-bar-fill" style="width:${(quizState.current/quizQuestions.length)*100}%"></div></div>
      <span class="quiz-counter">${quizState.current+1}/${quizQuestions.length}</span>
    </div>
    <div class="quiz-question">${q.q}</div>
    <div class="quiz-options">
      ${q.opts.map((opt, i) => `
        <button class="quiz-opt" onclick="answerQuiz(${i})">${opt}</button>
      `).join('')}
    </div>
    <div id="quiz-fb" style="margin-top:1rem"></div>
  `;
}

function answerQuiz(idx) {
  if (quizState.answered) return;
  quizState.answered = true;
  const q = quizQuestions[quizState.current];
  const opts = document.querySelectorAll('.quiz-opt');
  opts.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    else if (i === idx && idx !== q.correct) btn.classList.add('wrong');
  });
  if (idx === q.correct) quizState.score++;
  const fb = document.getElementById('quiz-fb');
  fb.innerHTML = `
    <div class="quiz-feedback ${idx === q.correct ? 'correct-fb' : 'wrong-fb'}">
      ${idx === q.correct ? '✅ Corect!' : '❌ Greșit!'} ${q.explanation}
    </div>
    <button class="quiz-next" onclick="nextQuiz()">
      ${quizState.current < quizQuestions.length - 1 ? 'Următoarea întrebare →' : 'Vezi rezultatul →'}
    </button>
  `;
}

function nextQuiz() {
  quizState.current++;
  quizState.answered = false;
  if (quizState.current >= quizQuestions.length) {
    showQuizResult();
  } else {
    renderQuizQuestion();
  }
}

function showQuizResult() {
  const s = quizState.score;
  const t = quizQuestions.length;
  const pct = Math.round((s/t)*100);
  const emoji = pct === 100 ? '🏆' : pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '📚';
  const msg   = pct === 100 ? 'Perfect! Ești un expert în securitate online!' : pct >= 80 ? 'Excelent! Cunoști bine pericolele online.' : pct >= 50 ? 'Bine! Mai ai ceva de învățat.' : 'Studiază mai mult despre securitatea online.';
  document.getElementById('quiz-content').innerHTML = `
    <div class="quiz-result">
      <div class="quiz-score">${emoji}</div>
      <h3>${s}/${t} corecte</h3>
      <p>${msg}</p>
      <button class="quiz-next" onclick="quizState={current:0,score:0,answered:false};renderQuizQuestion()">🔄 Încearcă din nou</button>
      <br><br>
      <button class="btn-secondary" onclick="navigateTo('ghiduri')" style="width:100%;justify-content:center">📖 Citește Ghidurile</button>
    </div>
  `;
}

function renderContact() {
  return `
    <div class="page-wrap">
      <div class="container">
        <div class="page-inner-wide">
          <div class="page-hero">
            <div class="page-icon-wrap"><span>📬</span></div>
            <h1>Contactează-ne</h1>
            <p>Ai întrebări despre securitatea online? Echipa SafeClick este aici să te ajute.</p>
          </div>
          <div class="contact-grid">
            <div class="contact-info-box">
              <div class="contact-info-item">
                <div class="contact-info-icon">📧</div>
                <div>
                  <h4>E-mail</h4>
                  <p>contact@safeclick.ro<br>Răspundem în 24 de ore.</p>
                </div>
              </div>
              <div class="contact-info-item">
                <div class="contact-info-icon">💬</div>
                <div>
                  <h4>Chat cu SafeBot</h4>
                  <p>Folosește butonul 🤖 din colțul din dreapta jos pentru răspunsuri imediate.</p>
                </div>
              </div>
              <div class="contact-info-item">
                <div class="contact-info-icon">🕐</div>
                <div>
                  <h4>Program de suport</h4>
                  <p>Luni – Vineri<br>09:00 – 18:00</p>
                </div>
              </div>
              <div class="contact-info-item">
                <div class="contact-info-icon">🛡️</div>
                <div>
                  <h4>Raportează o amenințare</h4>
                  <p>Ai descoperit o nouă amenințare? Ajută comunitatea raportând-o.</p>
                </div>
              </div>
            </div>
            <div class="contact-form-box">
              <h3>Trimite un mesaj</h3>
              <div id="contact-form">
                <div class="form-group">
                  <label>Nume complet</label>
                  <input type="text" id="c-name" placeholder="Numele tău"/>
                </div>
                <div class="form-group">
                  <label>Adresă de e-mail</label>
                  <input type="email" id="c-email" placeholder="exemplu@email.com"/>
                </div>
                <div class="form-group">
                  <label>Subiect</label>
                  <input type="text" id="c-subject" placeholder="Despre ce vrei să vorbim?"/>
                </div>
                <div class="form-group">
                  <label>Mesaj</label>
                  <textarea id="c-msg" placeholder="Scrie mesajul tău aici..."></textarea>
                </div>
                <button class="contact-submit" onclick="submitContact()">📨 Trimite Mesajul</button>
              </div>
              <div id="contact-success" class="contact-success hidden">
                <div class="success-icon">✅</div>
                <h3>Mesaj trimis cu succes!</h3>
                <p>Îți vom răspunde în cel mai scurt timp. Mulțumim că ne-ai contactat!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function submitContact() {
  const name    = document.getElementById('c-name')?.value.trim();
  const email   = document.getElementById('c-email')?.value.trim();
  const subject = document.getElementById('c-subject')?.value.trim();
  const msg     = document.getElementById('c-msg')?.value.trim();
  if (!name || !email || !msg) { alert('Te rugăm să completezi cel puțin numele, e-mailul și mesajul.'); return; }
  document.getElementById('contact-form').classList.add('hidden');
  document.getElementById('contact-success').classList.remove('hidden');
}

// ── INIT ──────────────────────────────────────────────────────────────────────

(function init() {
  const hash = window.location.hash.replace('#', '') || 'home';
  navigateTo(hash);
})();