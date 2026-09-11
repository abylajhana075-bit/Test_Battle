import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* =========================
   FIREBASE
========================= */
const firebaseConfig = {
    apiKey: "AIzaSyDCyvwqzdBOYuM4Ww8BzERuRtjBLGoZ3d8",
    authDomain: "logick-eacf7.firebaseapp.com",
    projectId: "logick-eacf7",
    storageBucket: "logick-eacf7.firebasestorage.app",
    messagingSenderId: "746885400950",
    appId: "1:746885400950:web:2f982664aeafb9b09e9257",
    measurementId: "G-1X1CFM25D7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   HARD LOGIC QUESTIONS
========================= */
const questions = [
    {
        q: "Сенде 12 бірдей шар бар. Біреуінің салмағы өзгеше (жеңіл немесе ауыр екені белгісіз). Таразыны ең аз дегенде неше рет тартып, сол шарды таба аласың?",
        a: ["2 рет", "3 рет", "4 рет", "5 рет"],
        correct: 1
    },
    {
        q: "Көлде кувшинкалар өседі. Олар күн сайын көлемін 2 есеге үлкейтеді. Егер көл 48 күнде кувшинкаға толығымен толса, көлдің жартысы (50%) қанша күнде толады?",
        a: ["24 күнде", "47 күнде", "12 күнде", "36 күнде"],
        correct: 1
    },
    {
        q: "2, 3, 5, 9, 17, 33, ?",
        a: ["65", "64", "49", "50"],
        correct: 0
    },
    {
        q: "3 мысық 3 тышқанды 3 минутта ұстайды. 100 тышқанды 100 минутта ұстау үшін неше мысық қажет?",
        a: ["100 мысық", "33 мысық", "3 мысық", "1 мысық"],
        correct: 2
    },
    {
        q: "Екі әкесі мен екі ұлы аңға шығып, 3 қоян атып алды. Әрқайсысына тура бір қояннан тиді. Бұл қалай болды?",
        a: ["Біреуі қоянын жоғалтты", "Олар 3 адам болды (атасы, әкесі, ұлы)", "Бұл мүмкін емес", "Төртіншісі қоян жемейді"],
        correct: 1
    },
    {
        q: "Ағаш ұзындығы 10 метр. Ұлу күн сайын жоғары 3 метрге өрмелейді, ал түнде 2 метрге төмен сырғиды. Ұлу ағаштың төбесіне неше күнде жетеді?",
        a: ["10 күнде", "8 күнде", "7 күнде", "9 күнде"],
        correct: 1
    },
    {
        q: "Торда 6 қоян бар. 6 адамға 1 қояннан берді, бірақ торда 1 қоян қалды. Бұл қалай болды?",
        a: ["1 қоян қашып кетті", "Соңғы адамға қоян тормен бірге берілді", "Есеп қате", "Бір адам қояннан бас тартты"],
        correct: 1
    },
    {
        q: "Егер 'Барлық А — Б' және 'Кейбір Б — В' болса, қай туынды пікір МІНДЕТТІ ТҮРДЕ ДҰРЫС?",
        a: ["Барлық А — В болады", "Кейбір А — В болады", "Ешқандай қорытынды міндетті дұрыс болмайды", "Кейбір В — А болады"],
        correct: 2
    },
    {
        q: "Сенде 3 және 5 литрлік бос идістер бар. Краннан су ағып тұр. Тура 4 литр суды қалай өлшеп аласың?",
        a: ["Мүмкін емес", "5L толтырып, 3L-ге құямыз, қалған 2L-ді 3L-ге құйып, 5L-ді қайта толтырып 3L-ді толтырамыз", "Көзбен жартылай құямыз", "3L-ді екі рет құямыз"],
        correct: 1
    },
    {
        q: "Сағат 3:15 болғанда сағат пен минут тілдерінің арасындағы бұрыш қанша градус?",
        a: ["0°", "7.5°", "15°", "30°"],
        correct: 1
    }
];

let currentQuestionsList = [];

/* =========================
   DATA
========================= */
let data = {
    coins:0,
    todayScore:0,
    weekScore:0,
    games:0,
    correct:0,
    wrong:0,
    bestStreak:0,
    name:"Ойыншы",
    lastDate:"",
    weekStart:""
};

/* =========================
   GAME STATE
========================= */
let currentQuestion = 0;
let time = 45;
let timerInterval = null;
let score = 0;
let correct = 0;
let wrong = 0;
let currentStreak = 0;

/* =========================
   AUTH UI
========================= */
window.showLogin = function(){
    document.getElementById("registerForm").style.display="none";
    document.getElementById("loginForm").style.display="block";
    document.getElementById("authError").textContent="";
};

window.showRegister = function(){
    document.getElementById("registerForm").style.display="block";
    document.getElementById("loginForm").style.display="none";
    document.getElementById("authError").textContent="";
};

/* =========================
   REGISTER
========================= */
window.register = async function(){
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const error = document.getElementById("authError");

    error.textContent = "";

    if(name.length < 2){
        error.textContent = "Атың кемінде 2 символ болсын.";
        return;
    }

    if(password.length < 6){
        error.textContent = "Құпиясөз кемінде 6 символ болуы керек.";
        return;
    }

    try{
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;

        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: user.email,
            coins: 0,
            todayScore: 0,
            weekScore: 0,
            games: 0,
            correct: 0,
            wrong: 0,
            bestStreak: 0,
            weekStart: getWeekStart(),
            lastDate: getToday(),
            createdAt: new Date().toISOString()
        });

    } catch(e) {
        error.textContent = getAuthError(e.code);
    }
};

/* =========================
   LOGIN
========================= */
window.login = async function(){
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const error = document.getElementById("authError");

    error.textContent = "";

    try{
        await signInWithEmailAndPassword(auth, email, password);
    } catch(e) {
        error.textContent = getAuthError(e.code);
    }
};

/* =========================
   AUTH STATE
========================= */
onAuthStateChanged(auth, async user => {
    if(user){
        document.getElementById("authPage").style.display = "none";
        document.getElementById("app").style.display = "block";
        await loadUser();
        await loadRanking();
    } else {
        document.getElementById("authPage").style.display = "block";
        document.getElementById("app").style.display = "none";
    }
});

/* =========================
   LOAD USER
========================= */
async function loadUser(){
    if(!auth.currentUser) return;
    const ref = doc(db, "users", auth.currentUser.uid);
    const snap = await getDoc(ref);

    if(snap.exists()){
        data = {
            ...data,
            ...snap.data()
        };
    }

    checkDates();
    updateUI();
}

/* =========================
   SAVE FIREBASE
========================= */
async function save(){
    if(!auth.currentUser) return;
    await setDoc(
        doc(db, "users", auth.currentUser.uid),
        data,
        {merge: true}
    );
    updateUI();
}

/* =========================
   UI UPDATE
========================= */
function updateUI(){
    document.getElementById("coins").textContent = data.coins;
    document.getElementById("todayScore").textContent = data.todayScore;
    document.getElementById("weekScore").textContent = data.weekScore;
    document.getElementById("sToday").textContent = data.todayScore;
    document.getElementById("sWeek").textContent = data.weekScore;
    document.getElementById("sGames").textContent = data.games;
    document.getElementById("sCorrect").textContent = data.correct;
    document.getElementById("sWrong").textContent = data.wrong;
    document.getElementById("sStreak").textContent = data.bestStreak;
    document.getElementById("profileCoins").textContent = data.coins;
    document.getElementById("profileScore").textContent = data.weekScore;
    document.getElementById("profileGames").textContent = data.games;
    document.getElementById("profileName").textContent = data.name;

    if(auth.currentUser){
        document.getElementById("profileEmail").textContent = auth.currentUser.email;
    }
}

/* =========================
   PAGE SWITCH
========================= */
window.showPage = function(id, button){
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".nav button").forEach(b => b.classList.remove("active"));
    if(button) button.classList.add("active");

    updateUI();

    if(id === "ranking") loadRanking();
};

/* =========================
   START GAME
========================= */
window.startGame = function(){
    currentQuestion = 0;
    score = 0;
    correct = 0;
    wrong = 0;
    currentStreak = 0;

    currentQuestionsList = [...questions].sort(() => Math.random() - 0.5);

    showPage("game");
    loadQuestion();
};

/* =========================
   QUESTION LOAD
========================= */
function loadQuestion(){
    if(currentQuestion >= currentQuestionsList.length){
        finishGame();
        return;
    }

    time = 45;
    const q = currentQuestionsList[currentQuestion];

    document.getElementById("questionNumber").textContent = (currentQuestion + 1) + " / " + currentQuestionsList.length;
    document.getElementById("question").textContent = q.q;

    const answers = document.getElementById("answers");
    answers.innerHTML = "";

    q.a.forEach((answer, index) => {
        const btn = document.createElement("button");
        btn.className = "answer";
        btn.textContent = answer;
        btn.onclick = () => answerQuestion(index, btn);
        answers.appendChild(btn);
    });

    startTimer();
}

/* =========================
   TIMER
========================= */
function startTimer(){
    clearInterval(timerInterval);
    updateTimer();

    timerInterval = setInterval(() => {
        time--;
        updateTimer();

        if(time <= 0){
            clearInterval(timerInterval);
            wrong++;
            currentStreak = 0;
            currentQuestion++;
            loadQuestion();
        }
    }, 1000);
}

function updateTimer(){
    document.getElementById("timer").textContent = Math.max(0, time);
    document.getElementById("timeBar").style.width = Math.min(100, (time / 45) * 100) + "%";
}

/* =========================
   ANSWER QUESTION
========================= */
function answerQuestion(index, button){
    clearInterval(timerInterval);

    const q = currentQuestionsList[currentQuestion];
    const buttons = document.querySelectorAll(".answer");

    buttons.forEach(b => b.disabled = true);

    if(index === q.correct){
        button.classList.add("correct");
        correct++;
        currentStreak++;

        if(currentStreak > data.bestStreak){
            data.bestStreak = currentStreak;
        }

        score += 150 + time * 2;
    } else {
        button.classList.add("wrong");
        buttons[q.correct].classList.add("correct");
        wrong++;
        currentStreak = 0;
    }

    setTimeout(() => {
        currentQuestion++;
        loadQuestion();
    }, 1000);
}

/* =========================
   FINISH GAME
========================= */
async function finishGame(){
    clearInterval(timerInterval);

    data.todayScore += score;
    data.weekScore += score;
    data.games++;
    data.correct += correct;
    data.wrong += wrong;

    const earned = Math.floor(score / 100) * 15;
    data.coins += earned;

    await save();

    document.getElementById("finalScore").textContent = score;
    document.getElementById("correctCount").textContent = correct;
    document.getElementById("wrongCount").textContent = wrong;
    document.getElementById("earnedCoins").textContent = earned;

    await loadRanking();
    showPage("result");
}

/* =========================
   SHOP
========================= */
window.buyItem = async function(name, price){
    if(data.coins < price){
        alert("🪙 Монета жеткіліксіз!");
        return;
    }

    data.coins -= price;
    await save();
    alert("✅ " + name + " сатып алынды!");
};

/* =========================
   DATES MANAGEMENT
========================= */
function getToday(){
    return new Date().toISOString().slice(0,10);
}

function getWeekStart(){
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; 
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    return monday.toISOString().slice(0,10);
}

function checkDates(){
    const today = getToday();
    const week = getWeekStart();

    if(data.lastDate !== today){
        data.todayScore = 0;
        data.lastDate = today;
    }

    if(data.weekStart !== week){
        data.weekScore = 0;
        data.weekStart = week;
    }
}

/* =========================
   RANKING
========================= */
async function loadRanking(){
    try {
        const q = query(
            collection(db, "users"),
            orderBy("weekScore", "desc"),
            limit(10)
        );

        const snapshot = await getDocs(q);
        const list = document.getElementById("rankingList");
        list.innerHTML = "";

        let position = 1;

        snapshot.forEach(docSnap => {
            const player = docSnap.data();
            const div = document.createElement("div");
            div.className = "rank";

            let medal = "";
            if(position === 1) medal = "🥇";
            if(position === 2) medal = "🥈";
            if(position === 3) medal = "🥉";

            div.innerHTML = `
                <span>${medal} ${position}. ${player.name || "Ойыншы"}</span>
                <b>${player.weekScore || 0}</b>
            `;

            list.appendChild(div);
            position++;
        });

    } catch(e) {
        console.log("Ranking error:", e);
    }
}

/* =========================
   LOGOUT
========================= */
window.logout = async function(){
    clearInterval(timerInterval);
    await signOut(auth);
};

/* =========================
   FIREBASE ERRORS
========================= */
function getAuthError(code){
    const errors = {
        "auth/email-already-in-use": "Бұл email бұрын тіркелген.",
        "auth/invalid-email": "Email дұрыс емес.",
        "auth/weak-password": "Құпиясөз тым әлсіз.",
        "auth/invalid-credential": "Email немесе құпиясөз қате.",
        "auth/user-not-found": "Мұндай аккаунт табылмады.",
        "auth/wrong-password": "Құпиясөз қате."
    };

    return errors[code] || ("Firebase қатесі: " + code);
}